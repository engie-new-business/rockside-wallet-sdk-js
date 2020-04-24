export declare type RocksideNetwork = [3, 'ropsten'] | [1, 'mainnet'];
export declare type RocksideApiOpts = {
    baseUrl: string;
    token: string;
    network: RocksideNetwork;
};
export declare type ExecuteTransaction = {
    from: string;
    to: string;
    value: number;
    data: ArrayBuffer;
    gas: number;
    gasPrice: number;
    signature: string;
};
export declare type EncryptedAccount = {
    username: string;
    iterations: number;
    passwordHash: ArrayBuffer;
    passwordDerivedKeyHash: ArrayBuffer;
    encryptedEncryptionKey: ArrayBuffer;
    encryptedEncryptionKeyIV: ArrayBuffer;
};
export declare type EncryptedWallet = {
    encryptedMnemonic: ArrayBuffer;
    encryptedMnemonicIV: ArrayBuffer;
};
export declare type IdentityResponse = {
    address: string;
    transactionHash: string;
};
export declare class RocksideApi {
    private readonly opts;
    constructor(opts: RocksideApiOpts);
    private extractError;
    private send;
    getIdentities(): Promise<string[]>;
    createIdentity(): Promise<IdentityResponse>;
    createEncryptedAccount(account: EncryptedAccount): Promise<void>;
    connectEncryptedAccount(username: string, passwordHash: ArrayBuffer): Promise<{
        data: ArrayBuffer;
        iv: ArrayBuffer;
    }>;
    createEncryptedWallet(account: EncryptedAccount, wallet: EncryptedWallet): Promise<void>;
    getEncryptedWallets(username: string, passwordHash: ArrayBuffer): Promise<Array<EncryptedWallet>>;
    deployIdentityContract(address: string): Promise<{
        address: string;
        txHash: string;
    }>;
    getRelayNonce(identity: string, account: string, channel: number): Promise<number>;
    relayTransaction(identity: string, tx: ExecuteTransaction): Promise<string>;
    getRpcUrl(): string;
    getToken(): string;
}
