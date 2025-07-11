'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, CheckCircle, Clock, Trophy, Zap, Award } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import { useModuleAnalytics } from '@/app/hooks/useAnalytics'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import { LanguageSelector } from '@/app/components/i18n/LanguageSelector'
import { module5Questions, module5Tasks, module5Badge } from './data'

const moduleQuestions = module5Questions.map(q => ({
  id: q.id.toString(),
  question: q.question,
  options: q.options,
  correct: q.correctAnswer,
  explanation: q.explanation,
  hint: ''
}))

const moduleTasks = module5Tasks.map(t => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  instructions: t.instructions,
  inputLabel: t.validation.type === 'address' ? 'Lightning Invoice' : 
              t.validation.type === 'transaction' ? 'Transaction Hash/Preimage' :
              'Amount in Satoshis',
  inputPlaceholder: t.validation.placeholder || '',
  validationType: t.validation.type as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints || [],
  externalLinks: []
}))

export default function Module5EN() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(5, {
    ...module5Badge,
    moduleId: 5
  })
  useModuleAnalytics(5)
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
              <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                Module 5
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-yellow-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Lightning Network</h1>
              <p className="text-gray-400 mt-2">Learn about instant Bitcoin transactions and micropayments</p>
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
                  <Zap className="h-6 w-6 text-yellow-500 mr-3" />
                  Lightning Network: Instant Bitcoin
                </CardTitle>
                <CardDescription>
                  Experience the future of Bitcoin payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-400 mb-2">⚡ What you'll learn:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Understand scalability layers and Layer 2</li>
                      <li>• Set up and use Lightning wallets</li>
                      <li>• Make instant Bitcoin payments</li>
                      <li>• Explore payment channels and routing</li>
                      <li>• Compare on-chain vs Lightning fees</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">⏱️ Module Details:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <strong>Difficulty:</strong> Intermediate</li>
                      <li>• <strong>Prerequisites:</strong> Module 4</li>
                      <li>• <strong>Badge:</strong> Lightning Fast</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-300 mb-2">⚡ About Lightning Network</h4>
                  <p className="text-gray-300 text-sm">
                    The Lightning Network is Bitcoin's Layer 2 scaling solution that enables instant, 
                    low-cost transactions. By moving transactions off-chain into payment channels, 
                    Lightning makes micropayments viable and scales Bitcoin to millions of transactions per second.
                  </p>
                </div>

                <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-2">🌟 Key Benefits:</h4>
                  <p className="text-gray-300 text-sm">
                    • <strong>Instant:</strong> Transactions settle in milliseconds<br/>
                    • <strong>Cheap:</strong> Fees measured in fractions of a satoshi<br/>
                    • <strong>Scalable:</strong> Millions of transactions per second<br/>
                    • <strong>Private:</strong> Payments don't appear on the main blockchain
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3"
                  >
                    Start Learning
                    <Zap className="ml-2 h-5 w-5" />
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
                  Lightning Knowledge Test
                </CardTitle>
                <CardDescription>
                  Test your understanding of the Lightning Network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionSystem 
                  questions={moduleQuestions}
                  onComplete={handleQuestionsCompleteWithAdvance}
                  moduleId={5}
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
                  <CheckCircle className="h-6 w-6 text-yellow-500 mr-3" />
                  Practical Lightning Tasks
                </CardTitle>
                <CardDescription>
                  Hands-on experience with Lightning Network payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskSystem 
                  tasks={moduleTasks}
                  onComplete={handleTasksCompleteWithAdvance}
                  moduleId={5}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {currentSection === 'completed' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-yellow-900 to-blue-900 border-yellow-500">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Award className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl text-white">Congratulations! Module Completed</CardTitle>
                <CardDescription className="text-yellow-200">
                  You have successfully completed Module 5
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">🏆 Badge Earned:</h3>
                  <div className="flex items-center justify-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <span className="text-xl font-bold text-yellow-400">Lightning Fast</span>
                  </div>
                  <p className="text-yellow-200 text-sm mt-2">
                    Mastered the Lightning Network and performed instant transactions
                  </p>
                </div>

                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">📚 What you learned:</h3>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    <li>• How Lightning Network enables instant Bitcoin payments</li>
                    <li>• The concept of payment channels and routing</li>
                    <li>• Practical experience with Lightning wallets</li>
                    <li>• Understanding of Layer 2 scaling solutions</li>
                    <li>• Comparison between on-chain and off-chain transactions</li>
                  </ul>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <Link href="/en">
                    <Button variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10">
                      Back to Modules
                    </Button>
                  </Link>
                  <Link href="/en/modules/6">
                    <Button className="bg-yellow-600 hover:bg-yellow-700">
                      Next Module: DeFi on Bitcoin
                      <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                    </Button>
                  </Link>
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