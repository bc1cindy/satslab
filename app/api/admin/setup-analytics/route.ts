import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // 1. Create get_platform_stats function
    const platformStatsFunction = `
      CREATE OR REPLACE FUNCTION get_platform_stats()
      RETURNS TABLE (
        total_users bigint,
        active_users_24h bigint,
        active_users_7d bigint,
        total_sessions bigint,
        avg_session_duration numeric,
        total_modules_completed bigint,
        total_badges_earned bigint,
        total_wallets_created bigint
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          (SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE user_id LIKE 'session_%') as total_users,
          (SELECT COUNT(DISTINCT user_id) FROM user_sessions 
           WHERE created_at >= NOW() - INTERVAL '24 hours' AND user_id LIKE 'session_%') as active_users_24h,
          (SELECT COUNT(DISTINCT user_id) FROM user_sessions 
           WHERE created_at >= NOW() - INTERVAL '7 days' AND user_id LIKE 'session_%') as active_users_7d,
          (SELECT COUNT(*) FROM user_sessions WHERE user_id LIKE 'session_%') as total_sessions,
          (SELECT COALESCE(AVG(total_duration_seconds), 0) FROM user_sessions 
           WHERE total_duration_seconds > 0 AND user_id LIKE 'session_%') as avg_session_duration,
          (SELECT COUNT(*) FROM user_events WHERE event_type = 'module_complete') as total_modules_completed,
          (SELECT COUNT(*) FROM user_events WHERE event_type = 'badge_earned') as total_badges_earned,
          (SELECT COUNT(*) FROM user_events WHERE event_type = 'wallet_created') as total_wallets_created;
      END;
      $$ LANGUAGE plpgsql;
    `
    
    // 2. Create module_analytics view
    const moduleAnalyticsView = `
      CREATE OR REPLACE VIEW module_analytics AS
      WITH module_stats AS (
        SELECT 
          module_id,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(CASE WHEN event_type = 'module_start' THEN 1 END) as module_starts,
          COUNT(CASE WHEN event_type = 'module_complete' THEN 1 END) as module_completions,
          COUNT(CASE WHEN event_type = 'task_complete' THEN 1 END) as task_completions,
          COUNT(CASE WHEN event_type = 'badge_earned' THEN 1 END) as badges_earned
        FROM user_events 
        WHERE module_id IS NOT NULL 
          AND user_id LIKE 'session_%'
          AND module_id BETWEEN 1 AND 7
        GROUP BY module_id
      )
      SELECT 
        generate_series(1, 7) as module_id,
        COALESCE(ms.unique_users, 0) as unique_users,
        COALESCE(ms.module_starts, 0) as module_starts,
        COALESCE(ms.module_completions, 0) as module_completions,
        COALESCE(ms.task_completions, 0) as task_completions,
        COALESCE(ms.badges_earned, 0) as badges_earned,
        CASE 
          WHEN COALESCE(ms.unique_users, 0) = 0 THEN 0.0
          ELSE (COALESCE(ms.module_completions, 0)::numeric / ms.unique_users::numeric) * 100
        END as completion_rate
      FROM module_stats ms 
      RIGHT JOIN generate_series(1, 7) s(module_id) ON ms.module_id = s.module_id
      ORDER BY module_id;
    `
    
    // 3. Create realtime_analytics view
    const realtimeAnalyticsView = `
      CREATE OR REPLACE VIEW realtime_analytics AS
      SELECT 
        (SELECT COUNT(DISTINCT user_id) FROM user_sessions 
         WHERE session_start >= NOW() - INTERVAL '1 hour' AND user_id LIKE 'session_%') as active_users,
        (SELECT COUNT(*) FROM user_sessions 
         WHERE session_end IS NULL AND user_id LIKE 'session_%') as active_sessions,
        (SELECT COUNT(DISTINCT user_id) FROM user_sessions 
         WHERE created_at >= NOW() - INTERVAL '24 hours' AND user_id LIKE 'session_%') as daily_active_users,
        (SELECT COUNT(DISTINCT user_id) FROM user_sessions 
         WHERE created_at >= NOW() - INTERVAL '7 days' AND user_id LIKE 'session_%') as weekly_active_users,
        (SELECT COALESCE(AVG(total_duration_seconds), 0) FROM user_sessions 
         WHERE total_duration_seconds > 0 AND user_id LIKE 'session_%') as avg_session_duration;
    `
    
    // Execute SQL commands
    const { error: functionError } = await supabase.rpc('exec_sql', { sql: platformStatsFunction })
    if (functionError) {
      console.error('Function creation error:', functionError)
    }
    
    const { error: moduleViewError } = await supabase.rpc('exec_sql', { sql: moduleAnalyticsView })
    if (moduleViewError) {
      console.error('Module view creation error:', moduleViewError)
    }
    
    const { error: realtimeViewError } = await supabase.rpc('exec_sql', { sql: realtimeAnalyticsView })
    if (realtimeViewError) {
      console.error('Realtime view creation error:', realtimeViewError)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Analytics views and functions created successfully',
      errors: {
        function: functionError?.message,
        moduleView: moduleViewError?.message,
        realtimeView: realtimeViewError?.message
      }
    })
  } catch (error) {
    console.error('Setup analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to setup analytics' },
      { status: 500 }
    )
  }
}