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

## CLOSED SPRINT — Listing Density + FIFA Discovery ✅

**Focus:** Fill the directory, capture event-anchored traffic, and convert business owners.

**Window:** March 2026

### Sprint Outcome

| Task | Status |
|------|--------|
| Email notifications (claim + submission flows) | ✅ Complete |
| Overpass seeding via `seed_overpass.py` (+285 new candidates) | ✅ Complete |
| 527 listings promoted → 1,324 approved + verified total | ✅ Complete |
| `/restaurants-near-levis-stadium` | ✅ Live |
| `/coffee-near-levis-stadium` | ✅ Live |
| `/best-bars-watch-world-cup-san-jose` | ✅ Live |
| TypeScript undefined rating fix (commit `3140d36`) | ✅ Complete |
| Google Search Console submission (all 3 FIFA pages) | ✅ Complete |
| Mountain House restaurant integrity audit | ✅ Complete — 41 of 48 records flagged as `pending_review` (fabricated seed data from earlier scripts) |
| `seed_overpass.py` 3-rule ingestion safeguard (commit `27ba557`) | ✅ Complete |
| Data source roles policy added to `BULK_IMPORT_DATA_SOURCES.md` (commit `ae12e0a`) | ✅ Complete |

**Held:**
- `/late-night-food-santa-clara` — blocked on `hours` column data. Restore when Yelp Fusion or Google Places hours are available.

### Integrity Audit Note — Mountain House

During this sprint, a review of Mountain House restaurant listings revealed 41 of 48 records contained fabricated data (sequential phone numbers, sequential fake addresses) inserted by earlier seed scripts (`seed_businesses_5.py`, `seed_businesses_6.py`). These records were marked `pending_review` via SQL and removed from the public directory.

Root cause: earlier seed scripts did not enforce address, phone, or name validation before insertion.

Fix: `seed_overpass.py` now implements the 3-rule ingestion safeguard at insert time. All future seed scripts must follow the same pattern (see `PLAYBOOK_V1_PRODUCT.md → Seed Ingestion Safeguard`).

Open items from this sprint carrying into the next:
1. Verify and restore confirmed real chains (Starbucks, Chipotle, Arco, Safeway) in Mountain House with correct addresses and phones
2. Verify 5 Tier 5 records (Taqueria La Mexicana, Tandoori Pizza, THub Cafe, Sourdough & Co., Arya Grill) against Google Maps
3. Run the same integrity audit pattern on other cities for the same date-range seed batches

---

## ACTIVE SPRINT — Sprint 2: Data Trust + FIFA Traffic Capture 🏃

**Theme:** Data Trust + FIFA Traffic Capture
**Timebox:** 1 week — March 2026
**Scope constraints:** No new cities. No additional seeding scripts. No schema changes.

---

### ~~Task 1 — Mountain House Data Cleanup~~ ✅ COMPLETE — March 2026

**Outcome:** Mountain House restaurants restored from 2 → 10 approved + verified. All data integrity issues resolved.

| Metric | Before | After |
|--------|--------|-------|
| approved + verified restaurants | 2 | **10** |
| approved + unverified (⚠️ trust gap) | 1 (Arya Grill) | **0** |
| pending_review + verified=true (contradictory) | 12 | **0** |
| pending_review + verified=false (clean) | 27 | **40** |

**Verified and promoted (Yelp + Google Maps + official sites, March 2026):**
- Taqueria La Mexicana — 19697 Mountain House Pkwy — (209) 207-9219 ✅
- Tandoori Pizza — 1140 Traditions St — (209) 784-8100 ✅
- THub Cafe — 1158 Tradition St — (209) 989-8482 ✅
- Sourdough & Co. — 19673 Mountain House Pkwy — (209) 221-0003 ✅
- Starbucks — 19699 Mountain House Pkwy — (209) 322-1517 ✅
- Chipotle Mexican Grill — 18011 W Grant Line Rd — (209) 654-0725 ✅
- Safeway — 19555 S Mountain House Pkwy — (209) 362-1256 ✅
- Fremont Kabob Restaurant — 19693 Mountain House Pkwy — (209) 207-9798 ✅ (bonus insert)
- Spicy Bites — 1166 Tradition St — (209) 901-2982 ✅ (bonus insert, opened Jul 2025)

