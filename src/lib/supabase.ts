// src/lib/supabase.ts (fixed version)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if environment variables are loaded
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined. Check your .env.local file.')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Check your .env.local file.')
}

// Client for browser usage (disable realtime to avoid import issues)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  global: {
    headers: {},
  },
})

// Admin client with service role key for server-side operations
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    })
  : null

// Helper function to set admin user context
export const setAdminContext = async (adminUserId: string) => {
  if (!supabaseAdmin) return
  
  const { error } = await supabaseAdmin.rpc('set_config', {
    setting_name: 'app.current_admin_user_id',
    setting_value: adminUserId,
    is_local: true
  })
  
  if (error) {
    console.error('Error setting admin context:', error)
  }
}