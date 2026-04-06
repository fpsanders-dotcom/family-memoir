import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ohzikpdbuhdaqrzscoxu.supabase.co'
const supabaseAnonKey = 'sb_publishable_5xBXzSwlU9WP88nd4pX2BA_klBTf0SN'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
