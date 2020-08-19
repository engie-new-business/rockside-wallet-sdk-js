import fetch from 'cross-fetch';

export type RocksideNetwork = [3, 'ropsten'] | [1, 'mainnet'];

export type RelaySpeed = 'fastest' | 'fast' | 'average' | 'safelow';

export type RocksideApiOpts = {
  baseUrl: string,
  token?: string,
  apikey?: string,
  network: RocksideNetwork;
};

export enum GasPrices {
    FASTEST = 'fastest',
    FAST = 'fast',
    AVERAGE = 'average',
    SAFELOW = 'safelow',
};

export type RelayParams = {
  nonce: string,
  gasPrices: GasPrices,
};

export type ExecuteTransaction = {
  signer: string,
  to: string,
  data: ArrayBuffer,
  nonce: string,
  speed: RelaySpeed,
  gasPriceLimit: string,
  signature: string,
};

export type EncryptedAccount = {
  username: string,
  iterations: number,
  passwordHash: ArrayBuffer,
  passwordDerivedKeyHash: ArrayBuffer,
  encryptedEncryptionKey: ArrayBuffer,
  encryptedEncryptionKeyIV: ArrayBuffer,
};

export type EncryptedWallet = {
  encryptedMnemonic: ArrayBuffer,
  encryptedMnemonicIV: ArrayBuffer,
};

export type SmartWalletResponse = {
  address: string,
  transactionHash: string,
};

export type TransactionOpts = {
  from: string;
  to?: string;
  value?: string | number | BigInt;
  gas?: string | number | BigInt;
  gasPrice?: string | number | BigInt;
  data?: string;
  nonce?: number;
}

export class RocksideApi {
  private readonly opts: RocksideApiOpts;
  private readonly headers: { [key: string]: string };

  private generateHeaders(opts: RocksideApiOpts): { [key: string]: string } {

    if (opts.apikey) {
      return {
        'apikey': opts.apikey
      }
    } else {
      return {
        'Authorization': 'Bearer ' + opts.token,
      }
    }

  }

  private authenticationChecks(opts: RocksideApiOpts): void {

    if (opts.apikey && opts.token) {
      throw new Error('Both access token and api key provided. Only one needed.');
    }

    if (!opts.apikey && !opts.token) {
      throw new Error('No authentication method provided: define apikey or token.');
    }

  }

  constructor(opts: RocksideApiOpts) {

    this.authenticationChecks(opts);
    this.headers = this.generateHeaders(opts);

    this.opts = opts;
  }

  private async extractError(resp: Response): Promise<Error> {
    const json = await resp.json();
    throw new Error(json['error']);
  }

  private async send(route: string, method: string, body: object): Promise<Response> {
    const url = `${this.opts.baseUrl}${route}`;
    return await fetch(url, {
      method,
      body: !!body ? JSON.stringify(body) : null,
      headers: this.headers,
    });
  }

  async getSmartWallets(): Promise<string[]> {
    const resp = await this.send(`/ethereum/${this.opts.network[1]}/smartwallets`, 'GET', null);

    if (resp.status != 200) {
      throw await this.extractError(resp);
    }

    const json = await resp.json();
    return json as string[];
  }

  async createSmartWallet(account, forwarder): Promise<SmartWalletResponse> {
    const resp = await this.send(`/ethereum/${this.opts.network[1]}/smartwallets`, 'POST', { account, forwarder});

    if (resp.status != 201) {
      throw await this.extractError(resp);
    }

    const json = await resp.json();
    return {
      address: json.address,
      transactionHash: json.transaction_hash,
    };
  }

  async getEOAs(): Promise<string[]> {
    const resp = await this.send(`/ethereum/eoa`, 'GET', null);

    if (resp.status !== 200) {
      throw await this.extractError(resp);
    }

    return resp.json();
  }

  async createEOA(): Promise<{ address: string }> {
    const resp = await this.send(`/ethereum/eoa`, 'POST', {});

    if (resp.status !== 200) {
      throw await this.extractError(resp);
    }

    const json = await resp.json();

    return {
      address: json['address']
    }
  }

  async signMessageWithEOA(eoa: string, hash: string): Promise<{ signed_message: string }> {
    const resp = await this.send(`/ethereum/eoa/${eoa}/sign-message`, 'POST', {
      message: hash
    });

    if (resp.status !== 200) {
      throw await this.extractError(resp);
    }

    const json = await resp.json();

    return {
      signed_message: json['signed_message']
    }
  }

