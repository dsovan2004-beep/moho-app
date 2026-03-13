# MoHoLocal — PLAYBOOK.md
# Daily Operations Guide

This document describes how MoHoLocal is operated day-to-day.
It covers signal intake, moderation, event promotion, directory maintenance, and city expansion.

This document is for AI agents and developers who operate the platform.

**Safety rule: Do not store secrets, API keys, or credentials in this file.**

---

## Platform Overview

MoHoLocal is an AI-assisted hyperlocal signal platform that collects and organizes community information across multiple cities in San Joaquin County and East Bay, CA.

Active cities:
- Mountain House
- Tracy
- Lathrop
- Manteca
- Brentwood

Core platform sections:
- Business Directory (`/directory`)
- Events (`/events`)
- Lost & Found (`/lost-and-found`)
- Community Activity (`/activity`, `/community`)
- New Resident Guides (`/new-resident`)
- Admin Moderation (`/admin`)

Signals enter the platform via screenshot ingestion, manual submissions, and curated sources. **Nothing goes live without human moderation approval.**

---

## Daily Operation Workflow

```
1. Collect community signals
2. Process screenshot inbox
3. Review moderation queue
4. Promote approved signals
5. Monitor image pipeline
6. Site health check
```

---

## Step 1 — Collect Community Signals

Signal sources include:

- Facebook group screenshots
- Community flyers and event graphics
- School announcements
- Neighborhood alerts
- Lost pet posts
- Manual resident submissions

**How to capture:**

The founder captures signals as screenshots from community sources.
Completed screenshots are placed into:

```
moho-app-scaffold/signals-inbox/raw/
```

Name files descriptively, e.g.:
```
volleyball-clinic-mh-april.png
lost-dog-tracy-march.png
downtown-market-manteca.png
```

---

## Step 2 — Process Screenshot Signals

Run the OCR processing pipeline from terminal:

```bash
cd ~/Desktop/MoHoLocal/moho-app-scaffold
node scripts/process-signals.mjs
```

**What the pipeline does:**

```
Screenshot (signals-inbox/raw/)
↓
OCR text extraction (Tesseract.js)
↓
Noise line filtering (removes OCR garbage, logos, social media chrome)
↓
Signal classification (event / lost_and_found / community_post)
↓
Structured field extraction (title, date, city, description)
↓
Image upload → Supabase storage (community-images bucket)
↓
POST /submit-signal
↓
Lands in community_submissions table (needs_review = true)
```

**If images are not uploading:**

Check that `.env.local` exists in `moho-app-scaffold/` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The pipeline outputs verbose diagnostics — look for `🔑`, `📤`, `✅`, `🌐` log lines to confirm upload status.

**After processing:**

Processed screenshots are moved out of `signals-inbox/raw/` automatically. Check the pipeline log for any errors.

---

## Step 3 — Review Moderation Queue

Open the admin dashboard:

```
https://www.moholocal.com/admin
```

The moderation queue shows pending submissions from the pipeline including:
- Events awaiting approval
- Lost & found pets
- Community posts
- Signals extracted from screenshots

**For each submission, review:**

- Is the title clean and readable?
- Is the date correct?
- Is the city correctly identified?
- Is the image showing the right content (flyer, not Facebook chrome)?
- Does it meet content guidelines (see below)?

**Actions:**

| Action | Result |
|--------|--------|
| Approve | Submission promoted to live table |
| Reject / Dismiss | Submission removed from queue, not published |

---

## Step 4 — Promote Approved Signals

When a submission is approved in `/admin`, it is promoted via:

```
POST /promote-submission
```

The signal moves into the appropriate live table:

| Signal Type | Destination Table |
|-------------|-------------------|
| Event | `events` |
| Lost pet | `lost_and_found` |
| Community post | `community_posts` |

Only promoted signals appear publicly on the site. Pending or rejected submissions are never visible to users.

---

## Step 5 — Directory Maintenance

The business directory may need occasional updates.

**Common tasks:**

Adding new businesses — use seed scripts or the admin interface:
```bash
python3 ~/Desktop/MoHoLocal/seed_businesses_[city].py
```

Approving seeded records — all seed scripts set `status = 'approved'` automatically.

Fixing business information — update via Supabase dashboard or write a targeted SQL update (output as text for manual execution).

Fixing images — update `image_url` on the business record.

