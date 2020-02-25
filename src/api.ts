export type RocksideApiOpts = {
  baseUrl: string,
  token: string,
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
    const url = `${this.opts.baseUrl}${route}?token=${this.opts.token}`;
    return await fetch(url, {
      method,
      body: JSON.stringify(body),
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
