import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function GET(request: Request) {
  try {
    console.log('Analytics API called at:', new Date().toISOString())
    
    // Force no-cache headers
    const headers = new Headers({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    })
    
    const supabase = createServerClient()
    
    // Get module analytics data correctly
    const moduleAnalytics = []
    
    for (let moduleId = 1; moduleId <= 7; moduleId++) {
      // Get unique users who started this module - ALL TIME (historical analysis)
      const { data: moduleStartUsers, error: startUsersError } = await supabase
        .from('user_events')
        .select('user_id')
        .eq('module_id', moduleId)
        .eq('event_type', 'module_start')
        .like('user_id', 'session_%')
      
      // Get module completions - ALL TIME (historical analysis)
      const { data: completions, error: completionsError } = await supabase
        .from('user_events')
        .select('user_id')
        .eq('module_id', moduleId)
        .eq('event_type', 'module_complete')
        .like('user_id', 'session_%')
      
      // Get all starts for counting - ALL TIME
      const { data: starts, error: startsError } = await supabase
        .from('user_events')
        .select('*')
        .eq('module_id', moduleId)
        .eq('event_type', 'module_start')
        .like('user_id', 'session_%')
      
      // Get task completions - ALL TIME
      const { data: tasks, error: tasksError } = await supabase
        .from('user_events')
        .select('*')
        .eq('module_id', moduleId)
        .eq('event_type', 'task_complete')
        .like('user_id', 'session_%')
      
      // Get badges earned - ALL TIME
      const { data: badges, error: badgesError } = await supabase
        .from('user_events')
        .select('*')
        .eq('module_id', moduleId)
        .eq('event_type', 'badge_earned')
        .like('user_id', 'session_%')
      
      if (startUsersError || completionsError || startsError || tasksError || badgesError) {
        console.error('Error fetching module data:', {
          startUsersError,
          completionsError,
          startsError,
          tasksError,
          badgesError
        })
      }
      
      // Count unique users who started vs completed
      const uniqueStarterIds = new Set(moduleStartUsers?.map(u => u.user_id) || [])
      const uniqueCompleterIds = new Set(completions?.map(u => u.user_id) || [])
      
      // For total unique users, count anyone who either started OR completed
      const allUniqueUsers = new Set<string>()
      uniqueStarterIds.forEach(id => allUniqueUsers.add(id))
      uniqueCompleterIds.forEach(id => allUniqueUsers.add(id))
      
      const uniqueCompleters = uniqueCompleterIds.size
      const startCount = starts?.length || 0
      const taskCount = tasks?.length || 0
      const badgeCount = badges?.length || 0
      
      // Calculate completion rate: unique completers / total unique users * 100
      // This handles cases where someone completed without a recorded start
      const completionRate = allUniqueUsers.size > 0 
        ? (uniqueCompleters / allUniqueUsers.size) * 100 
        : 0
      
      const moduleData = {
        module_id: moduleId,
        unique_users: allUniqueUsers.size, // Total unique users (started OR completed)
        module_starts: startCount,
        module_completions: uniqueCompleters,
        task_completions: taskCount,
        badges_earned: badgeCount,
        completion_rate: Math.round(completionRate * 10) / 10 // Round to 1 decimal
      }
      
      // Log Module 6 data for debugging
      if (moduleId === 6) {
        console.log('Module 6 data:', moduleData)
      }
      
      moduleAnalytics.push(moduleData)
    }
    
    // Get platform stats
    console.log('Fetching sessions from database...')
    
    // First, let's get the total count to see if there's a limit issue
    const { count: totalCount, error: countError } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .like('user_id', 'session_%')
    
    console.log('Total count from database:', totalCount)
    
    // Use count for total sessions instead of fetching all data
    // This avoids the limit issue completely
    const { count: sessionCount, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .like('user_id', 'session_%')
    
    // Get ALL unique users count - fallback to counting from events if RPC fails
    let uniqueUserCount = null
    try {
      const { data: uniqueUsersData, error: uniqueUsersError } = await supabase
        .rpc('get_unique_user_count')
      
      if (!uniqueUsersError && uniqueUsersData) {
        uniqueUserCount = uniqueUsersData
        console.log('Unique users from RPC:', uniqueUserCount)
      }
    } catch (e) {
      console.log('RPC function not available, using fallback method')
    }
    
    // Fallback: use SQL to count distinct users directly
    if (uniqueUserCount === null) {
      try {
        // Count ALL unique users who ever used the platform (since beginning)
        // This gives us the historical total of unique visitors who consented to analytics
        const { data: patternCheck, error: patternError } = await supabase
          .rpc('exec_sql', { 
            sql: `
              SELECT 
                COUNT(DISTINCT user_id) as total_unique_users_ever,
                COUNT(DISTINCT CASE WHEN user_id LIKE 'session_%' THEN user_id END) as session_pattern_users,
                COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN user_id END) as users_24h,
                COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN user_id END) as users_7d
              FROM user_sessions
            ` 
          })
        
        if (!patternError && patternCheck && patternCheck.length > 0) {
          console.log('Historical user analytics:', patternCheck[0])
          
          // Total unique users since the beginning (everyone who ever accepted analytics)
          uniqueUserCount = patternCheck[0].total_unique_users_ever || 0
          
          console.log('Total unique users since beginning:', uniqueUserCount)
        } else {
          // Fallback to session-only count
          const { data: sqlResult, error: sqlError } = await supabase
            .rpc('exec_sql', { 
              sql: "SELECT COUNT(DISTINCT user_id) as count FROM user_sessions WHERE user_id LIKE 'session_%'" 
            })
          
          if (!sqlError && sqlResult && sqlResult.length > 0) {
            uniqueUserCount = sqlResult[0].count
            console.log('Unique users from SQL count (fallback):', uniqueUserCount)
          }
        }
      } catch (e) {
        console.log('SQL count failed, using data fetch fallback')
      }
      
      // If SQL fails, try fetching data (less reliable due to limits)
      if (uniqueUserCount === null) {
        const { data: allSessions, error: allSessionsError } = await supabase
          .from('user_sessions')
          .select('user_id')
          .like('user_id', 'session_%')
        
        if (!allSessionsError && allSessions) {
          uniqueUserCount = new Set(allSessions.map(s => s.user_id)).size
          console.log('Unique users from sessions data (may be limited):', uniqueUserCount)
        }
      }
    }
    
    // For other calculations, we still need the session data
    const { data: sessionData, error: sessionDataError } = await supabase
      .from('user_sessions')
      .select('user_id, created_at, total_duration_seconds, geolocation, session_end')
      .like('user_id', 'session_%')
      .range(0, 9999) // Get sample for calculations
    
    console.log(`Total sessions count: ${sessionCount}`)
    console.log(`Session data returned: ${sessionData?.length || 0} sessions`)
    if (sessionsError || sessionDataError) {
      console.error('Error fetching sessions:', sessionsError, sessionDataError)
    }
    
    const { data: walletEvents, error: walletError } = await supabase
      .from('user_events')
      .select('*')
      .eq('event_type', 'wallet_created')
      .like('user_id', 'session_%')
    
    const { data: moduleCompleteEvents, error: moduleError } = await supabase
      .from('user_events')
      .select('*')
      .eq('event_type', 'module_complete')
    
    const { data: badgeEvents, error: badgeError } = await supabase
      .from('user_events')
      .select('*')
      .eq('event_type', 'badge_earned')
    
    if (sessionsError || walletError || moduleError || badgeError) {
      console.error('Error fetching platform stats:', {
        sessionsError,
        walletError,
        moduleError,
        badgeError
      })
    }
    
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Use the accurate unique users count from our calculation
    const totalUsers = uniqueUserCount || new Set(sessionData?.map(s => s.user_id) || []).size
    
    // For 24h and 7d active users, try to use SQL data if available
    let activeUsers24h = 0
    let activeUsers7d = 0
    
    // Try to get accurate 24h/7d counts from our SQL query
    if (uniqueUserCount !== null) {
      try {
        const { data: activityData, error: activityError } = await supabase
          .rpc('exec_sql', { 
            sql: `
              SELECT 
                COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN user_id END) as users_24h,
                COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN user_id END) as users_7d
              FROM user_sessions
            ` 
          })
        
        if (!activityError && activityData && activityData.length > 0) {
          activeUsers24h = activityData[0].users_24h || 0
          activeUsers7d = activityData[0].users_7d || 0
          console.log('Activity from SQL:', { activeUsers24h, activeUsers7d })
        }
      } catch (e) {
        console.log('Failed to get activity data from SQL, using fallback')
      }
    }
    
    // Fallback to session data sample if SQL failed
    if (activeUsers24h === 0 && activeUsers7d === 0) {
      activeUsers24h = new Set(
        sessionData?.filter(s => new Date(s.created_at) >= oneDayAgo)
          .map(s => s.user_id) || []
      ).size
      activeUsers7d = new Set(
        sessionData?.filter(s => new Date(s.created_at) >= sevenDaysAgo)
          .map(s => s.user_id) || []
      ).size
      console.log('Activity from sample data:', { activeUsers24h, activeUsers7d })
    }
    
    // Debug logging
    console.log('Final user count calculation:', {
      uniqueUserCountFromRPC: uniqueUserCount,
      sessionDataSample: sessionData?.length || 0,
      finalTotalUsers: totalUsers,
      moduleUniqueUsers: moduleAnalytics.reduce((sum, m) => sum + m.unique_users, 0)
    })
    
    // Use the accurate count instead of limited data length
    const totalSessions = sessionCount || 0
    console.log(`Total sessions found: ${totalSessions} at ${new Date().toISOString()}`)
    
    // Calculate average session duration from ALL sessions (not just sample)
    let avgSessionDuration = 0
    
    try {
      // Get ALL sessions with duration data for accurate average
      const { data: allSessionsWithDuration, error: durationError } = await supabase
        .from('user_sessions')
        .select('total_duration_seconds')
        .not('total_duration_seconds', 'is', null)
        .gt('total_duration_seconds', 0)
      
      if (!durationError && allSessionsWithDuration && allSessionsWithDuration.length > 0) {
        const totalDuration = allSessionsWithDuration.reduce((sum, s) => sum + s.total_duration_seconds, 0)
        avgSessionDuration = totalDuration / allSessionsWithDuration.length
        
        console.log('Session duration from ALL data:', {
          totalSessionsWithDuration: allSessionsWithDuration.length,
          avgDurationSeconds: Math.round(avgSessionDuration),
          avgDurationMinutes: Math.round(avgSessionDuration / 60)
        })
      } else {
        // Fallback to sample data
        const sessionsWithDuration = sessionData?.filter(s => 
          s.total_duration_seconds && s.total_duration_seconds > 0
        ) || []
        
        avgSessionDuration = sessionsWithDuration.length > 0
          ? sessionsWithDuration.reduce((sum, s) => sum + s.total_duration_seconds, 0) / sessionsWithDuration.length
          : 0
        
        console.log('Session duration from sample fallback:', {
          sessionsWithDuration: sessionsWithDuration.length,
          avgDurationSeconds: Math.round(avgSessionDuration),
          avgDurationMinutes: Math.round(avgSessionDuration / 60)
        })
      }
    } catch (e) {
      console.log('Failed to get duration data, using sample fallback')
      avgSessionDuration = 0
    }
    
    // For active sessions, we need to use the sessionData sample
    // This might not be 100% accurate but close enough for dashboard
    const activeSessions = sessionData?.filter(s => !s.session_end)?.length || 0
    
    // Get ALL session data with geolocation to get accurate counts
    let geolocationStats: Array<{country: string, count: number, percentage: number}> = []
    
    console.log('Fetching ALL geolocation data...')
    
    // Get ALL sessions with geolocation data (not limited sample)
    const { data: allGeoSessions, error: allGeoError } = await supabase
      .from('user_sessions')
      .select('user_id, geolocation')
      .not('geolocation', 'is', null)
    
    console.log('All geo sessions fetched:', {
      count: allGeoSessions?.length || 0,
      error: allGeoError
    })
    
    if (!allGeoError && allGeoSessions && allGeoSessions.length > 0) {
      const countryUserStats = new Map<string, Set<string>>()
      
      // Process ALL geolocation data
      allGeoSessions.forEach(session => {
        if (session.geolocation?.country && session.user_id) {
          let country = session.geolocation.country
          // Normalize country names
          if (country === 'Brazil') country = 'Brasil'
          
          if (!countryUserStats.has(country)) {
            countryUserStats.set(country, new Set())
          }
          countryUserStats.get(country)!.add(session.user_id)
        }
      })
      
      // Calculate total unique users with geolocation
      const totalUsersWithGeo = new Set(
        allGeoSessions
          .filter(s => s.geolocation?.country)
          .map(s => s.user_id)
      ).size
      
      geolocationStats = Array.from(countryUserStats.entries())
        .map(([country, userSet]) => ({
          country,
          count: userSet.size,
          percentage: totalUsersWithGeo > 0 ? (userSet.size / totalUsersWithGeo) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
      
      console.log('Geolocation from ALL data:', {
        totalWithGeo: totalUsersWithGeo,
        totalSessions: allGeoSessions.length,
        countries: geolocationStats.length,
        topCountries: geolocationStats.slice(0, 3)
      })
    } else {
      console.log('Failed to get ALL geolocation data, using sample fallback')
      // Fallback to limited session data
      const geoSessionsWithLocation = sessionData?.filter(s => s.geolocation?.country) || []
      
      if (geoSessionsWithLocation.length > 0) {
        const countryUserStats = new Map<string, Set<string>>()
        
        geoSessionsWithLocation.forEach(session => {
          if (session.geolocation?.country && session.user_id) {
            let country = session.geolocation.country
            if (country === 'Brazil') country = 'Brasil'
            
            if (!countryUserStats.has(country)) {
              countryUserStats.set(country, new Set())
            }
            countryUserStats.get(country)!.add(session.user_id)
          }
        })
        
        const totalUsersWithGeo = new Set(geoSessionsWithLocation.map(s => s.user_id)).size
        
        geolocationStats = Array.from(countryUserStats.entries())
          .map(([country, userSet]) => ({
            country,
            count: userSet.size,
            percentage: totalUsersWithGeo > 0 ? (userSet.size / totalUsersWithGeo) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
        
        console.log('Geolocation from sample fallback:', {
          totalWithGeo: totalUsersWithGeo,
          countries: geolocationStats.length
        })
      }
    }
    
    // Log wallet events for debugging
    console.log('Wallet events:', {
      total: walletEvents?.length || 0,
      sessionUsers: walletEvents?.filter(e => e.user_id.startsWith('session_')).length || 0
    })
    
    const response = NextResponse.json({
      success: true,
      moduleAnalytics,
      geolocationStats,
      platformStats: {
        total_users: totalUsers,
        active_users_24h: activeUsers24h,
        active_users_7d: activeUsers7d,
        total_sessions: totalSessions,
        active_sessions: activeSessions,
        avg_session_duration: Math.round(avgSessionDuration),
        total_modules_completed: moduleCompleteEvents?.length || 0,
        total_badges_earned: badgeEvents?.length || 0,
        total_wallets_created: walletEvents?.length || 0
      }
    })

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Analytics data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}