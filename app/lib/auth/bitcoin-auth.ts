import { keyPairFromWIF, signMessage, verifySignature, validatePrivateKey, SIGNET_NETWORK } from '@/app/lib/bitcoin/crypto-mock'
import { getUserByPublicKey, createUser } from '@/app/lib/supabase/queries'

export interface AuthSession {
  user: {
    id: string
    publicKey: string
  }
  isAuthenticated: boolean
}

export class BitcoinAuth {
  private static SESSION_KEY = 'satslab_auth_session'
  
  static async authenticate(privateKey: string): Promise<AuthSession | null> {
    try {
      // Validate private key format
      if (!validatePrivateKey(privateKey, SIGNET_NETWORK)) {
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
      
      // Check if user exists, create if not
      let user = await getUserByPublicKey(keyPair.publicKey)
      if (!user) {
        user = await createUser(keyPair.publicKey)
        if (!user) {
          throw new Error('Failed to create user')
        }
      }
      
      const session: AuthSession = {
        user: {
          id: user.id,
          publicKey: user.publicKey
        },
        isAuthenticated: true
      }
      
      // Store session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
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
      const sessionData = localStorage.getItem(this.SESSION_KEY)
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