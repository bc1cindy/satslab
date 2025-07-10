import { Question } from '@/app/types'

export const module7Data = {
  id: 7,
  title: "Multisig Wallets",
  description: "Master multisig wallets for advanced security and collaborative transactions",
  objectives: [
    "Understand multisig wallets and their use cases",
    "Learn about different multisig types (P2SH, P2WSH, P2TR)",
    "Create a functional 2-of-3 multisig wallet",
    "Sign multisig transactions collaboratively",
    "Mint an Ordinal NFT Badge using multisig"
  ],
  requiresLogin: true,
  estimatedTime: "60 minutes",
  difficulty: "Advanced"
}

export const module7Questions: Question[] = [
  {
    id: 1,
    question: "What is a multisig transaction?",
    options: [
      "A transaction that sends to multiple addresses",
      "A transaction that requires multiple signatures to be valid",
      "A transaction with multiple fees",
      "A transaction that uses multiple algorithms"
    ],
    correctAnswer: 1,
    explanation: "A multisig transaction requires a specific number of signatures from a set of keys to be valid. For example, 2-of-3 means that 2 of the 3 keys must sign the transaction."
  },
  {
    id: 2,
    question: "What is Taproot's advantage for multisig?",
    options: [
      "Completely eliminates fees",
      "Makes multisig transactions look like simple transactions, reducing costs and improving privacy",
      "Only allows 2-of-3 multisig",
      "Makes multisig slower"
    ],
    correctAnswer: 1,
    explanation: "Taproot allows complex multisig transactions to appear as simple transactions on the blockchain, reducing transaction costs and improving user privacy."
  },
  {
    id: 3,
    question: "How do fees affect multisig transactions?",
    options: [
      "Multisig always has fixed fees",
      "Fees increase proportionally to transaction size; Taproot reduces this cost",
      "Multisig doesn't pay fees",
      "Fees are always lower than normal transactions"
    ],
    correctAnswer: 1,
    explanation: "Multisig transactions are larger due to multiple signatures, resulting in higher fees. Taproot improves this by making complex multisig transactions appear as simple transactions."
  }
]

export const module7Tasks = [
  {
    id: 1,
    title: "Create 2-of-3 Multisig Wallet",
    description: "Set up a multisig wallet that requires 2 signatures from 3 possible keys",
    instructions: [
      "Use the MultisigCreator to generate 3 independent public keys",
      "Configure a 2-of-3 wallet (2 signatures required from 3 total)",
      "Generate the resulting multisig address",
      "Copy the generated address"
    ],
    type: "wallet" as const,
    validation: {
      type: "address" as const,
      placeholder: "Paste the generated multisig address"
    },
    hints: [
      "The multisig address can start with '3' (P2SH) or 'bc1' (P2WSH)",
      "Make sure to use 3 different and independent public keys",
      "The threshold should be 2 (2 signatures required)"
    ]
  },
  {
    id: 2,
    title: "Create Taproot Multisig Transaction",
    description: "Create a transaction using Taproot for efficient multisig",
    instructions: [
      "Use the TaprootTransactionCreator to generate Taproot address",
      "Configure a multisig transaction using Taproot",
      "Observe how Taproot improves privacy and efficiency",
      "Copy the hash of the created transaction"
    ],
    type: "transaction" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Paste the Taproot transaction hash",
      expectedLength: 64
    },
    hints: [
      "Taproot makes multisig transactions look like simple transactions",
      "Taproot addresses start with 'tb1p' on Signet network",
      "Take advantage of Taproot's privacy and efficiency benefits"
    ]
  },
  {
    id: 3,
    title: "Mint Multisig Ordinal Badge",
    description: "Create an Ordinal NFT Badge using multisig signature",
    instructions: [
      "Use the multisig wallet created earlier",
      "Create an Ordinal with JSON: {\"badge\": \"Multisig Master\", \"user_id\": \"your_public_key\"}",
      "Sign with at least 2 of the 3 independent keys",
      "Confirm the mint on the Signet network"
    ],
    type: "ordinal" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Paste the multisig Ordinal ID",
      expectedLength: 64
    },
    hints: [
      "You need 2 signatures to complete the transaction",
      "The Ordinal will be associated with the multisig address",
      "Use the exact JSON provided in the instructions"
    ]
  }
]

export const module7Badge = {
  name: "Multisig Master",
  description: "Mastered multisig wallets and Taproot technologies, creating NFT Badge with advanced security",
  type: "ordinal" as const,
  moduleId: 7,
  imageUrl: "/badges/multisig-master.png"
}