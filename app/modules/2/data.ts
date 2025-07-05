import { Question, Task, BadgeTemplate } from '@/app/types'

export const module2Data = {
  id: 2,
  title: "Segurança e Carteiras",
  description: "Aprenda sobre chaves privadas, segurança de carteiras e criação de endereços Bitcoin",
  objectives: [
    "Entender a importância das chaves privadas",
    "Aprender a proteger frases-semente (seed phrases)",
    "Gerar sua primeira carteira Bitcoin na Signet",
    "Compreender como funciona o sistema de login do SatsLab",
    "Praticar boas práticas de segurança"
  ],
  requiresLogin: true,
  estimatedTime: "45 minutos",
  difficulty: "Iniciante"
}

export const module2Questions: Question[] = [
  {
    id: 1,
    question: "Qual é a função principal de uma chave privada?",
    options: [
      "Receber Bitcoin de outros usuários",
      "Assinar transações e provar propriedade",
      "Acelerar a confirmação de transações",
      "Reduzir as taxas de transação"
    ],
    correctAnswer: 1,
    explanation: "A chave privada é usada para assinar transações digitalmente, provando que você tem o direito de gastar os bitcoins associados a um endereço. Sem ela, não é possível movimentar seus fundos."
  },
  {
    id: 2,
    question: "Por que é importante proteger uma frase-semente (seed phrase)?",
    options: [
      "Para acelerar sincronização da carteira",
      "Para reduzir taxas de transação",
      "Porque ela controla acesso a todos os seus fundos",
      "Para facilitar backup das transações"
    ],
    correctAnswer: 2,
    explanation: "A seed phrase é a 'chave mestra' que pode gerar todas as suas chaves privadas. Quem tiver acesso a ela pode controlar completamente seus bitcoins, por isso deve ser mantida em segredo absoluto."
  },
  {
    id: 3,
    question: "Como sua chave privada de login protege seu progresso no SatsLab?",
    options: [
      "Criptografando arquivos localmente",
      "Funcionando como backup na nuvem",
      "Identificando você de forma única e segura",
      "Sincronizando com outras carteiras"
    ],
    correctAnswer: 2,
    explanation: "Sua chave privada de login funciona como uma identidade digital única. Assim como uma chave privada Bitcoin prova que você possui certos fundos, ela prova que você é o dono daquele progresso educacional específico."
  }
]

export const module2Tasks: Task[] = [
  {
    id: 1,
    title: "Gerar Carteira Signet",
    description: "Crie sua primeira carteira Bitcoin na rede Signet e obtenha sBTC gratuito do faucet.",
    instructions: [
      "Use o gerador de carteiras para criar uma nova carteira Signet",
      "Copie o endereço gerado (começa com 'tb1')",
      "Acesse um faucet Signet (ex: https://signet.bc-2.jp/)",
      "Cole seu endereço no faucet e solicite sBTC",
      "Aguarde alguns minutos e verifique se recebeu os fundos"
    ],
    type: "wallet" as const,
    validation: {
      type: "address" as const,
      placeholder: "Cole aqui o endereço da sua carteira Signet (tb1...)"
    },
    hints: [
      "Endereços Signet começam com 'tb1' (bech32)",
      "Guarde sua seed phrase em local seguro - você precisará dela depois",
      "Faucets podem demorar alguns minutos para enviar",
      "Você pode verificar o recebimento no mempool.space/signet"
    ]
  },
  {
    id: 2,
    title: "Proteger Seed Phrase",
    description: "Gere e confirme o armazenamento seguro de uma frase-semente.",
    instructions: [
      "Use o gerador para criar uma nova seed phrase de 12 palavras",
      "Anote todas as palavras em ordem em papel físico",
      "Confirme que anotou corretamente selecionando palavras aleatórias",
      "Para finalizar, digite a primeira palavra da sua seed phrase"
    ],
    type: "wallet" as const,
    validation: {
      type: "address" as const,
      placeholder: "Digite a primeira palavra da sua seed phrase"
    },
    hints: [
      "Nunca compartilhe sua seed phrase com ninguém",
      "Anote em papel, não em arquivo digital",
      "Guarde em local seguro, protegido de fogo e água",
      "Algumas pessoas fazem múltiplas cópias em locais diferentes"
    ]
  }
]

export const module2Badge: BadgeTemplate = {
  name: "Guardião da Chave",
  description: "Dominou os fundamentos de segurança Bitcoin e criou sua primeira carteira",
  type: "virtual" as const,
  imageUrl: "/badges/key-guardian.png"
}