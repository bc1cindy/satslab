import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // 1. Clean up old IP-based sessions (keeping only cookie-based sessions)
    const { data: deletedSessions } = await supabase
      .from('user_sessions')
      .delete()
      .not('id', 'like', 'session_%')
      .select('id')
    
    // 2. Clean up events from deleted sessions
    if (deletedSessions && deletedSessions.length > 0) {
      const sessionIds = deletedSessions.map(s => s.id)
      await supabase
        .from('user_events')
        .delete()
        .in('session_id', sessionIds)
    }
    
    // 3. Clean up events with IP-based user_ids (not session format)
    const { data: deletedEvents } = await supabase
      .from('user_events')
      .delete()
      .not('user_id', 'like', 'session_%')
      .select('id')
    
    // 4. Normalize country names in geolocation
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('id, geolocation')
      .not('geolocation', 'is', null)
    
    if (sessions) {
      for (const session of sessions) {
        if (session.geolocation?.country) {
          let normalizedCountry = session.geolocation.country
          
          // Normalize country names
          if (normalizedCountry.toLowerCase() === 'brazil') {
            normalizedCountry = 'Brasil'
          }
          
          if (normalizedCountry !== session.geolocation.country) {
            const updatedGeo = {
              ...session.geolocation,
              country: normalizedCountry
            }
            
            await supabase
              .from('user_sessions')
              .update({ geolocation: updatedGeo })
              .eq('id', session.id)
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      cleaned: {
        deletedSessions: deletedSessions?.length || 0,
        deletedEvents: deletedEvents?.length || 0,
        normalizedCountries: sessions?.length || 0
      }
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    )
  }
}