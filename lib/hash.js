"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ethereumjs_util_1 = require("ethereumjs-util");
var eth_sig_util_1 = require("eth-sig-util");
/* EIP712 type definitions */
var eip712DomainType = [
    { name: 'verifyingContract', type: 'address' },
    { name: 'chainId', type: 'uint256' }
];
var executeTxType = [
    { name: "signer", type: "address" },
    { name: "to", type: "address" },
    { name: "data", type: "bytes" },
    { name: "nonce", type: "uint256" },
];
function hashMessage(domain, typeName, type, message) {
    var encodedDomain = eth_sig_util_1.TypedDataUtils.encodeData('EIP712Domain', domain, { EIP712Domain: eip712DomainType });
    var hashedDomain = ethereumjs_util_1.keccak256(encodedDomain);
    var messageTypes = {};
    messageTypes[typeName] = type;
    var encodedMessage = eth_sig_util_1.TypedDataUtils.encodeData(typeName, message, messageTypes);
    var hashedMessage = ethereumjs_util_1.keccak256(encodedMessage);
    return ethereumjs_util_1.keccak256(Buffer.concat([
        Buffer.from('1901', 'hex'),
        hashedDomain,
        hashedMessage,
    ]));
}
exports.hashMessage = hashMessage;
function executeMessageTypedData(domain, message) {
    return {
        types: {
            EIP712Domain: eip712DomainType,
            TxMessage: executeTxType,
        },
        domain: domain,
        primaryType: 'TxMessage',
        message: message,
    };
}
exports.executeMessageTypedData = executeMessageTypedData;
function executeMessageHash(domain, message) {
    return hashMessage(domain, 'TxMessage', executeTxType, message);
}
exports.executeMessageHash = executeMessageHash;
