import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vflppesbdymaisqvkxxj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_9IadobNwMkrZqMCeehs3cw_krlWc_CA';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
