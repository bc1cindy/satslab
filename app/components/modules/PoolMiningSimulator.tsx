'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { Users, Zap, Trophy, Timer, DollarSign } from 'lucide-react'

interface PoolMiner {
  id: string
  name: string
  hashrate: number
  contribution: number
  isPlayer: boolean
}

interface PoolStats {
  totalHashrate: number
  playerHashrate: number
  playerContribution: number
  blocksFound: number
  totalRewards: number
  playerRewards: number
  timeElapsed: number
}

interface PoolMiningSimulatorProps {
  onRewardEarned?: (reward: number) => void
  targetTime?: number // in seconds
}

export default function PoolMiningSimulator({ 
  onRewardEarned, 
  targetTime = 300 // 5 minutes 
}: PoolMiningSimulatorProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(targetTime)
  const [stats, setStats] = useState<PoolStats>({
    totalHashrate: 0,
    playerHashrate: 0,
    playerContribution: 0,
    blocksFound: 0,
    totalRewards: 0,
    playerRewards: 0,
    timeElapsed: 0
  })
  
  const [miners, setMiners] = useState<PoolMiner[]>([
    { id: 'player', name: 'Você', hashrate: 0, contribution: 0, isPlayer: true },
    { id: 'miner1', name: 'Minerador Alpha', hashrate: 2500, contribution: 0, isPlayer: false },
    { id: 'miner2', name: 'Minerador Beta', hashrate: 1800, contribution: 0, isPlayer: false },
    { id: 'miner3', name: 'Minerador Gamma', hashrate: 3200, contribution: 0, isPlayer: false },
    { id: 'miner4', name: 'Minerador Delta', hashrate: 1500, contribution: 0, isPlayer: false },
    { id: 'miner5', name: 'Minerador Epsilon', hashrate: 2100, contribution: 0, isPlayer: false }
  ])

  const [recentBlocks, setRecentBlocks] = useState<Array<{
    height: number
    reward: number
    playerShare: number
    timestamp: number
  }>>([])

  // Simulate player hashrate growth over time
  const updatePlayerHashrate = useCallback(() => {
    if (!isRunning) return
    
    setMiners(prev => prev.map(miner => {
      if (miner.isPlayer) {
        // Player hashrate grows from 0 to ~800 H/s over time (ajustado para updates mais frequentes)
        const growthRate = Math.min(800, miner.hashrate + Math.random() * 5)
        return { ...miner, hashrate: growthRate }
      }
      // Other miners have slight variations
      const variation = 0.95 + Math.random() * 0.1 // ±5% variation
      return { ...miner, hashrate: Math.floor(miner.hashrate * variation) }
    }))
  }, [isRunning])

  // Calculate pool statistics
  const updatePoolStats = useCallback(() => {
    const totalHashrate = miners.reduce((sum, miner) => sum + miner.hashrate, 0)
    const playerMiner = miners.find(m => m.isPlayer)
    const playerHashrate = playerMiner?.hashrate || 0
    const playerContribution = totalHashrate > 0 ? (playerHashrate / totalHashrate) * 100 : 0

    // Update miner contributions
    setMiners(prev => prev.map(miner => ({
      ...miner,
      contribution: totalHashrate > 0 ? (miner.hashrate / totalHashrate) * 100 : 0
    })))

    setStats(prev => ({
      ...prev,
      totalHashrate,
      playerHashrate,
      playerContribution
    }))
  }, [miners])

  // Simulate block finding
  const simulateBlockFinding = useCallback(() => {
    if (!isRunning) return

    // Probability of finding a block (adjusted for faster interval)
    const blockProbability = 0.002 // 0.2% chance per interval (10x menos por rodar 10x mais)
    
    if (Math.random() < blockProbability) {
      const blockReward = 6.25 // Current Bitcoin block reward
      const playerShare = (stats.playerContribution / 100) * blockReward
      
      setStats(prev => ({
        ...prev,
        blocksFound: prev.blocksFound + 1,
        totalRewards: prev.totalRewards + blockReward,
        playerRewards: prev.playerRewards + playerShare
      }))

      setRecentBlocks(prev => [
        {
          height: 750000 + stats.blocksFound + 1,
          reward: blockReward,
          playerShare,
          timestamp: Date.now()
        },
        ...prev.slice(0, 4) // Keep only last 5 blocks
      ])

      onRewardEarned?.(playerShare)
    }
  }, [isRunning, stats.playerContribution, stats.blocksFound, onRewardEarned])

  // Main simulation loop
  useEffect(() => {
    if (!isRunning || !startTime) return

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      const remaining = Math.max(0, targetTime - elapsed)
      
      setTimeRemaining(remaining)
      setStats(prev => ({
        ...prev,
        timeElapsed: elapsed
      }))
      
      if (remaining === 0) {
        setIsRunning(false)
        setStartTime(null)
        return
      }

      updatePlayerHashrate()
      updatePoolStats()
      simulateBlockFinding()
    }, 100) // Update every 100ms for smooth countdown

    return () => clearInterval(interval)
  }, [isRunning, startTime, targetTime, updatePlayerHashrate, updatePoolStats, simulateBlockFinding])

  const startMining = () => {
    setStartTime(Date.now())
    setIsRunning(true)
  }

  const stopMining = () => {
    setIsRunning(false)
    setStartTime(null)
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setStartTime(null)
    setTimeRemaining(targetTime)
    setStats({
      totalHashrate: 0,
      playerHashrate: 0,
      playerContribution: 0,
      blocksFound: 0,
      totalRewards: 0,
      playerRewards: 0,
      timeElapsed: 0
    })
    setRecentBlocks([])
    setMiners(prev => prev.map(miner => ({
      ...miner,
      hashrate: miner.isPlayer ? 0 : miner.hashrate,
      contribution: 0
    })))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatHashrate = (hashrate: number) => {
    if (hashrate >= 1000) {
      return `${(hashrate / 1000).toFixed(1)}k H/s`
    }
    return `${hashrate.toFixed(0)} H/s`
  }

  const getContributionColor = (contribution: number) => {
    if (contribution >= 15) return 'text-green-400'
    if (contribution >= 10) return 'text-yellow-400'
    if (contribution >= 5) return 'text-orange-400'
    return 'text-red-400'
  }

  const isComplete = timeRemaining === 0

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-6 h-6 text-orange-500" />
          Simulador de Pool Mining
        </CardTitle>
        <p className="text-sm text-gray-400">
          Participe de um pool de mineração e receba recompensas proporcionais
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status e Controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isComplete ? "default" : isRunning ? "secondary" : "outline"}
              className={
                isComplete ? "bg-green-500/20 text-green-400 border-green-500/50" :
                isRunning ? "bg-orange-500/20 text-orange-400 border-orange-500/50" :
                "bg-gray-700 text-gray-300 border-gray-600"
              }
            >
              {isComplete ? "✅ Completo!" : isRunning ? "⛏️ Minerando..." : "⏸️ Aguardando"}
            </Badge>
            <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-600 flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {formatTime(timeRemaining)}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={startMining} 
              disabled={isRunning || isComplete}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Zap className="w-4 h-4" />
              Iniciar Mineração
            </Button>
            <Button 
              variant="outline" 
              onClick={stopMining} 
              disabled={!isRunning}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Parar
            </Button>
            <Button 
              variant="outline" 
              onClick={resetSimulation}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Resetar
            </Button>
          </div>
        </div>

        {/* Progresso do Timer */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Progresso da Simulação</span>
            <span>{formatTime(stats.timeElapsed)} / {formatTime(targetTime)}</span>
          </div>
          <Progress value={(stats.timeElapsed / targetTime) * 100} className="h-2" />
        </div>

        {/* Estatísticas do Pool */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{formatHashrate(stats.totalHashrate)}</div>
            <div className="text-sm text-gray-400">Pool Total</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{formatHashrate(stats.playerHashrate)}</div>
            <div className="text-sm text-gray-400">Seu Hashrate</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">{stats.playerContribution.toFixed(2)}%</div>
            <div className="text-sm text-gray-400">Sua Contribuição</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-orange-400">{stats.blocksFound}</div>
            <div className="text-sm text-gray-400">Blocos Encontrados</div>
          </div>
        </div>

        {/* Recompensas */}
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
          <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Recompensas Acumuladas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {stats.totalRewards.toFixed(4)} BTC
              </div>
              <div className="text-sm text-gray-400">Total do Pool</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {stats.playerRewards.toFixed(6)} BTC
              </div>
              <div className="text-sm text-gray-400">Suas Recompensas</div>
            </div>
          </div>
        </div>

        {/* Lista de Mineradores */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Mineradores no Pool</h3>
          <div className="space-y-2">
            {miners.map((miner) => (
              <div key={miner.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                miner.isPlayer ? 'bg-blue-500/10 border-blue-500/30' : 'bg-gray-800 border-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    miner.isPlayer ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <span className={`font-medium ${miner.isPlayer ? 'text-blue-400' : 'text-gray-300'}`}>
                    {miner.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    {formatHashrate(miner.hashrate)}
                  </span>
                  <span className={`font-medium ${getContributionColor(miner.contribution)}`}>
                    {miner.contribution.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blocos Recentes */}
        {recentBlocks.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Blocos Encontrados
            </h3>
            <div className="space-y-2">
              {recentBlocks.map((block, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="font-medium text-white">Bloco #{block.height}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(block.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">{block.reward.toFixed(4)} BTC</div>
                    <div className="text-sm text-green-400">
                      +{block.playerShare.toFixed(6)} BTC para você
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resultado Final */}
        {isComplete && (
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
            <h3 className="font-semibold text-green-400 mb-2">🎉 Simulação Completa!</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div><strong>Tempo Total:</strong> {formatTime(stats.timeElapsed)}</div>
              <div><strong>Hashrate Final:</strong> {formatHashrate(stats.playerHashrate)}</div>
              <div><strong>Contribuição Média:</strong> {stats.playerContribution.toFixed(2)}%</div>
              <div><strong>Blocos Encontrados:</strong> {stats.blocksFound}</div>
              <div><strong>Recompensa Total:</strong> {stats.playerRewards.toFixed(6)} BTC</div>
              <div><strong>Taxa de Ganho:</strong> {(stats.playerRewards / (stats.timeElapsed / 3600)).toFixed(8)} BTC/hora</div>
            </div>
          </div>
        )}

        {/* Explicação Educacional */}
        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-400 mb-2">💡 Como Funcionam os Pools</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• <strong>Pool Mining:</strong> Mineradores combinam hashrate para aumentar chances</p>
            <p>• <strong>Recompensas Proporcionais:</strong> Cada minerador recebe % baseado na contribuição</p>
            <p>• <strong>Menor Volatilidade:</strong> Pagamentos menores mas mais frequentes</p>
            <p>• <strong>Cooperação:</strong> Todos se beneficiam quando o pool encontra blocos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}