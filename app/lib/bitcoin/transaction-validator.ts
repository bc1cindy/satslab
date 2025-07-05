// Validation service for Bitcoin transactions on Signet
export interface TransactionData {
  txid: string
  status: {
    confirmed: boolean
    block_height?: number
    block_hash?: string
  }
  vout: Array<{
    value: number
    scriptpubkey_address?: string
  }>
  vin: Array<{
    prevout: {
      value: number
    }
  }>
  fee: number
  size: number
  weight: number
}

export interface ValidationResult {
  isValid: boolean
  message: string
  data?: TransactionData
  error?: string
}

class TransactionValidator {
  private baseUrl = 'https://mempool.space/signet/api'

  async validateTransactionHash(txid: string): Promise<ValidationResult> {
    try {
      // Basic validation of hash format
      if (!this.isValidTxId(txid)) {
        return {
          isValid: false,
          message: 'Hash inválido. Deve ter 64 caracteres hexadecimais.'
        }
      }

      // Fetch transaction from Mempool API
      const response = await fetch(`${this.baseUrl}/tx/${txid}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            isValid: false,
            message: 'Transação não encontrada. Verifique se o hash está correto e se é da rede Signet.'
          }
        }
        throw new Error(`API Error: ${response.status}`)
      }

      const txData: TransactionData = await response.json()

      return {
        isValid: true,
        message: 'Hash válido! Transação encontrada na rede Signet.',
        data: txData
      }

    } catch (error) {
      console.error('Error validating transaction:', error)
      return {
        isValid: false,
        message: 'Erro ao validar transação. Tente novamente.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async validateTransactionAmount(txid: string, expectedAmount: number): Promise<ValidationResult> {
    try {
      const hashValidation = await this.validateTransactionHash(txid)
      
      if (!hashValidation.isValid || !hashValidation.data) {
        return hashValidation
      }

      const txData = hashValidation.data
      
      // Find the largest output value (excluding change)
      const outputs = txData.vout.map(output => output.value / 100000000) // Convert satoshis to BTC
      const largestOutput = Math.max(...outputs)

      // Allow some tolerance for floating point precision
      const tolerance = 0.00000001
      const isAmountMatch = Math.abs(largestOutput - expectedAmount) <= tolerance

      if (isAmountMatch) {
        return {
          isValid: true,
          message: `Correto! A transação transfere ${largestOutput} sBTC.`,
          data: txData
        }
      } else {
        return {
          isValid: false,
          message: `Valor incorreto. A maior saída é ${largestOutput} sBTC, não ${expectedAmount} sBTC.`
        }
      }

    } catch (error) {
      console.error('Error validating amount:', error)
      return {
        isValid: false,
        message: 'Erro ao validar valor da transação.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private isValidTxId(txid: string): boolean {
    // Bitcoin transaction IDs are 64 character hex strings
    const hexRegex = /^[a-fA-F0-9]{64}$/
    return hexRegex.test(txid)
  }

  validateSignetAddress(address: string): ValidationResult {
    try {
      // Basic validation for Signet addresses
      if (!address || typeof address !== 'string') {
        return {
          isValid: false,
          message: 'Endereço inválido.'
        }
      }

      // Signet addresses start with 'tb1' (bech32) or 'm'/'n' (legacy)
      if (address.startsWith('tb1')) {
        // Bech32 validation (basic)
        if (address.length < 42 || address.length > 62) {
          return {
            isValid: false,
            message: 'Endereço Signet bech32 tem formato inválido.'
          }
        }
        
        // Check for valid bech32 characters
        const bech32Regex = /^tb1[a-zA-HJ-NP-Z0-9]+$/
        if (!bech32Regex.test(address)) {
          return {
            isValid: false,
            message: 'Endereço contém caracteres inválidos.'
          }
        }
        
        return {
          isValid: true,
          message: 'Endereço Signet válido!'
        }
      } else if (address.startsWith('m') || address.startsWith('n') || address.startsWith('2')) {
        // Legacy Signet addresses
        if (address.length < 26 || address.length > 35) {
          return {
            isValid: false,
            message: 'Endereço Signet legacy tem formato inválido.'
          }
        }
        
        return {
          isValid: true,
          message: 'Endereço Signet válido!'
        }
      } else {
        return {
          isValid: false,
          message: 'Endereço não é da rede Signet. Deve começar com "tb1", "m", "n" ou "2".'
        }
      }
      
    } catch (error) {
      return {
        isValid: false,
        message: 'Erro ao validar endereço.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get recent transactions for examples
  async getRecentTransactions(limit: number = 10): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/mempool/recent`)
      if (!response.ok) throw new Error('Failed to fetch recent transactions')
      
      const transactions = await response.json()
      return transactions.slice(0, limit).map((tx: any) => tx.txid)
    } catch (error) {
      console.error('Error fetching recent transactions:', error)
      return []
    }
  }

  // Get transaction examples with amounts for practice
  async getTransactionExamples(): Promise<Array<{txid: string, amount: number}>> {
    try {
      const recentTxids = await this.getRecentTransactions(5)
      const examples = []

      for (const txid of recentTxids) {
        try {
          const validation = await this.validateTransactionHash(txid)
          if (validation.isValid && validation.data) {
            const outputs = validation.data.vout.map(output => output.value / 100000000)
            const largestOutput = Math.max(...outputs)
            examples.push({ txid, amount: largestOutput })
          }
        } catch (error) {
          // Skip failed transactions
          continue
        }
      }

      return examples
    } catch (error) {
      console.error('Error getting transaction examples:', error)
      return []
    }
  }
}

export const transactionValidator = new TransactionValidator()