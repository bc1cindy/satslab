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
import { module4Questions, module4Tasks, module4Badge } from './data'

const moduleQuestions = module4Questions.map(q => ({
  id: q.id.toString(),
  question: q.question,
  options: q.options,
  correct: q.correctAnswer,
  explanation: q.explanation,
  hint: ''
}))

const moduleTasks = module4Tasks.map(t => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  instructions: t.instructions,
  inputLabel: t.validation.type === 'hash' ? 'Hash Found' : 'Total Reward (BTC)',
  inputPlaceholder: t.validation.placeholder,
  validationType: (t.validation.type === 'hash' ? 'transaction' : 'amount') as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints,
  externalLinks: []
}))

export default function Module4EN() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(4, {
    ...module4Badge,
    moduleId: 4
  })
  useModuleAnalytics(4)
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
              <Badge variant="outline" className="border-orange-500 text-orange-400">
                Module 4
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-orange-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Bitcoin Mining</h1>
              <p className="text-gray-400 mt-2">Learn about proof-of-work and simulate the mining process</p>
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
                  <Zap className="h-6 w-6 text-orange-500 mr-3" />
                  Bitcoin Mining: Proof-of-Work
                </CardTitle>
                <CardDescription>
                  Discover how mining works and Bitcoin's security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">⚡ What you'll learn:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• The concept of proof-of-work</li>
                      <li>• How miners protect the Bitcoin network</li>
                      <li>• Practical simulation of the mining process</li>
                      <li>• How mining pools work</li>
                      <li>• Relationship between difficulty and block time</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-400 mb-2">⏱️ Module Details:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <strong>Duration:</strong> 45 minutes</li>
                      <li>• <strong>Difficulty:</strong> Intermediate</li>
                      <li>• <strong>Prerequisites:</strong> Module 3</li>
                      <li>• <strong>Badge:</strong> Mining Apprentice</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-900/20 border border-orange-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-300 mb-2">⚡ About Bitcoin Mining</h4>
                  <p className="text-gray-300 text-sm">
                    Bitcoin mining is the process that secures the network and validates transactions. 
                    Miners compete to solve cryptographic puzzles, and the winner gets to add the next block 
                    to the blockchain. This proof-of-work system makes Bitcoin immutable and trustless.
                  </p>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-300 mb-2">🎯 Hands-on Experience:</h4>
                  <p className="text-gray-300 text-sm">
                    You'll use real simulators to understand how Bitcoin mining works, 
                    experimenting with different difficulty levels and mining pools. 
                    Experience the computational challenge that secures the network!
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
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
                  Mining Knowledge Test
                </CardTitle>
                <CardDescription>
                  Test your understanding of Bitcoin mining and proof-of-work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionSystem 
                  questions={moduleQuestions}
                  onComplete={handleQuestionsCompleteWithAdvance}
                  moduleId={4}
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
                  <CheckCircle className="h-6 w-6 text-orange-500 mr-3" />
                  Practical Mining Tasks
                </CardTitle>
                <CardDescription>
                  Hands-on experience with Bitcoin mining simulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskSystem 
                  tasks={moduleTasks}
                  onComplete={handleTasksCompleteWithAdvance}
                  moduleId={4}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {currentSection === 'completed' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-900 to-blue-900 border-orange-500">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Award className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl text-white">Congratulations! Module Completed</CardTitle>
                <CardDescription className="text-orange-200">
                  You have successfully completed Module 4
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">🏆 Badge Earned:</h3>
                  <div className="flex items-center justify-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <span className="text-xl font-bold text-yellow-400">Mining Apprentice</span>
                  </div>
                  <p className="text-orange-200 text-sm mt-2">
                    Completed mining simulations and understood the proof-of-work process
                  </p>
                </div>

                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">📚 What you learned:</h3>
                  <ul className="text-orange-200 text-sm space-y-1">
                    <li>• How proof-of-work secures the Bitcoin network</li>
                    <li>• The computational challenge miners face</li>
                    <li>• How difficulty adjusts to maintain block times</li>
                    <li>• The benefits of mining pool cooperation</li>
                    <li>• How transaction fees incentivize miners</li>
                  </ul>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <Link href="/en">
                    <Button variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10">
                      Back to Modules
                    </Button>
                  </Link>
                  <Link href="/en/modules/5">
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      Next Module: Lightning Network
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
              <span>Estimated time: 45 minutes</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}