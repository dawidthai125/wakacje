import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-wakacje-key';

// Helper to convert snake_case to camelCase (already used in other routes)
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc: any, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

// 1. Sprawdź telefon / Logowanie
router.post('/check-phone', async (req, res) => {
  const { phone } = req.body;
  console.log('--- Auth Check Phone ---');
  console.log('Phone:', phone);
  
  if (!phone) return res.status(400).json({ error: 'Numer telefonu jest wymagany' });

  try {
    const supabase = await getDatabase();
    console.log('Connected to Supabase');

    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle(); // Używamy maybeSingle zamiast single, żeby nie rzucało błędu gdy nie ma rekordów

    if (error) {
      console.error('Supabase error (fetch profile):', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Profile found:', profile);

    // Jeśli profil nie istnieje, stwórz go (pierwsze logowanie)
    if (!profile) {
      console.log('Creating new profile for:', phone);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{ phone }])
        .select()
        .single();
      
      if (createError) {
        console.error('Supabase error (create profile):', createError);
        return res.status(500).json({ error: createError.message });
      }
      
      console.log('New profile created:', newProfile);
      return res.json({ exists: false, profile: toCamelCase(newProfile) });
    }

    return res.json({ exists: true, isInitialized: profile.is_initialized, profile: toCamelCase(profile) });
  } catch (err) {
    console.error('Catch block error:', err);
    res.status(500).json({ error: 'Błąd serwera: ' + (err as Error).message });
  }
});


// 2. Ustaw PIN (dla nowych użytkowników)
router.post('/setup-pin', async (req, res) => {
  const { phone, pin } = req.body;
  if (!phone || !pin) return res.status(400).json({ error: 'Telefon i PIN są wymagane' });

  try {
    const supabase = await getDatabase();
    const pinHash = await bcrypt.hash(pin, 10);

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ pin_hash: pinHash, is_initialized: true })
      .eq('phone', phone)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const token = jwt.sign({ id: profile.id, phone: profile.phone }, JWT_SECRET);
    res.json({ token, profile: toCamelCase(profile) });
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas ustawiania PINu' });
  }
});

// 3. Logowanie PINem
router.post('/login', async (req, res) => {
  const { phone, pin } = req.body;
  if (!phone || !pin) return res.status(400).json({ error: 'Telefon i PIN są wymagane' });

  try {
    const supabase = await getDatabase();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !profile) return res.status(401).json({ error: 'Nieprawidłowy telefon lub PIN' });
    if (!profile.pin_hash) return res.status(400).json({ error: 'PIN nie został jeszcze ustawiony' });

    const isMatch = await bcrypt.compare(pin, profile.pin_hash);
    if (!isMatch) return res.status(401).json({ error: 'Nieprawidłowy telefon lub PIN' });

    const token = jwt.sign({ id: profile.id, phone: profile.phone }, JWT_SECRET);
    res.json({ token, profile: toCamelCase(profile) });
  } catch (err) {
    res.status(500).json({ error: 'Błąd logowania' });
  }
});

// 4. Aktualizacja profilu
router.put('/profile', async (req, res) => {
  const { id, firstName, lastName } = req.body;
  if (!id) return res.status(400).json({ error: 'ID użytkownika jest wymagane' });

  try {
    const supabase = await getDatabase();
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(toCamelCase(profile));
  } catch (err) {
    res.status(500).json({ error: 'Błąd aktualizacji profilu' });
  }
});

export default router;
