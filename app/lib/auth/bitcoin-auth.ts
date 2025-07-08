import { keyPairFromWIF, signMessage, verifySignature, validatePrivateKey, SIGNET_NETWORK } from '@/app/lib/bitcoin/crypto-mock'
import { getUserByPublicKey, createUser } from '@/app/lib/supabase/queries'

export interface AuthSession {
  user: {
    id: string
    publicKey: string
  }
  isAuthenticated: boolean
  loginTime: number
  ipAddress?: string
}

export class BitcoinAuth {
  private static SESSION_KEY = 'satslab_auth_session'
  
  static async authenticate(privateKey: string): Promise<AuthSession | null> {
    try {
      // Validate private key format
      if (!validatePrivateKey(privateKey, SIGNET_NETWORK)) {
        console.error('Invalid private key format:', privateKey)
        throw new Error('Invalid private key format')
      }
      
      // Generate key pair and signature
      const keyPair = keyPairFromWIF(privateKey, SIGNET_NETWORK)
      const message = `SatsLab Login ${Date.now()}`
      const signature = signMessage(message, privateKey, SIGNET_NETWORK)
      
      // Verify signature (additional security check)
      const isValidSignature = verifySignature(message, signature, keyPair.publicKey)
      if (!isValidSignature) {
        throw new Error('Signature verification failed')
      }

      // Get user IP address
      let ipAddress: string | undefined
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        ipAddress = data.ip
      } catch (error) {
        console.warn('Could not fetch IP address:', error)
      }
      
      // Check if user exists, create if not
      let user = await getUserByPublicKey(keyPair.publicKey)
      if (!user) {
        user = await createUser(keyPair.publicKey, ipAddress)
        if (!user) {
          throw new Error('Failed to create user')
        }
      }
      
      const session: AuthSession = {
        user: {
          id: user.id,
          publicKey: user.publicKey
        },
        isAuthenticated: true,
        loginTime: Date.now(),
        ipAddress
      }
      
      // Store session in localStorage with extended expiry
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
        // Also store in a more persistent way
        localStorage.setItem(`${this.SESSION_KEY}_backup`, JSON.stringify({
          ...session,
          timestamp: Date.now()
        }))
      }
      
      return session
    } catch (error) {
      console.error('Authentication failed:', error)
      return null
    }
  }
  
  static getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null
    
    try {
      let sessionData = localStorage.getItem(this.SESSION_KEY)
      
      // If no session, try backup
      if (!sessionData) {
        const backupData = localStorage.getItem(`${this.SESSION_KEY}_backup`)
        if (backupData) {
          const backup = JSON.parse(backupData)
          // Restore session if backup is less than 30 days old
          if (backup.timestamp && (Date.now() - backup.timestamp) < 30 * 24 * 60 * 60 * 1000) {
            sessionData = JSON.stringify(backup)
            localStorage.setItem(this.SESSION_KEY, sessionData)
          }
        }
      }
      
      if (!sessionData) return null
      
      const session: AuthSession = JSON.parse(sessionData)
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
  
  static getCurrentUser(): { id: string; publicKey: string } | null {
    const session = this.getSession()
    return session?.user ?? null
  }
}

// Hook for React components
export function useAuth() {
  const session = BitcoinAuth.getSession()
  
  return {
    user: session?.user ?? null,
    isAuthenticated: session?.isAuthenticated ?? false,
    login: BitcoinAuth.authenticate,
    logout: BitcoinAuth.logout
  }
}