**Skipped (unverifiable):**
- Arya Grill — real location is in Tracy (21459 S Reeve Rd), not Mountain House — demoted to `pending_review`
- ARCO — no verified Mountain House 95391 address found; Safeway Express fuel (non-ARCO) exists separately

**SQL committed:** `sql/sprint2_mh_cleanup.sql` (commit `777d8e2`)
**Data fixes committed:** `7cfa438` (trustedListings helper), `8905d8c` (doc fixes)

**Integrity rule enforced:** `status='approved'` AND `verified=true` on all public queries — dual trust gate confirmed clean across all 10 restaurant records.

---

### Task 2 — Google Places Verification Pipeline

**Goal:** Implement a lightweight enrichment workflow using Google Places API to verify seeded listings.

**Workflow:**

```
OSM / Overpass → candidate seed → status='pending'
  → Google Places lookup → name match + address match + phone
  → if match: enrich phone/website/place_id, flag for approval
  → founder reviews → approved + verified = true
```

**Implementation rules:**
- Enrich only — never create new rows from Places data
- Match criteria: name similarity ≥ threshold AND address city match
- Enrich fields: `phone`, `website`, `hours`, `place_id`
- Do not auto-set `verified = true` — enrichment flags a record as ready for human review
- Extend `verify_business_places.py` (already exists) — do not create a new script
- No schema changes required

**Out of scope:**
- Bulk Places seeding
- Automated approval
- New database tables

---

### ~~Task 3 — FIFA Discovery Page: Watch Parties~~ ✅ COMPLETE — March 2026

**Goal:** Add one additional FIFA discovery page capturing watch party search intent.

**Page to build:**

| Route | Target Query | Source Listings |
|-------|-------------|----------------|
| `/best-places-watch-world-cup-san-jose` | "best places to watch World Cup near San Jose" | Tracy + Manteca + Lathrop restaurants/bars |

**Rules (same as existing FIFA pages):**
- Must pull from `approved + verified` listings only — no static or fabricated content
- Minimum 3 real listings required to publish
- Intro paragraph must be real local guide text — not generic filler
- Include `ItemList` schema + `BreadcrumbList` schema
- Edge runtime (`export const runtime = 'edge'`)
- No new tables, no new API routes, no new infrastructure

**Existing FIFA pages (reference — do not modify):**
- `/restaurants-near-levis-stadium` ✅ live
- `/coffee-near-levis-stadium` ✅ live
- `/best-bars-watch-world-cup-san-jose` ✅ live

**Held:**
- `/late-night-food-santa-clara` — still blocked on `hours` data. Do not build this sprint.

---

### Sprint 2 Success Criteria

- [x] Mountain House has ≥ 10 real, verified restaurant listings (up from 2) ✅ **10 confirmed**
- [x] All fabricated `pending_review` records resolved — contradictory states corrected ✅
- [x] Tier 5 records verified against Google Maps — 4 promoted, 1 (Arya Grill) correctly skipped ✅
- [x] `verify_business_places.py` enrichment pipeline updated and documented ✅ (commit `7b9db3c`)
- [x] `/best-places-watch-world-cup-san-jose` live with ≥ 3 real listings ✅ (commit `9a8cb3c`)
- [x] New FIFA page submitted to Google Search Console ✅ (March 2026 — indexing requested)

---

## SPRINT 3 — SEO Discovery Expansion ✅ COMPLETE — March 2026

**Focus:** Expand organic search surface area via city/category discovery pages + sitemap + internal linking.

**Commit:** `642b7eb`

### Sprint 3 Outcome

| Task | Status |
|------|--------|
| 5 new city/category discovery pages | ✅ Complete |
| Internal linking — Related Local Guides sections | ✅ Complete |
| Sitemap updated — 9 discovery pages added | ✅ Complete |

