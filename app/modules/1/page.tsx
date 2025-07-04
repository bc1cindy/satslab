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
import { ExplorerGuide } from '@/app/components/modules/ExplorerGuide'
import { module1Data, module1Questions, module1Tasks, module1Badge } from './data'
import { MempoolAPI } from '@/app/lib/bitcoin/mempool-api'

interface ModuleProgress {
  questionsAnswered: number[]
  tasksCompleted: number[]
  score: number
  completed: boolean
}

export default function Module1Page() {
  const { session } = useAuth()
  const [progress, setProgress] = useState<ModuleProgress>({
    questionsAnswered: [],
    tasksCompleted: [],
    score: 0,
    completed: false
  })
  const [currentStep, setCurrentStep] = useState<'intro' | 'guide' | 'questions' | 'tasks' | 'reward'>('intro')
  const [isLoading, setIsLoading] = useState(false)

  const totalItems = module1Questions.length + module1Tasks.length
  const completedItems = progress.questionsAnswered.length + progress.tasksCompleted.length
  const progressPercentage = (completedItems / totalItems) * 100

  useEffect(() => {
    // Load progress from localStorage for guest users
    const savedProgress = localStorage.getItem('module1_progress')
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [])

  const saveProgress = (newProgress: ModuleProgress) => {
    setProgress(newProgress)
    localStorage.setItem('module1_progress', JSON.stringify(newProgress))
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
        // Validate transaction hash
        isValid = await MempoolAPI.validateTransaction(result)
      } else if (taskId === 2) {
        // Validate amount format (basic validation)
        const amount = parseFloat(result)
        isValid = !isNaN(amount) && amount > 0 && amount < 100
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
      if (newProgress.questionsAnswered.length === module1Questions.length && 
          newProgress.tasksCompleted.length === module1Tasks.length) {
        newProgress.completed = true
      }

      saveProgress(newProgress)
    } else {
      alert('Resposta incorreta. Tente novamente seguindo as instruções.')
    }
  }

  const handleBadgeClaim = () => {
    alert('🎉 Badge "Explorador Iniciante" conquistado! Para salvar permanentemente, faça login.')
  }

  const renderIntro = () => (
    <div className="space-y-6">
      <IntroVideo
        title="O que é Bitcoin?"
        description="Conceitos fundamentais sobre Bitcoin e blockchain"
        duration="2 minutos"
        onComplete={() => setCurrentStep('guide')}
      />
    </div>
  )

  const renderGuide = () => (
    <div className="space-y-6">
      <ExplorerGuide onComplete={() => setCurrentStep('questions')} />
    </div>
  )

  const renderQuestions = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">📝 Perguntas Teóricas</h2>
        <p className="text-gray-600">Teste seus conhecimentos sobre Bitcoin e blockchain</p>
      </div>

      {module1Questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onAnswer={(isCorrect) => handleQuestionAnswer(question.id, isCorrect)}
          showResult={progress.questionsAnswered.includes(question.id)}
        />
      ))}

      {progress.questionsAnswered.length === module1Questions.length && (
        <div className="text-center">
          <Button onClick={() => setCurrentStep('tasks')} size="lg">
            ✅ Continuar para Tarefas Práticas
          </Button>
        </div>
      )}
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🔍 Tarefas Práticas</h2>
        <p className="text-gray-600">Explore o mundo real do Bitcoin na rede Signet</p>
      </div>

      {module1Tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={(result) => handleTaskComplete(task.id, result)}
          isCompleted={progress.tasksCompleted.includes(task.id)}
        />
      ))}

      {progress.tasksCompleted.length === module1Tasks.length && (
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
        <p className="text-gray-600">Você completou o Módulo 1 com sucesso</p>
      </div>

      <BadgeReward
        {...module1Badge}
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
              <div className="text-2xl font-bold text-orange-600">{progress.score}</div>
              <div className="text-sm text-gray-600">Pontos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{progress.questionsAnswered.length}/{module1Questions.length}</div>
              <div className="text-sm text-gray-600">Perguntas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{progress.tasksCompleted.length}/{module1Tasks.length}</div>
              <div className="text-sm text-gray-600">Tarefas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">🚀 Próximos Passos</h3>
        <p className="mb-4">
          {session 
            ? "Continue para o Módulo 2 e aprenda sobre segurança Bitcoin!"
            : "Faça login para salvar seu progresso e acessar todos os módulos!"}
        </p>
        <div className="flex gap-4 justify-center">
          {session ? (
            <Button variant="secondary" size="lg">
              ➡️ Módulo 2: Segurança
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
    guide: renderGuide,
    questions: renderQuestions,
    tasks: renderTasks,
    reward: renderReward
  }

  return (
    <ModuleLayout>
      <div className="max-w-4xl mx-auto">
        <ModuleHeader
          moduleId={module1Data.id}
          title={module1Data.title}
          description={module1Data.description}
          objectives={module1Data.objectives}
          requiresLogin={module1Data.requiresLogin}
          progress={progressPercentage}
          isAuthenticated={!!session}
        />

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[
              { key: 'intro', label: 'Vídeo', icon: '🎬' },
              { key: 'guide', label: 'Guia', icon: '🗺️' },
              { key: 'questions', label: 'Perguntas', icon: '❓' },
              { key: 'tasks', label: 'Tarefas', icon: '🔍' },
              { key: 'reward', label: 'Recompensa', icon: '🏆' }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.key 
                    ? 'bg-orange-600 text-white' 
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