-- MoHoLocal Performance Indexes
-- Migration: 20260314_add_performance_indexes
-- Purpose: Prepare directory queries for scale (~2k+ listings)
-- Run manually in Supabase SQL Editor (founder only)
-- All indexes are safe — they do not change behavior, only query speed

-- ── businesses table ──────────────────────────────────────────────────────────

-- Covers the core trust filter used on all 9 public-facing pages:
--   WHERE city = ? AND status = 'approved' AND verified = true
CREATE INDEX IF NOT EXISTS idx_businesses_city_status_verified
  ON businesses (city, status, verified);

-- Covers category + city filtering used in directory, category pages, Best Of:
--   WHERE category = ? AND city = ?
CREATE INDEX IF NOT EXISTS idx_businesses_category_city
  ON businesses (category, city);

-- ── business_images table ─────────────────────────────────────────────────────

-- Covers gallery image lookups by business_id used on every detail page:
--   WHERE business_id = ? AND verified = true AND source IN (...)
CREATE INDEX IF NOT EXISTS idx_business_images_business_id
  ON business_images (business_id);

-- ── Verification note ─────────────────────────────────────────────────────────
-- After running, verify with:
--   SELECT indexname, tablename FROM pg_indexes
--   WHERE tablename IN ('businesses', 'business_images')
--   ORDER BY tablename, indexname;
