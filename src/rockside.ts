import { Wallet, BaseWallet } from './wallet';
import { Provider } from './provider';
import { executeMessageHash } from './hash';
import * as cryptolib from './crypto';
import { RocksideApi, RocksideApiOpts, RocksideNetwork } from './api';

export type RocksideOpts = {} & RocksideApiOpts;

export const ROPSTEN: RocksideNetwork = [3, 'ropsten'];
export const MAINNET: RocksideNetwork = [1, 'mainnet'];

export type Transaction = {
  relayer: string,
  to: string,
  value: number,
  data: ArrayBuffer,
  gas: number,
  gasPrice: number,
  nonce?: BigInt,
}

const defaultOpts = {
  baseUrl: 'https://api.rockside.io',
};

export class Rockside {
  private readonly opts: RocksideOpts;
  public readonly api: RocksideApi

  constructor(opts: RocksideOpts) {
    this.opts = Object.assign({}, defaultOpts, opts);
    this.api = new RocksideApi(this.opts);
  }

  getProvider(): Provider {
    return new Provider(this, null, null);
  }

  getWalletProvider(wallet: Wallet, identity: string): Provider {
    return new Provider(this, wallet, identity);
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

  private hasExistingIdentityStored(address: string): string|null {
    if (!window.localStorage) return null;

    return window.localStorage.getItem(`id-${address.toLowerCase()}`);
  }

  private storeIdentity(address: string, identity: string) {
    if (!window.localStorage) return;

    window.localStorage.setItem(`id-${address.toLowerCase()}`, identity);
  }

  async deployIdentity(address: string): Promise<{ address: string, txHash?: string }> {
    const existingIdentity = this.hasExistingIdentityStored(address);
    if (!!existingIdentity) return { address: existingIdentity };

    const identity = await this.api.deployIdentityContract(address);
    this.storeIdentity(address, identity.address);
    return identity;
  }

  async relayTransaction(signer: Wallet, identity: string, tx: Transaction): Promise<string> {
    const address = signer.getAddress();
    const domain = { chainId: this.opts.network[0], verifyingContract: identity };
    let nonce = tx.nonce;
    let relayer = tx.relayer;
    if (!nonce || !tx.relayer) {
      let params = await this.api.getRelayParams(identity, address, 0);
      nonce = BigInt(params.nonce)
      relayer = params.relayer
    }
    const message = {
      relayer: relayer,
      signer: address,
      to: tx.to,
      value: tx.value,
      data: tx.data,
      gasLimit: tx.gas,
      gasPrice: tx.gasPrice,
      nonce: nonce.toString(),
    };
    const hash = executeMessageHash(domain, {
      ...message,
      data: '0x'+Buffer.from(message.data).toString('hex'),
    });
    const signature = await signer.sign(hash);

    return this.api.relayTransaction(identity, {
      ...tx,
      from: signer.getAddress(),
      signature,
    });
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
