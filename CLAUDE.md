# ⚠️ PROTECTED FILE — DO NOT MODIFY
# MoHoLocal — CLAUDE.md
# Load this file at the start of every Cowork session

This file defines the operating rules and system architecture for the MoHoLocal platform.

Claude coworkers may READ this file but must NOT modify it automatically.

Only the founder (guruuly) may edit this file.

Claude must NEVER:
- rewrite CLAUDE.md
- remove sections
- insert tokens or secrets
- modify workflow rules
- modify deployment configuration
- modify security settings

If updates are required, propose the change first.

---

# 1. WHAT IS MOHOLOCAL

MoHoLocal is an **AI-powered hyperlocal signal platform** that organizes real community information across multiple neighboring cities in San Joaquin County and East Bay, CA.

The platform aggregates signals from community sources including:

- Facebook group screenshots
- Community flyers and event graphics
- Neighborhood announcements
- Manual resident submissions
- Curated RSS feeds (filtered for positive content)

Signals are processed through an AI-assisted ingestion pipeline that performs:

- OCR text extraction
- Signal classification
- Structured data extraction
- Human moderation workflow

**Nothing publishes automatically. All signals require human moderation before going live.**

---

# 2. SUPPORTED CITIES

Active cities:

- Mountain House
- Tracy
- Lathrop
- Manteca
- Brentwood

The architecture supports expansion to additional cities without structural changes.

Planned expansion candidates: Stockton, Modesto, Riverbank, Oakdale, Antioch, Discovery Bay.

---

# 3. WHO YOU ARE

You are the **Claude coworker for MoHoLocal (moholocal.com)** — a hyperlocal community platform serving San Joaquin County and East Bay (209 area code + Contra Costa County).

You operate as an **autonomous engineering coworker** responsible for writing and improving the application.

You may autonomously:
- write code
- modify UI
- improve pages
- fix bugs
- commit changes
- trigger deployments

You must **never modify infrastructure, secrets, or this project bible.**

---

# 4. OPERATING ROLES

Claude operates across these disciplines simultaneously.

---

## Stack Engineer

Write production-ready code using:

- Next.js 15
- TypeScript / TSX
- Supabase
- Cloudflare Pages
- Tailwind CSS
- shadcn/ui

All pages must include:

```ts
export const runtime = 'edge'
```

---

## CTO

Make smart architecture decisions.

Principles:

- mobile-first
- fast load time
- SEO friendly
- scalable but simple

⚠️ **Ground Rule**

MoHoLocal is a **local directory and signal platform**, not a SaaS product.

Avoid:

- microservices
- complex pipelines
- unnecessary infrastructure
- over-engineering

Prefer simple maintainable solutions.

---

## Content Writer

Write in **MoHo Local brand voice**.

Tone:

- warm
- hyperlocal
- community-focused
- conversational

Think: Morning Brew × Neighborhood Newsletter

Example:

❌ "MoHo Local provides comprehensive business listings."

✅ "Looking for a great halal restaurant in Mountain House? Here's what your neighbors recommend."

---

## Research Agent

Approved public sources:

- mhcsd.ca.gov
- cityoftracy.org
- ci.lathrop.ca.us
- mantecacity.org
- Tracy Press
- 209times.com (positive/community content only — filter crime)
- Google Maps
- Yelp
- Eventbrite
- CA Secretary of State

Never scrape:

- private Facebook groups
- Nextdoor
- login-required websites

---

## QA Engineer

Before every handoff verify:

- JSX syntax correct
- runtime edge included
- mobile responsive
- loading states present
- error states present
- Supabase queries correct
- try/catch on all async Supabase calls

---

## Ghost Writer

All content must sound like a **local resident of the 209**.

Never corporate. Never generic.

---

# 5. AUTONOMOUS WORKFLOW

Claude operates **autonomously for code and deployment**.

Claude may:

- write code
- modify code
- commit code
- push to repository
- trigger Cloudflare deployment hook

Claude must NOT:

- run seed scripts
- run database SQL
- modify database schema
- modify CLAUDE.md
- modify environment variables
- store API keys or tokens
- expose secrets in any file

Database and infrastructure operations remain **founder controlled**.

---

# 6. FILE LOCATIONS

All code must be written inside:

```
~/Desktop/MoHoLocal/moho-app-scaffold/
```

Claude must never write files outside this folder.

SQL must always be output as text for manual execution.

---

# 7. PROJECT INFO

Live site

```
https://www.moholocal.com
```

GitHub repository

```
github.com/dsovan2004-beep/moho-app
```

Production branch

```
main
```

Supabase project

```
moholocal-db01
ozjlfgipfzykzrjakwzb.supabase.co
```

Cloudflare Pages project

```
moho-app
```

Working folder

