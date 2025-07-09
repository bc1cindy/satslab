export interface IPAuthSession {
  user: {
    id: string
    ipAddress: string
  }
  isAuthenticated: boolean
  loginTime: number
}

export class IPAuth {
  private static SESSION_KEY = 'satslab_ip_session'
  
  static async authenticateByIP(): Promise<IPAuthSession | null> {
    try {
      // Call the API route for IP authentication
      const response = await fetch('/api/auth/ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        console.error('IP authentication API failed:', response.status)
        return null
      }
      
      const data = await response.json()
      
      if (!data.success || !data.user) {
        console.error('IP authentication failed:', data.error)
        return null
      }
      
      const session: IPAuthSession = {
        user: {
          id: data.user.id,
          ipAddress: data.user.ipAddress
        },
        isAuthenticated: true,
        loginTime: Date.now()
      }
      
      // Store session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      }
      
      return session
    } catch (error) {
      console.error('IP authentication failed:', error)
      return null
    }
  }
  
  static getSession(): IPAuthSession | null {
    if (typeof window === 'undefined') return null
    
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY)
      if (!sessionData) return null
      
      const session: IPAuthSession = JSON.parse(sessionData)
      return session.isAuthenticated ? session : null
    } catch {
      return null
    }
  }
  
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY)
    }
  }
  
  static isAuthenticated(): boolean {
    const session = this.getSession()
    return session?.isAuthenticated ?? false
  }
  
  static getCurrentUser(): { id: string; ipAddress: string } | null {
    const session = this.getSession()
    return session?.user ?? null
  }
}

export function useIPAuth() {
  const session = IPAuth.getSession()
  
  return {
    user: session?.user ?? null,
    isAuthenticated: session?.isAuthenticated ?? false,
    login: IPAuth.authenticateByIP,
    logout: IPAuth.logout
  }
}