import { ReactNode } from 'react'
import { LanguageProvider } from './LanguageProvider'

export default function PortugueseWrapper({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider forceLanguage="pt">
      {children}
    </LanguageProvider>
  )
}