"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var hash_1 = require("./hash");
var RpcEngine = require('json-rpc-engine');
var createWalletMiddleware = require('eth-json-rpc-middleware/wallet');
var createAsyncMiddleware = require('json-rpc-engine/src/createAsyncMiddleware');
var rpcErrors = require('eth-json-rpc-errors').errors;
var url = require('url');
var RETRIABLE_ERRORS = [
    // ignore server overload errors
    'Gateway timeout',
    'ETIMEDOUT',
    // ignore server sent html error pages
    // or truncated json responses
    'failed to parse response body',
    // ignore errors where http req failed to establish
    'Failed to fetch',
];
var Provider = /** @class */ (function () {
    function Provider(rockside, wallet, identity) {
        var _this = this;
        this.engine = new RpcEngine();
        if (!!wallet && !!identity) {
            this.engine.push(createWalletMiddleware({
                getAccounts: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, [identity, wallet.getAddress()]];
                }); }); },
                processTypedMessageV4: function (req) { return __awaiter(_this, void 0, void 0, function () {
                    var data, parsed, hash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                data = req.data;
                                parsed = JSON.parse(data);
                                hash = hash_1.executeMessageHash(parsed.domain, parsed.message);
                                return [4 /*yield*/, wallet.sign(hash)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); },
                processEthSignMessage: function (req) { return __awaiter(_this, void 0, void 0, function () {
                    var data;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                data = req.data;
                                return [4 /*yield*/, wallet.sign(Buffer.from(data.substring(2), 'hex'))];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); },
                processTransaction: function (tx) { return __awaiter(_this, void 0, void 0, function () {
                    var metatx;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                metatx = {
                                    to: tx.to,
                                    value: tx.value || 0,
                                    data: Buffer.from(tx.data.substring(2), 'hex'),
                                };
                                return [4 /*yield*/, rockside.relayTransaction(wallet, identity, metatx)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); },
            }));
        }
        this.engine.push(createFetchMiddleware({ rpcUrl: rockside.api.getRpcUrl(), token: rockside.api.getToken(), originHttpHeaderKey: 'Origin' }));
    }
    // web3js 2.x: send(method: string, parameters: any[]): Promise<any>;
    // web3js 1.x: send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void;
    Provider.prototype.send = function (method, parameters) {
        var _this = this;
        if (typeof method === 'string') {
            return new Promise(function (resolve, reject) {
                _this.engine.handle({
                    jsonrpc: '2.0',
                    id: 1337,
                    method: method,
                    params: parameters || [],
                }, function (error, response) {
                    if (error) {
                        return reject(error);
                    }
                    resolve(response);
                });
            });
        }
        var payload = method;
        var callback = parameters;
        if (!callback) {
            throw new Error("RocksideProvider does not provide sync send method " + payload.method);
        }
        this.engine.handle(payload, callback);
    };
    return Provider;
}());
exports.Provider = Provider;
;
function createFetchMiddleware(_a) {
    var _this = this;
    var rpcUrl = _a.rpcUrl, token = _a.token, originHttpHeaderKey = _a.originHttpHeaderKey;
    return createAsyncMiddleware(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var _a, fetchUrl, fetchParams, maxAttempts, retryInterval, _loop_1, attempt, state_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = createFetchConfigFromReq({ req: req, rpcUrl: rpcUrl, token: token, originHttpHeaderKey: originHttpHeaderKey }), fetchUrl = _a.fetchUrl, fetchParams = _a.fetchParams;
                    maxAttempts = 5;
                    retryInterval = 1000;
                    _loop_1 = function (attempt) {
                        var fetchRes, rawBody, fetchBody, result, err_1, errMsg_1, isRetriable;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, fetch(fetchUrl, fetchParams)
                                        // check for http errrors
                                    ];
                                case 1:
                                    fetchRes = _a.sent();
                                    // check for http errrors
                                    checkForHttpErrors(fetchRes);
                                    return [4 /*yield*/, fetchRes.text()];
                                case 2:
                                    rawBody = _a.sent();
                                    fetchBody = void 0;
                                    try {
                                        fetchBody = JSON.parse(rawBody);
                                    }
                                    catch (_) {
                                        throw new Error("FetchMiddleware - failed to parse response body: \"" + rawBody + "\"");
                                    }
                                    result = parseResponse(fetchRes, fetchBody);
                                    // set result and exit retry loop
                                    res.result = result;
                                    return [2 /*return*/, { value: void 0 }];
                                case 3:
                                    err_1 = _a.sent();
                                    errMsg_1 = err_1.toString();
                                    isRetriable = RETRIABLE_ERRORS.some(function (phrase) { return errMsg_1.includes(phrase); });
                                    // re-throw error if not retriable
                                    if (!isRetriable)
                                        throw err_1;
                                    return [3 /*break*/, 4];
                                case 4: 
                                // delay before retrying
                                return [4 /*yield*/, timeout(retryInterval)];
                                case 5:
                                    // delay before retrying
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 0;
                    _b.label = 1;
                case 1:
                    if (!(attempt < maxAttempts)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _b.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _b.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    }); });
}
function createFetchConfigFromReq(_a) {
    var req = _a.req, rpcUrl = _a.rpcUrl, token = _a.token, originHttpHeaderKey = _a.originHttpHeaderKey;
    var parsedUrl = url.parse(rpcUrl);
    var fetchUrl = normalizeUrlFromParsed(parsedUrl);
    // prepare payload
    // copy only canonical json rpc properties
    var payload = {
        id: req.id,
        jsonrpc: req.jsonrpc,
        method: req.method,
        params: req.params,
    };
    // extract 'origin' parameter from request
    var originDomain = req.origin;
    // serialize request body
    var serializedPayload = JSON.stringify(payload);
    // configure fetch params
    var fetchParams = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: serializedPayload,
    };
    // encoded auth details as header (not allowed in fetch url)
    if (parsedUrl.auth) {
        var encodedAuth = btoa(parsedUrl.auth);
        fetchParams.headers['Authorization'] = "Basic " + encodedAuth;
    }
    // optional: add request origin as header
    if (originHttpHeaderKey && originDomain) {
        fetchParams.headers[originHttpHeaderKey] = originDomain;
    }
    return { fetchUrl: fetchUrl, fetchParams: fetchParams };
}
function checkForHttpErrors(fetchRes) {
    // check for errors
    switch (fetchRes.status) {
        case 405:
            throw rpcErrors.methodNotFound();
        case 418:
            throw createRatelimitError();
        case 503:
        case 504:
            throw createTimeoutError();
    }
}
function parseResponse(fetchRes, body) {
    // check for error code
    if (fetchRes.status !== 200) {
        throw rpcErrors.internal("Non-200 status code: '" + fetchRes.status + "'", body);
    }
    // check for rpc error
    if (body.error)
        throw rpcErrors.internal(body.error.toString(), body.error);
    // return successful result
    return body.result;
}
function normalizeUrlFromParsed(parsedUrl) {
    var result = '';
    result += parsedUrl.protocol;
    if (parsedUrl.slashes)
        result += '//';
    result += parsedUrl.hostname;
    if (parsedUrl.port) {
        result += ":" + parsedUrl.port;
    }
    result += "" + parsedUrl.path;
    return result;
}
function createRatelimitError() {
    var msg = "Request is being rate limited.";
    return rpcErrors.internal(msg);
}
function createTimeoutError() {
    var msg = "Gateway timeout. The request took too long to process. ";
    msg += "This can happen when querying logs over too wide a block range.";
    return rpcErrors.internal(msg);
}
function timeout(duration) {
    return new Promise(function (resolve) { return setTimeout(resolve, duration); });
}
