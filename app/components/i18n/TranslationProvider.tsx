'use client'

import { createContext, useContext, ReactNode, useState } from 'react'
import { translations, Language } from './locales'

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

interface TranslationProviderProps {
  children: ReactNode
  defaultLanguage?: Language
}

export function TranslationProvider({ 
  children, 
  defaultLanguage = 'pt' 
}: TranslationProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage)

  const t = (key: string): string => {
    const keys = key.split('.')
    let translation: any = translations[language]
    
    for (const k of keys) {
      translation = translation?.[k]
    }
    
    return translation || key
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}