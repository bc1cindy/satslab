import { ModuleLayout } from '@/app/components/layout/ModuleLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'

const modules = [
  {
    id: 1,
    title: "Introdução ao Bitcoin e Signet",
    description: "Conceitos básicos sobre Bitcoin e exploração da rede Signet",
    difficulty: "Iniciante",
    duration: "30 min",
    topics: ["Blockchain", "Signet", "Exploradores", "Transações"]
  },
  {
    id: 2,
    title: "Segurança e Carteiras",
    description: "Chaves privadas, carteiras e segurança Bitcoin",
    difficulty: "Iniciante",
    duration: "45 min",
    topics: ["Chaves Privadas", "Carteiras", "Seed Phrases", "Segurança"]
  },
  {
    id: 3,
    title: "Transações na Signet",
    description: "Criando e enviando transações, taxas e OP_RETURN",
    difficulty: "Intermediário",
    duration: "60 min",
    topics: ["Transações", "Taxas", "OP_RETURN", "UTXOs"]
  },
  {
    id: 4,
    title: "Mineração no Bitcoin",
    description: "Prova de trabalho, mineração e consensus",
    difficulty: "Intermediário",
    duration: "45 min",
    topics: ["Prova de Trabalho", "Mineração", "Dificuldade", "Pools"]
  },
  {
    id: 5,
    title: "Lightning Network",
    description: "Pagamentos instantâneos e canais de pagamento",
    difficulty: "Intermediário",
    duration: "75 min",
    topics: ["Lightning", "Canais", "Roteamento", "Invoices"]
  },
  {
    id: 6,
    title: "Taproot e Ordinals",
    description: "Tecnologias avançadas e NFTs no Bitcoin",
    difficulty: "Avançado",
    duration: "90 min",
    topics: ["Taproot", "Schnorr", "Ordinals", "Inscriptions"]
  },
  {
    id: 7,
    title: "Carteiras Multisig",
    description: "Carteiras multi-assinatura e tecnologias Taproot",
    difficulty: "Avançado",
    duration: "90 min",
    topics: ["Multisig", "Taproot", "Schnorr", "Segurança"]
  }
]

export default function ModulesPage() {
  return (
    <ModuleLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎓 Módulos Educacionais
          </h1>
          <p className="text-lg text-gray-300">
            Aprenda Bitcoin através de módulos interativos, do básico ao avançado.
            Cada módulo combina teoria, prática e recompensas.
          </p>
        </div>

        <div className="grid gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2 text-white">
                      {module.title}
                    </CardTitle>
                    <p className="text-gray-300">{module.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="outline">Módulo {module.id}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      📊 {module.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱️ {module.duration}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Tópicos:</h4>
                    <div className="flex flex-wrap gap-2">
                      {module.topics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-sm text-gray-400">
                      ✨ Disponível agora
                    </div>
                    <Link href={`/modules/${module.id}`}>
                      <Button>
                        Começar Módulo
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">🚀 Pronto para começar?</h3>
          <p className="mb-4">
            Comece pelo Módulo 1 para aprender os fundamentos do Bitcoin, ou escolha 
            qualquer módulo que desperte seu interesse. Seu progresso será salvo automaticamente!
          </p>
          <div className="flex gap-4">
            <Link href="/modules/1">
              <Button variant="secondary">
                📚 Começar pelo Módulo 1
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">
                📊 Ver Progresso
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ModuleLayout>
  )
}