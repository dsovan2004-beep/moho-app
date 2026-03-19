-- ─────────────────────────────────────────────────────────────────────────────
-- Sprint 5 — Category Coverage Audit
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/ozjlfgipfzykzrjakwzb
--
-- Purpose: Verify restaurants, dentists, and coffee are present per city.
-- Surfaces gaps before distributing discovery pages or submitting to GSC.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Full category × city matrix (approved + verified only) ────────────────

SELECT
  city,
  category,
  COUNT(*) AS count
FROM businesses
WHERE status = 'approved'
  AND verified = true
GROUP BY city, category
ORDER BY city, category;

-- ── 2. Restaurants count per city ────────────────────────────────────────────

SELECT city, COUNT(*) AS restaurant_count
FROM businesses
WHERE status = 'approved'
  AND verified = true
  AND category = 'Restaurants'
GROUP BY city
ORDER BY restaurant_count DESC;

-- ── 3. Dentist / dental coverage per city ────────────────────────────────────
-- Dentists are under Health & Wellness — check keyword presence in name

SELECT city, COUNT(*) AS dentist_count
FROM businesses
WHERE status = 'approved'
  AND verified = true
  AND category = 'Health & Wellness'
  AND (
    name ILIKE '%dental%'
    OR name ILIKE '%dentist%'
    OR name ILIKE '%orthodont%'
    OR description ILIKE '%dental%'
    OR description ILIKE '%dentist%'
  )
GROUP BY city
ORDER BY dentist_count DESC;

-- ── 4. Coffee / cafe coverage per city ───────────────────────────────────────

SELECT city, COUNT(*) AS coffee_count
FROM businesses
WHERE status = 'approved'
  AND verified = true
  AND category = 'Restaurants'
  AND (
    name ILIKE '%coffee%'
    OR name ILIKE '%cafe%'
    OR name ILIKE '%café%'
    OR name ILIKE '%espresso%'
    OR name ILIKE '%boba%'
    OR name ILIKE '%tea%'
    OR description ILIKE '%coffee%'
    OR description ILIKE '%cafe%'
  )
GROUP BY city
ORDER BY coffee_count DESC;

-- ── 5. Total public listings per city ────────────────────────────────────────

SELECT city, COUNT(*) AS total_public
FROM businesses
WHERE status = 'approved'
  AND verified = true
GROUP BY city
ORDER BY total_public DESC;

-- ── 6. Cities below 20 public listings (risk: empty-feeling pages) ───────────

SELECT city, COUNT(*) AS total
FROM businesses
WHERE status = 'approved'
  AND verified = true
GROUP BY city
HAVING COUNT(*) < 20
ORDER BY total;

-- ── 7. Mountain House specific breakdown ─────────────────────────────────────

SELECT category, COUNT(*) AS count
FROM businesses
WHERE city = 'Mountain House'
  AND status = 'approved'
  AND verified = true
GROUP BY category
ORDER BY count DESC;

-- ── 8. Pending queue per city (eligible for audit + approval) ────────────────

SELECT city, COUNT(*) AS pending_count
FROM businesses
WHERE status = 'pending'
  AND verified = false
GROUP BY city
ORDER BY pending_count DESC;
