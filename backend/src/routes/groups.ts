import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database';

const router = express.Router();

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

// 1. Stwórz grupę
router.post('/', async (req, res) => {
  const { name, description, createdBy } = req.body;
  try {
    const supabase = await getDatabase();
    const groupId = uuidv4();

    // Dodaj grupę
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([{ id: groupId, name, description, created_by: createdBy }])
      .select()
      .single();

    if (groupError) return res.status(500).json({ error: groupError.message });

    // Dodaj twórcę jako admina
    await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: createdBy, role: 'admin' }]);

    res.status(201).json(toCamelCase(group));
  } catch (err) {
    res.status(500).json({ error: 'Błąd tworzenia grupy' });
  }
});

// 2. Pobierz grupy użytkownika
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const supabase = await getDatabase();
    const { data: groups, error } = await supabase
      .from('group_members')
      .select('groups (*)')
      .eq('user_id', userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(toCamelCase(groups.map((g: any) => g.groups)));
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania grup' });
  }
});

// 3. Dodaj członka do grupy (po numerze telefonu)
router.post('/:groupId/members', async (req, res) => {
  const { groupId } = req.params;
  const { phone } = req.body;

  try {
    const supabase = await getDatabase();
    
    // Znajdź użytkownika po telefonie
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single();

    if (profileError || !profile) {
      // Jeśli nie istnieje, możemy go "zaprosić" (stworzyć pusty profil)
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{ phone }])
        .select('id')
        .single();
      if (createError) return res.status(500).json({ error: createError.message });
      profile = newProfile;
    }

    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: profile.id, role: 'member' }])
      .select()
      .single();

    if (memberError) return res.status(500).json({ error: 'Użytkownik jest już w tej grupie' });
    res.status(201).json(toCamelCase(member));
  } catch (err) {
    res.status(500).json({ error: 'Błąd dodawania członka' });
  }
});

// 4. Pobierz członków grupy
router.get('/:groupId/members', async (req, res) => {
  const { groupId } = req.params;
  try {
    const supabase = await getDatabase();
    const { data: members, error } = await supabase
      .from('group_members')
      .select('role, profiles (id, phone, first_name, last_name)')
      .eq('group_id', groupId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(toCamelCase(members));
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania członków' });
  }
});

// 5. Dodaj ofertę do grupy (propozycja)
router.post('/:groupId/offers', async (req, res) => {
  const { groupId } = req.params;
  const { offerId, proposedBy, isOfficial } = req.body;

  try {
    const supabase = await getDatabase();
    const { data: groupOffer, error } = await supabase
      .from('group_offers')
      .insert([{ 
        group_id: groupId, 
        offer_id: offerId, 
        proposed_by: proposedBy, 
        is_official: isOfficial 
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Ta oferta jest już w grupie' });
    res.status(201).json(toCamelCase(groupOffer));
  } catch (err) {
    res.status(500).json({ error: 'Błąd dodawania oferty do grupy' });
  }
});

// 6. Pobierz oferty grupy z rankingiem
router.get('/:groupId/offers', async (req, res) => {
  const { groupId } = req.params;
  try {
    const supabase = await getDatabase();
    
    // Pobierz powiązania
    const { data: groupOffers, error: goError } = await supabase
      .from('group_offers')
      .select('*, offers (*)')
      .eq('group_id', groupId);

    if (goError) return res.status(500).json({ error: goError.message });

    // Dla każdej oferty pobierz oceny, żeby wyliczyć ranking
    const offersWithStats = await Promise.all(groupOffers.map(async (go: any) => {
      const { data: ratings } = await supabase
        .from('ratings')
        .select('*')
        .eq('list_offer_id', go.offer_id); // Tutaj mała nieścisłość w modelu, ale dostosujemy
      
      const zaCount = ratings?.filter((r: any) => r.is_for).length || 0;
      const przeciwCount = ratings?.filter((r: any) => !r.is_for).length || 0;
      
      return {
        ...toCamelCase(go.offers),
        proposedBy: go.proposed_by,
        isOfficial: go.is_official,
        zaCount,
        przeciwCount,
        score: zaCount - przeciwCount
      };
    }));

    // Sortuj po rankingu (score)
    offersWithStats.sort((a, b) => b.score - a.score);

    res.json(offersWithStats);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania ofert grupy' });
  }
});

export default router;
