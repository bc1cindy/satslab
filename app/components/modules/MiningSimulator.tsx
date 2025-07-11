'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Play, Pause, RotateCcw, Cpu, Zap, Clock, Target, Hash } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface MiningStats {
  nonce: number
  hashrate: number
  attempts: number
  timeElapsed: number
  currentHash: string
  isValid: boolean
}

interface MiningSimulatorProps {
  onHashFound?: (hash: string, nonce: number) => void
  targetZeros?: number
}

export default function MiningSimulator({ 
  onHashFound, 
  targetZeros = 4 
}: MiningSimulatorProps) {
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')

  // Translations
  const t = {
    title: isEnglish ? 'Mining Simulator' : 'Simulador de Mineração',
    findHash: isEnglish ? 'Find a hash that starts with' : 'Encontre um hash que comece com',
    success: isEnglish ? '✅ Success' : '✅ Sucesso',
    mining: isEnglish ? '⛏️ Mining' : '⛏️ Minerando',
    stopped: isEnglish ? '⏸️ Stopped' : '⏸️ Parado',
    zeros: isEnglish ? 'zeros' : 'zeros',
    start: isEnglish ? 'Start' : 'Iniciar',
    stop: isEnglish ? 'Stop' : 'Parar',
    nonce: isEnglish ? 'Nonce' : 'Nonce',
    attempts: isEnglish ? 'Attempts' : 'Tentativas',
    time: isEnglish ? 'Time' : 'Tempo',
    currentHash: isEnglish ? 'Current Hash' : 'Hash Atual',
    validHashFound: isEnglish ? '✅ Valid hash found!' : '✅ Hash válido encontrado!',
    invalidHash: isEnglish ? '❌ Invalid hash' : '❌ Hash inválido',
    waitingToStart: isEnglish ? 'Waiting to start mining...' : 'Aguardando início da mineração...',
    blockMinedSuccess: isEnglish ? '🎉 Block Mined Successfully!' : '🎉 Bloco Minerado com Sucesso!',
    finalHash: isEnglish ? 'Final Hash:' : 'Hash Final:',
    winningNonce: isEnglish ? 'Winning Nonce:' : 'Nonce Vencedor:',
    totalAttempts: isEnglish ? 'Total Attempts:' : 'Total de Tentativas:',
    timeElapsed: isEnglish ? 'Time Elapsed:' : 'Tempo Decorrido:',
    howItWorks: isEnglish ? '💡 How It Works' : '💡 Como Funciona',
    nonceExplanation: isEnglish ? 'Number incremented with each attempt' : 'Número incrementado a cada tentativa',
    hashExplanation: isEnglish ? 'SHA-256 result of the block header' : 'Resultado SHA-256 do cabeçalho do bloco',
    powExplanation: isEnglish ? 'Find hash with specific zeros' : 'Encontrar hash com zeros específicos'
  }

  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState<MiningStats>({
    nonce: 0,
    hashrate: 0,
    attempts: 0,
    timeElapsed: 0,
    currentHash: '',
    isValid: false
  })
  const [foundHash, setFoundHash] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  
  const targetPattern = '0'.repeat(targetZeros)

  // Gera hash realista para demonstração
  const generateRealisticHash = useCallback((nonce: number): string => {
    // Cria hash baseado no nonce com probabilidade controlada
    let hash = ''
    
    // Primeira parte - controla se teremos zeros iniciais
    // Probabilidade muito baixa para tornar mais realista
    const probability = targetZeros === 4 ? 1/50000 : 1/5000
    const shouldBeValid = Math.random() < probability && nonce > 5000
    
    if (shouldBeValid) {
      hash = targetPattern
    } else {
      // Gera alguns zeros aleatórios (mas não o suficiente)
      const randomZeros = Math.floor(Math.random() * (targetZeros - 1))
      hash = '0'.repeat(randomZeros)
    }
    
    // Completa o hash com caracteres hex aleatórios
    const remaining = 64 - hash.length
    for (let i = 0; i < remaining; i++) {
      hash += Math.floor(Math.random() * 16).toString(16)
    }
    
    return hash
  }, [targetPattern, targetZeros])

  const mineBlock = useCallback(() => {
    if (!isRunning) return

    let currentNonce = stats.nonce
    let attempts = stats.attempts

    const miningLoop = () => {
      if (!isRunning) return

      // Simula processamento mais realista com menos iterações por loop
      for (let i = 0; i < 20; i++) {
        const hash = generateRealisticHash(currentNonce)
        currentNonce++
        attempts++

        const isValid = hash.startsWith(targetPattern)
        
        // Atualiza stats a cada iteração
        const timeElapsed = Date.now() - startTime
        const hashrate = timeElapsed > 0 ? Math.floor((attempts / timeElapsed) * 1000) : 0

        setStats({
          nonce: currentNonce,
          hashrate,
          attempts,
          timeElapsed,
          currentHash: hash,
          isValid
        })

        if (isValid) {
          setFoundHash(hash)
          setIsRunning(false)
          onHashFound?.(hash, currentNonce)
          return
        }
      }

      // Continue mining com delay maior para ser mais realista
      setTimeout(miningLoop, 200)
    }

    miningLoop()
  }, [isRunning, stats.nonce, stats.attempts, startTime, generateRealisticHash, targetPattern, onHashFound])

  useEffect(() => {
    if (isRunning) {
      if (startTime === 0) {
        setStartTime(Date.now())
      }
      mineBlock()
    }
  }, [isRunning, mineBlock, startTime])

  const toggleMining = () => {
    if (!isRunning && startTime === 0) {
      setStartTime(Date.now())
    }
    setIsRunning(!isRunning)
  }

  const resetMining = () => {
    setIsRunning(false)
    setStartTime(0)
    setStats({
      nonce: 0,
      hashrate: 0,
      attempts: 0,
      timeElapsed: 0,
      currentHash: '',
      isValid: false
    })
    setFoundHash(null)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          <Cpu className="w-6 h-6 text-orange-500" />
          {t.title}
        </CardTitle>
        <p className="text-gray-400">
          {t.findHash} <span className="text-orange-400 font-mono">{targetPattern}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge 
              variant={foundHash ? "default" : isRunning ? "secondary" : "outline"}
              className={
                foundHash ? "bg-green-500/20 text-green-400 border-green-500/50" :
                isRunning ? "bg-orange-500/20 text-orange-400 border-orange-500/50" :
                "bg-gray-700 text-gray-300 border-gray-600"
              }
            >
              {foundHash ? t.success : isRunning ? t.mining : t.stopped}
            </Badge>
            <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-600">
              <Target className="w-3 h-3 mr-1" />
              {targetZeros} {t.zeros}
            </Badge>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={toggleMining} 
              disabled={!!foundHash}
              className={`${
                isRunning 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? t.stop : t.start}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetMining}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {stats.nonce.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 flex items-center justify-center">
              <Hash className="w-3 h-3 mr-1" />
              {t.nonce}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {stats.hashrate.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 flex items-center justify-center">
              <Zap className="w-3 h-3 mr-1" />
              H/s
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {stats.attempts.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 flex items-center justify-center">
              <Target className="w-3 h-3 mr-1" />
              {t.attempts}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {formatTime(stats.timeElapsed)}
            </div>
            <div className="text-sm text-gray-400 flex items-center justify-center">
              <Clock className="w-3 h-3 mr-1" />
              {t.time}
            </div>
          </div>
        </div>

        {/* Hash Atual */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">{t.currentHash}</h3>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            {stats.currentHash ? (
              <>
                <div className={`font-mono text-sm break-all mb-2 ${
                  stats.isValid ? 'text-green-400' : 'text-gray-300'
                }`}>
                  {stats.currentHash}
                </div>
                <div className={`text-xs flex items-center ${
                  stats.isValid ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stats.isValid ? t.validHashFound : t.invalidHash}
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-sm">
                {t.waitingToStart}
              </div>
            )}
          </div>
        </div>

        {/* Resultado Final */}
        {foundHash && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
              {t.blockMinedSuccess}
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>{t.finalHash}</span>
                <span className="font-mono text-green-400">{foundHash.slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between">
                <span>{t.winningNonce}</span>
                <span className="text-blue-400">{stats.nonce.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.totalAttempts}</span>
                <span className="text-purple-400">{stats.attempts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.timeElapsed}</span>
                <span className="text-orange-400">{formatTime(stats.timeElapsed)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Explicação */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-2">{t.howItWorks}</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• <strong>Nonce:</strong> {t.nonceExplanation}</p>
            <p>• <strong>Hash:</strong> {t.hashExplanation}</p>
            <p>• <strong>Proof-of-Work:</strong> {t.powExplanation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}