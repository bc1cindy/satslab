'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, Palette, Trophy, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import { useModuleAnalytics } from '@/app/hooks/useAnalytics'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import TaprootTransactionCreator from '@/app/components/modules/TaprootTransactionCreator'
import InscriptionsCreator from '@/app/components/modules/InscriptionsCreator'
import { module6Questions, module6Tasks, module6Badge } from './data'

// Types
interface TaprootResults {
  taprootAddress?: string
  transactionHash?: string
  inscriptionId?: string
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
  inputLabel: t.validation.type === 'hash' ? (t.validation.expectedLength === 66 ? 'ID da Inscrição' : 'Hash da Transação') : 'Resposta',
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
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(6, {
    ...module6Badge,
    moduleId: 6
  })
  useModuleAnalytics(6) // Track module start
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'taproot-task' | 'inscriptions-task' | 'completed'>('intro')
  const [taprootResults, setTaprootResults] = useState<TaprootResults>({})

  const handleQuestionsCompleteWithAdvance = async (score: number, total: number) => {
    await handleQuestionsComplete(score, total)
    // Auto advance to taproot task after 2 seconds
    setTimeout(() => {
      setCurrentSection('taproot-task')
    }, 2000)
  }

  const handleTaprootTaskComplete = (hash: string, address: string) => {
    setTaprootResults(prev => ({ 
      ...prev, 
      transactionHash: hash,
      taprootAddress: address 
    }))
    // Auto advance to inscriptions task after 2 seconds
    setTimeout(() => {
      setCurrentSection('inscriptions-task')
    }, 2000)
  }

  const handleInscriptionsTaskComplete = (inscriptionId: string) => {
    setTaprootResults(prev => ({ ...prev, inscriptionId }))
    // Complete tasks and advance to completion
    handleTasksComplete(2, 2)
    setTimeout(() => {
      setCurrentSection('completed')
    }, 2000)
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
              <h1 className="text-3xl font-bold">Taproot e Inscrições</h1>
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
                  Explore Taproot para privacidade e Inscrições para NFTs nativos do Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">O que você vai aprender:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Compreender o protocolo Taproot e suas vantagens</li>
                    <li>Aprender sobre Inscrições e como funcionam os NFTs em Bitcoin</li>
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
                  Teste seus conhecimentos sobre Taproot e Inscrições
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

        {/* Taproot Task Section */}
        {currentSection === 'taproot-task' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">🔐 Tarefa 1: Transações Taproot</CardTitle>
                <CardDescription className="text-center">
                  Crie uma transação usando endereço Taproot na rede Signet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaprootTransactionCreator 
                  onTransactionCreated={handleTaprootTaskComplete}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inscriptions Task Section */}
        {currentSection === 'inscriptions-task' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">🎨 Tarefa 2: Criador de Inscrições NFT</CardTitle>
                <CardDescription className="text-center">
                  Minte seu Badge como uma Inscrição NFT no Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InscriptionsCreator 
                  onInscriptionCreated={handleInscriptionsTaskComplete}
                />
              </CardContent>
            </Card>
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
                Você completou com sucesso o Módulo 6 - Taproot e Inscrições
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              {progress.badgeEarned && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 sm:p-6">
                  <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">Inscrição NFT Badge Conquistado!</h3>
                  <Badge className="bg-pink-500/20 text-pink-400 text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {module6Badge.name}
                  </Badge>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                    Você dominou Taproot e criou seu primeiro Inscrição NFT Badge no Bitcoin
                  </p>
                  {taprootResults.inscriptionId && (
                    <div className="mt-4 p-3 bg-gray-800 rounded">
                      <p className="text-xs text-gray-400">Sua Inscrição NFT:</p>
                      <code className="text-xs font-mono text-pink-400 break-all">
                        {taprootResults.inscriptionId}
                      </code>
                    </div>
                  )}
                </div>
              )}

              {/* Summary - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-pink-400">{progress.questionsScore}/3</div>
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

              {/* Taproot Results */}
              {(taprootResults.taprootAddress || taprootResults.transactionHash || taprootResults.inscriptionId) && (
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
                    {taprootResults.inscriptionId && (
                      <div>
                        <span className="font-medium">Inscrição NFT Badge:</span>
                        <div className="font-mono text-xs bg-pink-900/50 p-2 rounded mt-1 break-all">
                          {taprootResults.inscriptionId}
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
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-white mb-3 text-sm sm:text-base">🎓 O que você aprendeu:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs sm:text-sm text-left">
                  <li>Taproot melhora privacidade e eficiência usando assinaturas Schnorr</li>
                  <li>Inscrições são NFTs únicos criados em satoshis individuais</li>
                  <li>Transações com dados maiores resultam em taxas mais altas</li>
                  <li>Taproot permite contratos inteligentes mais complexos</li>
                  <li>Bitcoin pode hospedar NFTs nativos sem tokens separados</li>
                </ul>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  Fantástico! Você dominou as tecnologias mais avançadas do Bitcoin. 
                  Continue explorando com Carteiras Multisig.
                </p>
                
                {/* Mobile: Stack buttons vertically, Desktop: Side by side */}
                <div className="flex flex-col gap-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-3"
                    onClick={() => {
                      import('@/app/lib/shareAchievement').then(({ generateShareMessage, shareToTwitter }) => {
                        const message = generateShareMessage({ 
                          moduleId: 6, 
                          moduleName: 'Módulo 6', 
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
                    <Link href="/modules/7" className="flex-1">
                      <Button className="w-full bg-pink-500 hover:bg-pink-600 text-sm sm:text-base py-2 sm:py-3">
                        Próximo Módulo: Carteiras Multisig
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
                if (currentSection === 'inscriptions-task') setCurrentSection('taproot-task')
                if (currentSection === 'taproot-task') setCurrentSection('questions')
                if (currentSection === 'questions') setCurrentSection('intro')
              }}
              className="border-gray-600 text-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            {currentSection === 'questions' && progress.questionsCompleted && (
              <Button 
                onClick={() => setCurrentSection('taproot-task')}
                className="bg-pink-500 hover:bg-pink-600"
              >
                Ir para Tarefa Taproot
              </Button>
            )}
            
            {currentSection === 'taproot-task' && taprootResults.transactionHash && (
              <Button 
                onClick={() => setCurrentSection('inscriptions-task')}
                className="bg-pink-500 hover:bg-pink-600"
              >
                Ir para Tarefa Inscrições
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}