import { Wallet, BaseWallet } from './wallet';
import { Provider } from './provider';
import { executeMessageHash } from './hash';
import { RocksideApi, RocksideApiOpts, RocksideNetwork, RelaySpeed } from './api';

export type RocksideOpts = {} & RocksideApiOpts;

export const ROPSTEN: RocksideNetwork = [3, 'ropsten'];
export const MAINNET: RocksideNetwork = [1, 'mainnet'];

export type Transaction = {
  to: string,
  data: ArrayBuffer,
  speed: RelaySpeed,
  gasPriceLimit?: string,
  nonce?: string,
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

  private hasExistingIdentityStored(address: string): string|null {
    if (!window.localStorage) return null;

    return window.localStorage.getItem(`id-${address.toLowerCase()}`);
  }

  private storeIdentity(address: string, identity: string) {
    if (!window.localStorage) return;

    window.localStorage.setItem(`id-${address.toLowerCase()}`, identity);
  }

  async deployIdentity(address: string, forwarder: string): Promise<{ address: string, txHash?: string }> {
    const existingIdentity = this.hasExistingIdentityStored(address);
    if (!!existingIdentity) return { address: existingIdentity };

    const identity = await this.api.createSmartWallet(address, forwarder);
    this.storeIdentity(address, identity.address);
    return identity;
  }

  async relayTransaction(signer: Wallet, identity: string, tx: Transaction): Promise<string> {
    const address = signer.getAddress();
    const domain = { chainId: this.opts.network[0], verifyingContract: identity };
    let nonce = tx.nonce;
    let gasPriceLimit = tx.gasPriceLimit;
    if (!nonce || !gasPriceLimit) {
      let params = await this.api.getRelayParams(identity, address, 0);
      if (!nonce) {
        nonce = params.nonce
      }

      if (!gasPriceLimit) {
        gasPriceLimit = params.gasPrices[tx.speed];
      }
    }
    const message = {
      signer: address,
      to: tx.to,
      data: tx.data,
      nonce: nonce.toString(),
    };
    const hash = executeMessageHash(domain, {
      ...message,
      data: '0x'+Buffer.from(message.data).toString('hex'),
    });
    const signature = await signer.sign(hash);

    return this.api.relayTransaction(identity, {
      ...message,
      signer: signer.getAddress(),
      signature,
      speed: tx.speed,
      gasPriceLimit: tx.gasPriceLimit,
    });
  }
}

function _decodeUTF8(b: ArrayBuffer): string {
  return new TextDecoder().decode(b);
}

function _encodeUTF8(s: string): ArrayBuffer {
  return new TextEncoder().encode(s);
}
