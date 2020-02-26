/// <reference types="node" />
export interface Wallet {
    getAddress(): string;
    sign(message: ArrayBuffer): Promise<string>;
}
export declare class BaseWallet implements Wallet {
    static createRandom(): BaseWallet;
    private words;
    private hdwallet;
    private wallet;
    constructor(words: string);
    getAddress(): string;
    getPrivateKey(): Buffer;
    getPublicKey(): Buffer;
    getWords(): string;
    sign(message: Buffer): Promise<string>;
}
