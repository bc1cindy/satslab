'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, Shield, Trophy, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import { useModuleAnalytics } from '@/app/hooks/useAnalytics'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import MultisigCreator from '@/app/components/modules/MultisigCreator'
import TaprootTransactionCreator from '@/app/components/modules/TaprootTransactionCreator'
import MultisigBadgeCreator from '@/app/components/modules/MultisigBadgeCreator'
import { module7Questions, module7Tasks, module7Badge } from './data'

// Types
interface MultisigResults {
  walletAddress?: string
  transactionHash?: string
  inscriptionId?: string
  multisigKeys?: any[]
  multisigWallet?: any
  taprootPrivateKey?: string
}

// Use imported data - converting format
const moduleQuestions = module7Questions.map(q => ({
  id: q.id.toString(),
  question: q.question,
  options: q.options,
  correct: q.correctAnswer,
  explanation: q.explanation,
  hint: ''
}))

const moduleTasks = module7Tasks.map(t => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  instructions: t.instructions,
  inputLabel: t.validation.type === 'address' ? 'Endereço da Carteira' :
              t.validation.type === 'hash' && t.type === 'transaction' ? 'Hash da Transação' :
              t.validation.type === 'hash' && t.type === 'ordinal' ? 'ID da Inscrição' :
              'Resposta',
  inputPlaceholder: t.validation.placeholder || '',
  validationType: (t.type === 'transaction' ? 'transaction' : 
                t.validation.type === 'address' ? 'address' : 
                t.validation.type === 'hash' ? 'transaction' : 
                'custom') as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints || [],
  externalLinks: []
}))

