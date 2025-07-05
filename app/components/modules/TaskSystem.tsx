'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import { CheckCircle, XCircle, ExternalLink, Lightbulb, Clock, Copy, AlertCircle } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  instructions: string[]
  inputLabel: string
  inputPlaceholder: string
  validationType: 'transaction' | 'address' | 'amount' | 'custom'
  expectedValue?: string | number
  hints: string[]
  externalLinks?: Array<{
    label: string
    url: string
  }>
}

interface TaskSystemProps {
  tasks: Task[]
  onComplete: (completedTasks: number, totalTasks: number) => void
  moduleId: number
}

export default function TaskSystem({ tasks, onComplete, moduleId }: TaskSystemProps) {
  const [currentTask, setCurrentTask] = useState(0)
  const [userInputs, setUserInputs] = useState<string[]>(new Array(tasks.length).fill(''))
  const [completedTasks, setCompletedTasks] = useState<boolean[]>(new Array(tasks.length).fill(false))
  const [taskResults, setTaskResults] = useState<Array<{success: boolean, message: string} | null>>(new Array(tasks.length).fill(null))
  const [loading, setLoading] = useState(false)
  const [showHints, setShowHints] = useState<number[]>([])
  const [startTime, setStartTime] = useState(Date.now())
  const [attempts, setAttempts] = useState(0)

  const task = tasks[currentTask]
  const isCompleted = completedTasks[currentTask]
  const result = taskResults[currentTask]

  // Auto-show hints based on time and attempts
  useEffect(() => {
    if (!isCompleted) {
      // Show first hint after 60 seconds
      const timer1 = setTimeout(() => {
        if (!showHints.includes(0)) {
          setShowHints([...showHints, 0])
        }
      }, 60000)

      // Show second hint after 2 minutes or 3 attempts
      const timer2 = setTimeout(() => {
        if (!showHints.includes(1) && (Date.now() - startTime > 120000 || attempts >= 3)) {
          setShowHints([...showHints, 1])
        }
      }, 120000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [currentTask, isCompleted, showHints, startTime, attempts])

  const validateTransaction = async (txid: string): Promise<{success: boolean, message: string, data?: any}> => {
    try {
      // Remove spaces and validate format
      const cleanTxid = txid.trim()
      if (!/^[a-fA-F0-9]{64}$/.test(cleanTxid)) {
        return {
          success: false,
          message: 'Formato inválido. O hash deve ter exatamente 64 caracteres hexadecimais.'
        }
      }

      const response = await fetch(`https://mempool.space/signet/api/tx/${cleanTxid}`)
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            message: 'Transação não encontrada. Verifique se o hash está correto e se é da rede Signet.'
          }
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const txData = await response.json()
      return {
        success: true,
        message: `Transação encontrada! Valor total: ${(txData.fee || 0) / 100000000} sBTC`,
        data: txData
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao validar transação. Verifique sua conexão e tente novamente.'
      }
    }
  }

  const validateAddress = async (address: string): Promise<{success: boolean, message: string}> => {
    try {
      const cleanAddress = address.trim()
      
      // Basic validation for Signet addresses
      if (!cleanAddress.startsWith('tb1') && !cleanAddress.startsWith('2') && !cleanAddress.startsWith('m') && !cleanAddress.startsWith('n')) {
        return {
          success: false,
          message: 'Endereço deve ser da rede Signet (inicia com tb1, 2, m ou n).'
        }
      }

      const response = await fetch(`https://mempool.space/signet/api/address/${cleanAddress}`)
      if (!response.ok) {
        return {
          success: false,
          message: 'Endereço não encontrado ou inválido.'
        }
      }

      const addressData = await response.json()
      return {
        success: true,
        message: `Endereço válido! Transações: ${addressData.txid_count || 0}`
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao validar endereço. Tente novamente.'
      }
    }
  }

  const handleSubmit = async () => {
    if (!userInputs[currentTask].trim()) return

    setLoading(true)
    setAttempts(attempts + 1)

    let validationResult: {success: boolean, message: string, data?: any}

    try {
      switch (task.validationType) {
        case 'transaction':
          validationResult = await validateTransaction(userInputs[currentTask])
          break
        case 'address':
          validationResult = await validateAddress(userInputs[currentTask])
          break
        case 'amount':
          const amount = parseFloat(userInputs[currentTask])
          validationResult = {
            success: !isNaN(amount) && amount > 0,
            message: !isNaN(amount) && amount > 0 
              ? `Valor válido: ${amount} sBTC` 
              : 'Por favor, insira um valor numérico válido maior que 0.'
          }
          break
        case 'custom':
          // Custom validation logic can be added here
          validationResult = {
            success: userInputs[currentTask].trim().length > 0,
            message: userInputs[currentTask].trim().length > 0 
              ? 'Resposta aceita!' 
              : 'Por favor, forneça uma resposta.'
          }
          break
        default:
          validationResult = { success: false, message: 'Tipo de validação não suportado.' }
      }
    } catch (error) {
      validationResult = {
        success: false,
        message: 'Erro durante a validação. Tente novamente.'
      }
    }

    // Update results
    const newResults = [...taskResults]
    newResults[currentTask] = validationResult
    setTaskResults(newResults)

    if (validationResult.success) {
      const newCompleted = [...completedTasks]
      newCompleted[currentTask] = true
      setCompletedTasks(newCompleted)
    }

    setLoading(false)
  }

  const handleInputChange = (value: string) => {
    const newInputs = [...userInputs]
    newInputs[currentTask] = value
    setUserInputs(newInputs)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const completedCount = completedTasks.filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Tarefa {currentTask + 1} de {tasks.length}</span>
        <span>Concluídas: {completedCount}/{tasks.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedCount / tasks.length) * 100}%` }}
        />
      </div>

      {/* Task Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center">
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            ) : (
              <Clock className="h-6 w-6 text-blue-500 mr-3" />
            )}
            {task.title}
          </CardTitle>
          <p className="text-gray-400">{task.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Instruções:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
              {task.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          {/* External Links */}
          {task.externalLinks && task.externalLinks.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-white">Links úteis:</h4>
              <div className="flex flex-wrap gap-2">
                {task.externalLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {link.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Hints */}
          {showHints.length > 0 && !isCompleted && (
            <div className="space-y-3">
              <h4 className="font-medium text-yellow-400 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Dicas:
              </h4>
              {showHints.map((hintIndex) => (
                task.hints[hintIndex] && (
                  <div key={hintIndex} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-sm text-yellow-300">{task.hints[hintIndex]}</p>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Input */}
          {!isCompleted && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                {task.inputLabel}
              </label>
              <div className="flex space-x-2">
                <Input
                  value={userInputs[currentTask]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={task.inputPlaceholder}
                  className="bg-gray-800 border-gray-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      handleSubmit()
                    }
                  }}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !userInputs[currentTask].trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loading ? 'Validando...' : 'Validar'}
                </Button>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {result.success ? 'Sucesso!' : 'Erro:'}
                  </p>
                  <p className="text-sm mt-1">{result.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Show manual hint button after some attempts */}
          {!isCompleted && attempts >= 2 && showHints.length < task.hints.length && (
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => {
                const nextHint = showHints.length
                if (nextHint < task.hints.length) {
                  setShowHints([...showHints, nextHint])
                }
              }}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Mostrar próxima dica
            </Button>
          )}

          {/* Continue Button for completed tasks */}
          {isCompleted && currentTask < tasks.length - 1 && (
            <div className="text-center">
              <Button
                onClick={() => {
                  setCurrentTask(currentTask + 1)
                  setStartTime(Date.now())
                  setAttempts(0)
                  setShowHints([])
                }}
                className="bg-green-500 hover:bg-green-600"
              >
                Próxima Tarefa
              </Button>
            </div>
          )}

          {/* Complete All Button */}
          {isCompleted && currentTask === tasks.length - 1 && (
            <div className="text-center">
              <Button
                onClick={() => {
                  const totalCompleted = completedTasks.filter(Boolean).length
                  onComplete(totalCompleted, tasks.length)
                }}
                className="bg-green-500 hover:bg-green-600"
              >
                Concluir Tarefas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}