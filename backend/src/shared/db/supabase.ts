import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Env } from '../config/env';
import type { Database } from './database.types';

export type Db = SupabaseClient<Database>;

/**
 * The backend talks to Supabase with the service-role key, because every authorization decision is
 * made in the API. There is deliberately no fallback to the public anon key.
 */
export function createDb(env: Env): Db {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi.');
  }
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
