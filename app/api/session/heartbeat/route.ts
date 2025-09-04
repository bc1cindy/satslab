import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/client'

const sessionUpdateMap = new Map<string, number>()
const RATE_LIMIT_MS = 10000 // 10 seconds minimum between updates per session

export async function POST(request: NextRequest) {
  try {
    const { sessionId, duration } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Rate limiting per session
    const now = Date.now()
    const lastUpdate = sessionUpdateMap.get(sessionId)
    if (lastUpdate && (now - lastUpdate) < RATE_LIMIT_MS) {
      return NextResponse.json({ success: true, rateLimited: true })
    }

    sessionUpdateMap.set(sessionId, now)
    
    const supabase = createClient()
    
    // Update session duration periodically with error handling
    const { error } = await supabase
      .from('user_sessions')
      .update({
        total_duration_seconds: Math.floor(duration / 1000),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
    
    if (error) {
      // Don't log database errors to console to reduce noise
      return NextResponse.json({ success: true, dbError: true })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    // Return success to avoid client-side errors but don't process
    return NextResponse.json({ success: true, error: true })
  }
}