import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Rozwiązanie problemu z certyfikatami
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Połączenie z bazą danych Supabase
const connectionString = `postgresql://postgres:Dawidneon1990@db.zbcwrorchnxhvyowfqdk.supabase.co:6543/postgres?sslmode=require`;

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function init() {
  try {
    await client.connect();
    console.log('✅ Połączono z Supabase PostgreSQL!');

    // Odczytaj wszystkie pliki z folderu migrations
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    if (files.length === 0) {
      console.log('ℹ️ Brak plików migracji do wykonania!');
      return;
    }

    console.log(`📝 Znaleziono ${files.length} plików migracji:`);

    for (const file of files) {
      console.log(`  - ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
    }

    console.log('\n✅ Wszystkie migracje zostały wykonane pomyślnie!');

  } catch (error) {
    console.error('❌ Błąd podczas wykonywania migracji:', error);
  } finally {
    await client.end();
  }
}

init();
