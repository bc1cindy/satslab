import { Bitcoin, Shield, Send, Pickaxe, Zap, Layers, Users, BookOpen, Brain, ShoppingCart, TrendingUp, Lock, Database, Bot } from 'lucide-react'

export interface CourseModule {
  id: number
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<any>
  topics: string[]
  duration: string
  level: string
  available: boolean
}

export const courseModules: CourseModule[] = [
  {
    id: 1,
    title: "Arquitetura do Sistema Bitcoin",
    subtitle: "Fundamentos da Rede Descentralizada",
    description: "Entenda como o Bitcoin funciona, sua estrutura descentralizada e os princípios que garantem sua segurança e inovação. Aprenda sobre consenso distribuído, peer-to-peer e a revolução do dinheiro digital.",
    icon: Bitcoin,
    topics: [
      "Como funciona a rede Bitcoin",
      "Protocolo peer-to-peer",
      "Consenso descentralizado",
      "História e filosofia do Bitcoin",
      "Diferenças entre Bitcoin e altcoins"
    ],
    duration: "2h 30min",
    level: "Iniciante",
    available: true
  },
  {
    id: 2,
    title: "Blockchain e Redes de Teste",
    subtitle: "A Tecnologia por Trás do Bitcoin",
    description: "Explore o que é a blockchain, como ela registra transações e o papel das redes de teste no desenvolvimento de aplicações Bitcoin. Pratique em ambiente seguro antes de usar Bitcoin real.",
    icon: Database,
    topics: [
      "Estrutura de blocos e transações",
      "Proof of Work explicado",
      "Testnet, Signet e Regtest",
      "Exploradores de blockchain",
      "Validação de transações"
    ],
    duration: "3h",
    level: "Iniciante",
    available: true
  },
  {
    id: 3,
    title: "Implementações BTC e Como Rodar um Nó",
    subtitle: "Seja Parte da Rede Bitcoin",
    description: "Aprenda a configurar e gerenciar um nó Bitcoin, entendendo as principais implementações do protocolo Bitcoin. Torne-se um participante ativo da rede.",
    icon: Layers,
    topics: [
      "Bitcoin Core e outras implementações",
      "Requisitos para rodar um nó",
      "Configuração passo a passo",
      "Sincronização da blockchain",
      "Benefícios de ter seu próprio nó"
    ],
    duration: "4h",
    level: "Intermediário",
    available: true
  },
  {
    id: 4,
    title: "Chaves, Endereços e Scripts",
    subtitle: "Criptografia Aplicada ao Bitcoin",
    description: "Descubra como funcionam as chaves públicas e privadas, endereços Bitcoin e scripts que garantem transações seguras. Fundamentos essenciais de segurança.",
    icon: Lock,
    topics: [
      "Criptografia de chave pública",
      "Geração de endereços Bitcoin",
      "Tipos de endereços (Legacy, SegWit, Taproot)",
      "Bitcoin Script básico",
      "Assinaturas digitais ECDSA"
    ],
    duration: "3h 30min",
    level: "Intermediário",
    available: true
  },
  {
    id: 5,
    title: "Gerenciamento de Carteiras e Segurança em Auto Custódia",
    subtitle: "Proteja Seus Bitcoins",
    description: "Domine as melhores práticas para criar, gerenciar e proteger suas carteiras Bitcoin, evitando riscos comuns. Aprenda sobre auto custódia e seja seu próprio banco.",
    icon: Shield,
    topics: [
      "Tipos de carteiras (hot/cold wallets)",
      "Hardware wallets e segurança",
      "Backup e recuperação de seeds",
      "Multisig para segurança avançada",
      "Melhores práticas de auto custódia"
    ],
    duration: "4h",
    level: "Fundamental",
    available: true
  },
  {
    id: 6,
    title: "Mineração e Consenso",
    subtitle: "O Coração do Bitcoin",
    description: "Conheça o processo de mineração de Bitcoin, o algoritmo de consenso Proof-of-Work, sua importância para a rede e como minerar. Entenda a economia da mineração.",
    icon: Pickaxe,
    topics: [
      "Como funciona a mineração",
      "Proof of Work em detalhes",
      "Ajuste de dificuldade",
      "Pools de mineração",
      "Economia e rentabilidade"
    ],
    duration: "3h 30min",
    level: "Intermediário",
    available: true
  },
  {
    id: 7,
    title: "Assinaturas Digitais",
    subtitle: "Autenticidade e Integridade",
    description: "Saiba como as assinaturas digitais garantem a autenticidade e integridade das transações no Bitcoin. Conceitos avançados de criptografia aplicada.",
    icon: Lock,
    topics: [
      "ECDSA e Schnorr signatures",
      "Processo de assinatura de transações",
      "Verificação de assinaturas",
      "Multisig e threshold signatures",
      "Taproot e agregação de assinaturas"
    ],
    duration: "2h 30min",
    level: "Avançado",
    available: true
  },
  {
    id: 8,
    title: "Transações Avançadas, Taxas e Lightning Network",
    subtitle: "Bitcoin Rápido e Barato",
    description: "Aprenda sobre transações avançadas, como calcular taxas e utilizar a Lightning Network para transações rápidas e baratas. O futuro dos pagamentos em Bitcoin.",
    icon: Zap,
    topics: [
      "RBF e CPFP para taxas",
      "Batching de transações",
      "Como funciona a Lightning Network",
      "Canais de pagamento",
      "Casos de uso da Lightning"
    ],
    duration: "5h",
    level: "Avançado",
    available: true
  },
  {
    id: 9,
    title: "Scripting e Contratos Inteligentes",
    subtitle: "Programação no Bitcoin",
    description: "Explore o potencial do scripting Bitcoin e como criar contratos inteligentes para aplicações avançadas. Automatize e programe dinheiro.",
    icon: BookOpen,
    topics: [
      "Bitcoin Script avançado",
      "Timelocks e hashlocks",
      "Contratos multisig complexos",
      "Atomic swaps",
      "DLCs e aplicações avançadas"
    ],
    duration: "4h 30min",
    level: "Avançado",
    available: true
  },
  {
    id: 10,
    title: "Como Comprar ou Vender Bitcoin",
    subtitle: "Guia Prático de Mercado",
    description: "Entenda o processo de comprar e vender Bitcoin de forma segura, escolhendo as melhores plataformas e estratégias. Evite golpes e maximize seus resultados.",
    icon: ShoppingCart,
    topics: [
      "Exchanges centralizadas vs P2P",
      "KYC e privacidade",
      "Taxas e spreads",
      "Ordens de compra e venda",
      "Segurança em exchanges"
    ],
    duration: "2h",
    level: "Iniciante",
    available: false
  },
  {
    id: 11,
    title: "Gerenciamento de Risco",
    subtitle: "Proteja Seu Patrimônio",
    description: "Aprenda a identificar e gerenciar riscos associados ao investimento e uso de Bitcoin. Estratégias profissionais de gestão de risco.",
    icon: TrendingUp,
    topics: [
      "Volatilidade e gestão de portfolio",
      "Dollar Cost Averaging (DCA)",
      "Riscos técnicos e de segurança",
      "Psicologia do investidor",
      "Estratégias de hedge"
    ],
    duration: "3h",
    level: "Intermediário",
    available: false
  },
  {
    id: 12,
    title: "Fiducia",
    subtitle: "Verificar, Não Confiar",
    description: "Compreenda a diferença entre precisar ou não confiar em intermediários. O princípio fundamental do Bitcoin: Don't Trust, Verify.",
    icon: Users,
    topics: [
      "Conceito de trustless",
      "Verificação vs confiança",
      "Riscos de custódia terceirizada",
      "Importância da descentralização",
      "Casos históricos (Mt. Gox, FTX)"
    ],
    duration: "2h 30min",
    level: "Fundamental",
    available: false
  },
  {
    id: 13,
    title: "Bitcoin Open-Source e Inteligência Artificial",
    subtitle: "O Futuro da Tecnologia",
    description: "Contribuindo com Bitcoin open-source com inteligência artificial para te apoiar no aprendizado. Explore as fronteiras da inovação.",
    icon: Brain,
    topics: [
      "Contribuindo para o Bitcoin Core",
      "Ferramentas de IA para desenvolvimento",
      "Análise de blockchain com ML",
      "Automação e bots de trading",
      "Futuro do Bitcoin e IA"
    ],
    duration: "3h 30min",
    level: "Avançado",
    available: false
  },
  {
    id: 14,
    title: "Como crio imagens de clones com IA?",
    subtitle: "Aula Bônus: IA Generativa",
    description: "Como criar imagens de clones usando IA. Aprenda a usar ferramentas modernas de inteligência artificial para gerar imagens realistas.",
    icon: Bot,
    topics: [
      "Introdução ao Replicate.com",
      "Criação de imagens com IA",
      "Técnicas de clonagem facial",
      "Casos de uso práticos",
      "Ética e responsabilidade na IA"
    ],
    duration: "45min",
    level: "Bônus",
    available: true
  }
]