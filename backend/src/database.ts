import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function initDatabase() {
  console.log('✅ Połączono z Supabase!');
  return supabase;
}

export async function getDatabase() {
  return supabase;
}
