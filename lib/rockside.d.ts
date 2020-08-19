import { Wallet } from './wallet';
import { Provider } from './provider';
import { RocksideApi, RocksideApiOpts, RocksideNetwork, RelaySpeed } from './api';
export declare type RocksideOpts = {} & RocksideApiOpts;
export declare const ROPSTEN: RocksideNetwork;
export declare const MAINNET: RocksideNetwork;
export declare type Transaction = {
    to: string;
    data: ArrayBuffer;
    speed: RelaySpeed;
    gasPriceLimit?: string;
    nonce?: string;
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
    deployIdentity(address: string, forwarder: string): Promise<{
        address: string;
        txHash?: string;
    }>;
    relayTransaction(signer: Wallet, identity: string, tx: Transaction): Promise<string>;
}
