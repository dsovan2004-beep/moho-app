-- ── MoHoLocal: Garbage Content Cleanup ────────────────────────────────────────
-- Run this manually in Supabase SQL Editor.
-- Removes:
--   1. Facebook OCR garbage from community_posts
--   2. Crime/violence content from lost_and_found
--   3. Crime/violence content from events
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Delete Facebook garbage from community_posts
--    (promoted from bad OCR of Facebook screenshots)
DELETE FROM community_posts
WHERE
  title ILIKE '%facebook%'
  OR title ILIKE '%facebook.com%'
  OR title ILIKE '%/groups/%'
  OR title ~ '^[^a-zA-Z0-9]*[-<>|]{2,}'  -- starts with OCR noise chars
  OR title ILIKE '%C 25 facebook%'
  OR content ILIKE '%facebook.com/groups%'
  OR content ILIKE '%Search Facebook%'
  OR content ILIKE '%See more%'
  OR LENGTH(title) < 5;

-- 2. Delete crime/violence content from lost_and_found
DELETE FROM lost_and_found
WHERE
  title ILIKE '%stabbing%'
  OR title ILIKE '%stabbed%'
  OR title ILIKE '%shooting%'
  OR title ILIKE '%shot%'
  OR title ILIKE '%killed%'
  OR title ILIKE '%murder%'
  OR title ILIKE '%arrest%'
  OR title ILIKE '%arrested%'
  OR title ILIKE '%police officer%'
  OR title ILIKE '%bomb%'
  OR title ILIKE '%arson%'
  OR title ILIKE '%assault%'
  OR description ILIKE '%burning and stabbing%'
  OR description ILIKE '%stockton police%';

-- 3. Delete crime/violence content from events
DELETE FROM events
WHERE
  title ILIKE '%stabbing%'
  OR title ILIKE '%shooting%'
  OR title ILIKE '%murder%'
  OR title ILIKE '%arrested%'
  OR title ILIKE '%arrest%'
  OR title ILIKE '%bomb%'
  OR title ILIKE '%arson%';

-- 4. Verify results
SELECT 'community_posts' AS table_name, COUNT(*) AS remaining FROM community_posts
UNION ALL
SELECT 'lost_and_found', COUNT(*) FROM lost_and_found
UNION ALL
SELECT 'events', COUNT(*) FROM events;
