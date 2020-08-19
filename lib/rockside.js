"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var provider_1 = require("./provider");
var hash_1 = require("./hash");
var api_1 = require("./api");
exports.ROPSTEN = [3, 'ropsten'];
exports.MAINNET = [1, 'mainnet'];
var defaultOpts = {
    baseUrl: 'https://api.rockside.io',
};
var Rockside = /** @class */ (function () {
    function Rockside(opts) {
        this.opts = Object.assign({}, defaultOpts, opts);
        this.api = new api_1.RocksideApi(this.opts);
    }
    Rockside.prototype.getProvider = function () {
        return new provider_1.Provider(this, null, null);
    };
    Rockside.prototype.getWalletProvider = function (wallet, identity) {
        return new provider_1.Provider(this, wallet, identity);
    };
    Rockside.prototype.hasExistingIdentityStored = function (address) {
        if (!window.localStorage)
            return null;
        return window.localStorage.getItem("id-" + address.toLowerCase());
    };
    Rockside.prototype.storeIdentity = function (address, identity) {
        if (!window.localStorage)
            return;
        window.localStorage.setItem("id-" + address.toLowerCase(), identity);
    };
    Rockside.prototype.deployIdentity = function (address, forwarder) {
        return __awaiter(this, void 0, void 0, function () {
            var existingIdentity, identity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingIdentity = this.hasExistingIdentityStored(address);
                        if (!!existingIdentity)
                            return [2 /*return*/, { address: existingIdentity }];
                        return [4 /*yield*/, this.api.createSmartWallet(address, forwarder)];
                    case 1:
                        identity = _a.sent();
                        this.storeIdentity(address, identity.address);
                        return [2 /*return*/, identity];
                }
            });
        });
    };
    Rockside.prototype.relayTransaction = function (signer, identity, tx) {
        return __awaiter(this, void 0, void 0, function () {
            var address, domain, nonce, gasPriceLimit, params, message, hash, signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = signer.getAddress();
                        domain = { chainId: this.opts.network[0], verifyingContract: identity };
                        nonce = tx.nonce;
                        gasPriceLimit = tx.gasPriceLimit;
                        if (!(!nonce || !gasPriceLimit)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.api.getRelayParams(identity, address, 0)];
                    case 1:
                        params = _a.sent();
                        if (!nonce) {
                            nonce = params.nonce;
                        }
                        if (!gasPriceLimit) {
                            gasPriceLimit = params.gasPrices[tx.speed];
                        }
                        _a.label = 2;
                    case 2:
                        message = {
                            signer: address,
                            to: tx.to,
                            data: tx.data,
                            nonce: nonce.toString(),
                        };
                        hash = hash_1.executeMessageHash(domain, __assign(__assign({}, message), { data: '0x' + Buffer.from(message.data).toString('hex') }));
                        return [4 /*yield*/, signer.sign(hash)];
                    case 3:
                        signature = _a.sent();
                        return [2 /*return*/, this.api.relayTransaction(identity, __assign(__assign({}, message), { signer: signer.getAddress(), signature: signature, speed: tx.speed, gasPriceLimit: tx.gasPriceLimit }))];
                }
            });
        });
    };
    return Rockside;
}());
exports.Rockside = Rockside;
function _decodeUTF8(b) {
    return new TextDecoder().decode(b);
}
function _encodeUTF8(s) {
    return new TextEncoder().encode(s);
}