**Directory categories:**
- Restaurants
- Health & Wellness
- Retail
- Automotive
- Beauty & Spa
- Education
- Home Services
- Pet Services
- Real Estate

**Current seeded data:**
- Mountain House, Tracy, Lathrop, Manteca — original seed (~202 businesses)
- Brentwood — 200 businesses seeded March 2026

---

## Step 6 — Event Quality Control

Periodically review the events table for quality issues.

**Common problems to check for:**

| Issue | Fix |
|-------|-----|
| Duplicate events | DELETE duplicate rows by title match |
| Bad OCR title (garbled text) | UPDATE title with clean version |
| Missing start_date | UPDATE start_date manually |
| Wrong city | UPDATE city field |
| Stale past events | DELETE events where start_date < today |

**Sample SQL for cleanup (output as text, run manually in Supabase):**

```sql
-- Remove duplicate events by title
DELETE FROM events
WHERE id NOT IN (
  SELECT MIN(id) FROM events GROUP BY title
);

-- Remove past events older than 30 days
DELETE FROM events
WHERE start_date < NOW() - INTERVAL '30 days';
```

---

## Step 7 — Database Cleanup (As Needed)

Occasional cleanup tasks:

**Remove garbled OCR submissions:**
```sql
DELETE FROM community_submissions
WHERE title ~ '[^a-zA-Z0-9\s\.\,\!\?\-\'\"]'
  AND LENGTH(title) < 20;
```

**Remove leftover community posts from bad OCR:**
```sql
DELETE FROM community_posts
WHERE title ILIKE '%[garbled term]%';
```

**Fix corrupted descriptions** — use dollar-quoting for special characters:
```sql
UPDATE events
SET description = $$Clean description text here$$
WHERE id = '[event-id]';
```

**Always preview before deleting:**
```sql
SELECT id, title, city, created_at FROM events
WHERE title ILIKE '%[search term]%';
```

---

## Step 8 — Image Pipeline Monitoring

Images from the screenshot pipeline are uploaded to:

```
Supabase Storage → community-images bucket
```

**Check that images display correctly on:**
- Event cards (`/events`)
- Event detail pages (`/events/[id]`)
- Activity feed (`/activity`)
- Community posts (`/community`)

**If images are not showing:**

1. Check that `image_url` is populated on the record in Supabase
2. Check that the storage bucket RLS policy allows anon reads
3. Verify the public URL format: `https://[project].supabase.co/storage/v1/object/public/community-images/[path]`

**Image display tips:**
- Cards use `object-cover object-center` — this centers the image, avoiding showing social media chrome at the top
- If a flyer image is bottom-heavy, adjust to `object-bottom`

---

## Step 9 — Site Health Check

Periodically verify the site is functioning correctly.

**Checklist:**

- [ ] Homepage loads at moholocal.com
- [ ] `/directory` shows businesses per city
- [ ] `/events` shows upcoming events with images
- [ ] `/lost-and-found` loads correctly
- [ ] `/new-resident` city cards all link correctly
- [ ] `/new-resident/mountain-house` through `/brentwood` all render
- [ ] `/admin` moderation queue is accessible
- [ ] Cloudflare Pages build status is green
- [ ] No TypeScript or build errors in last deployment log

**Cloudflare build log** — check for:
- ✓ Compiled successfully
- All 23 edge routes listed in build output
- No red errors

---

## City Expansion Process

Adding a new city to MoHoLocal:

**Step 1 — Seed the business directory**
```bash
python3 ~/Desktop/MoHoLocal/seed_businesses_[newcity].py
```
Target: 150–200 businesses across all 9 categories.

**Step 2 — Add city to New Resident Guide**

In `app/new-resident/page.tsx` — add city card to `CITIES` array.

In `app/new-resident/[city]/page.tsx` — add:
- Slug mapping in `CITY_SLUGS`
- Theme (gradient + emoji + county) in `CITY_THEME`
- Content (welcome, schools, utilities, essentials, tips) in `CITY_CONTENT`

**Step 3 — Add city branding**

Define the city gradient in both the new-resident page and any city-selector components.

**Step 4 — Update supported city lists**

Update `CLAUDE.md` and `PLAYBOOK.md` with the new city.

**Step 5 — Test and deploy**

