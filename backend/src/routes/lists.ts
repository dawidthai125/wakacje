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
    const { data: lists, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Błąd GET /lists:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(toCamelCase(lists || []));
  } catch (err) {
    console.error('❌ Wyjątek GET /lists:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = await getDatabase();

    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();

    if (listError || !list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const { data: listOffers, error: offersError } = await supabase
      .from('list_offers')
      .select(`
        id,
        list_id,
        offer_id,
        offers (*)
      `)
      .eq('list_id', id);

    if (offersError) {
      console.error('❌ Błąd GET /lists/:id (offers):', offersError);
      return res.status(500).json({ error: offersError.message });
    }

    const formattedOffers = listOffers?.map((lo: any) => ({
      ...toCamelCase(lo.offers),
      id: lo.id,
      listId: lo.list_id,
      offerId: lo.offer_id,
    })) || [];

    res.json({ ...toCamelCase(list), offers: formattedOffers });
  } catch (err) {
    console.error('❌ Wyjątek GET /lists/:id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, ownerName } = req.body;
    const supabase = await getDatabase();
    const id = uuidv4();

    const listData = toSnakeCase({ id, name, ownerName });

    const { data: newList, error } = await supabase
      .from('lists')
      .insert([listData])
      .select()
      .single();

    if (error) {
      console.error('❌ Błąd POST /lists:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(toCamelCase(newList));
  } catch (err) {
    console.error('❌ Wyjątek POST /lists:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:listId/offers', async (req, res) => {
  try {
    const { listId } = req.params;
    const { offerId } = req.body;
    const supabase = await getDatabase();
    const id = uuidv4();

    const { data: newListOffer, error } = await supabase
      .from('list_offers')
      .insert([{ id, list_id: listId, offer_id: offerId }])
      .select()
      .single();

    if (error) {
      console.error('❌ Błąd POST /lists/:listId/offers:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(toCamelCase(newListOffer));
  } catch (err) {
    console.error('❌ Wyjątek POST /lists/:listId/offers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:listId/offers/:listOfferId', async (req, res) => {
  try {
    const { listOfferId } = req.params;
    const supabase = await getDatabase();
    const { error } = await supabase.from('list_offers').delete().eq('id', listOfferId);

    if (error) {
      console.error('❌ Błąd DELETE /lists/:listId/offers/:listOfferId:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(204).send();
  } catch (err) {
    console.error('❌ Wyjątek DELETE /lists/:listId/offers/:listOfferId:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
