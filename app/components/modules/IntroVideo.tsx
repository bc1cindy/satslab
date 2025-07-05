'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

interface IntroVideoProps {
  title: string
  description: string
  duration: string
  onComplete: () => void
}

export function IntroVideo({ title, description, duration, onComplete }: IntroVideoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-orange-300">
          <div className="text-center">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-xl font-semibold text-orange-800 mb-2">{title}</h3>
            <p className="text-orange-700 mb-4">{description}</p>
            <div className="bg-white bg-opacity-50 px-3 py-1 rounded-full text-sm text-orange-800">
              ⏱️ {duration}
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 Neste vídeo você aprenderá:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• O que é Bitcoin e por que foi criado</li>
            <li>• Como funciona a tecnologia blockchain</li>
            <li>• Diferenças entre redes de teste e produção</li>
            <li>• Por que o Bitcoin é considerado &quot;dinheiro digital&quot;</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-xl">💡</span>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Dica de Estudo</h4>
              <p className="text-sm text-yellow-800">
                Assista com atenção! As informações deste vídeo ajudarão você a responder 
                as perguntas teóricas que vêm a seguir.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full" size="lg">
          ✅ Assistido - Continuar para Perguntas
        </Button>
      </CardContent>
    </Card>
  )
}