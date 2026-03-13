-- ============================================================
-- MoHoLocal — City Audit Status Table
-- Run manually in Supabase SQL Editor
-- ============================================================

-- Create city_status table to track audit progress per city
CREATE TABLE IF NOT EXISTS city_status (
  city        TEXT PRIMARY KEY,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'auditing', 'verified')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial values
INSERT INTO city_status (city, status) VALUES
  ('Mountain House', 'verified'),
  ('Tracy',          'pending'),
  ('Lathrop',        'pending'),
  ('Manteca',        'pending'),
  ('Brentwood',      'pending')
ON CONFLICT (city) DO NOTHING;

-- RLS: public read, authenticated update
ALTER TABLE city_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read city_status"
  ON city_status FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update city_status"
  ON city_status FOR UPDATE
  USING (auth.role() = 'authenticated');