- Verify `/new-resident/[new-city-slug]` renders
- Verify `/directory?city=[New City]` shows seeded businesses
- Commit and push — Cloudflare auto-deploys

The platform supports multi-city scaling without any schema changes.

---

## Content Guidelines

MoHoLocal focuses on **positive, community-building content only.**

**Allowed:**
- Community events (festivals, markets, classes, clinics)
- Family and youth activities
- Local business news and openings
- School announcements and activities
- Neighborhood announcements
- Lost and found pets
- Community recommendations

**Not allowed:**
- Crime news or police reports
- Violent incidents
- Political content
- Regional tragedy news
- Divisive or inflammatory posts

**Moderation rule:** When in doubt, reject. It is better to miss a signal than to publish inappropriate content.

---

## Founder Operating Principle

MoHoLocal is designed around a three-layer workflow:

```
Automation collects signals
       ↓
AI assists classification
       ↓
Humans perform moderation
```

**Automation must never bypass moderation.**

Every signal — regardless of source — must pass through the `community_submissions` table and receive explicit human approval before it appears publicly.

---

## Key File Reference

| File | Purpose |
|------|---------|
| `scripts/process-signals.mjs` | OCR pipeline — processes screenshots |
| `signals-inbox/raw/` | Drop screenshots here for processing |
| `app/admin/page.tsx` | Moderation dashboard |
| `app/events/page.tsx` | Events listing page |
| `app/new-resident/[city]/page.tsx` | City guide pages |
| `lib/supabase.ts` | Supabase client + type definitions |
| `seed_businesses_*.py` | Business directory seed scripts |
| `CLAUDE.md` | System architecture + engineering rules |
| `PLAYBOOK.md` | This file — daily operations guide |

---

## Quick Reference — Common Commands

**Process screenshot inbox:**
```bash
node ~/Desktop/MoHoLocal/moho-app-scaffold/scripts/process-signals.mjs
```

**Seed a city's businesses:**
```bash
python3 ~/Desktop/MoHoLocal/seed_businesses_[city].py
```

**Check live site:**
```
https://www.moholocal.com
```

**Admin moderation:**
```
https://www.moholocal.com/admin
```

**Supabase dashboard:**
```
https://supabase.com/dashboard/project/ozjlfgipfzykzrjakwzb
```

**Cloudflare Pages dashboard:**
```
https://dash.cloudflare.com → Pages → moho-app
```

---

## Step 10 — Business Verification Audit

Before any new city's businesses go live or any new batch of businesses is seeded, every listing must be verified against an authoritative source.

**Verification process:**

1. Export all `status = 'approved'` businesses for the target city from Supabase
2. Cross-check each business name + address against Google Maps
3. Classify each as VERIFIED, SUSPECT, or FAKE
4. Write SQL using exact UUIDs to set `verified = true` on confirmed businesses
5. Output SQL as text — founder runs in Supabase SQL Editor
6. Only verified businesses appear on the live site

**Verification SQL pattern (always use exact IDs, never name matching):**

```sql
UPDATE businesses SET verified = true,
  verification_source = 'google_maps_audit_YYYY-MM-DD',
  verified_at = now()
WHERE id = '<exact-uuid>';
```

**Rules:**

- Never use ILIKE or pattern matching in verification SQL — exact UUIDs only
- Never assume a seeded business is real without checking
- If a business cannot be found on Google Maps, it stays `verified = false` (hidden)
- Track the audit date in `verification_source` for provenance
- Duplicates found during audit should be deleted by exact UUID

**Current audit status:**

| City | Status | Verified | Total |
|------|--------|----------|-------|
| Mountain House | Audited 2026-03-12 | 17 | 142 |
| Tracy | Not yet audited | 0 | ~200 |
| Lathrop | Not yet audited | 0 | ~200 |
| Manteca | Not yet audited | 0 | ~200 |
| Brentwood | Not yet audited | 0 | ~200 |

---

## Step 11 — Verified Photo Pipeline (Google Places)

The Google Places photo pipeline is live and operational as of 2026-03-12. Business gallery images are served exclusively from verified sources.

**Current state:**

- All ~3,994 Unsplash stock photos permanently deleted from `business_images`
- `business_images` table columns: `id`, `business_id`, `image_url`, `alt_text`, `position`, `source`, `source_reference`, `verified`, `created_at`
- `seed_business_images.py` permanently disabled (renamed to `.DISABLED`)
- Gallery renders only verified images via query-level enforcement
- Mountain House pipeline complete: 6 businesses, 25 verified photos live

