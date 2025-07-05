'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, CheckCircle, Clock, Trophy, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'

// Types
interface UserProgress {
  timeSpent: number
  questionsCompleted: boolean
  questionsScore: number
  tasksCompleted: boolean
  tasksScore: number
  badgeEarned: boolean
  completed: boolean
}

// Module 1 Data
const moduleQuestions = [
  {
    id: 'blockchain_definition',
    question: 'O que é uma blockchain?',
    options: [
      'Um tipo de criptomoeda',
      'Um software de mineração',
      'Um livro-razão distribuído',
      'Um protocolo de internet'
    ],
    correct: 2,
    explanation: 'Blockchain é um livro-razão distribuído que registra transações de forma transparente e imutável, mantido por uma rede descentralizada de computadores.',
    hint: 'Pense em um livro de registros que é compartilhado e verificado por todos os participantes da rede.'
  },
  {
    id: 'mainnet_vs_signet',
    question: 'Qual é a diferença principal entre Mainnet e Signet?',
    options: [
      'Signet é mais rápida que a Mainnet',
      'Mainnet usa moedas reais; Signet é para testes',
      'Signet tem mais segurança que a Mainnet',
      'Não há diferença significativa'
    ],
    correct: 1,
    explanation: 'A Mainnet é a rede principal do Bitcoin onde as transações envolvem bitcoin real com valor econômico. A Signet é uma rede de teste onde os bitcoins não têm valor real, sendo usada para experimentação e desenvolvimento.',
    hint: 'Uma das redes usa dinheiro real, a outra é apenas para praticar e testar.'
  },
  {
    id: 'faucet_definition',
    question: 'O que é um faucet na rede Signet?',
    options: [
      'Um tipo de carteira Bitcoin',
      'Um serviço que distribui bitcoins de teste gratuitos',
      'Um protocolo de segurança',
      'Um tipo de transação especial'
    ],
    correct: 1,
    explanation: 'Um faucet é um serviço que distribui pequenas quantidades de bitcoins de teste (sBTC) gratuitamente para desenvolvedores e estudantes poderem experimentar com a rede Signet sem custos.',
    hint: 'É como uma "torneira" que goteja bitcoins de teste gratuitos para quem quer aprender.'
  }
]

const moduleTasks = [
  {
    id: 'explore_mempool',
    title: 'Explorar o Mempool Signet',
    description: 'Encontre uma transação recente na rede Signet usando o explorador mempool.space',
    instructions: [
      'Acesse mempool.space/signet no seu navegador',
      'Observe as transações recentes na página inicial',
      'Clique em uma transação para ver seus detalhes',
      'Copie o hash (ID) da transação (64 caracteres hexadecimais)',
      'Cole o hash no campo abaixo para validação'
    ],
    inputLabel: 'Hash da Transação (TXID)',
    inputPlaceholder: 'ex: a1b2c3d4e5f6...',
    validationType: 'transaction' as const,
    hints: [
      'O hash da transação aparece no topo da página de detalhes da transação.',
      'Um hash válido tem exatamente 64 caracteres e contém apenas números (0-9) e letras (a-f).',
      'Se estiver com dificuldade, procure por "Recent Transactions" na página inicial do mempool.'
    ],
    externalLinks: [
      {
        label: 'Mempool Signet Explorer',
        url: 'https://mempool.space/signet'
      }
    ]
  },
  {
    id: 'read_transaction_value',
    title: 'Identificar Valor da Transação',
    description: 'Analise uma transação no explorador e identifique o valor total transferido',
    instructions: [
      'Escolha uma transação no mempool.space/signet',
      'Na página da transação, observe a seção "Outputs"',
      'Some todos os valores dos outputs (em sBTC)',
      'Subtraia o valor que retorna para o remetente (change)',
      'O resultado é o valor líquido transferido'
    ],
    inputLabel: 'Valor Total Transferido (em sBTC)',
    inputPlaceholder: 'ex: 0.001',
    validationType: 'amount' as const,
    hints: [
      'Os outputs mostram para onde o dinheiro está indo. Um dos outputs geralmente é o "troco" que volta para o remetente.',
      'O valor transferido é normalmente menor que a soma total dos outputs.',
      'Observe que 1 sBTC = 100,000,000 satoshis. O explorador pode mostrar valores em diferentes unidades.'
    ],
    externalLinks: [
      {
        label: 'Mempool Signet Explorer',
        url: 'https://mempool.space/signet'
      }
    ]
  }
]

