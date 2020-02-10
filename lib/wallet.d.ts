/// <reference types="node" />
export declare class Wallet {
    static createRandom(): Wallet;
    static recoverFromMnemonic(words: string): Wallet;
    private words;
    private hdwallet;
    private wallet;
    constructor(hdwallet: any, words: string);
    getAddress(): string;
    getPrivateKey(): Buffer;
    getPublicKey(): Buffer;
    getWords(): string;
    sign(message: Buffer): Promise<string>;
}
