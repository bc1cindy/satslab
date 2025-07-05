import * as bitcoin from 'bitcoinjs-lib'
import { SIGNET_NETWORK } from './wallet-service'

export type AddressType = 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2wsh' | 'p2tr' | 'unknown'

export interface AddressInfo {
  isValid: boolean
  type: AddressType
  network: 'signet' | 'mainnet' | 'testnet' | 'regtest' | 'unknown'
  isSignet: boolean
  scriptPubKey?: string
  hash?: string
}

export interface ValidationResult {
  isValid: boolean
  reason?: string
  details?: AddressInfo
}

/**
 * Bitcoin Address Validator for SIGNET network
 * Provides comprehensive address validation and type detection
 */
export class AddressValidator {
  private static readonly SIGNET_PREFIXES = {
    BECH32: 'tb1',
    P2PKH: ['m', 'n'],
    P2SH: '2'
  }

  private static readonly MAINNET_PREFIXES = {
    BECH32: 'bc1',
    P2PKH: '1',
    P2SH: '3'
  }

  /**
   * Validates if an address is a valid SIGNET address
   * @param {string} address - The address to validate
   * @returns {boolean} True if valid SIGNET address
   */
  static isValidSignetAddress(address: string): boolean {
    try {
      // Try to decode the address for SIGNET network
      bitcoin.address.toOutputScript(address, SIGNET_NETWORK)
      
      // Additional checks for SIGNET-specific prefixes
      return this.hasSignetPrefix(address)
    } catch (error) {
      return false
    }
  }

