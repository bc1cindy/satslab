'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { BitcoinAuth, AuthSession } from '@/app/lib/auth/bitcoin-auth'

interface AuthContextType {
  session: AuthSession | null
  isLoading: boolean
  login: (privateKey: string) => Promise<AuthSession | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const existingSession = BitcoinAuth.getSession()
    setSession(existingSession)
    setIsLoading(false)
  }, [])

  const login = async (privateKey: string): Promise<AuthSession | null> => {
    setIsLoading(true)
    try {
      const newSession = await BitcoinAuth.authenticate(privateKey)
      setSession(newSession)
      return newSession
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    BitcoinAuth.logout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const { session, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading && !session) {
      window.location.href = '/auth'
    }
  }, [session, isLoading])
  
  return { session, isLoading }
}