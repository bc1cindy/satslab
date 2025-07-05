'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { TrendingUp, Clock, Zap, Target, BarChart3, Calculator } from 'lucide-react'

interface DifficultyData {
  blockHeight: number
  difficulty: number
  hashrate: number
  avgBlockTime: number
  timestamp: number
}

interface DifficultyExplainerProps {
  currentDifficulty?: number
  onDifficultyChange?: (difficulty: number) => void
}

export default function DifficultyExplainer({ 
  currentDifficulty = 50000000000000,
  onDifficultyChange 
}: DifficultyExplainerProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [simulationDifficulty, setSimulationDifficulty] = useState(4)
  const [hashingSpeed, setHashingSpeed] = useState(1000)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResults, setSimulationResults] = useState<{
    attempts: number
    timeElapsed: number
    found: boolean
  }>({ attempts: 0, timeElapsed: 0, found: false })

  // Dados históricos simulados da dificuldade Bitcoin
  const historicalData: DifficultyData[] = [
    { blockHeight: 740000, difficulty: 45000000000000, hashrate: 320, avgBlockTime: 9.8, timestamp: Date.now() - 86400000 * 30 },
    { blockHeight: 742000, difficulty: 48000000000000, hashrate: 340, avgBlockTime: 10.2, timestamp: Date.now() - 86400000 * 20 },
    { blockHeight: 744000, difficulty: 52000000000000, hashrate: 370, avgBlockTime: 9.5, timestamp: Date.now() - 86400000 * 10 },
    { blockHeight: 746000, difficulty: 50000000000000, hashrate: 360, avgBlockTime: 10.1, timestamp: Date.now() }
  ]

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        setSimulationResults(prev => {
          const newAttempts = prev.attempts + hashingSpeed
          const newTimeElapsed = prev.timeElapsed + 1
          
          // Simulate finding a hash based on difficulty
          const probability = 1 / Math.pow(16, simulationDifficulty)
          const found = Math.random() < probability * hashingSpeed
          
          if (found) {
            setIsSimulating(false)
            return { ...prev, attempts: newAttempts, timeElapsed: newTimeElapsed, found: true }
          }
          
          return { ...prev, attempts: newAttempts, timeElapsed: newTimeElapsed }
        })
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [isSimulating, hashingSpeed, simulationDifficulty])

  const formatDifficulty = (difficulty: number): string => {
    if (difficulty >= 1e12) {
      return `${(difficulty / 1e12).toFixed(1)}T`
    } else if (difficulty >= 1e9) {
      return `${(difficulty / 1e9).toFixed(1)}B`
    } else if (difficulty >= 1e6) {
      return `${(difficulty / 1e6).toFixed(1)}M`
    } else if (difficulty >= 1e3) {
      return `${(difficulty / 1e3).toFixed(1)}K`
    }
    return difficulty.toString()
  }

  const formatHashrate = (hashrate: number): string => {
    return `${hashrate} EH/s`
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const calculateExpectedTime = (difficulty: number, hashrate: number): number => {
    // Simplified calculation: expected attempts = 16^difficulty, time = attempts / hashrate
    const expectedAttempts = Math.pow(16, difficulty)
    return expectedAttempts / hashrate
  }

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 2) return 'text-green-600'
    if (difficulty <= 4) return 'text-yellow-600'
    if (difficulty <= 6) return 'text-orange-600'
    return 'text-red-600'
  }

  const startSimulation = () => {
    setSimulationResults({ attempts: 0, timeElapsed: 0, found: false })
    setIsSimulating(true)
  }

  const resetSimulation = () => {
    setIsSimulating(false)
    setSimulationResults({ attempts: 0, timeElapsed: 0, found: false })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-6 h-6" />
          Explicador de Dificuldade Bitcoin
        </CardTitle>
        <p className="text-sm text-gray-600">
          Entenda como funciona o ajuste de dificuldade e seu impacto na mineração
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="simulation">Simulação</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{formatDifficulty(currentDifficulty)}</div>
                <div className="text-sm text-gray-600">Dificuldade Atual</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatHashrate(360)}</div>
                <div className="text-sm text-gray-600">Hashrate da Rede</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">10.1 min</div>
                <div className="text-sm text-gray-600">Tempo Médio de Bloco</div>
              </div>
            </div>

            {/* Difficulty Explanation */}
            <div className="space-y-4">
              <h3 className="font-semibold">O que é Dificuldade?</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">
                  A dificuldade é um número que determina quão difícil é encontrar um hash válido para um novo bloco. 
                  Quanto maior a dificuldade, mais zeros iniciais o hash precisa ter.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Dificuldade 1</Badge>
                    <span className="text-sm">Hash deve começar com 1 zero: 0abc123...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Dificuldade 2</Badge>
                    <span className="text-sm">Hash deve começar com 2 zeros: 00abc12...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Dificuldade 4</Badge>
                    <span className="text-sm">Hash deve começar com 4 zeros: 0000abc...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Adjustment Algorithm */}
            <div className="space-y-4">
              <h3 className="font-semibold">Algoritmo de Ajuste</h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Objetivo: 1 bloco a cada 10 minutos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Ajuste: A cada 2016 blocos (~2 semanas)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Fórmula: Nova_Dificuldade = Dificuldade_Atual × (20160 min / Tempo_Real)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact on Mining */}
            <div className="space-y-4">
              <h3 className="font-semibold">Impacto na Mineração</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Dificuldade Menor</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Mais fácil encontrar blocos</li>
                    <li>• Menor consumo de energia</li>
                    <li>• Blocos mais rápidos</li>
                    <li>• Menor competição</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Dificuldade Maior</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Mais difícil encontrar blocos</li>
                    <li>• Maior consumo de energia</li>
                    <li>• Blocos mais lentos</li>
                    <li>• Maior competição</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            {/* Simulation Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold">Simulação de Mineração</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Dificuldade (zeros iniciais)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={simulationDifficulty}
                      onChange={(e) => setSimulationDifficulty(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Badge variant="outline" className={getDifficultyColor(simulationDifficulty)}>
                      {simulationDifficulty}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hashrate (H/s)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={hashingSpeed}
                      onChange={(e) => setHashingSpeed(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Badge variant="outline">
                      {hashingSpeed.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Time */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Tempo Esperado</h4>
              <div className="text-sm text-yellow-700">
                <div>Tentativas esperadas: {Math.pow(16, simulationDifficulty).toLocaleString()}</div>
                <div>Tempo estimado: {formatTime(calculateExpectedTime(simulationDifficulty, hashingSpeed))}</div>
                <div className="mt-2 text-xs">
                  * Valores aproximados para demonstração educacional
                </div>
              </div>
            </div>

            {/* Simulation Results */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={startSimulation}
                  disabled={isSimulating}
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {isSimulating ? 'Minerando...' : 'Iniciar Simulação'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetSimulation}
                  disabled={isSimulating}
                >
                  Resetar
                </Button>
              </div>

              {(simulationResults.attempts > 0 || isSimulating) && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {simulationResults.attempts.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Tentativas</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {formatTime(simulationResults.timeElapsed)}
                      </div>
                      <div className="text-sm text-gray-600">Tempo Decorrido</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {Math.round(simulationResults.attempts / (simulationResults.timeElapsed || 1)).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">H/s Atual</div>
                    </div>
                  </div>

                  {simulationResults.found && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">🎉 Bloco Encontrado!</h4>
                      <div className="text-sm text-green-700">
                        Hash válido encontrado após {simulationResults.attempts.toLocaleString()} tentativas 
                        em {formatTime(simulationResults.timeElapsed)}.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Historical Chart */}
            <div className="space-y-4">
              <h3 className="font-semibold">Histórico de Dificuldade</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-4">
                  {historicalData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <div>
                          <div className="font-medium">Bloco #{data.blockHeight.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(data.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatDifficulty(data.difficulty)}</div>
                        <div className="text-sm text-gray-600">{formatHashrate(data.hashrate)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Adjustment Examples */}
            <div className="space-y-4">
              <h3 className="font-semibold">Exemplos de Ajuste</h3>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Ajuste para Baixo (-15%)</h4>
                  <div className="text-sm text-green-700">
                    <div>Cenário: Blocos levando 11.5 min em média</div>
                    <div>Ação: Dificuldade reduzida para acelerar os blocos</div>
                    <div>Resultado: Volta para ~10 min por bloco</div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Ajuste para Cima (+8%)</h4>
                  <div className="text-sm text-red-700">
                    <div>Cenário: Blocos levando 9.2 min em média</div>
                    <div>Ação: Dificuldade aumentada para desacelerar os blocos</div>
                    <div>Resultado: Volta para ~10 min por bloco</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}