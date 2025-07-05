import { Question } from '@/app/types'

export const module7Data = {
  id: 7,
  title: "Multisig e HD Wallets",
  description: "Domine carteiras multisig para segurança e HD wallets para gestão hierárquica de endereços",
  objectives: [
    "Compreender carteiras multisig e seus casos de uso",
    "Aprender sobre HD wallets e derivação hierárquica",
    "Criar uma carteira multisig 2-de-3 funcional",
    "Implementar derivação de endereços BIP32/BIP44",
    "Mintar um Ordinal NFT Badge usando multisig"
  ],
  requiresLogin: true,
  estimatedTime: "75 minutos",
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
    question: "O que é uma carteira HD (Hierarchical Deterministic)?",
    options: [
      "Uma carteira com alta definição",
      "Uma carteira que gera endereços de forma hierárquica a partir de uma seed",
      "Uma carteira apenas para desenvolvedores",
      "Uma carteira que requer hardware especial"
    ],
    correctAnswer: 1,
    explanation: "HD wallets geram endereços de forma determinística e hierárquica a partir de uma seed master. Seguem padrões como BIP32/BIP44 para derivação de chaves, permitindo backup e recuperação completa."
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
      "Use o MultisigCreator para gerar 3 chaves públicas",
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
      "Certifique-se de que são 3 chaves públicas diferentes",
      "O threshold deve ser 2 (2 assinaturas necessárias)"
    ]
  },
  {
    id: 2,
    title: "Criar HD Wallet e Derivar Endereços",
    description: "Implemente uma carteira HD e gere 2 endereços derivados",
    instructions: [
      "Use o HDWalletManager para criar uma carteira HD",
      "Gere uma seed mnemônica (12 palavras)",
      "Derive 2 endereços usando o path padrão BIP44",
      "Copie o segundo endereço derivado (índice 1)"
    ],
    type: "wallet" as const,
    validation: {
      type: "address" as const,
      placeholder: "Cole o segundo endereço derivado (índice 1)"
    },
    hints: [
      "Use o path de derivação padrão: m/44'/1'/0'/0/1",
      "O índice 1 é o segundo endereço da sequência",
      "Mantenha a seed segura para recuperação"
    ]
  },
  {
    id: 3,
    title: "Mintar Badge Multisig Ordinal",
    description: "Crie um Ordinal NFT Badge usando assinatura multisig",
    instructions: [
      "Use a carteira multisig criada anteriormente",
      "Crie um Ordinal com JSON: {\"badge\": \"Mestre Multisig\", \"user_id\": \"sua_chave_publica\"}",
      "Assine com pelo menos 2 das 3 chaves",
      "Confirme o mint na rede Signet"
    ],
    type: "ordinal" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Cole o ID do Ordinal multisig",
      expectedLength: 66
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
  description: "Dominou carteiras multisig e HD wallets, criando NFT Badge com segurança avançada",
  type: "ordinal" as const,
  moduleId: 7,
  imageUrl: "/badges/multisig-master.png"
}