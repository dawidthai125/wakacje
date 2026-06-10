-- System użytkowników i grup
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  pin_hash TEXT,
  is_initialized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin' or 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Powiązanie ofert z grupami (propozycje)
CREATE TABLE group_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  offer_id TEXT REFERENCES offers(id) ON DELETE CASCADE,
  proposed_by UUID REFERENCES profiles(id),
  is_official BOOLEAN DEFAULT FALSE, -- czy dodane przez admina
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, offer_id)
);

-- Dodaj uprawnienia (tymczasowo wyłączone RLS dla nowych tabel)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dostęp publiczny dla uproszczenia" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dostęp publiczny dla uproszczenia" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dostęp publiczny dla uproszczenia" ON group_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dostęp publiczny dla uproszczenia" ON group_offers FOR ALL USING (true) WITH CHECK (true);
