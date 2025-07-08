import { Question, Task, BadgeTemplate } from '@/app/types'

export const module2Data = {
  id: 2,
  title: "Segurança e Carteiras",
  description: "Aprenda sobre chaves privadas, segurança de carteiras e criação de endereços Bitcoin",
  objectives: [
    "Entender a importância das chaves privadas",
    "Aprender a proteger frases-semente (seed phrases)",
    "Gerar sua primeira carteira Bitcoin na Signet",
    "Conhecer a diferença entre hot wallets e cold wallets",
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
    question: "Qual é a diferença entre hot wallet e cold wallet?",
    options: [
      "Hot wallets são mais caras que cold wallets",
      "Cold wallets só funcionam com Bitcoin, hot wallets aceitam várias moedas",
      "Hot wallets ficam online, cold wallets ficam offline",
      "Não há diferença significativa entre elas"
    ],
    correctAnswer: 2,
    explanation: "Hot wallets estão conectadas à internet (apps, extensões), oferecendo conveniência mas maior risco. Cold wallets ficam offline (hardware wallets, paper wallets), proporcionando máxima segurança para grandes quantias."
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
    ],
    externalLinks: [
      {
        label: "Signet Faucet",
        url: "https://signet.bc-2.jp/"
      },
      {
        label: "Verificar Transação",
        url: "https://mempool.space/signet"
      }
    ]
  },
  {
    id: 2,
    title: "Verificar Transação do Faucet",
    description: "Use o explorador blockchain para verificar se recebeu sBTC do faucet na sua carteira.",
    instructions: [
      "Use o faucet integrado abaixo para solicitar sBTC para sua carteira",
      "Aguarde o processamento da transação (cerca de 30 segundos)",
      "Copie o hash (TXID) da transação gerada",
      "Opcionalmente, verifique a transação no explorador mempool.space/signet",
      "Cole o TXID no campo abaixo para completar a tarefa"
    ],
    type: "explorer" as const,
    validation: {
      type: "hash" as const,
      placeholder: "Cole o hash da transação que recebeu do faucet (64 caracteres)"
    },
    hints: [
      "O faucet pode demorar alguns minutos para enviar",
      "Procure por transações de entrada (inputs) no seu endereço",
      "O hash da transação tem exatamente 64 caracteres hexadecimais",
      "Se não recebeu ainda, aguarde mais alguns minutos e atualize a página"
    ],
    externalLinks: [
      {
        label: "Explorador Signet",
        url: "https://mempool.space/signet"
      }
    ]
  }
]

export const module2Badge: BadgeTemplate = {
  name: "Guardião da Chave",
  description: "Dominou os fundamentos de segurança Bitcoin e criou sua primeira carteira",
  type: "virtual" as const,
  imageUrl: "/badges/key-guardian.png"
}