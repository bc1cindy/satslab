import { LoginForm } from '@/app/components/auth/LoginForm'
import Link from 'next/link'

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
              SatsLab
            </h1>
          </Link>
          <p className="text-gray-300 mt-2">
            Acesse sua conta para continuar
          </p>
        </div>

        <LoginForm />

        <div className="text-center mt-6">
          <Link 
            href="/modules/1" 
            className="text-orange-400 hover:text-orange-300 text-sm"
          >
            ← Voltar para Módulo 1
          </Link>
        </div>
      </div>
    </main>
  )
}