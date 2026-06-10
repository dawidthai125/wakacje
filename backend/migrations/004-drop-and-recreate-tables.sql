-- Usuń stare tabelki
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS list_offers CASCADE;
DROP TABLE IF EXISTS lists CASCADE;
DROP TABLE IF EXISTS offers CASCADE;

-- Utwórz nowe tabelki z snake_case
CREATE TABLE offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  price NUMERIC NOT NULL,
  destination TEXT,
  start_date TEXT,
  end_date TEXT,
  adults INTEGER,
  children INTEGER,
  rooms INTEGER,
  platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE list_offers (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE
);

CREATE TABLE ratings (
  id TEXT PRIMARY KEY,
  list_offer_id TEXT NOT NULL REFERENCES list_offers(id) ON DELETE CASCADE,
  rater_name TEXT NOT NULL,
  location_rating INTEGER,
  price_rating INTEGER,
  amenities_rating INTEGER,
  comments TEXT,
  is_for BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
