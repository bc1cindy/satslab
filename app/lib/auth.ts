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
      // Basic session - no database calls yet
      // We'll add Pro access logic after confirming login works
      if (session.user?.email) {
        // Add custom properties safely
        (session.user as any).hasProAccess = false // Default for now
        ;(session.user as any).isAdmin = false    // Default for now
      }
      
      return session
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error'
  }
}