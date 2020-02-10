import { Wallet } from '../src/wallet';

describe('wallet', () => {
  it('should create a random private key', () => {
    const wallet = Wallet.createRandom();

    expect(wallet.getWords().split(' ')).toHaveLength(12);
  });

  it('should recover existing key', () => {
    const words = 'glove dial front cost prefer habit scrap kid title mercy nuclear tortoise reflect jazz maze';
    const wallet = Wallet.recoverFromMnemonic(words);

    expect(wallet.getAddress()).toEqual('0x6f32e2588C7C2Ab80ceCf49562CAD748409dCBa7');
    expect(wallet.getPrivateKey().toString('hex')).toEqual('bb8e31c72ca8e73d7875e6f4c7e32a5cae14327bada7de5db68360ab40b14c2e');
    expect(wallet.getPublicKey().toString('hex')).toEqual('441804e2f7417b78de1fb6d23032adcefb47b96a4c76c136116a019af0ff292986ff9b407bcb310f5add52d6cefdc98caba3b2fd19c75cbdce46a3bb16c6f173');
  });
});
