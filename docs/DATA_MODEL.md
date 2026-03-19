# MoHoLocal Data Model

> **Version:** March 2026
> **Database:** Supabase (PostgreSQL) — `moholocal-db01`
> **URL:** `https://ozjlfgipfzykzrjakwzb.supabase.co`

---

## Overview

MoHoLocal uses a flat, simple relational model. There are no microservices or complex data pipelines. All tables live in a single Supabase project.

### Core Tables

| Table | Purpose |
|-------|---------|
| `businesses` | Local business directory listings |
| `business_images` | Verified gallery images per business |
| `community_posts` | Community board posts |
| `community_replies` | Replies to community posts |
| `community_submissions` | OCR-extracted / worker-ingested signals awaiting moderation |
| `events` | Local events calendar |
| `lost_and_found` | Lost and found pet listings |
| `post_reactions` | Emoji reactions on community posts |
| `reviews` | Business reviews |

### Growth / Operational Tables

| Table | Purpose |
|-------|---------|
| `claim_requests` | Business ownership claim requests |
| `business_suggestions` | Crowdsourced business suggestions |
| `listing_reports` | Reports of inaccurate or spam listings |

---

## Table Schemas

### businesses

The primary directory table. Only `status = 'approved'` records appear in public views.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `name` | text | Business name |
| `description` | text | Business description |
| `category` | text | Must be one of the 9 canonical categories |
| `city` | text | Must be one of the 4 canonical cities |
| `address` | text | Street address |
| `phone` | text | Phone number (nullable) |
| `website` | text | Website URL (nullable) |
| `rating` | numeric | Average rating (auto-updated by trigger) |
| `review_count` | integer | Review count (auto-updated by trigger) |
| `image_url` | text | Cover image URL (nullable) |
| `status` | text | `approved` / `pending` / `pending_review` / `rejected` |
| `contact_email` | text | Private contact email (not shown publicly) |
| `hours` | text | Free-text hours string (nullable) |
| `claimed` | boolean | Whether listing has been claimed by owner |
| `verified` | boolean | Whether listing is verified |
| `featured` | boolean | Whether listing appears in Featured section |
| `google_place_id` | text | Google Places ID (set by `verify_business_places.py`, nullable) |
| `created_at` | timestamptz | Creation timestamp |

**~1,831 approved+verified records as of March 2026 (~1,324 across 209 cities + 507 South Bay). ~41 Mountain House records in `pending_review` from integrity audit. ~250 records across all cities in pending queue.**

**Query rule:** All public directory queries must filter `.eq('status', 'approved').eq('verified', true)`. Both conditions are required. Setting only one is a no-op — the business will not appear publicly.

#### Canonical Categories

These are the only valid values for `businesses.category`:

```
Restaurants
Health & Wellness
Beauty & Spa
Retail
Education
Automotive
Real Estate
Home Services
Pet Services
```

#### Canonical Cities

These are the valid values for `businesses.city`. There are **8** cities across two regions:

**209 / San Joaquin + Contra Costa (core market):**
```
Mountain House
Tracy
Lathrop
Manteca
Brentwood
```

**South Bay / Santa Clara County (expansion — bars, restaurants, cafes only):**
```
San Jose
Santa Clara
Sunnyvale
```

> South Bay cities are accessible via direct URL (`/san-jose`, etc.) but are NOT in the nav city picker — they have limited category coverage (Restaurants only).

---

### events

Local events calendar.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `title` | text | Event title |
| `description` | text | Event description |
| `start_date` | timestamptz | **Required.** Always sort by this field ascending |
| `end_date` | timestamptz | Event end time (nullable) |
| `location` | text | Venue or address |
| `city` | text | Canonical city |
| `organizer` | text | Organizer name (nullable) |
| `image_url` | text | Event image (nullable) |
| `created_at` | timestamptz | Creation timestamp |

**Query rule:** Always sort with `.order('start_date', { ascending: true })`.

---

### lost_and_found

