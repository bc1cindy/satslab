'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, Send, Trophy, BookOpen, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useModuleProgress } from '@/app/hooks/useModuleProgress'
import QuestionSystem from '@/app/components/modules/QuestionSystem'
import TaskSystem from '@/app/components/modules/TaskSystem'
import { module3Questions, module3Tasks, module3Badge } from './data'


// Use imported data - converting format
const moduleQuestions = module3Questions.map(q => ({
  id: q.id.toString(),
  question: q.question,
  options: q.options,
  correct: q.correctAnswer, // Already 0-based index
  explanation: q.explanation,
  hint: '' // Add default hint as it's not in the imported data
}))

const moduleTasks = module3Tasks.map(t => ({
  id: t.id.toString(),
  title: t.title,
  description: t.description,
  instructions: t.instructions,
  inputLabel: t.validation.type === 'seed' ? 'Seed Phrase' : 
              t.validation.type === 'address' ? 'Endereço Bitcoin' :
              t.validation.type === 'hash' ? 'Hash da Transação (TXID)' :
              'Resposta',
  inputPlaceholder: t.validation.placeholder || '',
  validationType: t.validation.type === 'hash' ? 'transaction' : 
                  t.validation.type as 'transaction' | 'amount' | 'address' | 'custom',
  hints: t.hints || [],
  externalLinks: t.externalLinks || []
}))

export default function Module3() {
  const { progress, handleQuestionsComplete, handleTasksComplete } = useModuleProgress(3, {
    ...module3Badge,
    moduleId: 3
  })
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
              <div className="text-sm text-gray-400">
                Tempo: {Math.floor(progress.timeSpent / 60)}m {progress.timeSpent % 60}s
              </div>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                Módulo 3
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Module Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Send className="h-12 w-12 text-orange-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Transações Bitcoin</h1>
              <p className="text-gray-400 mt-2">Aprenda sobre taxas, confirmações e dados personalizados</p>
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
                  <Send className="h-6 w-6 text-orange-500 mr-3" />
                  Domine as Transações Bitcoin!
                </CardTitle>
                <CardDescription>
                  Aprenda a enviar Bitcoin, otimizar taxas e gravar dados na blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">O que você vai aprender:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    <li>Como funcionam as taxas de transação e sua relação com velocidade</li>
                    <li>Por que blocos Bitcoin demoram ~10 minutos para confirmar</li>
                    <li>Estratégias para otimizar custos vs. tempo de confirmação</li>
                    <li>Como enviar transações na rede Signet de forma prática</li>
                    <li>O que é OP_RETURN e como gravar dados na blockchain</li>
                    <li>Aplicações práticas de timestamps e mensagens imutáveis</li>
                  </ul>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">📊 Pré-requisitos:</h3>
                  <p className="text-blue-300 text-sm">
                    Você precisará da carteira Signet criada no Módulo 2 e alguns sBTC do faucet 
                    para praticar o envio de transações.
                  </p>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-400 mb-2">⏱️ Tempo de Bloco Bitcoin:</h3>
                  <p className="text-yellow-300 text-sm">
                    <strong>Blocos Bitcoin são minerados a cada ~10 minutos</strong> - isso significa que 
                    suas transações podem demorar esse tempo para a primeira confirmação. 
                    Esta é uma das razões pelas quais a <strong>Lightning Network</strong> foi criada: 
                    para pagamentos instantâneos! Você vai aprender sobre ela no Módulo 5.
                  </p>
                </div>
                
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setCurrentSection('questions')}
                    className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3"
                  >
                    Começar Aprendizado
                    <TrendingUp className="h-5 w-5 ml-2" />
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
                  Teste seus conhecimentos sobre transações Bitcoin
                </CardDescription>
              </CardHeader>
            </Card>
            
            <QuestionSystem 
              questions={moduleQuestions}
              onComplete={handleQuestionsCompleteWithAdvance}
              moduleId={3}
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
                  Pratique enviando transações e gravando dados na blockchain
                </CardDescription>
              </CardHeader>
            </Card>
            
            <TaskSystem 
              tasks={moduleTasks}
              onComplete={handleTasksCompleteWithAdvance}
              moduleId={3}
            />
          </div>
        )}

        {/* Completion Screen */}
        {currentSection === 'completed' && (
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-green-400 flex items-center justify-center">
                <Trophy className="h-8 w-8 mr-3" />
                Parabéns! Módulo Concluído
              </CardTitle>
              <CardDescription>
                Você completou com sucesso o Módulo 3
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {progress.badgeEarned && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="text-xl font-semibold text-green-400 mb-2">Badge Conquistado!</h3>
                  <Badge className="bg-orange-500/20 text-orange-400 text-lg px-4 py-2">
                    <Award className="h-5 w-5 mr-2" />
                    {module3Badge.name}
                  </Badge>
                  <p className="text-sm text-gray-400 mt-2">
                    Você domina o envio de transações e sabe gravar dados na blockchain Bitcoin
                  </p>
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{progress.questionsScore}/3</div>
                  <div className="text-sm text-gray-400">Perguntas Corretas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{progress.tasksScore}/2</div>
                  <div className="text-sm text-gray-400">Tarefas Concluídas</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{Math.floor(progress.timeSpent / 60)}m</div>
                  <div className="text-sm text-gray-400">Tempo Total</div>
                </div>
              </div>

              {/* Learning Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">🎓 O que você aprendeu:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm text-left">
                  <li>Blocos Bitcoin são minerados a cada ~10 minutos</li>
                  <li>Taxas de transação incentivam mineradores e afetam velocidade</li>
                  <li>Taxas altas = confirmação rápida, taxas baixas = espera mais longa</li>
                  <li>Lightning Network resolve o problema de tempo de confirmação</li>
                  <li>OP_RETURN permite gravar dados permanentes na blockchain</li>
                  <li>Transações são imutáveis e verificáveis publicamente</li>
                </ul>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <p className="text-gray-300">
                  Excelente! Agora que você entende como funcionam as transações Bitcoin e por que 
                  demoram ~10 minutos para confirmar, está pronto para aprender sobre mineração.
                </p>
                
                <div className="flex space-x-4">
                  <Link href="/modules/4" className="flex-1">
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      Próximo Módulo: Mineração Bitcoin
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="border-gray-600 text-gray-300">
                      Voltar ao Início
                    </Button>
                  </Link>
                </div>
                
                <p className="text-sm text-gray-400">
                  💡 Dica: Lembre-se que a Lightning Network (Módulo 5) resolve o problema de tempo!
                </p>
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
                className="bg-orange-500 hover:bg-orange-600"
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