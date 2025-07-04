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

export class MempoolAPI {
  static async getTransaction(txid: string): Promise<Transaction | null> {
    try {
      const response = await fetch(`${MEMPOOL_API_BASE}/tx/${txid}`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('Error fetching transaction:', error)
      return null
    }
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
}