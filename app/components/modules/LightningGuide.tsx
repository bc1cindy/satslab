'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Progress } from '@/app/components/ui/progress'
import { 
  Zap, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  Shield, 
  Network, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Users
} from 'lucide-react'

interface LightningGuideProps {
  onComplete?: () => void
}

export default function LightningGuide({ onComplete }: LightningGuideProps) {
  const [activeTab, setActiveTab] = useState('basics')
  const [completedSections, setCompletedSections] = useState<string[]>([])

  const markSectionComplete = (section: string) => {
    if (!completedSections.includes(section)) {
      setCompletedSections([...completedSections, section])
    }
  }

  const isSectionComplete = (section: string) => {
    return completedSections.includes(section)
  }

  const allSectionsComplete = completedSections.length >= 4

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Guia Lightning Network
        </CardTitle>
        <p className="text-sm text-gray-600">
          Aprenda os conceitos fundamentais da segunda camada do Bitcoin
        </p>
        {completedSections.length > 0 && (
          <Progress value={(completedSections.length / 4) * 100} className="h-2" />
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics" className="relative">
              Básico
              {isSectionComplete('basics') && (
                <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
              )}
            </TabsTrigger>
            <TabsTrigger value="channels" className="relative">
              Canais
              {isSectionComplete('channels') && (
                <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
              )}
            </TabsTrigger>
            <TabsTrigger value="payments" className="relative">
              Pagamentos
              {isSectionComplete('payments') && (
                <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
              )}
            </TabsTrigger>
            <TabsTrigger value="security" className="relative">
              Segurança
              {isSectionComplete('security') && (
                <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">⚡ O que é Lightning Network?</h3>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-blue-800 mb-3">
                  A Lightning Network é uma <strong>solução de segunda camada</strong> construída sobre o Bitcoin
                  que permite transações instantâneas e com taxas muito baixas.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded">
                    <h4 className="font-semibold text-blue-800 mb-2">Problemas que Resolve</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Escalabilidade limitada</li>
                      <li>• Taxas altas em períodos de congestionamento</li>
                      <li>• Tempo de confirmação lento</li>
                      <li>• Inviabilidade de micropagamentos</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <h4 className="font-semibold text-blue-800 mb-2">Benefícios</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Transações instantâneas</li>
                      <li>• Taxas de poucos satoshis</li>
                      <li>• Micropagamentos viáveis</li>
                      <li>• Privacidade melhorada</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Como Funciona?</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      <div className="text-xs mt-1">Alice</div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="relative">
                        <div className="h-2 bg-blue-200 rounded-full">
                          <div className="h-2 bg-blue-500 rounded-full w-1/2"></div>
                        </div>
                        <div className="text-center text-xs mt-1">Canal Lightning</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                        B
                      </div>
                      <div className="text-xs mt-1">Bob</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    Canal off-chain permite múltiplas transações instantâneas
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Comparação: On-chain vs Lightning</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-orange-800 mb-2">Bitcoin On-chain</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Velocidade:</span>
                        <span className="text-orange-600">~10 minutos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa:</span>
                        <span className="text-orange-600">$1-50+</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Finalidade:</span>
                        <span className="text-green-600">Definitiva</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacidade:</span>
                        <span className="text-orange-600">~7 TPS</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Lightning Network</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Velocidade:</span>
                        <span className="text-green-600">Instantâneo</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa:</span>
                        <span className="text-green-600">1-10 sats</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Finalidade:</span>
                        <span className="text-yellow-600">Probabilística</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacidade:</span>
                        <span className="text-green-600">Milhões TPS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={() => markSectionComplete('basics')} className="w-full">
                {isSectionComplete('basics') ? '✅ Seção Concluída' : 'Marcar como Concluída'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">🔗 Canais de Pagamento</h3>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Ciclo de Vida de um Canal</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Abertura do Canal</div>
                      <div className="text-sm text-gray-600">
                        Transação on-chain cria canal com fundos bloqueados
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Transações Off-chain</div>
                      <div className="text-sm text-gray-600">
                        Múltiplas transações instantâneas entre as partes
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Fechamento do Canal</div>
                      <div className="text-sm text-gray-600">
                        Transação on-chain liquida saldos finais
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Tipos de Fechamento</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">Fechamento Cooperativo</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Ambas as partes concordam</li>
                      <li>• Taxas menores</li>
                      <li>• Processo mais rápido</li>
                      <li>• Mais eficiente</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-red-800 mb-2">Fechamento Forçado</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Uma parte está offline</li>
                      <li>• Taxas maiores</li>
                      <li>• Timelock de segurança</li>
                      <li>• Último recurso</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Alert>
                <Users className="w-4 h-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Canais precisam de liquidez em ambos os lados para funcionar
                  eficientemente. Um canal com todo saldo de um lado só permite transações em uma direção.
                </AlertDescription>
              </Alert>

              <Button onClick={() => markSectionComplete('channels')} className="w-full">
                {isSectionComplete('channels') ? '✅ Seção Concluída' : 'Marcar como Concluída'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">💸 Roteamento de Pagamentos</h3>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Como Funcionam os Pagamentos</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        1
                      </div>
                      <span className="text-sm">Bob cria uma invoice com valor e descrição</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        2
                      </div>
                      <span className="text-sm">Alice escaneia ou cola a invoice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        3
                      </div>
                      <span className="text-sm">Rede encontra rota entre Alice e Bob</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        4
                      </div>
                      <span className="text-sm">Pagamento é roteado através dos canais</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                      <span className="text-sm">Bob recebe o pagamento instantaneamente</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Estrutura de Taxas</h4>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Taxa Base:</span>
                      <span>1-10 sats por nó</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Taxa Proporcional:</span>
                      <span>0.001% - 0.1% do valor</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Exemplo (1000 sats):</span>
                      <span className="text-green-600">~3-5 sats total</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Tipos de Invoice</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">Invoice Normal</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Valor fixo predefinido</li>
                      <li>• Válida por tempo limitado</li>
                      <li>• Uso único</li>
                      <li>• Mais segura</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Invoice Zero-Amount</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Pagador define valor</li>
                      <li>• Mais flexível</li>
                      <li>• Para gorjetas/doações</li>
                      <li>• Requer mais cuidado</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Alert>
                <Network className="w-4 h-4" />
                <AlertDescription>
                  <strong>Dica:</strong> Para pagamentos maiores, considere dividir em múltiplas transações menores
                  para melhorar as chances de sucesso no roteamento.
                </AlertDescription>
              </Alert>

              <Button onClick={() => markSectionComplete('payments')} className="w-full">
                {isSectionComplete('payments') ? '✅ Seção Concluída' : 'Marcar como Concluída'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">🔒 Segurança Lightning</h3>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Considerações de Segurança</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">✅ Pontos Fortes</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Contratos inteligentes nativos do Bitcoin</li>
                      <li>• Hash Time-Locked Contracts (HTLCs)</li>
                      <li>• Pagamentos atômicos (tudo ou nada)</li>
                      <li>• Privacidade melhorada vs on-chain</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-yellow-800 mb-2">⚠️ Riscos e Limitações</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Necessidade de estar online</li>
                      <li>• Backup de channel state crítico</li>
                      <li>• Liquidez limitada por canal</li>
                      <li>• Watchtowers para segurança adicional</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Melhores Práticas</h4>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800">Backup Regular</div>
                        <div className="text-sm text-blue-700">
                          Sempre mantenha backups atualizados do channel state
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800">Monitoramento</div>
                        <div className="text-sm text-blue-700">
                          Use watchtowers ou mantenha o nó online regularmente
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800">Gestão de Liquidez</div>
                        <div className="text-sm text-blue-700">
                          Equilibre fundos entre canais para manter funcionalidade
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Recursos Adicionais</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('https://lightning.network/lightning-network-paper.pdf', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Lightning Paper
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('https://lightningnetwork.plus/', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Lightning Network+
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Lembre-se:</strong> Lightning é ideal para pagamentos frequentes e pequenos valores.
                  Para grandes quantias ou armazenamento de longo prazo, use Bitcoin on-chain.
                </AlertDescription>
              </Alert>

              <Button onClick={() => markSectionComplete('security')} className="w-full">
                {isSectionComplete('security') ? '✅ Seção Concluída' : 'Marcar como Concluída'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Completion Section */}
        {allSectionsComplete && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Guia Completo!</span>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Você completou todas as seções do guia Lightning Network. 
              Agora você está pronto para usar carteiras Lightning!
            </p>
            <Button onClick={onComplete} className="w-full">
              Continuar para Configuração de Carteira
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}