import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { getServerSupabase } from './supabase-server'
import { securityLogger, SecurityEventType } from './security/security-logger'
import { configManager } from './config'

// Get secure authentication configuration
const authConfig = configManager.getAuth()

export const authOptions: NextAuthOptions = {
  secret: authConfig.nextAuthSecret,
  providers: [
    GoogleProvider({
      clientId: authConfig.googleClientId,
      clientSecret: authConfig.googleClientSecret,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        try {
          const supabase = getServerSupabase()
          
          // Check if user exists in Supabase
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          if (fetchError && fetchError.code !== 'PGRST116') {
            securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Database user lookup failed during authentication', { errorCode: fetchError.code })
            return false
          }

          // If user doesn't exist, create them
          if (!existingUser) {
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  email: user.email,
                  name: user.name,
                  google_id: account.providerAccountId,
                  avatar_url: user.image,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ])

            if (insertError) {
              securityLogger.error(SecurityEventType.SYSTEM_ERROR, 'Failed to create new user account', { errorCode: insertError.code })
              return false
            }
          } else {
            // Update existing user info
            const { error: updateError } = await supabase
              .from('users')
              .update({
                name: user.name,
                avatar_url: user.image,
                updated_at: new Date().toISOString()
              })
              .eq('email', user.email)

            if (updateError) {
              securityLogger.warn(SecurityEventType.SYSTEM_ERROR, 'Failed to update user information', { errorCode: updateError.code })
            }
          }

          return true
        } catch (error) {
          securityLogger.error(SecurityEventType.LOGIN_FAILURE, 'Authentication callback failed', { error: error instanceof Error ? error.message : 'Unknown error' })
          return false
        }
      }
      return true
    },
    async session({ session, token }: any) {
      if (session.user?.email) {
        const supabase = getServerSupabase()
        
        // Fetch user from Supabase
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single()

        if (user) {
          session.user.id = user.id
          // Explicit boolean validation to prevent privilege escalation
          session.user.hasProAccess = user.has_pro_access === true
          session.user.isAdmin = user.is_admin === true
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  }
}