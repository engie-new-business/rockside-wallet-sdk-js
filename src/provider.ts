import { Wallet } from './wallet';
import { Rockside } from './rockside';

const RpcEngine = require('json-rpc-engine');
const createWalletMiddleware = require('eth-json-rpc-middleware/wallet');
const createAsyncMiddleware = require('json-rpc-engine/src/createAsyncMiddleware')
const { errors: rpcErrors } = require('eth-json-rpc-errors')
const url = require('url')

const RETRIABLE_ERRORS = [
  // ignore server overload errors
  'Gateway timeout',
  'ETIMEDOUT',
  // ignore server sent html error pages
  // or truncated json responses
  'failed to parse response body',
  // ignore errors where http req failed to establish
  'Failed to fetch',
]

export class Provider {
  private engine: typeof RpcEngine;

  constructor(rockside: Rockside, wallet?: Wallet, identity?: string) {
    this.engine = new RpcEngine();

    if (!!wallet && !!identity) {
      this.engine.push(createWalletMiddleware({
        getAccounts: async (): Promise<string[]> => [identity],

        processTransaction: async (tx: any): Promise<string> => {
          const metatx = {
            to: tx.to,
            value: tx.value || 0,
            data: Buffer.from(tx.data.substring(2), 'hex'),
          };

          return await rockside.relayTransaction(wallet, identity, metatx);
        },
      }));
    }
    this.engine.push(
      createFetchMiddleware({ rpcUrl: rockside.api.getRpcUrl(), token: rockside.api.getToken(), originHttpHeaderKey:'Origin' })
    );
  }

  // web3js 2.x: send(method: string, parameters: any[]): Promise<any>;
  // web3js 1.x: send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void;
  send(method:string|any, parameters: ((error: Error | null, result?: any) => void)|any): Promise<string>|void {
    if (typeof method === 'string') {
      return new Promise((resolve, reject) => {
        this.engine.handle({
          jsonrpc: '2.0',
          id: 1337,
          method,
          params: parameters || [],
        },
        (error: Error, response: any) => {
          if (error) { return reject(error); }
          resolve(response);
        });
      });
    }

    const payload: any = method;
    const callback : (error: Error | null, result?: any) => void = parameters;

    if (!callback) {
      throw new Error(`RocksideProvider does not provide sync send method ${payload.method}`);
    }

    this.engine.handle(payload, callback);
  }
};

function createFetchMiddleware ({ rpcUrl, token, originHttpHeaderKey }) {
  return createAsyncMiddleware(async (req, res, next) => {
    const { fetchUrl, fetchParams } = createFetchConfigFromReq({ req, rpcUrl, token, originHttpHeaderKey })

    // attempt request multiple times
    const maxAttempts = 5
    const retryInterval = 1000
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const fetchRes = await fetch(fetchUrl, fetchParams)
        // check for http errrors
        checkForHttpErrors(fetchRes)
        // parse response body
        const rawBody = await fetchRes.text()
        let fetchBody
        try {
          fetchBody = JSON.parse(rawBody)
        } catch (_) {
          throw new Error(`FetchMiddleware - failed to parse response body: "${rawBody}"`)
        }
        const result = parseResponse(fetchRes, fetchBody)
        // set result and exit retry loop
        res.result = result
        return
      } catch (err) {
        const errMsg = err.toString()
        const isRetriable = RETRIABLE_ERRORS.some(phrase => errMsg.includes(phrase))
        // re-throw error if not retriable
        if (!isRetriable) throw err
      }
      // delay before retrying
      await timeout(retryInterval)
    }
  })
}

function createFetchConfigFromReq({ req, rpcUrl, token, originHttpHeaderKey }) {
  const parsedUrl = url.parse(rpcUrl)
  const fetchUrl = normalizeUrlFromParsed(parsedUrl)

  // prepare payload
  // copy only canonical json rpc properties
  const payload = {
    id: req.id,
    jsonrpc: req.jsonrpc,
    method: req.method,
    params: req.params,
  }

  // extract 'origin' parameter from request
  const originDomain = req.origin

  // serialize request body
  const serializedPayload = JSON.stringify(payload)

  // configure fetch params
  const fetchParams = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: serializedPayload,
  }

  // encoded auth details as header (not allowed in fetch url)
  if (parsedUrl.auth) {
    const encodedAuth = btoa(parsedUrl.auth)
    fetchParams.headers['Authorization'] = `Basic ${encodedAuth}`
  }

  // optional: add request origin as header
  if (originHttpHeaderKey && originDomain) {
    fetchParams.headers[originHttpHeaderKey] = originDomain
  }

  return { fetchUrl, fetchParams }
}

function checkForHttpErrors (fetchRes) {
  // check for errors
  switch (fetchRes.status) {
    case 405:
      throw rpcErrors.methodNotFound()

    case 418:
      throw createRatelimitError()

    case 503:
    case 504:
      throw createTimeoutError()
  }
}

function parseResponse (fetchRes, body) {
  // check for error code
  if (fetchRes.status !== 200) {
    throw rpcErrors.internal(`Non-200 status code: '${fetchRes.status}'`, body)
  }
  // check for rpc error
  if (body.error) throw rpcErrors.internal(body.error.toString(), body.error)
  // return successful result
  return body.result
}

function normalizeUrlFromParsed(parsedUrl) {
  let result = ''
  result += parsedUrl.protocol
  if (parsedUrl.slashes) result += '//'
  result += parsedUrl.hostname
  if (parsedUrl.port) {
    result += `:${parsedUrl.port}`
  }
  result += `${parsedUrl.path}`
  return result
}

function createRatelimitError () {
  let msg = `Request is being rate limited.`
  return rpcErrors.internal(msg)
}

function createTimeoutError () {
  let msg = `Gateway timeout. The request took too long to process. `
  msg += `This can happen when querying logs over too wide a block range.`
  return rpcErrors.internal(msg)
}

function timeout(duration) {
  return new Promise(resolve => setTimeout(resolve, duration))
}
