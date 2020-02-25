export function getRandomValues(arr: Uint8Array): Uint8Array {
  return window.crypto.getRandomValues(arr);
}

export async function pbkdf2(
  password: ArrayBuffer, salt: ArrayBuffer, iterations: number,
): Promise<ArrayBuffer> {
  const key = await window.crypto.subtle.importKey(
    'raw',
    password,
    { name: 'PBKDF2' } as any, /* required to cast because type definition is not up to date */
    false,
    ['deriveBits'],
  );

  return await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: { name: 'sha-256' } },
    key,
    256,
  );
}

export async function encryptAESCBC(
  privateKey: ArrayBuffer, iv: ArrayBuffer, data: ArrayBuffer,
): Promise<ArrayBuffer> {
  const key = await window.crypto.subtle.importKey(
    'raw',
    new Uint8Array(privateKey),
    { name: 'AES-CBC' } as any, /* required to cast because type definition is not up to date */
    false,
    ['encrypt'],
  );

  return await window.crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    data,
  );
}

export async function decryptAESCBC(
  privateKey: ArrayBuffer, iv: ArrayBuffer, data: ArrayBuffer,
): Promise<ArrayBuffer> {
  const key = await window.crypto.subtle.importKey(
    'raw',
    privateKey,
    { name: 'AES-CBC' } as any, /* required to cast because type definition is not up to date */
    false,
    ['decrypt'],
  );

  return await window.crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    data,
  );
}

export async function sha512(data: ArrayBuffer): Promise<ArrayBuffer> {
  return await window.crypto.subtle.digest('SHA-512', data)
}
