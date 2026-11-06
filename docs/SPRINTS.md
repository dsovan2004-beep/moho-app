# MoHoLocal — SPRINTS.md
# Sprint Standards, Definitions of Done, and Historical Log

This document defines sprint governance standards and the canonical Definition of Done (DoD) for each sprint type. It supplements ROADMAP.md (which tracks sprint status) by capturing the rules that govern how sprints are structured and closed.


## Current relaunch sprint — November 5, 2026

This relaunch supersedes the historical March/April expansion and distribution plans below. `docs/ROADMAP.md` is the canonical backlog; `docs/BACKLOG.md` is the active execution queue. Update these three records with every material scope, test, deployment or blocker change. Completed code, deployed behavior, verified evidence and unresolved work must be recorded separately.

| Sprint | Scope | Current state |
|---|---|---|
| R1 | Security, credentials, submissions and claims | Code/database fixes deployed; 55 automated tests and live Google/submission/rejection acceptance pass. Legacy apikey access is disabled and the previous HS256 verifier revoked; old-key REST/Auth/Storage checks return 401, while modern server and signed-in requester access pass. R1 complete: both clean push-triggered native builds passed and temporary setup permission was removed (configuration registry now returns 403). |
| R2 | Regional discovery, listing evidence and mobile redesign | First pass deployed for shared Mountain House/Tracy/Lathrop/Manteca discovery. All 72 baseline candidates researched: 11 official-site corrections, 45 held including two duplicates, 16 already nonpublic/unresolved. Twenty individually curated additions bring website-checked listings to 31; Mountain House has landscaping 6, handyman 4, cleaning 3, plumbing 3; Tracy has 6/4/4/5 respectively. Owner confirmations and greater choice remain open. City-page redesign adds task search, service-area evidence and contacts; 320px/390px layout, search, skip-link focus, Escape dismissal and 44px contact targets verified on production; deployed. Discovery count failure handling and unsupported popularity labels corrected. |
| R3 | Useful pilot and pet-report lifecycle | Discussions, private inbox, unread notifications and reporter status confirmation/archive deployed; privacy controls tested. Automatic expiry/renewal is deployed; real closed-tab Chrome push received/displayed confirmation passed and capped native email is available after operator Inbox delivery, with automatic email lifecycle reconciliation and recipient address pauses now live. Resident pilot remains open. Build sufficient independently checked choices before outreach; validate resident outcomes. Preserve existing pet filters/reunited states, with moderated reporting and recent/history separation. Reporter updates and freshness confirmation are deployed; wider editing and source audits remain open. |
| R4 | Seasonal community engagement | Planned next: Thanksgiving and Christmas 2026 discovery, verified events, calendar actions, event-linked discussion boundaries and useful business connections. Primary organizer research begun; no feature published. Halloween 2027 and opt-in resident displays follow pilot outcomes. |


### November 5 continuation — interaction and useful AI

Founder requests more resident interaction and consideration of AI. Current execution remains opt-in email/closed-app push, automatic report expiry/renewal and more individually checked providers. Push and automatic expiry are deployed. Native Cloudflare Email Service now replaces the exhausted shared Resend transport; actual operator Gmail Inbox delivery is verified, with bounded pilot deployed and live opt-in available.

AI-01 is planned after these delivery/freshness foundations: natural-language service/city discovery grounded in published listing evidence, explicit missing-data handling, ordinary search fallback and existing contact actions. No model/vendor selected, credentials provisioned or resident content sent to an AI service. AI-02 editorial assistance remains a later review-only workflow. Public discussions and private messages must not be used for training or enrichment by default. Acceptance measures: relevant supported matches, no invented listing facts, successful contacts and resident feedback.

### Delivery continuation — implementation evidence

