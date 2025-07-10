import { Question, Task, BadgeTemplate } from '@/app/types'

export const module4Data = {
  id: 4,
  title: "Bitcoin Mining",
  description: "Learn how Bitcoin mining works and simulate the proof-of-work process",
  objectives: [
    "Understand the concept of proof-of-work",
    "Comprehend the role of miners in network security",
    "Simulate the mining process with SHA-256 algorithm",
    "Explore mining pools and rewards",
    "Analyze the relationship between difficulty and block time"
  ],
  requiresLogin: true,
  estimatedTime: "45 minutes",
  difficulty: "Intermediate"
}

export const module4Questions: Question[] = [
  {
    id: 1,
    question: "What is proof-of-work in Bitcoin?",
    options: [
      "A user voting system",
      "A way to validate identities",
      "A computational process to find new blocks",
      "A coin distribution mechanism"
    ],
    correctAnswer: 2,
    explanation: "Proof-of-work is a consensus mechanism that requires miners to spend computational energy to find a valid hash that meets the network's difficulty target, ensuring Bitcoin's security and decentralization."
  },
  {
    id: 2,
    question: "How do transaction fees benefit miners?",
    options: [
      "They reduce mining costs",
      "They increase block speed",
      "They provide additional reward for including transactions",
      "They decrease network difficulty"
    ],
    correctAnswer: 2,
    explanation: "Transaction fees are an economic incentive for miners to include transactions in their blocks. In addition to the block reward, miners receive all fees from included transactions, creating a prioritization market."
  }
]

export const module4Tasks: Task[] = [
  {
    id: 1,
    title: "Mining Simulator",
    description: "Use the simulator to find a valid hash with low difficulty (4 leading zeros).",
    instructions: [
      "Start the mining simulator below",
      "Observe the trial-and-error process of the algorithm",
      "Wait until you find a hash that starts with '0000'",
      "Copy the found hash and paste it in the field below"
    ],
    type: "mining" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Hash found by simulator (64 characters)"
    },
    hints: [
      "The process may take a few seconds depending on luck",
      "Each attempt generates a different hash by incrementing the nonce",
      "A valid hash must start with '0000' (4 zeros)",
      "The hash has exactly 64 hexadecimal characters"
    ]
  },
  {
    id: 2,
    title: "Pool Mining Simulation",
    description: "Participate in a pool mining simulation for 5 minutes and observe the rewards.",
    instructions: [
      "Start the pool mining simulation below",
      "Contribute hashrate for 5 minutes",
      "Observe your percentage participation in the pool",
      "Note the rewards received proportionally and paste below"
    ],
    type: "mining" as const,
    validation: {
      type: "amount" as const,
      placeholder: "Total reward in BTC (e.g., 0.001234)"
    },
    hints: [
      "Pools distribute rewards based on hashrate contribution",
      "Even small contributions receive regular rewards",
      "The simulation accelerates the real mining process",
      "Use the exact value shown in the simulator"
    ]
  }
]

export const module4Badge: BadgeTemplate = {
  name: "Mining Apprentice",
  description: "Completed mining simulations and understood the proof-of-work process",
  type: "virtual" as const,
  imageUrl: "/badges/mining-apprentice.png"
}