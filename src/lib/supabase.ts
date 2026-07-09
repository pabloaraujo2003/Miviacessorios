import { createClient } from '@supabase/supabase-js';
import { hasSupabaseKeys, supabaseAnonKey, supabaseUrl } from './env';

const fallbackSupabaseUrl = 'https://placeholder.supabase.co';
const fallbackSupabaseAnonKey = 'placeholder-anon-key';

export { hasSupabaseKeys };

// If credentials are not present, this client will fail on requests.
// Usado apenas pelo Admin (auth, storage, escrita) — o caminho público
// (Home/AppContext/Hero) lê os dados via REST em src/lib/products.ts para
// não carregar @supabase/supabase-js fora do chunk assíncrono do /admin.
export const supabase = createClient(
  hasSupabaseKeys ? supabaseUrl : fallbackSupabaseUrl,
  hasSupabaseKeys ? supabaseAnonKey : fallbackSupabaseAnonKey,
);
