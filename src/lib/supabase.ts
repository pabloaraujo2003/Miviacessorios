import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If credentials are not present, this client will fail on requests. 
// For our implementation, we'll degrade gracefully gracefully warn if missing.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const hasSupabaseKeys = Boolean(supabaseUrl && supabaseAnonKey);
