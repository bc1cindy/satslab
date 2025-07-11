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
  inputLabel: t.validation.type === 'hash' ? 'Hash da Transação (TXID)' : 'Valor Total Transferido (em sBTC)',
  inputPlaceholder: t.validation.placeholder,
  validationType: (t.validation.type === 'hash' ? 'transaction' : 'amount') as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints,
  externalLinks: [
    {
      label: 'Mempool Signet Explorer',
      url: 'https://mempool.space/signet'
    }
  ]
}))

export default function Module1() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(1, module1Badge)
  useModuleAnalytics(1) // Track module start
  const [currentSection, setCurrentSection] = useState<'intro' | 'questions' | 'tasks' | 'completed'>('intro')

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
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                Módulo 1
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Module Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Introdução ao Bitcoin e à Signet</h1>
              <p className="text-gray-400 mt-2">Conceitos básicos e exploração da blockchain</p>
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
                  <BookOpen className="h-6 w-6 text-blue-500 mr-3" />
                  Bem-vindo ao Bitcoin!
                </CardTitle>
                <CardDescription>
                  Vamos começar sua jornada no mundo do Bitcoin com conceitos fundamentais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">O que você vai aprender:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>O que é uma blockchain e como funciona</li>
                    <li>Diferenças entre a rede principal (Mainnet) e a rede de teste (Signet)</li>
                    <li>Como explorar transações Bitcoin em tempo real</li>
                    <li>Como interpretar dados de transações no explorador blockchain</li>
                  </ul>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">💡 Importante:</h3>
                  <p className="text-blue-300 text-sm">
                    Este módulo é acessível sem login! Você pode explorar e aprender os conceitos básicos. 
                    Para salvar seu progresso e ganhar badges, faça login após completar.
                  </p>
                </div>
                
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-blue-500 hover:bg-blue-600 text-lg px-8 py-3"
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
                  Teste seus conhecimentos sobre os conceitos básicos do Bitcoin
                </CardDescription>
              </CardHeader>
            </Card>
            
            <QuestionSystem 
              questions={moduleQuestions}
              onComplete={handleQuestionsCompleteWithAdvance}
              moduleId={1}
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
                  Aplique seus conhecimentos explorando a blockchain Signet
                </CardDescription>
              </CardHeader>
            </Card>
            
            <TaskSystem 
              tasks={moduleTasks}
              onComplete={handleTasksCompleteWithAdvance}
              moduleId={1}
            />
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
                Você completou com sucesso o Módulo 1
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              {progress.badgeEarned && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 sm:p-6">
                  <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">Badge Conquistado!</h3>
                  <Badge className="bg-blue-500/20 text-blue-400 text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Explorador Iniciante
                  </Badge>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                    Você demonstrou compreensão dos conceitos básicos do Bitcoin e sabe explorar a blockchain Signet
                  </p>
                </div>
              )}

              {/* Summary - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-blue-400">{progress.questionsScore}/4</div>
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

              {/* Learning Summary */}
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-white mb-3 text-sm sm:text-base">🎓 O que você aprendeu:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs sm:text-sm text-left">
                  <li>Blockchain é um livro-razão distribuído e transparente</li>
                  <li>Signet é uma rede de teste segura para experimentação</li>
                  <li>Como usar exploradores blockchain para analisar transações</li>
                  <li>Como identificar e validar hashes de transações</li>
                </ul>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  Excelente progresso! Agora que você domina os conceitos básicos, 
                  está pronto para aprender sobre segurança e carteiras Bitcoin.
                </p>
                
                {/* Mobile: Stack buttons vertically, Desktop: Side by side */}
                <div className="flex flex-col gap-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-3"
                    onClick={() => {
                      import('@/app/lib/shareAchievement').then(({ generateShareMessage, shareToTwitter }) => {
                        const message = generateShareMessage({ 
                          moduleId: 1, 
                          moduleName: 'Módulo 1', 
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
                    <Link href="/modules/2" className="flex-1">
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-sm sm:text-base py-2 sm:py-3">
                        Próximo Módulo: Segurança e Carteiras
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
                className="bg-blue-500 hover:bg-blue-600"
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