import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get client IP from various headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    const xUserIp = request.headers.get('x-user-ip')
    
    // Priority order: CF-Connecting-IP > X-User-IP > X-Real-IP > X-Forwarded-For > fallback
    const ip = cfConnectingIp || 
               xUserIp ||
               realIp || 
               forwarded?.split(',')[0]?.trim() || 
               request.ip ||
               '127.0.0.1'
    
    // Also get user agent and country info if available
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const country = request.headers.get('x-vercel-ip-country') || null
    const city = request.headers.get('x-vercel-ip-city') || null
    
    return NextResponse.json({
      ip,
      userAgent,
      country,
      city,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting client IP:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get client IP',
        ip: '127.0.0.1',
        userAgent: 'unknown',
        country: null,
        city: null,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}