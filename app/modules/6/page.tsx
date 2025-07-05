'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { ModuleLayout } from '@/app/components/layout/ModuleLayout'
import { QuestionCard } from '@/app/components/modules/QuestionCard'
import { TaskCard } from '@/app/components/modules/TaskCard'
import { BadgeReward } from '@/app/components/modules/BadgeReward'
import OrdinalsCreator from '@/app/components/modules/OrdinalsCreator'
import TaprootTransactions from '@/app/components/modules/TaprootTransactions'
import BadgeNFTCreator from '@/app/components/modules/BadgeNFTCreator'
import { module6Data, module6Questions, module6Tasks, module6Badge } from './data'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { useToast } from '@/app/hooks/use-toast'

export default function Module6Page() {
  const auth = useAuth()
  const user = auth?.user
  const { toast } = useToast()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [questionsCompleted, setQuestionsCompleted] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(false)
  const [moduleCompleted, setModuleCompleted] = useState(false)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [taskResults, setTaskResults] = useState<string[]>([])
  const [createdOrdinals, setCreatedOrdinals] = useState<string[]>([])

  const handleQuestionAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[questionIndex] = answerIndex
    setUserAnswers(newAnswers)

    const isCorrect = answerIndex === module6Questions[questionIndex].correctAnswer
    
    if (isCorrect) {
      toast({
        title: "Resposta Correta!",
        description: module6Questions[questionIndex].explanation,
      })
      
      if (questionIndex < module6Questions.length - 1) {
        setCurrentQuestionIndex(questionIndex + 1)
      } else {
        setQuestionsCompleted(true)
        toast({
          title: "Teoria Concluída!",
          description: "Agora você pode prosseguir para as tarefas práticas",
        })
      }
    } else {
      toast({
        title: "Resposta Incorreta",
        description: "Tente novamente! " + module6Questions[questionIndex].explanation,
        variant: "destructive",
      })
    }
  }

  const handleTaskComplete = (taskIndex: number, result: string) => {
    const newResults = [...taskResults]
    newResults[taskIndex] = result
    setTaskResults(newResults)

    // Adiciona à lista de Ordinals criados se for uma tarefa de Ordinal
    if (module6Tasks[taskIndex].type === 'ordinal' && result) {
      setCreatedOrdinals(prev => [...prev, result])
    }

    toast({
      title: "Tarefa Concluída!",
      description: `Tarefa ${taskIndex + 1} completada com sucesso`,
    })

    if (taskIndex < module6Tasks.length - 1) {
      setCurrentTaskIndex(taskIndex + 1)
    } else {
      setTasksCompleted(true)
      checkModuleCompletion()
    }
  }

  const handleOrdinalCreated = (inscriptionId: string) => {
    setCreatedOrdinals(prev => [...prev, inscriptionId])
    toast({
      title: "Ordinal Criado!",
      description: `Inscription ID: ${inscriptionId}`,
    })
  }

  const checkModuleCompletion = () => {
    if (questionsCompleted && tasksCompleted) {
      setModuleCompleted(true)
      toast({
        title: "Módulo 6 Concluído!",
        description: "Parabéns! Você dominou Taproot e Ordinals",
      })
    }
  }

  const currentQuestion = module6Questions[currentQuestionIndex]
  const currentTask = module6Tasks[currentTaskIndex]

  return (
    <ModuleLayout
      moduleData={module6Data}
      currentStep={questionsCompleted ? 'tasks' : 'questions'}
      progress={questionsCompleted && tasksCompleted ? 100 : questionsCompleted ? 50 : (currentQuestionIndex / module6Questions.length) * 50}
    >
      <div className="space-y-6">
        {/* Status do Módulo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Progresso do Módulo</span>
              <Badge variant={moduleCompleted ? "default" : "secondary"}>
                {moduleCompleted ? "Concluído" : "Em Progresso"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${questionsCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {userAnswers.filter((answer, index) => answer === module6Questions[index]?.correctAnswer).length}/{module6Questions.length}
                </div>
                <div className="text-sm text-gray-600">Perguntas</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${tasksCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {taskResults.filter(Boolean).length}/{module6Tasks.length}
                </div>
                <div className="text-sm text-gray-600">Tarefas</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${createdOrdinals.length > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                  {createdOrdinals.length}
                </div>
                <div className="text-sm text-gray-600">Ordinals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Principal */}
        <Tabs defaultValue="theory" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="theory">Teoria</TabsTrigger>
            <TabsTrigger value="practice" disabled={!questionsCompleted}>Prática</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
            <TabsTrigger value="badges" disabled={!moduleCompleted}>Badges</TabsTrigger>
          </TabsList>

          {/* Aba de Teoria */}
          <TabsContent value="theory" className="space-y-6">
            {!questionsCompleted ? (
              <QuestionCard
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                totalQuestions={module6Questions.length}
                onAnswer={(answerIndex: number) => handleQuestionAnswer(currentQuestionIndex, answerIndex)}
                userAnswer={userAnswers[currentQuestionIndex]}
              />
            ) : (
              <Alert>
                <AlertDescription>
                  <strong>Teoria Concluída!</strong> Você pode agora prosseguir para as tarefas práticas.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Aba de Prática */}
          <TabsContent value="practice" className="space-y-6">
            {questionsCompleted && !tasksCompleted ? (
              <TaskCard
                task={currentTask}
                taskIndex={currentTaskIndex}
                totalTasks={module6Tasks.length}
                onComplete={(result: string) => handleTaskComplete(currentTaskIndex, result)}
                result={taskResults[currentTaskIndex]}
              />
            ) : tasksCompleted ? (
              <Alert>
                <AlertDescription>
                  <strong>Tarefas Concluídas!</strong> Você dominou as funcionalidades práticas do Taproot e Ordinals.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>
                  Complete a teoria primeiro para acessar as tarefas práticas.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Aba Avançada */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaprootTransactions
                onTransactionCreated={(txId) => {
                  toast({
                    title: "Transação Taproot Criada!",
                    description: `TX ID: ${txId}`,
                  })
                }}
              />
              <OrdinalsCreator
                userPublicKey={user?.publicKey}
                onOrdinalCreated={handleOrdinalCreated}
              />
            </div>
          </TabsContent>

          {/* Aba de Badges */}
          <TabsContent value="badges" className="space-y-6">
            {moduleCompleted ? (
              <div className="space-y-6">
                <BadgeReward badge={module6Badge} />
                <BadgeNFTCreator
                  userPublicKey={user?.publicKey}
                  onBadgeCreated={(badgeId, badgeData) => {
                    toast({
                      title: "Badge NFT Criado!",
                      description: `Badge "${badgeData.badge}" mintado como Ordinal`,
                    })
                  }}
                />
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Complete todas as tarefas do módulo para acessar os badges NFT.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {/* Ordinals Criados */}
        {createdOrdinals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Seus Ordinals Criados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {createdOrdinals.map((ordinalId, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <code className="text-sm">{ordinalId}</code>
                    <a
                      href={`https://mempool.space/signet/tx/${ordinalId.split(':')[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver no Explorer
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleLayout>
  )
}