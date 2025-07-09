'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, Shield, Trophy, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
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
  ordinalId?: string
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
              t.validation.type === 'hash' && t.type === 'ordinal' ? 'ID do Ordinal' :
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
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'tasks' | 'completed'>('intro')
  const [multisigResults, setMultisigResults] = useState<MultisigResults>({})

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
                    para transações eficientes e mintar seu NFT Badge final como Ordinal multisig.
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

        {/* Tasks Section */}
        {currentSection === 'tasks' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">🎯 Tarefas Práticas</CardTitle>
                <CardDescription className="text-center">
                  Crie carteiras multisig e transações Taproot avançadas
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Multisig Creator */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">🔐 Criador de Carteiras Multisig</CardTitle>
                <CardDescription>
                  Configure carteiras que requerem múltiplas assinaturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultisigCreator 
                  onWalletCreated={(address) => {
                    setMultisigResults(prev => ({ ...prev, walletAddress: address }))
                  }}
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

            {/* Taproot Transaction Creator */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">🌿 Criador de Transações Taproot</CardTitle>
                <CardDescription>
                  Crie transações multisig eficientes usando Taproot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaprootTransactionCreator 
                  onTransactionCreated={(txHash, address) => {
                    setMultisigResults(prev => ({ ...prev, transactionHash: txHash, walletAddress: address }))
                  }}
                  onPrivateKeyGenerated={(privateKey) => {
                    setMultisigResults(prev => ({ ...prev, taprootPrivateKey: privateKey }))
                  }}
                />
              </CardContent>
            </Card>

            {/* Badge NFT Creator */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">🎨 Criador de Badge NFT Final</CardTitle>
                <CardDescription>
                  Minte seu Ordinal NFT Badge final usando multisig
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultisigBadgeCreator 
                  multisigWallet={multisigResults.multisigWallet}
                  multisigKeys={multisigResults.multisigKeys}
                  onBadgeCreated={(badgeId) => {
                    setMultisigResults(prev => ({ ...prev, ordinalId: badgeId }))
                  }}
                />
              </CardContent>
            </Card>
            
            <TaskSystem 
              tasks={moduleTasks}
              onComplete={handleTasksCompleteWithAdvance}
              moduleId={7}
            />
          </div>
        )}

        {/* Completion Screen */}
        {currentSection === 'completed' && (
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-green-400 flex items-center justify-center">
                <Trophy className="h-8 w-8 mr-3" />
                Parabéns! Módulo Final Concluído
              </CardTitle>
              <CardDescription>
                Você completou com sucesso o Módulo 7 - Carteiras Multisig
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {progress.badgeEarned && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="text-xl font-semibold text-green-400 mb-2">Ordinal NFT Badge Final Conquistado!</h3>
                  <Badge className="bg-purple-500/20 text-purple-400 text-lg px-4 py-2">
                    <Award className="h-5 w-5 mr-2" />
                    {module7Badge.name}
                  </Badge>
                  <p className="text-sm text-gray-400 mt-2">
                    Você dominou todas as tecnologias avançadas do Bitcoin e criou seu badge NFT final!
                  </p>
                  {multisigResults.ordinalId && (
                    <div className="mt-4 p-3 bg-gray-800 rounded">
                      <p className="text-xs text-gray-400">Seu Ordinal NFT Badge Final:</p>
                      <code className="text-xs font-mono text-purple-400 break-all">
                        {multisigResults.ordinalId}
                      </code>
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{progress.questionsScore}/3</div>
                  <div className="text-sm text-gray-400">Perguntas Corretas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{progress.tasksScore}/3</div>
                  <div className="text-sm text-gray-400">Tarefas Concluídas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-400">{Math.floor(progress.timeSpent / 60)}m</div>
                  <div className="text-sm text-gray-400">Tempo Total</div>
                </div>
              </div>

              {/* Multisig Results */}
              {(multisigResults.walletAddress || multisigResults.transactionHash || multisigResults.ordinalId) && (
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
                    {multisigResults.ordinalId && (
                      <div>
                        <span className="font-medium">Badge NFT Final:</span>
                        <div className="font-mono text-xs bg-purple-900/50 p-2 rounded mt-1 break-all">
                          {multisigResults.ordinalId}
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
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">🎓 O que você aprendeu:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm text-left">
                  <li>Carteiras multisig distribuem risco entre múltiplas chaves independentes</li>
                  <li>Taproot melhora privacidade fazendo multisig parecer transações simples</li>
                  <li>Assinaturas Schnorr reduzem tamanho e custos de transações multisig</li>
                  <li>Multisig é ideal para custódia corporativa e alta segurança</li>
                  <li>Taproot permite contratos inteligentes mais sofisticados</li>
                </ul>
              </div>

              {/* Final Achievement */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/20 to-orange-500/20 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400 mb-2">
                    🎉 Parabéns pela Jornada Completa!
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Você completou todos os 7 módulos da SatsLab e se tornou um verdadeiro especialista 
                    em Bitcoin. Agora você possui conhecimento completo desde o básico até as tecnologias 
                    mais avançadas do protocolo!
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      Ver Dashboard Completo
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
                className="bg-purple-500 hover:bg-purple-600"
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