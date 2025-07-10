import { Question, Task, BadgeTemplate } from '@/app/types'

export const module2Data = {
  id: 2,
  title: "Security and Wallets",
  description: "Learn about private keys, wallet security, and creating Bitcoin addresses",
  objectives: [
    "Understand the importance of private keys",
    "Learn to protect seed phrases",
    "Generate your first Bitcoin wallet on Signet",
    "Know the difference between hot wallets and cold wallets",
    "Practice good security practices"
  ],
  requiresLogin: true,
  estimatedTime: "45 minutes",
  difficulty: "Beginner"
}

export const module2Questions: Question[] = [
  {
    id: 1,
    question: "What is the main function of a private key?",
    options: [
      "Receive Bitcoin from other users",
      "Sign transactions and prove ownership",
      "Speed up transaction confirmation",
      "Reduce transaction fees"
    ],
    correctAnswer: 1,
    explanation: "The private key is used to digitally sign transactions, proving you have the right to spend the bitcoins associated with an address. Without it, you cannot move your funds."
  },
  {
    id: 2,
    question: "Why is it important to protect a seed phrase?",
    options: [
      "To speed up wallet synchronization",
      "To reduce transaction fees",
      "Because it controls access to all your funds",
      "To facilitate transaction backups"
    ],
    correctAnswer: 2,
    explanation: "The seed phrase is the 'master key' that can generate all your private keys. Anyone with access to it can completely control your bitcoins, so it must be kept in absolute secrecy."
  },
  {
    id: 3,
    question: "What is the difference between hot wallet and cold wallet?",
    options: [
      "Hot wallets are more expensive than cold wallets",
      "Cold wallets only work with Bitcoin, hot wallets accept various coins",
      "Hot wallets are online, cold wallets are offline",
      "There is no significant difference between them"
    ],
    correctAnswer: 2,
    explanation: "Hot wallets are connected to the internet (apps, extensions), offering convenience but higher risk. Cold wallets stay offline (hardware wallets, paper wallets), providing maximum security for large amounts."
  }
]

export const module2Tasks: Task[] = [
  {
    id: 1,
    title: "Generate Signet Wallet",
    description: "Create your first Bitcoin wallet on the Signet network and get free sBTC from the faucet.",
    instructions: [
      "Use the wallet generator to create a new Signet wallet",
      "Copy the generated address (starts with 'tb1')",
      "Access a Signet faucet (e.g., https://signet.bc-2.jp/)",
      "Paste your address in the faucet and request sBTC",
      "Wait a few minutes and verify that you received the funds"
    ],
    type: "wallet" as const,
    validation: {
      type: "address" as const,
      placeholder: "Paste your Signet wallet address here (tb1...)"
    },
    hints: [
      "Signet addresses start with 'tb1' (bech32)",
      "Keep your seed phrase in a safe place - you'll need it later",
      "Faucets may take a few minutes to send",
      "You can verify receipt at mempool.space/signet"
    ],
    externalLinks: [
      {
        label: "Signet Faucet",
        url: "https://signet.bc-2.jp/"
      },
      {
        label: "Verify Transaction",
        url: "https://mempool.space/signet"
      }
    ]
  },
  {
    id: 2,
    title: "Verify Faucet Transaction",
    description: "Use the blockchain explorer to verify that you received sBTC from the faucet to your wallet.",
    instructions: [
      "Use the integrated faucet below to request sBTC for your wallet",
      "Wait for transaction processing (about 30 seconds)",
      "Copy the transaction hash (TXID) generated",
      "Optionally, verify the transaction on mempool.space/signet explorer",
      "Paste the TXID in the field below to complete the task"
    ],
    type: "explorer" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Paste the transaction hash you received from the faucet (64 characters)"
    },
    hints: [
      "The faucet may take a few minutes to send",
      "Look for incoming transactions (inputs) to your address",
      "The transaction hash has exactly 64 hexadecimal characters",
      "If you haven't received it yet, wait a few more minutes and refresh the page"
    ],
    externalLinks: [
      {
        label: "Signet Explorer",
        url: "https://mempool.space/signet"
      }
    ]
  }
]

export const module2Badge: BadgeTemplate = {
  name: "Key Guardian",
  description: "Mastered Bitcoin security fundamentals and created your first wallet",
  type: "virtual" as const,
  imageUrl: "/badges/key-guardian.png"
}