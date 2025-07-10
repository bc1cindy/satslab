import { Question } from '@/app/types'

export const module1Data = {
  id: 1,
  title: "Bitcoin and Signet Introduction",
  description: "Learn the fundamental concepts of Bitcoin and explore the Signet network",
  objectives: [
    "Understand what a blockchain is and how it works",
    "Know the difference between mainnet, testnet, and Signet",
    "Explore transactions using mempool.space",
    "Interpret Bitcoin transaction data",
    "Understand the role of faucets in the Signet network"
  ],
  requiresLogin: false,
  estimatedTime: "30 minutes",
  difficulty: "Beginner"
}

export const module1Questions: Question[] = [
  {
    id: 1,
    question: "What is a blockchain?",
    options: [
      "A type of cryptocurrency",
      "Mining software",
      "A distributed and immutable ledger",
      "A digital wallet"
    ],
    correctAnswer: 2,
    explanation: "A blockchain is a distributed ledger that records transactions chronologically and immutably. Each block contains a set of transactions and is linked to the previous block through cryptography."
  },
  {
    id: 2,
    question: "What is the main difference between mainnet and Signet?",
    options: [
      "Signet is faster than mainnet",
      "Mainnet uses real Bitcoin, Signet uses test Bitcoin",
      "Signet has higher fees",
      "There is no significant difference"
    ],
    correctAnswer: 1,
    explanation: "Mainnet is the main Bitcoin network where real Bitcoin with economic value circulates. Signet is a test network that uses worthless Bitcoin (sBTC) for experimentation and learning."
  },
  {
    id: 3,
    question: "What is a faucet on the Signet network?",
    options: [
      "A special type of wallet",
      "A service that distributes free sBTC for testing",
      "A block explorer",
      "A mining protocol"
    ],
    correctAnswer: 1,
    explanation: "A faucet is a service that distributes small amounts of sBTC (test Bitcoin) for free so developers and users can experiment with transactions without financial risk."
  },
  {
    id: 4,
    question: "Why is blockchain transparency important?",
    options: [
      "To speed up transactions",
      "To allow independent auditing and verification",
      "To reduce fees",
      "To facilitate mining"
    ],
    correctAnswer: 1,
    explanation: "Transparency allows anyone to verify transactions independently, creating a system without the need to trust central authorities. This is fundamental to Bitcoin's decentralization."
  }
]

export const module1Tasks = [
  {
    id: 1,
    title: "Explore Signet Mempool",
    description: "Access the mempool.space/signet explorer and find a recent transaction.",
    instructions: [
      "Go to https://mempool.space/signet",
      "Observe the recent blocks on the homepage",
      "Click on a listed transaction (tx)",
      "Copy the transaction hash (64 hexadecimal characters)"
    ],
    type: "explorer" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Paste the transaction hash here (e.g., a1b2c3d4...)",
      expectedLength: 64
    },
    hints: [
      "The hash is a 64-character sequence (numbers and letters)",
      "You can find transactions in the 'Recent Transactions' list",
      "Make sure you're on mempool.space/signet (not the main one)"
    ]
  },
  {
    id: 2,
    title: "Interpret a Transaction",
    description: "Choose ANY new transaction in the explorer and learn to identify transferred values.",
    instructions: [
      "Go to mempool.space/signet and choose a DIFFERENT transaction from the previous one",
      "On the transaction page, locate the 'Outputs' section",
      "Add up ALL the values listed in the outputs",
      "Enter the TOTAL SUM of all outputs (e.g., if there are 3 outputs of 0.01, 0.02, and 0.03, enter 0.06)"
    ],
    type: "explorer" as const,
    validation: {
      type: "amount" as const,
      placeholder: "Total sum of outputs in sBTC (e.g., 0.06)"
    },
    hints: [
      "This is a DIFFERENT transaction from the first task - choose any new one",
      "Add up ALL values in the 'Outputs' section, not just the largest",
      "Total outputs = input minus network fee",
      "Example: Output 1 (0.01) + Output 2 (0.02) = Total (0.03)",
      "Use decimal point, not comma (0.05 not 0,05)"
    ]
  }
]

export const module1Badge = {
  name: "Beginner Explorer",
  description: "Completed Bitcoin introduction and explored your first transaction on Signet",
  type: "virtual" as const,
  moduleId: 1,
  imageUrl: "/badges/explorer-beginner.png"
}