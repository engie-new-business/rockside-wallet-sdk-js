/// <reference types="node" />
export declare type RelayerDomain = {
    chainId: number;
    verifyingContract: string;
};
export declare type TxMessage = {
    signer: string;
    to: string;
    data: string;
    nonce: string;
};
export declare type ExecuteTypedData = {
    types: {
        EIP712Domain: EIP712Type;
        TxMessage: EIP712Type;
    };
    message: TxMessage;
    primaryType: string;
    domain: RelayerDomain;
};
declare type EIP712Type = Array<{
    name: string;
    type: string;
}>;
export declare function hashMessage<TMessage>(domain: RelayerDomain, typeName: string, type: EIP712Type, message: TMessage): Buffer;
export declare function executeMessageTypedData(domain: RelayerDomain, message: TxMessage): ExecuteTypedData;
export declare function executeMessageHash(domain: RelayerDomain, message: TxMessage): Buffer;
export {};
