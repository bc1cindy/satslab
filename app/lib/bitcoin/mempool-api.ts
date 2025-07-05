const MEMPOOL_API_BASE = 'https://mempool.space/signet/api'

export interface Transaction {
  txid: string
  version: number
  locktime: number
  vin: TransactionInput[]
  vout: TransactionOutput[]
  size: number
  weight: number
  fee: number
  status: {
    confirmed: boolean
    block_height?: number
    block_hash?: string
    block_time?: number
  }
}

export interface TransactionInput {
  txid: string
  vout: number
  prevout: {
    scriptpubkey: string
    scriptpubkey_asm: string
    scriptpubkey_type: string
    scriptpubkey_address?: string
    value: number
  }
  scriptsig: string
  scriptsig_asm: string
  witness: string[]
  is_coinbase: boolean
  sequence: number
}

export interface TransactionOutput {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  scriptpubkey_address?: string
  value: number
}

export interface BlockInfo {
  id: string
  height: number
  version: number
  timestamp: number
  tx_count: number
  size: number
  weight: number
  merkle_root: string
  previousblockhash: string
  mediantime: number
  nonce: number
  bits: number
  difficulty: number
}

export interface UTXO {
  txid: string
  vout: number
  value: number
  scriptPubKey: string
  address?: string
  status: {
    confirmed: boolean
    block_height?: number
    block_hash?: string
    block_time?: number
  }
}

export interface FeeEstimates {
  '1': number
  '2': number
  '3': number
  '4': number
  '5': number
  '6': number
  '10': number
  '20': number
  '144': number
  '504': number
  '1008': number
}

export class MempoolAPI {
  private static readonly MAX_RETRIES = 3
  private static readonly RETRY_DELAY = 1000

