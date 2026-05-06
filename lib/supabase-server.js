import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mjsgoaazkctbhweotizn.supabase.co"
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, serviceRoleKey || 'dummy-key', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Lazy validation — only throws when a query is actually attempted
const originalFrom = supabase.from.bind(supabase)
supabase.from = function (table) {
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env.local and restart the dev server.')
  }
  return originalFrom(table)
}