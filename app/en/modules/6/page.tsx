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
import { module6Questions, module6Tasks, module6Badge } from './data'

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
  inputLabel: t.validation.type === 'hash' ? 'Transaction Hash / Ordinal ID' : 'Value',
  inputPlaceholder: t.validation.placeholder,
  validationType: 'transaction' as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints,
  externalLinks: [
    {
      label: 'Signet Explorer',
      url: 'https://mempool.space/signet'
    }
  ]
}))

export default function Module6EN() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(6, {
    ...module6Badge,
    moduleId: 6
  })
  useModuleAnalytics(6)
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'tasks' | 'completed'>('intro')

  const handleQuestionsCompleteWithAdvance = async (score: number, total: number) => {
    await handleQuestionsComplete(score, total)
    setCurrentSection('tasks')
  }

  const handleTasksCompleteWithAdvance = async () => {
    await handleTasksComplete()
    setCurrentSection('completed')
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
                Module 6
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-purple-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Taproot and Ordinals</h1>
              <p className="text-gray-400 mt-2">Explore advanced Bitcoin features: privacy upgrades and native NFTs</p>
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
                  <Shield className="h-6 w-6 text-purple-500 mr-3" />
                  Advanced Bitcoin: Taproot & Ordinals
                </CardTitle>
                <CardDescription>
                  Dive into cutting-edge Bitcoin technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">🔒 What you'll learn:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Understand Taproot protocol improvements</li>
                      <li>• Learn about Schnorr signatures and privacy</li>
                      <li>• Explore Ordinals and Bitcoin-native NFTs</li>
                      <li>• Create Taproot transactions</li>
                      <li>• Mint your first Ordinal NFT Badge</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">⏱️ Module Details:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <strong>Duration:</strong> 60 minutes</li>
                      <li>• <strong>Difficulty:</strong> Advanced</li>
                      <li>• <strong>Prerequisites:</strong> Module 5</li>
                      <li>• <strong>Badge:</strong> Taproot Pioneer</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-900/20 border border-purple-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-300 mb-2">🔒 About Taproot</h4>
                  <p className="text-gray-300 text-sm">
                    Taproot is Bitcoin's most significant upgrade in years, introducing Schnorr signatures 
                    for better privacy and efficiency. It makes complex smart contracts look like simple transactions, 
                    enhancing both privacy and scalability while reducing fees.
                  </p>
                </div>

                <div className="bg-orange-900/20 border border-orange-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-300 mb-2">🎨 About Ordinals</h4>
                  <p className="text-gray-300 text-sm">
                    Ordinals revolutionize Bitcoin by enabling NFTs directly on the base layer. 
                    By inscribing data onto individual satoshis, Ordinals create unique, immutable digital artifacts 
                    without requiring any additional tokens or layers - pure Bitcoin NFTs!
                  </p>
                </div>

                <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-300 mb-2">⚠️ Advanced Module:</h4>
                  <p className="text-gray-300 text-sm">
                    This module covers advanced Bitcoin concepts. Make sure you understand previous modules 
                    before proceeding. You'll be working with cutting-edge features that push Bitcoin's capabilities.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                  >
                    Start Learning
                    <Shield className="ml-2 h-5 w-5" />
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
                  Advanced Bitcoin Knowledge Test
                </CardTitle>
                <CardDescription>
                  Test your understanding of Taproot and Ordinals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionSystem 
                  questions={moduleQuestions}
                  onComplete={handleQuestionsCompleteWithAdvance}
                  moduleId={6}
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
                  Advanced Practical Tasks
                </CardTitle>
                <CardDescription>
                  Hands-on experience with Taproot and Ordinals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskSystem 
                  tasks={moduleTasks}
                  onComplete={handleTasksCompleteWithAdvance}
                  moduleId={6}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {currentSection === 'completed' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900 to-orange-900 border-purple-500">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Award className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl text-white">Congratulations! Module Completed</CardTitle>
                <CardDescription className="text-purple-200">
                  You have successfully completed Module 6
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">🏆 Badge Earned:</h3>
                  <div className="flex items-center justify-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <span className="text-xl font-bold text-yellow-400">Taproot Pioneer</span>
                  </div>
                  <p className="text-purple-200 text-sm mt-2">
                    Mastered Taproot and created your first Ordinal NFT Badge on Bitcoin
                  </p>
                </div>

                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">📚 What you learned:</h3>
                  <ul className="text-purple-200 text-sm space-y-1">
                    <li>• How Taproot enhances Bitcoin privacy and efficiency</li>
                    <li>• The power of Schnorr signatures</li>
                    <li>• Creating and understanding Ordinals NFTs</li>
                    <li>• Advanced transaction creation on Bitcoin</li>
                    <li>• The relationship between data size and transaction fees</li>
                  </ul>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <Link href="/en">
                    <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                      Back to Modules
                    </Button>
                  </Link>
                  <Link href="/en/modules/7">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Next Module: Bitcoin Development
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
              <span>Estimated time: 60 minutes</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}