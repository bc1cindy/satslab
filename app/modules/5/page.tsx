'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, Zap, Trophy, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import { useModuleAnalytics } from '@/app/hooks/useAnalytics'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import { module5Questions, module5Tasks, module5Badge } from './data'

// Types
interface LightningResults {
  walletAddress?: string
  paymentHash?: string
  channelFee?: number
  completedPayments?: number
  channelsOpened?: number
}

// Use imported data - converting format
const moduleQuestions = module5Questions.map(q => ({
  id: q.id.toString(),
  question: q.question,
  options: q.options,
  correct: q.correctAnswer,
  explanation: q.explanation,
  hint: ''
}))

const moduleTasks = module5Tasks.map(t => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  instructions: t.instructions,
  inputLabel: t.validation.type === 'address' ? 'Endereço Lightning' :
              t.validation.type === 'transaction' ? 'Hash da Transação Lightning' :
              t.validation.type === 'amount' ? 'Taxa On-chain (satoshis)' :
              'Resposta',
  inputPlaceholder: t.validation.placeholder || '',
  validationType: t.validation.type as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints || [],
  externalLinks: []
}))

export default function Module5() {
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')
  
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(5, {
    ...module5Badge,
    moduleId: 5
  })
  useModuleAnalytics(5) // Track module start
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'tasks' | 'completed'>('intro')
  const [lightningResults, setLightningResults] = useState<LightningResults>({})

  // Translations
  const t = {
    nextModule: isEnglish ? 'Next Module: Taproot and Ordinals' : 'Próximo Módulo: Taproot e Ordinals',
    backToHome: isEnglish ? 'Back to Home' : 'Voltar ao Início',
    continueJourney: isEnglish ? 'Excellent! Now you have practical experience with Lightning Network using a fully integrated wallet. Continue your journey exploring Taproot and Ordinals.' : 'Excelente! Agora você tem experiência prática com Lightning Network usando uma carteira totalmente integrada. Continue sua jornada explorando Taproot e Ordinals.'
  }

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
              <div className="text-sm text-gray-400">
                Tempo: {Math.floor(progress.timeSpent / 60)}m {progress.timeSpent % 60}s
              </div>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                Módulo 5
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Module Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-yellow-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Lightning Network</h1>
              <p className="text-gray-400 mt-2">Pagamentos instantâneos e escalabilidade Bitcoin</p>
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
                  <Zap className="h-6 w-6 text-yellow-500 mr-3" />
                  Bem-vindo à Lightning Network!
                </CardTitle>
                <CardDescription>
                  Aprenda sobre pagamentos Bitcoin instantâneos e com taxas baixíssimas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">O que você vai aprender:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>O conceito de camadas de escalabilidade</li>
                    <li>Como funcionam os canais Lightning</li>
                    <li>Realizar pagamentos instantâneos</li>
                    <li>Gerenciar canais e roteamento</li>
                    <li>Comparar taxas Lightning vs on-chain</li>
                    <li>Experiência prática com carteira integrada</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-400 mb-2">⚡ Experiência Integrada:</h3>
                  <p className="text-yellow-300 text-sm">
                    Você vai usar uma carteira Lightning totalmente integrada ao site, simular 
                    canais de pagamento e experimentar a velocidade dos pagamentos instantâneos 
                    sem precisar baixar nenhum aplicativo.
                  </p>
                </div>
                
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-lg px-8 py-3"
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
                  Teste seus conhecimentos sobre Lightning Network
                </CardDescription>
              </CardHeader>
            </Card>
            
            <QuestionSystem 
              questions={moduleQuestions}
              onComplete={handleQuestionsCompleteWithAdvance}
              moduleId={5}
            />
          </div>
        )}

        {/* Tasks Section */}
        {currentSection === 'tasks' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">🎯 Experiência Lightning Integrada</CardTitle>
                <CardDescription className="text-center">
                  Use uma carteira Lightning completa integrada ao site
                </CardDescription>
              </CardHeader>
            </Card>
            
            <TaskSystem 
              tasks={moduleTasks}
              onComplete={handleTasksCompleteWithAdvance}
              moduleId={5}
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
                Você completou com sucesso o Módulo 5 - Lightning Network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              {progress.badgeEarned && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 sm:p-6">
                  <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">Badge Conquistado!</h3>
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {module5Badge.name}
                  </Badge>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                    Você dominou a Lightning Network e experimentou pagamentos instantâneos
                  </p>
                </div>
              )}

              {/* Summary - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-400">{progress.questionsScore}/2</div>
                  <div className="text-xs sm:text-sm text-gray-400">Perguntas Corretas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-green-400">{progress.tasksScore}/3</div>
                  <div className="text-xs sm:text-sm text-gray-400">Tarefas Concluídas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400">{Math.floor(progress.timeSpent / 60)}m</div>
                  <div className="text-xs sm:text-sm text-gray-400">Tempo Total</div>
                </div>
              </div>

              {/* Lightning Results */}
              {(lightningResults.walletAddress || lightningResults.paymentHash || lightningResults.channelFee || lightningResults.completedPayments || lightningResults.channelsOpened) && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">⚡ Seus Resultados Lightning:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    {lightningResults.walletAddress && (
                      <div>
                        <span className="font-medium">Carteira Configurada:</span>
                        <div className="font-mono text-xs bg-gray-700 p-2 rounded mt-1 break-all">
                          {lightningResults.walletAddress}
                        </div>
                      </div>
                    )}
                    {lightningResults.paymentHash && (
                      <div>
                        <span className="font-medium">Último Pagamento:</span>
                        <div className="font-mono text-xs bg-gray-700 p-2 rounded mt-1 break-all">
                          {lightningResults.paymentHash}
                        </div>
                      </div>
                    )}
                    {lightningResults.completedPayments && (
                      <div>
                        <span className="font-medium">Pagamentos Realizados:</span>
                        <div className="text-lg font-bold text-green-400">
                          {lightningResults.completedPayments}
                        </div>
                      </div>
                    )}
                    {lightningResults.channelsOpened && (
                      <div>
                        <span className="font-medium">Canais Abertos:</span>
                        <div className="text-lg font-bold text-blue-400">
                          {lightningResults.channelsOpened}
                        </div>
                      </div>
                    )}
                    {lightningResults.channelFee && (
                      <div>
                        <span className="font-medium">Taxa de Fechamento Estimada:</span>
                        <div className="text-lg font-bold text-red-400">
                          {lightningResults.channelFee} satoshis
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
                  <li>Lightning Network é uma solução de segunda camada para escalabilidade</li>
                  <li>Pagamentos Lightning são instantâneos e com taxas baixíssimas</li>
                  <li>Canais permitem múltiplas transações sem tocar a blockchain</li>
                  <li>Roteamento permite pagamentos entre usuários sem canais diretos</li>
                  <li>Abertura e fechamento de canais requerem transações on-chain</li>
                  <li>Gerenciamento de carteira Lightning e canais na prática</li>
                  <li>Simulação completa de pagamentos off-chain</li>
                </ul>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {t.continueJourney}
                </p>
                
                {/* Mobile: Stack buttons vertically, Desktop: Side by side */}
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link href="/modules/6" className="w-full sm:flex-1">
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-sm sm:text-base py-2 sm:py-3">
                      {t.nextModule}
                    </Button>
                  </Link>
                  <Link href="/" className="w-full sm:flex-initial">
                    <Button variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-300 text-sm sm:text-base py-2 sm:py-3">
                      {t.backToHome}
                    </Button>
                  </Link>
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
                className="bg-yellow-500 hover:bg-yellow-600"
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