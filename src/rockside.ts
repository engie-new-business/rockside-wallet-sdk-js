import { BaseWallet } from './wallet';
import * as cryptolib from './crypto';
import { RocksideApi, RocksideApiOpts } from './api';

export interface Wallet {
  getAddress(): string
  sign(message: ArrayBuffer): Promise<string>
}


export type RocksideOpts = {
  baseUrl?: string
} & RocksideApiOpts;

const defaultOpts = {
  baseUrl: 'https://api.rockside.io',
};

export class Rockside {
  private readonly opts: RocksideOpts;
  private api: RocksideApi

  constructor(opts: RocksideOpts) {
    this.opts = Object.assign({}, defaultOpts, opts);
    this.api = new RocksideApi(this.opts);
  }

  async createEncryptedWallet(username: string, password: string): Promise<Wallet> {
    const encryptionKey = getRandomPrivateKey();

    const encodedPassword = _encodeUTF8(password);
    const encodedUsername = _encodeUTF8(username);
    const iterations = Pbkdf2Iterations;
    const passwordDerivedKey = await cryptolib.pbkdf2(encodedPassword, encodedUsername, iterations);

    const iv = getRandomIV();
    const encryptedEncryptionKey = await cryptolib.encryptAESCBC(passwordDerivedKey, iv, encryptionKey);

    const passwordHash = await cryptolib.pbkdf2(passwordDerivedKey, encodedPassword, 1);
    const account = {
      username,
      iterations,
      passwordHash,
      passwordDerivedKeyHash: await cryptolib.sha512(passwordDerivedKey),
      encryptedEncryptionKey,
      encryptedEncryptionKeyIV: iv,
    };
    await this.api.createEncryptedAccount(account);

    const wallet = BaseWallet.createRandom();

    const encodedMnemonic = _encodeUTF8(wallet.getWords());
    const mnemonicIV = getRandomIV();
    const encryptedMnemonic = await cryptolib.encryptAESCBC(encryptionKey, mnemonicIV, encodedMnemonic);

    await this.api.createEncryptedWallet(account, { encryptedMnemonic, encryptedMnemonicIV: mnemonicIV });

    return wallet;
  }

  async connectEncryptedWallet(username: string, password: string): Promise<Wallet> {
    const encodedPassword = _encodeUTF8(password);
    const encodedUsername = _encodeUTF8(username);
    const iterations = Pbkdf2Iterations;

    const passwordDerivedKey = await cryptolib.pbkdf2(encodedPassword, encodedUsername, iterations);
    const passwordHash = await cryptolib.pbkdf2(passwordDerivedKey, encodedPassword, 1);

    const encryptedEncryptionKey = await this.api.connectEncryptedAccount(username, passwordHash);

    const encryptionKey = await cryptolib.decryptAESCBC(
      passwordDerivedKey,
      encryptedEncryptionKey.iv,
      encryptedEncryptionKey.data,
    );

    const encryptedWallets = await this.api.getEncryptedWallets(username, passwordHash);
    if (encryptedWallets.length !== 1) {
      throw new Error(`account needs exactly one encrypted wallet, but has ${encryptedWallets.length}`);
    }

    const mnemonic = await cryptolib.decryptAESCBC(
      encryptionKey,
      encryptedWallets[0].encryptedMnemonicIV,
      encryptedWallets[0].encryptedMnemonic,
    );

    return new BaseWallet(_decodeUTF8(mnemonic));
  }
}

const Pbkdf2Iterations = 100000;

function getRandomPrivateKey(): Uint8Array {
    const array = new Uint8Array(32);
    cryptolib.getRandomValues(array);
    return array;
}

function getRandomIV(): Uint8Array {
    const array = new Uint8Array(16);
    cryptolib.getRandomValues(array);
    return array;
}

function _decodeUTF8(b: ArrayBuffer): string {
  return new TextDecoder().decode(b);
}

function _encodeUTF8(s: string): ArrayBuffer {
  return new TextEncoder().encode(s);
}