export default function Module7() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(7, {
    ...module7Badge,
    moduleId: 7
  })
  useModuleAnalytics(7) // Track module start
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'multisig-task' | 'taproot-task' | 'badge-task' | 'completed'>('intro')
  const [multisigResults, setMultisigResults] = useState<MultisigResults>({})

  const handleQuestionsCompleteWithAdvance = async (score: number, total: number) => {
    await handleQuestionsComplete(score, total)
    // Auto advance to multisig task after 2 seconds
    setTimeout(() => {
      setCurrentSection('multisig-task')
    }, 2000)
  }

  const handleMultisigTaskComplete = (address: string) => {
    setMultisigResults(prev => ({ ...prev, walletAddress: address }))
    // Auto advance to taproot task after 2 seconds
    setTimeout(() => {
      setCurrentSection('taproot-task')
    }, 2000)
  }

  const handleTaprootTaskComplete = (txHash: string, address: string) => {
    setMultisigResults(prev => ({ ...prev, transactionHash: txHash, walletAddress: address }))
    // Auto advance to badge task after 2 seconds
    setTimeout(() => {
      setCurrentSection('badge-task')
    }, 2000)
  }

  const handleBadgeTaskComplete = (badgeId: string) => {
    setMultisigResults(prev => ({ ...prev, inscriptionId: badgeId }))
    // Complete tasks and advance to completion
    handleTasksComplete(3, 3)
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
              <div className="text-sm text-gray-400">
                Tempo: {Math.floor(progress.timeSpent / 60)}m {progress.timeSpent % 60}s
              </div>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                Módulo 7
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Module Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-purple-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Carteiras Multisig</h1>
              <p className="text-gray-400 mt-2">Segurança avançada com multisig e Taproot</p>
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
                  <Shield className="h-6 w-6 text-purple-500 mr-3" />
                  Bem-vindo à segurança máxima do Bitcoin!
                </CardTitle>
                <CardDescription>
                  Aprenda sobre multisig para segurança e gestão avançada de carteiras
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">O que você vai aprender:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Carteiras multisig para distribuir risco entre múltiplas chaves</li>
                    <li>Tecnologias Taproot para transações multisig eficientes</li>
                    <li>Assinatura de transações com múltiplas chaves independentes</li>
                    <li>Vantagens de privacidade e eficiência do Taproot</li>
                    <li>Casos de uso corporativos e de alta segurança</li>
                  </ul>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-400 mb-2">🔐 Experiência Prática:</h3>
                  <p className="text-purple-300 text-sm">
                    Você vai criar carteiras multisig reais, dominar tecnologias Taproot 
                    para transações eficientes e mintar seu NFT Badge final como Inscrição multisig.
                  </p>
                </div>
                
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-purple-500 hover:bg-purple-600 text-lg px-8 py-3"
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
                  Teste seus conhecimentos sobre Multisig e Taproot
                </CardDescription>
              </CardHeader>
            </Card>
            
            <QuestionSystem 
              questions={moduleQuestions}
              onComplete={handleQuestionsCompleteWithAdvance}
              moduleId={7}
            />
          </div>
        )}

        {/* Multisig Task Section */}
        {currentSection === 'multisig-task' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">🔐 Tarefa 1: Criador de Carteiras Multisig</CardTitle>
                <CardDescription className="text-center">
                  Configure carteiras que requerem múltiplas assinaturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultisigCreator 
                  onWalletCreated={handleMultisigTaskComplete}
                  onTransactionSigned={(txId) => {
                    setMultisigResults(prev => ({ ...prev, transactionHash: txId }))
                  }}
                  onKeysGenerated={(keys) => {
                    setMultisigResults(prev => ({ ...prev, multisigKeys: keys }))
                  }}
                  onWalletObjectCreated={(wallet) => {
                    setMultisigResults(prev => ({ ...prev, multisigWallet: wallet }))
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Taproot Task Section */}
        {currentSection === 'taproot-task' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">🌿 Tarefa 2: Criador de Transações Taproot</CardTitle>
                <CardDescription className="text-center">
                  Crie transações multisig eficientes usando Taproot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaprootTransactionCreator 
                  onTransactionCreated={handleTaprootTaskComplete}
                  onPrivateKeyGenerated={(privateKey) => {
                    setMultisigResults(prev => ({ ...prev, taprootPrivateKey: privateKey }))
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Badge Task Section */}
        {currentSection === 'badge-task' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">🎨 Tarefa 3: Criador de Badge NFT Final</CardTitle>
                <CardDescription className="text-center">
                  Minte sua Inscrição NFT Badge final usando multisig
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultisigBadgeCreator 
                  multisigWallet={multisigResults.multisigWallet}
                  multisigKeys={multisigResults.multisigKeys}
                  onBadgeCreated={handleBadgeTaskComplete}
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
                <span className="text-center">Parabéns! Módulo Final Concluído</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Você completou com sucesso o Módulo 7 - Carteiras Multisig
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              {progress.badgeEarned && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 sm:p-6">
                  <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">Inscrição NFT Badge Final Conquistado!</h3>
                  <Badge className="bg-purple-500/20 text-purple-400 text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {module7Badge.name}
                  </Badge>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                    Você dominou todas as tecnologias avançadas do Bitcoin e criou seu badge NFT final!
                  </p>
                  {multisigResults.inscriptionId && (
                    <div className="mt-4 p-3 bg-gray-800 rounded">
                      <p className="text-xs text-gray-400">Sua Inscrição NFT Badge Final:</p>
                      <code className="text-xs font-mono text-purple-400 break-all">
                        {multisigResults.inscriptionId}
                      </code>
                    </div>
                  )}
                </div>
              )}

              {/* Summary - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400">{progress.questionsScore}/3</div>
                  <div className="text-xs sm:text-sm text-gray-400">Perguntas Corretas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-green-400">{progress.tasksScore}/3</div>
                  <div className="text-xs sm:text-sm text-gray-400">Tarefas Concluídas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-orange-400">{Math.floor(progress.timeSpent / 60)}m</div>
                  <div className="text-xs sm:text-sm text-gray-400">Tempo Total</div>
                </div>
              </div>

              {/* Multisig Results */}
              {(multisigResults.walletAddress || multisigResults.transactionHash || multisigResults.inscriptionId) && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">🔐 Seus Resultados Multisig/Taproot:</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    {multisigResults.walletAddress && (
                      <div>
                        <span className="font-medium">Carteira Criada:</span>
                        <div className="font-mono text-xs bg-gray-700 p-2 rounded mt-1 break-all">
                          {multisigResults.walletAddress}
                        </div>
                      </div>
                    )}
                    {multisigResults.transactionHash && (
                      <div>
                        <span className="font-medium">Transação Taproot:</span>
                        <div className="font-mono text-xs bg-gray-700 p-2 rounded mt-1 break-all">
                          {multisigResults.transactionHash}
                        </div>
                      </div>
                    )}
                    {multisigResults.inscriptionId && (
                      <div>
                        <span className="font-medium">Badge NFT Final:</span>
                        <div className="font-mono text-xs bg-purple-900/50 p-2 rounded mt-1 break-all">
                          {multisigResults.inscriptionId}
                        </div>
                        <p className="text-xs text-purple-400 mt-1">
                          ✨ Este é seu NFT Badge final e mais valioso na blockchain Bitcoin!
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
                  <li>Carteiras multisig distribuem risco entre múltiplas chaves independentes</li>
                  <li>Taproot melhora privacidade fazendo multisig parecer transações simples</li>
                  <li>Assinaturas Schnorr reduzem tamanho e custos de transações multisig</li>
                  <li>Multisig é ideal para custódia corporativa e alta segurança</li>
                  <li>Taproot permite contratos inteligentes mais sofisticados</li>
                </ul>
              </div>

              {/* Final Achievement */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/20 to-orange-500/20 border border-purple-500/30 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400 mb-2">
                    🎉 Parabéns pela Jornada Completa!
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    Você completou todos os 7 módulos da SatsLab e se tornou um verdadeiro especialista 
                    em Bitcoin. Agora você possui conhecimento completo desde o básico até as tecnologias 
                    mais avançadas do protocolo!
                  </p>
                </div>
                
                {/* Mobile: Stack buttons vertically, Desktop: Side by side */}
                <div className="flex flex-col gap-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 py-3"
                    onClick={() => {
                      const tweetText = "🎆 Acabei de completar o Curso Bitcoin da SatsLab! 🎆\n\n🚀 Dominei todos os 7 módulos cobrindo:\n• Fundamentos e economia do Bitcoin\n• Segurança e gerenciamento de carteiras\n• Transações e dinâmica de taxas\n• Mineração e proof-of-work\n• Lightning Network\n• Taproot e Inscrições NFTs\n• Segurança multisig avançada\n\n🏆 Conquistei o badge 'Mestre Multisig'!\n\n#Bitcoin #Aprendizado #SatsLab #Blockchain"
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank')
                    }}
                  >
                    🎆 Compartilhar Conquista
                    <Award className="ml-2 h-5 w-5" />
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/" className="flex-1">
                      <Button className="w-full bg-purple-500 hover:bg-purple-600 text-sm sm:text-base py-2 sm:py-3">
                        Ver Módulos Completos
                      </Button>
                    </Link>
                    <Link href="/" className="flex-1">
                      <Button variant="outline" className="w-full border-gray-600 text-gray-300 text-sm sm:text-base py-2 sm:py-3">
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
                if (currentSection === 'badge-task') setCurrentSection('taproot-task')
                if (currentSection === 'taproot-task') setCurrentSection('multisig-task')
                if (currentSection === 'multisig-task') setCurrentSection('questions')
                if (currentSection === 'questions') setCurrentSection('intro')
              }}
              className="border-gray-600 text-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            {currentSection === 'questions' && progress.questionsCompleted && (
              <Button 
                onClick={() => setCurrentSection('multisig-task')}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Ir para Tarefa Multisig
              </Button>
            )}
            
            {currentSection === 'multisig-task' && multisigResults.walletAddress && (
              <Button 
                onClick={() => setCurrentSection('taproot-task')}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Ir para Tarefa Taproot
              </Button>
            )}
            
            {currentSection === 'taproot-task' && multisigResults.transactionHash && (
              <Button 
                onClick={() => setCurrentSection('badge-task')}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Ir para Tarefa Badge Final
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}