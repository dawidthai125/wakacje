import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    console.log('Próba pobrania offers...');
    const { data, error } = await supabase.from('offers').select('*');
    console.log('Odpowiedź:', { data, error });
  } catch (err) {
    console.error('Błąd:', err);
  }
}

test();