  /**
   * Gets the type of a Bitcoin address
   * @param {string} address - The address to analyze
   * @returns {AddressType} The type of the address
   */
  static getAddressType(address: string): AddressType {
    try {
      // Try to decode and determine type
      const decoded = bitcoin.address.toOutputScript(address)
      
      // Check based on script pattern
      if (decoded.length === 25 && decoded[0] === 0x76 && decoded[1] === 0xa9) {
        return 'p2pkh' // OP_DUP OP_HASH160 <pubkeyhash> OP_EQUALVERIFY OP_CHECKSIG
      }
      
      if (decoded.length === 23 && decoded[0] === 0xa9 && decoded[22] === 0x87) {
        return 'p2sh' // OP_HASH160 <scripthash> OP_EQUAL
      }
      
      if (decoded.length === 22 && decoded[0] === 0x00 && decoded[1] === 0x14) {
        return 'p2wpkh' // OP_0 <20-byte-pubkey-hash>
      }
      
      if (decoded.length === 34 && decoded[0] === 0x00 && decoded[1] === 0x20) {
        return 'p2wsh' // OP_0 <32-byte-script-hash>
      }
      
      if (decoded.length === 34 && decoded[0] === 0x51 && decoded[1] === 0x20) {
        return 'p2tr' // OP_1 <32-byte-taproot-output>
      }
      
      return 'unknown'
    } catch (error) {
      // Try to determine from address format
      if (address.startsWith('bc1') || address.startsWith('tb1')) {
        if (address.length === 42) return 'p2wpkh'
        if (address.length === 62) return 'p2wsh'
        if (address.length === 62 && address.startsWith('bc1p')) return 'p2tr'
      }
      
      if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) {
        return 'p2pkh'
      }
      
      if (address.startsWith('3') || address.startsWith('2')) {
        return 'p2sh'
      }
      
      return 'unknown'
    }
  }

  /**
   * Validates a private key format
   * @param {string} privateKey - The private key to validate (hex or WIF)
   * @returns {boolean} True if valid private key
   */
  static validatePrivateKey(privateKey: string): boolean {
    try {
      // Check if it's a hex string (64 characters)
      if (/^[0-9a-fA-F]{64}$/.test(privateKey)) {
        const keyBuffer = Buffer.from(privateKey, 'hex')
        return keyBuffer.length === 32
      }
      
      // Check if it's a valid WIF format
      if (privateKey.length >= 51 && privateKey.length <= 52) {
        try {
          bitcoin.ECPair.fromWIF(privateKey, SIGNET_NETWORK)
          return true
        } catch (error) {
          return false
        }
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Gets comprehensive address information
   * @param {string} address - The address to analyze
   * @returns {AddressInfo} Detailed address information
   */
  static getAddressInfo(address: string): AddressInfo {
    try {
      const scriptPubKey = bitcoin.address.toOutputScript(address, SIGNET_NETWORK)
      
      return {
        isValid: true,
        type: this.getAddressType(address),
        network: this.detectNetwork(address),
        isSignet: this.hasSignetPrefix(address),
        scriptPubKey: scriptPubKey.toString('hex'),
        hash: this.extractHash(address)
      }
    } catch (error) {
      return {
        isValid: false,
        type: 'unknown',
        network: 'unknown',
        isSignet: false
      }
    }
  }

  /**
   * Validates an address with detailed results
   * @param {string} address - The address to validate
   * @param {boolean} requireSignet - Whether to require SIGNET network
   * @returns {ValidationResult} Detailed validation result
   */
  static validateAddress(address: string, requireSignet: boolean = true): ValidationResult {
    if (!address || typeof address !== 'string') {
      return {
        isValid: false,
        reason: 'Address is required and must be a string'
      }
    }

    if (address.length < 26 || address.length > 62) {
      return {
        isValid: false,
        reason: 'Address length is invalid'
      }
    }

    const addressInfo = this.getAddressInfo(address)
    
    if (!addressInfo.isValid) {
      return {
        isValid: false,
        reason: 'Invalid address format',
        details: addressInfo
      }
    }

    if (requireSignet && !addressInfo.isSignet) {
      return {
        isValid: false,
        reason: 'Address is not a SIGNET address',
        details: addressInfo
      }
    }

    return {
      isValid: true,
      details: addressInfo
    }
  }

  /**
   * Converts address to different formats if possible
   * @param {string} address - The source address
   * @param {AddressType} targetType - Target address type
   * @returns {string | null} Converted address or null if not possible
   */
  static convertAddress(address: string, targetType: AddressType): string | null {
    try {
      const addressInfo = this.getAddressInfo(address)
      if (!addressInfo.isValid || !addressInfo.scriptPubKey) {
        return null
      }

      const script = Buffer.from(addressInfo.scriptPubKey, 'hex')
      
      switch (targetType) {
        case 'p2wpkh':
          if (addressInfo.type === 'p2pkh') {
            // Convert P2PKH to P2WPKH
            const hash = script.slice(3, 23) // Extract the hash160
            return bitcoin.address.fromOutputScript(
              Buffer.concat([Buffer.from([0x00, 0x14]), hash]), 
              SIGNET_NETWORK
            )
          }
          break
          
        case 'p2pkh':
          if (addressInfo.type === 'p2wpkh') {
            // Convert P2WPKH to P2PKH
            const hash = script.slice(2, 22) // Extract the hash160
            return bitcoin.address.fromOutputScript(
              Buffer.concat([
                Buffer.from([0x76, 0xa9, 0x14]),
                hash,
                Buffer.from([0x88, 0xac])
              ]), 
              SIGNET_NETWORK
            )
          }
          break
          
        default:
          return null
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Checks if address has SIGNET-specific prefixes
   * @param {string} address - The address to check
   * @returns {boolean} True if has SIGNET prefix
   */
  private static hasSignetPrefix(address: string): boolean {
    // Bech32 SIGNET addresses start with 'tb1'
    if (address.startsWith(this.SIGNET_PREFIXES.BECH32)) {
      return true
    }
    
    // P2PKH SIGNET addresses start with 'm' or 'n'
    if (this.SIGNET_PREFIXES.P2PKH.some(prefix => address.startsWith(prefix))) {
      return true
    }
    
    // P2SH SIGNET addresses start with '2'
    if (address.startsWith(this.SIGNET_PREFIXES.P2SH)) {
      return true
    }
    
    return false
  }

  /**
   * Detects the network of an address
   * @param {string} address - The address to analyze
   * @returns {'signet' | 'mainnet' | 'testnet' | 'regtest' | 'unknown'} Network type
   */
  private static detectNetwork(address: string): 'signet' | 'mainnet' | 'testnet' | 'regtest' | 'unknown' {
    // SIGNET/Testnet addresses
    if (address.startsWith('tb1') || 
        address.startsWith('m') || 
        address.startsWith('n') || 
        address.startsWith('2')) {
      return 'signet' // We're treating testnet/signet as the same for simplicity
    }
    
    // Mainnet addresses
    if (address.startsWith('bc1') || 
        address.startsWith('1') || 
        address.startsWith('3')) {
      return 'mainnet'
    }
    
    return 'unknown'
  }

  /**
   * Extracts hash from address
   * @param {string} address - The address
   * @returns {string | undefined} The hash in hex format
   */
  private static extractHash(address: string): string | undefined {
    try {
      const script = bitcoin.address.toOutputScript(address, SIGNET_NETWORK)
      const type = this.getAddressType(address)
      
      switch (type) {
        case 'p2pkh':
          return script.slice(3, 23).toString('hex') // Extract hash160
        case 'p2sh':
          return script.slice(2, 22).toString('hex') // Extract script hash
        case 'p2wpkh':
          return script.slice(2, 22).toString('hex') // Extract pubkey hash
        case 'p2wsh':
          return script.slice(2, 34).toString('hex') // Extract script hash
        case 'p2tr':
          return script.slice(2, 34).toString('hex') // Extract taproot output
        default:
          return undefined
      }
    } catch (error) {
      return undefined
    }
  }

  /**
   * Validates multiple addresses at once
   * @param {string[]} addresses - Array of addresses to validate
   * @param {boolean} requireSignet - Whether to require SIGNET network
   * @returns {ValidationResult[]} Array of validation results
   */
  static validateAddresses(addresses: string[], requireSignet: boolean = true): ValidationResult[] {
    return addresses.map(address => this.validateAddress(address, requireSignet))
  }

  /**
   * Checks if two addresses are equivalent (same underlying script)
   * @param {string} address1 - First address
   * @param {string} address2 - Second address
   * @returns {boolean} True if addresses are equivalent
   */
  static areAddressesEquivalent(address1: string, address2: string): boolean {
    try {
      const script1 = bitcoin.address.toOutputScript(address1, SIGNET_NETWORK)
      const script2 = bitcoin.address.toOutputScript(address2, SIGNET_NETWORK)
      
      return script1.equals(script2)
    } catch (error) {
      return false
    }
  }

  /**
   * Formats address for display
   * @param {string} address - The address to format
   * @param {number} maxLength - Maximum length for display
   * @returns {string} Formatted address
   */
  static formatAddressForDisplay(address: string, maxLength: number = 16): string {
    if (!address || address.length <= maxLength) {
      return address
    }
    
    const prefixLength = Math.floor(maxLength / 2) - 1
    const suffixLength = maxLength - prefixLength - 3
    
    return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
  }
}