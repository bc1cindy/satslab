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
      
      // Save/update Google user in database
      if (user.email && user.name) {
        try {
          const { getServerSupabase } = await import('./supabase-server')
          const supabase = getServerSupabase()
          
          // Upsert user (insert if new, update if exists)
          const { error } = await supabase
            .from('users')
            .upsert({
              email: user.email,
              name: user.name,
              avatar_url: user.image || null,
              provider: 'google',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'email',
              ignoreDuplicates: false
            })
          
          if (error) {
            console.error('Error saving Google user to database:', error)
            // Still allow login even if database save fails
          } else {
            console.log('Google user saved/updated successfully:', { 
              email: user.email,
              name: user.name 
            })
          }
        } catch (error) {
          console.error('Database connection error during Google login:', error)
          // Still allow login even if database error
        }
      }
      
      return true
    },
    
    async session({ session }) {
      // Check Pro access from database (with debug logging)
      if (session.user?.email) {
        try {
          const { getServerSupabase } = await import('./supabase-server')
          const supabase = getServerSupabase()
          
          const { data: user, error } = await supabase
            .from('users')
            .select('id, has_pro_access, is_admin, email')
            .eq('email', session.user.email)
            .single()

          // Debug logging
          console.log('Session callback - User query:', {
            email: session.user.email,
            found: !!user,
            hasProAccess: user?.has_pro_access,
            error: error?.message
          })

          if (user) {
            (session.user as any).id = user.id
            ;(session.user as any).hasProAccess = user.has_pro_access === true
            ;(session.user as any).isAdmin = user.is_admin === true
            
            console.log('Session updated with:', {
              hasProAccess: user.has_pro_access === true,
              isAdmin: user.is_admin === true
            })
          } else {
            // Default if user not found
            ;(session.user as any).hasProAccess = false
            ;(session.user as any).isAdmin = false
            console.log('User not found in database, defaulting to no access')
          }
        } catch (error) {
          // Default if database error
          ;(session.user as any).hasProAccess = false
          ;(session.user as any).isAdmin = false
          console.error('Database error in session callback:', error)
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