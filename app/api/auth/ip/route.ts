import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== IP Authentication API Route Called ===')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
    console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Missing')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'Missing required environment variables'
      }, { status: 500 })
    }
    
    // Get the client's IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0] || realIp || '127.0.0.1'
    
    console.log('IP authentication attempt for:', ipAddress)
    console.log('Headers:', {
      'x-forwarded-for': forwarded,
      'x-real-ip': realIp
    })
    
    let supabase
    try {
      supabase = createServerClient()
      console.log('Supabase client created successfully')
    } catch (clientError) {
      console.error('Error creating Supabase client:', clientError)
      return NextResponse.json({ 
        error: 'Database connection error',
        details: clientError instanceof Error ? clientError.message : 'Unknown error'
      }, { status: 500 })
    }
    
    // Check if user exists
    console.log('Checking for existing user...')
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, ip_address')
      .eq('ip_address', ipAddress)
      .single()
    
    console.log('Fetch result:', { existingUser, fetchError })
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user by IP:', fetchError)
      return NextResponse.json({ 
        error: 'Database query error',
        details: fetchError.message
      }, { status: 500 })
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
      
      console.log('Create result:', { newUser, createError })
      
      if (createError) {
        console.error('Error creating user by IP:', createError)
        return NextResponse.json({ 
          error: 'Failed to create user',
          details: createError.message
        }, { status: 500 })
      }
      
      user = newUser
    } else {
      console.log('Updating existing user login info')
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
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}