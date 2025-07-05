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
import MiningSimulator from '@/app/components/modules/MiningSimulator'
import PoolMiningSimulator from '@/app/components/modules/PoolMiningSimulator'
import HashVisualizer from '@/app/components/modules/HashVisualizer'
import DifficultyExplainer from '@/app/components/modules/DifficultyExplainer'
import { module4Data, module4Questions, module4Tasks, module4Badge } from './data'

interface ModuleProgress {
  questionsAnswered: number[]
  tasksCompleted: number[]
  score: number
  completed: boolean
  miningResults: {
    hashFound?: string
    poolRewards?: number
  }
}

export default function Module4Page() {
  const { session } = useAuth()
  const [progress, setProgress] = useState<ModuleProgress>({
    questionsAnswered: [],
    tasksCompleted: [],
    score: 0,
    completed: false,
    miningResults: {}
  })
  const [currentStep, setCurrentStep] = useState<'intro' | 'theory' | 'questions' | 'mining' | 'pooling' | 'reward'>('intro')
  const [isLoading, setIsLoading] = useState(false)

  const totalItems = module4Questions.length + module4Tasks.length
  const completedItems = progress.questionsAnswered.length + progress.tasksCompleted.length
  const progressPercentage = (completedItems / totalItems) * 100

  useEffect(() => {
    // Load progress from localStorage for guest users
    const savedProgress = localStorage.getItem('module4_progress')
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [])

  const saveProgress = (newProgress: ModuleProgress) => {
    setProgress(newProgress)
    localStorage.setItem('module4_progress', JSON.stringify(newProgress))
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

  const handleMiningComplete = (hash: string, nonce: number) => {
    if (progress.tasksCompleted.includes(1)) return

    const newProgress = {
      ...progress,
      tasksCompleted: [...progress.tasksCompleted, 1],
      score: progress.score + 20,
      miningResults: {
        ...progress.miningResults,
        hashFound: hash
      }
    }

    // Check if module is completed
    if (newProgress.questionsAnswered.length === module4Questions.length && 
        newProgress.tasksCompleted.length === module4Tasks.length) {
      newProgress.completed = true
    }

    saveProgress(newProgress)
  }

  const handlePoolMiningComplete = (rewards: number) => {
    if (progress.tasksCompleted.includes(2)) return

    const newProgress = {
      ...progress,
      tasksCompleted: [...progress.tasksCompleted, 2],
      score: progress.score + 20,
      miningResults: {
        ...progress.miningResults,
        poolRewards: rewards
      }
    }

    // Check if module is completed
    if (newProgress.questionsAnswered.length === module4Questions.length && 
        newProgress.tasksCompleted.length === module4Tasks.length) {
      newProgress.completed = true
    }

    saveProgress(newProgress)
  }

  const handleBadgeClaim = () => {
    alert('🎉 Badge "Minerador Aprendiz" conquistado! Para salvar permanentemente, faça login.')
  }

  const renderIntro = () => (
    <div className="space-y-6">
      <IntroVideo
        title="Mineração Bitcoin: Proof-of-Work"
        description="Entenda como funciona a mineração e a segurança do Bitcoin"
        duration="3 minutos"
        onComplete={() => setCurrentStep('theory')}
      />
    </div>
  )

  const renderTheory = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🔍 Teoria da Mineração</h2>
        <p className="text-gray-600">Explore as bases teóricas do proof-of-work</p>
      </div>

      <HashVisualizer onHashGenerated={(hash) => console.log('Hash generated:', hash)} />
      
      <DifficultyExplainer />

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
        <p className="text-gray-600">Teste seus conhecimentos sobre mineração Bitcoin</p>
      </div>

      {module4Questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onAnswer={(isCorrect) => handleQuestionAnswer(question.id, isCorrect)}
          showResult={progress.questionsAnswered.includes(question.id)}
        />
      ))}

      {progress.questionsAnswered.length === module4Questions.length && (
        <div className="text-center">
          <Button onClick={() => setCurrentStep('mining')} size="lg">
            ⛏️ Começar Simulação de Mineração
          </Button>
        </div>
      )}
    </div>
  )

  const renderMining = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">⛏️ Simulação de Mineração</h2>
        <p className="text-gray-600">Execute o algoritmo de proof-of-work</p>
      </div>

      <MiningSimulator 
        onHashFound={(hash, nonce) => handleMiningComplete(hash, nonce)}
        targetZeros={4}
      />

      {progress.tasksCompleted.includes(1) && (
        <div className="text-center">
          <Button onClick={() => setCurrentStep('pooling')} size="lg">
            👥 Continuar para Pool Mining
          </Button>
        </div>
      )}
    </div>
  )

  const renderPooling = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">👥 Pool Mining</h2>
        <p className="text-gray-600">Simule participação em pool de mineração</p>
      </div>

      <PoolMiningSimulator 
        onRewardEarned={(reward) => handlePoolMiningComplete(reward)}
        targetTime={300} // 5 minutes
      />

      {progress.tasksCompleted.includes(2) && (
        <div className="text-center">
          <Button onClick={() => setCurrentStep('reward')} size="lg">
            🏆 Resgatar Recompensa
          </Button>
        </div>
      )}
    </div>
  )

  const renderReward = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🎉 Parabéns!</h2>
        <p className="text-gray-600">Você completou o Módulo 4 com sucesso</p>
      </div>

      <BadgeReward
        {...module4Badge}
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
              <div className="text-2xl font-bold text-orange-600">{progress.questionsAnswered.length}/{module4Questions.length}</div>
              <div className="text-sm text-gray-600">Perguntas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{progress.tasksCompleted.length}/{module4Tasks.length}</div>
              <div className="text-sm text-gray-600">Tarefas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {progress.miningResults.poolRewards ? progress.miningResults.poolRewards.toFixed(6) : '0.000000'}
              </div>
              <div className="text-sm text-gray-600">BTC Minerado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {progress.miningResults.hashFound && (
        <Card>
          <CardHeader>
            <CardTitle>⛏️ Resultados da Mineração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Hash Encontrado:</span>
                <div className="font-mono text-sm bg-gray-50 p-2 rounded mt-1 break-all">
                  {progress.miningResults.hashFound}
                </div>
              </div>
              {progress.miningResults.poolRewards && (
                <div>
                  <span className="font-medium">Recompensas de Pool:</span>
                  <div className="text-lg font-bold text-green-600">
                    {progress.miningResults.poolRewards.toFixed(6)} BTC
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
            ? "Continue para o Módulo 5 e aprenda sobre Lightning Network!"
            : "Faça login para salvar seu progresso e acessar todos os módulos!"}
        </p>
        <div className="flex gap-4 justify-center">
          {session ? (
            <Button variant="secondary" size="lg">
              ⚡ Módulo 5: Lightning Network
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
    theory: renderTheory,
    questions: renderQuestions,
    mining: renderMining,
    pooling: renderPooling,
    reward: renderReward
  }

  return (
    <ModuleLayout>
      <div className="max-w-4xl mx-auto">
        <ModuleHeader
          moduleId={module4Data.id}
          title={module4Data.title}
          description={module4Data.description}
          objectives={module4Data.objectives}
          requiresLogin={module4Data.requiresLogin}
          progress={progressPercentage}
          isAuthenticated={!!session}
        />

        {/* Step Navigation */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex items-center gap-2 md:gap-4 px-4">
            {[
              { key: 'intro', label: 'Vídeo', icon: '🎬' },
              { key: 'theory', label: 'Teoria', icon: '🧠' },
              { key: 'questions', label: 'Perguntas', icon: '❓' },
              { key: 'mining', label: 'Mineração', icon: '⛏️' },
              { key: 'pooling', label: 'Pool', icon: '👥' },
              { key: 'reward', label: 'Recompensa', icon: '🏆' }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                  currentStep === step.key 
                    ? 'bg-orange-600 text-white' 
                    : completedItems > index * (totalItems / 5)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {completedItems > index * (totalItems / 5) ? '✓' : step.icon}
                </div>
                <span className="text-sm font-medium hidden sm:inline whitespace-nowrap">{step.label}</span>
                {index < 5 && <div className="w-4 md:w-8 h-0.5 bg-gray-200 shrink-0"></div>}
              </div>
            ))}
          </div>
        </div>

        {stepComponents[currentStep]()}
      </div>
    </ModuleLayout>
  )
}