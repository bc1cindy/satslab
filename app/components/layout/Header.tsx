import Link from 'next/link'

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
              href="/modules" 
              className="text-gray-600 hover:text-orange-600 font-medium"
            >
              Módulos
            </Link>
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-orange-600 font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/badges" 
              className="text-gray-600 hover:text-orange-600 font-medium"
            >
              Badges
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}