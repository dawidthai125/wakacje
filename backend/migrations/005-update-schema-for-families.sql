-- Aktualizacja schematu bazy danych
ALTER TABLE offers ADD COLUMN family_groups JSONB DEFAULT '[]';
ALTER TABLE offers ADD COLUMN total_people INTEGER DEFAULT 0;
ALTER TABLE offers ADD COLUMN hotel_rating INTEGER;
ALTER TABLE offers ADD COLUMN food_config TEXT;

-- Usunięcie starych kolumn (opcjonalnie, ale lepiej zostawić dla kompatybilności na chwilę lub zaktualizować)
-- ALTER TABLE offers DROP COLUMN adults;
-- ALTER TABLE offers DROP COLUMN children;
-- ALTER TABLE offers DROP COLUMN rooms;

-- Aktualizacja tabeli ratings
ALTER TABLE ratings ADD COLUMN food_rating INTEGER;
ALTER TABLE ratings ADD COLUMN service_rating INTEGER;
