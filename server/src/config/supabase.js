import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient = null;

if (config.supabase.url && (config.supabase.serviceRoleKey || config.supabase.anonKey)) {
  // Normalize URL to base URL (strip /rest/v1 or trailing slashes)
  const normalizedUrl = config.supabase.url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const key = config.supabase.serviceRoleKey || config.supabase.anonKey;

  supabaseClient = createClient(normalizedUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  console.log('✅ Supabase client initialized with project:', normalizedUrl);
} else {
  console.warn('⚠️ Supabase credentials not yet supplied in server/.env — running in local fallback mode.');
}

export const supabase = supabaseClient;
