'use client'

import { createContext, useContext, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { translations } from './locales'

type Language = 'pt' | 'en'

interface LanguageContextType {
  language: Language
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
  forceLanguage?: Language
}

export function LanguageProvider({ children, forceLanguage }: LanguageProviderProps) {
  const pathname = usePathname()
  
  // Determine language from pathname or force it
  const language: Language = forceLanguage || (pathname.startsWith('/en') ? 'en' : 'pt')

  const t = (key: string): string => {
    const keys = key.split('.')
    let translation: any = translations[language]
    
    for (const k of keys) {
      translation = translation?.[k]
    }
    
    return translation || key
  }

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}