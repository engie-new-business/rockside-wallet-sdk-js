import { Wallet } from './wallet';

export type RocksideNetwork = [3, 'ropsten'] | [1, 'mainnet'];

export type RocksideApiOpts = {
  baseUrl: string,
  token: string,
  network: RocksideNetwork;
};

export type ExecuteTransaction = {
  from: string,
  to: string,
  value: number,
  data: ArrayBuffer,
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

export class RocksideApi {
  private readonly opts: RocksideApiOpts;

  constructor(opts: RocksideApiOpts) {
    this.opts = opts;
  }

  private async extractError(resp: Response): Promise<Error> {
      const json = await resp.json();
      throw new Error(json["error"]);
  }

  private async send(route: string, method: string, body: object): Promise<Response> {
    const url = `${this.opts.baseUrl}${route}`;
    return await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: {
        "Authorization": "Bearer " + this.opts.token,
      },
    });
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
      throw this.extractError(resp);
    }
  }

  async connectEncryptedAccount(username: string, passwordHash: ArrayBuffer): Promise<{data: ArrayBuffer, iv: ArrayBuffer}> {
    const resp = await this.send('/encryptedaccounts/connect', 'POST', {
      username,
      password_hash: buf2hex(passwordHash),
    });
    if (resp.status != 200) {
      throw this.extractError(resp);
    }

    const json = await resp.json()

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
      throw this.extractError(resp);
    }
  }

  async getEncryptedWallets(username: string, passwordHash: ArrayBuffer): Promise<Array<EncryptedWallet>> {
    const resp = await this.send('/encryptedaccounts/wallets', 'POST', {
      username,
      password_hash: buf2hex(passwordHash),
    });
    if (resp.status != 200) {
      throw this.extractError(resp);
    }

    const json = await resp.json();

    const wallets = json.map(jsonWallet => ({
      encryptedMnemonic: hex2buf(jsonWallet['encrypted_mnemonic']),
      encryptedMnemonicIV: hex2buf(jsonWallet['mnemonic_iv']),
    }));

    return wallets;
  }

  async deployIdentityContract(address: string): Promise<{ address: string, txHash: string }> {
    const route = `/ethereum/${this.opts.network[1]}/contracts/relayableidentity`;
    const resp = await this.send(route, 'POST', { account: address });

    if (resp.status != 201) {
      throw this.extractError(resp);
    }

    const json = await resp.json();

    return { address: json['address'], txHash: json['transaction_hash'] };
  }

  async getRelayNonce(identity: string, account: string): Promise<number> {
    const route = `/ethereum/${this.opts.network[1]}/contracts/relayableidentity/${identity}/nonce`;
    const resp = await this.send(route, 'POST', { account });

    if (resp.status != 200) {
      throw this.extractError(resp);
    }

    const json = await resp.json();

    return Number(json['nonce']);
  }

  async relayTransaction(identity: string, tx: ExecuteTransaction): Promise<string> {
    const route = `/ethereum/${this.opts.network[1]}/contracts/relayableidentity/${identity}/relayExecute`;
    const resp = await this.send(route, 'POST', {
      from: tx.from,
      to: tx.to,
      value: `0x${tx.value.toString(16)}`,
      data: buf2hex(tx.data),
      signature: tx.signature,
    });

    if (resp.status != 200) {
      throw this.extractError(resp);
    }

    const json = await resp.json();

    return json['transaction_hash'];
  }

  getRpcUrl(): string {
    return `${this.opts.baseUrl}/ethereum/${this.opts.network[1]}/jsonrpc`
  }

  getToken(): string {
    return this.opts.token
  }
}

function buf2hex(buffer: ArrayBuffer): string { // buffer is an ArrayBuffer
  return '0x' + Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

function hex2buf(s: string): ArrayBuffer { // buffer is an ArrayBuffer
  const noPrefix = s.substring(2)
  const length = noPrefix.length / 2;
  const view = new Uint8Array(length);
  for (let i = 0; i < noPrefix.length; i += 2) {
    view[i / 2] = parseInt(noPrefix.substring(i, i + 2), 16)
  }
  return view.buffer;
}
