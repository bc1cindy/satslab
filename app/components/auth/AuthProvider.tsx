'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { BitcoinAuth, AuthSession } from '@/app/lib/auth/bitcoin-auth'

// Simple session type
type UnifiedSession = AuthSession | null

interface AuthContextType {
  session: UnifiedSession
  isLoading: boolean
  login: (privateKey: string) => Promise<AuthSession | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UnifiedSession>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing Bitcoin session on mount
    const bitcoinSession = BitcoinAuth.getSession()
    setSession(bitcoinSession)
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
  
  // Removed redirect to /auth - admin page accessible without authentication
  
  return { session, isLoading }
}

// Helper function to get user ID from either session type
export function getUserId(session: UnifiedSession): string | null {
  if (!session) return null
  return session.user.id
}

// Helper function to get user identifier
export function getUserIdentifier(session: UnifiedSession): string | null {
  if (!session) return null
  return session.user.publicKey
}