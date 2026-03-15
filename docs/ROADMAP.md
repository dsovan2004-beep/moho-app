# MoHoLocal Product Roadmap

> **Version:** March 2026
> **Source:** MoHoLocal Master Playbook and Product Bible

---

## CURRENT SPRINT — March 2026

**Focus:** Directory UX and regional discovery improvements

1. ~~**Activity Feed Page**~~ ✅ — `/activity` page live (commit 56a8b95)

2. ~~**Business Detail Page UX Improvements**~~ ✅ — Share button, image gallery, map embed (commit 0fe9922)

3. ~~**Pending Queue Audit**~~ ✅ — Tracy, Lathrop, Manteca, Brentwood audited; ~10 businesses approved, fakes/chains removed (commit a3ef577)

4. ~~**Directory Pagination Safety**~~ ✅ — Verified already implemented (PAGE_SIZE=20, load-more pattern)

5. ~~**Regional Discovery Entry**~~ ✅ — `/discover` page live: 5-city × 9-category matrix with live counts, city-aware category nav on homepage (commit c1fd5c0)

6. ~~**Directory Search Improvements**~~ ✅ — Click-to-call, website on cards, claim badge, instant debounced search (commit c1fd5c0)

7. ~~**Mobile Responsiveness**~~ ✅ — Directory, homepage, and business detail pages fixed (commit afcb3dc)

8. ~~**Discovery Page UX**~~ ✅ — Search bar + guidance text added to `/discover` hero (commit 2d56db2)

---

## NEXT SPRINT — Listing Density + FIFA Discovery

**Focus:** Fill the directory, capture event-anchored traffic, and convert business owners.

**Window:** March–May 2026 (FIFA pages must be live before June 2026)

---

### Task 1 — Email Notifications

Scope: transactional emails only. No newsletter infrastructure.

| Trigger | Recipient | Purpose |
|---------|-----------|---------|
| Claim listing submitted | Founder | Alert for manual review and follow-up |
| New business submitted | Submitter | Confirmation + expectation setting |
| Review posted | Business owner (if claimed + email on file) | Trust signal, drives owner engagement |

Implementation notes:
- Use Supabase Edge Functions or a lightweight email provider (Resend recommended — works in Edge Runtime)
- No new database tables required — use existing `businesses.contact_email` and `claimed` fields
- All email content must follow MoHo Local brand voice (warm, hyperlocal, not corporate)

---

### Task 2 — Listing Density Push

**Target:** 2,000+ approved + verified listings across all five cities.

**Current estimate:** ~202 records seeded. Gap: ~1,800 listings.

| City | Priority Categories |
|------|-------------------|
| Mountain House | Restaurants, Home Services, Health & Wellness |
| Tracy | Restaurants, Automotive, Beauty & Spa |
| Lathrop | Home Services, Restaurants, Pet Services |
| Manteca | Restaurants, Health & Wellness, Automotive |
| Brentwood | Restaurants, Beauty & Spa, Pet Services |

**Priority categories (in order):**

1. Restaurants
2. Home Services
3. Health & Wellness
4. Beauty & Spa
5. Automotive
6. Pet Services

**Operating rules:**
- All new records must default to `status='pending'`, `verified=false`
- Only promote to `approved + verified` after Google Maps cross-check
- Use existing seed scripts as templates — no new architecture
- Seed data must be real businesses, real addresses, real phone numbers
- Track progress per city in `docs/DEFERRED_MANUAL_TASKS.md`

---

### Task 3 — FIFA Discovery Pages

