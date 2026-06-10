-- Schemat bazy danych dla Wspólne Wakacje
-- Użyj tego w edytorze SQL w panelu Supabase

-- Tabela offers
CREATE TABLE offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  price NUMERIC NOT NULL,
  destination TEXT,
  startDate TEXT,
  endDate TEXT,
  adults INTEGER,
  children INTEGER,
  rooms INTEGER,
  platform TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela lists
CREATE TABLE lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ownerName TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela list_offers
CREATE TABLE list_offers (
  id TEXT PRIMARY KEY,
  listId TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  offerId TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE
);

-- Tabela ratings
CREATE TABLE ratings (
  id TEXT PRIMARY KEY,
  listOfferId TEXT NOT NULL REFERENCES list_offers(id) ON DELETE CASCADE,
  raterName TEXT NOT NULL,
  locationRating INTEGER,
  priceRating INTEGER,
  amenitiesRating INTEGER,
  comments TEXT,
  isFor BOOLEAN,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Włącz RLS (Row Level Security) - opcjonalne, ale polecane
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Polityki pozwalające na wszystkie operacje (dla prostoty - w produkcji dodaj autentykację!)
CREATE POLICY "Wszystkie operacje dla offers" ON offers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Wszystkie operacje dla lists" ON lists
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Wszystkie operacje dla list_offers" ON list_offers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Wszystkie operacje dla ratings" ON ratings
  FOR ALL USING (true) WITH CHECK (true);
