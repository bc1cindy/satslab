import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/app/components/auth/AuthProvider'
import { ThemeProvider } from '@/app/components/theme-provider'
import { Toaster } from '@/app/components/ui/toaster'
import AnalyticsWrapper from '@/app/components/layout/AnalyticsWrapper'
import { SessionProvider } from '@/app/lib/session/session-provider'
import CookieBanner from '@/app/components/layout/CookieBanner'
import { TranslationProvider } from '@/app/components/i18n/TranslationProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SatsLab - Bitcoin Operations Platform',
  description: 'Learn Bitcoin operations through interactive modules and hands-on experience with Signet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TranslationProvider>
            <SessionProvider>
              <AuthProvider>
                <AnalyticsWrapper>
                  <div className="min-h-screen bg-background">
                    {children}
                    <CookieBanner />
                  </div>
                </AnalyticsWrapper>
                <Toaster />
              </AuthProvider>
            </SessionProvider>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}