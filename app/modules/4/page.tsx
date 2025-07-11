'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, Trophy, BookOpen, Award, Zap } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import { useModuleAnalytics } from '@/app/hooks/useAnalytics'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import MiningSimulator from '@/app/components/modules/MiningSimulator'
import PoolMiningSimulator from '@/app/components/modules/PoolMiningSimulator'
import { module4Questions, module4Tasks, module4Badge } from './data'

// Types
interface MiningResults {
  hashFound?: string
  poolRewards?: number
}

// Convert data format for components
const moduleQuestions = module4Questions.map(q => ({
  id: q.id.toString(),
  question: q.question,
  options: q.options,
  correct: q.correctAnswer, // Already 0-based index
  explanation: q.explanation,
  hint: ''
}))

const moduleTasks = module4Tasks.map(t => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  instructions: t.instructions,
  inputLabel: t.validation.type === 'hash' ? 'Hash Encontrado' : 'Recompensa Total (BTC)',
  inputPlaceholder: t.validation.placeholder || '',
  validationType: (t.validation.type === 'hash' ? 'transaction' : 'amount') as 'transaction' | 'amount',
  hints: t.hints || [],
  component: t.id === 1 ? 'mining' : 'poolMining'
}))

export default function Module4() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(4, {
    ...module4Badge,
    moduleId: 4
  })
  useModuleAnalytics(4) // Track module start
  
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'tasks' | 'completed'>('intro')
  const [miningResults, setMiningResults] = useState<MiningResults>({})


  const handleQuestionsCompleteWithAdvance = async (score: number, total: number) => {
    await handleQuestionsComplete(score, total)
    // Auto advance to tasks after 2 seconds
    setTimeout(() => {
      setCurrentSection('tasks')
    }, 2000)
  }

  const handleTasksCompleteWithAdvance = async (completedTasks: number, totalTasks: number) => {
    await handleTasksComplete(completedTasks, totalTasks)
    
    if (completedTasks === totalTasks && progress.questionsCompleted) {
      setTimeout(() => {
        setCurrentSection('completed')
      }, 2000)
    }
  }

  const handleMiningComplete = (hash: string) => {
    setMiningResults(prev => ({
      ...prev,
      hashFound: hash
    }))
  }

  const handlePoolMiningComplete = (rewards: number) => {
    setMiningResults(prev => ({
      ...prev,
      poolRewards: rewards
    }))
  }


  // Calculate overall progress
  const overallProgress = (
    (progress.questionsCompleted ? 40 : 0) +
    (progress.tasksCompleted ? 40 : 0) +
    (progress.badgeEarned ? 20 : 0)
  )

  // Module is now accessible without login - IP auth handles authentication

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
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                Módulo 4
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Module Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-orange-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Mineração no Bitcoin</h1>
              <p className="text-gray-400 mt-2">Aprenda sobre proof-of-work e simule o processo de mineração</p>
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
                  <Zap className="h-6 w-6 text-orange-500 mr-3" />
                  Mineração Bitcoin: Proof-of-Work
                </CardTitle>
                <CardDescription>
                  Descubra como funciona a mineração e a segurança do Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">O que você vai aprender:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>O conceito de prova de trabalho (proof-of-work)</li>
                    <li>Como os mineradores protegem a rede Bitcoin</li>
                    <li>Simulação prática do processo de mineração</li>
                    <li>Como funcionam os pools de mineração</li>
                    <li>Relação entre dificuldade e tempo de bloco</li>
                  </ul>
                </div>
                
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-400 mb-2">⚡ Experiência Prática:</h3>
                  <p className="text-orange-300 text-sm">
                    Você vai usar simuladores reais para entender como funciona a mineração Bitcoin, 
                    experimentando com diferentes níveis de dificuldade e pools de mineração.
                  </p>
                </div>
                
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3"
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
                  Teste seus conhecimentos sobre mineração Bitcoin
                </CardDescription>
              </CardHeader>
            </Card>
            
            <QuestionSystem 
              questions={moduleQuestions}
              onComplete={handleQuestionsCompleteWithAdvance}
              moduleId={4}
            />
          </div>
        )}

        {/* Tasks Section */}
        {currentSection === 'tasks' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">🎯 Simulações Práticas</CardTitle>
                <CardDescription className="text-center">
                  Experimente a mineração Bitcoin com simuladores interativos
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Mining Simulator */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">⛏️ Tarefa 1: Simulador de Mineração</CardTitle>
                <CardDescription>
                  Use o simulador para encontrar um hash válido com 4 zeros iniciais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MiningSimulator 
                  onHashFound={handleMiningComplete}
                  targetZeros={4}
                />
              </CardContent>
            </Card>

            {/* Pool Mining Simulator */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">👥 Tarefa 2: Simulação de Pool Mining</CardTitle>
                <CardDescription>
                  Participe de um pool de mineração por 5 minutos e observe as recompensas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PoolMiningSimulator 
                  onRewardEarned={handlePoolMiningComplete}
                  targetTime={300}
                />
              </CardContent>
            </Card>
            
            <TaskSystem 
              tasks={moduleTasks}
              onComplete={handleTasksCompleteWithAdvance}
              moduleId={4}
            />
          </div>
        )}

        {/* Completion Screen */}
        {currentSection === 'completed' && (
          <Card className="bg-gray-900 border-gray-800 text-center mx-auto max-w-2xl">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl text-green-400 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-center">Parabéns! Módulo Concluído</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Você completou com sucesso o Módulo 4 - Mineração no Bitcoin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              {progress.badgeEarned && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 sm:p-6">
                  <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">Badge Conquistado!</h3>
                  <Badge className="bg-orange-500/20 text-orange-400 text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {module4Badge.name}
                  </Badge>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                    Você dominou os conceitos de mineração Bitcoin e experimentou o processo de proof-of-work
                  </p>
                </div>
              )}

              {/* Summary - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-orange-400">{progress.questionsScore}/2</div>
                  <div className="text-xs sm:text-sm text-gray-400">Perguntas Corretas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-green-400">{progress.tasksScore}/2</div>
                  <div className="text-xs sm:text-sm text-gray-400">Tarefas Concluídas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400">100%</div>
                  <div className="text-xs sm:text-sm text-gray-400">Progresso</div>
                </div>
              </div>

              {/* Mining Results */}
              {(miningResults.hashFound || miningResults.poolRewards) && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">⛏️ Seus Resultados de Mineração:</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    {miningResults.hashFound && (
                      <div>
                        <span className="font-medium">Hash Encontrado:</span>
                        <div className="font-mono text-xs bg-gray-700 p-2 rounded mt-1 break-all">
                          {miningResults.hashFound}
                        </div>
                      </div>
                    )}
                    {miningResults.poolRewards && (
                      <div>
                        <span className="font-medium">Recompensas do Pool:</span>
                        <div className="text-lg font-bold text-green-400">
                          {miningResults.poolRewards.toFixed(6)} BTC
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Learning Summary */}
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-white mb-3 text-sm sm:text-base">🎓 O que você aprendeu:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs sm:text-sm text-left">
                  <li>Proof-of-work é um mecanismo de consenso que garante segurança</li>
                  <li>Mineradores competem para encontrar hashes válidos</li>
                  <li>A dificuldade ajusta automaticamente o tempo entre blocos</li>
                  <li>Pools de mineração permitem cooperação entre mineradores</li>
                  <li>Taxas de transação incentivam a inclusão de transações</li>
                </ul>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  Excelente! Agora você compreende como funciona a mineração Bitcoin. 
                  Continue sua jornada explorando a Lightning Network.
                </p>
                
                {/* Mobile: Stack buttons vertically, Desktop: Side by side */}
                <div className="flex flex-col gap-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-3"
                    onClick={() => {
                      import('@/app/lib/shareAchievement').then(({ generateShareMessage, shareToTwitter }) => {
                        const message = generateShareMessage({ 
                          moduleId: 4, 
                          moduleName: 'Módulo 4', 
                          isEnglish: false
                        })
                        shareToTwitter(message)
                      })
                    }}
                  >
                    🎆 Compartilhar Conquista
                    <Award className="ml-2 h-5 w-5" />
                  </Button>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Link href="/modules/5" className="flex-1">
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-sm sm:text-base py-2 sm:py-3">
                        Próximo Módulo: Lightning Network
                      </Button>
                    </Link>
                    <Link href="/" className="flex-1 sm:flex-initial">
                      <Button variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-300 text-sm sm:text-base py-2 sm:py-3">
                        Voltar ao Início
                      </Button>
                    </Link>
                  </div>
                </div>
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
                className="bg-orange-500 hover:bg-orange-600"
              >
                Ir para Simulações Práticas
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}