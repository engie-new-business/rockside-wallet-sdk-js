# rockside-sdk-wallet

[![npm logo](https://nodei.co/npm/@rocksideio/rockside-wallet-sdk.png?mini=true)](https://www.npmjs.com/package/@rocksideio/rockside-wallet-sdk)

The Rockside Wallet SDK helps implementing a Wallet and integrating it with Rockside by providing following APIs :
* Create a HD wallet, handle recovery and signing
* Create a Rockside meta transaction signature
* Create a Rockside encrypted account

## Usage

### Requirements

Some of these examples require a __token__ to authenticate the user. See the [documenation](https://docs.rockside.io/) to get more information on how to retrieve those.

### Get a Web3 custom provider

This allows to have a transparent Web3 provider that relay all `eth_sendTransaction` through the given identity:

```typescript
    import { Rockside } from 'rockside-wallet-sdk';
    const rockside = new Rockside({ token: 'MY_TOKEN' });

    const wallet = await rockside.connectEncryptedWallet('username', 'password');
    const identity = await rockside.deployIdentity(wallet.getAddress());
    const provider = rockside.getProvider(wallet, identity.address);
    const web3 = new Web3(provider as any);
    const erc20 = new web3.eth.Contract(JSON.parse(erc20ABI), infos.erc20Address);
    const mybalance = await erc20.methods.balanceOf(identity.address).call();
```

### Create an encrypted wallet using Rockside

```typescript
    import { Rockside } from 'rockside-wallet-sdk';
    const rockside = new Rockside({ token: 'MY_TOKEN' });

    const wallet: Wallet = await rockside.createEncryptedWallet('username', 'password');

    wallet.sign(...);
```

### Connect to an existing encrypted wallet using Rockside

```typescript
    import { Rockside } from 'rockside-wallet-sdk';
    const rockside = new Rockside({ token: 'MY_TOKEN' });

    const wallet: Wallet = await rockside.connectEncryptedWallet('username', 'password');

    wallet.sign(...);
```

### Generate a Wallet and sign a meta transaction

```typescript
    import { Wallet, executeMessageHash } from 'rockside-wallet-sdk';

    const wallet = Wallet.createRandom();

    const domain = { chainId: 3, verifyingContract: '0x${IDENTITY_ADDRESS}' };
    const metatx = {
	signer: '0x0x6f32e2588C7C2Ab80ceCf49562CAD748409dCBa7',
	to: '0x6f32e2588C7C2Ab80ceCfFFFFFFFFFFFFFFFFFFF',
	value: 0,
	data: '0xabba',
	nonce: 0,
    };

    const hash = executeMessageHash(domain, metatx);
    const signature = await wallet.sign(hash);

    // console.log(signature);
```

### Use eth_signTypedData_v4 to sign a meta transaction using Metamask

```typescript
	import { executeMessageTypedData } from 'rockside-wallet-sdk';

	const signer = '0x0x6f32e2588C7C2Ab80ceCf49562CAD748409dCBa7';
	const domain = { chainId: 3, verifyingContract: '0x${IDENTITY_ADDRESS}' };
	const metatx = {
		signer,
		to: '0x6f32e2588C7C2Ab80ceCfFFFFFFFFFFFFFFFFFFF',
		value: 0,
		data: '0xabba',
		nonce: 0,
	};
	const provider = window.ethereum;
        const typedData = executeMessageTypedData(domain, metatx);
	signature = await new Promise((resolve, reject) => {
		provider.sendAsync({
			method: 'eth_signTypedData_v4',
			params: [signer, JSON.stringify(typedData)],
			from: signer,
		}, (err, result) => {
			if (err) { return reject(err); }
			return resolve(result.result);
		});
	});

	// console.log(signature);
```

## Run tests

First, install dev dependencies :

```
npm i -D
```

Then run tests

```shell
npm test
```