Lost and found pet listings.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `type` | text | **NOT NULL.** Values: `lost` / `found` / `reunited` |
| `pet_name` | text | Pet name (nullable for found pets) |
| `species` | text | `dog` / `cat` / `other` |
| `breed` | text | Breed description (nullable) |
| `color` | text | Color/markings |
| `city` | text | Canonical city |
| `location_description` | text | Where last seen or found |
| `contact_info` | text | Contact method |
| `image_url` | text | Pet photo URL (nullable) |
| `status` | text | `active` / `reunited` |
| `created_at` | timestamptz | Creation timestamp |

**Storage bucket:** `pet-images`

**Query rule:** Public view filters `.neq('status', 'reunited')` for active listings.

---

### community_posts

Community board posts.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Auth user ID (foreign key) |
| `title` | text | Post title |
| `body` | text | Post content |
| `category` | text | One of the 9 community categories |
| `city` | text | Canonical city |
| `image_url` | text | Optional image (nullable) |
| `created_at` | timestamptz | Creation timestamp |

**Storage bucket:** `community-images`

#### Community Post Categories

```
General
Recommendations
For Sale
Free Items
Jobs
Services
Safety
Neighbors
Question
```

---

### community_replies

Replies to community board posts.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `post_id` | uuid | Foreign key → `community_posts.id` |
| `user_id` | uuid | Auth user ID (foreign key) |
| `body` | text | Reply content |
| `created_at` | timestamptz | Creation timestamp |

---

### reviews

Business reviews submitted by authenticated users.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `business_id` | uuid | Foreign key → `businesses.id` |
| `user_id` | uuid | Auth user ID (foreign key) |
| `rating` | integer | 1–5 star rating |
| `body` | text | Review text |
| `created_at` | timestamptz | Creation timestamp |

**Auto-trigger:** Inserts and deletions on `reviews` automatically update `businesses.rating` and `businesses.review_count` via database trigger.

---

### claim_requests

Tracks business ownership claim requests.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `business_id` | uuid | Foreign key → `businesses.id` |
| `user_id` | uuid | Auth user ID |
| `message` | text | Claimant's message |
| `status` | text | `pending` / `approved` / `rejected` |
| `created_at` | timestamptz | Creation timestamp |

---

### business_suggestions

Crowdsourced business suggestions from residents.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `name` | text | Suggested business name |
| `category` | text | Canonical category |
| `city` | text | Canonical city |
| `address` | text | Address |
| `description` | text | Description |
| `contact_email` | text | Submitter contact (nullable) |
| `status` | text | Always `pending` on insert |
| `created_at` | timestamptz | Creation timestamp |

---

### listing_reports

Reports of inaccurate, spam, or problematic listings.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `business_id` | uuid | Foreign key → `businesses.id` |
| `reason` | text | Report reason |
| `details` | text | Reporter details (nullable) |
| `status` | text | Always `pending` on insert |
| `created_at` | timestamptz | Creation timestamp |

---

### business_images

Verified gallery images for business detail pages.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `business_id` | uuid | Foreign key → `businesses.id` |
| `image_url` | text | Supabase Storage public URL (`business-images/{uuid}/{n}.jpg`) |
| `alt_text` | text | Alt text for accessibility (nullable) |
| `position` | integer | Sort order (0 = primary) |
| `source` | text | `google_places` / `owner_upload` / `admin_verified` |
| `source_reference` | text | Google photo_reference or upload reference |
| `verified` | boolean | Always `true` for displayed images |
| `created_at` | timestamptz | Creation timestamp |

**Storage bucket:** `business-images` (public read)

**Query rule:** Gallery queries enforce `.eq('verified', true).in('source', ['google_places', 'owner_upload', 'admin_verified'])`. Prohibited sources: stock photos, AI-generated, scraped, or any unverified image.

**Current state:** ~1,624 verified photos across South Bay (San Jose 1,075 / Santa Clara 253 / Sunnyvale 296) + 25 Mountain House photos. Unsplash stock images permanently deleted.

---

### community_submissions

