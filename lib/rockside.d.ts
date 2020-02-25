import { RocksideApiOpts } from './api';
export interface Wallet {
    getAddress(): string;
    sign(message: ArrayBuffer): Promise<string>;
}
export declare type RocksideOpts = {
    baseUrl?: string;
} & RocksideApiOpts;
export declare class Rockside {
    private readonly opts;
    private api;
    constructor(opts: RocksideOpts);
    createEncryptedWallet(username: string, password: string): Promise<Wallet>;
    connectEncryptedWallet(username: string, password: string): Promise<Wallet>;
}
