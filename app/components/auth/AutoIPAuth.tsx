'use client'

import { useEffect } from 'react'
import { useAuth } from '@/app/components/auth/AuthProvider'

export default function AutoIPAuth({ children }: { children: React.ReactNode }) {
  const { session, isLoading, loginByIP } = useAuth()

  useEffect(() => {
    // Se não há sessão e não está carregando, tenta fazer login automático por IP
    if (!session && !isLoading) {
      console.log('No session found, attempting automatic IP login...')
      loginByIP().then(newSession => {
        if (newSession) {
          console.log('IP login successful:', newSession)
        } else {
          console.warn('IP login failed')
        }
      }).catch(error => {
        console.error('IP login error:', error)
      })
    }
  }, [session, isLoading, loginByIP])

  return <>{children}</>
}