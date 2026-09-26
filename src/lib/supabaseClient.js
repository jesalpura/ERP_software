import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[TCIT ERP] Supabase credentials not found in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).\n' +
    'The app will operate using local mock data fallback. Add your Supabase keys to .env.local to enable live database syncing.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
