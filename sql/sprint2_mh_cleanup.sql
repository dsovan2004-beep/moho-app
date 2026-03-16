-- ============================================================
-- MoHo Local — Sprint 2 Task 1: Mountain House Data Cleanup
-- Run this in Supabase SQL Editor (moholocal-db01)
-- March 2026
-- ============================================================
-- Source verification: Google Maps + Yelp + Official websites
-- Trust rule: status='approved' AND verified=true
-- DO NOT run without reviewing each block first.
-- ============================================================


-- ============================================================
-- SECTION 1: VERIFY TIER 5 CANDIDATES
-- 4 of 5 confirmed real. 1 unverifiable at given address.
-- ============================================================

-- ── 1A. Taqueria La Mexicana ──────────────────────────────
-- Source: Yelp (92 photos, 94 reviews, updated Feb 2026)
--         Google Maps listing confirmed
--         Direct website: taqlamexicana.com
-- Address: 19697 Mountain House Pkwy, Mountain House, CA 95391
-- Phone:   (209) 207-9219
-- Hours:   Sun–Sat 9:00 AM – 8:00 PM
UPDATE businesses
SET
  address   = '19697 Mountain House Pkwy, Mountain House, CA 95391',
  phone     = '(209) 207-9219',
  website   = 'https://taqlamexicana.com',
  status    = 'approved',
  verified  = true
WHERE city     = 'Mountain House'
  AND category = 'Restaurants'
  AND lower(name) LIKE '%taqueria la mexicana%';

-- ── 1B. Tandoori Pizza ────────────────────────────────────
-- Source: Yelp (40 photos, 59 reviews, updated Mar 2026)
--         Official website: tandooripizza.com/mountain-house
--         DoorDash, Uber Eats, GrubHub listings confirmed
-- Address: 1140 Traditions St, Mountain House, CA 95391
-- Phone:   (209) 784-8100
-- Hours:   Mon–Thu 10am–10pm | Fri–Sat 10am–11pm | Sun 10am–10pm
UPDATE businesses
SET
  address   = '1140 Traditions St, Mountain House, CA 95391',
  phone     = '(209) 784-8100',
  website   = 'https://tandooripizza.com/mountain-house',
  status    = 'approved',
  verified  = true
WHERE city     = 'Mountain House'
  AND category = 'Restaurants'
  AND lower(name) LIKE '%tandoori pizza%';

-- ── 1C. THub Cafe ─────────────────────────────────────────
-- Source: Yelp (57 photos, 70 reviews, updated Jan 2026)
--         Official website: thubcafe.com
--         DoorDash + Uber Eats listings confirmed
--         Established Feb 2022
-- Address: 1158 Tradition St, Mountain House, CA 95391
-- Phone:   (209) 989-8482
-- Hours:   Mon–Fri 7:00am–9:00pm | Sat–Sun 8:00am–9:00pm
UPDATE businesses
SET
  address   = '1158 Tradition St, Mountain House, CA 95391',
  phone     = '(209) 989-8482',
  website   = 'https://thubcafe.com',
  status    = 'approved',
  verified  = true
WHERE city     = 'Mountain House'
  AND (lower(name) LIKE '%thub%' OR lower(name) LIKE '%t hub%')
  AND (category = 'Restaurants' OR category = 'Coffee & Tea');

-- ── 1D. Sourdough & Co. ───────────────────────────────────
-- Source: Yelp (26 photos, 29 reviews, updated Feb 2026)
--         Official website: sourdoughandco.com/mountain-house
--         GrubHub + DoorDash listings confirmed
-- Address: 19673 Mountain House Pkwy, Mountain House, CA 95391
-- Phone:   (209) 221-0003
-- Hours:   Mon–Thu 9:30am–8:00pm | Fri 9:30am–onward
UPDATE businesses
SET
  address   = '19673 Mountain House Pkwy, Mountain House, CA 95391',
  phone     = '(209) 221-0003',
  website   = 'https://sourdoughandco.com/mountain-house',
  status    = 'approved',
  verified  = true
WHERE city     = 'Mountain House'
  AND category = 'Restaurants'
  AND lower(name) LIKE '%sourdough%';

-- ── 1E. Arya Grill — SKIP / LEAVE AS pending_review ──────
-- Address 19663 Mountain House Pkwy is The UPS Store.
-- Arya Grill actual address: 21459 S Reeve Rd, Tracy, CA 95304
-- This is Tracy, not Mountain House. Cannot promote.
-- No action. Record remains pending_review.


-- ============================================================
-- SECTION 2: RESTORE CHAIN BUSINESSES
-- ============================================================

-- ── 2A. Starbucks ─────────────────────────────────────────
-- Source: Yelp Mountain House listing, Starbucks store locator
--         DoorDash listing confirmed
-- Address: 19699 Mountain House Pkwy, Mountain House, CA 95391
-- Phone:   (209) 322-1517
UPDATE businesses
SET
  address   = '19699 Mountain House Pkwy, Mountain House, CA 95391',
  phone     = '(209) 322-1517',
  website   = 'https://www.starbucks.com/store-locator',
  status    = 'approved',
  verified  = true
WHERE city     = 'Mountain House'
  AND lower(name) LIKE '%starbucks%';

-- ── 2B. Chipotle Mexican Grill ────────────────────────────
-- Source: Official Chipotle store locator (locations.chipotle.com)
--         Yelp listing confirmed, DoorDash confirmed
-- Address: 18011 W Grant Line Rd, Mountain House, CA 95391
-- Phone:   (209) 654-0725
-- Hours:   Mon–Sun 10:45 AM – 10:00 PM
UPDATE businesses
SET
  address   = '18011 W Grant Line Rd, Mountain House, CA 95391',
  phone     = '(209) 654-0725',
  website   = 'https://locations.chipotle.com/ca/mountain-house/18011-w-grant-line-rd',
  status    = 'approved',
  verified  = true
