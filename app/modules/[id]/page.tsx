'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { 
  ChevronLeft, ChevronRight, Bitcoin, Trophy, Clock, CheckCircle, Circle,
  HelpCircle, ExternalLink, BookOpen, Shield, Send, Pickaxe, Zap, Layers, Users
} from 'lucide-react'

// Dados dos módulos (mesmo array da página principal)
const modules = [
  {
    id: 1,
    title: "Introdução ao Bitcoin e à Signet",
    description: "Conceitos básicos e exploração da blockchain",
    icon: BookOpen,
    difficulty: "Iniciante",
    duration: "15 min",
    requiresLogin: false,
    badge: "Explorador Iniciante",
    color: "bg-blue-500",
    theory: [
      {
        id: 1,
        question: "O que é uma blockchain?",
        options: ["a) Um banco de dados centralizado", "b) Uma rede social", "c) Um livro-razão distribuído", "d) Um tipo de moeda"],
        correct: 2,
        explanation: "A blockchain é um livro-razão distribuído que mantém um registro crescente de transações."
      },
      {
        id: 2,
        question: "Qual é a diferença entre mainnet e Signet?",
        options: ["a) Não há diferença", "b) Mainnet usa moedas reais; Signet é para testes", "c) Signet é mais rápida", "d) Mainnet é gratuita"],
        correct: 1,
        explanation: "A mainnet usa Bitcoin real, enquanto a Signet é uma rede de teste para desenvolvimento."
      },
      {
        id: 3,
        question: "O que é um faucet na Signet?",
        options: ["a) Uma torneira real", "b) Um tipo de carteira", "c) Um serviço que distribui moedas de teste", "d) Um minerador"],
        correct: 2,
        explanation: "Um faucet é um serviço que distribui pequenas quantidades de moedas de teste gratuitamente."
      }
    ],
    practice: [
      {
        id: 1,
        title: "Explore mempool.space/signet",
        description: "Encontre o hash de uma transação recente no explorador da Signet",
        instructions: "1. Acesse mempool.space/signet\n2. Navegue pelas transações recentes\n3. Copie o hash de uma transação\n4. Cole o hash no campo abaixo",
        validation: "txhash",
        link: "https://mempool.space/signet"
      },
      {
        id: 2,
        title: "Leia uma transação",
        description: "Identifique o valor transferido em uma transação",
        instructions: "1. Use o hash da tarefa anterior\n2. Examine os inputs e outputs\n3. Identifique o valor total transferido em sBTC\n4. Insira o valor (em sBTC, ex: 0.001)",
        validation: "amount"
      }
    ]
  },
  {
    id: 2,
    title: "Segurança e Carteiras no Bitcoin",
    description: "Chaves privadas, carteiras e segurança",
    icon: Shield,
    difficulty: "Iniciante",
    duration: "20 min",
    requiresLogin: true,
    badge: "Guardião da Chave",
    color: "bg-green-500",
    theory: [
      {
        id: 1,
        question: "Qual é a função de uma chave privada?",
        options: ["a) Receber pagamentos", "b) Assinar transações", "c) Minerar blocos", "d) Validar transações"],
        correct: 1,
        explanation: "A chave privada é usada para assinar transações e provar a propriedade dos fundos."
      }
    ],
    practice: [
      {
        id: 1,
        title: "Crie uma carteira Signet",
        description: "Gere uma nova carteira e obtenha fundos de teste",
        instructions: "1. Use o botão abaixo para gerar uma carteira\n2. Acesse o faucet da Signet\n3. Solicite 0.01 sBTC\n4. Confirme o recebimento",
        validation: "address",
        link: "https://signetfaucet.com"
      }
    ]
  }
  // Outros módulos teriam estruturas similares...
]

interface ModulePageProps {
  params: {
    id: string
  }
}

