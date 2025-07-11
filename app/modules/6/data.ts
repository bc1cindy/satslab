import { Question } from '@/app/types'

export const module6Data = {
  id: 6,
  title: "Taproot e Inscrições",
  description: "Explore as funcionalidades avançadas do Bitcoin: Taproot para privacidade e Inscrições para NFTs",
  objectives: [
    "Compreender o protocolo Taproot e suas vantagens",
    "Aprender sobre Inscrições e como funcionam os NFTs em Bitcoin",
    "Criar transações Taproot na rede Signet",
    "Mintar uma Inscrição NFT Badge",
    "Analisar o impacto das taxas em transações com dados"
  ],
  requiresLogin: true,
  difficulty: "Avançado"
}

export const module6Questions: Question[] = [
  {
    id: 1,
    question: "O que é Taproot?",
    options: [
      "Um tipo de carteira Bitcoin",
      "Uma melhoria no protocolo Bitcoin que aumenta privacidade e eficiência usando assinaturas Schnorr",
      "Um explorador de blocos",
      "Um algoritmo de mineração"
    ],
    correctAnswer: 1,
    explanation: "Taproot é uma atualização do protocolo Bitcoin que introduz assinaturas Schnorr, permitindo transações mais eficientes e privadas. Também habilita contratos inteligentes mais complexos enquanto mantém a aparência de transações simples."
  },
  {
    id: 2,
    question: "O que são Inscrições?",
    options: [
      "Transações Bitcoin normais",
      "NFTs criados em satoshis individuais usando o protocolo Taproot",
      "Um tipo de endereço especial",
      "Tokens fungíveis no Bitcoin"
    ],
    correctAnswer: 1,
    explanation: "Inscrições são NFTs únicos criados inscrevendo dados em satoshis individuais. Cada satoshi pode carregar dados arbitrários (imagens, texto, código) tornando-se um token não-fungível nativo do Bitcoin."
  },
  {
    id: 3,
    question: "Como as taxas afetam transações com Inscrições?",
    options: [
      "Inscrições não pagam taxas",
      "As taxas são fixas independente do tamanho",
      "As taxas dependem do tamanho dos dados inscritos na Inscrição",
      "Inscrições têm taxas mais baixas que transações normais"
    ],
    correctAnswer: 2,
    explanation: "As taxas para Inscrições dependem diretamente do tamanho dos dados inscritos. Quanto maior o arquivo (imagem, JSON, etc.), maior será a taxa necessária para incluir a transação no bloco."
  }
]

export const module6Tasks = [
  {
    id: 1,
    title: "Criar Transação Taproot",
    description: "Crie uma transação usando endereço Taproot (bc1p...) na rede Signet",
    instructions: [
      "Use a ferramenta de criação de transações Taproot",
      "Gere um endereço Taproot (começa com bc1p...)",
      "Crie uma transação enviando 0.001 sBTC para o endereço",
      "Confirme a transação no mempool.space/signet"
    ],
    type: "transaction" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Cole o hash da transação Taproot",
      expectedLength: 64
    },
    hints: [
      "Endereços Taproot começam com 'bc1p' na mainnet ou 'tb1p' na signet",
      "Use a interface de criação de transações do módulo",
      "Verifique no explorador se a transação foi confirmada"
    ]
  },
  {
    id: 2,
    title: "Mintar Badge Inscrição",
    description: "Crie um Inscrição NFT Badge com seus dados usando o protocolo Inscrições",
    instructions: [
      "Use o InscriptionsCreator para criar um NFT Badge",
      "Insira o JSON: {\"badge\": \"Pioneiro Taproot\", \"user_id\": \"sua_chave_publica\"}",
      "Confirme o mint na rede Signet",
      "Copie o ID da Inscrição criada"
    ],
    type: "inscription" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Cole o ID da Inscrição (inscription ID)",
      expectedLength: 66
    },
    hints: [
      "O ID da Inscrição é formato: txid:vout (ex: abc123...def:0)",
      "Use exatamente o JSON fornecido nas instruções",
      "Aguarde a confirmação no mempool antes de submeter"
    ]
  }
]

export const module6Badge = {
  name: "Pioneiro Taproot",
  description: "Dominou Taproot e criou seu primeiro Inscrição NFT Badge no Bitcoin",
  type: "ordinal" as const,
  moduleId: 6,
  imageUrl: "/badges/taproot-pioneer.png"
}