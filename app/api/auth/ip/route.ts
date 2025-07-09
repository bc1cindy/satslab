import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Get the client's IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0] || realIp || '127.0.0.1'
    
    console.log('IP authentication attempt for:', ipAddress)
    
    const supabase = createServerClient()
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, ip_address')
      .eq('ip_address', ipAddress)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user by IP:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    let user = existingUser
    
    // If user doesn't exist, create one
    if (!user) {
      console.log('Creating new user for IP:', ipAddress)
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          public_key: `ip_${ipAddress}_${Date.now()}`,
          ip_address: ipAddress,
          last_login_ip: ipAddress,
          last_login_at: new Date().toISOString()
        }])
        .select('id, ip_address')
        .single()
      
      if (createError) {
        console.error('Error creating user by IP:', createError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      
      user = newUser
    } else {
      // Update last login info
      await supabase
        .from('users')
        .update({
          last_login_ip: ipAddress,
          last_login_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }
    
    console.log('IP authentication successful for user:', user.id)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        ipAddress: user.ip_address
      }
    })
    
  } catch (error) {
    console.error('IP authentication error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}