export default function ModulePage({ params }: ModulePageProps) {
  const moduleId = parseInt(params.id)
  const module = modules.find(m => m.id === moduleId)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({})
  const [taskInputs, setTaskInputs] = useState<{[key: number]: string}>({})
  const [completedTheory, setCompletedTheory] = useState<number[]>([])
  const [completedPractice, setCompletedPractice] = useState<number[]>([])

  if (!module) {
    return <div>Módulo não encontrado</div>
  }

  const IconComponent = module.icon
  const theoryProgress = (completedTheory.length / (module.theory?.length || 1)) * 100
  const practiceProgress = (completedPractice.length / (module.practice?.length || 1)) * 100
  const overallProgress = (theoryProgress + practiceProgress) / 2

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setSelectedAnswers({...selectedAnswers, [questionId]: answerIndex})
    const question = module.theory?.find(q => q.id === questionId)
    if (question && answerIndex === question.correct) {
      if (!completedTheory.includes(questionId)) {
        setCompletedTheory([...completedTheory, questionId])
      }
    }
  }

  const handleTaskInput = (taskId: number, value: string) => {
    setTaskInputs({...taskInputs, [taskId]: value})
    // Aqui seria implementada a validação real
    if (value.length > 10) { // Validação simples
      if (!completedPractice.includes(taskId)) {
        setCompletedPractice([...completedPractice, taskId])
      }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
              <span>Voltar ao Curso</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">{module.duration}</span>
              </div>
              <Badge variant="outline" className="border-gray-700 text-gray-300">
                Módulo {moduleId}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-3 rounded-xl ${module.color} bg-opacity-10`}>
              <IconComponent className="h-8 w-8" style={{ color: module.color.replace("bg-", "").replace("-500", "") }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{module.title}</h1>
              <p className="text-gray-400 mt-1">{module.description}</p>
            </div>
          </div>

          {/* Progress */}
          <Card className="mb-6 bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Progresso do Módulo</span>
                <span className="text-sm text-gray-500">
                  {Math.round(overallProgress)}% concluído
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="theory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="theory">Perguntas Teóricas</TabsTrigger>
            <TabsTrigger value="practice">Tarefas Práticas</TabsTrigger>
          </TabsList>

          {/* Theory Tab */}
          <TabsContent value="theory" className="space-y-6">
            {module.theory?.map((question, index) => {
              const isAnswered = selectedAnswers[question.id] !== undefined
              const isCorrect = selectedAnswers[question.id] === question.correct
              const isCompleted = completedTheory.includes(question.id)

              return (
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Circle className="h-5 w-5 text-gray-400" />
                      <span>Pergunta {index + 1}</span>
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-white">{question.question}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <Button
                          key={optionIndex}
                          variant="outline"
                          className="w-full justify-start text-left h-auto p-4 bg-transparent text-white border-gray-700 hover:bg-gray-800"
                          onClick={() => handleAnswerSelect(question.id, optionIndex)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>

                    <Alert>
                      <HelpCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Dica:</strong> {question.explanation}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-6">
            {module.practice?.map((task, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{task.title}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-300">{task.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-white">Instruções:</h4>
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">{task.instructions}</pre>
                  </div>

                  {task.validation === "txhash" && (
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <a href={task.link} target="_blank" rel="noopener noreferrer">
                          Abrir Mempool Signet
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>

                      <div className="space-y-2">
                        <Label htmlFor="transaction-hash" className="text-white">
                          Hash da Transação
                        </Label>
                        <Input
                          id="transaction-hash"
                          placeholder="Cole o hash da transação aqui..."
                          className="font-mono text-sm"
                          value={taskInputs[task.id] || ''}
                          onChange={(e) => handleTaskInput(task.id, e.target.value)}
                        />
                      </div>

                      <Button className="w-full">Validar Resposta</Button>
                    </div>
                  )}

                  {task.validation === "amount" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="transaction-amount" className="text-white">
                          Valor Transferido (sBTC)
                        </Label>
                        <Input
                          id="transaction-amount"
                          placeholder="Ex: 0.001"
                          type="number"
                          step="0.00000001"
                          value={taskInputs[task.id] || ''}
                          onChange={(e) => handleTaskInput(task.id, e.target.value)}
                        />
                      </div>

                      <Button className="w-full">Validar Resposta</Button>
                    </div>
                  )}

                  {task.validation === "address" && (
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <a href={task.link} target="_blank" rel="noopener noreferrer">
                          Abrir Faucet Signet
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>

                      <div className="space-y-2">
                        <Label htmlFor="wallet-address" className="text-white">
                          Endereço da Carteira
                        </Label>
                        <Input
                          id="wallet-address"
                          placeholder="Endereço da sua carteira Signet..."
                          className="font-mono text-sm"
                          value={taskInputs[task.id] || ''}
                          onChange={(e) => handleTaskInput(task.id, e.target.value)}
                        />
                      </div>

                      <Button className="w-full">Validar Resposta</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Badge Reward */}
        <Card className="mt-8 border-2 border-dashed border-orange-500/50 bg-gray-900">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Recompensa do Módulo</h3>
              <p className="text-gray-400 mb-4">Complete todas as tarefas para conquistar o badge:</p>
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 bg-orange-500/20 text-orange-400 border-orange-500/50"
              >
                🏆 {module.badge}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" asChild>
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar ao Curso
            </Link>
          </Button>

          <Button asChild>
            <Link href={`/modules/${moduleId + 1}`}>
              Próximo Módulo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}