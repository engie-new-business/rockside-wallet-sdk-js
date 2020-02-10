# rockside-sdk-wallet

The Rockside Wallet SDK helps implementing a Wallet and integrating it with Rockside by providing following APIs :
* Create a HD wallet, handle recovery and signing
* Create a Rockside meta transaction signature

## Usage

### Generate a Wallet and sign a meta transaction

```typescript
    import { Wallet, executeMessageHash } from 'rockside-sdk-wallet';

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
	import { executeMessageTypedData } from 'rockside-sdk-wallet';

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
