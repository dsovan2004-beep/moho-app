-- ============================================================
-- MoHoLocal — Containment: Seed Batch 5 & 6
-- ============================================================
-- PURPOSE: Quarantine 250 businesses inserted by seed_businesses_5.py
--          and seed_businesses_6.py that were incorrectly set to
--          status='approved' and verified=true.
--
-- These records were seeded programmatically and have NOT been
--  validated against real sources. They must not be publicly
--  visible until a human audit is complete.
--
-- SAFE TO RUN: UPDATE only — no deletes, no schema changes.
-- Run in Supabase SQL Editor.
-- ============================================================


-- ── STEP 1: REVIEW ──────────────────────────────────────────
-- Inspect the affected rows before changing anything.
-- Phone suffixes 9001–9999 were reserved exclusively for batch 5 & 6.
-- All 5 city phone prefixes are listed below.

SELECT
  id,
  name,
  city,
  category,
  phone,
  status,
  verified,
  created_at
FROM businesses
WHERE
  phone LIKE '(209) 456-9%'   -- Mountain House batch 5
  OR phone LIKE '(209) 835-9%' -- Tracy batch 5
  OR phone LIKE '(209) 858-9%' -- Lathrop batch 6
  OR phone LIKE '(209) 823-9%' -- Manteca batch 6
  OR phone LIKE '(925) 240-9%' -- Brentwood batch 6
ORDER BY city, phone;

-- Expected: 250 rows total
-- (50 Mountain House, 50 Tracy, 50 Lathrop, 50 Manteca, 50 Brentwood)


-- ── STEP 2: COUNT CHECK ──────────────────────────────────────
-- Verify count before proceeding.

SELECT city, COUNT(*) AS count
FROM businesses
WHERE
  phone LIKE '(209) 456-9%'
  OR phone LIKE '(209) 835-9%'
  OR phone LIKE '(209) 858-9%'
  OR phone LIKE '(209) 823-9%'
  OR phone LIKE '(925) 240-9%'
GROUP BY city
ORDER BY city;

-- Expected:
--   Brentwood      50
--   Lathrop        50
--   Manteca        50
--   Mountain House 50
--   Tracy          50


-- ── STEP 3: CONTAINMENT UPDATE ───────────────────────────────
-- Set all 250 records to pending + unverified.
-- They will NOT appear in the public directory (status != 'approved').
-- Run this ONLY after confirming Step 2 returns exactly 250 rows.

UPDATE businesses
SET
  status   = 'pending',
  verified = false
WHERE
  phone LIKE '(209) 456-9%'
  OR phone LIKE '(209) 835-9%'
  OR phone LIKE '(209) 858-9%'
  OR phone LIKE '(209) 823-9%'
  OR phone LIKE '(925) 240-9%';

-- Expected: UPDATE 250


-- ── STEP 4: CONFIRM ──────────────────────────────────────────
-- Re-run the count query — now with status filter to confirm
-- none of these records are still public.

SELECT city, status, verified, COUNT(*) AS count
FROM businesses
WHERE
  phone LIKE '(209) 456-9%'
  OR phone LIKE '(209) 835-9%'
  OR phone LIKE '(209) 858-9%'
  OR phone LIKE '(209) 823-9%'
  OR phone LIKE '(925) 240-9%'
GROUP BY city, status, verified
ORDER BY city;

-- All 250 should show status='pending', verified=false.
-- Zero rows should show status='approved'.


-- ── STEP 5: PUBLIC DIRECTORY AUDIT ───────────────────────────
-- Double-check: these cities should no longer show batch 5/6 records
-- in the live directory (which filters on status='approved').

SELECT city, COUNT(*) AS approved_count
FROM businesses
WHERE status = 'approved'
  AND (
    phone LIKE '(209) 456-9%'
    OR phone LIKE '(209) 835-9%'
    OR phone LIKE '(209) 858-9%'
    OR phone LIKE '(209) 823-9%'
    OR phone LIKE '(925) 240-9%'
  )
GROUP BY city;

-- Expected: 0 rows returned (no approved batch 5/6 records remain).


-- ============================================================
-- AUDIT QUEUE
-- After running containment, use this query to work through
-- the 250 records for manual review. Approve one at a time
-- after validating against Google Maps / Yelp / city sources.
-- ============================================================

-- View all pending batch 5/6 records for audit:
SELECT
  id,
  name,
  city,
  category,
  address,
  phone,
  website,
  status,
  verified
FROM businesses
WHERE status = 'pending'
  AND (
    phone LIKE '(209) 456-9%'
    OR phone LIKE '(209) 835-9%'
    OR phone LIKE '(209) 858-9%'
    OR phone LIKE '(209) 823-9%'
    OR phone LIKE '(925) 240-9%'
  )
ORDER BY city, category, name;

-- To approve an individual record after manual verification:
-- UPDATE businesses SET status = 'approved', verified = true WHERE id = '<uuid>';
