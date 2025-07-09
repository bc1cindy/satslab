'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card } from '@/app/components/ui/card'
import { Cookie, Shield, X, Activity, Settings2 } from 'lucide-react'

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  preferences: boolean
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true
    analytics: true,
    preferences: true
  })

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const fullConsent = {
      essential: true,
      analytics: true,
      preferences: true,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookie-consent', JSON.stringify(fullConsent))
    setShowBanner(false)
  }

  const handleAcceptSelected = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookie-consent', JSON.stringify(consent))
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const minimalConsent = {
      essential: true, // Can't reject essential
      analytics: false,
      preferences: false,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookie-consent', JSON.stringify(minimalConsent))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/95 backdrop-blur-sm border-t border-gray-800">
      <div className="container mx-auto max-w-6xl">
        {!showDetails ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Cookie className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-white font-medium mb-1">
                  Este site usa cookies para melhorar sua experiência
                </p>
                <p className="text-gray-400">
                  Usamos cookies essenciais para o funcionamento do site e cookies opcionais para analytics e preferências.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="text-gray-400 hover:text-white"
              >
                Configurar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="border-gray-700"
              >
                Rejeitar opcionais
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Aceitar todos
              </Button>
            </div>
          </div>
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Configurações de Cookies
                  </h3>
                  <p className="text-sm text-gray-400">
                    Escolha quais tipos de cookies você aceita. Cookies essenciais não podem ser desativados.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-green-500" />
                      <h4 className="font-medium text-white">Cookies Essenciais</h4>
                    </div>
                    <p className="text-sm text-gray-400">
                      Necessários para o funcionamento básico do site. Incluem sessão e preferências básicas.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mt-1 h-4 w-4 text-orange-500 bg-gray-700 border-gray-600 rounded"
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <h4 className="font-medium text-white">Cookies de Analytics</h4>
                    </div>
                    <p className="text-sm text-gray-400">
                      Nos ajudam a entender como você usa o site. Dados são anonimizados e agregados.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="mt-1 h-4 w-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                  />
                </div>

                {/* Preference Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings2 className="h-4 w-4 text-purple-500" />
                      <h4 className="font-medium text-white">Cookies de Preferências</h4>
                    </div>
                    <p className="text-sm text-gray-400">
                      Lembram suas preferências como tema e configurações para melhorar sua experiência.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.preferences}
                    onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                    className="mt-1 h-4 w-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700">
                <a
                  href="/privacy"
                  className="text-sm text-gray-400 hover:text-white underline"
                >
                  Política de Privacidade
                </a>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleRejectAll}
                    className="border-gray-700"
                  >
                    Rejeitar opcionais
                  </Button>
                  <Button
                    onClick={handleAcceptSelected}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Salvar configurações
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}