**Supabase Storage setup:**

- Bucket: `business-images` (public read)
- Uploads: Service Role Key (bypasses RLS)
- Image path format: `{business_uuid}/{0-4}.jpg`
- Photos are permanent Supabase Storage URLs (not transient Google API URLs)

**Production workflow:**

Step 1 — Verify businesses in DB (`verified = true` via Google Maps audit — see Step 10)

Step 2 — Dry run:
```bash
cd ~/Desktop/MoHoLocal
python3.11 verify_business_places.py --city "CITY_NAME" --dry-run
```

Step 3 — Review the output. For each business, confirm:
- Name match is confident (not a city page, not ambiguous)
- Address is in the correct city
- No false positives accepted

Step 4 — Real import:
```bash
cd ~/Desktop/MoHoLocal
python3.11 verify_business_places.py --city "CITY_NAME"
```

Step 5 — Confirm galleries render on moholocal.com. Visit business detail pages for the processed city.

**Pipeline flow:**

```
Verified business (verified=true, google_place_id IS NULL)
→ Google Find Place from Text API → candidate
→ Name match validation (ratio >= 0.55, not a city page)
→ Address city validation (must contain expected city)
→ Resolve Place ID → save to businesses.google_place_id
→ Google Place Details API → photo references (max 5)
→ Google Place Photos API → download JPEG bytes
→ Upload to Supabase Storage (business-images/{uuid}/{n}.jpg)
→ INSERT into business_images (source='google_places', source_reference=photo_reference, verified=true)
```

**Pipeline guardrails:**

| Guardrail | How it works |
|-----------|-------------|
| Never overwrite existing `google_place_id` | UPDATE uses `.is_("google_place_id", "null")` — existing values reused |
| Only process verified businesses | Query filters `.eq("verified", True)` at load time |
| Reject city/region results | `is_city_or_region_name()` blocks "Mountain House CA" etc. |
| Reject multiple candidates | `len(candidates) > 1` → skip entire business |
| Reject weak name matches | `SequenceMatcher` ratio < 0.55 → skip |
| Reject loose containment | Shorter string must be >= 60% of longer string length |
| Reject wrong-city addresses | Google address must contain expected city name |
| Max 5 photos per business | `photos[:5]` hard cap |
| Rate limit | 1 second between API calls |
| `source_reference` = `photo_reference` | Not the Place ID (that lives on `businesses` table) |

**Mountain House results (2026-03-12):**

| Business | Photos | Match |
|----------|--------|-------|
| Assure Primary and Urgent Care | 1 | exact (1.00) |
| Browfie & Beauty Bar | 5 | "Browfie Salon" (0.58) |
| Great Clips | 5 | exact (1.00) |
| JEI Learning Center | 4 | exact (1.00) |
| Kumon Math & Reading Center | 5 | "Kumon Math and Reading Center of MH" (0.69) |
| Little Champs Preschool | 5 | exact (1.00) |

11 businesses correctly skipped (no match, wrong city, ambiguous, or city page).

**Scaling to additional cities:**

```bash
# Tracy (after verification audit)
python3.11 verify_business_places.py --city "Tracy" --dry-run
python3.11 verify_business_places.py --city "Tracy"

# Lathrop
python3.11 verify_business_places.py --city "Lathrop" --dry-run
python3.11 verify_business_places.py --city "Lathrop"

# Manteca
python3.11 verify_business_places.py --city "Manteca" --dry-run
python3.11 verify_business_places.py --city "Manteca"
```

Each city must complete its business verification audit (Step 10) before running the photo pipeline.

**Gallery rendering:**

The business detail page query (`getBusinessImages()`) enforces:

```ts
.eq('verified', true)
.in('source', ['google_places', 'owner_upload', 'admin_verified'])
```

If a business has zero matching images, no gallery renders. No placeholders. No fallbacks.

**Acceptable image sources:** `google_places`, `owner_upload`, `admin_verified`

**Prohibited:** stock photos, AI-generated images, scraped images, category placeholders, any image not tied to a verified business identity.

---

## Step 12 — SEO Page Distribution

After deploying new city pages, category pages, or Best Of pages, distribute them to local communities for organic traffic and backlinks.

