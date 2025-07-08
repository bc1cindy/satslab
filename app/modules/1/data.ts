import { Question } from '@/app/types'

export const module1Data = {
  id: 1,
  title: "Introdução ao Bitcoin e Signet",
  description: "Aprenda os conceitos fundamentais do Bitcoin e explore a rede Signet",
  objectives: [
    "Entender o que é uma blockchain e como funciona",
    "Conhecer a diferença entre mainnet, testnet e Signet",
    "Explorar transações usando o mempool.space",
    "Interpretar dados de transações Bitcoin",
    "Compreender o papel de faucets na rede Signet"
  ],
  requiresLogin: false,
  estimatedTime: "30 minutos",
  difficulty: "Iniciante"
}

export const module1Questions: Question[] = [
  {
    id: 1,
    question: "O que é uma blockchain?",
    options: [
      "Um tipo de criptomoeda",
      "Um software de mineração",
      "Um livro-razão distribuído e imutável",
      "Uma carteira digital"
    ],
    correctAnswer: 2,
    explanation: "Uma blockchain é um livro-razão distribuído que registra transações de forma cronológica e imutável. Cada bloco contém um conjunto de transações e está ligado ao bloco anterior através de criptografia."
  },
  {
    id: 2,
    question: "Qual é a principal diferença entre mainnet e Signet?",
    options: [
      "Signet é mais rápida que a mainnet",
      "Mainnet usa Bitcoin real, Signet usa Bitcoin de teste",
      "Signet tem taxas mais altas",
      "Não há diferença significativa"
    ],
    correctAnswer: 1,
    explanation: "A mainnet é a rede Bitcoin principal onde circula Bitcoin real com valor econômico. A Signet é uma rede de teste que usa Bitcoin sem valor (sBTC) para experimentação e aprendizado."
  },
  {
    id: 3,
    question: "O que é um faucet na rede Signet?",
    options: [
      "Um tipo de carteira especial",
      "Um serviço que distribui sBTC gratuito para testes",
      "Um explorador de blocos",
      "Um protocolo de mineração"
    ],
    correctAnswer: 1,
    explanation: "Um faucet é um serviço que distribui pequenas quantidades de sBTC (Bitcoin de teste) gratuitamente para desenvolvedores e usuários poderem experimentar com transações sem risco financeiro."
  },
  {
    id: 4,
    question: "Por que a transparência da blockchain é importante?",
    options: [
      "Para acelerar as transações",
      "Para permitir auditoria e verificação independente",
      "Para reduzir as taxas",
      "Para facilitar a mineração"
    ],
    correctAnswer: 1,
    explanation: "A transparência permite que qualquer pessoa verifique transações de forma independente, criando um sistema sem necessidade de confiança em autoridades centrais. Isso é fundamental para a descentralização do Bitcoin."
  }
]

export const module1Tasks = [
  {
    id: 1,
    title: "Explore o Mempool Signet",
    description: "Acesse o explorador mempool.space/signet e encontre uma transação recente.",
    instructions: [
      "Acesse https://mempool.space/signet",
      "Observe os blocos recentes na página inicial",
      "Clique em uma transação (tx) listada",
      "Copie o hash da transação (64 caracteres hexadecimais)"
    ],
    type: "explorer" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Cole aqui o hash da transação (ex: a1b2c3d4...)",
      expectedLength: 64
    },
    hints: [
      "O hash é uma sequência de 64 caracteres (números e letras)",
      "Você pode encontrar transações na lista 'Recent Transactions'",
      "Certifique-se de estar no mempool.space/signet (não no principal)"
    ]
  },
  {
    id: 2,
    title: "Interpretar uma Transação",
    description: "Escolha QUALQUER transação nova no explorador e aprenda a identificar valores transferidos.",
    instructions: [
      "Acesse mempool.space/signet e escolha uma transação DIFERENTE da anterior",
      "Na página da transação, localize a seção 'Outputs' (saídas)",
      "Some TODOS os valores listados nos outputs",
      "Digite a SOMA TOTAL de todos os outputs (ex: se há 3 outputs de 0.01, 0.02 e 0.03, digite 0.06)"
    ],
    type: "explorer" as const,
    validation: {
      type: "amount" as const,
      placeholder: "Soma total dos outputs em sBTC (ex: 0.06)"
    },
    hints: [
      "Esta é uma transação DIFERENTE da primeira tarefa - escolha qualquer uma nova",
      "Some TODOS os valores na seção 'Outputs', não apenas o maior",
      "O total dos outputs = input menos taxa de rede (fee)",
      "Exemplo: Output 1 (0.01) + Output 2 (0.02) = Total (0.03)",
      "Use ponto decimal, não vírgula (0.05 não 0,05)"
    ]
  }
]

export const module1Badge = {
  name: "Explorador Iniciante",
  description: "Completou a introdução ao Bitcoin e explorou sua primeira transação na Signet",
  type: "virtual" as const,
  moduleId: 1,
  imageUrl: "/badges/explorer-beginner.png"
}