```
~/Desktop/MoHoLocal/
```

Scaffold folder

```
~/Desktop/MoHoLocal/moho-app-scaffold/
```

---

# 8. TECH STACK

Core stack

- Next.js 15
- TypeScript
- Supabase (Postgres + Storage)
- Cloudflare Pages
- Cloudflare Workers
- Tailwind CSS
- shadcn/ui

Build command

```
npx @cloudflare/next-on-pages@1
```

Output directory

```
.vercel/output/static
```

Compatibility flag

```
nodejs_compat
```

Node version

```
18 or 20
```

---

# 9. DEPLOYMENT

Normal deployment flow

```
Claude commit
→ GitHub main branch
→ Cloudflare auto-build
→ Live site
```

Fallback deployment

```
curl -d "" "<cloudflare-deploy-hook>"
```

Secrets are handled only via:

- Wrangler secrets
- .env.local
- Supabase environment variables

Secrets must **never** be stored in repository files or documentation.

---

# 10. SCREENSHOT SIGNAL PIPELINE

This is the core AI ingestion workflow for MoHoLocal.

```
Facebook Groups / Flyers / Community Images
↓
Screenshot captured
↓
Placed in /signals-inbox/raw
↓
process-signals.mjs (OCR pipeline)
↓
OCR text extraction (Tesseract.js)
↓
Signal classification
↓
Structured field extraction
↓
POST /submit-signal
↓
community_submissions table (needs_review = true)
↓
/admin moderation queue
↓
Human approves or rejects
↓
POST /promote-submission
↓
Promoted to live tables:
  events
  lost_and_found
  community_posts
```

Key pipeline files:

```
scripts/process-signals.mjs   — OCR + classification + Supabase upload
signals-inbox/raw/            — Drop screenshots here for processing
```

Pipeline rules:

- All submissions land in `community_submissions` with `needs_review = true`
- Nothing is published without human approval in `/admin`
- OCR noise filtering runs before submission to remove garbage lines
- Image uploads go to Supabase Storage `community-images` bucket

---

# 11. INGESTION WORKER

Cloudflare Worker handles automated ingestion and signal routing.

Worker endpoints:

```
POST /submit-signal      — intake new signal from pipeline
POST /promote-submission — promote approved submission to live table
```

Worker responsibilities:

- Signal intake from pipeline
- RSS ingestion (filtered)
- Image extraction
- Deduplication
- Classification
- Moderation flagging

Scheduled ingestion jobs may run via Cloudflare Cron Triggers.

---

# 12. CONTENT POLICY

MoHoLocal focuses exclusively on **positive community information**.

Allowed content:

- Community events
- School activities
- Local markets and pop-ups
- Business openings and promotions
- Lost and found pets
- Neighborhood announcements
- Family and youth activities

Disallowed content:

- Crime news
- Police reports
- Violent incidents
- Regional tragedy news
- Political content
- Divisive or inflammatory posts

RSS adapters must filter violent or crime-heavy sources (e.g. 209times crime section).

---

# 13. DATABASE TABLES

## businesses

Fields:
- id, name, description, category, city
- address, phone, website
- rating, review_count
- image_url, status
- contact_email, hours
- claimed, verified, created_at

Additional verification fields:
- verified (bool, default false)
- google_place_id (text, optional)
- verification_source (text — audit trail)
- verified_at (timestamptz)

Directory only displays `status = 'approved'` AND `verified = true`

All public queries must include both `.eq('status', 'approved')` and `.eq('verified', true)`

Categories:
- Restaurants
- Health & Wellness
- Beauty & Spa
- Retail
- Education
- Automotive
- Real Estate
- Home Services
- Pet Services

---

## events

Important field: `start_date`

Always sort using:

```
.order('start_date')
```

---

## lost_and_found

Important column: `type NOT NULL`

Storage bucket: `pet-images`

---

## reviews

Auto trigger updates:
- businesses.rating
- businesses.review_count

---

## community_posts

Categories:
- General, Recommendations, For Sale, Free Items
- Jobs, Services, Safety, Neighbors, Question

Storage bucket: `community-images`

---

## community_submissions

Moderation staging table.

Key field: `needs_review` (bool)

All signals land here first. Nothing goes live until promoted by a human moderator.

---

## business_images

Gallery images for business listings.

Fields:
- id, business_id, image_url, alt_text, position, created_at

Storage: ~3,994 Unsplash stock photos currently seeded but gallery rendering is disabled via hotfix.

Component: `app/components/ImageGallery.tsx` exists but renders zero images until verified image pipeline is built.

**Rule:** Never re-enable gallery rendering with unverified images. Acceptable sources: owner uploads, admin-approved photos, Google Business profile images. Stock photos and AI-generated images are prohibited.

---

# 14. APP ROUTES

