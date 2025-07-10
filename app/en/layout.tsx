import { ReactNode } from 'react'
import { LanguageProvider } from '@/app/components/i18n/LanguageProvider'

export default function EnglishLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <LanguageProvider forceLanguage="en">
      {children}
    </LanguageProvider>
  )
}