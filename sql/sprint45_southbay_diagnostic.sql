-- ─────────────────────────────────────────────────────────────────────────────
-- Sprint 4.5 — South Bay Data Diagnostic + Fix
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/ozjlfgipfzykzrjakwzb
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Step 1: Diagnose — how many records exist and in what state? ──────────────

SELECT city, status, verified, COUNT(*) AS count
FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale', 'San Jose')
GROUP BY city, status, verified
ORDER BY city, count DESC;

-- Expected output if seed ran correctly:
--  San Jose    | approved | true  | ~324
--  Santa Clara | approved | true  | ~100
--  Sunnyvale   | approved | true  | ~83
--
-- If Santa Clara/Sunnyvale show pending/false → run the fix below.

-- ── Step 2: Check what categories are stored for South Bay ───────────────────

SELECT city, category, COUNT(*) AS count
FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale', 'San Jose')
  AND status = 'approved'
  AND verified = true
GROUP BY city, category
ORDER BY city, count DESC;

-- Expected: all records under "Restaurants" category.
-- If stored as "Bar", "Cafe", "Restaurant" (non-standard) → see Fix B below.

-- ── Step 3: Check total record count regardless of status ────────────────────

SELECT city, COUNT(*) AS total_rows
FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale', 'San Jose')
GROUP BY city;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX A — If records exist but have wrong status/verified
-- Only run after confirming Step 1 shows records in pending/unverified state
-- ─────────────────────────────────────────────────────────────────────────────

-- Preview before running:
SELECT id, name, city, status, verified
FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale')
  AND (status != 'approved' OR verified = false)
LIMIT 20;

-- Fix (run after confirming count is correct):
-- UPDATE businesses
-- SET status = 'approved', verified = true
-- WHERE city IN ('Santa Clara', 'Sunnyvale')
--   AND (status != 'approved' OR verified = false);

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX B — If category is stored as non-standard value (e.g. "Bar", "Cafe")
-- ─────────────────────────────────────────────────────────────────────────────

-- Check non-standard categories:
SELECT category, COUNT(*) FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale')
GROUP BY category;

-- If category is "Bar", "Cafe", "Coffee Shop" etc → normalize to "Restaurants":
-- UPDATE businesses
-- SET category = 'Restaurants'
-- WHERE city IN ('Santa Clara', 'Sunnyvale')
--   AND category IN ('Bar', 'Cafe', 'Coffee Shop', 'Restaurant', 'Bars & Nightlife', 'Nightlife');

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFY — After running any fix, confirm public query returns correct count
-- ─────────────────────────────────────────────────────────────────────────────

SELECT city, COUNT(*) AS public_count
FROM businesses
WHERE city IN ('Santa Clara', 'Sunnyvale', 'San Jose')
  AND status = 'approved'
  AND verified = true
GROUP BY city;

-- Target: Santa Clara >= 20, Sunnyvale >= 20, San Jose >= 150
