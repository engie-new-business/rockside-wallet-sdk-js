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
var cross_fetch_1 = require("cross-fetch");
var GasPrices;
(function (GasPrices) {
    GasPrices["FASTEST"] = "fastest";
    GasPrices["FAST"] = "fast";
    GasPrices["AVERAGE"] = "average";
    GasPrices["SAFELOW"] = "safelow";
})(GasPrices = exports.GasPrices || (exports.GasPrices = {}));
;
var RocksideApi = /** @class */ (function () {
    function RocksideApi(opts) {
        this.authenticationChecks(opts);
        this.headers = this.generateHeaders(opts);
        this.opts = opts;
    }
    RocksideApi.prototype.generateHeaders = function (opts) {
        if (opts.apikey) {
            return {
                'apikey': opts.apikey
            };
        }
        else {
            return {
                'Authorization': 'Bearer ' + opts.token,
            };
        }
    };
    RocksideApi.prototype.authenticationChecks = function (opts) {
        if (opts.apikey && opts.token) {
            throw new Error('Both access token and api key provided. Only one needed.');
        }
        if (!opts.apikey && !opts.token) {
            throw new Error('No authentication method provided: define apikey or token.');
        }
    };
    RocksideApi.prototype.extractError = function (resp) {
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, resp.json()];
                    case 1:
                        json = _a.sent();
                        throw new Error(json['error']);
                }
            });
        });
    };
    RocksideApi.prototype.send = function (route, method, body) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "" + this.opts.baseUrl + route;
                        return [4 /*yield*/, cross_fetch_1.default(url, {
                                method: method,
                                body: !!body ? JSON.stringify(body) : null,
                                headers: this.headers,
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RocksideApi.prototype.getSmartWallets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send("/ethereum/" + this.opts.network[1] + "/smartwallets", 'GET', null)];
                    case 1:
                        resp = _a.sent();
                        if (!(resp.status != 200)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extractError(resp)];
                    case 2: throw _a.sent();
                    case 3: return [4 /*yield*/, resp.json()];
                    case 4:
                        json = _a.sent();
                        return [2 /*return*/, json];
                }
            });
        });
    };
    RocksideApi.prototype.createSmartWallet = function (account, forwarder) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send("/ethereum/" + this.opts.network[1] + "/smartwallets", 'POST', { account: account, forwarder: forwarder })];
                    case 1:
                        resp = _a.sent();
                        if (!(resp.status != 201)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extractError(resp)];
                    case 2: throw _a.sent();
                    case 3: return [4 /*yield*/, resp.json()];
                    case 4:
                        json = _a.sent();
                        return [2 /*return*/, {
                                address: json.address,
                                transactionHash: json.transaction_hash,
                            }];
                }
            });
        });
    };
    RocksideApi.prototype.createForwarder = function (owner) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send("/ethereum/" + this.opts.network[1] + "/forwarders", 'POST', { owner: owner })];
                    case 1:
                        resp = _a.sent();
                        if (!(resp.status != 201)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extractError(resp)];
                    case 2: throw _a.sent();
                    case 3: return [4 /*yield*/, resp.json()];
                    case 4:
                        json = _a.sent();
                        return [2 /*return*/, {
                                address: json.address,
                                transactionHash: json.transaction_hash,
                            }];
                }
            });
        });
    };
    RocksideApi.prototype.getForwarders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send("/ethereum/" + this.opts.network[1] + "/forwarders", 'GET', null)];
                    case 1:
                        resp = _a.sent();
                        if (!(resp.status != 200)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extractError(resp)];
                    case 2: throw _a.sent();
                    case 3: return [4 /*yield*/, resp.json()];
                    case 4:
                        json = _a.sent();
                        return [2 /*return*/, json];
                }
            });
        });
    };
    RocksideApi.prototype.getEOAs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send("/ethereum/eoa", 'GET', null)];
                    case 1:
                        resp = _a.sent();
                        if (!(resp.status !== 200)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extractError(resp)];
                    case 2: throw _a.sent();
                    case 3: return [2 /*return*/, resp.json()];
                }
            });
        });
    };
    RocksideApi.prototype.createEOA = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send("/ethereum/eoa", 'POST', {})];
                    case 1:
                        resp = _a.sent();
                        if (!(resp.status !== 200)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extractError(resp)];
                    case 2: throw _a.sent();
                    case 3: return [4 /*yield*/, resp.json()];
                    case 4:
                        json = _a.sent();
                        return [2 /*return*/, {
                                address: json['address']
                            }];
                }
            });
        });
    };
    RocksideApi.prototype.signMessageWithEOA = function (eoa, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send("/ethereum/eoa/" + eoa + "/sign-message", 'POST', {
                            message: hash
                        })];
                    case 1:
                        resp = _a.sent();
                        if (!(resp.status !== 200)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extractError(resp)];
                    case 2: throw _a.sent();
                    case 3: return [4 /*yield*/, resp.json()];
                    case 4:
                        json = _a.sent();
                        return [2 /*return*/, {
                                signed_message: json['signed_message']
                            }];
                }
            });
        });
    };
    RocksideApi.prototype.sendTransaction = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send("/ethereum/" + this.opts.network[1] + "/transaction", 'POST', tx)];
                    case 1:
                        resp = _a.sent();
                        if (!(resp.status !== 200)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extractError(resp)];
                    case 2: throw _a.sent();
                    case 3: return [4 /*yield*/, resp.json()];
                    case 4:
                        json = _a.sent();
                        return [2 /*return*/, {
                                transaction_hash: json['transaction_hash'],
                                tracking_id: json['tracking_id']
                            }];
                }
            });
        });
    };
    RocksideApi.prototype.getRelayParams = function (forwarder, account, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var route, resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        route = "/ethereum/" + this.opts.network[1] + "/forwarders/" + forwarder + "/relayParams";
                        return [4 /*yield*/, this.send(route, 'POST', {
                                account: account,
                                channel_id: channel.toString(),
                            })];
                    case 1:
                        resp = _a.sent();
                        if (!(resp.status != 200)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extractError(resp)];
                    case 2: throw _a.sent();
                    case 3: return [4 /*yield*/, resp.json()];
                    case 4:
                        json = _a.sent();
                        return [2 /*return*/, { nonce: json['nonce'], gasPrices: json['gas_prices'] }];
                }
            });
        });
    };
    RocksideApi.prototype.relayTransaction = function (forwarder, tx) {
        return __awaiter(this, void 0, void 0, function () {
            var route, resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        route = "/ethereum/" + this.opts.network[1] + "/forwarders/" + forwarder;
                        return [4 /*yield*/, this.send(route, 'POST', {
                                message: {
                                    signer: tx.signer,
                                    to: tx.to,
                                    data: buf2hex(tx.data),
                                    nonce: tx.nonce,
                                },
                                speed: tx.speed,
                                gas_price_limit: tx.gasPriceLimit,
                                signature: tx.signature,
                            })];
                    case 1:
                        resp = _a.sent();
                        if (!(resp.status != 200)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.extractError(resp)];
                    case 2: throw _a.sent();
                    case 3: return [4 /*yield*/, resp.json()];
                    case 4:
                        json = _a.sent();
                        return [2 /*return*/, json['transaction_hash']];
                }
            });
        });
    };
    RocksideApi.prototype.getRpcUrl = function () {
        return this.opts.baseUrl + "/ethereum/" + this.opts.network[1] + "/jsonrpc";
    };
    RocksideApi.prototype.getToken = function () {
        return this.opts.token;
    };
    return RocksideApi;
}());
exports.RocksideApi = RocksideApi;
function buf2hex(buffer) {
    return '0x' + Array.prototype.map.call(new Uint8Array(buffer), function (x) { return ('00' + x.toString(16)).slice(-2); }).join('');
}
function hex2buf(s) {
    var noPrefix = s.substring(2);
    var length = noPrefix.length / 2;
    var view = new Uint8Array(length);
    for (var i = 0; i < noPrefix.length; i += 2) {
        view[i / 2] = parseInt(noPrefix.substring(i, i + 2), 16);
    }
    return view.buffer;
}
