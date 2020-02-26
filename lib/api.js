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
var RocksideApi = /** @class */ (function () {
    function RocksideApi(opts) {
        this.opts = opts;
    }
    RocksideApi.prototype.extractError = function (resp) {
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, resp.json()];
                    case 1:
                        json = _a.sent();
                        throw new Error(json["error"]);
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
                        url = "" + this.opts.baseUrl + route + "?token=" + this.opts.token;
                        return [4 /*yield*/, fetch(url, {
                                method: method,
                                body: JSON.stringify(body),
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RocksideApi.prototype.createEncryptedAccount = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send('/encryptedaccounts', 'PUT', {
                            username: account.username,
                            password_hash: buf2hex(account.passwordHash),
                            encrypted_encryption_key: buf2hex(account.encryptedEncryptionKey),
                            encrypted_encryption_key_iv: buf2hex(account.encryptedEncryptionKeyIV),
                            iterations: account.iterations,
                            password_derived_key_hash: buf2hex(account.passwordDerivedKeyHash),
                        })];
                    case 1:
                        resp = _a.sent();
                        if (resp.status != 201 && resp.status != 409) {
                            throw this.extractError(resp);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RocksideApi.prototype.connectEncryptedAccount = function (username, passwordHash) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send('/encryptedaccounts/connect', 'POST', {
                            username: username,
                            password_hash: buf2hex(passwordHash),
                        })];
                    case 1:
                        resp = _a.sent();
                        if (resp.status != 200) {
                            throw this.extractError(resp);
                        }
                        return [4 /*yield*/, resp.json()];
                    case 2:
                        json = _a.sent();
                        return [2 /*return*/, {
                                data: hex2buf(json['encrypted_encryption_key']),
                                iv: new Uint8Array(hex2buf(json['encryption_key_iv'])),
                            }];
                }
            });
        });
    };
    RocksideApi.prototype.createEncryptedWallet = function (account, wallet) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send('/encryptedaccounts/wallets', 'PUT', {
                            username: account.username,
                            password_hash: buf2hex(account.passwordHash),
                            encrypted_mnemonic: buf2hex(wallet.encryptedMnemonic),
                            encrypted_mnemonic_iv: buf2hex(wallet.encryptedMnemonicIV),
                        })];
                    case 1:
                        resp = _a.sent();
                        if (resp.status != 201) {
                            throw this.extractError(resp);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RocksideApi.prototype.getEncryptedWallets = function (username, passwordHash) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, json, wallets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send('/encryptedaccounts/wallets', 'POST', {
                            username: username,
                            password_hash: buf2hex(passwordHash),
                        })];
                    case 1:
                        resp = _a.sent();
                        if (resp.status != 200) {
                            throw this.extractError(resp);
                        }
                        return [4 /*yield*/, resp.json()];
                    case 2:
                        json = _a.sent();
                        wallets = json.map(function (jsonWallet) { return ({
                            encryptedMnemonic: hex2buf(jsonWallet['encrypted_mnemonic']),
                            encryptedMnemonicIV: hex2buf(jsonWallet['mnemonic_iv']),
                        }); });
                        return [2 /*return*/, wallets];
                }
            });
        });
    };
    RocksideApi.prototype.deployIdentityContract = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var route, resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        route = "/ethereum/" + this.opts.network[1] + "/contracts/relayableidentity";
                        return [4 /*yield*/, this.send(route, 'POST', { account: address })];
                    case 1:
                        resp = _a.sent();
                        if (resp.status != 201) {
                            throw this.extractError(resp);
                        }
                        return [4 /*yield*/, resp.json()];
                    case 2:
                        json = _a.sent();
                        return [2 /*return*/, { address: json['address'], txHash: json['transaction_hash'] }];
                }
            });
        });
    };
    RocksideApi.prototype.getRelayNonce = function (identity, account) {
        return __awaiter(this, void 0, void 0, function () {
            var route, resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        route = "/ethereum/" + this.opts.network[1] + "/contracts/relayableidentity/" + identity + "/nonce";
                        return [4 /*yield*/, this.send(route, 'POST', { account: account })];
                    case 1:
                        resp = _a.sent();
                        if (resp.status != 200) {
                            throw this.extractError(resp);
                        }
                        return [4 /*yield*/, resp.json()];
                    case 2:
                        json = _a.sent();
                        return [2 /*return*/, Number(json['nonce'])];
                }
            });
        });
    };
    RocksideApi.prototype.relayTransaction = function (identity, tx) {
        return __awaiter(this, void 0, void 0, function () {
            var route, resp, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        route = "/ethereum/" + this.opts.network[1] + "/contracts/relayableidentity/" + identity + "/relayExecute";
                        return [4 /*yield*/, this.send(route, 'POST', {
                                from: tx.from,
                                to: tx.to,
                                value: "0x" + tx.value.toString(16),
                                data: buf2hex(tx.data),
                                signature: tx.signature,
                            })];
                    case 1:
                        resp = _a.sent();
                        if (resp.status != 200) {
                            throw this.extractError(resp);
                        }
                        return [4 /*yield*/, resp.json()];
                    case 2:
                        json = _a.sent();
                        return [2 /*return*/, json['transaction_hash']];
                }
            });
        });
    };
    RocksideApi.prototype.getRpcUrl = function () {
        return this.opts.baseUrl + "/ethereum/" + this.opts.network[1] + "/jsonrpc?token=" + this.opts.token;
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
