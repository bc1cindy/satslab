import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'
import { configManager } from './config'

/**
 * Secure Supabase Client Factory
 * SECURITY: Uses secure configuration management instead of direct env access
 * This file should NEVER be imported in client components
 */

// Create a cached Supabase client for server-side use with service role
export const getServerSupabase = cache(() => {
  const dbConfig = configManager.getDatabase()
  
  return createClient(
    dbConfig.url,
    dbConfig.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'x-application-name': 'satslab-server'
        }
      }
    }
  )
})

// Helper to get public Supabase client (for client components)
export const getPublicSupabase = cache(() => {
  const dbConfig = configManager.getDatabase()
  
  return createClient(
    dbConfig.url,
    dbConfig.anonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      },
      global: {
        headers: {
          'x-application-name': 'satslab-client'
        }
      }
    }
  )
})

// Type-safe database types (add your tables here)
export interface User {
  id: string
  email: string
  name?: string
  google_id?: string
  avatar_url?: string
  has_pro_access: boolean
  pro_expires_at?: string
  is_admin?: boolean
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  payment_method: string
  invoice_id?: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}