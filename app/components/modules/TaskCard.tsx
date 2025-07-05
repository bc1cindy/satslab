'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'

interface Task {
  id: number
  title: string
  description: string
  instructions: string[]
  type: 'explorer' | 'transaction' | 'wallet' | 'mining' | 'lightning' | 'ordinal'
  validation?: {
    type: 'hash' | 'address' | 'amount' | 'api' | 'fee' | 'seed' | 'word' | 'inscription'
    placeholder?: string
    expectedLength?: number
  }
  hints?: string[]
}

interface TaskCardProps {
  task: Task
  onComplete: (result: string) => void
  isCompleted?: boolean
  taskIndex?: number
  totalTasks?: number
  result?: string
  customContent?: React.ReactElement
}

export function TaskCard({ task, onComplete, isCompleted = false }: TaskCardProps) {
  const [userInput, setUserInput] = useState('')
  const [showHints, setShowHints] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')

  const validateInput = () => {
    if (!task.validation) {
      onComplete(userInput)
      return
    }

    setIsValidating(true)
    setError('')

    setTimeout(() => {
      const { type, expectedLength } = task.validation!
      
      if (type === 'hash' && expectedLength) {
        if (userInput.length !== expectedLength) {
          setError(`Hash deve ter ${expectedLength} caracteres`)
          setIsValidating(false)
          return
        }
        if (!/^[a-fA-F0-9]+$/.test(userInput)) {
          setError('Hash deve conter apenas caracteres hexadecimais')
          setIsValidating(false)
          return
        }
      }

      if (type === 'address') {
        if (userInput.length < 26 || userInput.length > 62) {
          setError('Endereço Bitcoin inválido')
          setIsValidating(false)
          return
        }
      }

      setIsValidating(false)
      onComplete(userInput)
    }, 1000)
  }

  const getTaskIcon = (type: string) => {
    const icons = {
      explorer: '🔍',
      transaction: '💸',
      wallet: '👛',
      mining: '⛏️',
      lightning: '⚡',
      ordinal: '🎨'
    }
    return icons[type as keyof typeof icons] || '📋'
  }

  const getTaskTypeLabel = (type: string) => {
    const labels = {
      explorer: 'Exploração',
      transaction: 'Transação',
      wallet: 'Carteira',
      mining: 'Mineração',
      lightning: 'Lightning',
      ordinal: 'Ordinal'
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTaskIcon(task.type)}</span>
            <div>
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">Tarefa {task.id}</Badge>
                <Badge variant="secondary">{getTaskTypeLabel(task.type)}</Badge>
              </div>
            </div>
          </div>
          {isCompleted && (
            <Badge variant="success">Completo ✓</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{task.description}</p>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📋 Instruções:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            {task.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>

        {!isCompleted && (
          <div className="space-y-3">
            {task.validation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sua resposta:
                </label>
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={task.validation.placeholder || "Digite sua resposta..."}
                  className="w-full"
                />
                {error && (
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={validateInput}
                disabled={isValidating || !userInput.trim()}
                className="flex-1"
              >
                {isValidating ? 'Validando...' : 'Validar Resposta'}
              </Button>
              
              {task.hints && task.hints.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowHints(!showHints)}
                >
                  💡 Dica
                </Button>
              )}
            </div>
          </div>
        )}

        {showHints && task.hints && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              {task.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {isCompleted && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">
              ✅ Tarefa completada com sucesso!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}