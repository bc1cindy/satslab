import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a singleton instance to avoid multiple GoTrueClient instances
let supabaseServerInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

export const createServerClient = () => {
  if (!supabaseServerInstance) {
    supabaseServerInstance = createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey)
  }
  return supabaseServerInstance
}