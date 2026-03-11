-- ── Community Signal Inbox — schema migration ────────────────────────────────
-- Run this in Supabase → moholocal-db01 → SQL Editor
-- Safe to re-run (all statements are IF NOT EXISTS / IF NOT EXISTS guards)

-- 1. Create table
CREATE TABLE IF NOT EXISTS community_submissions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  description      text        NOT NULL,
  city             text        NOT NULL,
  submission_type  text        NOT NULL,
  event_date       timestamptz NULL,
  image_url        text        NULL,
  contact_url      text        NULL,
  source           text        NOT NULL DEFAULT 'community',
  confidence_score numeric     NOT NULL DEFAULT 0.8,
  needs_review     boolean     NOT NULL DEFAULT true,
  submitted_at     timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- 2. Enum-style constraint on submission_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'community_submissions_type_check'
  ) THEN
    ALTER TABLE community_submissions
      ADD CONSTRAINT community_submissions_type_check
      CHECK (submission_type IN (
        'event',
        'lost_pet',
        'business_update',
        'community_tip',
        'garage_sale'
      ));
  END IF;
END $$;

-- 3. Index for admin review queue (newest unreviewed first)
CREATE INDEX IF NOT EXISTS community_submissions_review_idx
  ON community_submissions (needs_review, created_at DESC);

-- 4. Index for city filtering
CREATE INDEX IF NOT EXISTS community_submissions_city_idx
  ON community_submissions (city);

-- 5. Enable RLS
ALTER TABLE community_submissions ENABLE ROW LEVEL SECURITY;

-- 6. Service role bypass (for worker writes)
DROP POLICY IF EXISTS "service_role_all" ON community_submissions;
CREATE POLICY "service_role_all" ON community_submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 7. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
