export interface User {
  id: string
  publicKey: string
  progress: ModuleProgress[]
  badges: Badge[]
  createdAt: string
  updatedAt: string
}

export interface ModuleProgress {
  moduleId: number
  completed: boolean
  currentTask: number
  completedTasks: number[]
  score: number
  completedAt?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  moduleId: number
  type: 'virtual' | 'ordinal'
  imageUrl?: string
  ordinalId?: string
  earnedAt: string
}

export interface Module {
  id: number
  title: string
  description: string
  objectives: string[]
  requiresLogin: boolean
  tasks: Task[]
  questions: Question[]
  badge: BadgeTemplate
}

export interface Task {
  id: number
  title: string
  description: string
  instructions: string[]
  type: 'explorer' | 'transaction' | 'wallet' | 'mining' | 'lightning' | 'ordinal'
  validation: ValidationConfig
  hints?: string[]
}

export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface BadgeTemplate {
  name: string
  description: string
  type: 'virtual' | 'ordinal'
  imageUrl?: string
}

export interface ValidationConfig {
  type: 'api' | 'hash' | 'address' | 'amount' | 'fee'
  endpoint?: string
  expectedValue?: string | number
  tolerance?: number
}

export interface BitcoinWallet {
  address: string
  privateKey: string
  publicKey: string
  mnemonic: string
  network: 'signet' | 'testnet' | 'mainnet'
}

export interface Transaction {
  txId: string
  amount: number
  fee: number
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
  confirmations: number
  blockHeight?: number
}

export interface TransactionInput {
  txId: string
  outputIndex: number
  scriptSig: string
  sequence: number
}

export interface TransactionOutput {
  value: number
  scriptPubKey: string
  address?: string
}