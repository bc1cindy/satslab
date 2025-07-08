import { Question, Task, BadgeTemplate } from '@/app/types'

export const module4Data = {
  id: 4,
  title: "Mineração no Bitcoin",
  description: "Aprenda como funciona a mineração Bitcoin e simule o processo de proof-of-work",
  objectives: [
    "Entender o conceito de prova de trabalho (proof-of-work)",
    "Compreender o papel dos mineradores na segurança da rede",
    "Simular o processo de mineração com algoritmo SHA-256",
    "Explorar pools de mineração e recompensas",
    "Analisar a relação entre dificuldade e tempo de bloco"
  ],
  requiresLogin: true,
  estimatedTime: "45 minutos",
  difficulty: "Intermediário"
}

export const module4Questions: Question[] = [
  {
    id: 1,
    question: "O que é a prova de trabalho no Bitcoin?",
    options: [
      "Um sistema de votação dos usuários",
      "Uma forma de validar identidades",
      "Um processo computacional para encontrar novos blocos",
      "Um mecanismo de distribuição de moedas"
    ],
    correctAnswer: 2,
    explanation: "A prova de trabalho é um mecanismo de consenso que requer que os mineradores gastem energia computacional para encontrar um hash válido que satisfaça a dificuldade da rede, garantindo a segurança e descentralização do Bitcoin."
  },
  {
    id: 2,
    question: "Como as taxas de transação beneficiam os mineradores?",
    options: [
      "Reduzem o custo da mineração",
      "Aumentam a velocidade dos blocos",
      "Fornecem recompensa adicional por incluir transações",
      "Diminuem a dificuldade da rede"
    ],
    correctAnswer: 2,
    explanation: "As taxas de transação são um incentivo econômico para os mineradores incluírem transações em seus blocos. Além da recompensa do bloco, os mineradores recebem todas as taxas das transações incluídas, criando um mercado de priorização."
  }
]

export const module4Tasks: Task[] = [
  {
    id: 1,
    title: "Simulador de Mineração",
    description: "Use o simulador para encontrar um hash válido com dificuldade baixa (4 zeros iniciais).",
    instructions: [
      "Inicie o simulador de mineração abaixo",
      "Observe o processo de tentativa e erro do algoritmo",
      "Aguarde até encontrar um hash que comece com '0000'",
      "Copie o hash encontrado e cole no campo abaixo"
    ],
    type: "mining" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Hash encontrado pelo simulador (64 caracteres)"
    },
    hints: [
      "O processo pode levar alguns segundos dependendo da sorte",
      "Cada tentativa gera um hash diferente incrementando o nonce",
      "Um hash válido deve começar com '0000' (4 zeros)",
      "O hash tem exatamente 64 caracteres hexadecimais"
    ]
  },
  {
    id: 2,
    title: "Simulação de Pool Mining",
    description: "Participe de uma simulação de pool mining por 5 minutos e observe as recompensas.",
    instructions: [
      "Inicie a simulação de pool mining abaixo",
      "Contribua com hashrate por 5 minutos",
      "Observe sua participação percentual no pool",
      "Anote as recompensas recebidas proporcionalmente e cole abaixo"
    ],
    type: "mining" as const,
    validation: {
      type: "amount" as const,
      placeholder: "Recompensa total em BTC (ex: 0.001234)"
    },
    hints: [
      "Pools distribuem recompensas baseadas na contribuição de hashrate",
      "Mesmo pequenas contribuições recebem recompensas regulares",
      "A simulação acelera o processo real de mineração",
      "Use o valor exato mostrado no simulador"
    ]
  }
]

export const module4Badge: BadgeTemplate = {
  name: "Minerador Aprendiz",
  description: "Completou simulações de mineração e entendeu o processo de proof-of-work",
  type: "virtual" as const,
  imageUrl: "/badges/mining-apprentice.png"
}