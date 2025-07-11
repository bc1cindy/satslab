'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { Users, Zap, Trophy, Timer, DollarSign } from 'lucide-react'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()
  const isEnglish = pathname.startsWith('/en')

  // Translations
  const t = {
    title: isEnglish ? 'Pool Mining Simulator' : 'Simulador de Pool Mining',
    description: isEnglish ? 'Join a mining pool and receive proportional rewards' : 'Participe de um pool de mineração e receba recompensas proporcionais',
    complete: isEnglish ? '✅ Complete!' : '✅ Completo!',
    mining: isEnglish ? '⛏️ Mining...' : '⛏️ Minerando...',
    waiting: isEnglish ? '⏸️ Waiting' : '⏸️ Aguardando',
    startMining: isEnglish ? 'Start Mining' : 'Iniciar Mineração',
    stop: isEnglish ? 'Stop' : 'Parar',
    reset: isEnglish ? 'Reset' : 'Resetar',
    simulationProgress: isEnglish ? 'Simulation Progress' : 'Progresso da Simulação',
    totalPool: isEnglish ? 'Total Pool' : 'Pool Total',
    yourHashrate: isEnglish ? 'Your Hashrate' : 'Seu Hashrate',
    yourContribution: isEnglish ? 'Your Contribution' : 'Sua Contribuição',
    blocksFound: isEnglish ? 'Blocks Found' : 'Blocos Encontrados',
    accumulatedRewards: isEnglish ? 'Accumulated Rewards' : 'Recompensas Acumuladas',
    poolTotal: isEnglish ? 'Pool Total' : 'Total do Pool',
    yourRewards: isEnglish ? 'Your Rewards' : 'Suas Recompensas',
    minersInPool: isEnglish ? 'Miners in Pool' : 'Mineradores no Pool',
    you: isEnglish ? 'You' : 'Você',
    minerAlpha: isEnglish ? 'Miner Alpha' : 'Minerador Alpha',
    minerBeta: isEnglish ? 'Miner Beta' : 'Minerador Beta',
    minerGamma: isEnglish ? 'Miner Gamma' : 'Minerador Gamma',
    minerDelta: isEnglish ? 'Miner Delta' : 'Minerador Delta',
    minerEpsilon: isEnglish ? 'Miner Epsilon' : 'Minerador Epsilon',
    foundBlocks: isEnglish ? 'Found Blocks' : 'Blocos Encontrados',
    block: isEnglish ? 'Block' : 'Bloco',
    forYou: isEnglish ? 'for you' : 'para você',
    simulationComplete: isEnglish ? '🎉 Simulation Complete!' : '🎉 Simulação Completa!',
    totalTime: isEnglish ? 'Total Time:' : 'Tempo Total:',
    finalHashrate: isEnglish ? 'Final Hashrate:' : 'Hashrate Final:',
    averageContribution: isEnglish ? 'Average Contribution:' : 'Contribuição Média:',
    totalReward: isEnglish ? 'Total Reward:' : 'Recompensa Total:',
    earningRate: isEnglish ? 'Earning Rate:' : 'Taxa de Ganho:',
    howPoolsWork: isEnglish ? '💡 How Pools Work' : '💡 Como Funcionam os Pools',
    poolMining: isEnglish ? 'Miners combine hashrate to increase chances' : 'Mineradores combinam hashrate para aumentar chances',
    proportionalRewards: isEnglish ? 'Each miner receives % based on contribution' : 'Cada minerador recebe % baseado na contribuição',
    lowerVolatility: isEnglish ? 'Smaller but more frequent payments' : 'Pagamentos menores mas mais frequentes',
    cooperation: isEnglish ? 'Everyone benefits when the pool finds blocks' : 'Todos se beneficiam quando o pool encontra blocos'
  }

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
    { id: 'player', name: t.you, hashrate: 0, contribution: 0, isPlayer: true },
    { id: 'miner1', name: t.minerAlpha, hashrate: 2500, contribution: 0, isPlayer: false },
    { id: 'miner2', name: t.minerBeta, hashrate: 1800, contribution: 0, isPlayer: false },
    { id: 'miner3', name: t.minerGamma, hashrate: 3200, contribution: 0, isPlayer: false },
    { id: 'miner4', name: t.minerDelta, hashrate: 1500, contribution: 0, isPlayer: false },
    { id: 'miner5', name: t.minerEpsilon, hashrate: 2100, contribution: 0, isPlayer: false }
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
      // Current Bitcoin block reward after 2024 halving + average transaction fees
      const baseReward = 3.125 // Block subsidy after April 2024 halving
      const avgFees = 0.05 + Math.random() * 0.15 // Realistic fee range: 0.05-0.20 BTC
      const blockReward = baseReward + avgFees
      const playerShare = (stats.playerContribution / 100) * blockReward
      
      setStats(prev => ({
        ...prev,
        blocksFound: prev.blocksFound + 1,
        totalRewards: prev.totalRewards + blockReward,
        playerRewards: prev.playerRewards + playerShare
      }))

      setRecentBlocks(prev => [
        {
          height: 870000 + stats.blocksFound + 1, // Current Bitcoin block height (2025)
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
          {t.title}
        </CardTitle>
        <p className="text-sm text-gray-400">
          {t.description}
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
              {isComplete ? t.complete : isRunning ? t.mining : t.waiting}
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
              {t.startMining}
            </Button>
            <Button 
              variant="outline" 
              onClick={stopMining} 
              disabled={!isRunning}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {t.stop}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetSimulation}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {t.reset}
            </Button>
          </div>
        </div>

        {/* Progresso do Timer */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>{t.simulationProgress}</span>
            <span>{formatTime(stats.timeElapsed)} / {formatTime(targetTime)}</span>
          </div>
          <Progress value={(stats.timeElapsed / targetTime) * 100} className="h-2" />
        </div>

        {/* Estatísticas do Pool */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{formatHashrate(stats.totalHashrate)}</div>
            <div className="text-sm text-gray-400">{t.totalPool}</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{formatHashrate(stats.playerHashrate)}</div>
            <div className="text-sm text-gray-400">{t.yourHashrate}</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">{stats.playerContribution.toFixed(2)}%</div>
            <div className="text-sm text-gray-400">{t.yourContribution}</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-orange-400">{stats.blocksFound}</div>
            <div className="text-sm text-gray-400">{t.blocksFound}</div>
          </div>
        </div>

        {/* Recompensas */}
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
          <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t.accumulatedRewards}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {stats.totalRewards.toFixed(4)} BTC
              </div>
              <div className="text-sm text-gray-400">{t.poolTotal}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {stats.playerRewards.toFixed(6)} BTC
              </div>
              <div className="text-sm text-gray-400">{t.yourRewards}</div>
            </div>
          </div>
        </div>

        {/* Lista de Mineradores */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">{t.minersInPool}</h3>
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
              {t.foundBlocks}
            </h3>
            <div className="space-y-2">
              {recentBlocks.map((block, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="font-medium text-white">{t.block} #{block.height}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(block.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">{block.reward.toFixed(4)} BTC</div>
                    <div className="text-sm text-green-400">
                      +{block.playerShare.toFixed(6)} BTC {t.forYou}
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
            <h3 className="font-semibold text-green-400 mb-2">{t.simulationComplete}</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div><strong>{t.totalTime}</strong> {formatTime(stats.timeElapsed)}</div>
              <div><strong>{t.finalHashrate}</strong> {formatHashrate(stats.playerHashrate)}</div>
              <div><strong>{t.averageContribution}</strong> {stats.playerContribution.toFixed(2)}%</div>
              <div><strong>{t.blocksFound}:</strong> {stats.blocksFound}</div>
              <div><strong>{t.totalReward}</strong> {stats.playerRewards.toFixed(6)} BTC</div>
              <div><strong>{t.earningRate}</strong> {(stats.playerRewards / (stats.timeElapsed / 3600)).toFixed(8)} BTC/hora</div>
            </div>
          </div>
        )}

        {/* Explicação Educacional */}
        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-400 mb-2">{t.howPoolsWork}</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• <strong>Pool Mining:</strong> {t.poolMining}</p>
            <p>• <strong>Recompensas Proporcionais:</strong> {t.proportionalRewards}</p>
            <p>• <strong>Menor Volatilidade:</strong> {t.lowerVolatility}</p>
            <p>• <strong>Cooperação:</strong> {t.cooperation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}