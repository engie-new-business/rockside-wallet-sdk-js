export declare type RocksideNetwork = [3, 'ropsten'] | [1, 'mainnet'];
export declare type RelaySpeed = 'fastest' | 'fast' | 'average' | 'safelow';
export declare type RocksideApiOpts = {
    baseUrl: string;
    token?: string;
    apikey?: string;
    network: RocksideNetwork;
};
export declare enum GasPrices {
    FASTEST = "fastest",
    FAST = "fast",
    AVERAGE = "average",
    SAFELOW = "safelow"
}
export declare type RelayParams = {
    nonce: string;
    gasPrices: GasPrices;
};
export declare type ExecuteTransaction = {
    signer: string;
    to: string;
    data: ArrayBuffer;
    nonce: string;
    speed: RelaySpeed;
    gasPriceLimit: string;
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
export declare type SmartWalletResponse = {
    address: string;
    transactionHash: string;
};
export declare type TransactionOpts = {
    from: string;
    to?: string;
    value?: string | number | BigInt;
    gas?: string | number | BigInt;
    gasPrice?: string | number | BigInt;
    data?: string;
    nonce?: number;
};
export declare class RocksideApi {
    private readonly opts;
    private readonly headers;
    private generateHeaders;
    private authenticationChecks;
    constructor(opts: RocksideApiOpts);
    private extractError;
    private send;
    getSmartWallets(): Promise<string[]>;
    createSmartWallet(account: any, forwarder: any): Promise<SmartWalletResponse>;
    getEOAs(): Promise<string[]>;
    createEOA(): Promise<{
        address: string;
    }>;
    signMessageWithEOA(eoa: string, hash: string): Promise<{
        signed_message: string;
    }>;
    sendTransaction(tx: TransactionOpts): Promise<{
        transaction_hash: string;
        tracking_id: string;
    }>;
    createEncryptedAccount(account: EncryptedAccount): Promise<void>;
    connectEncryptedAccount(username: string, passwordHash: ArrayBuffer): Promise<{
        data: ArrayBuffer;
        iv: ArrayBuffer;
    }>;
    createEncryptedWallet(account: EncryptedAccount, wallet: EncryptedWallet): Promise<void>;
    getEncryptedWallets(username: string, passwordHash: ArrayBuffer): Promise<Array<EncryptedWallet>>;
    getRelayParams(forwarder: string, account: string, channel: number): Promise<RelayParams>;
    relayTransaction(forwarder: string, tx: ExecuteTransaction): Promise<string>;
    getRpcUrl(): string;
    getToken(): string;
}