**Distribution channels:**

- Local Facebook groups (Mountain House Community, Tracy Neighbors, etc.)
- Community newsletters and email lists
- Reddit local threads (r/209, r/BayArea, r/CentralValley)
- Neighborhood forums and community boards
- School parent groups

**Highest-value pages for distribution:**

- Best Of pages (e.g. `/best/restaurants/mountain-house`)
- New Resident Guides (e.g. `/new-resident/tracy`)
- City hub pages (e.g. `/mountain-house`)

These pages provide immediate utility and generate organic backlinks that strengthen domain authority.

---

## Deployment Notes

### Normal deployment flow

```
Claude commits code
→ Push to GitHub main branch
→ Cloudflare Pages auto-builds
→ Live at moholocal.com
```

### Fallback deployment (when Cowork VM cannot access GitHub API)

The Cowork VM proxy blocks `api.github.com`. When this happens, use push scripts from the founder's Mac terminal.

**Push a single file:**
```bash
cd ~/Desktop/MoHoLocal
bash push-one.sh app/page.tsx "commit message here"
```

**Push multiple files in batch:**
```bash
cd ~/Desktop/MoHoLocal
bash push-verified-patch.sh
```

**Push scripts:**

| Script | Purpose |
|--------|---------|
| `push-one.sh` | Push a single file with a commit message |
| `push-to-github.sh` | Push a single file (alternate) |
| `push-verified-patch.sh` | Batch push for verified filter files (9 files) |

These scripts use the GitHub REST API with a PAT stored in the script file. The PAT has no expiration.

**How it works:**

1. Script reads file from `moho-app-scaffold/`
2. Base64 encodes the content
3. Fetches current SHA from GitHub API
4. PUTs the file via GitHub Contents API
5. Each push creates a commit on `main`
6. Cloudflare auto-builds from the last commit

Each file push triggers a separate Cloudflare build. Only the last build matters. Scripts include a 1-second delay between files to avoid rate limiting.

---

## Step 13 — Cron & Worker Trust Model Compliance

All automated jobs in the `moho-ingestion` Cloudflare Worker have been audited against the verified-business / verified-photo trust model (March 2026).

**Safe jobs (no changes needed):**

1. **Directory ingestion** (Mon 03:00 UTC) — All records land as `status='pending'`. Never touches `business_images`. Never sets `verified=true`. The `image_url` field stores an external URL reference only (not a gallery photo).

2. **Events ingestion** (Mon 04:00 UTC) — Most records land as `ingestion_status='pending'`. Eventbrite auto-approve for high-confidence events is acceptable. Does not touch businesses or business_images.

3. **Lost & Found ingestion** (Mon 05:00 UTC) — All records land with `needs_review=true`. No auto-approval. Does not touch businesses or business_images.

4. **Community Signal Inbox** (`POST /submit-signal`) — All submissions require admin approval. `business_update` type never auto-promotes.

**Fixed jobs:**

5. **Sitemap generation** (`GET /api/sitemap`) — Was filtering businesses by `status='approved'` only. Now filters `status='approved' AND verified=true`. Without this fix, unverified businesses would appear in Google's index.

**Retired scripts:**

6. `seed_businesses_5.py` → `.DISABLED` — Was inserting businesses with Unsplash stock `image_url` + `verified: false`
7. `seed_businesses_6.py` → `.DISABLED` — Same as above

**Rules for future cron jobs:**

Any new automated job that touches businesses, images, or public-facing content must comply with:
- Only `verified=true` businesses treated as public
- No stock, placeholder, or unverified images
- Allowed image sources: `google_places`, `owner_upload`, `admin_verified`
- Public counts/listings must filter `verified=true`

---

## Step 14 — Environment Variable Verification Procedure

When an API request fails:

1. Verify the environment variable exists in the runtime environment.
2. Confirm the variable name matches the code reference.
3. Confirm the variable exists in the deployment environment (Cloudflare Pages / Workers).
4. Confirm prior deployments using the same key succeeded.
5. Only after these checks may a new key be requested.

Do not change authentication models (for example service role → anon key) unless verification confirms the key is unavailable.

Troubleshooting must always follow **verify → diagnose → fix**, never assume → change → redeploy.

---

MoHoLocal Operations Playbook v5
March 2026
