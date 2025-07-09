import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/app/components/auth/AuthProvider'
import { ThemeProvider } from '@/app/components/theme-provider'
import { Toaster } from '@/app/components/ui/toaster'
import AnalyticsWrapper from '@/app/components/layout/AnalyticsWrapper'
import AutoIPAuth from '@/app/components/auth/AutoIPAuth'

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
          <AuthProvider>
            <AutoIPAuth>
              <AnalyticsWrapper>
                <div className="min-h-screen bg-background">
                  {children}
                </div>
              </AnalyticsWrapper>
            </AutoIPAuth>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}