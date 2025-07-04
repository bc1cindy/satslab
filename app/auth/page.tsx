import { LoginForm } from '@/app/components/auth/LoginForm'
import Link from 'next/link'

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
              SatsLab
            </h1>
          </Link>
          <p className="text-gray-300 mt-2">
            Acesse sua conta para continuar aprendendo
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="order-2 md:order-1">
            <LoginForm />
          </div>
          
          <div className="order-1 md:order-2 space-y-6">
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <h3 className="text-xl font-semibold mb-4 text-white">
                🚀 Por que fazer login?
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Salvar progresso em todos os módulos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Ganhar badges e recompensas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Criar carteiras Bitcoin na Signet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Fazer transações reais (rede de teste)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Mintar Ordinals personalizados</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">
                🔐 Segurança da Chave Privada
              </h3>
              <div className="text-blue-300 space-y-2 text-sm">
                <p><strong>Como funciona:</strong></p>
                <ul className="ml-4 space-y-1 list-disc">
                  <li>Sua chave privada gera uma assinatura única</li>
                  <li>Usamos apenas a chave pública para te identificar</li>
                  <li>Não armazenamos sua chave privada</li>
                  <li>Sistema similar ao MetaMask</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/modules/1" 
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                ← Voltar para Módulo 1 (sem login)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}