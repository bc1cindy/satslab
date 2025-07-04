import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import ECPairFactory from 'ecpair'

bitcoin.initEccLib(ecc)
const ECPair = ECPairFactory(ecc)

export interface BitcoinKeyPair {
  privateKey: string
  publicKey: string
  address: string
  network: bitcoin.Network
}

export function generateKeyPair(network: bitcoin.Network = bitcoin.networks.testnet): BitcoinKeyPair {
  const keyPair = ECPair.makeRandom({ network })
  const { address } = bitcoin.payments.p2wpkh({ 
    pubkey: keyPair.publicKey, 
    network 
  })
  
  if (!address) {
    throw new Error('Failed to generate address')
  }
  
  return {
    privateKey: keyPair.toWIF(),
    publicKey: keyPair.publicKey.toString('hex'),
    address,
    network
  }
}

export function keyPairFromWIF(wif: string, network: bitcoin.Network = bitcoin.networks.testnet): BitcoinKeyPair {
  const keyPair = ECPair.fromWIF(wif, network)
  const { address } = bitcoin.payments.p2wpkh({ 
    pubkey: keyPair.publicKey, 
    network 
  })
  
  if (!address) {
    throw new Error('Failed to generate address from WIF')
  }
  
  return {
    privateKey: wif,
    publicKey: keyPair.publicKey.toString('hex'),
    address,
    network
  }
}

export function validatePrivateKey(privateKey: string, network: bitcoin.Network = bitcoin.networks.testnet): boolean {
  try {
    ECPair.fromWIF(privateKey, network)
    return true
  } catch {
    return false
  }
}

export function signMessage(message: string, privateKey: string, network: bitcoin.Network = bitcoin.networks.testnet): string {
  const keyPair = ECPair.fromWIF(privateKey, network)
  const messageHash = bitcoin.crypto.sha256(Buffer.from(message, 'utf8'))
  const signature = keyPair.sign(messageHash)
  return signature.toString('hex')
}

export function verifySignature(
  message: string, 
  signature: string, 
  publicKey: string
): boolean {
  try {
    const messageHash = bitcoin.crypto.sha256(Buffer.from(message, 'utf8'))
    const signatureBuffer = Buffer.from(signature, 'hex')
    const publicKeyBuffer = Buffer.from(publicKey, 'hex')
    
    return ecc.verify(messageHash, publicKeyBuffer, signatureBuffer)
  } catch {
    return false
  }
}

export const SIGNET_NETWORK: bitcoin.Network = {
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