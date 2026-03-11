-- ============================================================
-- MoHoLocal — Business Directory Audit
-- Location: sql/audits/001_business_audit.sql
-- Type: READ-ONLY — safe to run anytime
-- Run in: Supabase SQL Editor (paste directly)
-- ============================================================

-- 1. Total businesses by status
SELECT status, COUNT(*) AS count
FROM businesses
GROUP BY status
ORDER BY count DESC;

-- 2. Count by city
SELECT city, COUNT(*) AS count
FROM businesses
GROUP BY city
ORDER BY count DESC;

-- 3. Count by category
SELECT category, COUNT(*) AS count
FROM businesses
GROUP BY category
ORDER BY count DESC;

-- 4. Missing data summary
SELECT
  COUNT(*)                                                        AS total,
  COUNT(*) FILTER (WHERE phone    IS NULL OR phone    = '')      AS missing_phone,
  COUNT(*) FILTER (WHERE website  IS NULL OR website  = '')      AS missing_website,
  COUNT(*) FILTER (WHERE address  IS NULL OR address  = '')      AS missing_address,
  COUNT(*) FILTER (WHERE description IS NULL OR description = '') AS missing_description
FROM businesses;

-- 5. Duplicate names within same city
SELECT name, city, COUNT(*) AS count
FROM businesses
GROUP BY name, city
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 6. Non-standard city values
SELECT DISTINCT city FROM businesses ORDER BY city;

-- 7. Non-standard category values
SELECT DISTINCT category FROM businesses ORDER BY category;

-- 8. Full summary dashboard
SELECT
  (SELECT COUNT(*)  FROM businesses)                                        AS total,
  (SELECT COUNT(*)  FROM businesses WHERE city = 'Mountain House')         AS mountain_house,
  (SELECT COUNT(*)  FROM businesses WHERE city = 'Tracy')                  AS tracy,
  (SELECT COUNT(*)  FROM businesses WHERE city = 'Lathrop')                AS lathrop,
  (SELECT COUNT(*)  FROM businesses WHERE city = 'Manteca')                AS manteca,
  (SELECT COUNT(*)  FROM businesses WHERE status = 'approved')             AS approved,
  (SELECT COUNT(*)  FROM businesses WHERE status = 'pending')              AS pending,
  (SELECT COUNT(*)  FROM businesses WHERE phone IS NULL OR phone = '')     AS missing_phone,
  (SELECT COUNT(*)  FROM businesses WHERE website IS NULL OR website = '') AS missing_website,
  (SELECT COUNT(*)  FROM businesses WHERE slug IS NULL OR slug = '')       AS missing_slug,
  (SELECT COUNT(*)  FROM businesses WHERE verified = true)                 AS verified,
  (SELECT COUNT(*)  FROM businesses WHERE featured = true)                 AS featured;
