'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { CheckCircle, ExternalLink, Smartphone, Monitor, Settings, Zap, Download, Gift } from 'lucide-react'

interface SetupStep {
  id: number
  title: string
  description: string
  completed: boolean
  required: boolean
}

interface WalletSetupGuideProps {
  onAddressGenerated?: (address: string) => void
  onFundsReceived?: (amount: number) => void
}

export default function WalletSetupGuide({ 
  onAddressGenerated, 
  onFundsReceived 
}: WalletSetupGuideProps) {
  const [selectedWallet, setSelectedWallet] = useState<'phoenix' | 'breez' | null>(null)
  const [steps, setSteps] = useState<SetupStep[]>([
    { id: 1, title: "Baixar Carteira", description: "Instale Phoenix ou Breez", completed: false, required: true },
    { id: 2, title: "Configurar Signet", description: "Ative modo desenvolvedor", completed: false, required: true },
    { id: 3, title: "Gerar Endereço", description: "Crie endereço Lightning", completed: false, required: true },
    { id: 4, title: "Receber Fundos", description: "Use faucet starbackr.me", completed: false, required: true },
    { id: 5, title: "Verificar Saldo", description: "Confirme recebimento", completed: false, required: true }
  ])

  const wallets = [
    {
      id: 'phoenix' as const,
      name: 'Phoenix',
      description: 'Carteira Lightning simples e auto-gerenciada',
      platforms: ['iOS', 'Android'],
      icon: '🐦',
      downloadLinks: {
        ios: 'https://apps.apple.com/app/phoenix-wallet/id1544097028',
        android: 'https://play.google.com/store/apps/details?id=fr.acinq.phoenix.mainnet'
      },
      features: ['Auto-gerenciada', 'Canais automáticos', 'Backup simples'],
      difficulty: 'Iniciante'
    },
    {
      id: 'breez' as const,
      name: 'Breez',
      description: 'Carteira Lightning com funcionalidades avançadas',
      platforms: ['iOS', 'Android', 'Desktop'],
      icon: '⚡',
      downloadLinks: {
        ios: 'https://apps.apple.com/app/breez/id1463300001',
        android: 'https://play.google.com/store/apps/details?id=com.breez.client',
        desktop: 'https://breez.technology/download'
      },
      features: ['Podcasts', 'Point of Sale', 'Backup na nuvem'],
      difficulty: 'Intermediário'
    }
  ]

  const completeStep = (stepId: number) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ))
  }

  const isStepCompleted = (stepId: number) => {
    return steps.find(step => step.id === stepId)?.completed || false
  }

  const allStepsCompleted = steps.filter(step => step.required).every(step => step.completed)

  const phoenixInstructions = [
    {
      step: 1,
      title: "Baixar Phoenix",
      content: "Baixe a carteira Phoenix na App Store ou Google Play",
      details: [
        "Acesse a loja de aplicativos do seu dispositivo",
        "Pesquise por 'Phoenix Wallet'",
        "Instale o aplicativo oficial da ACINQ",
        "Abra o aplicativo após a instalação"
      ]
    },
    {
      step: 2,
      title: "Configurar Signet",
      content: "Ative o modo desenvolvedor e configure para Signet",
      details: [
        "Vá em Configurações (Settings) no aplicativo",
        "Ative 'Modo Desenvolvedor' (Developer Mode)",
        "Em 'Rede', selecione 'Signet'",
        "Reinicie o aplicativo para aplicar as mudanças"
      ]
    },
    {
      step: 3,
      title: "Gerar Endereço",
      content: "Crie um endereço Lightning para receber fundos",
      details: [
        "Toque em 'Receber' na tela principal",
        "Selecione 'Lightning' como método",
        "Defina um valor (ex: 10000 satoshis)",
        "Copie o endereço ou invoice gerado"
      ]
    },
    {
      step: 4,
      title: "Usar Faucet",
      content: "Receba fundos de teste do faucet starbackr.me",
      details: [
        "Acesse https://starbackr.me",
        "Cole seu endereço Lightning",
        "Clique em 'Send' para receber fundos",
        "Aguarde alguns segundos para o recebimento"
      ]
    }
  ]

  const breezInstructions = [
    {
      step: 1,
      title: "Baixar Breez",
      content: "Baixe a carteira Breez para seu dispositivo",
      details: [
        "Acesse breez.technology ou sua loja de apps",
        "Baixe a versão apropriada para seu dispositivo",
        "Instale e abra o aplicativo",
        "Complete a configuração inicial"
      ]
    },
    {
      step: 2,
      title: "Modo Desenvolvedor",
      content: "Ative o modo desenvolvedor nas configurações",
      details: [
        "Vá em Configurações > Desenvolvedor",
        "Ative 'Modo Desenvolvedor'",
        "Selecione 'Signet' como rede",
        "Reinicie o aplicativo"
      ]
    },
    {
      step: 3,
      title: "Criar Invoice",
      content: "Gere um invoice Lightning para receber fundos",
      details: [
        "Toque no botão 'Receber'",
        "Insira o valor desejado",
        "Adicione uma descrição opcional",
        "Copie o invoice gerado"
      ]
    },
    {
      step: 4,
      title: "Receber Fundos",
      content: "Use o faucet para receber Bitcoin de teste",
      details: [
        "Acesse https://starbackr.me",
        "Cole seu invoice Lightning",
        "Confirme o recebimento",
        "Verifique o saldo na carteira"
      ]
    }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Seleção de Carteira */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Configure sua Carteira Lightning
          </CardTitle>
          <p className="text-sm text-gray-600">
            Escolha uma carteira Lightning compatível com Signet
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedWallet === wallet.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedWallet(wallet.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{wallet.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{wallet.name}</h3>
                      <Badge variant="outline">{wallet.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{wallet.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {wallet.platforms.map((platform) => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-1">
                      {wallet.features.map((feature, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          • {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Downloads */}
      {selectedWallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download {wallets.find(w => w.id === selectedWallet)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(wallets.find(w => w.id === selectedWallet)?.downloadLinks || {}).map(([platform, url]) => (
                <Button
                  key={platform}
                  variant="outline"
                  onClick={() => window.open(url, '_blank')}
                  className="h-auto p-4 flex-col gap-2"
                >
                  {platform === 'ios' && <Smartphone className="w-6 h-6" />}
                  {platform === 'android' && <Smartphone className="w-6 h-6" />}
                  {platform === 'desktop' && <Monitor className="w-6 h-6" />}
                  <div className="capitalize">{platform}</div>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              ))}
            </div>
            <Button
              onClick={() => completeStep(1)}
              disabled={isStepCompleted(1)}
              className="w-full mt-4"
            >
              {isStepCompleted(1) ? <CheckCircle className="w-4 h-4 mr-2" /> : null}
              Marcar como Instalado
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instruções Passo a Passo */}
      {selectedWallet && isStepCompleted(1) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Instruções de Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(selectedWallet === 'phoenix' ? phoenixInstructions : breezInstructions).map((instruction, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isStepCompleted(instruction.step + 1) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isStepCompleted(instruction.step + 1) ? <CheckCircle className="w-4 h-4" /> : instruction.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{instruction.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{instruction.content}</p>
                      <div className="space-y-1">
                        {instruction.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => completeStep(instruction.step + 1)}
                        disabled={isStepCompleted(instruction.step + 1)}
                        className="mt-3"
                      >
                        {isStepCompleted(instruction.step + 1) ? 'Concluído' : 'Marcar como Concluído'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Faucet Information */}
      {selectedWallet && isStepCompleted(3) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Faucet Lightning Signet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Zap className="w-4 h-4" />
                <AlertDescription>
                  O faucet starbackr.me fornece Bitcoin de teste (sBTC) para experimentação na rede Signet.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Como usar o faucet:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">1.</span>
                    <span>Acesse <a href="https://starbackr.me" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">starbackr.me</a></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">2.</span>
                    <span>Cole seu endereço Lightning ou invoice</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">3.</span>
                    <span>Clique em "Send" para receber os fundos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">4.</span>
                    <span>Aguarde alguns segundos para o recebimento</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => window.open('https://starbackr.me', '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar Faucet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {step.completed ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-gray-600">{step.description}</div>
                </div>
                {step.required && (
                  <Badge variant={step.completed ? "default" : "secondary"}>
                    {step.completed ? "Concluído" : "Obrigatório"}
                  </Badge>
                )}
              </div>
            ))}
          </div>
          
          {allStepsCompleted && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Configuração Completa!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Sua carteira Lightning está configurada e pronta para uso na rede Signet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}