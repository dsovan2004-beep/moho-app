-- ============================================================
-- MoHo Local — Pending Queue Audit
-- Date: 2026-03-14
-- Author: Claude coworker (founder approval required before running)
-- ============================================================
-- PURPOSE:
--   Audit the ~200 pending businesses seeded by seed_5.py and seed_6.py
--   across Tracy, Lathrop, Manteca, and Brentwood.
--
-- FINDINGS SUMMARY:
--   All seed_5 / seed_6 businesses have sequential placeholder phone numbers
--   (e.g. 209-835-9001..9050, 858-9001..9050, 823-9001..9050, 925-240-9001..9050).
--   These are NOT real contact numbers and must be corrected before going live.
--
--   Web research confirmed:
--     5 businesses are real and have verified contact info → APPROVE (with correction)
--     ~15 businesses likely exist under slightly different names → HOLD for manual review
--     ~30+ businesses appear to be fictional or unverified → HOLD or DELETE
--
-- INSTRUCTIONS:
--   Step 1: Run the SELECT queries to view current state
--   Step 2: Run the APPROVED updates (clearly marked below)
--   Step 3: Review the HOLD list and decide individually
--   Step 4: Run the DELETE block for clearly fictional entries (optional)
-- ============================================================


-- ============================================================
-- STEP 1 — VIEW PENDING COUNTS BY CITY
-- ============================================================

SELECT
  city,
  COUNT(*) AS pending_count
FROM businesses
WHERE status = 'pending'
GROUP BY city
ORDER BY city;


-- ============================================================
-- STEP 2 — VIEW ALL PENDING BUSINESSES (Tracy, Lathrop, Manteca, Brentwood)
-- ============================================================

SELECT
  id,
  name,
  category,
  city,
  address,
  phone,
  status,
  verified,
  created_at
FROM businesses
WHERE status = 'pending'
  AND city IN ('Tracy', 'Lathrop', 'Manteca', 'Brentwood')
ORDER BY city, name;


-- ============================================================
-- STEP 3 — IDENTIFY PLACEHOLDER-PHONE BUSINESSES (the seed_5 / seed_6 batch)
-- These all have sequential fake phone numbers — easy to spot:
-- ============================================================

SELECT id, name, city, phone
FROM businesses
WHERE status = 'pending'
  AND (
    phone LIKE '(209) 835-9%'  -- Tracy seed_5 batch
    OR phone LIKE '(209) 858-9%'  -- Lathrop seed_6 batch
    OR phone LIKE '(209) 823-9%'  -- Manteca seed_6 batch
    OR phone LIKE '(925) 240-9%'  -- Brentwood seed_6 batch
  )
ORDER BY city, phone;


-- ============================================================
-- STEP 4 — ✅ APPROVE: Confirmed Real Businesses (with corrected data)
-- These businesses were independently verified and have real contact info.
-- Phone numbers and addresses have been corrected from placeholders.
-- ============================================================

-- 1. Pho Saigon Tracy (VERIFIED: 2437 Naglee Rd, (209) 830-0444)
UPDATE businesses
SET
  status    = 'approved',
  verified  = true,
  address   = '2437 Naglee Rd, Tracy, CA 95304',
  phone     = '(209) 830-0444'
WHERE name = 'Pho Saigon Tracy'
  AND city  = 'Tracy'
  AND status = 'pending';

-- 2. The Habit Burgers — Tracy (VERIFIED: 2682 Naglee Rd Ste 100, (209) 362-2540)
UPDATE businesses
SET
  status    = 'approved',
  verified  = true,
  address   = '2682 Naglee Rd Suite 100, Tracy, CA 95304',
  phone     = '(209) 362-2540'
WHERE name ILIKE '%Habit Burger%'
  AND city  = 'Tracy'
  AND status = 'pending';

-- 3. Kumon Math & Reading — Tracy (VERIFIED: 1858 W 11th St, (209) 833-9400)
UPDATE businesses
SET
  status    = 'approved',
  verified  = true,
  address   = '1858 W 11th St, Tracy, CA 95376',
  phone     = '(209) 833-9400'
WHERE name ILIKE '%Kumon%'
  AND city  = 'Tracy'
  AND status = 'pending';

