'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { BitcoinAuth, AuthSession } from '@/app/lib/auth/bitcoin-auth'
import { IPAuth, IPAuthSession } from '@/app/lib/auth/ip-auth'

// Union type for both auth sessions
type UnifiedSession = AuthSession | IPAuthSession | null

interface AuthContextType {
  session: UnifiedSession
  isLoading: boolean
  login: (privateKey: string) => Promise<AuthSession | null>
  loginByIP: () => Promise<IPAuthSession | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UnifiedSession>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing sessions on mount - try IP first, then Bitcoin
    const ipSession = IPAuth.getSession()
    const bitcoinSession = BitcoinAuth.getSession()
    
    // Prefer IP session if available, otherwise use Bitcoin session
    setSession(ipSession || bitcoinSession)
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

  const loginByIP = async (): Promise<IPAuthSession | null> => {
    setIsLoading(true)
    try {
      const newSession = await IPAuth.authenticateByIP()
      setSession(newSession)
      return newSession
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    BitcoinAuth.logout()
    IPAuth.logout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, login, loginByIP, logout }}>
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

// Helper function to get user identifier (publicKey or ipAddress)
export function getUserIdentifier(session: UnifiedSession): string | null {
  if (!session) return null
  if ('publicKey' in session.user) {
    return session.user.publicKey
  }
  if ('ipAddress' in session.user) {
    return session.user.ipAddress
  }
  return null
}