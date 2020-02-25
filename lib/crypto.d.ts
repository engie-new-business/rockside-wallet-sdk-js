export declare function getRandomValues(arr: Uint8Array): Uint8Array;
export declare function pbkdf2(password: ArrayBuffer, salt: ArrayBuffer, iterations: number): Promise<ArrayBuffer>;
export declare function encryptAESCBC(privateKey: ArrayBuffer, iv: ArrayBuffer, data: ArrayBuffer): Promise<ArrayBuffer>;
export declare function decryptAESCBC(privateKey: ArrayBuffer, iv: ArrayBuffer, data: ArrayBuffer): Promise<ArrayBuffer>;
export declare function sha512(data: ArrayBuffer): Promise<ArrayBuffer>;
