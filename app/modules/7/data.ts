import { Question } from '@/app/types'

export const module7Data = {
  id: 7,
  title: "Carteiras Multisig",
  description: "Domine carteiras multisig para segurança avançada e transações colaborativas",
  objectives: [
    "Compreender carteiras multisig e seus casos de uso",
    "Aprender sobre diferentes tipos de multisig (P2SH, P2WSH, P2TR)",
    "Criar uma carteira multisig 2-de-3 funcional",
    "Assinar transações multisig colaborativamente",
    "Mintar um Ordinal NFT Badge usando multisig"
  ],
  requiresLogin: true,
  difficulty: "Avançado"
}

export const module7Questions: Question[] = [
  {
    id: 1,
    question: "O que é uma transação multisig?",
    options: [
      "Uma transação que envia para múltiplos endereços",
      "Uma transação que requer múltiplas assinaturas para ser válida",
      "Uma transação com múltiplas taxas",
      "Uma transação que usa múltiplos algoritmos"
    ],
    correctAnswer: 1,
    explanation: "Uma transação multisig requer um número específico de assinaturas de um conjunto de chaves para ser válida. Por exemplo, 2-de-3 significa que 2 das 3 chaves devem assinar a transação."
  },
  {
    id: 2,
    question: "Qual é a vantagem do Taproot para multisig?",
    options: [
      "Elimina completamente as taxas",
      "Faz transações multisig parecerem transações simples, reduzindo custos e melhorando privacidade",
      "Permite apenas multisig 2-de-3",
      "Torna multisig mais lento"
    ],
    correctAnswer: 1,
    explanation: "Taproot permite que transações multisig complexas pareçam transações simples na blockchain, reduzindo custos de transação e melhorando a privacidade dos usuários."
  },
  {
    id: 3,
    question: "Como as taxas afetam transações multisig?",
    options: [
      "Multisig sempre tem taxas fixas",
      "As taxas aumentam proporcionalmente ao tamanho da transação; Taproot reduz este custo",
      "Multisig não paga taxas",
      "As taxas são sempre menores que transações normais"
    ],
    correctAnswer: 1,
    explanation: "Transações multisig são maiores devido às múltiplas assinaturas, resultando em taxas mais altas. Taproot melhora isso ao fazer transações multisig complexas parecerem transações simples."
  }
]

export const module7Tasks = [
  {
    id: 1,
    title: "Criar Carteira Multisig 2-de-3",
    description: "Configure uma carteira multisig que requer 2 assinaturas de 3 chaves possíveis",
    instructions: [
      "Use o MultisigCreator para gerar 3 chaves públicas independentes",
      "Configure uma carteira 2-de-3 (2 assinaturas necessárias de 3 total)",
      "Gere o endereço multisig resultante",
      "Copie o endereço gerado"
    ],
    type: "wallet" as const,
    validation: {
      type: "address" as const,
      placeholder: "Cole o endereço multisig gerado"
    },
    hints: [
      "O endereço multisig pode começar com '3' (P2SH) ou 'bc1' (P2WSH)",
      "Certifique-se de que são 3 chaves públicas diferentes e independentes",
      "O threshold deve ser 2 (2 assinaturas necessárias)"
    ]
  },
  {
    id: 2,
    title: "Criar Transação Taproot Multisig",
    description: "Crie uma transação usando Taproot para multisig eficiente",
    instructions: [
      "Use o TaprootTransactionCreator para gerar endereço Taproot",
      "Configure uma transação multisig usando Taproot",
      "Observe como Taproot melhora privacidade e eficiência",
      "Copie o hash da transação criada"
    ],
    type: "transaction" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Cole o hash da transação Taproot",
      expectedLength: 64
    },
    hints: [
      "Taproot faz transações multisig parecerem transações simples",
      "Endereços Taproot começam com 'tb1p' na rede Signet",
      "Aproveite as vantagens de privacidade e eficiência do Taproot"
    ]
  },
  {
    id: 3,
    title: "Mintar Badge Multisig Ordinal",
    description: "Crie um Ordinal NFT Badge usando assinatura multisig",
    instructions: [
      "Use a carteira multisig criada anteriormente",
      "Crie um Ordinal com JSON: {\"badge\": \"Mestre Multisig\", \"user_id\": \"sua_chave_publica\"}",
      "Assine com pelo menos 2 das 3 chaves independentes",
      "Confirme o mint na rede Signet"
    ],
    type: "ordinal" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Cole o ID do Ordinal multisig",
      expectedLength: 64
    },
    hints: [
      "Você precisa de 2 assinaturas para completar a transação",
      "O Ordinal será associado ao endereço multisig",
      "Use o JSON exato fornecido nas instruções"
    ]
  }
]

export const module7Badge = {
  name: "Mestre Multisig",
  description: "Dominou carteiras multisig e tecnologias Taproot, criando NFT Badge com segurança avançada",
  type: "ordinal" as const,
  moduleId: 7,
  imageUrl: "/badges/multisig-master.png"
}