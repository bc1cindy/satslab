import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    
    // Create the function to get accurate unique user count
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Function to get accurate unique user count from all sessions
        CREATE OR REPLACE FUNCTION get_unique_user_count()
        RETURNS integer AS $$
        BEGIN
          RETURN (
            SELECT COUNT(DISTINCT user_id) 
            FROM user_sessions 
            WHERE user_id LIKE 'session_%'
          );
        END;
        $$ LANGUAGE plpgsql;

        -- Grant execute permission
        GRANT EXECUTE ON FUNCTION get_unique_user_count() TO anon, authenticated;
      `
    })
    
    if (error) {
      console.error('Error creating function:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Function created successfully' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}