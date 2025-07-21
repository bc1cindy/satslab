/*
 * SatsLab - Free and Open Source Bitcoin Education Platform
 * Copyright (c) 2025 SatsLab
 * 
 * This file is part of SatsLab.
 * 
 * SatsLab is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published in the LICENSE file.
 * 
 * SatsLab is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * MIT License for more details.
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/app/components/auth/AuthProvider'
import { ThemeProvider } from '@/app/components/theme-provider'
import { Toaster } from '@/app/components/ui/toaster'
import AnalyticsWrapper from '@/app/components/layout/AnalyticsWrapper'
import { SessionProvider } from '@/app/lib/session/session-provider'
import NextAuthProvider from '@/app/components/auth/NextAuthProvider'
import CookieBanner from '@/app/components/layout/CookieBanner'
import { LanguageProvider } from '@/app/components/i18n/LanguageProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SatsLab - Educação Bitcoin Gratuita e Open Source',
  description: 'Aprenda Bitcoin gratuitamente com módulos educativos, tutoriais práticos e conteúdo avançado sobre Lightning Network. Plataforma open source de educação Bitcoin em português.',
  metadataBase: new URL('https://satslab.org'),
  keywords: 'Bitcoin, educação, gratuito, Lightning Network, cryptocurrency, blockchain, curso, tutorial',
  openGraph: {
    title: 'SatsLab - Educação Bitcoin Gratuita e Open Source',
    description: 'Aprenda Bitcoin gratuitamente com módulos educativos, tutoriais práticos e conteúdo avançado sobre Lightning Network. Plataforma open source de educação Bitcoin em português.',
    url: 'https://satslab.org',
    siteName: 'SatsLab',
    images: [
      {
        url: '/images/SatsLabProLogo/SatsLab.photo.png',
        width: 1200,
        height: 630,
        alt: 'SatsLab - Plataforma de Educação Bitcoin',
      }
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SatsLab - Educação Bitcoin Gratuita e Open Source',
    description: 'Aprenda Bitcoin gratuitamente com módulos educativos, tutoriais práticos e conteúdo avançado sobre Lightning Network.',
    images: ['/images/SatsLabProLogo/SatsLab.photo.png'],
    creator: '@bc1cindy',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <SessionProvider>
              <AuthProvider>
                <AnalyticsWrapper>
                  <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
                    {children}
                    <CookieBanner />
                  </div>
                </AnalyticsWrapper>
                <Toaster />
              </AuthProvider>
            </SessionProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}