'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Globe } from 'lucide-react'

export function LanguageSelector() {
  const pathname = usePathname()
  const router = useRouter()
  
  const isEnglish = pathname.startsWith('/en')
  
  const toggleLanguage = () => {
    if (isEnglish) {
      // Remove /en prefix to go to Portuguese
      const newPath = pathname.replace(/^\/en/, '') || '/'
      router.push(newPath)
    } else {
      // Add /en prefix to go to English
      const newPath = `/en${pathname}`
      router.push(newPath)
    }
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      {isEnglish ? 'PT' : 'EN'}
    </Button>
  )
}