### Pages Built

| Route | City | Category | Filter |
|-------|------|----------|--------|
| `/best-restaurants-tracy` | Tracy | Restaurants | All (top by review_count) |
| `/best-coffee-tracy` | Tracy | Restaurants | Coffee/cafe keywords |
| `/best-brunch-manteca` | Manteca | Restaurants | Brunch/breakfast keywords |
| `/best-dentists-mountain-house` | Mountain House | Health & Wellness | Dental keywords |
| `/best-family-restaurants-tracy` | Tracy | Restaurants | Family/cuisine keywords |

### Internal Links Added

- `/best-restaurants-tracy` → coffee, family restaurants, bars (World Cup)
- `/best-coffee-tracy` → restaurants, brunch, Levi's Stadium
- `/best-brunch-manteca` → restaurants, family restaurants, watch parties
- `/best-dentists-mountain-house` → health/wellness, Tracy restaurants, family
- `/best-family-restaurants-tracy` → restaurants, coffee, brunch
- `/restaurants-near-levis-stadium` → updated with both FIFA + Local Guides sections (6 links)
- `/best-places-watch-world-cup-san-jose` → updated with Local Guides section (3 new links)

### Sitemap Changes

Added `DISCOVERY_PAGES` array to `/sitemap.xml/route.ts`:
- 4 existing FIFA pages now explicitly listed
- 5 new Sprint 3 pages added
- All at `changefreq: weekly`

---

## SPRINT 3.5 — South Bay Expansion ✅ COMPLETE — March 2026

**Theme:** Demand → Supply Injection
**Trigger:** FIFA World Cup 2026 at Levi's Stadium (June 2026) + high South Bay search intent
**Founder directive:** Scope officially expanded beyond 209 to Santa Clara County

### Goals

