'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, Palette, Trophy, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import TaprootTransactionCreator from '@/app/components/modules/TaprootTransactionCreator'
import OrdinalsCreator from '@/app/components/modules/OrdinalsCreator'
import { module6Questions, module6Tasks, module6Badge } from './data'

// Types
interface TaprootResults {
  taprootAddress?: string
  transactionHash?: string
  ordinalId?: string
}

// Use imported data - converting format
const moduleQuestions = module6Questions.map(q => ({
  id: q.id.toString(),
  question: q.question,
  options: q.options,
  correct: q.correctAnswer,
  explanation: q.explanation,
  hint: ''
}))

const moduleTasks = module6Tasks.map(t => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  instructions: t.instructions,
  inputLabel: t.validation.type === 'hash' ? (t.validation.expectedLength === 66 ? 'ID do Ordinal' : 'Hash da Transação') : 'Resposta',
  inputPlaceholder: t.validation.placeholder || '',
  validationType: 'custom' as const,
  hints: t.hints || [],
  externalLinks: [
    {
      label: 'Mempool Signet Explorer',
      url: 'https://mempool.space/signet'
    }
  ]
}))

export default function Module6() {
  const { progress, handleQuestionsComplete, handleTasksComplete, isAuthenticated } = useModuleProgress(6, {
    ...module6Badge,
    moduleId: 6
  })
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'tasks' | 'completed'>('intro')
  const [taprootResults, setTaprootResults] = useState<TaprootResults>({})

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

  // Login required screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar</span>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-pink-400 flex items-center justify-center">
                <Palette className="h-8 w-8 mr-3" />
                Taproot e Ordinals
              </CardTitle>
              <CardDescription className="text-gray-400">
                Explore as tecnologias avançadas do Bitcoin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-pink-400 mb-4">🎨 Login Necessário</h3>
                <p className="text-gray-300 mb-4">
                  Este módulo requer login para criar transações Taproot e mintar Ordinals NFT.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>🎯 <strong>Objetivos:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Compreender o protocolo Taproot e suas vantagens</li>
                    <li>Criar transações Taproot na rede Signet</li>
                    <li>Mintar um Ordinal NFT Badge personalizado</li>
                    <li>Analisar o impacto das taxas em transações com dados</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <Link href="/auth/login">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600 text-lg px-8 py-3">
                    Fazer Login para Continuar
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                    Criar Conta Gratuita
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

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
              <Badge variant="secondary" className="bg-pink-500/20 text-pink-400">
                Módulo 6
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Module Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Palette className="h-12 w-12 text-pink-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Taproot e Ordinals</h1>
              <p className="text-gray-400 mt-2">Tecnologias avançadas do Bitcoin</p>
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
                  <Palette className="h-6 w-6 text-pink-500 mr-3" />
                  Bem-vindo ao futuro do Bitcoin!
                </CardTitle>
                <CardDescription>
                  Explore Taproot para privacidade e Ordinals para NFTs nativos do Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">O que você vai aprender:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Compreender o protocolo Taproot e suas vantagens</li>
                    <li>Aprender sobre Ordinals e como funcionam os NFTs em Bitcoin</li>
                    <li>Criar transações Taproot na rede Signet</li>
                    <li>Mintar um Ordinal NFT Badge</li>
                    <li>Analisar o impacto das taxas em transações com dados</li>
                  </ul>
                </div>
                
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-pink-400 mb-2">🎨 Experiência Prática:</h3>
                  <p className="text-pink-300 text-sm">
                    Você vai criar transações Taproot reais e mintar seu próprio NFT Badge 
                    como um Ordinal nativo do Bitcoin na rede Signet.
                  </p>
                </div>
                
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-pink-500 hover:bg-pink-600 text-lg px-8 py-3"
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
                  Teste seus conhecimentos sobre Taproot e Ordinals
                </CardDescription>
              </CardHeader>
            </Card>
            
            <QuestionSystem 
              questions={moduleQuestions}
              onComplete={handleQuestionsCompleteWithAdvance}
              moduleId={6}
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
                  Crie transações Taproot e minte seu NFT Badge
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Taproot Transaction Creator */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">🔐 Criador de Transações Taproot</CardTitle>
                <CardDescription>
                  Crie uma transação usando endereço Taproot na rede Signet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaprootTransactionCreator 
                  onTransactionCreated={(hash, address) => {
                    setTaprootResults(prev => ({ 
                      ...prev, 
                      transactionHash: hash,
                      taprootAddress: address 
                    }))
                  }}
                />
              </CardContent>
            </Card>

            {/* Ordinals Creator */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">🎨 Criador de Ordinals NFT</CardTitle>
                <CardDescription>
                  Minte seu Badge como um Ordinal NFT no Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrdinalsCreator 
                  onOrdinalCreated={(ordinalId) => {
                    setTaprootResults(prev => ({ ...prev, ordinalId }))
                  }}
                />
              </CardContent>
            </Card>
            
            <TaskSystem 
              tasks={moduleTasks}
              onComplete={handleTasksCompleteWithAdvance}
              moduleId={6}
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
                Você completou com sucesso o Módulo 6 - Taproot e Ordinals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {progress.badgeEarned && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="text-xl font-semibold text-green-400 mb-2">Ordinal NFT Badge Conquistado!</h3>
                  <Badge className="bg-pink-500/20 text-pink-400 text-lg px-4 py-2">
                    <Award className="h-5 w-5 mr-2" />
                    {module6Badge.name}
                  </Badge>
                  <p className="text-sm text-gray-400 mt-2">
                    Você dominou Taproot e criou seu primeiro Ordinal NFT Badge no Bitcoin
                  </p>
                  {taprootResults.ordinalId && (
                    <div className="mt-4 p-3 bg-gray-800 rounded">
                      <p className="text-xs text-gray-400">Seu Ordinal NFT:</p>
                      <code className="text-xs font-mono text-pink-400 break-all">
                        {taprootResults.ordinalId}
                      </code>
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-pink-400">{progress.questionsScore}/3</div>
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

              {/* Taproot Results */}
              {(taprootResults.taprootAddress || taprootResults.transactionHash || taprootResults.ordinalId) && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">🎨 Seus Resultados Taproot:</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    {taprootResults.taprootAddress && (
                      <div>
                        <span className="font-medium">Endereço Taproot:</span>
                        <div className="font-mono text-xs bg-gray-700 p-2 rounded mt-1 break-all">
                          {taprootResults.taprootAddress}
                        </div>
                      </div>
                    )}
                    {taprootResults.transactionHash && (
                      <div>
                        <span className="font-medium">Transação Taproot:</span>
                        <div className="font-mono text-xs bg-gray-700 p-2 rounded mt-1 break-all">
                          {taprootResults.transactionHash}
                        </div>
                      </div>
                    )}
                    {taprootResults.ordinalId && (
                      <div>
                        <span className="font-medium">Ordinal NFT Badge:</span>
                        <div className="font-mono text-xs bg-pink-900/50 p-2 rounded mt-1 break-all">
                          {taprootResults.ordinalId}
                        </div>
                        <p className="text-xs text-pink-400 mt-1">
                          ✨ Este é seu NFT Badge permanente na blockchain Bitcoin!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Learning Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">🎓 O que você aprendeu:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm text-left">
                  <li>Taproot melhora privacidade e eficiência usando assinaturas Schnorr</li>
                  <li>Ordinals são NFTs únicos criados em satoshis individuais</li>
                  <li>Transações com dados maiores resultam em taxas mais altas</li>
                  <li>Taproot permite contratos inteligentes mais complexos</li>
                  <li>Bitcoin pode hospedar NFTs nativos sem tokens separados</li>
                </ul>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <p className="text-gray-300">
                  Fantástico! Você dominou as tecnologias mais avançadas do Bitcoin. 
                  Continue explorando com Multisig e HD Wallets.
                </p>
                
                <div className="flex space-x-4">
                  <Link href="/modules/7" className="flex-1">
                    <Button className="w-full bg-pink-500 hover:bg-pink-600">
                      Próximo Módulo: Multisig e HD Wallets
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="border-gray-600 text-gray-300">
                      Voltar ao Início
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
                className="bg-pink-500 hover:bg-pink-600"
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