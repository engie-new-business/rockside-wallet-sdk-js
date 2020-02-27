import { Wallet } from './wallet';
import { Rockside } from './rockside';

const RpcEngine = require('json-rpc-engine');
const createFetchMiddleware = require('eth-json-rpc-middleware/fetch');
const createWalletMiddleware = require('eth-json-rpc-middleware/wallet');

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
    this.engine.push(createFetchMiddleware({ rpcUrl: rockside.api.getRpcUrl() }));
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
