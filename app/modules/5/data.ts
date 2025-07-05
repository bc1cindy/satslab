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
  estimatedTime: "60 minutos",
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
    title: "Configurar Carteira Lightning",
    description: "Configure a carteira Phoenix ou Breez para usar na rede Signet e receba fundos do faucet.",
    instructions: [
      "Baixe a carteira Phoenix (iOS/Android) ou Breez (iOS/Android/Desktop)",
      "Configure para usar a rede Signet (modo desenvolvedor)",
      "Gere um endereço Lightning",
      "Use o faucet starbackr.me para receber fundos de teste",
      "Confirme o recebimento dos fundos"
    ],
    type: "lightning" as const,
    validation: {
      type: "address" as const,
      placeholder: "Endereço Lightning ou invoice (ex: lnbc1...)"
    },
    hints: [
      "Phoenix: Vá em Configurações > Modo Desenvolvedor > Rede Signet",
      "Breez: Ative o modo desenvolvedor nas configurações",
      "O faucet starbackr.me funciona com endereços Lightning",
      "Guarde o endereço da carteira para validação"
    ]
  },
  {
    id: 2,
    title: "Enviar Pagamento Lightning",
    description: "Realize uma transação Lightning enviando 1000 satoshis para outro endereço.",
    instructions: [
      "Abra sua carteira Lightning configurada",
      "Gere um invoice ou use um endereço Lightning de teste",
      "Envie exatamente 1000 satoshis (0.00001 BTC)",
      "Observe a velocidade da transação (instantânea)",
      "Anote o hash da transação ou preimage"
    ],
    type: "lightning" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Hash da transação Lightning ou preimage",
      expectedLength: 64
    },
    hints: [
      "Transações Lightning são instantâneas",
      "O hash pode ser encontrado nos detalhes da transação",
      "Use o invoice de teste fornecido se não tiver outro destino",
      "A taxa será de apenas alguns satoshis"
    ]
  },
  {
    id: 3,
    title: "Fechar Canal e Observar Taxa",
    description: "Feche um canal Lightning e observe a taxa on-chain cobrada.",
    instructions: [
      "Identifique um canal ativo na sua carteira",
      "Inicie o processo de fechamento do canal",
      "Observe a taxa on-chain estimada para o fechamento",
      "Aguarde a confirmação na blockchain",
      "Compare a taxa com transações Lightning anteriores"
    ],
    type: "lightning" as const,
    validation: {
      type: "fee" as const,
      placeholder: "Taxa on-chain cobrada em satoshis"
    },
    hints: [
      "Fechamento de canal requer transação on-chain",
      "A taxa será significativamente maior que Lightning",
      "Processo pode levar alguns minutos para confirmar",
      "Use carteiras que mostram detalhes de taxa claramente"
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