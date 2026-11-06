# New Resident Guide audit — November 6, 2026

Scope: supplied desktop screenshot, live /new-resident and Mountain House destination, source review of the hub and all five city content definitions. Live Mountain House phone viewport measured 390px with 390px document width; this is not a complete accessibility or cross-device certification. No application changes shipped in this audit.

## Findings, in priority order

1. **P1 — Incorrect essential-provider information.** Mountain House hardcodes PG&E for gas AND electricity and Recology for trash. The current city Utilities & Waste page identifies MID electricity, PG&E gas and West Valley Disposal waste. Manteca also hardcodes Recology, whereas the city Waste Management page describes its municipal collection service. Replace city-by-city with authoritative setup/contact destinations and checked dates. Review address-specific coverage before claiming universal availability. Source: app/new-resident/[city]/page.tsx static CITY_CONTENT.
2. **P1 — Unsupported school scores and assertions.** School 7/10–9/10 values are literal strings with no source, date or methodology. Some entries are districts and others schools. “Top-rated” and attributed “Neighbor Tips” have no evidence attached. Remove unsupported scores and attribution; provide official district enrollment/boundary resources and individually verified school names/grade spans. Do not present all existing school entries as verified.
3. **P1 — Listing evidence and error state are missing.** Business queries enforce approved + verified, but do not join dated listing_checks or expose check evidence. Live Mountain House shows two separate Mountain House Chiropractic cards and several generic legacy records; this is a duplicate-review signal, not proof that the businesses are false. Zero ratings render 0.0 stars. Supabase returned errors are ignored, and thrown errors fall through to “No listings yet.” Distinguish failed loading from genuine zero results; reuse current evidence-aware directory cards and service-area discovery rather than city-only legacy selections.
4. **P2 — City scope inconsistent.** Hub and destination picker include Brentwood while navigation/footer promise Mountain House, Tracy, Lathrop and Manteca. Align both route layers with the shared four-city configuration; define an intentional legacy-route outcome.
5. **P2 — Layout describes a guide rather than helping a move.** Desktop screenshot shows tiny county labels, Mountain House title wrapping, inconsistent card body heights, ample empty space and generic emoji bands. Keep city selection and section anchors; introduce four balanced city cards, licensed local images, readable metadata and “First week / First month” tasks. Put utilities and school enrollment before restaurant recommendations. Reuse existing verified photos only where provenance permits; real 2026 Mountain House street-photo task remains open.
6. **P2 — Freshness and city context need attention.** Static travel estimates, fiber availability, school claims, medical destinations and event season claims lack check dates. Verify or remove them. Community/events footer links omit the guide city. Add source/check dates, correction reporting, city-preserving links, current events and cultural classes, followed by optional saved checklist progress. Do not claim these proposed features exist today.

## Execution and acceptance

RES-01 P1: correct authoritative utility destinations across all four cities; remove unsourced ratings; review school names/boundaries; audit legacy listing evidence/duplicates and add independent error recovery. Acceptance: sources and check dates recorded, no unsourced numeric ratings, simulated data failure differs from empty data.

RES-02 P2: shared four-city scope, useful move-in checklist, evidence-aware photo cards, selected-city navigation, events/classes, correction action. Acceptance: four cities only in active picker, working destination/task links, keyboard focus and 320/390px layout checks; no unlicensed or misidentified photos and no invented resident endorsements.

## Primary sources checked

- Mountain House Utilities & Waste: https://www.mountainhouseca.gov/241/Utilities-Waste
- Mountain House Garbage & Recycling: https://www.mountainhouseca.gov/264/Garbage-Recycling
- Manteca Waste Management: https://www.manteca.gov/397/Waste-Management

ACE station page retrieval returned 403; do not treat the “Downtown Tracy Station” claim as validated. Remaining external links, school boundaries, healthcare locations and travel estimates require individual checks. This audit is not an exhaustive link or security audit.

## Implementation follow-up

Core corrections and redesign implemented November 6; acceptance pending. Official resource data lives in lib/new-resident.ts. Removed the guide’s legacy business queries, replacing them with city-scoped directory actions; duplicate catalog cleanup remains a separate DATA-02 task. Brentwood guide now returns 404, with active picker limited to the four relaunch cities. Session checklist does not persist across navigation/reload. Photo gaps remain explicit and open.
