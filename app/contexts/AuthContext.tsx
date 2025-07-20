'use client'

import { createContext, useContext, ReactNode } from 'react'

// Minimal stub AuthContext to prevent compilation errors
// This is not actually used in the app - NextAuth is used instead

interface User {
  id: string
  email: string
  name?: string
  hasProAccess: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  checkProAccess: () => Promise<boolean>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Stub implementation
  const value: AuthContextType = {
    user: null,
    token: null,
    loading: false,
    isAuthenticated: false,
    login: async () => ({ success: false, message: 'Not implemented' }),
    logout: () => {},
    checkProAccess: async () => false,
    refreshUser: async () => {}
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export default AuthContext