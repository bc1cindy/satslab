'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Slider } from '@/app/components/ui/slider'
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  Calculator, 
  Info, 
  AlertTriangle,
  DollarSign,
  Timer
} from 'lucide-react'

interface FeeLevel {
  rate: number
  label: string
  time: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface FeeSelectorProps {
  transactionSize?: number
  onFeeSelected?: (feeRate: number, estimatedFee: number) => void
  showEducation?: boolean
}

/**
 * Componente para seleção educacional de taxas de transação
 * Inclui explicações sobre sat/vB e tempos de confirmação
 */
export default function FeeSelector({ 
  transactionSize = 200, 
  onFeeSelected,
  showEducation = true
}: FeeSelectorProps) {
  const [customFee, setCustomFee] = useState<number>(5)
  const [selectedLevel, setSelectedLevel] = useState<'low' | 'medium' | 'high' | 'custom'>('medium')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const feeLevels: Record<string, FeeLevel> = {
    low: {
      rate: 2,
      label: 'Baixa',
      time: '30-60 min',
      description: 'Econômica, ideal para transações não urgentes',
      icon: Clock,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    medium: {
      rate: 5,
      label: 'Média',
      time: '10-30 min',
      description: 'Equilibrio entre custo e velocidade',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    high: {
      rate: 10,
      label: 'Alta',
      time: '1-10 min',
      description: 'Rápida, para transações urgentes',
      icon: Zap,
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const getCurrentFeeRate = () => {
    if (selectedLevel === 'custom') return customFee
    return feeLevels[selectedLevel]?.rate || 5
  }

  const calculateFee = (rate: number) => {
    const feeInSats = transactionSize * rate
    return {
      sats: feeInSats,
      btc: feeInSats / 100000000
    }
  }

  const currentFeeRate = getCurrentFeeRate()
  const estimatedFee = calculateFee(currentFeeRate)

  const handleFeeSelect = (level: 'low' | 'medium' | 'high' | 'custom') => {
    setSelectedLevel(level)
    const rate = level === 'custom' ? customFee : feeLevels[level].rate
    const fee = calculateFee(rate)
    onFeeSelected?.(rate, fee.btc)
  }

  return (
    <div className="space-y-6">
      {/* Educação sobre Taxas */}
      {showEducation && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Como Funcionam as Taxas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  Sat/vB (Satoshi por vByte)
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  As taxas são medidas em satoshis por vByte virtual. 
                  Transações maiores pagam mais, mas a taxa por vB determina a prioridade.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  Prioridade dos Mineradores
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Mineradores escolhem transações com maiores taxas primeiro. 
                  Em períodos de alta demanda, taxas baixas podem demorar muito.
                </p>
              </div>
            </div>
            
            <Alert className="border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-800/20">
              <Calculator className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Exemplo:</strong> Transação de 200 vB com taxa de 5 sat/vB = 1.000 satoshis = 0.00001 BTC
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Seletor de Taxa */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione a Taxa da Transação</CardTitle>
          <CardDescription>
            Escolha o nível de taxa baseado na urgência da sua transação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Níveis Predefinidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(feeLevels).map(([key, level]) => {
              const Icon = level.icon
              const isSelected = selectedLevel === key
              
              return (
                <button
                  key={key}
                  onClick={() => handleFeeSelect(key as 'low' | 'medium' | 'high')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-1 ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{level.label}</h3>
                        <Badge variant="outline" className="text-xs">
                          {level.rate} sat/vB
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {level.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Timer className="h-3 w-3" />
                        <span>{level.time}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Taxa Personalizada */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Taxa Personalizada</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Ocultar' : 'Mostrar'} Avançado
              </Button>
            </div>
            
            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taxa (sat/vB)</span>
                    <span>{customFee}</span>
                  </div>
                  <Slider
                    value={[customFee]}
                    onValueChange={(value) => setCustomFee(value[0])}
                    max={20}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 sat/vB</span>
                    <span>20 sat/vB</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handleFeeSelect('custom')}
                  className={`w-full ${
                    selectedLevel === 'custom' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : ''
                  }`}
                >
                  Usar Taxa Personalizada ({customFee} sat/vB)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo da Taxa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo da Taxa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Taxa Selecionada</Label>
              <p className="font-medium">{currentFeeRate} sat/vB</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Tamanho da Transação</Label>
              <p className="font-medium">{transactionSize} vB</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Taxa em Satoshis</Label>
              <p className="font-medium">{estimatedFee.sats} sats</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Taxa em sBTC</Label>
              <p className="font-medium">{estimatedFee.btc.toFixed(8)} sBTC</p>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tempo estimado:</span>
              <Badge variant="outline">
                {selectedLevel === 'custom' 
                  ? 'Varia conforme a taxa' 
                  : feeLevels[selectedLevel]?.time || 'Desconhecido'
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Educacionais */}
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <strong>Dica:</strong> Em períodos de alta demanda, mesmo taxas "altas" podem demorar. 
          Sempre verifique as condições atuais da rede antes de definir a taxa.
        </AlertDescription>
      </Alert>
    </div>
  )
}