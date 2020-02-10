/// <reference types="node" />
export declare type RelayerDomain = {
    chainId: number;
    verifyingContract: string;
};
export declare type TxMessage = {
    signer: string;
    to: string;
    value: number;
    data: string;
    nonce: number;
};
export declare type Create2Message = {
    signer: string;
    value: number;
    salt: number;
    initCode: string;
    nonce: number;
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
export declare type DeployTypedData = {
    types: {
        EIP712Domain: EIP712Type;
        Create2Message: EIP712Type;
    };
    message: Create2Message;
    primaryType: string;
    domain: RelayerDomain;
};
export declare function hashMessage<TMessage>(domain: RelayerDomain, typeName: string, type: EIP712Type, message: TMessage): Buffer;
export declare function executeMessageTypedData(domain: RelayerDomain, message: TxMessage): ExecuteTypedData;
export declare function executeMessageHash(domain: RelayerDomain, message: TxMessage): Buffer;
export declare function deployMessageTypedData(domain: RelayerDomain, message: Create2Message): DeployTypedData;
export declare function deployMessageHash(domain: RelayerDomain, message: Create2Message): Buffer;
export {};
