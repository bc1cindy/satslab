'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { SessionData } from './cookie-session'

interface SessionContextType {
  sessionId: string | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      try {
        const response = await fetch('/api/session/init', {
          method: 'POST',
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setSessionId(data.sessionId)
        }
      } catch (error) {
        console.error('Failed to initialize session:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initSession()
  }, [])

  return (
    <SessionContext.Provider value={{ sessionId, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}