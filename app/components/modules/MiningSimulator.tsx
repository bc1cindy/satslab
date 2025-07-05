'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { Play, Pause, RotateCcw, Hash, Zap } from 'lucide-react'

interface MiningStats {
  nonce: number
  hashrate: number
  attempts: number
  timeElapsed: number
  currentHash: string
  difficulty: number
  targetPattern: string
}

interface MiningSimulatorProps {
  onHashFound?: (hash: string, nonce: number) => void
  difficulty?: number
  targetZeros?: number
}

export default function MiningSimulator({ 
  onHashFound, 
  difficulty = 4, 
  targetZeros = 4 
}: MiningSimulatorProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState<MiningStats>({
    nonce: 0,
    hashrate: 0,
    attempts: 0,
    timeElapsed: 0,
    currentHash: '',
    difficulty: targetZeros,
    targetPattern: '0'.repeat(targetZeros)
  })
  const [foundHash, setFoundHash] = useState<string | null>(null)
  const [blockData, setBlockData] = useState({
    version: 1,
    prevHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    merkleRoot: '9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
    timestamp: Date.now(),
    bits: difficulty
  })

  // Função SHA-256 simplificada para demonstração
  const simpleSHA256 = useCallback((input: string): string => {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Simula randomização baseada no input
    const str = Math.abs(hash).toString(16)
    const random = Math.random().toString(16).slice(2, 10)
    const combined = str + random + input.slice(-8)
    
    // Pad to 64 characters
    return combined.padEnd(64, '0').slice(0, 64)
  }, [])

  const createBlockHeader = useCallback((nonce: number): string => {
    return `${blockData.version}${blockData.prevHash}${blockData.merkleRoot}${blockData.timestamp}${blockData.bits}${nonce}`
  }, [blockData])

  const isValidHash = useCallback((hash: string): boolean => {
    return hash.startsWith(stats.targetPattern)
  }, [stats.targetPattern])

  const mineBlock = useCallback(() => {
    if (!isRunning) return

    const startTime = Date.now()
    let currentNonce = stats.nonce
    let attempts = stats.attempts
    let hashesThisSecond = 0

    const miningLoop = () => {
      if (!isRunning) return

      for (let i = 0; i < 100; i++) { // Process 100 hashes per loop
        const blockHeader = createBlockHeader(currentNonce)
        const hash = simpleSHA256(blockHeader)
        
        currentNonce++
        attempts++
        hashesThisSecond++

        if (isValidHash(hash)) {
          setFoundHash(hash)
          setStats(prev => ({
            ...prev,
            nonce: currentNonce,
            attempts,
            currentHash: hash,
            timeElapsed: Date.now() - startTime + prev.timeElapsed
          }))
          setIsRunning(false)
          onHashFound?.(hash, currentNonce)
          return
        }

        // Update current hash display
        if (i % 10 === 0) {
          setStats(prev => ({
            ...prev,
            nonce: currentNonce,
            attempts,
            currentHash: hash,
            timeElapsed: Date.now() - startTime + prev.timeElapsed
          }))
        }
      }

      // Calculate hashrate
      const elapsed = (Date.now() - startTime) / 1000
      const hashrate = elapsed > 0 ? Math.round(hashesThisSecond / elapsed) : 0

      setStats(prev => ({
        ...prev,
        nonce: currentNonce,
        attempts,
        hashrate,
        timeElapsed: Date.now() - startTime + prev.timeElapsed
      }))

      // Continue mining
      setTimeout(miningLoop, 10)
    }

    miningLoop()
  }, [isRunning, stats.nonce, stats.attempts, stats.targetPattern, createBlockHeader, simpleSHA256, isValidHash, onHashFound])

  useEffect(() => {
    if (isRunning) {
      mineBlock()
    }
  }, [isRunning, mineBlock])

  const toggleMining = () => {
    setIsRunning(!isRunning)
  }

  const resetMining = () => {
    setIsRunning(false)
    setStats({
      nonce: 0,
      hashrate: 0,
      attempts: 0,
      timeElapsed: 0,
      currentHash: '',
      difficulty: targetZeros,
      targetPattern: '0'.repeat(targetZeros)
    })
    setFoundHash(null)
    setBlockData(prev => ({
      ...prev,
      timestamp: Date.now()
    }))
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const formatHash = (hash: string) => {
    if (!hash) return 'Aguardando...'
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  const getHashColor = (hash: string) => {
    if (!hash) return 'text-gray-400'
    return isValidHash(hash) ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-6 h-6" />
          Simulador de Mineração Bitcoin
        </CardTitle>
        <p className="text-sm text-gray-600">
          Simule o processo de proof-of-work encontrando um hash que comece com {stats.targetPattern}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status e Controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={foundHash ? "default" : isRunning ? "secondary" : "outline"}>
              {foundHash ? "Hash Encontrado!" : isRunning ? "Minerando..." : "Parado"}
            </Badge>
            <Badge variant="outline">
              Dificuldade: {stats.difficulty} zeros
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button onClick={toggleMining} disabled={!!foundHash}>
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button variant="outline" onClick={resetMining}>
              <RotateCcw className="w-4 h-4" />
              Resetar
            </Button>
          </div>
        </div>

        {/* Progresso Visual */}
        {isRunning && !foundHash && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Minerando...</span>
              <span>{stats.hashrate} H/s</span>
            </div>
            <Progress value={Math.min((stats.attempts / 10000) * 100, 100)} className="h-2" />
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.nonce.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Nonce</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.hashrate.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Hash/s</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.attempts.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Tentativas</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{formatTime(stats.timeElapsed)}</div>
            <div className="text-sm text-gray-600">Tempo</div>
          </div>
        </div>

        {/* Dados do Bloco */}
        <div className="space-y-4">
          <h3 className="font-semibold">Cabeçalho do Bloco</h3>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm space-y-2">
            <div><strong>Versão:</strong> {blockData.version}</div>
            <div><strong>Hash Anterior:</strong> {formatHash(blockData.prevHash)}</div>
            <div><strong>Merkle Root:</strong> {formatHash(blockData.merkleRoot)}</div>
            <div><strong>Timestamp:</strong> {new Date(blockData.timestamp).toLocaleString()}</div>
            <div><strong>Dificuldade:</strong> {blockData.bits}</div>
            <div><strong>Nonce:</strong> {stats.nonce}</div>
          </div>
        </div>

        {/* Hash Atual */}
        <div className="space-y-2">
          <h3 className="font-semibold">Hash Atual</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className={`font-mono text-sm break-all ${getHashColor(stats.currentHash)}`}>
              {stats.currentHash || 'Aguardando início da mineração...'}
            </div>
            {stats.currentHash && (
              <div className="mt-2 text-xs text-gray-600">
                {isValidHash(stats.currentHash) ? 
                  `✅ Hash válido encontrado! Começa com ${stats.targetPattern}` : 
                  `❌ Hash inválido. Precisa começar com ${stats.targetPattern}`
                }
              </div>
            )}
          </div>
        </div>

        {/* Resultado */}
        {foundHash && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">🎉 Bloco Minerado com Sucesso!</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Hash Encontrado:</strong> <span className="font-mono">{foundHash}</span></div>
              <div><strong>Nonce Final:</strong> {stats.nonce.toLocaleString()}</div>
              <div><strong>Tentativas:</strong> {stats.attempts.toLocaleString()}</div>
              <div><strong>Tempo Total:</strong> {formatTime(stats.timeElapsed)}</div>
              <div><strong>Hashrate Médio:</strong> {Math.round(stats.attempts / (stats.timeElapsed / 1000)).toLocaleString()} H/s</div>
            </div>
          </div>
        )}

        {/* Explicação Educacional */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Como Funciona</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Nonce:</strong> Número que incrementa a cada tentativa</p>
            <p>• <strong>Hash:</strong> Resultado da função SHA-256 aplicada ao cabeçalho</p>
            <p>• <strong>Dificuldade:</strong> Número de zeros necessários no início do hash</p>
            <p>• <strong>Proof-of-Work:</strong> Prova de que trabalho computacional foi realizado</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}