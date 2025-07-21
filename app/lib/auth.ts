import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { getServerSupabase } from './supabase-server'
import { securityLogger, SecurityEventType } from './security/security-logger'

// Production NextAuth config with maximum security
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Only allow Google OAuth
      if (account?.provider !== 'google') {
        return false
      }

      try {
        const supabase = getServerSupabase()
        
        // Security: Validate email format before database interaction
        if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
          securityLogger.warn(SecurityEventType.SUSPICIOUS_ACTIVITY, 'Invalid email format during authentication')
          return false
        }

        // Check if user exists (with error handling)
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id, email, name, has_pro_access, is_admin')
          .eq('email', user.email)
          .single()

        // Handle database errors securely
        if (fetchError && fetchError.code !== 'PGRST116') {
          securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Database lookup failed during auth', { 
            errorCode: fetchError.code,
            hasEmail: !!user.email 
          })
          return false
        }

        // Create new user if doesn't exist
        if (!existingUser) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([{
              email: user.email,
              name: user.name || 'User',
              google_id: account.providerAccountId,
              avatar_url: user.image,
              has_pro_access: false, // Default to false for security
              is_admin: false,      // Default to false for security
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])

          if (insertError) {
            securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to create user', { 
              errorCode: insertError.code 
            })
            return false
          }

          securityLogger.info(SecurityEventType.LOGIN_SUCCESS, 'New user created', { 
            email: user.email?.substring(0, 3) + '***' // Mask email in logs
          })
        } else {
          // Update existing user safely
          await supabase
            .from('users')
            .update({
              name: user.name || existingUser.name,
              avatar_url: user.image,
              updated_at: new Date().toISOString()
            })
            .eq('email', user.email)

          securityLogger.info(SecurityEventType.LOGIN_SUCCESS, 'User authenticated', { 
            email: user.email?.substring(0, 3) + '***',
            hasProAccess: !!existingUser.has_pro_access
          })
        }

        return true
      } catch (error) {
        securityLogger.error(SecurityEventType.LOGIN_FAILURE, 'Authentication callback failed', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
        return false
      }
    },

    async session({ session }) {
      // Security: Always fetch fresh user data from database
      if (session.user?.email) {
        try {
          const supabase = getServerSupabase()
          
          const { data: user, error } = await supabase
            .from('users')
            .select('id, has_pro_access, is_admin')
            .eq('email', session.user.email)
            .single()

          if (user && !error) {
            // Explicit security checks to prevent privilege escalation
            (session.user as any).id = user.id
            ;(session.user as any).hasProAccess = user.has_pro_access === true
            ;(session.user as any).isAdmin = user.is_admin === true
          } else {
            // Security: Default to no privileges if database error
            ;(session.user as any).hasProAccess = false
            ;(session.user as any).isAdmin = false
          }
        } catch (error) {
          // Security: Default to no privileges on any error
          ;(session.user as any).hasProAccess = false
          ;(session.user as any).isAdmin = false
          
          securityLogger.warn(SecurityEventType.SYSTEM_ERROR, 'Session callback error', {
            hasEmail: !!session.user?.email
          })
        }
      }
      
      return session
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error'
  }
}