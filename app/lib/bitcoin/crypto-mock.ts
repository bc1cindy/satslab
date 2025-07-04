// Mock implementation for Bitcoin crypto functions
export interface BitcoinKeyPair {
  privateKey: string
  publicKey: string
  address: string
  network: any
}

export function generateKeyPair(network?: any): BitcoinKeyPair {
  return {
    privateKey: 'mock_private_key_' + Math.random().toString(36).substring(7),
    publicKey: 'mock_public_key_' + Math.random().toString(36).substring(7),
    address: 'tb1q' + Math.random().toString(36).substring(7),
    network: 'signet'
  }
}

export function keyPairFromWIF(wif: string, network?: any): BitcoinKeyPair {
  return {
    privateKey: wif,
    publicKey: 'mock_public_key_from_wif',
    address: 'tb1qmockaddressfromwif',
    network: network || 'signet'
  }
}

export function validatePrivateKey(privateKey: string, network?: any): boolean {
  return privateKey.length > 10 // Basic validation
}

export function signMessage(message: string, privateKey: string, network?: any): string {
  return 'mock_signature_' + Math.random().toString(36)
}

export function verifySignature(message: string, signature: string, publicKey: string): boolean {
  return signature.startsWith('mock_signature_')
}

export const SIGNET_NETWORK = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}