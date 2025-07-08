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
  // Generate consistent public key from private key
  const hash = simpleHash(wif)
  return {
    privateKey: wif,
    publicKey: 'mock_public_key_' + hash,
    address: 'tb1q' + hash,
    network: network || 'signet'
  }
}

// Simple hash function for consistent key generation
function simpleHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8)
}

export function validatePrivateKey(privateKey: string, network?: any): boolean {
  // Accept any string with reasonable length (minimum 8 characters)
  return !!(privateKey && privateKey.length >= 8)
}

export function signMessage(_message: string, _privateKey: string, _network?: any): string {
  return 'mock_signature_' + Math.random().toString(36)
}

export function verifySignature(_message: string, signature: string, _publicKey: string): boolean {
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