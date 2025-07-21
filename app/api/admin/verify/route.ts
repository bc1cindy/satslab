import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false })
    }

    console.log('Checking admin access for:', session.user.email)

    // Check if user is admin in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: user, error } = await supabase
      .from('users')
      .select('is_admin, email')
      .eq('email', session.user.email)
      .single()

    if (error || !user) {
      console.log('User not found in database:', error?.message)
      return NextResponse.json({ isAdmin: false })
    }

    // Check admin email from environment
    const adminEmail = process.env.ADMIN_EMAIL
    const isAdminEmail = adminEmail && session.user.email === adminEmail
    const isAdminInDB = user.is_admin === true

    const isAdmin = isAdminEmail && isAdminInDB

    console.log('Admin check result:', {
      email: session.user.email,
      adminEmailFromEnv: adminEmail,
      isAdminEmail,
      isAdminInDB,
      finalResult: isAdmin
    })

    return NextResponse.json({ isAdmin })

  } catch (error) {
    console.error('Error checking admin access:', error)
    return NextResponse.json({ isAdmin: false })
  }
}