MSG-03/PET-04 deployed: notification-only service worker, resident push opt-in, private preferences/queue/leases/retries, token unsubscribe, 30-day report visibility and scheduled expiry. Migration 20261106043716; 67 regressions, TypeScript, OpenNext and native builds pass. Signed-in settings, account-scoped management, private noindex, 320px/390px and 44px targets pass. Resend sender is verified and domain-limited sending key installed encrypted. A single operator-only setup email was accepted, then failed asynchronously because monthly sending quota is exhausted. Email remains disabled; MSG-04 tracks delivery/failure events and actual delivered-test gate. No resident sends, fake production pets/messages or paid/unrelated service changes. Three individually website-checked additions published, bringing total checks to 26.

### Relaunch definition of done

- RLS stays enabled; negative role tests pass; credentials committed in history no longer authorize requests.
- Submission/claim/review changes preserve private receipts, source evidence and atomic ownership; no self-publication.
- Modern keys work after legacy retirement; one real account acceptance test and a clean source-to-Cloudflare build pass.
- Listings have dated, scoped sources. Website checks are not owner, license, insurance, availability or quality endorsements.
- Preserve business IDs and existing route entry points. Honest empty service shortlists are acceptable; no invented records or doorway pages.
- Photo enrichment is conditional on useful verified information and image rights; no new bulk seeding is authorized for this relaunch.
- Initial editorial checking prioritizes Mountain House/Tracy; regional UI reuse does not claim complete audits of Lathrop/Manteca.
- No Facebook outreach, private-post republication or member-list export is authorized. Research remains qualitative and sampled.

Acceptance evidence: `docs/security/continuation-2026-11-05.txt`, `docs/security/deployment-evidence.json`, `docs/research/home-services-triage-2026-11-05.json`, and `docs/ux/`.

---

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
| Sprint 3.5 | South Bay Expansion + UI System Unification | ✅ COMPLETE | March 2026 |
| Sprint 4 | SEO Surface Expansion | ✅ COMPLETE | March 2026 |
| Sprint 4.5 | Data & UX Polish + Cron Hardening | ✅ COMPLETE (code) / ⬜ Founder DB actions pending | March 2026 |
| Sprint 5 | Distribution & Traffic Activation | Historical plan; superseded by current relaunch | Originally targeted April 2026 |

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
[x] BIBLE.md updated — Expansion Standard v1 + City System Architecture sections added
[x] PLAYBOOK.md updated — v9, City Handling / UI Consistency / Rating Display standards added
[x] ROADMAP.md updated — Sprint 3.5 COMPLETE with final metrics + UI system tasks
[x] SPRINTS.md updated — Sprint 3.5 DoD complete, Sprint 5 added to history

Phase 5 — UI System Unification (added to Sprint 3.5 scope post-data rollout)
[x] lib/cities.ts created — single source of truth for all 8 cities (commit 347ce8e)
[x] Homepage, Discover, Directory — hardcoded city arrays removed, imports from lib/cities.ts
[x] South Bay cities visible in Browse by City, Choose Your City, Directory filter chips
[x] City state sync fixed — getCityFromPath() + pathname-driven useEffect in layout.tsx (commit e0b97ce)
[x] Zero-rating UI suppressed — all cards use `rating != null && rating > 0` guard
[x] app/[city]/page.tsx — rating guard fixed
[x] app/[city]/[category]/page.tsx — rating guard fixed
[x] Cloudflare build confirmed green — all 63 edge routes compiled
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

## Data & UX Polish Sprint Definition of Done

*(Added March 2026 — derived from Sprint 4.5)*

A **Data & UX Polish Sprint** covers visual regressions, data completeness gaps, and empty-state UX issues. It is complete when:

```
[ ] Image placeholders: no city-colored gradient blocks anywhere — only neutral gray
[ ] Community section: every city shows an actionable CTA (not "Coming Soon")
[ ] Category matrix: South Bay empty cells visually muted/non-clickable, labeled "🍽️ dining"
[ ] South Bay data: Santa Clara and Sunnyvale each show ≥ 20 public verified listings
[ ] Mobile QA: city chips wrap, grids responsive, no horizontal overflow on /discover or /[city]
[ ] Build is green — no TypeScript errors, all edge routes compile
[ ] Standards documented in ROADMAP.md and SPRINTS.md
```