Ingestion staging table. Signals from OCR pipeline and worker ingestion land here with `needs_review = true`. Nothing in this table is publicly visible until promoted via `/promote-submission`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `type` | text | `event` / `lost_and_found` / `community_post` / `business_update` |
| `title` | text | Signal title (from OCR or ingestion) |
| `description` | text | Signal body |
| `city` | text | Extracted or inferred city |
| `source` | text | Origin source identifier |
| `image_url` | text | Uploaded signal image (nullable) |
| `raw_data` | jsonb | Raw extracted fields |
| `needs_review` | boolean | Always `true` on insert — human must approve |
| `status` | text | `pending` / `approved` / `rejected` |
| `created_at` | timestamptz | Creation timestamp |

**Rule:** `needs_review = true` and `status = 'pending'` on all inserts. Never auto-approve.

---

### post_reactions

Emoji reactions on community posts.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `post_id` | uuid | Foreign key → `community_posts.id` |
| `user_id` | uuid | Auth user ID (or session ID for anonymous) |
| `reaction_type` | text | Emoji reaction identifier (e.g. `❤️`, `👍`, `🙏`) |
| `created_at` | timestamptz | Creation timestamp |

**Unique constraint:** One reaction type per user per post.

---

## Data Architecture Principles

1. **Approved listings only in public views** — All directory queries must filter both `status = 'approved'` AND `verified = true`
2. **Canonical category system** — Only the 9 listed categories are valid; aliases must be normalized on ingest
3. **City normalization** — Only the 8 canonical city names are valid; no abbreviations or variations. South Bay cities (San Jose, Santa Clara, Sunnyvale) are valid in the DB but have limited category coverage
4. **Duplicate control** — Deduplicate by `(name, city)` before inserting new businesses
5. **Read/write boundaries by role** — Residents can read/contribute; only the admin can approve or modify listings
6. **Always use `ADD COLUMN IF NOT EXISTS`** — Safe schema migration pattern
7. **RLS policies required on all tables** — Row Level Security must be configured before any table goes to production

---

## SQL Operations

All SQL must be output as text for **manual founder execution**. Claude does not run SQL directly.

### Category Normalization (run when needed)

```sql
-- Normalize Education aliases
UPDATE businesses
SET category = 'Education'
WHERE category IN ('Childcare', 'Tutoring', 'Daycare', 'Preschool');

-- Normalize Automotive aliases
UPDATE businesses
SET category = 'Automotive'
WHERE category IN ('Auto Services', 'Auto Repair', 'Car Services');
```

### Deduplicate Approved Businesses

```sql
-- Find duplicates by name and city
SELECT name, city, COUNT(*) as count
FROM businesses
WHERE status = 'approved'
GROUP BY name, city
HAVING COUNT(*) > 1
ORDER BY count DESC;
```

---

## Seed Scripts

Seed scripts are located in `~/Desktop/MoHoLocal/` and run by the founder only.

```
seed_businesses.py
seed_businesses_2.py
seed_businesses_3.py
seed_businesses_4.py
seed_businesses_5.py   ← ⚠️ produced fabricated data (sequential phones/addresses) — do not re-run
seed_businesses_6.py   ← ⚠️ produced fabricated data (sequential phones/addresses) — do not re-run
seed_overpass.py       ← current canonical seed script — 3-rule ingestion safeguard active
seed_southbay.py       ← South Bay expansion (San Jose/Santa Clara/Sunnyvale) — 507 records, founder-authorized --force-approve
seed_events.py
seed_lost_and_found.py
seed_lost_and_found_2.py
```

**Trust policy:** All seed scripts must default to `status='pending'` and `verified=false`. Seed records must never be inserted as `verified=true`. The 3-rule ingestion safeguard (address street number, real phone, non-generic name) must be implemented in every seed script before any insert — see `seed_overpass.py` for the reference implementation and `docs/PLAYBOOK_V1_PRODUCT.md → Seed Ingestion Safeguard` for the full policy.

⚠️ **Note on seed_businesses_5.py and seed_businesses_6.py:** These scripts were found during the Sprint 1 integrity audit to have inserted fabricated records with sequential phone numbers and synthetic addresses into Mountain House. 41 records were flagged `pending_review` as a result. Do not re-run these scripts. They are retained for reference only.

---

*Last updated: March 2026*
