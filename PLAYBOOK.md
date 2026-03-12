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

## Step 11 — Image Verification

Business gallery images are currently disabled site-wide via a hotfix.

**Current state:**

- `business_images` table exists with ~3,994 Unsplash stock photos seeded
- `ImageGallery` component exists but renders zero images (hotfix: `verifiedImages = []`)
- Stock photos proved misleading (wrong images for businesses)

**Before re-enabling galleries:**

1. Delete all stock/Unsplash images from `business_images` table
2. Build image upload flow for business owners (via claim listing)
3. Add admin approval step for uploaded images
4. Only then remove the gallery hotfix

**Acceptable image sources:**

- Business owner uploads
- Admin-approved photos
- Google Business profile images

**Prohibited image sources:**

- Stock photos (Unsplash, Pexels, etc.)
- AI-generated images
- Generic category placeholders

Never re-enable galleries with unverified images. The system must block misleading photos before they go live.

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

MoHoLocal Operations Playbook v2
March 2026
