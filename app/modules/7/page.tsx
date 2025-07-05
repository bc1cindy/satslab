'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { ModuleLayout } from '@/app/components/layout/ModuleLayout'
import { QuestionCard } from '@/app/components/modules/QuestionCard'
import { TaskCard } from '@/app/components/modules/TaskCard'
import { BadgeReward } from '@/app/components/modules/BadgeReward'
import MultisigCreator from '@/app/components/modules/MultisigCreator'
import HDWalletManager from '@/app/components/modules/HDWalletManager'
import BadgeNFTCreator from '@/app/components/modules/BadgeNFTCreator'
import { module7Data, module7Questions, module7Tasks, module7Badge } from './data'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { useToast } from '@/app/hooks/use-toast'

export default function Module7Page() {
  const auth = useAuth()
  const user = auth?.session?.user
  const { toast } = useToast()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [questionsCompleted, setQuestionsCompleted] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(false)
  const [moduleCompleted, setModuleCompleted] = useState(false)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [taskResults, setTaskResults] = useState<string[]>([])
  const [createdWallets, setCreatedWallets] = useState<Array<{type: string, address: string}>>([])
  const [derivedAddresses, setDerivedAddresses] = useState<string[]>([])

  const handleQuestionAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[questionIndex] = answerIndex
    setUserAnswers(newAnswers)

    const isCorrect = answerIndex === module7Questions[questionIndex].correctAnswer
    
    if (isCorrect) {
      toast({
        title: "Resposta Correta!",
        description: module7Questions[questionIndex].explanation,
      })
      
      if (questionIndex < module7Questions.length - 1) {
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
        description: "Tente novamente! " + module7Questions[questionIndex].explanation,
        variant: "destructive",
      })
    }
  }

  const handleTaskComplete = (taskIndex: number, result: string) => {
    const newResults = [...taskResults]
    newResults[taskIndex] = result
    setTaskResults(newResults)

    toast({
      title: "Tarefa Concluída!",
      description: `Tarefa ${taskIndex + 1} completada com sucesso`,
    })

    if (taskIndex < module7Tasks.length - 1) {
      setCurrentTaskIndex(taskIndex + 1)
    } else {
      setTasksCompleted(true)
      checkModuleCompletion()
    }
  }

  const handleWalletCreated = (type: string, address: string) => {
    setCreatedWallets(prev => [...prev, { type, address }])
    toast({
      title: `${type} Criada!`,
      description: `Endereço: ${address}`,
    })
  }

  const handleAddressGenerated = (address: string) => {
    setDerivedAddresses(prev => [...prev, address])
    toast({
      title: "Endereço Derivado!",
      description: `Novo endereço: ${address}`,
    })
  }

  const checkModuleCompletion = () => {
    if (questionsCompleted && tasksCompleted) {
      setModuleCompleted(true)
      toast({
        title: "Módulo 7 Concluído!",
        description: "Parabéns! Você dominou Multisig e HD Wallets",
      })
    }
  }

  const currentQuestion = module7Questions[currentQuestionIndex]
  const currentTask = module7Tasks[currentTaskIndex]

  return (
    <ModuleLayout
      moduleData={module7Data}
      currentStep={questionsCompleted ? 'tasks' : 'questions'}
      progress={questionsCompleted && tasksCompleted ? 100 : questionsCompleted ? 50 : (currentQuestionIndex / module7Questions.length) * 50}
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
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${questionsCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {userAnswers.filter((answer, index) => answer === module7Questions[index]?.correctAnswer).length}/{module7Questions.length}
                </div>
                <div className="text-sm text-gray-600">Perguntas</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${tasksCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {taskResults.filter(Boolean).length}/{module7Tasks.length}
                </div>
                <div className="text-sm text-gray-600">Tarefas</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${createdWallets.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {createdWallets.length}
                </div>
                <div className="text-sm text-gray-600">Carteiras</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${derivedAddresses.length > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                  {derivedAddresses.length}
                </div>
                <div className="text-sm text-gray-600">Endereços</div>
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
                totalQuestions={module7Questions.length}
                onAnswer={(isCorrect: boolean) => {
                  if (isCorrect) {
                    handleQuestionAnswer(currentQuestionIndex, currentQuestion.correctAnswer)
                  } else {
                    // Find the incorrect answer that was likely selected
                    const incorrectAnswers = currentQuestion.options.map((_, index) => index).filter(i => i !== currentQuestion.correctAnswer)
                    handleQuestionAnswer(currentQuestionIndex, incorrectAnswers[0] || 0)
                  }
                }}
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
                totalTasks={module7Tasks.length}
                onComplete={(result: string) => handleTaskComplete(currentTaskIndex, result)}
                result={taskResults[currentTaskIndex]}
              />
            ) : tasksCompleted ? (
              <Alert>
                <AlertDescription>
                  <strong>Tarefas Concluídas!</strong> Você dominou as funcionalidades práticas de Multisig e HD Wallets.
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
            <div className="space-y-8">
              <MultisigCreator
                onWalletCreated={(address) => handleWalletCreated("Carteira Multisig", address)}
                onTransactionSigned={(txId) => {
                  toast({
                    title: "Transação Multisig Assinada!",
                    description: `TX ID: ${txId}`,
                  })
                }}
              />
              
              <HDWalletManager
                onWalletCreated={(wallet) => handleWalletCreated("Carteira HD", wallet.fingerprint)}
                onAddressGenerated={handleAddressGenerated}
              />
            </div>
          </TabsContent>

          {/* Aba de Badges */}
          <TabsContent value="badges" className="space-y-6">
            {moduleCompleted ? (
              <div className="space-y-6">
                <BadgeReward badge={module7Badge} />
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

        {/* Carteiras e Endereços Criados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carteiras Criadas */}
          {createdWallets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Carteiras Criadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {createdWallets.map((wallet, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{wallet.type}</div>
                        <code className="text-xs text-gray-600">{wallet.address}</code>
                      </div>
                      <Badge variant="outline">{wallet.type.includes('Multisig') ? 'Multisig' : 'HD'}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Endereços Derivados */}
          {derivedAddresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Endereços Derivados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {derivedAddresses.slice(-5).map((address, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <code className="text-sm">{address}</code>
                      <Badge variant="outline">HD</Badge>
                    </div>
                  ))}
                  {derivedAddresses.length > 5 && (
                    <div className="text-sm text-gray-500 text-center">
                      +{derivedAddresses.length - 5} endereços mais
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumo de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Multisig (M-de-N)</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Distribui risco entre múltiplas chaves</li>
                  <li>• Previne ponto único de falha</li>
                  <li>• Ideal para custódia corporativa</li>
                  <li>• Requer consenso para transações</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">HD Wallets (BIP32/44)</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Deriva infinitos endereços de uma seed</li>
                  <li>• Backup simplificado (12/24 palavras)</li>
                  <li>• Estrutura hierárquica organizada</li>
                  <li>• Privacidade melhorada (endereços únicos)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  )
}