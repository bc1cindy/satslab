import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'
import { SecureInputValidator } from '@/app/lib/security/input-validator'
import { securityMonitor } from '@/app/lib/security/security-monitor'
import { securityConfig } from '@/app/lib/security/security-config'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let ipAddress = '127.0.0.1'
  let userAgent = 'unknown'
  
  try {
    // Get client info for security monitoring
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    ipAddress = forwarded?.split(',')[0] || realIp || '127.0.0.1'
    userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Input validation for IP address
    const ipValidation = SecureInputValidator.validateInput(ipAddress, {
      required: true,
      maxLength: 45, // IPv6 max length
      pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^127\.0\.0\.1$/
    })
    
    if (!ipValidation.isValid) {
      securityMonitor.logInputValidation('ip_address', 'Invalid IP address format', ipAddress, {
        validation_errors: ipValidation.errors
      })
      return NextResponse.json({ 
        error: 'Invalid request',
        details: process.env.NODE_ENV === 'development' ? 'Invalid IP address format' : 'Request validation failed'
      }, { status: 400 })
    }
    
    // Log authentication attempt
    securityMonitor.logEvent('login_success', 'low', 'authentication', 'ip_auth', {
      ip_address: ipAddress,
      user_agent: userAgent
    })
    
    // Security headers for response
    const securityHeaders = securityConfig.getSecurityHeaders() as unknown as Record<string, string>
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      securityMonitor.logEvent('system_error', 'high', 'system', 'ip_auth', {
        error: 'Missing environment variables',
        ip_address: ipAddress
      })
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: process.env.NODE_ENV === 'development' ? 'Missing required environment variables' : 'Internal server error'
      }, { 
        status: 500,
        headers: securityHeaders
      })
    }
    
    let supabase
    try {
      supabase = createServerClient()
      
      // Log successful database connection
      securityMonitor.logEvent('data_access', 'low', 'data_access', 'ip_auth', {
        action: 'database_connection',
        ip_address: ipAddress
      })
    } catch (clientError) {
      securityMonitor.logEvent('system_error', 'high', 'system', 'ip_auth', {
        error: 'Database connection failed',
        ip_address: ipAddress,
        details: clientError instanceof Error ? clientError.message : 'Unknown error'
      })
      return NextResponse.json({ 
        error: 'Database connection error',
        details: process.env.NODE_ENV === 'development' ? 
          (clientError instanceof Error ? clientError.message : 'Unknown error') : 'Internal server error'
      }, { 
        status: 500,
        headers: securityHeaders
      })
    }
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, ip_address')
      .eq('ip_address', ipAddress)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      securityMonitor.logEvent('system_error', 'medium', 'data_access', 'ip_auth', {
        error: 'Database query error',
        ip_address: ipAddress,
        details: fetchError.message
      })
      return NextResponse.json({ 
        error: 'Database query error',
        details: process.env.NODE_ENV === 'development' ? fetchError.message : 'Internal server error'
      }, { 
        status: 500,
        headers: securityHeaders
      })
    }
    
    let user = existingUser
    
    // If user doesn't exist, create one
    if (!user) {
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
        securityMonitor.logEvent('system_error', 'high', 'data_access', 'ip_auth', {
          error: 'Failed to create user',
          ip_address: ipAddress,
          details: createError.message
        })
        return NextResponse.json({ 
          error: 'Failed to create user',
          details: process.env.NODE_ENV === 'development' ? createError.message : 'Internal server error'
        }, { 
          status: 500,
          headers: securityHeaders
        })
      }
      
      user = newUser
      
      // Log successful user creation
      securityMonitor.logEvent('session_created', 'low', 'authentication', 'ip_auth', {
        action: 'user_created',
        user_id: user.id,
        ip_address: ipAddress
      })
    } else {
      // Update last login info
      await supabase
        .from('users')
        .update({
          last_login_ip: ipAddress,
          last_login_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      // Log successful login
      securityMonitor.logEvent('login_success', 'low', 'authentication', 'ip_auth', {
        action: 'existing_user_login',
        user_id: user.id,
        ip_address: ipAddress
      })
    }
    
    // Log successful authentication
    securityMonitor.logEvent('login_success', 'low', 'authentication', 'ip_auth', {
      user_id: user.id,
      ip_address: ipAddress,
      duration: Date.now() - startTime
    })
    
    // Return success response with security headers
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        ipAddress: user.ip_address
      }
    }, {
      headers: securityHeaders
    })
    
  } catch (error) {
    // Log security error
    securityMonitor.logEvent('system_error', 'high', 'system', 'ip_auth', {
      error: 'Unhandled exception',
      ip_address: ipAddress,
      user_agent: userAgent,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    })
    
    // Return secure error response
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
    }, { 
      status: 500,
      headers: securityConfig.getSecurityHeaders() as unknown as Record<string, string>
    })
  }
}