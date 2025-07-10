'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, CheckCircle, Clock, Trophy, Shield, Award } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import { useModuleAnalytics } from '@/app/hooks/useAnalytics'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import { LanguageSelector } from '@/app/components/i18n/LanguageSelector'
import { module2Questions, module2Tasks, module2Badge } from './data'

// Use imported data - converting format
const moduleQuestions = module2Questions.map(q => ({
  id: q.id.toString(),
  question: q.question,
  options: q.options,
  correct: q.correctAnswer,
  explanation: q.explanation,
  hint: ''
}))

const moduleTasks = module2Tasks.map(t => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  instructions: t.instructions,
  inputLabel: t.validation.type === 'address' ? 'Bitcoin Address' : 'Transaction Hash (TXID)',
  inputPlaceholder: t.validation.placeholder || '',
  validationType: (t.validation.type === 'hash' ? 'transaction' : 'address') as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints || [],
  externalLinks: t.externalLinks || []
}))

export default function Module2EN() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(2, {
    ...module2Badge,
    moduleId: 2
  })
  useModuleAnalytics(2)
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
              <Badge variant="outline" className="border-green-500 text-green-400">
                Module 2
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
            <Shield className="h-12 w-12 text-green-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Security and Wallets</h1>
              <p className="text-gray-400 mt-2">Learn about private keys, wallet security, and creating Bitcoin addresses</p>
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
                  <Shield className="h-6 w-6 text-green-500 mr-3" />
                  Bitcoin Security Fundamentals
                </CardTitle>
                <CardDescription>
                  Master the essential security practices for Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">🔐 What you'll learn:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Understand the importance of private keys</li>
                      <li>• Learn to protect seed phrases</li>
                      <li>• Generate your first Bitcoin wallet on Signet</li>
                      <li>• Know the difference between hot and cold wallets</li>
                      <li>• Practice good security practices</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-400 mb-2">⏱️ Module Details:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <strong>Duration:</strong> 45 minutes</li>
                      <li>• <strong>Difficulty:</strong> Beginner</li>
                      <li>• <strong>Prerequisites:</strong> Module 1</li>
                      <li>• <strong>Badge:</strong> Key Guardian</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-300 mb-2">🔑 About Bitcoin Security</h4>
                  <p className="text-gray-300 text-sm">
                    Bitcoin security is fundamentally different from traditional banking. You are your own bank, 
                    which means you have complete control - and complete responsibility - for your funds. 
                    In this module, you'll learn the critical security concepts that every Bitcoin user must understand.
                  </p>
                </div>

                <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-300 mb-2">⚠️ Critical Security Rule:</h4>
                  <p className="text-gray-300 text-sm">
                    <strong>"Not your keys, not your coins"</strong> - This fundamental rule means that if you don't control 
                    the private keys to your Bitcoin, you don't truly own it. We'll teach you how to generate and 
                    securely manage your own keys using the safe Signet test network.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    Start Learning
                    <Shield className="ml-2 h-5 w-5" />
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
                  Security Knowledge Test
                </CardTitle>
                <CardDescription>
                  Test your understanding of Bitcoin security fundamentals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionSystem 
                  questions={moduleQuestions}
                  onComplete={handleQuestionsCompleteWithAdvance}
                  moduleId={2}
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
                  Practical Security Tasks
                </CardTitle>
                <CardDescription>
                  Hands-on experience with Bitcoin wallet creation and security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskSystem 
                  tasks={moduleTasks}
                  onComplete={handleTasksCompleteWithAdvance}
                  moduleId={2}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Completion Section */}
        {currentSection === 'completed' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-green-900 to-blue-900 border-green-500">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Award className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl text-white">Congratulations! Module Completed</CardTitle>
                <CardDescription className="text-green-200">
                  You have successfully completed Module 2
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">🏆 Badge Earned:</h3>
                  <div className="flex items-center justify-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <span className="text-xl font-bold text-yellow-400">Key Guardian</span>
                  </div>
                  <p className="text-green-200 text-sm mt-2">
                    Mastered Bitcoin security fundamentals and created your first wallet
                  </p>
                </div>

                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">📚 What you learned:</h3>
                  <ul className="text-green-200 text-sm space-y-1">
                    <li>• The critical importance of private keys</li>
                    <li>• How to protect and manage seed phrases</li>
                    <li>• Created your first Bitcoin wallet on Signet</li>
                    <li>• Understanding of hot vs cold wallet security</li>
                    <li>• Essential Bitcoin security best practices</li>
                  </ul>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <Link href="/en">
                    <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                      Back to Modules
                    </Button>
                  </Link>
                  <Link href="/en/modules/3">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Next Module: Signet Transactions
                      <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
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
              <span>Estimated time: 45 minutes</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}