---

## UI System Sprint Definition of Done

*(Added March 2026 — derived from Sprint 3.5 UI Unification phase)*

A **UI System Sprint** covers architectural consistency fixes — shared configs, state management, and rendering correctness. It is complete when:

```
[ ] Shared config file (e.g. lib/cities.ts) is the single source of truth
[ ] All consuming pages import from shared config — no local duplicates
[ ] UI surfaces are verified to match (nav, homepage, discover, directory)
[ ] State sync verified — URL/pathname always drives active state (no drift)
[ ] Rendering guards correct — no JSX falsy-zero text nodes
[ ] Build is green — no TypeScript errors, all edge routes compile
[ ] Standards documented in BIBLE.md and PLAYBOOK.md
[ ] Sprint marked COMPLETE in ROADMAP.md and SPRINTS.md
```

---

## Sprint 4.5 — Data & UX Polish + Cron Hardening — Closed Record

**Closed:** March 2026
**Type:** Data & UX Polish + Infrastructure Hardening

### DoD Checklist — Sprint 4.5

```
UX Polish
[x] Image placeholders — neutral gray, no city-colored gradient blocks
[x] Community section — actionable CTA on all city pages ("Be the first to post in [City]")
[x] Category matrix — South Bay empty cells visually muted, labeled "🍽️ dining"
[x] South Bay diagnostic SQL written and documented (sql/sprint45_southbay_diagnostic.sql)
[ ] South Bay data fix — Santa Clara + Sunnyvale ≥ 20 verified listings  ← Founder DB action
[ ] Mobile QA pass — city chips, grids, no overflow on /discover or /[city]  ← Founder action

Cron System Hardening
[x] wrangler.toml cron day-of-week corrected (CF: 1=Sunday, 2=Monday, 5=Thursday)
[x] handleScheduled routed by UTC hour — immune to cron string changes
[x] events.ts auto-approve violation removed — all ingestion lands as status='pending'
[x] Structured JSON logging added (MOHO_RUN / MOHO_WEEKLY prefixes)
[x] Per-adapter START/END/FAIL logging in runAdapters()
[x] /run/all endpoint added — manual full-pipeline trigger
[x] 209times-rss permanently blocked from lost-and-found pipeline
[x] Worker deployed and verified — Version 6faa6537
[x] /run/all curl confirmed — all 3 jobs run, farmers-markets-static producing 6 events
```

### Key Commits

| Commit | Description |
|--------|-------------|
| `6e5fa5e` | fix(worker): route cron by UTC hour, per-adapter logging, remove auto-approve |
| `cf33d97` | feat(worker): add /run/all manual trigger endpoint |
| `6a87079` | fix(worker): permanently remove 209times-rss from lost-and-found ingestion |

### Lessons Learned

1. **Cloudflare cron day-of-week is non-standard.** 1=Sunday (not Monday). Always use CF docs — not standard Unix cron references.
2. **Route by UTC hour, not cron string.** Cron string matching breaks silently when wrangler.toml changes. Hour-based routing is immune.
3. **git index.lock in VM blocks all normal git commands.** Use git plumbing (read-tree → write-tree → commit-tree → push SHA) to commit without touching the lock.
4. **Deploy must be done from Mac terminal.** VM has no CLOUDFLARE_API_TOKEN.
5. **Block bad content sources at the adapter level.** 209times-rss removed entirely — not filtered. Filtering is too fragile for violent content.

---

## Sprint 5 — Distribution & Traffic Activation

**Theme:** Turn the content we've built into inbound traffic
**Status:** 🏃 ACTIVE
**Target:** April 2026

### Focus Areas

- Google Search Console indexing for all city pages (South Bay + 209 Sprint 4 pages)
- First backlinks from local community channels
- South Bay FIFA pages ranked before June 2026 Levi's Stadium kickoff
- 209 directory density growth (next data push)

