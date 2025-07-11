'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, CheckCircle, Clock, Trophy, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import { useModuleAnalytics } from '@/app/hooks/useAnalytics'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import { LanguageSelector } from '@/app/components/i18n/LanguageSelector'
import { module1Questions, module1Tasks, module1Badge } from './data'

// Use imported data - converting format
const moduleQuestions = module1Questions.map(q => ({
  id: q.id.toString(),
  question: q.question,
  options: q.options,
  correct: q.correctAnswer, // Already 0-based index
  explanation: q.explanation,
  hint: '' // Add default hint as it's not in the imported data
}))

const moduleTasks = module1Tasks.map(t => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  instructions: t.instructions,
  inputLabel: t.validation.type === 'hash' ? 'Transaction Hash (TXID)' : 'Total Value Transferred (in sBTC)',
  inputPlaceholder: t.validation.placeholder || '',
  validationType: (t.validation.type === 'hash' ? 'transaction' : 'amount') as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints || [],
  externalLinks: [
    {
      label: 'Mempool Signet Explorer',
      url: 'https://mempool.space/signet'
    }
  ]
}))

export default function Module1EN() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(1, module1Badge)
  useModuleAnalytics(1) // Track module start
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
      {/* Header */}
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
                Module 1
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Bitcoin and Signet Introduction</h1>
              <p className="text-gray-400 mt-2">Learn the fundamental concepts of Bitcoin and explore the Signet network</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Overall Progress</span>
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
                  <BookOpen className="h-6 w-6 text-blue-500 mr-3" />
                  Welcome to Bitcoin!
                </CardTitle>
                <CardDescription>
                  Let's start your Bitcoin journey with fundamental concepts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">📚 What you'll learn:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Understand what a blockchain is and how it works</li>
                      <li>• Know the difference between mainnet, testnet, and Signet</li>
                      <li>• Explore transactions using mempool.space</li>
                      <li>• Interpret Bitcoin transaction data</li>
                      <li>• Understand the role of faucets in the Signet network</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">⏱️ Module Details:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <strong>Duration:</strong> 30 minutes</li>
                      <li>• <strong>Difficulty:</strong> Beginner</li>
                      <li>• <strong>Prerequisites:</strong> None</li>
                      <li>• <strong>Badge:</strong> Beginner Explorer</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-2">🎯 About Bitcoin</h4>
                  <p className="text-gray-300 text-sm">
                    Bitcoin is a decentralized digital currency that operates without central authority. 
                    It uses blockchain technology to maintain a transparent and immutable ledger of all transactions. 
                    In this module, you'll explore Bitcoin using the Signet network - a safe testing environment where you can 
                    learn without any financial risk.
                  </p>
                </div>

                <div className="bg-orange-900/20 border border-orange-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-300 mb-2">⚠️ Important:</h4>
                  <p className="text-gray-300 text-sm">
                    We'll be using the <strong>Signet network</strong>, which is Bitcoin's test network. 
                    The bitcoins here (sBTC) have no real value and are used only for learning and experimentation. 
                    This allows you to practice safely without any financial risk.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    Start Learning
                    <BookOpen className="ml-2 h-5 w-5" />
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
                <CardTitle className="flex items-center text-xl">
                  <Trophy className="h-6 w-6 text-yellow-500 mr-3" />
                  Theoretical Questions
                </CardTitle>
                <CardDescription>
                  Test your understanding of Bitcoin fundamentals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionSystem 
                  questions={moduleQuestions}
                  onComplete={handleQuestionsCompleteWithAdvance}
                  moduleId={1}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tasks Section */}
        {currentSection === 'tasks' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  Practical Tasks
                </CardTitle>
                <CardDescription>
                  Hands-on experience with Bitcoin transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskSystem 
                  tasks={moduleTasks}
                  onComplete={handleTasksCompleteWithAdvance}
                  moduleId={1}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Completion Section */}
        {currentSection === 'completed' && (
          <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-blue-500 text-center mx-auto max-w-2xl">
            <CardHeader className="px-4 sm:px-6">
              <div className="flex justify-center mb-4">
                <Award className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500" />
              </div>
              <CardTitle className="text-xl sm:text-2xl text-white">Congratulations! Module Completed</CardTitle>
              <CardDescription className="text-blue-200 text-sm sm:text-base">
                You have successfully completed Module 1
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="bg-black/20 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">🏆 Badge Earned:</h3>
                <div className="flex items-center justify-center space-x-3">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                  <span className="text-lg sm:text-xl font-bold text-yellow-400">Beginner Explorer</span>
                </div>
                <p className="text-blue-200 text-xs sm:text-sm mt-2 leading-relaxed">
                  Completed Bitcoin introduction and explored your first transaction on Signet
                </p>
              </div>

              <div className="bg-black/20 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">📚 What you learned:</h3>
                <ul className="text-blue-200 text-xs sm:text-sm space-y-1 text-left">
                  <li>• Understanding of blockchain technology</li>
                  <li>• Difference between Bitcoin networks</li>
                  <li>• How to explore Bitcoin transactions</li>
                  <li>• Reading transaction data and outputs</li>
                  <li>• Using the Signet test network safely</li>
                </ul>
              </div>

              {/* Mobile: Stack buttons vertically, Desktop: Side by side */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Link href="/en" className="flex-1 sm:flex-initial">
                  <Button variant="outline" className="w-full sm:w-auto border-blue-500 text-blue-400 hover:bg-blue-500/10 text-sm sm:text-base py-2 sm:py-3">
                    Back to Modules
                  </Button>
                </Link>
                <Link href="/en/modules/2" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-3">
                    Next Module: Security and Wallets
                    <ArrowLeft className="ml-2 h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
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
              <span>Estimated time: 30 minutes</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}