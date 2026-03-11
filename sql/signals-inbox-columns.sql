-- ── Screenshot Signal Inbox — traceability columns ───────────────────────────
-- Run once in Supabase → moholocal-db01 → SQL Editor
-- Adds three optional columns to community_submissions for screenshot traceability.

ALTER TABLE community_submissions
  ADD COLUMN IF NOT EXISTS source_file    text    NULL,  -- original filename from signals-inbox/raw/
  ADD COLUMN IF NOT EXISTS raw_text       text    NULL,  -- full OCR-extracted text (up to 3000 chars)
  ADD COLUMN IF NOT EXISTS ocr_confidence numeric NULL;  -- 0.0–1.0 normalized Tesseract confidence

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
