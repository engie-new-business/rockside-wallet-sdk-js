import * as hasher from '../src/hash';

describe('executeMessageHash', () => {
  it('should return the correct hash', () => {
    const hash = hasher.executeMessageHash(
      { chainId: 3, verifyingContract: '0x3711d4b720577f0f5887989AaE5e26263Ed92999' },
      {
        signer: '0x502fce03af4bfd3dc991a6f7d0523cb920e1dbc8',
        to: '0x87ae49b6ffd2ea714fb08710ce5ccda5e490e07b',
        nonce: '0',
        data: '0x4b9f5c980000000000000000000000000000000000000000000000000000000000000001',
      }
    );

    expect(hash.toString('hex')).toEqual('878612b12d27bac071794589adac35b38287e2a8c6f702ad5dcde20a3c972dcd');
  });

  it('should return the correct hash for the execute transaction', () => {
    const hash = hasher.executeMessageHash(
      { chainId: 3, verifyingContract: '0xDb45eAB135582c7e7852a8E890B4495c9C1D822d' },
      {
        signer: '0x74f1a7370c8ed980b2fa53d25999931209b25f1c',
        to: '0x0000000000000000000000000000000000000000',
        data: '0x12',
        nonce: '0'
      }
    );

    expect(hash.toString('hex')).toEqual('34d30a1fa04582b8134f18d1419ea232ed1aae7008fff84c057ade34f14caa69');
  });

  it('should return the correct hash for the execute transaction with empty data', () => {
    const hash = hasher.executeMessageHash(
      { chainId: 3, verifyingContract: '0xDb45eAB135582c7e7852a8E890B4495c9C1D822d' },
      {
        signer: '0x74f1a7370c8ed980b2fa53d25999931209b25f1c',
        to: '0x0000000000000000000000000000000000000000',
        data: '',
        nonce: '0'
      }
    );

    expect(hash.toString('hex')).toEqual('327f539343f43a5929cc68c187454ca5e6749792db1b1f86b95ae8d9ad8e0f08');
  });
});

describe('executeMessageTypedData', () => {
  it('should return the typed data', () => {
    const typedData = hasher.executeMessageTypedData(
      { chainId: 3, verifyingContract: '0xDb45eAB135582c7e7852a8E890B4495c9C1D822d' },
      {
         signer: '0x74f1a7370c8ed980b2fa53d25999931209b25f1c',
        to: '0x0000000000000000000000000000000000000000',
        data: '0x12',
        nonce: '0'
      }
    );

    expect(typedData).toEqual({
      domain: {
        chainId: 3,
        verifyingContract: '0xDb45eAB135582c7e7852a8E890B4495c9C1D822d',
      },
      message: {
        signer: '0x74f1a7370c8ed980b2fa53d25999931209b25f1c',
        to: '0x0000000000000000000000000000000000000000',
        data: '0x12',
        nonce: '0'
      },
      primaryType: 'TxMessage',
      types: {
        TxMessage: [
          { name: "signer", type: "address" },
          { name: "to", type: "address" },
          { name: "data", type: "bytes" },
          { name: "nonce", type: "uint256" },
        ],
        EIP712Domain: [
          { name: 'verifyingContract', type: 'address' },
          { name: 'chainId', type: 'uint256' }
        ],
      },
    });
  });
});