WHERE city     = 'Mountain House'
  AND lower(name) LIKE '%chipotle%';

-- ── 2C. Safeway ───────────────────────────────────────────
-- Source: Official Safeway store locator (local.safeway.com)
--         Yelp (39 photos, 44 reviews, updated Mar 2026)
-- Address: 19555 S Mountain House Pkwy, Mountain House, CA 95391
-- Phone:   (209) 362-1256
UPDATE businesses
SET
  address   = '19555 S Mountain House Pkwy, Mountain House, CA 95391',
  phone     = '(209) 362-1256',
  website   = 'https://local.safeway.com/safeway/ca/mountain-house/19555-s-mountain-house-pkwy.html',
  status    = 'approved',
  verified  = true
WHERE city     = 'Mountain House'
  AND lower(name) LIKE '%safeway%'
  AND lower(name) NOT LIKE '%express%';

-- ── 2D. ARCO — SKIP / LEAVE AS pending_review ─────────────
-- No verified ARCO station found in Mountain House 95391.
-- Safeway Express fuel center exists at 19533 S Mountain House Pkwy
-- (separate from the grocery store above) but is NOT branded ARCO.
-- The user-mentioned ARCO record likely has a fabricated address.
-- No action. Record remains pending_review.


-- ============================================================
-- SECTION 3: INSERT BONUS CONFIRMED BUSINESSES
-- These are real Mountain House businesses found during research
-- that may not yet exist in the database.
-- Run the SELECT check first to avoid duplicates.
-- ============================================================

-- ── 3A. Fremont Kabob Restaurant ──────────────────────────
-- Source: Yelp (63 photos, 44 reviews, updated Jan 2026)
--         Official website: fremontafghankabob.com
--         TripAdvisor listing confirmed
-- #1 Halal restaurant in Mountain House per Yelp top 10 Mar 2026
-- Address: 19693 Mountain House Pkwy, Mountain House, CA 95391
-- Phone:   (209) 207-9798
-- Hours:   Tue–Sun 11am–10pm (Mon closed)

-- Check first:
-- SELECT id, name, address, status, verified FROM businesses
-- WHERE city = 'Mountain House' AND lower(name) LIKE '%fremont kabob%';

-- If NOT exists, INSERT:
INSERT INTO businesses (
  name, category, city, address, phone, website,
  description, status, verified, claimed, created_at
)
SELECT
  'Fremont Kabob Restaurant',
  'Restaurants',
  'Mountain House',
  '19693 Mountain House Pkwy, Mountain House, CA 95391',
  '(209) 207-9798',
  'https://www.fremontafghankabob.com/contact-us/fremont-kabob-mountain-house-restaurant/',
  'Authentic Afghan kabobs, halal meats, and family-style platters. One of Mountain House''s most-reviewed restaurants. Closed Mondays.',
  'approved',
  true,
  false,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM businesses
  WHERE city = 'Mountain House'
    AND lower(name) LIKE '%fremont kabob%'
);

-- ── 3B. Spicy Bites ───────────────────────────────────────
-- Source: Yelp (18 photos, updated Jan 2026)
--         Official website: spicybitesusa.com
--         Mountain House Chamber of Commerce grand opening Jul 2025
--         DoorDash listing confirmed
-- Address: 1166 Tradition St, Mountain House, CA 95391
-- Phone:   (209) 901-2982
-- Hours:   Mon–Thu 9am–9pm | Fri 9am–10pm

-- Check first:
-- SELECT id, name, address, status, verified FROM businesses
-- WHERE city = 'Mountain House' AND lower(name) LIKE '%spicy bites%';

-- If NOT exists, INSERT:
INSERT INTO businesses (
  name, category, city, address, phone, website,
  description, status, verified, claimed, created_at
)
SELECT
  'Spicy Bites',
  'Restaurants',
  'Mountain House',
  '1166 Tradition St, Mountain House, CA 95391',
  '(209) 901-2982',
  'https://www.spicybitesusa.com',
  'Bold fusion flavors blending Indian, Chinese, and American cuisines. Opened July 2025 at Cordes Plaza. Dine-in, takeout, and delivery available.',
  'approved',
  true,
  false,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM businesses
  WHERE city = 'Mountain House'
    AND lower(name) LIKE '%spicy bites%'
);


-- ============================================================
-- SECTION 4: INTEGRITY CHECK
-- Run after all updates above to confirm trust gate passes
-- ============================================================

SELECT
  name,
  address,
  phone,
  category,
  status,
  verified,
  claimed
FROM businesses
WHERE city     = 'Mountain House'
  AND status   = 'approved'
  AND verified = true
ORDER BY category, name;

-- ── Summary count ──
SELECT
  COUNT(*) FILTER (WHERE status = 'approved' AND verified = true)  AS approved_verified,
  COUNT(*) FILTER (WHERE status = 'pending_review')                AS pending_review,
  COUNT(*) FILTER (WHERE status = 'pending')                       AS pending,
  COUNT(*)                                                         AS total_mh_listings
FROM businesses
WHERE city = 'Mountain House';

-- ============================================================
-- END OF SCRIPT
-- sprint2_mh_cleanup.sql
-- MoHo Local — Sprint 2 Task 1
-- March 2026
-- ============================================================
