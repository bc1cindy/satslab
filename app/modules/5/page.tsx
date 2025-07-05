'use client'

import { useState, useEffect } from 'react'
import { ModuleLayout } from '@/app/components/layout/ModuleLayout'
import { ModuleHeader } from '@/app/components/modules/ModuleHeader'
import { QuestionCard } from '@/app/components/modules/QuestionCard'
import { TaskCard } from '@/app/components/modules/TaskCard'
import { BadgeReward } from '@/app/components/modules/BadgeReward'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { IntroVideo } from '@/app/components/modules/IntroVideo'
import WalletSetupGuide from '@/app/components/modules/WalletSetupGuide'
import LightningPaymentDemo from '@/app/components/modules/LightningPaymentDemo'
import LightningChannelDiagram from '@/app/components/modules/LightningChannelDiagram'
import { module5Data, module5Questions, module5Tasks, module5Badge } from './data'

interface ModuleProgress {
  questionsAnswered: number[]
  tasksCompleted: number[]
  score: number
  completed: boolean
  lightningResults: {
    walletAddress?: string
    paymentHash?: string
    channelFee?: number
  }
}

export default function Module5Page() {
  const { session } = useAuth()
  const [progress, setProgress] = useState<ModuleProgress>({
    questionsAnswered: [],
    tasksCompleted: [],
    score: 0,
    completed: false,
    lightningResults: {}
  })
  const [currentStep, setCurrentStep] = useState<'intro' | 'overview' | 'questions' | 'setup' | 'payments' | 'channels' | 'reward'>('intro')
  const [isLoading, setIsLoading] = useState(false)

  const totalItems = module5Questions.length + module5Tasks.length
  const completedItems = progress.questionsAnswered.length + progress.tasksCompleted.length
  const progressPercentage = (completedItems / totalItems) * 100

  useEffect(() => {
    // Load progress from localStorage for guest users
    const savedProgress = localStorage.getItem('module5_progress')
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [])

  const saveProgress = (newProgress: ModuleProgress) => {
    setProgress(newProgress)
    localStorage.setItem('module5_progress', JSON.stringify(newProgress))
  }

  const handleQuestionAnswer = (questionId: number, isCorrect: boolean) => {
    if (progress.questionsAnswered.includes(questionId)) return

    const newProgress = {
      ...progress,
      questionsAnswered: [...progress.questionsAnswered, questionId],
      score: progress.score + (isCorrect ? 10 : 0)
    }

    saveProgress(newProgress)
  }

  const handleTaskComplete = async (taskId: number, result: string) => {
    if (progress.tasksCompleted.includes(taskId)) return

    setIsLoading(true)
    let isValid = false

    try {
      if (taskId === 1) {
        // Validate Lightning address/invoice
        isValid = result.startsWith('lnbc') || result.includes('@') || result.length > 20
        if (isValid) {
          setProgress(prev => ({
            ...prev,
            lightningResults: {
              ...prev.lightningResults,
              walletAddress: result
            }
          }))
        }
      } else if (taskId === 2) {
        // Validate payment hash
        isValid = result.length === 64 && /^[a-fA-F0-9]+$/.test(result)
        if (isValid) {
          setProgress(prev => ({
            ...prev,
            lightningResults: {
              ...prev.lightningResults,
              paymentHash: result
            }
          }))
        }
      } else if (taskId === 3) {
        // Validate fee amount
        const fee = parseFloat(result)
        isValid = !isNaN(fee) && fee > 0 && fee < 10000
        if (isValid) {
          setProgress(prev => ({
            ...prev,
            lightningResults: {
              ...prev.lightningResults,
              channelFee: fee
            }
          }))
        }
      }
    } catch (error) {
      console.error('Validation error:', error)
    }

    setIsLoading(false)

    if (isValid) {
      const newProgress = {
        ...progress,
        tasksCompleted: [...progress.tasksCompleted, taskId],
        score: progress.score + 20
      }

      // Check if module is completed
      if (newProgress.questionsAnswered.length === module5Questions.length && 
          newProgress.tasksCompleted.length === module5Tasks.length) {
        newProgress.completed = true
      }

      saveProgress(newProgress)
    } else {
      alert('Resposta incorreta. Verifique o formato e tente novamente.')
    }
  }

  const handleWalletSetup = (address: string) => {
    if (!progress.tasksCompleted.includes(1)) {
      handleTaskComplete(1, address)
    }
  }

  const handlePaymentComplete = (paymentHash: string) => {
    if (!progress.tasksCompleted.includes(2)) {
      handleTaskComplete(2, paymentHash)
    }
  }

  const handleBadgeClaim = () => {
    alert('🎉 Badge "Raio Rápido" conquistado! Para salvar permanentemente, faça login.')
  }

  const renderIntro = () => (
    <div className="space-y-6">
      <IntroVideo
        title="Lightning Network: Bitcoin Instantâneo"
        description="Conheça a solução de segunda camada do Bitcoin"
        duration="4 minutos"
        onComplete={() => setCurrentStep('overview')}
      />
    </div>
  )

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">⚡ Visão Geral Lightning</h2>
        <p className="text-gray-600">Entenda como funcionam os canais de pagamento</p>
      </div>

      <LightningChannelDiagram />

      <div className="text-center">
        <Button onClick={() => setCurrentStep('questions')} size="lg">
          ✅ Continuar para Perguntas
        </Button>
      </div>
    </div>
  )

  const renderQuestions = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">📝 Perguntas Teóricas</h2>
        <p className="text-gray-600">Teste seus conhecimentos sobre Lightning Network</p>
      </div>

      {module5Questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onAnswer={(isCorrect) => handleQuestionAnswer(question.id, isCorrect)}
          showResult={progress.questionsAnswered.includes(question.id)}
        />
      ))}

      {progress.questionsAnswered.length === module5Questions.length && (
        <div className="text-center">
          <Button onClick={() => setCurrentStep('setup')} size="lg">
            📱 Configurar Carteira Lightning
          </Button>
        </div>
      )}
    </div>
  )

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">📱 Configuração de Carteira</h2>
        <p className="text-gray-600">Configure Phoenix ou Breez para usar Lightning</p>
      </div>

      <WalletSetupGuide 
        onAddressGenerated={(address) => handleWalletSetup(address)}
      />

      {progress.tasksCompleted.includes(1) && (
        <div className="text-center">
          <Button onClick={() => setCurrentStep('payments')} size="lg">
            💸 Fazer Pagamentos Lightning
          </Button>
        </div>
      )}
    </div>
  )

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">💸 Pagamentos Lightning</h2>
        <p className="text-gray-600">Experimente transações instantâneas</p>
      </div>

      <LightningPaymentDemo 
        onPaymentCompleted={(payment) => handlePaymentComplete(payment.preimage || 'demo_payment_hash')}
      />

      {/* Manual Task Completion */}
      <div className="space-y-4">
        {module5Tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={(result) => handleTaskComplete(task.id, result)}
            isCompleted={progress.tasksCompleted.includes(task.id)}
          />
        ))}
      </div>

      {progress.tasksCompleted.length === module5Tasks.length && (
        <div className="text-center">
          <Button onClick={() => setCurrentStep('channels')} size="lg">
            🔗 Entender Canais Lightning
          </Button>
        </div>
      )}
    </div>
  )

  const renderChannels = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🔗 Gestão de Canais</h2>
        <p className="text-gray-600">Aprenda sobre abertura e fechamento de canais</p>
      </div>

      <LightningChannelDiagram />

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-4">💡 Pontos Importantes</h3>
        <div className="space-y-2 text-blue-700">
          <div>• <strong>Canais Lightning:</strong> Permitem transações instantâneas off-chain</div>
          <div>• <strong>Taxas baixas:</strong> Apenas alguns satoshis por transação</div>
          <div>• <strong>Roteamento:</strong> Pagamentos podem passar por múltiplos canais</div>
          <div>• <strong>Fechamento:</strong> Resulta em transação on-chain com taxa maior</div>
        </div>
      </div>

      <div className="text-center">
        <Button onClick={() => setCurrentStep('reward')} size="lg">
          🏆 Resgatar Recompensa
        </Button>
      </div>
    </div>
  )

  const renderReward = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🎉 Parabéns!</h2>
        <p className="text-gray-600">Você completou o Módulo 5 com sucesso</p>
      </div>

      <BadgeReward
        {...module5Badge}
        isEarned={progress.completed}
        onClaim={session ? undefined : handleBadgeClaim}
        isLoading={isLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle>📊 Seu Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">{progress.score}</div>
              <div className="text-sm text-gray-600">Pontos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{progress.questionsAnswered.length}/{module5Questions.length}</div>
              <div className="text-sm text-gray-600">Perguntas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{progress.tasksCompleted.length}/{module5Tasks.length}</div>
              <div className="text-sm text-gray-600">Tarefas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {progress.lightningResults.channelFee || 0}
              </div>
              <div className="text-sm text-gray-600">Sats Taxa</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {progress.lightningResults.walletAddress && (
        <Card>
          <CardHeader>
            <CardTitle>⚡ Resultados Lightning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Endereço/Invoice:</span>
                <div className="font-mono text-sm bg-gray-50 p-2 rounded mt-1 break-all">
                  {progress.lightningResults.walletAddress}
                </div>
              </div>
              {progress.lightningResults.paymentHash && (
                <div>
                  <span className="font-medium">Hash de Pagamento:</span>
                  <div className="font-mono text-sm bg-gray-50 p-2 rounded mt-1 break-all">
                    {progress.lightningResults.paymentHash}
                  </div>
                </div>
              )}
              {progress.lightningResults.channelFee && (
                <div>
                  <span className="font-medium">Taxa de Fechamento:</span>
                  <div className="text-lg font-bold text-red-600">
                    {progress.lightningResults.channelFee} satoshis
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">🚀 Próximos Passos</h3>
        <p className="mb-4">
          {session 
            ? "Parabéns! Você dominou os conceitos fundamentais do Bitcoin!"
            : "Faça login para salvar seu progresso e acessar certificados!"}
        </p>
        <div className="flex gap-4 justify-center">
          {session ? (
            <Button variant="secondary" size="lg">
              🎓 Ver Certificado
            </Button>
          ) : (
            <Button variant="secondary" size="lg">
              🔐 Fazer Login
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  const stepComponents = {
    intro: renderIntro,
    overview: renderOverview,
    questions: renderQuestions,
    setup: renderSetup,
    payments: renderPayments,
    channels: renderChannels,
    reward: renderReward
  }

  return (
    <ModuleLayout>
      <div className="max-w-4xl mx-auto">
        <ModuleHeader
          moduleId={module5Data.id}
          title={module5Data.title}
          description={module5Data.description}
          objectives={module5Data.objectives}
          requiresLogin={module5Data.requiresLogin}
          progress={progressPercentage}
          isAuthenticated={!!session}
        />

        {/* Step Navigation */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex items-center gap-2 md:gap-4 px-4">
            {[
              { key: 'intro', label: 'Vídeo', icon: '🎬' },
              { key: 'overview', label: 'Visão', icon: '👁️' },
              { key: 'questions', label: 'Perguntas', icon: '❓' },
              { key: 'setup', label: 'Setup', icon: '📱' },
              { key: 'payments', label: 'Pagamentos', icon: '💸' },
              { key: 'channels', label: 'Canais', icon: '🔗' },
              { key: 'reward', label: 'Recompensa', icon: '🏆' }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                  currentStep === step.key 
                    ? 'bg-orange-600 text-white' 
                    : completedItems > index * (totalItems / 6)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {completedItems > index * (totalItems / 6) ? '✓' : step.icon}
                </div>
                <span className="text-sm font-medium hidden sm:inline whitespace-nowrap">{step.label}</span>
                {index < 6 && <div className="w-2 md:w-4 h-0.5 bg-gray-200 shrink-0"></div>}
              </div>
            ))}
          </div>
        </div>

        {stepComponents[currentStep]()}
      </div>
    </ModuleLayout>
  )
}