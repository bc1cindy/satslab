'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, CheckCircle, Trophy, Users, Award } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import { useModuleAnalytics } from '@/app/hooks/useAnalytics'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import MultisigCreator from '@/app/components/modules/MultisigCreator'
import TaprootTransactionCreator from '@/app/components/modules/TaprootTransactionCreator'
import MultisigBadgeCreator from '@/app/components/modules/MultisigBadgeCreator'
import { LanguageSelector } from '@/app/components/i18n/LanguageSelector'
import { module7Questions, module7Tasks, module7Badge } from './data'

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
  inputLabel: t.validation.type === 'address' ? 'Multisig Address' : 
              t.validation.type === 'hash' ? 'Transaction Hash / Ordinal ID' :
              'Value',
  inputPlaceholder: t.validation.placeholder || '',
  validationType: (t.validation.type === 'address' ? 'address' : 'transaction') as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints || [],
  externalLinks: [
    {
      label: 'Signet Explorer',
      url: 'https://mempool.space/signet'
    }
  ]
}))

export default function Module7EN() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(7, {
    ...module7Badge,
    moduleId: 7
  })
  useModuleAnalytics(7)
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'multisig-task' | 'taproot-task' | 'badge-task' | 'completed'>('intro')
  const [multisigResults, setMultisigResults] = useState<{walletAddress?: string, transactionHash?: string, inscriptionId?: string, multisigKeys?: any[], multisigWallet?: any, taprootPrivateKey?: string}>({})

  const handleQuestionsCompleteWithAdvance = async (score: number, total: number) => {
    await handleQuestionsComplete(score, total)
    setCurrentSection('multisig-task')
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

  const overallProgress = (progress.questionsCompleted && progress.tasksCompleted) ? 100 :
                         (progress.questionsCompleted ? 50 : 0)

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/en" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Modules</span>
            </Link>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                Module 7
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-blue-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Multisig Wallets</h1>
              <p className="text-gray-400 mt-2">Master advanced security with collaborative Bitcoin transactions</p>
            </div>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Overall Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </div>

        {currentSection === 'intro' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="h-6 w-6 text-blue-500 mr-3" />
                  Advanced Security: Multisig Wallets
                </CardTitle>
                <CardDescription>
                  Learn collaborative Bitcoin security and Taproot efficiency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">👥 What you'll learn:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Understand multisig security concepts</li>
                      <li>• Learn different multisig types (P2SH, P2WSH, P2TR)</li>
                      <li>• Create and manage 2-of-3 multisig wallets</li>
                      <li>• Sign collaborative transactions</li>
                      <li>• Combine multisig with Inscriptions NFTs</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">⏱️ Module Details:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <strong>Difficulty:</strong> Advanced</li>
                      <li>• <strong>Prerequisites:</strong> Module 6</li>
                      <li>• <strong>Badge:</strong> Multisig Master</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-2">👥 About Multisig</h4>
                  <p className="text-gray-300 text-sm">
                    Multisig (multi-signature) wallets require multiple signatures to authorize transactions, 
                    providing enhanced security for high-value funds, organizational treasuries, and collaborative 
                    Bitcoin management. They're essential for enterprise Bitcoin custody and shared ownership scenarios.
                  </p>
                </div>

                <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-300 mb-2">🚀 Taproot Benefits</h4>
                  <p className="text-gray-300 text-sm">
                    • <strong>Privacy:</strong> Multisig transactions look like single-sig<br/>
                    • <strong>Efficiency:</strong> Lower fees and smaller transaction sizes<br/>
                    • <strong>Flexibility:</strong> Complex spending conditions with simple appearance<br/>
                    • <strong>Scalability:</strong> Better support for advanced scripting
                  </p>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-300 mb-2">💼 Use Cases:</h4>
                  <p className="text-gray-300 text-sm">
                    • Corporate treasuries and shared funds management<br/>
                    • Inheritance and estate planning with trusted parties<br/>
                    • Enhanced personal security with distributed keys<br/>
                    • Collaborative projects and DAOs on Bitcoin
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    Start Learning
                    <Users className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentSection === 'questions' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Trophy className="h-6 w-6 text-yellow-500 mr-3" />
                  Multisig Knowledge Test
                </CardTitle>
                <CardDescription>
                  Test your understanding of multisig wallets and Taproot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionSystem 
                  questions={moduleQuestions}
                  onComplete={handleQuestionsCompleteWithAdvance}
                  moduleId={7}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Multisig Task Section */}
        {currentSection === 'multisig-task' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-center">🔐 Task 1: Multisig Wallet Creator</CardTitle>
                <CardDescription className="text-center">
                  Configure wallets that require multiple signatures
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
                <CardTitle className="text-xl text-center">🌿 Task 2: Taproot Transaction Creator</CardTitle>
                <CardDescription className="text-center">
                  Create efficient multisig transactions using Taproot
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
                <CardTitle className="text-xl text-center">🎨 Task 3: Final NFT Badge Creator</CardTitle>
                <CardDescription className="text-center">
                  Mint your final Inscription NFT Badge using multisig
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

        {currentSection === 'completed' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-900 to-green-900 border-blue-500">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Award className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl text-white">Congratulations! Course Completed</CardTitle>
                <CardDescription className="text-blue-200">
                  You have successfully completed all 7 modules and mastered Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">🏆 Final Badge Earned:</h3>
                  <div className="flex items-center justify-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <span className="text-xl font-bold text-yellow-400">Multisig Master</span>
                  </div>
                  <p className="text-blue-200 text-sm mt-2">
                    Mastered multisig wallets and Taproot technologies, creating NFT Badge with advanced security
                  </p>
                </div>

                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">🎓 Your Bitcoin Journey:</h3>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Mastered Bitcoin fundamentals and economics</li>
                    <li>• Learned security best practices and wallet management</li>
                    <li>• Created transactions and understood fee dynamics</li>
                    <li>• Explored mining and proof-of-work consensus</li>
                    <li>• Experienced Lightning Network instant payments</li>
                    <li>• Worked with Taproot and Inscriptions NFTs</li>
                    <li>• Mastered advanced multisig security</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border border-yellow-600 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">🚀 What's Next?</h3>
                  <p className="text-gray-300 text-sm">
                    You now have comprehensive Bitcoin knowledge! Consider diving deeper into:
                    Bitcoin development, running a node, contributing to open-source projects, 
                    or sharing your knowledge with others in the Bitcoin community.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4">
                  <Link href="/en" className="flex-1 sm:flex-initial">
                    <Button variant="outline" className="w-full sm:w-auto border-blue-500 text-blue-400 hover:bg-blue-500/10">
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Button 
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    onClick={() => {
                      import('@/app/lib/shareAchievement').then(({ generateShareMessage, shareToTwitter }) => {
                        const message = generateShareMessage({ 
                          moduleId: 7, 
                          moduleName: 'Module 7', 
                          isEnglish: true
                        })
                        shareToTwitter(message)
                      })
                    }}
                  >
                    Share Your Achievement
                    <Award className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentSection !== 'completed' && currentSection !== 'intro' && (
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
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {currentSection === 'questions' && progress.questionsCompleted && (
              <Button 
                onClick={() => setCurrentSection('multisig-task')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Go to Multisig Task
              </Button>
            )}
            
            {currentSection === 'multisig-task' && multisigResults.walletAddress && (
              <Button 
                onClick={() => setCurrentSection('taproot-task')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Go to Taproot Task
              </Button>
            )}
            
            {currentSection === 'taproot-task' && multisigResults.transactionHash && (
              <Button 
                onClick={() => setCurrentSection('badge-task')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Go to Final Badge Task
              </Button>
            )}
            
          </div>
        )}
      </main>
    </div>
  )
}