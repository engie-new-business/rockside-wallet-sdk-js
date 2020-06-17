import { keccak256 } from 'ethereumjs-util';
import { TypedDataUtils } from 'eth-sig-util';

export type RelayerDomain = {
  chainId: number,
  verifyingContract: string
};

export type TxMessage = {
  signer: string,
  to: string,
  value: number,
  data: string,
  nonce: string,
};

export type Create2Message = {
  relayer: string,
  signer: string,
  value: number,
  salt: number,
  initCode: string,
  gasLimit: number,
  gasPrice: number,
  nonce: string,
}

export type ExecuteTypedData = {
  types: {
    EIP712Domain: EIP712Type,
    TxMessage: EIP712Type,
  },
  message: TxMessage,
  primaryType: string,
  domain: RelayerDomain,
};

type EIP712Type = Array<{ name: string, type: string }>;

export type DeployTypedData = {
  types: {
    EIP712Domain: EIP712Type,
    Create2Message: EIP712Type,
  },
  message: Create2Message,
  primaryType: string,
  domain: RelayerDomain,
}

/* EIP712 type definitions */

const eip712DomainType = [
      { name: 'verifyingContract', type: 'address' },
      { name: 'chainId', type: 'uint256' }
];

const executeTxType = [
		{ name: "signer", type: "address" },
		{ name: "to", type: "address" },
		{ name: "value", type: "uint256" },
		{ name: "data", type: "bytes" },
		{ name: "nonce", type: "uint256" },
];

const create2MessageType = [
    { name: "relayer", type: "address"},
    { name: "signer", type: "address"},
    { name: "value", type: "uint256"},
    { name: "salt", type: "uint256"},
    { name: "initCode", type: "bytes"},
    { name: "gasLimit", type: "uint256"},
    { name: "gasPrice", type: "uint256"},
    { name: "nonce", type: "uint256"},
];

export function hashMessage<TMessage>(domain: RelayerDomain, typeName: string, type: EIP712Type, message: TMessage): Buffer {
  const encodedDomain = TypedDataUtils.encodeData(
    'EIP712Domain',
    domain,
    { EIP712Domain: eip712DomainType }
  );
  const hashedDomain = keccak256(encodedDomain);

  const messageTypes: Record<string, EIP712Type> = {};
  messageTypes[typeName] = type;

  const encodedMessage = TypedDataUtils.encodeData(
    typeName,
    message as Object,
    messageTypes,
  );
  const hashedMessage = keccak256(encodedMessage);

  return keccak256(
    Buffer.concat([
      Buffer.from('1901', 'hex'),
      hashedDomain,
      hashedMessage,
    ])
  );

}

export function executeMessageTypedData(domain: RelayerDomain, message: TxMessage): ExecuteTypedData {
  return {
    types: {
      EIP712Domain: eip712DomainType,
      TxMessage: executeTxType,
    },
    domain: domain,
    primaryType: 'TxMessage',
    message: message,
  };
}

export function executeMessageHash(domain: RelayerDomain, message: TxMessage): Buffer {
  return hashMessage(domain, 'TxMessage', executeTxType, message);
}

export function deployMessageTypedData(domain: RelayerDomain, message: Create2Message): DeployTypedData {
  return {
    types: {
      EIP712Domain: eip712DomainType,
      Create2Message: create2MessageType,
    },
    domain: domain,
    primaryType: 'Create2Message',
    message: message,
  };
}

export function deployMessageHash(domain: RelayerDomain, message: Create2Message): Buffer {
  return hashMessage(domain, 'Create2Message', create2MessageType, message);
}
