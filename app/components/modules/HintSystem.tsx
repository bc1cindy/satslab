'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { HelpCircle, Lightbulb, Clock, Eye } from 'lucide-react'

interface Hint {
  id: number
  content: string
  triggerDelay?: number // seconds
  triggerAttempts?: number
}

interface HintSystemProps {
  hints: string[]
  taskId: string
  attempts: number
  timeSpent: number // in seconds
  onHintUsed: (hintIndex: number) => void
}

export function HintSystem({ hints, taskId, attempts, timeSpent, onHintUsed }: HintSystemProps) {
  const [availableHints, setAvailableHints] = useState<number[]>([])
  const [usedHints, setUsedHints] = useState<number[]>([])
  const [showHints, setShowHints] = useState(false)

  useEffect(() => {
    // Progressive hint unlocking based on time and attempts
    const newAvailableHints: number[] = []

    hints.forEach((_, index) => {
      const shouldUnlock = 
        timeSpent >= (index + 1) * 30 || // 30 seconds per hint
        attempts >= (index + 1) * 2      // 2 attempts per hint

      if (shouldUnlock && !availableHints.includes(index)) {
        newAvailableHints.push(index)
      }
    })

    if (newAvailableHints.length > 0) {
      setAvailableHints(prev => [...prev, ...newAvailableHints])
    }
  }, [timeSpent, attempts, hints, availableHints])

  const handleUseHint = (hintIndex: number) => {
    if (!usedHints.includes(hintIndex)) {
      setUsedHints(prev => [...prev, hintIndex])
      onHintUsed(hintIndex)
    }
  }

  const getHintStatus = (index: number) => {
    if (usedHints.includes(index)) return 'used'
    if (availableHints.includes(index)) return 'available'
    return 'locked'
  }

  const getNextHintTime = () => {
    const nextHintIndex = hints.findIndex((_, index) => !availableHints.includes(index))
    if (nextHintIndex === -1) return null
    
    const timeNeeded = (nextHintIndex + 1) * 30
    const attemptsNeeded = (nextHintIndex + 1) * 2
    
    return Math.min(timeNeeded - timeSpent, attemptsNeeded - attempts)
  }

  if (hints.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          Dicas ({availableHints.length}/{hints.length})
        </Button>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {attempts} tentativas
          </div>
        </div>
      </div>

      {showHints && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {hints.map((hint, index) => {
                const status = getHintStatus(index)
                
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {status === 'used' ? (
                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                      ) : status === 'available' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUseHint(index)}
                          className="h-6 w-6 p-0"
                        >
                          {index + 1}
                        </Button>
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-xs text-gray-500">{index + 1}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      {status === 'used' ? (
                        <Alert className="bg-yellow-900/30 border-yellow-500/50">
                          <AlertDescription className="text-yellow-200">
                            💡 {hint}
                          </AlertDescription>
                        </Alert>
                      ) : status === 'available' ? (
                        <p className="text-gray-300 text-sm">
                          Dica {index + 1} disponível - clique para revelar
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Dica {index + 1} - Bloqueada
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              {availableHints.length < hints.length && (
                <Alert className="bg-blue-900/30 border-blue-500/50">
                  <AlertDescription className="text-blue-200">
                    🔓 Nova dica será desbloqueada em {getNextHintTime()} segundos ou após mais tentativas
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}