**Deadline:** Live before June 2026 (FIFA World Cup at Levi's Stadium, Santa Clara)

**Context:** The 209 corridor is 45–60 min from Levi's Stadium. National directories have not yet targeted these queries. Window to rank is now.

**Pages to build:**

| Route | Target Query | Source Listings |
|-------|-------------|----------------|
| `/restaurants-near-levis-stadium` | "restaurants near Levi's Stadium" | Tracy + Mountain House restaurants |
| `/best-bars-watch-world-cup-san-jose` | "bars to watch World Cup near San Jose" | Tracy + Manteca bars/restaurants |
| `/coffee-near-levis-stadium` | "coffee near Levi's Stadium" | Tracy + Mountain House coffee/café listings |
| `/late-night-food-santa-clara` | "late night food near Santa Clara" | All cities — late-night or extended-hours listings |

**Hard rules for FIFA pages:**
- Must pull from existing `approved + verified` listings — no static content, no fabricated businesses
- Each page requires minimum 3 real listings to publish
- Page must include an intro paragraph with real local guide text (not generic filler)
- Include `ItemList` schema linking to each business
- Include `LocalBusiness` schema on each listed business
- Do not create the page if the listing count is below threshold — defer until density push fills the gap

**Technical approach:**
- New static routes under `app/` (e.g. `app/restaurants-near-levis-stadium/page.tsx`)
- Server component, edge runtime
- Fetches from Supabase using city filter + category filter on existing `businesses` table
- No new tables, no new API routes, no new infrastructure

---

### Sprint Success Criteria

- [ ] Email notifications live for 2 of 3 triggers (claim + submission)
- [ ] Total approved + verified listings ≥ 2,000
- [ ] At least 2 FIFA discovery pages live with ≥ 3 listings each
- [ ] All new pages indexed in Google Search Console within 30 days
- [ ] Claim listing click rate holds or increases after density push

---

## DATA EXPANSION — City Coverage

**Purpose:** Increase verified business coverage across the regional corridor.

**Target:** 500–1,000 verified businesses per city.

| City | County | Coverage Goal |
|------|--------|---------------|
| Mountain House | San Joaquin | 500–1,000 verified |
| Tracy | San Joaquin | 500–1,000 verified |
| Lathrop | San Joaquin | 500–1,000 verified |
| Manteca | San Joaquin | 500–1,000 verified |
| Brentwood | Contra Costa | 500–1,000 verified |

**Focus categories (in priority order):**

1. Restaurants
2. Health Services
3. Beauty Services
4. Home Services
5. Fitness
6. Automotive

**Operating rules:**

- All new businesses must pass Google Maps verification before being set to `approved + verified`
- Seed scripts must default to `status='pending'` and `verified=false`
- Bulk seeding must use the trust policy guard (`validate_trust_policy()`) before any network calls
- This is an ongoing effort — not gated on sprint completion

---

## Overview

The MoHoLocal roadmap is organized into 6 sequential phases, progressing from platform stability through full regional expansion. Each phase builds on the previous one. Features are not added unless they pass the [Design Standard](#design-standard).

---

## Phase 1 — Platform Stability ✅

**Goal:** Core platform works reliably for real residents.

- Homepage search routing
- Default All Cities behavior
- Directory search and keyword filtering
- Category chip navigation
- Approved listing enforcement (`status = 'approved'` AND `verified = true` on all public queries)
- Edge runtime on all pages
- Mobile responsiveness baseline

---

## Phase 2 — UX Improvements ✅

**Goal:** The platform feels polished and trustworthy on mobile.

- City branding badges on directory cards
- Mobile filters on directory page
- Empty-state improvements with call-to-action prompts
- Improved business detail pages
- Featured businesses section on homepage

---

## Phase 3 — Contribution Features ✅

**Goal:** Residents can actively contribute to the platform.

- Suggest a Business (`/suggest-business`)
- Report Listing (`/report-listing/[id]`)
- Claim This Business (`/claim-listing/[id]`)
- Post to Community Board

---

## Phase 4 — Growth Engine

**Goal:** Drive repeat visits and social sharing.

- Neighborhood activity feed
- Weekly local digest (email or in-app)
- Automated AI summaries for businesses and events
- Improved shareability (Open Graph, social cards)

---

## Phase 5 — Revenue

**Goal:** Monetize without compromising trust.

- Featured listing monetization (homepage + directory)
- Sponsored category placements
- Premium verified business profiles
- Business owner tools (analytics, profile editing)

---

## Phase 6 — Expansion

**Goal:** Replicate the city model across new markets.

- ✅ Tracy (San Joaquin County) — seeded, audit in progress
- ✅ Lathrop (San Joaquin County) — seeded, audit in progress
- ✅ Manteca (San Joaquin County) — seeded, audit in progress
- ✅ Brentwood (Contra Costa County) — seeded, audit in progress
- Stockton (San Joaquin County) — future
- Repeatable city launch model

---

## Current Sprint Priorities

From CLAUDE.md §10 — active engineering focus:

1. ~~Data quality improvements~~ ✅
2. ~~Business detail page UX~~ ✅
3. ~~SEO category pages (`/[city]/[category]`)~~ ✅
4. ~~Mobile responsiveness~~ ✅ (commit afcb3dc)
5. ~~Directory search improvements~~ ✅
6. **Email notifications** ← active (see Listing Density + FIFA Discovery sprint)
7. Community board improvements
8. Worker cron agents for event ingestion
9. Featured listings monetization
10. ~~Pending queue audit~~ ✅

**Active sprint:** Listing Density + FIFA Discovery (see section above)

---

## SEO Strategy — Directory Discovery Model

*Added March 2026*

### Core Principle

Every page must target a real search query. MoHoLocal grows through organic search by matching the way real residents and visitors actually phrase their needs.

### Three-Layer Traffic Model

```
Google Search
  → Discovery Page (broad intent)
    → City + Category Page (focused intent)
      → Business Detail Page (transactional intent)
        → Claim Listing (acquisition)
```

### Layer 1 — Discovery Pages (broad)

Existing assets:
- `/discover` — regional hub with live city × category matrix
- `/[city]` — city landing pages (Mountain House, Tracy, Lathrop, Manteca, Brentwood)

Targets: `"local businesses mountain house ca"`, `"things to do in tracy ca"`, `"lathrop directory"`

### Layer 2 — City + Category Pages (focused)

Existing assets:
- `/[city]/[category]` — e.g. `/tracy/restaurants`, `/mountain-house/automotive`

These are the primary SEO workhorses. 5 cities × 9 categories = 45 indexed pages, each targeting a real local query. Must include:
- `<title>` with city + category + "CA | MoHoLocal"
- SEO intro paragraph with natural keyword use
- LocalBusiness schema on individual listings
- BreadcrumbList schema on the page

### Layer 3 — Business Detail Pages (transactional)

Existing assets:
- `/business/[id]` — individual business pages

Each page must include LocalBusiness schema with:
```json
{
  "@type": "LocalBusiness",
  "name": "...",
  "address": { "@type": "PostalAddress", ... },
  "telephone": "...",
  "url": "..."
}
```

### Discovery Pages — High Priority (FIFA Growth Sprint)

Add event- and landmark-anchored discovery pages targeting high-intent searches tied to major regional draws. These pages require no new backend — they pull from existing approved listings filtered by city.

Priority targets (FIFA World Cup 2026 at Levi's Stadium, June 2026):

| Page | Target Query |
|---|---|
| `/near-levis-stadium` | "restaurants near Levi's Stadium" |
| `/restaurants-near-levis-stadium` | "food near Levi's Stadium FIFA" |
| `/tracy/game-day` | "where to eat before San Jose FC match" |
| `/manteca/game-day` | "restaurants near Santa Clara stadium" |

Each discovery page must:
- Target one specific search query in title + H1
- Include 2–3 sentences of real local guide text (not generic)
- Pull verified listings from the database (no static content)
- Link to business detail pages
- Include LocalBusiness schema on each listed business

### Structured Data Rules

All city+category pages: `BreadcrumbList` schema
All business detail pages: `LocalBusiness` (or `Restaurant`, `AutoRepair`, etc.) schema
Discovery pages: `ItemList` schema linking to businesses

### What NOT to Do

- Do not create empty category pages with no listings
- Do not swap city names into identical template pages (Google doorway page penalty)
- Do not scrape or fabricate listings
- Each page must have at least 3 real verified listings to be worth indexing

### Success Metrics

- `/[city]/[category]` pages indexed in Google Search Console
- Organic impressions growing month over month
- Business detail pages appearing for brand-name queries
- "Claim Listing" actions increasing (indicates organic discovery by business owners)

---

## Design Standard

Before adding any feature to the roadmap, it must pass all six questions:

1. Does this improve local usefulness?
2. Does this improve repeat usage?
3. Does this improve trust?
4. Does this increase contribution?
5. Can this scale city to city?
6. Does this keep the platform simple?

**If the answer is no to any of these, do not build it yet.**

---

## Monetization Strategy by Phase

| Phase | Strategy |
|-------|----------|
| Phase 1–3 | No hard monetization — focus on utility and data quality |
| Phase 4–5 | Introduce featured listings, premium profiles, sponsored homepage sections |
| Phase 5–6 | Add newsletter sponsorships, local deals, category sponsorships, premium business claim tools |

### Revenue Model Examples

- Featured business listings (homepage + directory)
- Sponsored placement in category pages
- Premium verified business profiles
- Newsletter ads
- Local service advertising

---

## Success Metrics

### Product Health

- Approved listings count
- Percentage of listings with contact completeness
- Duplicate rate
- Featured listing usage

### Community Health

- Community posts per week
- Event submissions per week
- Lost pet posts and reunions
- Business suggestions submitted

### Behavior Signals

- Repeat users
- Direct type-in traffic
- Search usage rate
- Directory-to-business clickthrough

### Revenue Signals

- Claim requests from real business owners
- Featured placement demand
- Inbound sponsor interest

---

*Last updated: March 2026*