export default function Module1() {
  const [progress, setProgress] = useState<UserProgress>({
    timeSpent: 0,
    questionsCompleted: false,
    questionsScore: 0,
    tasksCompleted: false,
    tasksScore: 0,
    badgeEarned: false,
    completed: false
  })
  
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'tasks' | 'completed'>('intro')
  const [startTime] = useState(Date.now())

  const handleQuestionsComplete = (score: number, total: number) => {
    setProgress(prev => ({
      ...prev,
      questionsCompleted: true,
      questionsScore: score
    }))
    
    // Auto advance to tasks after 2 seconds
    setTimeout(() => {
      setCurrentSection('tasks')
    }, 2000)
  }

  const handleTasksComplete = (completedTasks: number, totalTasks: number) => {
    const allTasksCompleted = completedTasks === totalTasks
    
    setProgress(prev => ({
      ...prev,
      tasksCompleted: true,
      tasksScore: completedTasks,
      badgeEarned: allTasksCompleted && prev.questionsCompleted,
      completed: allTasksCompleted && prev.questionsCompleted
    }))
    
    if (allTasksCompleted && progress.questionsCompleted) {
      setTimeout(() => {
        setCurrentSection('completed')
        saveProgress()
      }, 2000)
    }
  }

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        timeSpent: Math.floor((Date.now() - startTime) / 1000)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  // Save progress to Supabase (only if user is logged in)
  const saveProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return // Skip saving if not logged in
      
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: 1,
          completed: progress.completed,
          badge_earned: progress.badgeEarned,
          questions_score: progress.questionsScore,
          tasks_score: progress.tasksScore,
          time_spent: progress.timeSpent,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error saving progress:', error)
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  // Calculate overall progress
  const overallProgress = (
    (progress.questionsCompleted ? 40 : 0) +
    (progress.tasksCompleted ? 40 : 0) +
    (progress.badgeEarned ? 20 : 0)
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Tempo: {Math.floor(progress.timeSpent / 60)}m {progress.timeSpent % 60}s
              </div>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                Módulo 1
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Module Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Introdução ao Bitcoin e à Signet</h1>
              <p className="text-gray-400 mt-2">Conceitos básicos e exploração da blockchain</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progresso Geral</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </div>

        {/* Introduction Section */}
        {currentSection === 'intro' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <BookOpen className="h-6 w-6 text-blue-500 mr-3" />
                  Bem-vindo ao Bitcoin!
                </CardTitle>
                <CardDescription>
                  Vamos começar sua jornada no mundo do Bitcoin com conceitos fundamentais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">O que você vai aprender:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>O que é uma blockchain e como funciona</li>
                    <li>Diferenças entre a rede principal (Mainnet) e a rede de teste (Signet)</li>
                    <li>Como explorar transações Bitcoin em tempo real</li>
                    <li>Como interpretar dados de transações no explorador blockchain</li>
                  </ul>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">💡 Importante:</h3>
                  <p className="text-blue-300 text-sm">
                    Este módulo é acessível sem login! Você pode explorar e aprender os conceitos básicos. 
                    Para salvar seu progresso e ganhar badges, faça login após completar.
                  </p>
                </div>
                
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-blue-500 hover:bg-blue-600 text-lg px-8 py-3"
                  >
                    Começar Aprendizado
                    <BookOpen className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Questions Section */}
        {currentSection === 'questions' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">📚 Perguntas Teóricas</CardTitle>
                <CardDescription className="text-center">
                  Teste seus conhecimentos sobre os conceitos básicos do Bitcoin
                </CardDescription>
              </CardHeader>
            </Card>
            
            <QuestionSystem 
              questions={moduleQuestions}
              onComplete={handleQuestionsComplete}
              moduleId={1}
            />
          </div>
        )}

        {/* Tasks Section */}
        {currentSection === 'tasks' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">🎯 Tarefas Práticas</CardTitle>
                <CardDescription className="text-center">
                  Aplique seus conhecimentos explorando a blockchain Signet
                </CardDescription>
              </CardHeader>
            </Card>
            
            <TaskSystem 
              tasks={moduleTasks}
              onComplete={handleTasksComplete}
              moduleId={1}
            />
          </div>
        )}

        {/* Completion Screen */}
        {currentSection === 'completed' && (
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-green-400 flex items-center justify-center">
                <Trophy className="h-8 w-8 mr-3" />
                Parabéns! Módulo Concluído
              </CardTitle>
              <CardDescription>
                Você completou com sucesso o Módulo 1
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {progress.badgeEarned && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="text-xl font-semibold text-green-400 mb-2">Badge Conquistado!</h3>
                  <Badge className="bg-blue-500/20 text-blue-400 text-lg px-4 py-2">
                    <Award className="h-5 w-5 mr-2" />
                    Explorador Iniciante
                  </Badge>
                  <p className="text-sm text-gray-400 mt-2">
                    Você demonstrou compreensão dos conceitos básicos do Bitcoin e sabe explorar a blockchain Signet
                  </p>
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{progress.questionsScore}/3</div>
                  <div className="text-sm text-gray-400">Perguntas Corretas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{progress.tasksScore}/2</div>
                  <div className="text-sm text-gray-400">Tarefas Concluídas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{Math.floor(progress.timeSpent / 60)}m</div>
                  <div className="text-sm text-gray-400">Tempo Total</div>
                </div>
              </div>

              {/* Learning Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">🎓 O que você aprendeu:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm text-left">
                  <li>Blockchain é um livro-razão distribuído e transparente</li>
                  <li>Signet é uma rede de teste segura para experimentação</li>
                  <li>Como usar exploradores blockchain para analisar transações</li>
                  <li>Como identificar e validar hashes de transações</li>
                </ul>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <p className="text-gray-300">
                  Excelente progresso! Agora que você domina os conceitos básicos, 
                  está pronto para aprender sobre segurança e carteiras Bitcoin.
                </p>
                
                <div className="flex space-x-4">
                  <Link href="/modules/2" className="flex-1">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      Próximo Módulo: Segurança e Carteiras
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="border-gray-600 text-gray-300">
                      Voltar ao Início
                    </Button>
                  </Link>
                </div>
                
                <p className="text-sm text-gray-400">
                  💡 Dica: Faça login para salvar seu progresso e sincronizar seus badges!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        {currentSection !== 'intro' && currentSection !== 'completed' && (
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentSection === 'tasks') setCurrentSection('questions')
                if (currentSection === 'questions') setCurrentSection('intro')
              }}
              className="border-gray-600 text-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            {currentSection === 'questions' && progress.questionsCompleted && (
              <Button 
                onClick={() => setCurrentSection('tasks')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Ir para Tarefas Práticas
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}