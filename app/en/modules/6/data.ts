import { Question } from '@/app/types'

export const module6Data = {
  id: 6,
  title: "Taproot and Inscriptions",
  description: "Explore advanced Bitcoin features: Taproot for privacy and Inscriptions for NFTs",
  objectives: [
    "Understand the Taproot protocol and its advantages",
    "Learn about Inscriptions and how NFTs work on Bitcoin",
    "Create Taproot transactions on the Signet network",
    "Mint an Inscription NFT Badge",
    "Analyze the impact of fees on data-heavy transactions"
  ],
  requiresLogin: true,
  difficulty: "Advanced"
}

export const module6Questions: Question[] = [
  {
    id: 1,
    question: "What is Taproot?",
    options: [
      "A type of Bitcoin wallet",
      "A Bitcoin protocol improvement that enhances privacy and efficiency using Schnorr signatures",
      "A block explorer",
      "A mining algorithm"
    ],
    correctAnswer: 1,
    explanation: "Taproot is a Bitcoin protocol upgrade that introduces Schnorr signatures, enabling more efficient and private transactions. It also enables more complex smart contracts while maintaining the appearance of simple transactions."
  },
  {
    id: 2,
    question: "What are Inscriptions?",
    options: [
      "Regular Bitcoin transactions",
      "NFTs created on individual satoshis using the Taproot protocol",
      "A type of special address",
      "Fungible tokens on Bitcoin"
    ],
    correctAnswer: 1,
    explanation: "Inscriptions are unique NFTs created by inscribing data onto individual satoshis. Each satoshi can carry arbitrary data (images, text, code) making it a non-fungible token native to Bitcoin."
  },
  {
    id: 3,
    question: "How do fees affect Inscriptions transactions?",
    options: [
      "Inscriptions don't pay fees",
      "Fees are fixed regardless of size",
      "Fees depend on the size of data inscribed in the Inscription",
      "Inscriptions have lower fees than normal transactions"
    ],
    correctAnswer: 2,
    explanation: "Fees for Inscriptions depend directly on the size of the inscribed data. The larger the file (image, JSON, etc.), the higher the fee needed to include the transaction in a block."
  }
]

export const module6Tasks = [
  {
    id: 1,
    title: "Create Taproot Transaction",
    description: "Create a transaction using a Taproot address (bc1p...) on the Signet network",
    instructions: [
      "Use the Taproot transaction creation tool",
      "Generate a Taproot address (starts with bc1p...)",
      "Create a transaction sending 0.001 sBTC to the address",
      "Confirm the transaction on mempool.space/signet"
    ],
    type: "transaction" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Paste the Taproot transaction hash",
      expectedLength: 64
    },
    hints: [
      "Taproot addresses start with 'bc1p' on mainnet or 'tb1p' on signet",
      "Use the module's transaction creation interface",
      "Verify on the explorer that the transaction was confirmed"
    ]
  },
  {
    id: 2,
    title: "Mint Inscription Badge",
    description: "Create an Inscription NFT Badge with your data using the Inscriptions protocol",
    instructions: [
      "Use the InscriptionsCreator to create an NFT Badge",
      "Insert the JSON: {\"badge\": \"Taproot Pioneer\", \"user_id\": \"your_public_key\"}",
      "Confirm the mint on the Signet network",
      "Copy the created Inscription ID"
    ],
    type: "inscription" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Paste the Inscription ID (inscription ID)",
      expectedLength: 66
    },
    hints: [
      "The Inscription ID is in format: txid:vout (e.g., abc123...def:0)",
      "Use exactly the JSON provided in the instructions",
      "Wait for confirmation in mempool before submitting"
    ]
  }
]

export const module6Badge = {
  name: "Taproot Pioneer",
  description: "Mastered Taproot and created your first Inscription NFT Badge on Bitcoin",
  type: "ordinal" as const,
  moduleId: 6,
  imageUrl: "/badges/taproot-pioneer.png"
}