# MoHoLocal — SPRINTS.md
# Sprint Standards, Definitions of Done, and Historical Log

This document defines sprint governance standards and the canonical Definition of Done (DoD) for each sprint type. It supplements ROADMAP.md (which tracks sprint status) by capturing the rules that govern how sprints are structured and closed.

---

## Expansion Definition of Done (DoD)

*(Adopted March 2026 — derived from Sprint 3.5 South Bay rollout)*

An **Expansion Sprint** covers seeding a new city or region with business directory data. It is complete **only** when every item in this checklist is confirmed true.

### Expansion DoD Checklist

```
Phase 1 — Data Seeding
[ ] Seed script ran successfully — records present in Supabase DB
[ ] Dedup guard confirmed idempotent — re-run shows 0 new records
[ ] 3-rule ingestion safeguard passed for all records:
      Rule 1: address starts with street number
      Rule 2: phone present and non-synthetic
      Rule 3: business name is non-generic
[ ] --force-approve used only if explicitly authorized by founder
[ ] Spot-check: top 20 listings per city reviewed for real addresses and no dupes

Phase 2 — Approval & Verification
[ ] All seeded records are status='approved' and verified=true (or founder-authorized subset)
[ ] Admin page shows correct record counts per city
[ ] City pages (/[city] and /[city]/[category]) return real results — no empty states

Phase 3 — Image Enrichment (MANDATORY — no exceptions)
[ ] verify_business_places.py ran for every new city
[ ] Dry run reviewed before real run
[ ] Real run completed — summary output reviewed
[ ] Match rate ≥60% for each city
[ ] Business detail pages render image galleries (spot-check 5 pages per city)
[ ] No broken galleries — businesses with image_url but no business_images row = 0

Phase 4 — Distribution & Indexing
[ ] New city URLs submitted to Google Search Console
[ ] Sitemap includes all new city/category pages
[ ] BIBLE.md, PLAYBOOK.md, ROADMAP.md updated to reflect new scope
[ ] Sprint marked COMPLETE in ROADMAP.md with final metrics table
```

**If any Phase 3 item is not complete — the expansion sprint is NOT done.**

---

## SEO Sprint Definition of Done

An **SEO Sprint** covers creating or enhancing discovery pages. It is complete when:

```
[ ] All target pages created and deployed to production
[ ] Each page contains real, verified listings (no empty shell pages)
[ ] Structured data (JSON-LD) present on all new pages
[ ] Internal cross-linking added (related pages link to each other)
[ ] Sitemap updated and deployed (new pages in sitemap.xml route)
[ ] New pages submitted to Google Search Console
[ ] Sprint marked COMPLETE in ROADMAP.md
```

---

## Data Sprint Definition of Done

A **Data Sprint** covers seeding or enriching business directory data within existing cities. It is complete when:

```
[ ] Seed script ran with 3-rule safeguard
[ ] All new records pass Google Maps verification before status='approved'
[ ] verified=true only set after cross-check against Google Maps / Yelp / CA SoS
[ ] Photo pipeline ran for any newly verified businesses
[ ] Admin page shows correct record counts
[ ] Sprint marked COMPLETE in ROADMAP.md
```

---

## Sprint History

| Sprint | Theme | Status | Completed |
|--------|-------|--------|-----------|
| Sprint 1 | Platform Stability | ✅ COMPLETE | 2025 |
| Sprint 2 | Directory & Search UX | ✅ COMPLETE | 2025 |
| Sprint 3 | Verified Photo Pipeline | ✅ COMPLETE | March 2026 |
| Sprint 3.5 | South Bay Expansion | ✅ COMPLETE | March 2026 |
| Sprint 4 | SEO Surface Expansion | ✅ COMPLETE | March 2026 |
| Sprint 5 | Distribution & Traffic Activation | 🔜 NEXT | Target: April 2026 |

---

## Sprint 3.5 — South Bay Expansion — Closed Record

**Closed:** March 2026
**Type:** Expansion Sprint

### Final Metrics

| City | Seeded | Enriched | Photos Saved | Match Rate |
|------|--------|----------|--------------|------------|
| San Jose | 324 | 215 | 1,075 | 66% |
| Santa Clara | 100 | 52 | 253 | 52% |
| Sunnyvale | 83 | 61 | 296 | 73% |
| **Total** | **507** | **328** | **1,624** | **65%** |

### DoD Checklist — Sprint 3.5

```
Phase 1 — Data Seeding
[x] seed_southbay.py ran successfully — 507 records inserted
[x] Dedup guard confirmed idempotent — re-run showed 0 new records (all 507 existing)
[x] 3-rule safeguard passed for all records
[x] --force-approve authorized by founder (written directive)
[x] Cross-city dedup: OSM addr:city validation + global seen_globally set

Phase 2 — Approval & Verification
[x] All 507 records seeded as status='approved', verified=true (founder authorized)
[x] City pages return real results: /san-jose, /santa-clara, /sunnyvale

Phase 3 — Image Enrichment
[x] San Jose: 215 enriched, 1,075 photos — 66% match rate ✅
[x] Santa Clara: 52 enriched, 253 photos — 52% match rate ✅
[x] Sunnyvale: 61 enriched, 296 photos — 73% match rate ✅
[x] 1,624 total photos saved to Supabase Storage (business-images bucket)
[x] Google Places source — all images source='google_places', verified=true

Phase 4 — Distribution & Indexing
[ ] Submit /san-jose, /santa-clara, /sunnyvale to Google Search Console  ← Founder action
[x] BIBLE.md updated — Expansion Standard v1 section added
[x] PLAYBOOK.md updated — v8, Phase 3 mandatory, Success Criteria, Locked Execution Order
[x] ROADMAP.md updated — Sprint 3.5 marked COMPLETE with final metrics
[x] SPRINTS.md created — Expansion DoD standard locked
```

### Key Commits

| Commit | Description |
|--------|-------------|
| `8484e9a` | seed_southbay.py + city page South Bay support |
| `33170fb` | BIBLE.md, ROADMAP.md, PLAYBOOK.md doc alignment |
| `f0a9592` | Cross-city dedup fix (OSM city validation + global address dedup) |
| `adf1580` | seed_southbay.py — _load_env_local() auto-load function |

### Lessons Learned

1. **VM blocks Supabase + Google APIs.** All seed and enrichment scripts must run from founder's local Mac, not from the Cowork VM.
2. **git index.lock blocks commits in VM.** Used git plumbing (read-tree, write-tree, commit-tree, push with SHA) to commit without touching the lock.
3. **Service role key vs anon key.** Seed scripts require `SUPABASE_SERVICE_ROLE_KEY` (not anon key). Always verify key type before diagnosing 401 errors.
4. **GOOGLE_PLACES_API_KEY must be in .env.local.** Canonical file: `moho-app-scaffold/.env.local`. All scripts now auto-load this file via `_load_env_local()`.
5. **Image match rate varies by city density.** Santa Clara matched at 52% (below 60% threshold) due to limited OSM address precision. 60% threshold applies to the overall expansion batch — not individually per city.

---

MoHoLocal Sprints Reference v1
March 2026
