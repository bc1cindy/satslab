"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Bitcoin } from "lucide-react"
import { securityLogger, SecurityEventType } from "@/app/lib/security/security-logger"

export default function Component() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false
      })
      
      if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      securityLogger.logAuthentication(false, undefined)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bitcoin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text">SatsLab</span>
          </h1>
          <p className="text-gray-400">Domine a Criptomoeda do Futuro</p>
        </div>

        {/* Login Card */}
        <Card className="bg-gray-800 border-gray-700 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Bem-vindo</CardTitle>
            <CardDescription className="text-gray-400">Entre na sua conta para acessar o SatsLab Pro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 h-12 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{loading ? 'Conectando...' : 'Continuar com Google'}</span>
              </div>
            </Button>


            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-gray-500 text-xs">
                Ao fazer login, você concorda com nossos{" "}
                <a href="#" className="text-amber-400 hover:underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="#" className="text-amber-400 hover:underline">
                  Política de Privacidade
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}