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
  externalLinks?: Array<{
    label: string
    url: string
  }>
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
  type: 'hash' | 'address' | 'amount' | 'api' | 'fee' | 'seed' | 'word' | 'inscription'
  placeholder?: string
  expectedLength?: number
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

// Advanced Bitcoin Types for Modules 6-7

export interface TaprootAddress {
  address: string
  privateKey: string
  publicKey: string
  internalKey: string
  network: string
}

export interface MultisigWallet {
  address: string
  redeemScript: string
  publicKeys: string[]
  m: number
  n: number
  type: 'p2sh' | 'p2wsh' | 'p2tr'
}

export interface HDWallet {
  mnemonic: string
  masterKey: any
  network: string
  fingerprint: string
}

export interface DerivedAddress {
  address: string
  privateKey: string
  publicKey: string
  path: string
  index: number
}

export interface OrdinalInscription {
  inscriptionId: string
  content: string
  contentType: string
  owner: string
  fee: number
  txId: string
  vout: number
}

export interface BadgeNFT {
  badge: string
  user_id: string
  timestamp: number
  network: string
  description?: string
  rarity?: 'common' | 'rare' | 'legendary'
  requirements?: string[]
  icon?: string
  color?: string
}