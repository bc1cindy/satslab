import { Question, Task, BadgeTemplate } from '@/app/types'

export const module3Data = {
  id: 3,
  title: "Signet Transactions",
  description: "Learn to create and send Bitcoin transactions, understand fees, and use OP_RETURN",
  objectives: [
    "Understand how transaction fees work",
    "Learn the relationship between fees and confirmation time",
    "Practice sending transactions on Signet",
    "Discover what OP_RETURN is and its applications",
    "Create your first transaction with custom data"
  ],
  requiresLogin: true,
  difficulty: "Intermediate"
}

export const module3Questions: Question[] = [
  {
    id: 1,
    question: "What is a transaction fee in Bitcoin?",
    options: [
      "A tax charged by the government",
      "A fixed fee determined by the network",
      "An incentive for miners to include the transaction in a block",
      "A penalty for using the network"
    ],
    correctAnswer: 2,
    explanation: "Transaction fees are an economic incentive for miners to include your transaction in a block. The higher the fee, the more attractive your transaction becomes to miners."
  },
  {
    id: 2,
    question: "How do fees affect confirmation time?",
    options: [
      "Higher fees speed up confirmation",
      "Lower fees speed up confirmation",
      "Fees don't affect confirmation time",
      "Only transaction size matters"
    ],
    correctAnswer: 0,
    explanation: "Higher fees incentivize miners to prioritize your transaction. During high demand periods, transactions with low fees may take hours or days to be confirmed."
  },
  {
    id: 3,
    question: "What is OP_RETURN used for in Bitcoin transactions?",
    options: [
      "To cancel transactions",
      "To store small data on the blockchain",
      "To speed up confirmations",
      "To reduce transaction fees"
    ],
    correctAnswer: 1,
    explanation: "OP_RETURN allows including up to 80 bytes of arbitrary data in a Bitcoin transaction. It's used for timestamps, certificates, messages, and other applications that need immutable proof."
  }
]

export const module3Tasks: Task[] = [
  {
    id: 1,
    title: "Send Transaction with Fee Selection",
    description: "Send 0.005 sBTC to another address using different fee levels.",
    instructions: [
      "Use your Signet wallet from the previous module",
      "Enter destination address: tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
      "Set amount: 0.005 sBTC",
      "Choose a fee level: High (10 sat/vB), Medium (5 sat/vB), or Low (2 sat/vB)",
      "Send the transaction and copy the transaction ID"
    ],
    type: "transaction" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Paste the transaction ID (txid) here",
      expectedLength: 64
    },
    hints: [
      "Use the explorer to verify the transaction was sent",
      "High fees are processed faster",
      "The transaction ID has 64 hexadecimal characters",
      "You can track confirmation on mempool.space/signet"
    ]
  },
  {
    id: 2,
    title: "Create OP_RETURN Transaction",
    description: "Create a transaction that includes the message 'I love Bitcoin' using OP_RETURN.",
    instructions: [
      "Use the OP_RETURN transaction builder",
      "Enter the message: 'I love Bitcoin'",
      "Select an appropriate fee (recommended: 5 sat/vB)",
      "Review the data that will be recorded on the blockchain",
      "Send the transaction and copy the ID"
    ],
    type: "transaction" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Paste the OP_RETURN transaction ID here",
      expectedLength: 64
    },
    hints: [
      "OP_RETURN makes data unspendable",
      "Your message will be permanently on the blockchain",
      "The cost is minimal (only the transaction fee)",
      "Use the explorer to verify the transaction data"
    ]
  }
]

export const module3Badge: BadgeTemplate = {
  name: "Blockchain Messenger",
  description: "Sent transactions and permanently recorded data on the Bitcoin blockchain",
  type: "virtual" as const,
  imageUrl: "/badges/blockchain-messenger.png"
}