import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { Database } from '../types/database.types';

// Load root or local .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://vflppesbdymaisqvkxxj.supabase.co';

let key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key || key.includes('your_supabase')) {
  key = process.env.SUPABASE_ANON_KEY;
}
if (!key || key.includes('your_supabase')) {
  key = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_9IadobNwMkrZqMCeehs3cw_krlWc_CA';
}

export const supabase = createClient<Database>(supabaseUrl, key!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
