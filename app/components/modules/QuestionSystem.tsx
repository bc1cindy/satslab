'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { CheckCircle, XCircle, HelpCircle, Lightbulb } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
  hint?: string
}

interface QuestionSystemProps {
  questions: Question[]
  onComplete: (score: number, totalQuestions: number) => void
  moduleId: number
}

export default function QuestionSystem({ questions, onComplete, moduleId }: QuestionSystemProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1))
  const [showResults, setShowResults] = useState<boolean[]>(new Array(questions.length).fill(false))
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleAnswer = (optionIndex: number) => {
    if (showResults[currentQuestion]) return

    const newSelectedAnswers = [...selectedAnswers]
    const newShowResults = [...showResults]
    
    newSelectedAnswers[currentQuestion] = optionIndex
    newShowResults[currentQuestion] = true
    
    setSelectedAnswers(newSelectedAnswers)
    setShowResults(newShowResults)
    setAttempts(attempts + 1)

    // Update score
    const isCorrect = optionIndex === questions[currentQuestion].correct
    if (isCorrect) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowHint(false)
    } else {
      setCompleted(true)
      onComplete(score, questions.length)
    }
  }

  const question = questions[currentQuestion]
  const isAnswered = showResults[currentQuestion]
  const selectedAnswer = selectedAnswers[currentQuestion]
  const isCorrect = selectedAnswer === question.correct

  // Show hint after 30 seconds or 2 wrong attempts
  useEffect(() => {
    if (!isAnswered && !showHint) {
      const timer = setTimeout(() => {
        setShowHint(true)
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [currentQuestion, isAnswered, showHint])

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            Perguntas Concluídas!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-orange-500">
            {score}/{questions.length}
          </div>
          <div className="text-xl text-gray-300">
            {percentage}% de acerto
          </div>
          <Badge 
            variant="secondary" 
            className={`text-lg px-4 py-2 ${
              percentage >= 80 ? 'bg-green-500/20 text-green-400' : 
              percentage >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 
              'bg-red-500/20 text-red-400'
            }`}
          >
            {percentage >= 80 ? 'Excelente!' : percentage >= 60 ? 'Bom trabalho!' : 'Continue estudando!'}
          </Badge>
          <p className="text-gray-400">
            {percentage >= 80 
              ? 'Você domina bem os conceitos básicos!'
              : 'Revise os conceitos e tente novamente quando se sentir pronto.'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
        <span>Pontuação: {score}/{questions.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center">
            <HelpCircle className="h-6 w-6 text-blue-500 mr-3" />
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hint */}
          {showHint && question.hint && !isAnswered && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start">
                <Lightbulb className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-400 mb-1">Dica:</p>
                  <p className="text-sm text-blue-300">{question.hint}</p>
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              let buttonClass = "w-full text-left p-2 sm:p-4 rounded-lg border transition-all duration-200 min-h-[60px] max-w-full overflow-hidden "
              
              if (!isAnswered) {
                buttonClass += "border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 text-white"
              } else {
                if (index === question.correct) {
                  buttonClass += "border-green-500 bg-green-500/20 text-green-400"
                } else if (index === selectedAnswer && index !== question.correct) {
                  buttonClass += "border-red-500 bg-red-500/20 text-red-400"
                } else {
                  buttonClass += "border-gray-600 bg-gray-800 text-gray-400"
                }
              }

              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={`${buttonClass} [&>div]:w-full [&>div>div]:w-full`}
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                >
                  <div className="w-full">
                    <div className="flex items-start gap-2">
                      {/* Option Letter - Fixed width */}
                      <span className="font-medium text-xs sm:text-base flex-shrink-0 mt-0.5">
                        {String.fromCharCode(97 + index)})
                      </span>
                      
                      {/* Text Content - Flexible width with proper wrapping */}
                      <div className="flex-1 min-w-0">
                        <span className="inline-block text-xs sm:text-base leading-relaxed" style={{ 
                          maxWidth: '100%',
                          wordWrap: 'break-word',
                          wordBreak: 'break-word', 
                          overflowWrap: 'break-word',
                          WebkitLineBreak: 'after-white-space'
                        }}>
                          {option}
                        </span>
                      </div>
                      
                      {/* Status Icon - Fixed width */}
                      {isAnswered && (
                        <div className="flex-shrink-0 ml-2">
                          {index === question.correct && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />}
                          {index === selectedAnswer && index !== question.correct && <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-300 mb-2">Explicação:</p>
              <p className="text-sm text-gray-400">{question.explanation}</p>
            </div>
          )}

          {/* Continue Button */}
          {isAnswered && (
            <div className="text-center">
              <Button
                onClick={handleNext}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {currentQuestion < questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultados'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}