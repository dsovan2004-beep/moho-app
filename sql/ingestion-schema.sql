-- ── MoHoLocal — Ingestion Schema Migration ────────────────────────────────────
-- Run manually in the Supabase SQL editor (Settings → SQL Editor).
--
-- Adds ingestion-tracking columns to businesses, events, and lost_and_found.
-- All statements use ADD COLUMN IF NOT EXISTS — safe to re-run.
--
-- After running:
--   1. Deploy the Cloudflare Worker:  cd workers && wrangler deploy
--   2. Set secrets via wrangler CLI (see workers/wrangler.toml for list)
-- ──────────────────────────────────────────────────────────────────────────────


-- ── businesses ────────────────────────────────────────────────────────────────

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS source              TEXT    DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_url          TEXT,
  ADD COLUMN IF NOT EXISTS last_ingested_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confidence_score    NUMERIC(4,3) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS needs_review        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_source        TEXT;

-- source values: 'manual' | 'yelp' | 'google'
-- ingestion_status is reused from the existing `status` column:
--   'pending'  = needs admin review before publishing
--   'approved' = live on site
--   'rejected' = hidden

COMMENT ON COLUMN businesses.source           IS 'Origin of the record: manual | yelp | google';
COMMENT ON COLUMN businesses.source_url       IS 'Canonical URL on the source platform (e.g. Yelp listing URL)';
COMMENT ON COLUMN businesses.last_ingested_at IS 'Timestamp of the most recent ingestion pass that touched this row';
COMMENT ON COLUMN businesses.confidence_score IS '0.0–1.0 data-quality score; records < 0.40 require manual review';
COMMENT ON COLUMN businesses.needs_review     IS 'True when the record was flagged for admin review (low confidence or new source)';
COMMENT ON COLUMN businesses.image_source     IS 'Where the image_url came from: yelp | og:image | schema.org | manual';


-- ── events ────────────────────────────────────────────────────────────────────

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS source              TEXT    DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_url          TEXT,
  ADD COLUMN IF NOT EXISTS last_ingested_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confidence_score    NUMERIC(4,3) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS needs_review        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_source        TEXT,
  ADD COLUMN IF NOT EXISTS ingestion_status    TEXT    DEFAULT 'approved';

-- source values: 'manual' | 'eventbrite' | 'city-rss'
-- ingestion_status: 'approved' | 'pending' | 'archived'
-- Events older than 7 days are archived automatically by the worker.

COMMENT ON COLUMN events.source              IS 'Origin: manual | eventbrite | city-rss';
COMMENT ON COLUMN events.source_url          IS 'Canonical event URL on the source platform';
COMMENT ON COLUMN events.last_ingested_at    IS 'Timestamp of most recent ingestion pass';
COMMENT ON COLUMN events.confidence_score    IS '0.0–1.0 data-quality score';
COMMENT ON COLUMN events.needs_review        IS 'Flagged for admin review';
COMMENT ON COLUMN events.image_source        IS 'Image origin: eventbrite | og:image | schema.org | manual';
COMMENT ON COLUMN events.ingestion_status    IS 'Lifecycle: approved | pending | archived';

-- Index to speed up the worker archive query
CREATE INDEX IF NOT EXISTS idx_events_ingestion_status
  ON events (ingestion_status)
  WHERE ingestion_status != 'archived';


-- ── lost_and_found ────────────────────────────────────────────────────────────

ALTER TABLE lost_and_found
  ADD COLUMN IF NOT EXISTS source              TEXT    DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_url          TEXT,
  ADD COLUMN IF NOT EXISTS last_ingested_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confidence_score    NUMERIC(4,3) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS needs_review        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_source        TEXT,
  ADD COLUMN IF NOT EXISTS ingestion_status    TEXT    DEFAULT 'active';

-- source values: 'manual' | 'petfinder' | 'news-rss'
-- ingestion_status: 'active' | 'archived' | 'reunited'
-- Records older than 30 days are archived automatically by the worker.

COMMENT ON COLUMN lost_and_found.source              IS 'Origin: manual | petfinder | news-rss';
COMMENT ON COLUMN lost_and_found.source_url          IS 'Canonical listing URL on source platform';
COMMENT ON COLUMN lost_and_found.last_ingested_at    IS 'Timestamp of most recent ingestion pass';
COMMENT ON COLUMN lost_and_found.confidence_score    IS '0.0–1.0 data-quality score';
COMMENT ON COLUMN lost_and_found.needs_review        IS 'Flagged for admin review';
COMMENT ON COLUMN lost_and_found.image_source        IS 'Image origin: petfinder | og:image | schema.org | manual';
COMMENT ON COLUMN lost_and_found.ingestion_status    IS 'Lifecycle: active | archived | reunited';

-- Index for the worker archive query (selects active records older than 30 days)
CREATE INDEX IF NOT EXISTS idx_lost_and_found_ingestion_status
  ON lost_and_found (ingestion_status, last_ingested_at)
  WHERE ingestion_status = 'active';


-- ── Admin helper view — pending review queue ─────────────────────────────────
-- Shows all records from any table that need admin attention, most recent first.
-- Access via Supabase Table Editor or the future /admin/review route.

CREATE OR REPLACE VIEW pending_review AS
  SELECT
    'business'  AS record_type,
    id::TEXT,
    name        AS title,
    city,
    source,
    confidence_score,
    created_at
  FROM businesses
  WHERE needs_review = true
    AND status = 'pending'

  UNION ALL

  SELECT
    'event'     AS record_type,
    id::TEXT,
    title,
    city,
    source,
    confidence_score,
    created_at
  FROM events
  WHERE needs_review = true
    AND ingestion_status = 'pending'

  UNION ALL

  SELECT
    'lost_found' AS record_type,
    id::TEXT,
    title,
    city,
    source,
    confidence_score,
    created_at
  FROM lost_and_found
  WHERE needs_review = true
    AND ingestion_status = 'active'

  ORDER BY created_at DESC;

COMMENT ON VIEW pending_review IS 'Cross-table view of all records awaiting admin review after ingestion';


-- ── Verify migration ──────────────────────────────────────────────────────────
-- Run these SELECTs to confirm the columns were added:
--
--   SELECT column_name, data_type FROM information_schema.columns
--     WHERE table_name = 'businesses'   AND column_name IN ('source','last_ingested_at','confidence_score');
--
--   SELECT column_name, data_type FROM information_schema.columns
--     WHERE table_name = 'events'       AND column_name IN ('source','ingestion_status');
--
--   SELECT column_name, data_type FROM information_schema.columns
--     WHERE table_name = 'lost_and_found' AND column_name IN ('source','ingestion_status');
-- ──────────────────────────────────────────────────────────────────────────────
