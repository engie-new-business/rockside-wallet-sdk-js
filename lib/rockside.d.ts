import { Wallet } from './wallet';
import { Provider } from './provider';
import { RocksideApi, RocksideApiOpts, RocksideNetwork } from './api';
export declare type RocksideOpts = {} & RocksideApiOpts;
export declare const ROPSTEN: RocksideNetwork;
export declare const MAINNET: RocksideNetwork;
export declare type Transaction = {
    to: string;
    value: number;
    data: ArrayBuffer;
    gas: number;
    gasPrice: number;
    nonce?: BigInt;
};
export declare class Rockside {
    private readonly opts;
    readonly api: RocksideApi;
    constructor(opts: RocksideOpts);
    getProvider(): Provider;
    getWalletProvider(wallet: Wallet, identity: string): Provider;
    createEncryptedWallet(username: string, password: string): Promise<Wallet>;
    connectEncryptedWallet(username: string, password: string): Promise<Wallet>;
    private hasExistingIdentityStored;
    private storeIdentity;
    deployIdentity(address: string): Promise<{
        address: string;
        txHash?: string;
    }>;
    relayTransaction(signer: Wallet, identity: string, tx: Transaction): Promise<string>;
}
