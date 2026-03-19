-- ─────────────────────────────────────────────────────────────────────────────
-- Sprint 5 — South Bay Listing Count Fix
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/ozjlfgipfzykzrjakwzb
--
-- Purpose: Santa Clara + Sunnyvale showing only ~2 public listings despite
-- 100 + 83 records seeded with --force-approve. This script diagnoses and
-- fixes the root cause.
--
-- ALWAYS run Step 1 first. Read the output before running any fix.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── STEP 1: DIAGNOSE ─────────────────────────────────────────────────────────
-- Run this first. Read the output carefully before proceeding.

SELECT
  city,
  status,
  verified,
  COUNT(*) AS count
FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale', 'San Jose')
GROUP BY city, status, verified
ORDER BY city, count DESC;

-- ── STEP 2: CHECK CATEGORIES ─────────────────────────────────────────────────
-- Are records stored with non-standard category names?

SELECT city, category, COUNT(*) AS count
FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale', 'San Jose')
GROUP BY city, category
ORDER BY city, count DESC;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX A — Records exist but status/verified are wrong
-- Run ONLY if Step 1 shows records in pending or verified=false state.
-- ─────────────────────────────────────────────────────────────────────────────

-- Preview first:
SELECT id, name, city, status, verified
FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale')
  AND (status != 'approved' OR verified = false)
ORDER BY city, name
LIMIT 50;

-- Apply fix (uncomment after previewing):
-- UPDATE businesses
-- SET status = 'approved', verified = true
-- WHERE city IN ('Santa Clara', 'Sunnyvale')
--   AND (status != 'approved' OR verified = false);

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX B — Category stored as non-standard value
-- Run ONLY if Step 2 shows categories like "Bar", "Cafe", "Restaurant" etc.
-- All South Bay records should be category = 'Restaurants'
-- ─────────────────────────────────────────────────────────────────────────────

-- Preview first:
SELECT id, name, city, category
FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale')
  AND category NOT IN (
    'Restaurants','Health & Wellness','Beauty & Spa','Retail',
    'Education','Automotive','Real Estate','Home Services','Pet Services'
  )
ORDER BY city, category
LIMIT 50;

-- Apply fix (uncomment after previewing):
-- UPDATE businesses
-- SET category = 'Restaurants'
-- WHERE city IN ('Santa Clara', 'Sunnyvale')
--   AND category IN (
--     'Bar','Cafe','Coffee Shop','Restaurant','Bars & Nightlife',
--     'Nightlife','Food & Drink','Food','Pub','Bistro'
--   );

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFY — Confirm public counts after fix
-- Target: Santa Clara >= 20, Sunnyvale >= 20, San Jose >= 150
-- ─────────────────────────────────────────────────────────────────────────────

SELECT city, COUNT(*) AS public_count
FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale', 'San Jose')
  AND status = 'approved'
  AND verified = true
GROUP BY city
ORDER BY city;
