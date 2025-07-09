import { NextRequest, NextResponse } from 'next/server'
import { CookieSessionManager } from '@/app/lib/session/cookie-session'
import { createClient } from '@/app/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    // Get or create session
    const existingSession = CookieSessionManager.getSessionFromRequest(request)
    
    let sessionData = existingSession
    if (!sessionData || CookieSessionManager.isSessionExpired(sessionData)) {
      // Create new session
      sessionData = await CookieSessionManager.getOrCreateSession()
      
      // Save session to database
      const supabase = createClient()
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          id: sessionData.sessionId,
          user_id: sessionData.sessionId, // Using sessionId as user_id for anonymous users
          session_start: new Date(sessionData.createdAt).toISOString(),
          ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      request.ip || 
                      null,
          user_agent: request.headers.get('user-agent'),
          pages_visited: []
        })
      
      if (error) {
        console.error('Failed to save session to database:', error)
      }
    }
    
    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      sessionId: sessionData.sessionId,
      isAnonymous: sessionData.isAnonymous
    })
    
    // Set cookie
    CookieSessionManager.setSessionCookie(response, sessionData)
    
    return response
  } catch (error) {
    console.error('Session initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize session' },
      { status: 500 }
    )
  }
}