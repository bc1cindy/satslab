import { Question, Task, BadgeTemplate } from '@/app/types'

export const module3Data = {
  id: 3,
  title: "Transações na Signet",
  description: "Aprenda a criar e enviar transações Bitcoin, entender taxas e usar OP_RETURN",
  objectives: [
    "Entender como funcionam as taxas de transação",
    "Aprender a relação entre taxas e tempo de confirmação",
    "Praticar envio de transações na Signet",
    "Descobrir o que é OP_RETURN e suas aplicações",
    "Criar sua primeira transação com dados personalizados"
  ],
  requiresLogin: true,
  difficulty: "Intermediário"
}

export const module3Questions: Question[] = [
  {
    id: 1,
    question: "O que é uma taxa de transação no Bitcoin?",
    options: [
      "Um imposto cobrado pelo governo",
      "Uma taxa fixa determinada pela rede",
      "Um incentivo para mineradores incluírem a transação em um bloco",
      "Uma penalidade por usar a rede"
    ],
    correctAnswer: 2,
    explanation: "As taxas de transação são um incentivo econômico para os mineradores incluírem sua transação em um bloco. Quanto maior a taxa, mais atrativa sua transação se torna para os mineradores."
  },
  {
    id: 2,
    question: "Como as taxas afetam o tempo de confirmação?",
    options: [
      "Taxas mais altas aceleram a confirmação",
      "Taxas mais baixas aceleram a confirmação",
      "Taxas não afetam o tempo de confirmação",
      "Apenas o tamanho da transação importa"
    ],
    correctAnswer: 0,
    explanation: "Taxas mais altas incentivam mineradores a priorizarem sua transação. Em períodos de alta demanda, transações com taxas baixas podem demorar horas ou dias para serem confirmadas."
  },
  {
    id: 3,
    question: "Para que serve o OP_RETURN em transações Bitcoin?",
    options: [
      "Para cancelar transações",
      "Para armazenar pequenos dados na blockchain",
      "Para acelerar confirmações",
      "Para reduzir taxas de transação"
    ],
    correctAnswer: 1,
    explanation: "O OP_RETURN permite incluir até 80 bytes de dados arbitrários em uma transação Bitcoin. É usado para timestamps, certificados, mensagens e outras aplicações que precisam de prova imutável."
  }
]

export const module3Tasks: Task[] = [
  {
    id: 1,
    title: "Enviar Transação com Seleção de Taxa",
    description: "Envie 0.005 sBTC para outro endereço usando diferentes níveis de taxa.",
    instructions: [
      "Use sua carteira Signet do módulo anterior",
      "Insira o endereço de destino: tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
      "Defina o valor: 0.005 sBTC",
      "Escolha um nível de taxa: Alta (10 sat/vB), Média (5 sat/vB), ou Baixa (2 sat/vB)",
      "Envie a transação e copie o ID da transação"
    ],
    type: "transaction" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Cole o ID da transação (txid) aqui",
      expectedLength: 64
    },
    hints: [
      "Use o explorador para verificar se a transação foi enviada",
      "Taxas altas são processadas mais rapidamente",
      "O ID da transação tem 64 caracteres hexadecimais",
      "Você pode acompanhar a confirmação no mempool.space/signet"
    ]
  },
  {
    id: 2,
    title: "Criar Transação OP_RETURN",
    description: "Crie uma transação que inclui a mensagem 'Eu amo Bitcoin' usando OP_RETURN.",
    instructions: [
      "Use o construtor de transações OP_RETURN",
      "Digite a mensagem: 'Eu amo Bitcoin'",
      "Selecione uma taxa apropriada (recomendado: 5 sat/vB)",
      "Revise os dados que serão gravados na blockchain",
      "Envie a transação e copie o ID"
    ],
    type: "transaction" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Cole o ID da transação OP_RETURN aqui",
      expectedLength: 64
    },
    hints: [
      "OP_RETURN torna dados não-gastáveis (unspendable)",
      "Sua mensagem ficará permanentemente na blockchain",
      "O custo é mínimo (apenas a taxa de transação)",
      "Use o explorador para verificar os dados da transação"
    ]
  }
]

export const module3Badge: BadgeTemplate = {
  name: "Mensageiro da Blockchain",
  description: "Enviou transações e gravou dados permanentemente na blockchain Bitcoin",
  type: "virtual" as const,
  imageUrl: "/badges/blockchain-messenger.png"
}