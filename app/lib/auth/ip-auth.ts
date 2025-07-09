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
      // Get user IP address
      let ipAddress: string
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        ipAddress = data.ip
      } catch (error) {
        console.warn('Could not fetch IP address, using fallback')
        ipAddress = '127.0.0.1'
      }
      
      // Import queries functions
      const { getUserByIP, createUserByIP } = await import('@/app/lib/supabase/queries')
      
      // Check if user exists, create if not
      let user = await getUserByIP(ipAddress)
      if (!user) {
        user = await createUserByIP(ipAddress)
        if (!user) {
          throw new Error('Failed to create user')
        }
      }
      
      const session: IPAuthSession = {
        user: {
          id: user.id,
          ipAddress: user.ipAddress || ipAddress
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