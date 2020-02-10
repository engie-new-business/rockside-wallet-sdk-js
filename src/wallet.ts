import * as bip39 from 'bip39';
import * as hdkey from 'ethereumjs-wallet/hdkey';
import { ecsign, toRpcSig } from 'ethereumjs-util';

const EthereumPath = "m/44'/60'/0'/0/0";

export class Wallet {
  static createRandom(): Wallet {
    const words = bip39.generateMnemonic();
    return Wallet.recoverFromMnemonic(words)
  };

  static recoverFromMnemonic(words: string): Wallet {
    const hdwallet = hdkey.fromMasterSeed(words);
    return new Wallet(hdwallet, words);
  }

  private words: string;
  private hdwallet: any;
  private wallet: any;

  constructor(hdwallet: any, words: string) {
    this.words = words; 
    this.hdwallet = hdwallet;
    this.wallet = hdwallet.derivePath(EthereumPath).getWallet();
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