- Seed high-intent business data for South Bay cities
- Support cross-region discovery (209 corridor → Levi's Stadium)
- Capture FIFA-driven and metro search traffic before June 2026
- Validate that no pages return empty states for food/drink queries

### Target Cities

| City | County | Focus |
|------|--------|-------|
| San Jose | Santa Clara County | Bars, Restaurants, Cafes |
| Santa Clara | Santa Clara County | Bars, Restaurants, Cafes |
| Sunnyvale | Santa Clara County | Bars, Restaurants, Cafes |

### Scope Constraints

- Bars, Restaurants, Cafes ONLY — no full-category expansion yet
- No schema changes
- No new UI features
- South Bay cities accessible via direct URL; NOT added to nav city picker

### Sprint 3.5 Final Metrics

| City | Seeded | Enriched | Photos | Match Rate |
|------|--------|----------|--------|------------|
| San Jose | 324 | 215 | 1,075 | 66% |
| Santa Clara | 100 | 52 | 253 | 52% |
| Sunnyvale | 83 | 61 | 296 | 73% |
| **Total** | **507** | **328** | **1,624** | **65%** ✅ |

### Sprint 3.5 Tasks

| Task | Status |
|------|--------|
| `seed_southbay.py` written with Overpass + 3-rule safeguard | ✅ Complete |
| Cross-city dedup fix — OSM city validation + global address dedup | ✅ Complete |
| `[city]/page.tsx` — San Jose, Santa Clara, Sunnyvale added to CITY_MAP | ✅ Complete |
| `[city]/[category]/page.tsx` — South Bay cities added to CITY_MAP | ✅ Complete |
| `verify_business_places.py` — South Bay cities added to city guard list | ✅ Complete |
| BIBLE.md — Market Expansion Policy + Production-Ready Listing Standard added | ✅ Complete |
| PLAYBOOK.md — Expansion Play + image enrichment as mandatory step documented | ✅ Complete |
| Run `seed_southbay.py --force-approve` on founder machine | ✅ Complete — 507 records inserted |
| Spot-check dedup guard — re-run showed 0 new records (all 507 existing) | ✅ Complete |
| Image enrichment — San Jose (`verify_business_places.py --city "San Jose"`) | ✅ Complete — 215 enriched, 1,075 photos |
| Image enrichment — Santa Clara | ✅ Complete — 52 enriched, 253 photos |
| Image enrichment — Sunnyvale | ✅ Complete — 61 enriched, 296 photos |
| BIBLE.md — Expansion Standard v1 section added | ✅ Complete |
| PLAYBOOK.md — Success Criteria + Locked Execution Order added, version bumped to v8 | ✅ Complete |
| Submit `/san-jose`, `/santa-clara`, `/sunnyvale` to Google Search Console | ⬜ Founder action required |

### Success Criteria

- [x] San Jose, Santa Clara, Sunnyvale city pages show restaurant/bar listings
- [x] 507 businesses seeded (324 / 100 / 83 per city)
- [x] Image enrichment complete — 65% overall match rate (≥60% threshold met)
- [x] 1,624 verified Google Places photos saved to Supabase Storage
- [x] Zero duplicate records (dedup guard confirmed idempotent)
- [x] Every enriched listing has at least 1 verified image (Google Places)
- [ ] Submit city pages to Google Search Console (founder action)

### Execution Instructions (Founder)

```bash
# Step 1 — Seed listings (all 3 cities in single command for cross-city dedup)
SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_southbay.py --force-approve

# Step 2 — Image enrichment (REQUIRED — run after seeding)
# Requires GOOGLE_PLACES_API_KEY in .env.local
python3.11 verify_business_places.py --city "San Jose" --dry-run
python3.11 verify_business_places.py --city "San Jose"

python3.11 verify_business_places.py --city "Santa Clara" --dry-run
python3.11 verify_business_places.py --city "Santa Clara"

python3.11 verify_business_places.py --city "Sunnyvale" --dry-run
python3.11 verify_business_places.py --city "Sunnyvale"

# Step 3 — UI validation
# Visit /san-jose, /santa-clara, /sunnyvale and spot-check business detail pages
# Confirm hero image and gallery render (no empty placeholders)
```

> ⚠️ South Bay rollout is NOT complete until image enrichment finishes.
> Do not submit pages to Google Search Console until galleries are live.

### Commits

| Commit | Description |
|--------|-------------|
| `8484e9a` | seed_southbay.py + city page South Bay support |
| `33170fb` | BIBLE.md, ROADMAP.md, PLAYBOOK.md doc alignment |
| `f0a9592` | Cross-city dedup fix (OSM city validation + global address dedup) |
| `adf1580` | seed_southbay.py — auto-load .env.local (_load_env_local() function) |
| *(sprint close)* | BIBLE.md Expansion Standard v1 + PLAYBOOK.md v8 + ROADMAP.md Sprint 3.5 COMPLETE + Sprint 5 |

---

## SPRINT 4 — SEO Surface Expansion ✅ COMPLETE — March 2026

**Focus:** Scale the discovery page layer — new city/category pages, cross-linking mesh, sitemap coverage.

**Commit:** `f48c987`

**Scope constraints:** No schema changes. No DB migrations. No cron changes. No ingestion changes. No UI redesign. SEO + linking only.

### Sprint 4 Outcome

| Task | Status |
|------|--------|
| Task 1 — Discovery links injected into all city/category pages | ✅ Complete |
| Task 2 — Existing discovery pages cross-linked (Related sections expanded) | ✅ Complete |
| Task 3 — 20 new discovery pages created (7 Tracy, 6 Mountain House, 7 Manteca) | ✅ Complete |
| Task 4 — Sitemap updated (DISCOVERY_PAGES 9 → 29 entries) | ✅ Complete |
| Task 5 — Trust model verified on all new pages | ✅ Complete |

### New Pages Built

**Tracy (7 pages)**

| Route | Category | Filter |
|-------|----------|--------|
| `/best-pizza-tracy` | Restaurants | PIZZA_KEYWORDS |
| `/best-breakfast-tracy` | Restaurants | BREAKFAST_KEYWORDS |
| `/best-lunch-tracy` | Restaurants | LUNCH_KEYWORDS |
| `/best-dinner-tracy` | Restaurants | DINNER_KEYWORDS |
| `/best-hair-salon-tracy` | Beauty & Spa | HAIR_KEYWORDS |
| `/best-nail-salon-tracy` | Beauty & Spa | NAIL_KEYWORDS |
| `/best-dentists-tracy` | Health & Wellness | DENTAL_KEYWORDS |

**Mountain House (6 pages)**

| Route | Category | Filter |
|-------|----------|--------|
| `/best-pizza-mountain-house` | Restaurants | PIZZA_KEYWORDS |
| `/best-breakfast-mountain-house` | Restaurants | BREAKFAST_KEYWORDS |
| `/best-lunch-mountain-house` | Restaurants | LUNCH_KEYWORDS |
| `/best-dinner-mountain-house` | Restaurants | DINNER_KEYWORDS |
| `/best-hair-salon-mountain-house` | Beauty & Spa | HAIR_KEYWORDS |
| `/best-nail-salon-mountain-house` | Beauty & Spa | NAIL_KEYWORDS |

**Manteca (7 pages)**

| Route | Category | Filter |
|-------|----------|--------|
| `/best-pizza-manteca` | Restaurants | PIZZA_KEYWORDS |
| `/best-breakfast-manteca` | Restaurants | BREAKFAST_KEYWORDS |
| `/best-lunch-manteca` | Restaurants | LUNCH_KEYWORDS |
| `/best-dinner-manteca` | Restaurants | DINNER_KEYWORDS |
| `/best-hair-salon-manteca` | Beauty & Spa | HAIR_KEYWORDS |
| `/best-nail-salon-manteca` | Beauty & Spa | NAIL_KEYWORDS |
| `/best-dentists-manteca` | Health & Wellness | DENTAL_KEYWORDS |

### Internal Linking Added

**Task 1 — `app/[city]/[category]/page.tsx`**

Added `DISCOVERY_LINKS` static map covering 9 city/category combinations. Injects a "Local Guides" pill row at the bottom of each matching category page — zero extra DB queries.

City/category combos with injected links: `tracy/restaurants` (5 links), `tracy/beauty-spa` (2), `tracy/health-wellness` (1), `mountain-house/restaurants` (3), `mountain-house/health-wellness` (1), `mountain-house/beauty-spa` (2), `manteca/restaurants` (4), `manteca/health-wellness` (1), `manteca/beauty-spa` (2), `lathrop/restaurants` (3). **Total: ~24 new outbound links across 10 category pages.**

**Task 2 — Existing discovery pages updated (9 files)**

Related sections expanded from 3-link flex-row to 5-link flex-wrap layout on:
- `/best-restaurants-tracy`, `/best-coffee-tracy`, `/best-family-restaurants-tracy`
- `/best-brunch-manteca`, `/best-dentists-mountain-house`
- `/restaurants-near-levis-stadium`, `/coffee-near-levis-stadium`
- `/best-bars-watch-world-cup-san-jose`, `/best-places-watch-world-cup-san-jose`

**Total new internal links added (Tasks 1 + 2):** ~69

### Sitemap Update

`DISCOVERY_PAGES` in `app/sitemap.xml/route.ts` expanded from 9 → 29 entries (+20 Sprint 4 pages). All new entries at `changefreq: weekly`. Static URL count increases from ~117 → ~137.

### Trust Model

All 20 new discovery pages enforce dual trust gate:
```ts
.eq('status', 'approved')
.eq('verified', true)
```
No page deviates. Keyword fallback (`featured.length < 3 → show all`) still enforces the same gate — broader pool, same trust requirements.

### GSC Indexing (Founder Action Required)

Submit all 20 new pages in Google Search Console → URL Inspection → "Request Indexing":

```
/best-pizza-tracy               /best-pizza-mountain-house         /best-pizza-manteca
/best-breakfast-tracy           /best-breakfast-mountain-house      /best-breakfast-manteca
/best-lunch-tracy               /best-lunch-mountain-house          /best-lunch-manteca
/best-dinner-tracy              /best-dinner-mountain-house         /best-dinner-manteca
/best-hair-salon-tracy          /best-hair-salon-mountain-house     /best-hair-salon-manteca
/best-nail-salon-tracy          /best-nail-salon-mountain-house     /best-nail-salon-manteca
/best-dentists-tracy                                                /best-dentists-manteca
```

### Blockers / Held

- Lathrop discovery pages: held pending verified listing density. Current Lathrop approved + verified counts are too low to pass the 3-listing minimum guard. Revisit after next data ingestion sprint.
- Brentwood: same — out of scope for Sprint 4.
- `/best-lunch-mountain-house` and `/best-dinner-mountain-house`: Mountain House restaurant inventory is lean (10 verified records); lunch/dinner keyword filters may trigger fallback to full category list at runtime. This is expected and handled gracefully by the fallback guard.

---

## SPRINT 5 — Distribution & Traffic Activation 🔜 NEXT — March 2026

**Theme:** Turn the content we've built into inbound traffic
**Goal:** Get South Bay and 209 pages indexed, ranked, and sending organic visitors to moholocal.com

> This sprint is distinct from Sprint 4 (SEO Surface Expansion). Sprint 4 built the pages. Sprint 5 activates them.

### Why This Sprint

Sprint 3.5 seeded 507 businesses across 3 South Bay cities with 1,624 verified images. Sprint 4 added 20 new discovery pages across the 209. None of this traffic potential is activated until the pages are indexed and being found by real users. Sprint 5 closes that gap.

### Sprint 5 Goals

- Google Search Console indexing for all new city pages (South Bay + new 209 discovery pages)
- Organic impressions measurable within 30 days of submission
- First backlinks from local community channels (Facebook groups, Reddit, local newsletters)
- South Bay FIFA pages live and indexed before June 2026 deadline

### Sprint 5 Tasks

| Task | Owner | Status |
|------|-------|--------|
| Submit `/san-jose`, `/santa-clara`, `/sunnyvale` to Google Search Console | Founder | ⬜ |
| Submit new Sprint 4 discovery pages to GSC (20 pages) | Founder | ⬜ |
| Verify sitemap includes all South Bay pages + Sprint 4 pages | Claude | ⬜ |
| Post Best Of pages in Mountain House / Tracy / Lathrop / Manteca Facebook groups | Founder | ⬜ |
| Share `/restaurants-near-levis-stadium` and `/best-bars-watch-world-cup-san-jose` in South Bay community channels | Founder | ⬜ |
| Reddit distribution — r/SanJose, r/bayarea, r/209 | Founder | ⬜ |
| Monitor GSC for impressions on new pages (30-day check) | Founder | ⬜ |
| Increase 209 city directory density — run next batch seed for Tracy, Manteca | Claude | ⬜ |
| Review claim listing conversion rate — are businesses finding the "Claim this listing" CTA? | Claude | ⬜ |

### Success Criteria

- [ ] All South Bay pages indexed in GSC (URL inspection confirms indexed)
- [ ] GSC shows >0 impressions on `/san-jose`, `/santa-clara`, `/sunnyvale` within 30 days
- [ ] At least 1 South Bay page ranking on page 1 for a targeted local query
- [ ] 209 directory grows by ≥100 verified listings (next data push)
- [ ] FIFA discovery pages live and crawlable before May 2026

### FIFA World Cup 2026 Deadline

Levi's Stadium games begin June 2026. Pages must be **indexed and ranking** by May 2026 to capture FIFA search traffic at its peak. Sprint 5 must complete no later than **April 15, 2026**.

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
6. ~~**Email notifications**~~ ✅ (see closed Listing Density + FIFA Discovery sprint)
7. Community board improvements
8. Worker cron agents for event ingestion
9. Featured listings monetization
10. ~~Pending queue audit~~ ✅

**Active sprint:** Sprint 2 — Data Trust + FIFA Traffic Capture (see active sprint section above)
**Last closed sprint:** Sprint 1 — Listing Density + FIFA Discovery ✅

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
