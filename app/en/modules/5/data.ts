import { Question } from '@/app/types'

export const module5Data = {
  id: 5,
  title: "Lightning Network",
  description: "Learn about the Lightning Network and make instant Bitcoin transactions",
  objectives: [
    "Understand the concept of scalability layers",
    "Set up a Lightning wallet (Phoenix or Breez)",
    "Make Lightning payments on the Signet network",
    "Understand channels and payment routing",
    "Analyze differences between on-chain and Lightning fees"
  ],
  requiresLogin: true,
  estimatedTime: "60 minutes",
  difficulty: "Intermediate"
}

export const module5Questions: Question[] = [
  {
    id: 1,
    question: "What is the Lightning Network?",
    options: [
      "A Bitcoin fork",
      "A scalability layer for Bitcoin",
      "A new mining protocol",
      "A Bitcoin wallet"
    ],
    correctAnswer: 1,
    explanation: "The Lightning Network is a second layer (Layer 2) solution that enables instant Bitcoin transactions with very low fees through off-chain payment channels."
  },
  {
    id: 2,
    question: "How do Lightning fees differ from on-chain fees?",
    options: [
      "They are always identical",
      "Lightning has higher fees",
      "Lightning has lower fees, based on routing",
      "Lightning has no fees"
    ],
    correctAnswer: 2,
    explanation: "Lightning fees are typically much lower than on-chain fees, being based on routing through channels. This enables viable micropayments that would be impractical on the main blockchain."
  }
]

export const module5Tasks = [
  {
    id: 1,
    title: "Generate Invoice in Integrated Wallet",
    description: "Use the integrated Lightning wallet to generate an invoice and receive a payment.",
    instructions: [
      "Go to the 'Wallet' tab in the 'Receive' section",
      "Enter an amount in satoshis (e.g., 1000)",
      "Add an optional description",
      "Click 'Generate Invoice'",
      "Observe the generated invoice and wait for the simulated payment"
    ],
    type: "lightning" as const,
    validation: {
      type: "address" as const,
      placeholder: "Generated Lightning invoice (e.g., lnbc1000u1p...)"
    },
    hints: [
      "The integrated wallet simulates receipt automatically",
      "Payment will arrive after a few seconds",
      "Copy the generated invoice for validation",
      "Observe the increase in wallet balance"
    ]
  },
  {
    id: 2,
    title: "Send Lightning Payment",
    description: "Make a Lightning transaction by sending satoshis through the integrated wallet.",
    instructions: [
      "Go to the 'Wallet' tab in the 'Send' section",
      "Enter an amount in satoshis",
      "Use the provided test invoice or paste a valid invoice",
      "Click 'Send Payment'",
      "Observe the routing process and confirmation"
    ],
    type: "lightning" as const,
    validation: {
      type: "transaction" as const,
      placeholder: "Lightning transaction hash or preimage"
    },
    hints: [
      "First generate an invoice in the 'Receive' section or use a valid invoice",
      "The transaction will be processed instantly",
      "The hash will appear in payment history",
      "Notice the low fee charged"
    ]
  },
  {
    id: 3,
    title: "Simulate Lightning Channel",
    description: "Use the channel simulator to understand how Lightning channels work.",
    instructions: [
      "Go to the 'Lightning Channel Simulator'",
      "Set channel capacity (e.g., 100,000 sats)",
      "Adjust Alice and Bob's contributions",
      "Open the channel and make some transactions",
      "Observe the 'Estimated Closing Fee' displayed in orange",
      "Use this value in satoshis to validate the task"
    ],
    type: "lightning" as const,
    validation: {
      type: "amount" as const,
      placeholder: "Estimated closing fee in satoshis"
    },
    hints: [
      "Channels allow multiple off-chain transactions",
      "Closing fee is based on channel capacity (approx. 0.1%)",
      "Experiment with different channel configurations",
      "Transactions within the channel are instant",
      "Look for the orange 'Estimated Closing Fee' section"
    ]
  }
]

export const module5Badge = {
  name: "Lightning Fast",
  description: "Mastered the Lightning Network and performed instant transactions",
  type: "virtual" as const,
  moduleId: 5,
  imageUrl: "/badges/lightning-fast.png"
}