  async sendTransaction(tx: TransactionOpts): Promise<{ transaction_hash: string, tracking_id: string }> {
    const resp = await this.send(`/ethereum/${this.opts.network[1]}/transaction`, 'POST', tx);

    if (resp.status !== 200) {
      throw await this.extractError(resp);
    }

    const json = await resp.json();

    return {
      transaction_hash: json['transaction_hash'],
      tracking_id: json['tracking_id']
    }
  }

  async createEncryptedAccount(account: EncryptedAccount) {
    const resp = await this.send('/encryptedaccounts', 'PUT', {
      username: account.username,
      password_hash: buf2hex(account.passwordHash),
      encrypted_encryption_key: buf2hex(account.encryptedEncryptionKey),
      encrypted_encryption_key_iv: buf2hex(account.encryptedEncryptionKeyIV),
      iterations: account.iterations,
      password_derived_key_hash: buf2hex(account.passwordDerivedKeyHash),
    });

    if (resp.status != 201 && resp.status != 409) {
      throw await this.extractError(resp);
    }
  }

  async connectEncryptedAccount(username: string, passwordHash: ArrayBuffer): Promise<{ data: ArrayBuffer, iv: ArrayBuffer }> {
    const resp = await this.send('/encryptedaccounts/connect', 'POST', {
      username,
      password_hash: buf2hex(passwordHash),
    });
    if (resp.status != 200) {
      throw await this.extractError(resp);
    }

    const json = await resp.json();

    return {
      data: hex2buf(json['encrypted_encryption_key']),
      iv: new Uint8Array(hex2buf(json['encryption_key_iv'])),
    };
  }

  async createEncryptedWallet(account: EncryptedAccount, wallet: EncryptedWallet) {
    const resp = await this.send('/encryptedaccounts/wallets', 'PUT', {
      username: account.username,
      password_hash: buf2hex(account.passwordHash),
      encrypted_mnemonic: buf2hex(wallet.encryptedMnemonic),
      encrypted_mnemonic_iv: buf2hex(wallet.encryptedMnemonicIV),
    });
    if (resp.status != 201) {
      throw await this.extractError(resp);
    }
  }

  async getEncryptedWallets(username: string, passwordHash: ArrayBuffer): Promise<Array<EncryptedWallet>> {
    const resp = await this.send('/encryptedaccounts/wallets', 'POST', {
      username,
      password_hash: buf2hex(passwordHash),
    });
    if (resp.status != 200) {
      throw await this.extractError(resp);
    }

    const json = await resp.json();

    const wallets = json.map(jsonWallet => ({
      encryptedMnemonic: hex2buf(jsonWallet['encrypted_mnemonic']),
      encryptedMnemonicIV: hex2buf(jsonWallet['mnemonic_iv']),
    }));

    return wallets;
  }

  async getRelayParams(forwarder: string, account: string, channel: number): Promise<RelayParams> {
    const route = `/ethereum/${this.opts.network[1]}/forwarders/${forwarder}/relayParams`;
    const resp = await this.send(route, 'POST', {
      account,
      channel_id: channel.toString(),
    });

    if (resp.status != 200) {
      throw await this.extractError(resp);
    }

    const json = await resp.json();

    return { nonce: json['nonce'], gasPrices: json['gas_prices'] };
  }

  async relayTransaction(forwarder: string, tx: ExecuteTransaction): Promise<string> {
    const route = `/ethereum/${this.opts.network[1]}/forwarders/${forwarder}`;
    const resp = await this.send(route, 'POST', {
      message: {
        signer: tx.signer,
        to: tx.to,
        data: buf2hex(tx.data),
        nonce: tx.nonce,
      },
      speed: tx.speed,
      gas_price_limit: tx.gasPriceLimit,
      signature: tx.signature,
    });

    if (resp.status != 200) {
      throw await this.extractError(resp);
    }

    const json = await resp.json();

    return json['transaction_hash'];
  }

  getRpcUrl(): string {
    return `${this.opts.baseUrl}/ethereum/${this.opts.network[1]}/jsonrpc`;
  }

  getToken(): string {
    return this.opts.token;
  }
}

function buf2hex(buffer: ArrayBuffer): string { // buffer is an ArrayBuffer
  return '0x' + Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

function hex2buf(s: string): ArrayBuffer { // buffer is an ArrayBuffer
  const noPrefix = s.substring(2);
  const length = noPrefix.length / 2;
  const view = new Uint8Array(length);
  for (let i = 0; i < noPrefix.length; i += 2) {
    view[i / 2] = parseInt(noPrefix.substring(i, i + 2), 16);
  }
  return view.buffer;
}
