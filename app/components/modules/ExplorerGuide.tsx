'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'

interface ExplorerGuideProps {
  onComplete: () => void
}

export function ExplorerGuide({ onComplete }: ExplorerGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "1. Acessando o Explorer",
      content: "Vamos explorar o mempool.space/signet - o principal explorador da rede Signet",
      image: "🔗",
      action: "Abrir mempool.space/signet",
      link: "https://mempool.space/signet"
    },
    {
      title: "2. Entendendo a Interface",
      content: "A página inicial mostra blocos recentes, transações pendentes e estatísticas da rede",
      image: "📊",
      highlights: ["Blocos recentes", "Mempool", "Taxa média", "Dificuldade"]
    },
    {
      title: "3. Encontrando Transações",
      content: "Procure por 'Recent Transactions' ou clique em qualquer bloco para ver suas transações",
      image: "🔍",
      highlights: ["Lista de transações", "Hash da transação", "Valores transferidos"]
    },
    {
      title: "4. Analisando uma Transação",
      content: "Clique em uma transação para ver detalhes completos: inputs, outputs, taxas e confirmações",
      image: "📋",
      highlights: ["Transaction ID (hash)", "Inputs (entradas)", "Outputs (saídas)", "Fee (taxa)"]
    }
  ]

  const currentStepData = steps[currentStep]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            Guia do Explorer Blockchain
          </CardTitle>
          <Badge variant="outline">
            Passo {currentStep + 1} de {steps.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">{currentStepData.image}</div>
          <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
          <p className="text-gray-600">{currentStepData.content}</p>
        </div>

        {currentStepData.link && (
          <div className="text-center">
            <a 
              href={currentStepData.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline" size="lg">
                🌐 {currentStepData.action}
              </Button>
            </a>
          </div>
        )}

        {currentStepData.highlights && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">🔍 O que observar:</h4>
            <div className="grid grid-cols-2 gap-2">
              {currentStepData.highlights.map((highlight, index) => (
                <div key={index} className="bg-white p-2 rounded text-sm text-blue-800 border">
                  • {highlight}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            ← Anterior
          </Button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentStep 
                    ? 'bg-orange-600' 
                    : index < currentStep 
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Próximo →
            </Button>
          ) : (
            <Button onClick={onComplete}>
              🚀 Iniciar Tarefas
            </Button>
          )}
        </div>

        {currentStep === steps.length - 1 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <h4 className="font-semibold text-green-900">Guia Completo!</h4>
                <p className="text-sm text-green-800">
                  Agora você está pronto para explorar transações reais na Signet.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}