import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

// Step-by-step approach: Start with basic working config
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
      
      // For now, just allow all Google users
      // We'll add Supabase integration after confirming this works
      return true
    },
    
    async session({ session }) {
      // Check Pro access from database
      if (session.user?.email) {
        try {
          const { getServerSupabase } = await import('./supabase-server')
          const supabase = getServerSupabase()
          
          const { data: user } = await supabase
            .from('users')
            .select('id, has_pro_access, is_admin')
            .eq('email', session.user.email)
            .single()

          if (user) {
            (session.user as any).id = user.id
            ;(session.user as any).hasProAccess = user.has_pro_access === true
            ;(session.user as any).isAdmin = user.is_admin === true
          } else {
            // Default if user not found
            ;(session.user as any).hasProAccess = false
            ;(session.user as any).isAdmin = false
          }
        } catch (error) {
          // Default if database error
          ;(session.user as any).hasProAccess = false
          ;(session.user as any).isAdmin = false
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