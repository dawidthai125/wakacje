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

router.get('/list-offer/:listOfferId', async (req, res) => {
  try {
    const { listOfferId } = req.params;
    const supabase = await getDatabase();
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('list_offer_id', listOfferId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Błąd GET /ratings/list-offer/:listOfferId:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(toCamelCase(ratings || []));
  } catch (err) {
    console.error('❌ Wyjątek GET /ratings/list-offer/:listOfferId:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { listOfferId, raterName, locationRating, priceRating, amenitiesRating, comments, isFor } = req.body;
    const supabase = await getDatabase();
    const id = uuidv4();

    const ratingData = toSnakeCase({
      id,
      listOfferId,
      raterName,
      locationRating,
      priceRating,
      amenitiesRating,
      comments,
      isFor,
    });

    const { data: newRating, error } = await supabase
      .from('ratings')
      .insert([ratingData])
      .select()
      .single();

    if (error) {
      console.error('❌ Błąd POST /ratings:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(toCamelCase(newRating));
  } catch (err) {
    console.error('❌ Wyjątek POST /ratings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