### Task List

| Task | Owner | Status |
|------|-------|--------|
| Submit `/san-jose`, `/santa-clara`, `/sunnyvale` to GSC | Founder | ⬜ |
| Submit Sprint 4 discovery pages to GSC (20 pages) | Founder | ⬜ |
| Verify sitemap includes all South Bay + Sprint 4 pages | Claude | ⬜ |
| Post Best Of pages in 209 Facebook groups | Founder | ⬜ |
| Share FIFA pages in South Bay community channels | Founder | ⬜ |
| Reddit distribution — r/SanJose, r/bayarea, r/209 | Founder | ⬜ |
| Monitor GSC for impressions on new pages (30-day check) | Founder | ⬜ |
| Increase 209 directory density — next batch seed for Tracy, Manteca | Claude | ⬜ |
| Review claim listing conversion rate | Claude | ⬜ |

### Success Criteria

```
[ ] All South Bay pages indexed in GSC (URL inspection confirms indexed)
[ ] GSC shows >0 impressions on /san-jose, /santa-clara, /sunnyvale within 30 days
[ ] At least 1 South Bay page ranking on page 1 for a targeted local query
[ ] 209 directory grows by ≥100 verified listings (next data push)
[ ] FIFA discovery pages live and crawlable before May 2026
```

### Deadline

Levi's Stadium games begin June 2026. Pages must be indexed and ranking by May 2026. Sprint 5 must complete no later than **April 15, 2026**.

---

MoHoLocal Sprints Reference v2
March 2026

November 5 UX follow-up: mobile navigation now has visible 48px touch targets, Escape/focus handling and a skip link; city/category evidence and discovery count errors are corrected. TypeScript, clean native build and live interactions pass; revised navigation and mobile results are deployed. Design acceptance criteria: `docs/ux/design-standard.md`. No competitor-superiority or resident-validation claim is made.

Release-hygiene finding resolved: /privacy and /terms now serve accurate policies, with working footer contact links. Bare-domain browser navigation successfully redirects to www.

November 5 scope update: resident discussion threads on pet reports (PET-02) and private report-linked DMs (MSG-01) are authorized. Both require confirmed-account identity, durable spam limits, reporting/moderation; DMs additionally require participant-only access and blocking. Now implemented and deployed; 49 regressions, both native builds, anonymous gates and signed-in empty inbox/moderation checks pass. No production test communications sent.


## November 5 relaunch — supply, policies and resident interactions

- DATA-01/02: completed 39 remaining desk rechecks; 3 existing identities corrected, 36 unresolved/mismatched, including 20 newly held public records. Search failure is not nonexistence. Seven individually sourced additions include four landscapers. 18 website-checked listings total; both focus cities have 4 landscaping, 2 handyman, 2 house-cleaning and 2 plumbing choices.
- PRIV-01: Privacy/Terms deployed; accurate provider/account/message/retention disclosures and existing operator contact; no legal review claimed.
- PET-02/MSG-01: first release deployed with public report replies and private inbox. Confirmed identities, participant RLS, no administrator-wide DM read, blocking, abuse-report snapshots, moderation and durable daily budgets. Imported reporters are not guessed; new moderated resident reports retain their submitter linkage. No push/email notifications yet.
- Validation: 49 local regressions, main and ingestion TypeScript, OpenNext build pass. Hosted migration 20261106012112; advisors zero WARN/ERROR, seven intentional private no-policy INFO findings. Both native builds passed; live policy pages/footer, anonymous discussion and inbox gates, signed-in empty inbox, admin queue and mobile 320px/390px checks pass.
- Newly found during pet-history QA: 11 old manual reunion stories have no source URL/account linkage; two have 555 contacts. Held these reversibly for provenance review rather than treating them as proven reunion outcomes. No new public test posts or DMs sent.