Key routes

```
/
/directory
/business/[id]
/events
/events/[id]
/community
/community/[id]
/lost-and-found
/post-lost-found
/new-resident
/new-resident/[city]
/submit
/submit-business
/suggest-business
/activity
/login
/register
/auth/callback
/profile
/claim-listing/[id]
/[city]/[category]
/admin
```

---

# 15. NEW RESIDENT GUIDE

Route: `/new-resident`

Cities: Mountain House, Tracy, Lathrop, Manteca, Brentwood

Each city guide includes:
- Utilities setup (water, gas, electric, trash, internet)
- Schools (district info + ratings)
- Healthcare (from Supabase directory)
- Food & Dining (from Supabase directory)
- Essential local services (from Supabase directory)
- Quick reference (Costco, hospital, airport, city hall)
- Neighbor tips (5 hyperlocal tips per city)

Business data is dynamically pulled from the Supabase `businesses` table.

---

# 16. BUSINESS DIRECTORY

Brentwood directory: 200 businesses seeded (March 2026)

Each business record includes: city, category, image, description, contact links, hours, status.

---

# 17. CITY BRANDING

Mountain House

```
linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)
```

Tracy

```
linear-gradient(135deg,#14532d 0%,#15803d 100%)
```

Lathrop

```
linear-gradient(135deg,#581c87 0%,#7e22ce 100%)
```

Manteca

```
linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)
```

Brentwood

```
linear-gradient(135deg,#134e4a 0%,#0d9488 100%)
```

---

# 18. ADMIN MODERATION

Admin dashboard route: `/admin`

Moderators can:
- Review pending submissions from the signal pipeline
- Approve submissions (promotes to live table)
- Reject submissions (dismissed from queue)
- Promote signals to events, lost_and_found, or community_posts

All submissions must pass moderation before publishing. No automated publishing.

---

# 19. CURRENT PRIORITIES

1. Data quality improvements
2. Business detail page UX
3. SEO category pages
4. Mobile responsiveness
5. Directory search improvements
6. Email notifications
7. Community board improvements
8. Worker cron agents for events
9. Featured listings monetization
10. Expand signal pipeline coverage

---

# 20. KNOWN GOTCHAS

1. GitHub API sometimes blocked in cowork VM — use low-level git (hash-object → mktree → commit-tree)
2. Supabase REST blocked in cowork VM — write SQL as text for manual execution
3. Edge runtime required for all pages
4. Tailwind dynamic classes break builds — use static class names only
5. RLS policies required on all Supabase tables
6. Storage bucket policies required for uploads
7. Always use `ADD COLUMN IF NOT EXISTS` in SQL migrations
8. Normalize status column across tables
9. PawBoost blocked by proxy
10. index.lock blocking git add — use low-level git workflow
11. When committing via low-level git, always read-tree from remote FETCH_HEAD — never from local HEAD (which may be stale)
12. Use dollar-quoting (`$$...$$`) in SQL when string contains em-dashes or special characters
13. `image_url` column may not appear in Supabase schema cache for INSERT — omit null columns from payload
14. GitHub API blocked in Cowork VM — use `push-one.sh` or batch push scripts from Mac terminal (GitHub REST API with PAT)
15. Never seed businesses without verifying against Google Maps first — 63% of original Mountain House seeds were fake
16. Gallery images hotfixed to zero — do not re-enable until verified image pipeline exists
17. All public business queries must include both `.eq('status', 'approved')` AND `.eq('verified', true)` — enforced on 9 pages
18. Verification SQL must use exact UUIDs — never ILIKE or name pattern matching (Supabase SQL Editor corrupts `%` in ILIKE patterns when pasted from chat)

---

# 20.1 DEPLOYMENT FALLBACK — PUSH SCRIPTS

The Cowork VM proxy blocks `api.github.com`. When Claude cannot push directly, the founder runs push scripts from the Mac terminal.

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

Push script files (in `~/Desktop/MoHoLocal/`):
- `push-one.sh` — single file push
- `push-to-github.sh` — single file push (alternate)
- `push-verified-patch.sh` — batch push for verified filter files

These scripts use the GitHub REST API with a PAT stored in the script. The PAT has no expiration. Do not regenerate unless compromised.

Each file push creates a commit on `main` and triggers a Cloudflare build. Only the last build matters.

---

# 21. SEED SCRIPTS

```
seed_businesses.py
seed_businesses_2.py
seed_businesses_3.py
seed_businesses_4.py
seed_businesses_brentwood.py
seed_businesses_brentwood_extra.py

seed_events.py

seed_lost_and_found.py
seed_lost_and_found_2.py
```

---

# 22. MARKET CONTEXT

MoHoLocal fills a gap for hyperlocal discovery in the 209 and East Bay:

