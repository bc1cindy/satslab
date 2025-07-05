'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Progress } from '@/app/components/ui/progress'
import { 
  Calculator, 
  Clock, 
  TrendingUp, 
  Zap, 
  Info,
  DollarSign,
  BarChart3,
  Timer
} from 'lucide-react'

interface TransactionEducationProps {
  showFeeCalculation?: boolean
  showTimeComparison?: boolean
  showNetworkConditions?: boolean
}

/**
 * Componente educacional sobre transações Bitcoin
 * Explica taxas, tempos de confirmação e condições da rede
 */
export default function TransactionEducation({
  showFeeCalculation = true,
  showTimeComparison = true,
  showNetworkConditions = true
}: TransactionEducationProps) {
  // Dados mock das condições da rede
  const networkConditions = {
    mempoolSize: 2.5, // MB
    confirmedTxs: 3247,
    nextBlockFee: 12,
    congestionLevel: 'medium' as 'low' | 'medium' | 'high'
  }

  const feeExamples = [
    {
      size: 200,
      rate: 5,
      level: 'Média',
      time: '10-30 min',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      size: 200,
      rate: 10,
      level: 'Alta',
      time: '1-10 min',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      size: 200,
      rate: 2,
      level: 'Baixa',
      time: '30-60 min',
      color: 'bg-green-100 text-green-800'
    }
  ]

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getCongestionProgress = (level: string) => {
    switch (level) {
      case 'low': return 25
      case 'medium': return 60
      case 'high': return 90
      default: return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Cálculo de Taxas */}
      {showFeeCalculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Como Calcular Taxas
            </CardTitle>
            <CardDescription>
              Entenda a matemática por trás das taxas de transação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Fórmula Básica</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center space-y-2">
                    <p className="text-lg font-mono">Taxa = Tamanho × Rate</p>
                    <p className="text-sm text-muted-foreground">
                      (vBytes) × (sat/vB) = satoshis
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  O tamanho da transação depende do número de inputs e outputs, 
                  enquanto a taxa por vByte define a prioridade.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Exemplo Prático</h4>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tamanho:</span>
                      <span className="font-mono">200 vB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa:</span>
                      <span className="font-mono">5 sat/vB</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total:</span>
                      <span className="font-mono">1.000 sats</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      = 0.00001 BTC
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Dica:</strong> Transações com mais inputs (UTXOs) são maiores e custam mais. 
                Carteiras modernas otimizam automaticamente a seleção de UTXOs.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Comparação de Tempos */}
      {showTimeComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Relação Taxa vs Tempo
            </CardTitle>
            <CardDescription>
              Como diferentes taxas afetam o tempo de confirmação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {feeExamples.map((example, index) => {
                const totalFee = example.size * example.rate
                const feeInBTC = totalFee / 100000000
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge className={example.color}>
                        {example.level}
                      </Badge>
                      <div className="space-y-1">
                        <p className="font-medium">{example.rate} sat/vB</p>
                        <p className="text-sm text-muted-foreground">
                          {totalFee} sats ({feeInBTC.toFixed(8)} BTC)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{example.time}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Importante:</strong> Estes são tempos estimados em condições normais. 
                Durante picos de demanda, mesmo taxas altas podem demorar mais.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Condições da Rede */}
      {showNetworkConditions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Condições Atuais da Rede
            </CardTitle>
            <CardDescription>
              Monitoramento das condições da rede Signet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Mempool</Label>
                <p className="font-medium">{networkConditions.mempoolSize} MB</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">TXs Confirmadas</Label>
                <p className="font-medium">{networkConditions.confirmedTxs.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Taxa Sugerida</Label>
                <p className="font-medium">{networkConditions.nextBlockFee} sat/vB</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Congestionamento</Label>
                <p className={`font-medium capitalize ${getCongestionColor(networkConditions.congestionLevel)}`}>
                  {networkConditions.congestionLevel === 'low' ? 'Baixo' : 
                   networkConditions.congestionLevel === 'medium' ? 'Médio' : 'Alto'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nível de Congestionamento</span>
                <span>{getCongestionProgress(networkConditions.congestionLevel)}%</span>
              </div>
              <Progress value={getCongestionProgress(networkConditions.congestionLevel)} />
            </div>
            
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Dica:</strong> Use o mempool.space para verificar as condições reais da rede 
                antes de definir suas taxas.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Estratégias de Taxa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Estratégias de Taxa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Economia</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use taxas baixas para transações não urgentes</li>
                <li>• Envie durante baixa demanda (finais de semana)</li>
                <li>• Agrupe múltiplas transações</li>
                <li>• Use endereços SegWit (menores taxas)</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-orange-600">Urgência</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use taxas altas para prioridade máxima</li>
                <li>• Monitore condições da rede</li>
                <li>• Considere RBF (Replace-by-Fee)</li>
                <li>• Tenha fundos extras para taxas</li>
              </ul>
            </div>
          </div>
          
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Zap className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Lembrete:</strong> Na Signet, as taxas são simbólicas. 
              Na mainnet, planeje suas taxas com cuidado para evitar gastos desnecessários.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente auxiliar para Label
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`text-sm font-medium ${className}`}>
      {children}
    </span>
  )
}