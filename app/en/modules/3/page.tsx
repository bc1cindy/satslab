'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, CheckCircle, Clock, Trophy, Send, Award } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import { useModuleAnalytics } from '@/app/hooks/useAnalytics'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import { LanguageSelector } from '@/app/components/i18n/LanguageSelector'
import { module3Questions, module3Tasks, module3Badge } from './data'

const moduleQuestions = module3Questions.map(q => ({
  id: q.id.toString(),
  question: q.question,
  options: q.options,
  correct: q.correctAnswer,
  explanation: q.explanation,
  hint: ''
}))

const moduleTasks = module3Tasks.map(t => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  instructions: t.instructions,
  inputLabel: 'Transaction Hash (TXID)',
  inputPlaceholder: t.validation.placeholder || '',
  validationType: 'transaction' as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints || [],
  externalLinks: [
    {
      label: 'Signet Explorer',
      url: 'https://mempool.space/signet'
    }
  ]
}))

export default function Module3EN() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(3, {
    ...module3Badge,
    moduleId: 3
  })
  useModuleAnalytics(3)
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'tasks' | 'completed'>('intro')

  const handleQuestionsCompleteWithAdvance = async (score: number, total: number) => {
    await handleQuestionsComplete(score, total)
    setCurrentSection('tasks')
  }

  const handleTasksCompleteWithAdvance = async (completedTasks: number, totalTasks: number) => {
    await handleTasksComplete(completedTasks, totalTasks)
    
    if (completedTasks === totalTasks && progress.questionsCompleted) {
      setCurrentSection('completed')
    }
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
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                Module 3
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Send className="h-12 w-12 text-purple-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Signet Transactions</h1>
              <p className="text-gray-400 mt-2">Learn to create and send Bitcoin transactions, understand fees, and use OP_RETURN</p>
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
                  <Send className="h-6 w-6 text-purple-500 mr-3" />
                  Bitcoin Transaction Mastery
                </CardTitle>
                <CardDescription>
                  Learn the practical aspects of sending Bitcoin transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">💸 What you'll learn:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Understand how transaction fees work</li>
                      <li>• Learn the relationship between fees and confirmation time</li>
                      <li>• Practice sending transactions on Signet</li>
                      <li>• Discover OP_RETURN and its applications</li>
                      <li>• Create transactions with custom data</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">⏱️ Module Details:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <strong>Difficulty:</strong> Intermediate</li>
                      <li>• <strong>Prerequisites:</strong> Module 2</li>
                      <li>• <strong>Badge:</strong> Blockchain Messenger</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-900/20 border border-purple-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-300 mb-2">💸 About Bitcoin Transactions</h4>
                  <p className="text-gray-300 text-sm">
                    Bitcoin transactions are the core of the network - they transfer value and can carry data. 
                    Understanding fees, confirmation times, and special features like OP_RETURN will make you 
                    a proficient Bitcoin user. You'll practice with real transactions on the safe Signet network.
                  </p>
                </div>

                <div className="bg-orange-900/20 border border-orange-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-300 mb-2">⚡ Fee Strategy:</h4>
                  <p className="text-gray-300 text-sm">
                    Transaction fees are your way of bidding for block space. Higher fees = faster confirmation. 
                    Lower fees = slower confirmation. We'll teach you how to choose the right fee for your needs 
                    and when to use different strategies.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                  >
                    Start Learning
                    <Send className="ml-2 h-5 w-5" />
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
                  Transaction Knowledge Test
                </CardTitle>
                <CardDescription>
                  Test your understanding of Bitcoin transactions and fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionSystem 
                  questions={moduleQuestions}
                  onComplete={handleQuestionsCompleteWithAdvance}
                  moduleId={3}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {currentSection === 'tasks' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CheckCircle className="h-6 w-6 text-purple-500 mr-3" />
                  Practical Transaction Tasks
                </CardTitle>
                <CardDescription>
                  Hands-on experience with Bitcoin transactions and OP_RETURN
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskSystem 
                  tasks={moduleTasks}
                  onComplete={handleTasksCompleteWithAdvance}
                  moduleId={3}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {currentSection === 'completed' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500 mx-auto max-w-2xl">
              <CardHeader className="text-center px-4 sm:px-6">
                <div className="flex justify-center mb-4">
                  <Award className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-white">Congratulations! Module Completed</CardTitle>
                <CardDescription className="text-purple-200 text-sm sm:text-base">
                  You have successfully completed Module 3
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4 px-4 sm:px-6">
                <div className="bg-black/20 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">🏆 Badge Earned:</h3>
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                    <span className="text-lg sm:text-xl font-bold text-yellow-400">Blockchain Messenger</span>
                  </div>
                  <p className="text-purple-200 text-xs sm:text-sm mt-2 leading-relaxed">
                    Sent transactions and permanently recorded data on the Bitcoin blockchain
                  </p>
                </div>

                <div className="bg-black/20 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">📚 What you learned:</h3>
                  <ul className="text-purple-200 text-xs sm:text-sm space-y-1 text-left">
                    <li>• How Bitcoin transaction fees work</li>
                    <li>• The relationship between fees and confirmation time</li>
                    <li>• Practical experience sending transactions</li>
                    <li>• Using OP_RETURN to store data on the blockchain</li>
                    <li>• Advanced transaction creation techniques</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-3"
                    onClick={() => {
                      import('@/app/lib/shareAchievement').then(({ generateShareMessage, shareToTwitter }) => {
                        const message = generateShareMessage({ 
                          moduleId: 3, 
                          moduleName: 'Module 3', 
                          isEnglish: true
                        })
                        shareToTwitter(message)
                      })
                    }}
                  >
                    Share Your Achievement
                    <Award className="ml-2 h-5 w-5" />
                  </Button>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <Link href="/en" className="flex-1 sm:flex-initial">
                      <Button variant="outline" className="w-full sm:w-auto border-purple-500 text-purple-400 hover:bg-purple-500/10 text-sm sm:text-base py-2 sm:py-3">
                        Back to Modules
                      </Button>
                    </Link>
                    <Link href="/en/modules/4" className="flex-1">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-base py-2 sm:py-3">
                        Next Module: Mining Simulation
                        <ArrowLeft className="ml-2 h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                      </Button>
                    </Link>
                  </div>
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
                if (currentSection === 'tasks') setCurrentSection('questions')
                else if (currentSection === 'questions') setCurrentSection('intro')
              }}
              className="border-gray-600 text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}