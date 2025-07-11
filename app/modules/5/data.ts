import { Question } from '@/app/types'

export const module5Data = {
  id: 5,
  title: "Lightning Network",
  description: "Aprenda sobre a Lightning Network e faça transações instantâneas de Bitcoin",
  objectives: [
    "Entender o conceito de camadas de escalabilidade",
    "Configurar uma carteira Lightning (Phoenix ou Breez)",
    "Realizar pagamentos Lightning na rede Signet",
    "Compreender canais e roteamento de pagamentos",
    "Analisar diferenças entre taxas on-chain e Lightning"
  ],
  requiresLogin: true,
  difficulty: "Intermediário"
}

export const module5Questions: Question[] = [
  {
    id: 1,
    question: "O que é a Lightning Network?",
    options: [
      "Um fork do Bitcoin",
      "Uma camada de escalabilidade para Bitcoin",
      "Um novo protocolo de mineração",
      "Uma carteira de Bitcoin"
    ],
    correctAnswer: 1,
    explanation: "A Lightning Network é uma solução de segunda camada (Layer 2) que permite transações Bitcoin instantâneas e com taxas muito baixas através de canais de pagamento off-chain."
  },
  {
    id: 2,
    question: "Como as taxas Lightning diferem das taxas on-chain?",
    options: [
      "São sempre idênticas",
      "Lightning tem taxas mais altas",
      "Lightning tem taxas mais baixas, baseadas em roteamento",
      "Lightning não tem taxas"
    ],
    correctAnswer: 2,
    explanation: "As taxas Lightning são tipicamente muito menores que as on-chain, sendo baseadas no roteamento através dos canais. Isso permite micropagamentos viáveis que seriam impraticáveis na blockchain principal."
  }
]

export const module5Tasks = [
  {
    id: 1,
    title: "Gerar Invoice na Carteira Integrada",
    description: "Use a carteira Lightning integrada para gerar um invoice e receber um pagamento.",
    instructions: [
      "Vá para a aba 'Carteira' na seção 'Receber'",
      "Digite um valor em satoshis (ex: 1000)",
      "Adicione uma descrição opcional",
      "Clique em 'Gerar Invoice'",
      "Observe o invoice gerado e aguarde o pagamento simulado"
    ],
    type: "lightning" as const,
    validation: {
      type: "address" as const,
      placeholder: "Invoice Lightning gerado (ex: lnbc1000u1p...)"
    },
    hints: [
      "A carteira integrada simula o recebimento automaticamente",
      "O pagamento chegará após alguns segundos",
      "Copie o invoice gerado para validação",
      "Observe o aumento no saldo da carteira"
    ]
  },
  {
    id: 2,
    title: "Enviar Pagamento Lightning",
    description: "Realize uma transação Lightning enviando satoshis através da carteira integrada.",
    instructions: [
      "Vá para a aba 'Carteira' na seção 'Enviar'",
      "Digite um valor em satoshis",
      "Use o invoice de teste fornecido ou cole um invoice válido",
      "Clique em 'Enviar Pagamento'",
      "Observe o processo de roteamento e confirmação"
    ],
    type: "lightning" as const,
    validation: {
      type: "transaction" as const,
      placeholder: "Hash da transação Lightning ou preimage"
    },
    hints: [
      "Gere um invoice primeiro na seção 'Receber' ou use um invoice válido",
      "A transação será processada instantaneamente",
      "O hash aparecerá no histórico de pagamentos",
      "Observe a taxa baixa cobrada"
    ]
  },
  {
    id: 3,
    title: "Simular Canal Lightning",
    description: "Use o simulador de canais para entender como funcionam os canais Lightning.",
    instructions: [
      "Vá para o 'Simulador de Canais Lightning'",
      "Configure a capacidade do canal (ex: 100.000 sats)",
      "Ajuste a contribuição de Alice e Bob",
      "Abra o canal e realize algumas transações",
      "Observe a 'Taxa de Fechamento Estimada' exibida em laranja",
      "Use este valor em satoshis para validar a tarefa"
    ],
    type: "lightning" as const,
    validation: {
      type: "amount" as const,
      placeholder: "Taxa de fechamento estimada em satoshis"
    },
    hints: [
      "Canais permitem múltiplas transações off-chain",
      "A taxa de fechamento é baseada na capacidade do canal (aprox. 0.1%)",
      "Experimente diferentes configurações de canal",
      "Transações dentro do canal são instantâneas",
      "Procure pela seção laranja 'Taxa de Fechamento Estimada'"
    ]
  }
]

export const module5Badge = {
  name: "Raio Rápido",
  description: "Dominou a Lightning Network e realizou transações instantâneas",
  type: "virtual" as const,
  moduleId: 5,
  imageUrl: "/badges/lightning-fast.png"
}