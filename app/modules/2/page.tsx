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
import WalletGenerator from '@/app/components/modules/WalletGenerator'
import SeedPhraseDisplay from '@/app/components/modules/SeedPhraseDisplay'
import SecurityEducation from '@/app/components/modules/SecurityEducation'
import { module2Data, module2Questions, module2Tasks, module2Badge } from './data'
import { BitcoinWallet } from '@/app/types'

interface ModuleProgress {
  questionsAnswered: number[]
  tasksCompleted: number[]
  score: number
  completed: boolean
  generatedWallet?: BitcoinWallet
  seedPhrase?: string
}

export default function Module2Page() {
  const { session } = useAuth()
  const [progress, setProgress] = useState<ModuleProgress>({
    questionsAnswered: [],
    tasksCompleted: [],
    score: 0,
    completed: false
  })
  const [currentStep, setCurrentStep] = useState<'intro' | 'education' | 'questions' | 'tasks' | 'reward'>('intro')
  const [isLoading, setIsLoading] = useState(false)

  const totalItems = module2Questions.length + module2Tasks.length
  const completedItems = progress.questionsAnswered.length + progress.tasksCompleted.length
  const progressPercentage = (completedItems / totalItems) * 100

  useEffect(() => {
    // Load progress from localStorage for guest users
    const savedProgress = localStorage.getItem('module2_progress')
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [])

  const saveProgress = (newProgress: ModuleProgress) => {
    setProgress(newProgress)
    localStorage.setItem('module2_progress', JSON.stringify(newProgress))
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
        // Validate Signet address
        isValid = result.startsWith('tb1') && result.length >= 42
      } else if (taskId === 2) {
        // Validate first word of seed phrase
        const savedSeed = progress.seedPhrase
        if (savedSeed) {
          const firstWord = savedSeed.split(' ')[0]
          isValid = result.toLowerCase().trim() === firstWord.toLowerCase()
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
        score: progress.score + 15
      }

      // Check if module is completed
      if (newProgress.questionsAnswered.length === module2Questions.length && 
          newProgress.tasksCompleted.length === module2Tasks.length) {
        newProgress.completed = true
      }

      saveProgress(newProgress)
    } else {
      alert('Resposta incorreta. Tente novamente seguindo as instruções.')
    }
  }

  const handleWalletGenerated = (wallet: BitcoinWallet) => {
    const newProgress = {
      ...progress,
      generatedWallet: wallet
    }
    saveProgress(newProgress)
  }

  const handleSeedConfirmed = (seed: string) => {
    const newProgress = {
      ...progress,
      seedPhrase: seed
    }
    saveProgress(newProgress)
  }

  const handleBadgeClaim = () => {
    alert('🎉 Badge "Guardião da Chave" conquistado! Para salvar permanentemente, faça login.')
  }

  const renderIntro = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🛡️ Bem-vindo ao Módulo de Segurança!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Neste módulo, você aprenderá os conceitos fundamentais de segurança Bitcoin, 
            incluindo chaves privadas, seed phrases e como proteger seus bitcoins.
          </p>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">⚠️ Importante</h3>
            <p className="text-orange-700 text-sm">
              Este módulo requer login para salvar seu progresso com segurança. 
              Você pode praticar como visitante, mas recomendamos fazer login primeiro.
            </p>
          </div>
          <div className="mt-6">
            <Button onClick={() => setCurrentStep('education')} size="lg">
              🚀 Começar Aprendizado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🔒 Educação em Segurança</h2>
        <p className="text-gray-600">Aprenda os fundamentos antes de praticar</p>
      </div>

      <SecurityEducation 
        showLoginComparison={true}
        showBestPractices={true}
        showThreatModel={false}
      />

      <div className="text-center">
        <Button onClick={() => setCurrentStep('questions')} size="lg">
          📝 Fazer Perguntas
        </Button>
      </div>
    </div>
  )

  const renderQuestions = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">📝 Perguntas Teóricas</h2>
        <p className="text-gray-600">Teste seus conhecimentos sobre segurança Bitcoin</p>
      </div>

      {module2Questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onAnswer={(isCorrect) => handleQuestionAnswer(question.id, isCorrect)}
          showResult={progress.questionsAnswered.includes(question.id)}
        />
      ))}

      {progress.questionsAnswered.length === module2Questions.length && (
        <div className="text-center">
          <Button onClick={() => setCurrentStep('tasks')} size="lg">
            🔧 Continuar para Tarefas Práticas
          </Button>
        </div>
      )}
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🔧 Tarefas Práticas</h2>
        <p className="text-gray-600">Pratique criando carteiras e seed phrases</p>
      </div>

      {/* Tarefa 1: Gerar Carteira */}
      <TaskCard
        task={module2Tasks[0]}
        onComplete={(result) => handleTaskComplete(1, result)}
        isCompleted={progress.tasksCompleted.includes(1)}
        customContent={
          <WalletGenerator
            onWalletGenerated={handleWalletGenerated}
            network="signet"
          />
        }
      />

      {/* Tarefa 2: Seed Phrase */}
      <TaskCard
        task={module2Tasks[1]}
        onComplete={(result) => handleTaskComplete(2, result)}
        isCompleted={progress.tasksCompleted.includes(2)}
        customContent={
          <SeedPhraseDisplay
            onSeedConfirmed={handleSeedConfirmed}
            onFirstWordConfirmed={(word) => handleTaskComplete(2, word)}
          />
        }
      />

      {progress.tasksCompleted.length === module2Tasks.length && (
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
        <p className="text-gray-600">Você completou o Módulo 2 com sucesso</p>
      </div>

      <BadgeReward
        {...module2Badge}
        isEarned={progress.completed}
        onClaim={session ? undefined : handleBadgeClaim}
        isLoading={isLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle>📊 Seu Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{progress.score}</div>
              <div className="text-sm text-gray-600">Pontos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{progress.questionsAnswered.length}/{module2Questions.length}</div>
              <div className="text-sm text-gray-600">Perguntas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{progress.tasksCompleted.length}/{module2Tasks.length}</div>
              <div className="text-sm text-gray-600">Tarefas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">🚀 Próximos Passos</h3>
        <p className="mb-4">
          {session 
            ? "Continue para o Módulo 3 e aprenda sobre transações Bitcoin!"
            : "Faça login para salvar seu progresso e acessar todos os módulos!"}
        </p>
        <div className="flex gap-4 justify-center">
          {session ? (
            <Button variant="secondary" size="lg">
              ➡️ Módulo 3: Transações
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
    education: renderEducation,
    questions: renderQuestions,
    tasks: renderTasks,
    reward: renderReward
  }

  return (
    <ModuleLayout>
      <div className="max-w-4xl mx-auto">
        <ModuleHeader
          moduleId={module2Data.id}
          title={module2Data.title}
          description={module2Data.description}
          objectives={module2Data.objectives}
          requiresLogin={module2Data.requiresLogin}
          progress={progressPercentage}
          isAuthenticated={!!session}
        />

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[
              { key: 'intro', label: 'Intro', icon: '🛡️' },
              { key: 'education', label: 'Educação', icon: '📚' },
              { key: 'questions', label: 'Perguntas', icon: '❓' },
              { key: 'tasks', label: 'Tarefas', icon: '🔧' },
              { key: 'reward', label: 'Recompensa', icon: '🏆' }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.key 
                    ? 'bg-blue-600 text-white' 
                    : completedItems > index * (totalItems / 4)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {completedItems > index * (totalItems / 4) ? '✓' : step.icon}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                {index < 4 && <div className="w-8 h-0.5 bg-gray-200"></div>}
              </div>
            ))}
          </div>
        </div>

        {stepComponents[currentStep]()}
      </div>
    </ModuleLayout>
  )
}