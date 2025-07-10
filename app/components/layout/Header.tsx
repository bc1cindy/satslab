import Link from 'next/link'
import { LanguageSelector } from '@/app/components/i18n/LanguageSelector'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-orange-600">SatsLab</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-orange-600 font-medium"
            >
              Módulos
            </Link>
            <LanguageSelector />
          </nav>
        </div>
      </div>
    </header>
  )
}