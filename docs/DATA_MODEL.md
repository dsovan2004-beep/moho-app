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
| `community_posts` | Community board posts |
| `community_replies` | Replies to community posts |
| `events` | Local events calendar |
| `lost_and_found` | Lost and found pet listings |
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
| `status` | text | `approved` / `pending` / `rejected` |
| `contact_email` | text | Private contact email (not shown publicly) |
| `hours` | text | Free-text hours string (nullable) |
| `claimed` | boolean | Whether listing has been claimed by owner |
| `verified` | boolean | Whether listing is verified |
| `featured` | boolean | Whether listing appears in Featured section |
| `created_at` | timestamptz | Creation timestamp |

**~202 records seeded as of March 2026.**

**Query rule:** All public directory queries must filter `.eq('status', 'approved')`.

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

These are the only valid values for `businesses.city`:

```
Mountain House
Tracy
Lathrop
Manteca
```

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

## Data Architecture Principles

1. **Approved listings only in public views** — All directory queries must filter `status = 'approved'`
2. **Canonical category system** — Only the 9 listed categories are valid; aliases must be normalized on ingest
3. **City normalization** — Only the 4 canonical city names are valid; no abbreviations or variations
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
seed_events.py
seed_lost_and_found.py
seed_lost_and_found_2.py
```

---

*Last updated: March 2026*
