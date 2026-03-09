-- ============================================================
-- MoHo Local — SQL Migrations v9
-- Run manually in Supabase SQL Editor
-- Generated: 2026-03-09
-- ============================================================

-- ── 1. business_suggestions ──────────────────────────────────
-- Stores community-submitted business suggestions before review

CREATE TABLE IF NOT EXISTS business_suggestions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name    text NOT NULL,
  category         text,
  city             text NOT NULL,
  address          text,
  phone            text,
  website          text,
  notes            text,
  submitter_name   text,
  submitter_email  text,
  status           text NOT NULL DEFAULT 'pending',  -- pending | reviewed | added | rejected
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE business_suggestions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous suggestions welcome)
CREATE POLICY "Anyone can submit a suggestion"
  ON business_suggestions FOR INSERT
  WITH CHECK (true);

-- Only service role / admin can read
CREATE POLICY "Admins can read suggestions"
  ON business_suggestions FOR SELECT
  USING (auth.role() = 'service_role');


-- ── 2. listing_reports ────────────────────────────────────────
-- Stores user-submitted reports about inaccurate or problematic listings

CREATE TABLE IF NOT EXISTS listing_reports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      uuid REFERENCES businesses(id) ON DELETE SET NULL,
  business_name    text,
  reason           text NOT NULL,
  details          text,
  reporter_email   text,
  status           text NOT NULL DEFAULT 'pending',  -- pending | reviewed | resolved | dismissed
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE listing_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a report
CREATE POLICY "Anyone can submit a report"
  ON listing_reports FOR INSERT
  WITH CHECK (true);

-- Only service role / admin can read
CREATE POLICY "Admins can read reports"
  ON listing_reports FOR SELECT
  USING (auth.role() = 'service_role');


-- ── 3. Data cleanup — Childcare → Education ──────────────────
-- 8 businesses were seeded with non-canonical category 'Childcare'
-- Canonical name is 'Education'

UPDATE businesses
SET category = 'Education'
WHERE category = 'Childcare';

-- Verify (should return 0 rows after migration):
-- SELECT id, name, city FROM businesses WHERE category = 'Childcare';


-- ── 4. Ensure featured column exists ─────────────────────────
-- (column likely already present from earlier migrations — safe to re-run)

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;


-- ── 5. Optional: mark a test featured business ────────────────
-- Uncomment and swap in a real business ID to test the Featured section on homepage
--
-- UPDATE businesses SET featured = true WHERE id = '<paste-uuid-here>';