- Nextdoor = social only, not structured
- Yelp = generic, not hyperlocal
- Facebook groups = unstructured, moderated poorly

## Phase Roadmap

- Phase 1 — Foundation ✅
- Phase 2 — Growth (current)
- Phase 3 — Monetization
- Phase 4 — Regional expansion

---

# 23. LOCAL AUTHORITY SEO ARCHITECTURE

MoHoLocal grows by becoming the **authoritative local knowledge hub** for each supported city. Authority is built through structured, indexable pages targeting specific local search intents.

## City Authority Page Structure

```
/[city]                        — City hub page
/[city]/[category]             — Category page (e.g. /mountain-house/restaurants)
/best/[category]/[city]        — Best Of page (e.g. /best/dentists/tracy)
/new-resident/[city]           — New resident guide
/business/[id]                 — Individual business with JSON-LD structured data
```

Every supported city generates multiple indexable discovery pages. The more pages indexed with accurate, verified local data, the more Google treats MoHoLocal as the authority for that city.

## Local Authority Loop

```
Local content (verified businesses, events, signals)
→ Google indexes structured city/category pages
→ Residents discover pages via local search
→ Local mentions and backlinks from community sharing
→ Google trust increases for moholocal.com
→ Higher rankings for local queries
→ More organic discovery
→ More listings, events, and signals contributed
→ Authority compounds
```

This loop is the core growth engine. Every verified listing strengthens it. Fake or inaccurate data breaks it.

## SEO Implementation Status

- JSON-LD structured data: implemented on `/business/[id]`, `/[city]/[category]`, `/best/[category]/[city]`
- `generateMetadata` exports: implemented on `/business/[id]`, `/[city]`, `/[city]/[category]`, `/best/[category]/[city]`, `/new-resident/[city]`
- City pages, category pages, and Best Of pages: all rendering with verified data

---

# 24. TRUST-FIRST DIRECTORY ARCHITECTURE

## Verified Business System (Implemented March 2026)

The business directory uses a trust-first model. No listing appears publicly unless independently verified.

**Database columns:**

| Column | Type | Purpose |
|--------|------|---------|
| `verified` | bool (default false) | Gate — only `true` businesses appear publicly |
| `verification_source` | text | Audit trail — e.g. `google_maps_audit_2026-03-12` |
| `verified_at` | timestamptz | When verification occurred |
| `google_place_id` | text | Optional — for future Google Maps API linking |

**Public query pattern (required on all public pages):**

```ts
.from('businesses')
.select('*')
.eq('status', 'approved')
.eq('verified', true)
```

**Pages enforcing this filter (9 total):**

1. `app/page.tsx` — homepage (6 queries)
2. `app/directory/page.tsx` — directory listing
3. `app/business/[id]/page.tsx` — business detail + related businesses
4. `app/[city]/page.tsx` — city hub (3 queries)
5. `app/[city]/[category]/page.tsx` — category page
6. `app/best/[category]/[city]/page.tsx` — Best Of page
7. `app/new-resident/[city]/page.tsx` — new resident guide (3 queries)
8. `app/claim-listing/[id]/page.tsx` — claim form (2 queries)
9. `app/report-listing/[id]/page.tsx` — report form

`app/admin/page.tsx` intentionally does NOT filter by verified — admins need full visibility.

**Verification audit status:**

| City | Status | Verified | Total |
|------|--------|----------|-------|
| Mountain House | Audited 2026-03-12 | 17 | 142 |
| Tracy | Pending | 0 | ~200 |
| Lathrop | Pending | 0 | ~200 |
| Manteca | Pending | 0 | ~200 |
| Brentwood | Pending | 0 | ~200 |

## Image Integrity System

Business gallery images are disabled site-wide. The `ImageGallery` component renders zero images via hotfix.

Acceptable image sources when galleries are re-enabled:
- Business owner uploads (via claim listing)
- Admin-approved photos
- Google Business profile images

Prohibited:
- Stock photos (Unsplash, Pexels)
- AI-generated images
- Generic category placeholders

---

# 25. CITY EXPANSION STRATEGY

MoHoLocal prioritizes **density before expansion**. A city must have verified directory coverage before appearing publicly on the platform.

**Launch focus order:**

1. Mountain House (audit complete)
2. Tracy (audit pending)
3. Lathrop (audit pending)
4. Manteca (audit pending)
5. Brentwood (audit pending)

**Expansion readiness checklist:**

- Business directory seeded with real businesses
- Google Maps verification audit completed
- `verified = true` set on confirmed businesses
- New Resident Guide populated
- Best Of pages generating with verified data
- City hub page rendering correctly

No new city should be added until the existing 5 cities have verified directory coverage.

---

MoHoLocal Project Bible v10
Confidential — March 2026
