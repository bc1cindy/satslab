'use client'

import { Button } from '@/app/components/ui/button'
import { useTranslation } from './TranslationProvider'

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
      className="ml-2"
    >
      {language === 'pt' ? 'EN' : 'PT'}
    </Button>
  )
}