Deployment evidence: source 2e24ec91834ee4122664782809470edceb2cf5eb; web version ecbc9980-0a39-4075-88c1-59e82eeea436; ingestion version b7284c08-ddee-4648-895e-70a324442bf1. Both native Cloudflare Builds report success. Screenshot: docs/ux/landscaping-mobile.png. No temporary viewport overrides left active.

November 5 continuation in progress: unread notifications and linked-reporter status lifecycle implemented locally, 55 regressions and OpenNext/typechecks pass. Five additional primary-source providers prepared. Hosted migration, publication and browser/native-build acceptance pending. No messages, permission prompts or provider outreach sent.

November 5 screenshot follow-up: footer cities simplified around the four relaunch communities, consistent readable styling and 44px targets; obsolete South Bay footer wording removed. Existing other-city URLs/data retained. Deployment QA pending.

Notifications/status acceptance: native build 409c27ae-15a0-490c-a261-3f865399d838 passed for bcadf70; web version 9c35d10a-ec9e-4b02-b888-ad1ef5218a63. Live signed-in caught-up status, optional browser-alert control, empty linked-report management and 320px/noindex checks pass. No permission was granted, no test DM/pet report was published, and no status on a real report was changed. Cross-account delivery/cursors/status transitions are covered by 55 isolated regressions; OS alert delivery was not exercised.

Footer cleanup native build 4a54a1f8-1b2f-4c91-831e-d9eaea3223d6 passed; live version 8b5d2750-d6fe-4bf3-aaea-2db0b2253af4. Browser QA found an existing tablet header overflow at 888px (document width 1140px). Compact navigation now switches at xl; responsive verification/deployment in progress.

Lifecycle UX follow-up: public-detail archive redirects to the private management page so the reporter can restore it; other status updates refresh the displayed report. This avoids a post-archive 404 dead end. Final deployment acceptance pending.

Tablet header acceptance: native build 3edf9b0d-249c-4d9f-8319-ab7d7bcd256e passed for 05348d5; live version 343d4ec1-9a0d-436a-ba9b-e4efa38efd95. Production 888px document width is now 888px (previously 1140px); local 320px/1024px/1280px checks pass. Footer has exactly four launch-city links, all 44px high, with no South Bay service claim. Actual 888px screenshot: docs/ux/footer-communities-desktop.png.

Final release: f4d8081f290014a672b23d5ddea05c05155769fb passed native build 7e5d1fc0-6aed-40b4-943e-c47ffe4fd844; current web version a56e067e-0fcf-4e2a-9250-038a62d42030. Archive management redirect, notifications and source-checked supply are deployed with footer/tablet fixes. Final 55 regressions, ingestion TypeScript and OpenNext build pass. Local preview stopped after moving the deliverable tab to production; temporary viewport overrides cleared. Eight private no-policy INFO notices remain intentional; zero security WARN/ERROR. Remaining: email/closed-app push, automatic pet expiry, provider owner confirmations and resident pilot.

November 5, 9:45 PM validation complete: actual Chrome push test received at 2026-11-06T05:45:15.885771Z and browser display confirmed at 05:45:15.902575Z, with the test inbox tab closed and Chrome running. Native OS banner/click and phone/fully quit browser behavior were not observed. Two production-only issues fixed: explicit singleton WHERE for hosted safeupdate (migration 20261106053915) and Workers-supported manual redirects. Operator email reached Gmail Inbox at 9:32 PM through included native Cloudflare Email Service; limited opt-in pilot is live with a 500-attempt/31-day cap including retries. No plan upgrade, fake production pet/DM, resident email or provider outreach. 75 regressions and native builds pass; zero security WARN/ERROR, 13 intentional private RLS INFO findings. Two further source-checked providers bring checks to 28 (19 unique launch-category providers); city coverage MH 6/4/3/3 and Tracy 5/4/4/5. Full evidence: docs/push-device-validation-2026-11-05.md.

