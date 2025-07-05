'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { VideoIntro } from '@/app/components/modules/VideoIntro'
import { HintSystem } from '@/app/components/modules/HintSystem'
import { transactionValidator } from '@/app/lib/bitcoin/transaction-validator'
import { progressService } from '@/app/lib/supabase/progress-service'
import { module1Data, module1Questions, module1Tasks, module1Badge } from '@/app/modules/1/data'
import { 
  ChevronLeft, ChevronRight, Trophy, Clock, CheckCircle, Circle,
  HelpCircle, ExternalLink, Loader2, AlertCircle
} from 'lucide-react'

interface ModulePageProps {
  params: {
    id: string
  }
}

export default function ModulePage({ params }: ModulePageProps) {
  const moduleId = parseInt(params.id)
  const { session } = useAuth()
  
  // State management
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({})
  const [taskInputs, setTaskInputs] = useState<{[key: number]: string}>({})
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([])
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [hintsUsed, setHintsUsed] = useState<number[]>([])
  const [taskAttempts, setTaskAttempts] = useState<{[key: number]: number}>({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())
  const [videoCompleted, setVideoCompleted] = useState(false)
  const [loading, setLoading] = useState<{[key: string]: boolean}>({})
  const [validationResults, setValidationResults] = useState<{[key: number]: any}>({})
  const [badgeEarned, setBadgeEarned] = useState(false)

  // Module data - for now, just Module 1
  const moduleData = moduleId === 1 ? module1Data : null
  const questions = moduleId === 1 ? module1Questions : []
  const tasks = moduleId === 1 ? module1Tasks : []
  const badge = moduleId === 1 ? module1Badge : null

  // Timer effect
  useEffect(() => {
    if (!moduleData) return

    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, moduleData])

  // Load progress on mount
  useEffect(() => {
    if (!moduleData) return
    
    if (session?.user?.publicKey) {
      loadProgress()
      checkBadgeStatus()
    }
  }, [session, moduleData])

  // Save progress when state changes
  useEffect(() => {
    if (!moduleData) return
    
    if (session?.user?.publicKey) {
      saveProgress()
    }
  }, [completedQuestions, completedTasks, hintsUsed, timeSpent, session, moduleData])

  const loadProgress = async () => {
    if (!session?.user?.publicKey) return

    try {
      const progress = await progressService.getModuleProgress(session.user.publicKey, moduleId)
      if (progress) {
        setCompletedQuestions(progress.completed_questions || [])
        setCompletedTasks(progress.completed_tasks || [])
        setHintsUsed(progress.hints_used || [])
        setTimeSpent(progress.time_spent || 0)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const checkBadgeStatus = async () => {
    if (!session?.user?.publicKey) return

    try {
      const earned = await progressService.checkBadgeEarned(session.user.publicKey, moduleId)
      setBadgeEarned(earned)
    } catch (error) {
      console.error('Error checking badge status:', error)
    }
  }

  const saveProgress = async () => {
    if (!session?.user?.publicKey) return

    try {
      const isCompleted = completedQuestions.length === questions.length && 
                         completedTasks.length === tasks.length

      await progressService.saveModuleProgress({
        user_id: session.user.publicKey,
        module_id: moduleId,
        completed_questions: completedQuestions,
        completed_tasks: completedTasks,
        hints_used: hintsUsed,
        time_spent: timeSpent,
        attempts: Object.values(taskAttempts).reduce((sum, att) => sum + att, 0),
        completed_at: isCompleted ? new Date().toISOString() : undefined,
        badge_earned: badgeEarned
      })
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setSelectedAnswers({...selectedAnswers, [questionId]: answerIndex})
    
    const question = questions.find(q => q.id === questionId)
    if (question && answerIndex === question.correctAnswer) {
      if (!completedQuestions.includes(questionId)) {
        setCompletedQuestions([...completedQuestions, questionId])
      }
    } else {
      // Remove from completed if wrong answer is selected
      setCompletedQuestions(completedQuestions.filter(id => id !== questionId))
    }
  }

  const handleTaskValidation = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId)
    const input = taskInputs[taskId]?.trim()
    
    if (!task || !input) return

    setLoading({...loading, [`task_${taskId}`]: true})
    
    // Increment attempts
    setTaskAttempts({
      ...taskAttempts, 
      [taskId]: (taskAttempts[taskId] || 0) + 1
    })

    try {
      let result

      if (task.validation.type === 'hash') {
        result = await transactionValidator.validateTransactionHash(input)
      } else if (task.validation.type === 'amount') {
        const amount = parseFloat(input)
        if (isNaN(amount)) {
          result = {
            isValid: false,
            message: 'Por favor, insira um número válido.'
          }
        } else {
          // For amount validation, we need a transaction hash from previous task
          const previousHash = taskInputs[1] // Assuming task 1 has the hash
          if (!previousHash) {
            result = {
              isValid: false,
              message: 'Complete a tarefa anterior primeiro para obter um hash de transação.'
            }
          } else {
            result = await transactionValidator.validateTransactionAmount(previousHash, amount)
          }
        }
      } else {
        result = {
          isValid: false,
          message: 'Tipo de validação não suportado.'
        }
      }

      setValidationResults({...validationResults, [taskId]: result})

      if (result.isValid && !completedTasks.includes(taskId)) {
        setCompletedTasks([...completedTasks, taskId])
      }

    } catch (error) {
      setValidationResults({
        ...validationResults, 
        [taskId]: {
          isValid: false,
          message: 'Erro ao validar. Tente novamente.'
        }
      })
    } finally {
      setLoading({...loading, [`task_${taskId}`]: false})
    }
  }

  const handleHintUsed = (taskId: number, hintIndex: number) => {
    const hintId = taskId * 100 + hintIndex // Create unique hint ID
    if (!hintsUsed.includes(hintId)) {
      setHintsUsed([...hintsUsed, hintId])
    }
  }

  const handleBadgeClaim = async () => {
    if (!session?.user?.publicKey || !badge) return

    try {
      setLoading({...loading, badge: true})
      
      const result = await progressService.awardBadge({
        user_id: session.user.publicKey,
        module_id: moduleId,
        badge_name: badge.name,
        badge_type: badge.type,
        metadata: {
          description: badge.description,
          time_spent: timeSpent,
          hints_used: hintsUsed.length
        }
      })

      if (result.success) {
        setBadgeEarned(true)
      }
    } catch (error) {
      console.error('Error claiming badge:', error)
    } finally {
      setLoading({...loading, badge: false})
    }
  }

  // Calculate progress
  const questionsProgress = questions.length > 0 ? (completedQuestions.length / questions.length) * 100 : 0
  const tasksProgress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0
  const overallProgress = (questionsProgress + tasksProgress) / 2

  const allCompleted = completedQuestions.length === questions.length && 
                      completedTasks.length === tasks.length
  const canClaimBadge = allCompleted && !badgeEarned && session?.user

  if (!moduleData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Módulo não encontrado</h1>
          <Link href="/modules">
            <Button>Voltar aos Módulos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/modules" className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
              <span>Voltar aos Módulos</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                </span>
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
            <div className="p-3 rounded-xl bg-blue-500/10">
              <div className="h-8 w-8 text-blue-400">📚</div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{moduleData.title}</h1>
              <p className="text-gray-400 mt-1">{moduleData.description}</p>
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
              
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Perguntas:</span>
                  <span className="text-gray-300">{completedQuestions.length}/{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tarefas:</span>
                  <span className="text-gray-300">{completedTasks.length}/{tasks.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Introduction */}
        <VideoIntro
          title="Introdução: O que é Bitcoin?"
          description="Uma explicação amigável sobre Bitcoin, blockchain e como tudo funciona"
          duration="2:30"
          onComplete={() => setVideoCompleted(true)}
          isCompleted={videoCompleted}
        />

        {/* Content Tabs */}
        <Tabs defaultValue="theory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800">
            <TabsTrigger value="theory" className="data-[state=active]:bg-gray-800">
              Perguntas Teóricas ({completedQuestions.length}/{questions.length})
            </TabsTrigger>
            <TabsTrigger value="practice" className="data-[state=active]:bg-gray-800">
              Tarefas Práticas ({completedTasks.length}/{tasks.length})
            </TabsTrigger>
          </TabsList>

          {/* Theory Tab */}
          <TabsContent value="theory" className="space-y-6">
            {questions.map((question, index) => {
              const isAnswered = selectedAnswers[question.id] !== undefined
              const isCorrect = selectedAnswers[question.id] === question.correctAnswer
              const isCompleted = completedQuestions.includes(question.id)

              return (
                <Card key={question.id} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <span>Pergunta {index + 1}</span>
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-white">
                      {question.question}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <Button
                          key={optionIndex}
                          variant="outline"
                          className={`w-full justify-start text-left h-auto p-4 transition-colors ${
                            selectedAnswers[question.id] === optionIndex
                              ? isCorrect
                                ? 'bg-green-900/50 border-green-500 text-green-200'
                                : 'bg-red-900/50 border-red-500 text-red-200'
                              : 'bg-transparent text-white border-gray-700 hover:bg-gray-800'
                          }`}
                          onClick={() => handleAnswerSelect(question.id, optionIndex)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>

                    {isAnswered && (
                      <Alert className={isCorrect ? 'bg-green-900/30 border-green-500/50' : 'bg-red-900/30 border-red-500/50'}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className={isCorrect ? 'text-green-200' : 'text-red-200'}>
                          {isCorrect ? '✅ Correto! ' : '❌ Incorreto. '}
                          {question.explanation}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-6">
            {tasks.map((task, index) => {
              const isCompleted = completedTasks.includes(task.id)
              const attempts = taskAttempts[task.id] || 0
              const validationResult = validationResults[task.id]

              return (
                <Card key={task.id} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <span>{task.title}</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {task.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Instructions */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-white">Instruções:</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {task.instructions.map((instruction, idx) => (
                          <li key={idx}>{instruction}</li>
                        ))}
                      </ul>
                    </div>

                    {/* External Link */}
                    {task.type === 'explorer' && (
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <a href="https://mempool.space/signet" target="_blank" rel="noopener noreferrer">
                          Abrir Mempool Signet
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}

                    {/* Input Field */}
                    <div className="space-y-2">
                      <Label htmlFor={`task-${task.id}`} className="text-white">
                        {task.validation.type === 'hash' ? 'Hash da Transação' : 'Valor (sBTC)'}
                      </Label>
                      <Input
                        id={`task-${task.id}`}
                        placeholder={task.validation.placeholder}
                        className="font-mono text-sm bg-gray-800 border-gray-600 text-white"
                        value={taskInputs[task.id] || ''}
                        onChange={(e) => setTaskInputs({...taskInputs, [task.id]: e.target.value})}
                        type={task.validation.type === 'amount' ? 'number' : 'text'}
                        step={task.validation.type === 'amount' ? '0.00000001' : undefined}
                      />
                    </div>

                    {/* Validation Button */}
                    <Button 
                      className="w-full" 
                      onClick={() => handleTaskValidation(task.id)}
                      disabled={!taskInputs[task.id]?.trim() || loading[`task_${task.id}`]}
                    >
                      {loading[`task_${task.id}`] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        'Validar Resposta'
                      )}
                    </Button>

                    {/* Validation Result */}
                    {validationResult && (
                      <Alert className={validationResult.isValid ? 'bg-green-900/30 border-green-500/50' : 'bg-red-900/30 border-red-500/50'}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className={validationResult.isValid ? 'text-green-200' : 'text-red-200'}>
                          {validationResult.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Hints System */}
                    <HintSystem
                      hints={task.hints || []}
                      taskId={`task_${task.id}`}
                      attempts={attempts}
                      timeSpent={timeSpent}
                      onHintUsed={(hintIndex) => handleHintUsed(task.id, hintIndex)}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>

        {/* Badge Reward */}
        {badge && (
          <Card className="mt-8 border-2 border-dashed border-orange-500/50 bg-gray-900">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Recompensa do Módulo</h3>
                <p className="text-gray-400 mb-4">{badge.description}</p>
                
                <Badge
                  variant="secondary"
                  className="text-lg px-4 py-2 bg-orange-500/20 text-orange-400 border-orange-500/50 mb-4"
                >
                  🏆 {badge.name}
                </Badge>

                {badgeEarned ? (
                  <Alert className="bg-green-900/30 border-green-500/50 max-w-md mx-auto">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-200">
                      <strong>Badge Conquistado!</strong> Parabéns por completar o módulo.
                    </AlertDescription>
                  </Alert>
                ) : canClaimBadge ? (
                  <Button 
                    onClick={handleBadgeClaim}
                    disabled={loading.badge}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loading.badge ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resgatando...
                      </>
                    ) : (
                      'Resgatar Badge'
                    )}
                  </Button>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Complete todas as perguntas e tarefas para resgatar o badge
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" asChild>
            <Link href="/modules">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar aos Módulos
            </Link>
          </Button>

          {moduleId < 7 && (
            <Button asChild disabled={!allCompleted}>
              <Link href={`/modules/${moduleId + 1}`}>
                Próximo Módulo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}