-- 4. Lathrop Urgent Care (VERIFIED: 15810 S Harlan Rd #A, (209) 983-9000)
UPDATE businesses
SET
  status    = 'approved',
  verified  = true,
  address   = '15810 S Harlan Rd Suite A, Lathrop, CA 95330',
  phone     = '(209) 983-9000'
WHERE name ILIKE '%Lathrop Urgent Care%'
  AND city  = 'Lathrop'
  AND status = 'pending';

-- 5. Brentwood Plumbing Co. (VERIFIED: (925) 441-7855, 15+ years in business)
UPDATE businesses
SET
  status    = 'approved',
  verified  = true,
  phone     = '(925) 441-7855'
WHERE name ILIKE '%Brentwood Plumbing Co%'
  AND city  = 'Brentwood'
  AND status = 'pending';


-- ============================================================
-- STEP 5 — ⚠️ HOLD: Businesses That May Be Real (Need Manual Check)
-- These exist in some form but the name/phone/address needs direct verification.
-- Do NOT approve until you've confirmed the real phone number.
-- ============================================================

-- Tracy:
--   • El Jardin Mexican Grill — similar businesses exist, needs exact address
--   • Tracy Tandoor Kitchen — no exact match; multiple Indian restaurants in Tracy
--   • Tracy Animal Hospital — "Paws and Claws Veterinary" may be the match
--   • Tracy Family Health Center — multiple health centers, unclear which
--   • Bright Smiles Dental Tracy — "Brite Smiles Dentistry" (diff spelling) at 1170 W 11th St
--   • Tracy Tire & Auto Center — A1 Tracy Tires at N MacArthur Dr may be this

-- Lathrop:
--   • Lathrop Dental Group — "First Lathrop Dental" at 15136 S Harlan Rd may match
--   • River Islands Café — "Islander Coffee Cafe" at 1401 River Islands Pkwy may match
--   • Lathrop Pet Hospital — "Lathrop Veterinary Center" at 17600 Golden Valley Pkwy may match

-- Manteca:
--   • El Torero Mexican Restaurant — may exist, no Manteca-specific confirmation
--   • Manteca Auto & Tire — "Manteca Tire" at 201 W Edison St may be the match

-- Brentwood (seed_6 batch - placeholder phones):
--   All 50 seed_6 Brentwood entries have placeholder phones.
--   Verify individually before approving.


-- ============================================================
-- STEP 6 — ❌ DO NOT APPROVE: Clearly Fictional / Not Found
-- These businesses have no evidence of existing in the 209/925 area.
-- Recommend holding or deleting.
-- ============================================================

-- Tracy: Tracy Tandoor Kitchen, Sunrise Dim Sum & Tea, Ramen Republic Tracy,
--        Farmhouse Kitchen Tracy, Bella Italia Tracy
-- Lathrop: Saffron Indian Kitchen Lathrop, Delta Karate Academy,
--          Falafel & Shawarma Palace, Lathrop STEM Lab
-- Manteca: Punjab Palace Manteca, Manteca Sushi Lounge,
--          The Breakfast Club Manteca, Manteca Brewery & Grill (Brethren Brewing exists instead),
--          Big Paws Dog Park & Training, Bump & Beyond Prenatal Care,
--          Young Coders Manteca
-- Brentwood (seed_6): Lone Tree Landscaping, Empire Ave Electric

-- OPTIONAL DELETE (run only after founder review):
-- DELETE FROM businesses
-- WHERE status = 'pending'
--   AND city IN ('Tracy', 'Lathrop', 'Manteca', 'Brentwood')
--   AND name IN (
--     'Saffron Indian Kitchen Lathrop',
--     'Delta Karate Academy',
--     'Punjab Palace Manteca',
--     'Manteca Sushi Lounge',
--     'The Breakfast Club Manteca',
--     'Big Paws Dog Park & Training'
--   );


-- ============================================================
-- STEP 7 — VERIFY RESULTS AFTER RUNNING APPROVALS
-- ============================================================

SELECT
  city,
  status,
  COUNT(*) AS count
FROM businesses
WHERE city IN ('Tracy', 'Lathrop', 'Manteca', 'Brentwood')
GROUP BY city, status
ORDER BY city, status;
