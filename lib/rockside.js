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
var wallet_1 = require("./wallet");
var provider_1 = require("./provider");
var hash_1 = require("./hash");
var cryptolib = require("./crypto");
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
    Rockside.prototype.createEncryptedWallet = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            var encryptionKey, encodedPassword, encodedUsername, iterations, passwordDerivedKey, iv, encryptedEncryptionKey, passwordHash, account, _a, wallet, encodedMnemonic, mnemonicIV, encryptedMnemonic;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        encryptionKey = getRandomPrivateKey();
                        encodedPassword = _encodeUTF8(password);
                        encodedUsername = _encodeUTF8(username);
                        iterations = Pbkdf2Iterations;
                        return [4 /*yield*/, cryptolib.pbkdf2(encodedPassword, encodedUsername, iterations)];
                    case 1:
                        passwordDerivedKey = _b.sent();
                        iv = getRandomIV();
                        return [4 /*yield*/, cryptolib.encryptAESCBC(passwordDerivedKey, iv, encryptionKey)];
                    case 2:
                        encryptedEncryptionKey = _b.sent();
                        return [4 /*yield*/, cryptolib.pbkdf2(passwordDerivedKey, encodedPassword, 1)];
                    case 3:
                        passwordHash = _b.sent();
                        _a = {
                            username: username,
                            iterations: iterations,
                            passwordHash: passwordHash
                        };
                        return [4 /*yield*/, cryptolib.sha512(passwordDerivedKey)];
                    case 4:
                        account = (_a.passwordDerivedKeyHash = _b.sent(),
                            _a.encryptedEncryptionKey = encryptedEncryptionKey,
                            _a.encryptedEncryptionKeyIV = iv,
                            _a);
                        return [4 /*yield*/, this.api.createEncryptedAccount(account)];
                    case 5:
                        _b.sent();
                        wallet = wallet_1.BaseWallet.createRandom();
                        encodedMnemonic = _encodeUTF8(wallet.getWords());
                        mnemonicIV = getRandomIV();
                        return [4 /*yield*/, cryptolib.encryptAESCBC(encryptionKey, mnemonicIV, encodedMnemonic)];
                    case 6:
                        encryptedMnemonic = _b.sent();
                        return [4 /*yield*/, this.api.createEncryptedWallet(account, { encryptedMnemonic: encryptedMnemonic, encryptedMnemonicIV: mnemonicIV })];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, wallet];
                }
            });
        });
    };
    Rockside.prototype.connectEncryptedWallet = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            var encodedPassword, encodedUsername, iterations, passwordDerivedKey, passwordHash, encryptedEncryptionKey, encryptionKey, encryptedWallets, mnemonic;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        encodedPassword = _encodeUTF8(password);
                        encodedUsername = _encodeUTF8(username);
                        iterations = Pbkdf2Iterations;
                        return [4 /*yield*/, cryptolib.pbkdf2(encodedPassword, encodedUsername, iterations)];
                    case 1:
                        passwordDerivedKey = _a.sent();
                        return [4 /*yield*/, cryptolib.pbkdf2(passwordDerivedKey, encodedPassword, 1)];
                    case 2:
                        passwordHash = _a.sent();
                        return [4 /*yield*/, this.api.connectEncryptedAccount(username, passwordHash)];
                    case 3:
                        encryptedEncryptionKey = _a.sent();
                        return [4 /*yield*/, cryptolib.decryptAESCBC(passwordDerivedKey, encryptedEncryptionKey.iv, encryptedEncryptionKey.data)];
                    case 4:
                        encryptionKey = _a.sent();
                        return [4 /*yield*/, this.api.getEncryptedWallets(username, passwordHash)];
                    case 5:
                        encryptedWallets = _a.sent();
                        if (encryptedWallets.length !== 1) {
                            throw new Error("account needs exactly one encrypted wallet, but has " + encryptedWallets.length);
                        }
                        return [4 /*yield*/, cryptolib.decryptAESCBC(encryptionKey, encryptedWallets[0].encryptedMnemonicIV, encryptedWallets[0].encryptedMnemonic)];
                    case 6:
                        mnemonic = _a.sent();
                        return [2 /*return*/, new wallet_1.BaseWallet(_decodeUTF8(mnemonic))];
                }
            });
        });
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
    Rockside.prototype.deployIdentity = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var existingIdentity, identity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingIdentity = this.hasExistingIdentityStored(address);
                        if (!!existingIdentity)
                            return [2 /*return*/, { address: existingIdentity }];
                        return [4 /*yield*/, this.api.deployIdentityContract(address)];
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
            var address, domain, nonce, relayer, params, message, hash, signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = signer.getAddress();
                        domain = { chainId: this.opts.network[0], verifyingContract: identity };
                        nonce = tx.nonce;
                        relayer = tx.relayer;
                        if (!(!nonce || !tx.relayer)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.api.getRelayParams(identity, address, 0)];
                    case 1:
                        params = _a.sent();
                        nonce = BigInt(params.nonce);
                        relayer = params.relayer;
                        _a.label = 2;
                    case 2:
                        message = {
                            relayer: relayer,
                            signer: address,
                            to: tx.to,
                            value: tx.value,
                            data: tx.data,
                            gasLimit: tx.gas,
                            gasPrice: tx.gasPrice,
                            nonce: nonce.toString(),
                        };
                        hash = hash_1.executeMessageHash(domain, __assign(__assign({}, message), { data: '0x' + Buffer.from(message.data).toString('hex') }));
                        return [4 /*yield*/, signer.sign(hash)];
                    case 3:
                        signature = _a.sent();
                        return [2 /*return*/, this.api.relayTransaction(identity, __assign(__assign({}, tx), { from: signer.getAddress(), signature: signature }))];
                }
            });
        });
    };
    return Rockside;
}());
exports.Rockside = Rockside;
var Pbkdf2Iterations = 100000;
function getRandomPrivateKey() {
    var array = new Uint8Array(32);
    cryptolib.getRandomValues(array);
    return array;
}
function getRandomIV() {
    var array = new Uint8Array(16);
    cryptolib.getRandomValues(array);
    return array;
}
function _decodeUTF8(b) {
    return new TextDecoder().decode(b);
}
function _encodeUTF8(s) {
    return new TextEncoder().encode(s);
}
