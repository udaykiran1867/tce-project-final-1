import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_SERVICE_KEY) {
  throw new Error('Supabase env variables missing');
}

const authOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_SERVICE_KEY,
  authOptions
);

export const supabaseAuth = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY || ENV.SUPABASE_SERVICE_KEY,
  authOptions
);
