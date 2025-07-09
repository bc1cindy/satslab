import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { 
  BookOpen, Shield, Send, Pickaxe, Zap, Layers, Users, 
  ChevronRight, Bitcoin, Trophy,
  Target, Gamepad2, Award
} from 'lucide-react'

// Dados dos módulos (idêntico ao bitcoin-course)
const modules = [
  {
    id: 1,
    title: "Introdução ao Bitcoin e à Signet",
    description: "Conceitos básicos e exploração da blockchain",
    icon: BookOpen,
    difficulty: "Iniciante",
    badge: "Explorador Iniciante",
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Segurança e Carteiras no Bitcoin",
    description: "Chaves privadas, carteiras e segurança",
    icon: Shield,
    difficulty: "Iniciante",
    badge: "Guardião da Chave",
    color: "bg-green-500"
  },
  {
    id: 3,
    title: "Transações na Signet",
    description: "Criação de transações e OP_RETURN",
    icon: Send,
    difficulty: "Intermediário",
    badge: "Mensageiro da Blockchain",
    color: "bg-purple-500"
  },
  {
    id: 4,
    title: "Mineração no Bitcoin",
    description: "Prova de trabalho e mineradores",
    icon: Pickaxe,
    difficulty: "Intermediário",
    badge: "Minerador Aprendiz",
    color: "bg-orange-500"
  },
  {
    id: 5,
    title: "Introdução à Lightning Network",
    description: "Camada de escalabilidade do Bitcoin",
    icon: Zap,
    difficulty: "Intermediário",
    badge: "Raio Rápido",
    color: "bg-yellow-500"
  },
  {
    id: 6,
    title: "Taproot e Ordinals",
    description: "Funcionalidades avançadas do Bitcoin",
    icon: Layers,
    difficulty: "Avançado",
    badge: "Pioneiro Taproot",
    color: "bg-indigo-500"
  },
  {
    id: 7,
    title: "Carteiras Multisig",
    description: "Segurança avançada com carteiras multisig",
    icon: Users,
    difficulty: "Avançado",
    badge: "Mestre Multisig",
    color: "bg-red-500"
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bitcoin className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-white">SatsLab</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/badges">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  Badges
                </Button>
              </Link>
              <Link href="/modules/1">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                  Começar Curso
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Aprenda Bitcoin na Prática
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experimente Bitcoin através de módulos interativos, tarefas práticas e experiência hands-on com a rede Signet
          </p>

          <Link href="/modules/1">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-4">
              Começar Jornada
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Modules Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Módulos do Curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const IconComponent = module.icon
              
              return (
                <Card 
                  key={module.id}
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 bg-gray-900 border border-gray-800 rounded-2xl"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${module.color} bg-opacity-10
                      `}>
                        <IconComponent className={`h-6 w-6 ${module.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-white mb-2">{module.title}</CardTitle>
                    <CardDescription className="text-gray-400">{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                        {module.difficulty}
                      </Badge>
                    </div>
                    
                    <Badge className={`
                      w-full justify-center py-2
                      ${module.color.replace('bg-', 'bg-').replace('500', '500/20')} 
                      ${module.color.replace('bg-', 'text-').replace('500', '400')} 
                      border-${module.color.replace('bg-', '').replace('500', '500/50')}
                    `}>
                      🏆 {module.badge}
                    </Badge>

                    <Link href={`/modules/${module.id}`}>
                      <Button 
                        className={`w-full ${module.color} hover:${module.color.replace('500', '600')}`}
                      >
                        Começar
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Por que fazer o SatsLab?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aprendizado Prático</h3>
              <p className="text-gray-400">
                Aprenda fazendo com transações reais na rede Signet e projetos hands-on
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sistema de Badges</h3>
              <p className="text-gray-400">
                Ganhe badges únicos e acompanhe seu progresso através de conquistas
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progressão Gradual</h3>
              <p className="text-gray-400">
                Módulos estruturados do básico ao avançado para uma curva de aprendizado suave
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Bitcoin className="h-8 w-8 text-orange-500 mr-3" />
            <span className="text-2xl font-bold">SatsLab</span>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Plataforma educacional dedicada ao ensino prático de Bitcoin, Lightning Network e tecnologias relacionadas através da rede Signet
          </p>
        </div>
      </footer>
    </div>
  )
}