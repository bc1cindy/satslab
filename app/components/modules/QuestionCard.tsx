'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuestionCardProps {
  question: Question
  onAnswer: (isCorrect: boolean) => void
  showResult?: boolean
  questionIndex?: number
  totalQuestions?: number
  userAnswer?: number
}

export function QuestionCard({ question, onAnswer, showResult = false }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)

  const handleAnswer = (answerIndex: number) => {
    if (hasAnswered) return
    
    setSelectedAnswer(answerIndex)
    setHasAnswered(true)
    
    const isCorrect = answerIndex === question.correctAnswer
    onAnswer(isCorrect)
  }

  const getOptionStyle = (index: number) => {
    if (!hasAnswered) {
      return "border-gray-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer"
    }
    
    if (index === question.correctAnswer) {
      return "border-green-500 bg-green-50 text-green-800"
    }
    
    if (index === selectedAnswer && index !== question.correctAnswer) {
      return "border-red-500 bg-red-50 text-red-800"
    }
    
    return "border-gray-200 bg-gray-50 text-gray-500"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{question.question}</CardTitle>
          <Badge variant="outline">Questão {question.id}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`p-2 sm:p-4 rounded-lg border-2 transition-all min-h-[60px] max-w-full whitespace-normal ${getOptionStyle(index)}`}
              onClick={() => handleAnswer(index)}
            >
              <div className="w-full">
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 mt-0.5 ${
                    hasAnswered && index === question.correctAnswer
                      ? 'border-green-500 bg-green-500 text-white'
                      : hasAnswered && index === selectedAnswer
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-gray-300'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs sm:text-base leading-relaxed whitespace-normal" style={{ 
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      hyphens: 'auto'
                    }}>
                      {option}
                    </span>
                  </div>
                  {hasAnswered && (
                    <div className="flex-shrink-0 ml-2">
                      {index === question.correctAnswer && (
                        <span className="text-green-600 text-base sm:text-lg">✓</span>
                      )}
                      {index === selectedAnswer && index !== question.correctAnswer && (
                        <span className="text-red-600 text-base sm:text-lg">✗</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasAnswered && (
          <div className={`p-4 rounded-lg border ${
            selectedAnswer === question.correctAnswer
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}>
            <h4 className={`font-semibold mb-2 ${
              selectedAnswer === question.correctAnswer ? 'text-green-800' : 'text-red-800'
            }`}>
              {selectedAnswer === question.correctAnswer ? '🎉 Correto!' : '❌ Incorreto'}
            </h4>
            <p className={`text-sm ${
              selectedAnswer === question.correctAnswer ? 'text-green-700' : 'text-red-700'
            }`}>
              {question.explanation}
            </p>
          </div>
        )}

        {!hasAnswered && (
          <p className="text-sm text-gray-500 text-center">
            Clique em uma das opções para responder
          </p>
        )}
      </CardContent>
    </Card>
  )
}