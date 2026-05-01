import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mjsgoaazkctbhweotizn.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qc2dvYWF6a2N0Ymh3ZW90aXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1OTk3NzksImV4cCI6MjA5MzE3NTc3OX0.nAgAXMO1-kf7bWE6YzdRitm9VsriexhFKX1Dd12TihM"

export const supabase = createClient(supabaseUrl, supabaseKey)