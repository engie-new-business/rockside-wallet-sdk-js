/// <reference types="node" />
export declare class BaseWallet {
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
