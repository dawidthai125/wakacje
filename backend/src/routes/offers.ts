import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database';

const router = express.Router();

// Funkcja konwertująca snake_case na camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc: any, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

// Funkcja konwertująca camelCase na snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc: any, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

router.get('/', async (req, res) => {
  try {
    const supabase = await getDatabase();
    const { data: offers, error } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Błąd GET /offers:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(toCamelCase(offers || []));
  } catch (err) {
    console.error('❌ Wyjątek GET /offers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, url, price, destination, startDate, endDate, adults, children, rooms, platform } = req.body;
    const supabase = await getDatabase();
    const id = uuidv4();

    const offerData = toSnakeCase({
      id,
      title,
      url,
      price,
      destination,
      startDate,
      endDate,
      adults,
      children,
      rooms,
      platform,
    });

    const { data: newOffer, error } = await supabase
      .from('offers')
      .insert([offerData])
      .select()
      .single();

    if (error) {
      console.error('❌ Błąd POST /offers:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(toCamelCase(newOffer));
  } catch (err) {
    console.error('❌ Wyjątek POST /offers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = await getDatabase();
    const { error } = await supabase.from('offers').delete().eq('id', id);

    if (error) {
      console.error('❌ Błąd DELETE /offers/:id:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(204).send();
  } catch (err) {
    console.error('❌ Wyjątek DELETE /offers/:id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