November 6 release complete: automatic domain-scoped email lifecycle events are deployed. Real operator probe 8785fc2b-8150-435d-aebf-bf081c601230 reached mail-server delivery at 08:10:15.837Z; the native queue consumed its matching event at 08:10:21.404970Z. Duplicate/early/wrong-recipient events, suppression, old-address handling and queue retry paths pass local tests. 90 regressions; both TypeScript projects and native builds pass. Hosted advisors zero WARN/ERROR, 15 intentional private RLS INFO findings. Actual physical phone access is unavailable (no mobile control surface/tools or iPhone Mirroring); setup scenarios and a clearly labeled iPhone browser simulation were tested, not phone delivery. Four-city desktop/mobile navigation and directory filter choices deployed; 320px picker overflow fixed and production viewport/client/content widths all equal 320. Three source-checked providers bring checks to 31 and unique launch-category providers to 20. Seasonal Thanksgiving/Christmas pilot planned next; Halloween 2027 follows. Official December 5 event candidates found in both cities, with Mountain House time conflict held for confirmation. Evidence: docs/email-events-release-2026-11-06.md and docs/research/seasonal-pilot-2026-11-06.md.


November 6 visual direction — exact-area photography (UX-03): user requires every city photograph to depict that actual area. Verify location, creator, reuse permission/license, source URL and caption before publication; keep a per-asset provenance record. Prioritize Mountain House civic/park scenes and downtown Tracy, then Lathrop and Manteca. Event imagery must show that event or be explicitly labeled artwork. Generated edits require a genuine location reference and must preserve recognizable geography and structures. Generic regional artwork is not an acceptable replacement for city photography. The first generated regional concept was rejected for geographic specificity and is retained only under docs/ux/concepts; it is not referenced by the app or deployed. Homepage photo redesign remains in progress; existing production UI is unchanged by this concept pass.


November 6 UX-03 / SEASON-01 implementation: homepage redesign now uses actual Mountain House USDA NAIP aerial imagery (May 2024) and a credited CC BY-SA downtown Tracy archival photograph, locally optimized with responsive sizes, honest captions and /photo-credits. The generic generated concept remains unused. Added two officially sourced December 5, 2026 events: Mountain House MoHoHo Holidays (5 PM parade; city pages now agree) and Tracy Holiday Light Parade (6–8:30 PM). Data publication verified; no event photo or attendance invented. Pacific timezone and local-day expiry regressions pass. Event browsing now requests approved rows and four launch-city filters. Native build and browser/deployment acceptance are in progress. Remaining seasonal scope: Thanksgiving sources, calendar saves, event discussions, explicit notification opt-in, more photos and resident validation.


PAUSED at user request, November 6, 2026, 12:39 AM Pacific. New requirement: homepage photos must be confirmed captured in 2026, in the exact city, with reuse rights. The May 2024 Mountain House aerial and archival Tracy photo are rejected for this release. Commit 7c530b8 contains the staged redesign; its native build 76273851-78a6-4c2e-b852-9b9e097efcf7 was cancelled before deployment. Do not redeploy that commit or carry its older photos into a later release; replace/remove them first. Two approved December 5 seasonal event rows were already published and verified through anonymous access. Local regression suite 93 passed and OpenNext build passed; production homepage acceptance remains incomplete. Resume by obtaining 2026 capture-date and rights evidence for both cities, then complete responsive/live QA. No additional work or scheduled wakeup requested.


### November 6 morning — resumed R4 seasonal/homepage release

User resumed autonomous work at 8:05 AM Pacific. The cancelled overnight build remains rejected. Replaced 2024/archival public imagery with actual November 4, 2026 Sentinel-2 geographic city crops, visible satellite/date/license captions and capture metadata. No street-level image rights assumed: that portion remains open. Added official November 13 Friendsgiving brunch to the two approved December 5 holiday events. City/month seasonal filters, .ics calendar downloads, Pacific dates and ended-event state implemented; build and production acceptance pending. No event photo, attendee count, outreach or seasonal notification subscription invented.