  static async getTransaction(txid: string): Promise<Transaction | null> {
    return this.withRetry(async () => {
      const response = await fetch(`${MEMPOOL_API_BASE}/tx/${txid}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    })
  }

  static async getRecentTransactions(count: number = 10): Promise<string[]> {
    try {
      const response = await fetch(`${MEMPOOL_API_BASE}/mempool/recent`)
      if (!response.ok) return []
      const transactions = await response.json()
      return transactions.slice(0, count)
    } catch (error) {
      console.error('Error fetching recent transactions:', error)
      return []
    }
  }

  static async getBlockInfo(height: number): Promise<BlockInfo | null> {
    try {
      const response = await fetch(`${MEMPOOL_API_BASE}/block-height/${height}`)
      if (!response.ok) return null
      const blockHash = await response.text()
      
      const blockResponse = await fetch(`${MEMPOOL_API_BASE}/block/${blockHash}`)
      if (!blockResponse.ok) return null
      
      return await blockResponse.json()
    } catch (error) {
      console.error('Error fetching block info:', error)
      return null
    }
  }

  static async getLatestBlockHeight(): Promise<number | null> {
    try {
      const response = await fetch(`${MEMPOOL_API_BASE}/blocks/tip/height`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('Error fetching latest block height:', error)
      return null
    }
  }

  static async validateTransaction(txid: string): Promise<boolean> {
    const transaction = await this.getTransaction(txid)
    return transaction !== null
  }

  static async getAddressInfo(address: string) {
    try {
      const response = await fetch(`${MEMPOOL_API_BASE}/address/${address}`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('Error fetching address info:', error)
      return null
    }
  }

  static formatSatoshis(satoshis: number): string {
    return (satoshis / 100000000).toFixed(8) + ' sBTC'
  }

  static formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  /**
   * Gets UTXOs for a given address
   * @param {string} address - The address to get UTXOs for
   * @returns {Promise<UTXO[]>} Array of UTXOs
   */
  static async getUTXOs(address: string): Promise<UTXO[]> {
    return this.withRetry(async () => {
      const response = await fetch(`${MEMPOOL_API_BASE}/address/${address}/utxo`)
      if (!response.ok) {
        if (response.status === 404) return []
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const utxos = await response.json()
      
      // Transform to our UTXO format
      return utxos.map((utxo: any) => ({
        txid: utxo.txid,
        vout: utxo.vout,
        value: utxo.value,
        scriptPubKey: utxo.scriptPubKey || '',
        address: address,
        status: utxo.status
      }))
    })
  }

  /**
   * Estimates fee for a given number of blocks
   * @param {number} blocks - Number of blocks for confirmation target
   * @returns {Promise<number>} Fee estimate in sat/vB
   */
  static async estimateFee(blocks: number): Promise<number> {
    return this.withRetry(async () => {
      const response = await fetch(`${MEMPOOL_API_BASE}/v1/fees/recommended`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const fees = await response.json()
      
      // Map block targets to recommended fees
      if (blocks <= 1) return fees.fastestFee
      if (blocks <= 3) return fees.halfHourFee
      if (blocks <= 6) return fees.hourFee
      return fees.economyFee
    })
  }

  /**
   * Gets detailed fee estimates for different block targets
   * @returns {Promise<FeeEstimates>} Fee estimates for different block targets
   */
  static async getFeeEstimates(): Promise<FeeEstimates> {
    return this.withRetry(async () => {
      const response = await fetch(`${MEMPOOL_API_BASE}/v1/fees/mempool-blocks`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const blocks = await response.json()
      
      // Extract fee estimates from mempool blocks
      const estimates: FeeEstimates = {
        '1': blocks[0]?.feeRange[0] || 20,
        '2': blocks[1]?.feeRange[0] || 15,
        '3': blocks[2]?.feeRange[0] || 10,
        '4': blocks[3]?.feeRange[0] || 8,
        '5': blocks[4]?.feeRange[0] || 6,
        '6': blocks[5]?.feeRange[0] || 5,
        '10': 4,
        '20': 3,
        '144': 2,
        '504': 1,
        '1008': 1
      }
      
      return estimates
    })
  }

  /**
   * Gets detailed transaction information with complete details
   * @param {string} txid - Transaction ID
   * @returns {Promise<Transaction | null>} Complete transaction details
   */
  static async getTransactionDetails(txid: string): Promise<Transaction | null> {
    return this.withRetry(async () => {
      const response = await fetch(`${MEMPOOL_API_BASE}/tx/${txid}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const tx = await response.json()
      
      // Enhance with additional details if needed
      return {
        ...tx,
        confirmations: tx.status?.confirmed 
          ? await this.getConfirmations(tx.status.block_height)
          : 0
      }
    })
  }

  /**
   * Gets transaction status (confirmed/unconfirmed)
   * @param {string} txid - Transaction ID
   * @returns {Promise<any>} Transaction status
   */
  static async getTransactionStatus(txid: string): Promise<any> {
    return this.withRetry(async () => {
      const response = await fetch(`${MEMPOOL_API_BASE}/tx/${txid}/status`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    })
  }

  /**
   * Gets address transaction history with pagination
   * @param {string} address - The address
   * @param {string} afterTxid - Transaction ID to start after (pagination)
   * @returns {Promise<Transaction[]>} Array of transactions
   */
  static async getAddressTransactions(address: string, afterTxid?: string): Promise<Transaction[]> {
    return this.withRetry(async () => {
      let url = `${MEMPOOL_API_BASE}/address/${address}/txs`
      if (afterTxid) {
        url += `/chain/${afterTxid}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 404) return []
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    })
  }

  /**
   * Gets current network statistics
   * @returns {Promise<any>} Network statistics
   */
  static async getNetworkStats(): Promise<any> {
    return this.withRetry(async () => {
      const response = await fetch(`${MEMPOOL_API_BASE}/statistics`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    })
  }

  /**
   * Gets mempool information
   * @returns {Promise<any>} Mempool info
   */
  static async getMempoolInfo(): Promise<any> {
    return this.withRetry(async () => {
      const response = await fetch(`${MEMPOOL_API_BASE}/mempool`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    })
  }

  /**
   * Broadcasts a transaction to the network
   * @param {string} txHex - Transaction hex string
   * @returns {Promise<string>} Transaction ID
   */
  static async broadcastTransaction(txHex: string): Promise<string> {
    return this.withRetry(async () => {
      const response = await fetch(`${MEMPOOL_API_BASE}/tx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: txHex
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Broadcast failed: ${errorText}`)
      }
      
      return await response.text()
    })
  }

  /**
   * Gets number of confirmations for a transaction
   * @param {number} blockHeight - Block height of the transaction
   * @returns {Promise<number>} Number of confirmations
   */
  private static async getConfirmations(blockHeight?: number): Promise<number> {
    if (!blockHeight) return 0
    
    const latestHeight = await this.getLatestBlockHeight()
    if (!latestHeight) return 0
    
    return latestHeight - blockHeight + 1
  }

  /**
   * Retry mechanism for API calls
   * @param {Function} fn - Function to retry
   * @param {number} retries - Number of retries remaining
   * @returns {Promise<any>} Result of the function
   */
  private static async withRetry<T>(fn: () => Promise<T>, retries: number = this.MAX_RETRIES): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries <= 0) {
        throw error
      }
      
      console.warn(`API call failed, retrying in ${this.RETRY_DELAY}ms... (${retries} retries left)`)
      await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY))
      return this.withRetry(fn, retries - 1)
    }
  }

  /**
   * Validates if a transaction exists in the mempool or blockchain
   * @param {string} txid - Transaction ID
   * @returns {Promise<boolean>} True if transaction exists
   */
  static async transactionExists(txid: string): Promise<boolean> {
    try {
      const tx = await this.getTransaction(txid)
      return tx !== null
    } catch (error) {
      return false
    }
  }

  /**
   * Gets raw transaction hex
   * @param {string} txid - Transaction ID
   * @returns {Promise<string | null>} Raw transaction hex
   */
  static async getRawTransaction(txid: string): Promise<string | null> {
    return this.withRetry(async () => {
      const response = await fetch(`${MEMPOOL_API_BASE}/tx/${txid}/hex`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.text()
    })
  }
}