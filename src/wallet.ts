import * as bip39 from 'bip39';
import * as hdkey from 'ethereumjs-wallet/hdkey';
import { ecsign, toRpcSig } from 'ethereumjs-util';

const EthereumPath = "m/44'/60'/0'/0/0";

export interface Wallet {
  getAddress(): string
  sign(message: ArrayBuffer): Promise<string>
}

export class BaseWallet implements Wallet {
  static createRandom(): BaseWallet {
    const words = bip39.generateMnemonic();
    return new BaseWallet(words)
  };

  private words: string;
  private hdwallet: any;
  private wallet: any;

  constructor(words: string) {
    this.words = words;
    this.hdwallet = hdkey.fromMasterSeed(words);
    this.wallet = this.hdwallet.derivePath(EthereumPath).getWallet();
  }

  getAddress(): string {
    return this.wallet.getChecksumAddressString();
  }

  getPrivateKey(): Buffer {
    return this.wallet.getPrivateKey();
  }

  getPublicKey(): Buffer {
    return this.wallet.getPublicKey();
  }

  getWords(): string {
    return this.words;
  }

  async sign(message: Buffer): Promise<string> {
    const sig = await ecsign(message, this.getPrivateKey())
    return toRpcSig(sig.v, sig.r, sig.s);
  }
};
