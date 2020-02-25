export declare type RocksideApiOpts = {
    baseUrl: string;
    token: string;
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
export declare class RocksideApi {
    private readonly opts;
    constructor(opts: RocksideApiOpts);
    private extractError;
    private send;
    createEncryptedAccount(account: EncryptedAccount): Promise<void>;
    connectEncryptedAccount(username: string, passwordHash: ArrayBuffer): Promise<{
        data: ArrayBuffer;
        iv: ArrayBuffer;
    }>;
    createEncryptedWallet(account: EncryptedAccount, wallet: EncryptedWallet): Promise<void>;
    getEncryptedWallets(username: string, passwordHash: ArrayBuffer): Promise<Array<EncryptedWallet>>;
}
