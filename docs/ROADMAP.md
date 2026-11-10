# MoHoLocal Product Roadmap

## November 9 late evening — visible mobile city choices and four-city rechecks

MOBILE-09 implemented and locally accepted: all four city links plus All four cities are visible without horizontal scrolling. Two-column narrow-screen layout, full-row regional action, 44px minimum targets, named navigation, selected checkmark/aria-current and visible keyboard focus. Existing category/service/sort URL behavior retained. Local320px document width320px; all five targets44px high, individual city widths140px. Actual Manteca→Tracy click retains Home Services/plumbing/name sort. Local390px screenshot inspected.169tests and TypeScript pass; production build/release acceptance pending.

FRESH-06 complete: THub Cafe (Mountain House), Van’s Ace Hardware (Tracy), Vince Haro Hauling (Lathrop), Warren’s Heating & Air Conditioning (Manteca) rechecked November9Pacific. Four dated scope/field updates with original-row private audit and anonymous public read-back. Primary source URLs and limits in research/visible-mobile-cities-2026-11-09.md. Warren’s conflicting street addresses stay unpublished; Vince coverage remains Lathrop/Manteca/Tracy only. Business records, service areas and tags unchanged; no new providers counted. Holiday availability and photo reuse unconfirmed.

Facebook UNPUBLISHED. Real2026 photo location/rights tasks, genuine-reporter pet pilot, physical-phone and screen-reader acceptance OPEN.


## November 9 afternoon — enforce the four-city regional browsing boundary

MOBILE-08 LIVE and accepted. All Cities now means locations in Mountain House/Tracy/Lathrop/Manteca OR outside-city providers with listing-check coverage explicitly naming at least one launch city. Label changed to All four cities. Regional scope is retained through search, service filters and pagination; existing direct city URLs remain readable. No rows deleted/unpublished and no evidence/approval gates weakened.

SQL/local acceptance:1,023regional records including46covered outside bases;839unscoped legacy rows excluded. These are inventory counts, not fresh-check counts. Local unique San Jose legacy search returns0regionally and1via explicit San Jose URL; iThink remains discoverable through recorded coverage.169tests, TypeScript and final OpenNext pass. Accepted final sourcefdd3419013b93903a36160d46f8743b03b219731; native version83d6ab65 Ready1m47s; public marker matches. Production count1,023; pagination20→40 with40unique listing IDs. Legacy-name search0regional results; covered iThink provider1result. Live320px document width equals viewport. Regional proof research/nov9-regional-directory-live.png and contact proof research/nov9-mobile-contact-live.png inspected. Emulation reset. [Evidence](research/four-city-directory-scope-2026-11-09.md).

Same FRESH-05 four-record recheck below; no extra providers counted for this scope fix. Facebook UNPUBLISHED; photo exact-location/reuse-rights tasks, genuine-reporter pet pilot, physical-phone and screen-reader acceptance OPEN.


## November 9 afternoon — mobile contact actions and four-city rechecks

MOBILE-07 contact release LIVE and accepted. Shared contact actions use full-width narrow-screen buttons, business-specific accessible labels and validated HTTP(S)/telephone destinations. Malformed links omitted; missing details get a plain fallback. Detail sidebar phone/website links use the same helpers. Request-first and exact checked text-only channels preserved; no automatic message body. Scope is shared actions and detail sidebar, not a full application-link audit.

167tests, TypeScript and final OpenNext build pass. Local390px request action310px wide/44px high;320px no overflow. Handyman request-first order and iThink Pet sms destination accepted without activating either. New tests cover bad protocol/credentials/app-parameter rejection, ordinary phone/extension normalization, omitted malformed contacts and named accessible links. Accepted contact sourcee6c1ffed4612ea326fac284a2b4c7d821ff6ad6c; native versiona4c8e50a Ready2m15s and public marker match. Live JVS phone link tel:+12092295487 with named target310px wide/44px high at390px; screenshot research/nov9-mobile-contact-live.png. No call/text activation. Explicit international country codes are preserved; superseded fca4f6d native build canceled before deployment while this edge case was corrected and rebuilt.

FRESH-05 complete: Tabla Niketan (Mountain House), Harbor Freight #516 (Tracy), JVS Plumbing (Lathrop) and MW Plumbing (Manteca) checked against current primary sources. Four scoped check dates/notes/fields updated with private original-row audits, SQL and anonymous public read-back. Exact city limits retained; MW PO box remains mailing only, Tabla phone not invented, JVS Sunday wording is unresolved. Business records, tags and service areas unchanged; no new/duplicate rows or credential/availability claims. [Evidence and sources](research/mobile-contact-actions-2026-11-09.md).

Facebook UNPUBLISHED; real2026 exact-location/reuse-rights photo tasks and genuine-reporter pet pilot OPEN. Physical-phone and screen-reader voice acceptance OPEN. Continue resident usability and bounded oldest-source rechecks without full-catalog freshness claims.


## November 9 — local-first mobile search recovery; four more listing checks

MOBILE-06 LIVE and accepted. Compact named no-results region prioritizes removing text while retaining city/category/exact service, broadening to category services within that city, then browsing all city listings. Other cities is a separate explicit action; no unfiltered self-loop. Full-width mobile recovery links, missing-business suggestion and coverage caveat retained. Top-level Clear all remains an explicit global reset.

165tests pass (two new four-city recovery/self-loop regressions), TypeScript and OpenNext build pass. Local action routes retain Manteca correctly;320px width matches viewport and actions are44–66px tall. Accepted source4842dd1cfa2413943d99317b4b3a73b65966ca93; native version53d03f74 Ready in1m31s; public build marker matches. Live Manteca remove-text route retains Home Services/plumbing; all-city-listings recovery retains Manteca and resets category. Live empty region at320px has no document overflow and smallest link target44px. Screenshot research/nov9-local-empty-recovery-live.png inspected; temporary emulation reset.

FRESH-04 complete: Aappakadai (Mountain House), Home Depot #1020 (Tracy), Rasoi (Lathrop) and Watermill Express Main & Alameda (Manteca) rechecked against primary pages. Four check dates, scoped notes and compared fields updated, with private before/after audits and anonymous public read-back. Store locations do not establish delivery/contractor coverage; station water marker does not confirm ice; stock, dietary/quality, current operation and holiday hours remain unconfirmed. Business records/service areas/tags unchanged; no new/duplicate rows. [Evidence and sources](research/local-empty-recovery-2026-11-09.md).

Facebook UNPUBLISHED; real2026 exact-location/reuse-rights photo tasks and genuine-reporter pet pilot OPEN. Physical-phone/screen-reader acceptance OPEN. Continue oldest-source rechecks and resident workflow improvements without full-catalog freshness claims.


## November 9 — preserve mobile results on loading failure; four more rechecks

MOBILE-05 LIVE and accepted. A failed next-page request now preserves existing listing cards/contacts and the current offset, with Try loading more beneath them. Pending retry remains visible and disabled with Trying feedback; success clears the message. Initial-load errors keep their separate Try again flow. New filters clear prior failures; stale-response sequence checks retained.

Local browser fixture:20 loaded cards remain on offset20 failure; delayed retry keeps20 and disables its control; retry adds exactly one, total21, and removes recovery message. Initial failure correctly shows zero cards/initial retry. Fictional local-only fixture removed by reload; no production data or outcomes created. Final163tests, TypeScript and OpenNext build pass. Accepted source2d899cdd50a8c7b80c6a4632c3c82542d2f3521a; native versionf60647bb Ready in2m27s; public build marker matches. Live All Cities pagination expanded20→40, with40 unique listing IDs and status Showing40. Document width matches390px/320px viewports. Failure/retry proof remains explicitly local; no outage simulated on production. Emulation reset. [Local failure proof](research/nov9-pagination-failure-local.png).

FRESH-03 complete: Aapli Marathi Shala (Mountain House), Roto-Rooter Tracy, Knights Plumbing (Lathrop) and Raunak Bazar (Manteca) rechecked against current primary pages. Four dated checks and private before/after audits saved; anonymous public read-back accepted. Service areas/tags retained; Roto-Rooter does not claim a street office; Knights contact/map-location discrepancy disclosed. Class seats/schedule, holiday response, festival stock, credentials and photo rights remain unconfirmed. No duplicate/new business rows. [Evidence and sources](research/pagination-recovery-freshness-2026-11-09.md).

Facebook UNPUBLISHED; exact-location/reuse-rights photo tasks and genuine-reporter pet pilot OPEN. Physical-phone/screen-reader acceptance OPEN. Continue resident reliability fixes and bounded oldest-source rechecks; do not label the full catalog freshly verified.


## November 9 — resident-first mobile directory and four-city freshness

MOBILE-04 LIVE and accepted. Mobile search uses 16px text and a search keyboard hint; submit clears the pending debounce. Added the existing sort choices to mobile, preserving city/category/exact service. Searches explain relevance ordering. Owner claims now follow resident contact actions and corrections, with unique accessible business labels; listing titles gain full width.

Local 390px: Newest retained Mountain House/Home Services/handyman, then city switches Manteca/Lathrop/Tracy retained the same service/category/sort. Keyboard Matt search retained Tracy and service; relevance label visible. 320px has no document overflow. All 163 tests, TypeScript and OpenNext build pass. Accepted source 191edac1846af2a6e4bdeec117707e895e7a6e14; native version 27728d36 Ready in 1m46s; public build marker matches. Live 390px title width increased from 237.75px to 316px, search font from 14px to 16px. Sort changes and city switches across all four cities retained the exact category/service/newest order; Enter search retained city/service/query and showed relevance label. Live 320px document width equals viewport. Refreshed November 9 evidence and request-form-first contact visible; claim remains below contacts. Screenshot research/nov9-resident-mobile-card-live.png; emulation reset.

FRESH-02 bounded recheck complete: four existing records, one base in each city—Mountain House Handyman, American KeyTech (Tracy), Molly Maid (Lathrop), Cleaning Authority (Manteca). Compared primary contact/location/service information; refreshed check dates and scope notes with private before/after audit, then anonymous public read-back. Retained exact service-area limits, request-form-first contact and credential/availability disclaimers. No new businesses or invented expanded coverage; these four checks do not establish that every listing is current. [Evidence and sources](research/mobile-directory-freshness-2026-11-09.md).

Facebook UNPUBLISHED. Photo exact-location/reuse-rights tasks and genuine-reporter pet pilot OPEN. Physical-phone/screen-reader validation OPEN; continue bounded oldest-evidence refreshes and resident task improvements.


## November 9 — mobile sharing feedback and copy recovery

SHARE-03 mobile feedback increment LIVE: shared action feedback gives immediate Copying/opening state, locks repeated taps while pending, ignores stale results after the share target changes, and places persistent atomic status beside the action buttons. Full-width mobile actions and 16px fields; denied clipboard exposes Select link/text with full manual selection. Native cancellation never copies; native completion asks residents to confirm sending in their chosen app. Safe canonical payload boundaries retained.

Validation: 163 tests, TypeScript and OpenNext build pass. Local 390px delayed/denied/success clipboard fixtures verify exact safe payload, pending disable, full selection and honest feedback. Native cancellation/completion mocked locally; no message or post sent. Business safe field and fallback accepted at 320px without overflow. Fixtures and viewport overrides removed after QA. Physical-device, real OS clipboard/share-sheet and screen-reader acceptance remain OPEN.

Accepted app source a836ef8b8753fc1c5426688ca5cd193d07933e06; native deployment 26928c94 Ready in 2m40s (build e8a8b21f-bf58-4bf5-89c3-9e64f3f598e2); public build marker matches. Live shortlist link/text and business copy feedback accepted; both 320px layouts have no document overflow, mobile fields 16px, shortlist copy target 44px high. Automatic copy API feedback verified; physical OS clipboard acceptance remains separate. Screenshot research/nov9-mobile-share-feedback-live.png. Historical pre-guard source 3b57e30 was blocked by the persisted central command (missing release:check), with no deployment from that build. Next: physical-phone copy/share and screen-reader acceptance; retain resident freshness/correction priorities. Facebook UNPUBLISHED. Photo location/reuse-rights tasks and genuine-reporter pet pilot OPEN. No new provider checks claimed. [Evidence](research/mobile-share-feedback-2026-11-09.md).


## November 9 — safe business sharing and stale-release protection shipped

SHARE-02 COMPLETE: business share links use a validated public UUID and optional supported city only. Search, return destinations, tracking and fragments are excluded. Residents see explicit Copy business link, persistent status feedback, busy states and a selectable manual-copy fallback. Device-share cancellation never silently copies. No automatic posting.

Accepted source ee872dbe2131fbcae760af3ef7fa7135caee8352; guarded native deployment e7b2d059 Ready in 1m36s; public build marker matches. 163 tests and final OpenNext/TypeScript build pass. Expanded layout fits 320px/390px and desktop. Exact copy payload and rejection behavior are tested; manual clipboard fallback verified. Automatic OS clipboard integration and physical-device sharing remain acceptance items because automation clipboard readback was inconsistent.

DEPLOY-02 COMPLETE: observed an older revision redeployed and removed newer release features. Current source restored. Persisted Cloudflare build and deploy commands now run release:check before each operation; it fetches main and compares protected application paths, permits docs-only differences, and fails closed if verification is unavailable. scripts/** added to build watch paths. Current-source guarded retry passed; local Git fixtures cover stale source rejection, current source, docs-only changes and unavailable origin. Delivery timing/root cause remains unproven.

Next: physical-device copy/share acceptance and continued resident workflow improvements. Facebook UNPUBLISHED. Photo location/reuse-rights tasks and genuine-reporter pet pilot remain OPEN until their acceptance criteria pass. No provider records freshly rechecked this increment. [Evidence](research/safe-business-sharing-2026-11-09.md).


## November 9 — shareable city/service shortlists shipped

LIVING-03 COMPLETE: sourceadc6b86/native9265c5a4 Ready2m36s; live build marker matchesadc6b866e61f1149bb3cce6a8cd58736e2625ff2. Directory Share disclosure offers Copy link, Copy suggested text, selectable fallback fields and optional device share menu. Stable public /shortlists/{city}/{optional-service} routes render current shared DirectoryBrowser results, not frozen provider counts. City navigation derives from the route and preserves the exact service. Payload contains only supported city/service, excluding search text/sort/account context; no automatic posting or endorsement/availability guarantee.

Local+live acceptance:160tests and final OpenNext/TypeScript pass. Manteca/window-cleaning copied exactly to https://www.moholocal.com/shortlists/manteca/window-cleaning and opens2current options; simulated private-example q/newest state omitted. Suggested text copied with evidence limits. Live service-preserving switch to Tracy works; local top-nav switches also pass for Mountain House/Lathrop. City-only Manteca share URL/label/navigation accepted. Four public service routes and city-only route200; unknown service404; local retired city/extra path404.390px no document overflow. City/service OG title, URL, description, own-logo image and canonical emitted; local facebookexternalhit request confirms head metadata. Share utility views noindex/follow, not sitemap duplicates. Actual Facebook cache/native-device sending untested; no composer, debugger/rescrape, post, message or new permission used. [Evidence](research/shareable-shortlists-2026-11-09.md); screenshot research/nov9-share-shortlist-live.png. Emulation reset.

Next SHARE-02 P1: existing business ShareButton still copies window.location.href, which can include directory returnTo/search context. Apply canonical business-ID/city-only URL sanitization and explicit copy-failure feedback before broadening sharing elsewhere. Keep separate from approved shortlist payload, which is already allowlisted. Existing architecture, listing evidence, correction flows and moderation preserved. Facebook UNPUBLISHED; photo rights/location tasks, genuine-reporter pet pilot and physical-phone/genuine resident acceptance OPEN.


## November 9 — saved correction receipts and living-directory alignment

LIVING-02 SHIPPED: source1b4fbb5/native0be44461 Ready2m15s; live build marker matches1b4fbb59964e7814a93f888e9e7641538031375a. API already returned saved submission_id and needs_review=true; UI now consumes that exact contract. Receipt displays actual saved reference, pending review, Return to listing with affected city, and Suggest another change retaining listing/city. No claim of approval, publication or new status-tracking page. Missing/malformed receipt or interrupted after-send requests stay uncertain, retain form contents and block immediate duplicate sending. Before-send failures remain recoverable. No automatic retry or new API/schema/security permissions.

158tests pass including Worker→validator contract, invalid/missing references, safe listing return and rendered receipt. Final native build passes; latest local TypeScript passes.390px actual component fixture fits, clearly labeled example/no report sent. Live correction form still retains Manteca/read-only canonical listing URL. No synthetic report submitted; real resident saved-receipt/review acceptance remains OPEN. [Evidence](research/correction-receipts-2026-11-09.md); research/nov9-correction-receipt-fixture.png is a LOCAL FIXTURE, not an actual request. Emulation reset.

Founder alignment12:17AM: residents enjoy Facebook groups; MoHoLocal should earn repeat use through useful continuing records and actions, without requiring migration. OPERATIONS updated: find local services with explicit coverage/contact/check dates, current events/openings, persistent pet progress and moderated corrections; voluntary sharing supports discovery. Next build LIVING-03: resident-facing shareable city/service shortlists with clear evidence context, reusing existing directory filters and safe URLs; inspect existing sharing before adding duplicate infrastructure. Do not auto-post, carry private search text or publish campaigns. FB UNPUBLISHED. Photo rights/location tasks, genuine-reporter pet pilot, physical-phone and genuine resident/owner acceptance OPEN.


## November 9 — resident listing corrections shipped

LIVING-01 COMPLETE: source02055f6/native36f178cd Ready1m36s; live build marker matches02055f6d4ad3e112f9d19c1332e397768a85decf. Directory cards expose business-specific Suggest a correction links. Report route loads only approved/public business context, pre-fills name/reference and affected city; detail links also retain resident city. Focused correction form hides unrelated submission types, supplies source/date guidance, labels fields, includes a read-only listing URL and returns Back to the business. Existing confirmed-account gate and manually reviewed business_update endpoint retained; no direct listing edits, auth/schema/permission changes.

Acceptance: local+live Manteca card → Luminate form retains Manteca rather than Lathrop office, correct summary/business UUID/canonical listing URL. Live390px has no document overflow; readOnly=true. Local signed-out fields disabled, sign-in return includes business/city; helper regression checks prove existing safeReturnTo preserves context. Invalid/missing IDs404; repeated city ignored with valid office fallback. General event form still has ordinary submission-type choices.155tests and final OpenNext/TypeScript pass. No report or synthetic participation submitted. UI prefill/read-only is convenience, not proof that resident-supplied corrections are true. [Acceptance](research/listing-corrections-2026-11-09.md); screenshot research/nov9-listing-correction-live.png. Emulation reset.

Next build: LIVING-02 — improve correction confirmation with a returned request reference and a clear return to the original listing; audit existing API response/own-request visibility before promising tracking. Continue evidence-backed freshness through established twice-weekly workflow. Facebook UNPUBLISHED. Photo rights/location tasks, genuine-reporter pet pilot, physical-phone and genuine resident/owner acceptance OPEN.


## November 9 — mobile search redesign shipped

UX-06 COMPLETE: sourcea8b67b3/nativeec0ba5ab Ready2m6s; live build marker matches source. At390px with scrollY0, search starts318px down (previous1354px). Mobile search/city/category filters precede an expandable service chooser; keyboard Enter opens it, selecting Pest control retains Manteca, closes chooser and returns3. Local320px and390px have no document overflow; desktop service links remain visible with mobile toggle hidden. Optional outcome prompt moved beside its form below results.152tests and final OpenNext/TypeScript pass. [Acceptance](research/mobile-search-redesign-2026-11-09.md); screenshot research/nov9-mobile-search-live.png. Emulation reset.

All16operating roles are current in OPERATIONS, including Growth/Community Marketing/Monetization, editorial freshness, community/pet operations, data quality, security/privacy, analytics and release ownership. Build-first execution: ship a concrete resident improvement, verify it, then update plans. No repeated unchanged Search Console/provider-count passes this increment.

Next build: LIVING-01 P1 — expose the existing listing-correction route from directory cards and improve the specific business handoff, so residents can flag stale contact/service details without finding a buried detail-page action. Existing report-listing route redirects to moderated business_update submission; extend that flow, do not create duplicate reporting infrastructure. Audit actual handoff before implementation; no fake production submissions. Ongoing supporting curation/freshness continues through established workflow.

Facebook stays unpublished. Photo rights/location tasks, genuine-reporter pet pilot, physical-phone and genuine resident/owner acceptance OPEN. Existing Next.js/Cloudflare/Supabase architecture retained. No auth/schema/private-data or monetization activation changes.


## November 9 — build-first execution and mobile directory sprint

Founder direction: stop repetitive status loops and continue building the living directory. Updated all16MoHoLocal role responsibilities through the OPERATIONS execution mandate: this chat owns product, engineering/architecture, UX, research/curation, openings/events, licensed imagery, community/pets, growth/SEO/monetization, data quality, security/privacy, QA/release, planning and resident outcomes. Retain the existing stack and publication boundaries.

UX-06 P1 IN PROGRESS: phone search was1354px down on the window-cleaning shortlist at390px. Move search/city/category above services; replace always-expanded mobile services with an accessible Browse/Change/Hide chooser, retain visible desktop services, collapse on service selection, keep exact city/service links. Move optional outcome prompt beside its form below results. No data/auth/API changes.152tests pass; final build/local/native/live acceptance pending. Next build work should improve resident task completion and living-directory freshness, not repeat unchanged Search Console/provider-count checks. FB unpublished; photo tasks, genuine-reporter pet pilot and physical-phone acceptance OPEN.


## November 8 — landscape expansion and launch monitoring

DATA-22 COMPLETE: published P&N Landscaping & Hardscaping with explicit official four-city coverage, public phone, installation scope and no inferred office.94dated website checks total. Routine lawn maintenance is unconfirmed. Duplicate guards passed; Villanueva/Golden Valley Materials already existed and were not duplicated. Live landscaping shortlists include the new provider: Mountain House9/Tracy9/Lathrop6/Manteca6. Detail fits390px without document overflow; screenshot research/nov8-landscape-provider-live.png. [Evidence](research/landscape-followup-2026-11-08.json), matching SQL. No photos, street address, owner contact or credential/quality/availability claims adopted.

LAUNCH-01/DEPLOY-01 follow-up: live build-info.json still matches45ae8b13b8c12a992b3e5f85117ba755e573edb2/native0cc5b469 Ready1m50s; no unexpected deployment observed. Ten curl route checks returned200: homepage, four city pages, events, new-resident, privacy, terms, build marker. An initial Python urllib client received403; curl and normal browser succeeded. Do not describe that client-specific result as a resident outage or weaken protections. HTTP success is a bounded availability check, not complete user-journey acceptance. No app/security/schema/config changes or fresh build needed for this data/docs increment; prior152test/final-build acceptance remains historical current-source evidence.

SEO-03 after11:57PMrequest: canonical overview performance/indexing/experience/enhancement reports still processing. No redundant sitemap submission, new indexing count or growth claim. Facebook UNPUBLISHED. Mountain House2026photo rights/location, Manteca exact-photo-location, genuine-reporter pet pilot, genuine resident/owner and physical-phone/native-app acceptance OPEN. Next: more thin-category provider evidence, resident task checks and subsequent meaningful indexing/deployment changes.


## November 8 — deployment recovery and service shortcuts live-accepted

DEPLOY-01/UX-05 COMPLETE for this release: source45ae8b1 deployed native0cc5b469 Ready1m50s after the existing build trigger was saved disabled then re-enabled. Public build-info.json source_revision matches45ae8b13b8c12a992b3e5f85117ba755e573edb2. No credential/permission changes; local CLI still Pages-only. Earlier dispatch failure root cause is not established; monitor future app/lib pushes rather than claiming a proven permanent cure. Last retry of prior source canceled before deployment. New build provenance emits only app name and commit hash, no environment values.

Live390px acceptance: Pest control shortcut3published website-checked options per city; Window cleaning2per city, all four city switches preserve service/category and fit without horizontal overflow. Manteca window-cleaning typed search → Top to Bottom detail → Back preserves city/category/service/q/sort and returns2. Four-city directory intro is live in this source.152tests and final OpenNext/TypeScript pass; device emulation reset. [Acceptance](research/deployment-recovery-2026-11-08.md); screenshot research/nov8-service-shortcuts-live.png.

DATA-21 COMPLETE: Delk published with first-party all-four-city coverage, Stockton office city retained, no local branch or credential/safety/effectiveness/quality/availability endorsement.93dated website checks total. FB drafts UNPUBLISHED. Mountain House2026photo rights/location, Manteca photo location, genuine-reporter pet pilot, physical-phone/native-app and genuine resident/owner acceptance OPEN. Search Console baseline latest check still processing; no redundant submission.


## November 8 — native dispatch recovered; release acceptance pending

DEPLOY-01: confirmed local Wrangler OAuth has Pages write, not Worker scripts access; prior CLI denial did not deploy. Existing native trigger settings still main/correct repository and app/lib watch paths. Saved Disable builds on then off, returning to enabled without credential/permission changes. New source45ae8b1 successfully dispatched native build after refresh; cause of earlier missing events is not established. New npm precf:build hook writes public build-info.json containing only app name and Git source revision; generated file ignored by Git, no environment/secret serialization.152tests and final OpenNext/TypeScript pass. Wait for Ready and live marker/shortcut acceptance before closing.

DATA-21: published Delk Pest Control, actual Stockton office city and explicit official service-area evidence for all four cities.93dated website checks. Duplicate name/domain/phone guard and readback passed. Live Manteca text search has3pest providers. No credentials, safety/effectiveness, quality, availability, prices, street address or photos adopted; no contact sent. [Evidence](research/pest-followup-2026-11-08.json) and matching SQL. Existing photo tasks, genuine-reporter pet pilot and physical-phone/genuine resident acceptance OPEN; Facebook UNPUBLISHED.


## November 8 — provider acceptance; shortcut deployment held

DATA-20 COMPLETE: Moore Quality Pest Control and California Pest Control published with explicit four-city website evidence;92dated checks. Live Manteca pest-control text search shows both providers. Each city's checked inventory has2pest-control and2window-cleaning options. California Pest Control has no inferred visitor office from its mailing address. No contact, photos or credential/quality/safety/availability endorsement.

UX-05/DEPLOY-01 OPEN: service shortcuts sourcec1b04bd and four-city directory intro sourcea8926d1 pushed,152tests and final OpenNext/TypeScript pass. Local production UI accepts pest/window shortcuts and city switching;390px check has no document overflow. Native deployment activity did not dispatch either new commit during this pass despite app/** and lib/** include paths and builds enabled. CLI fallback failed No access to specified service and made no deployment. Native Retry build targeted prior814d5ce; canceled after6s before cloning/build/deploy. Do not mark new shortcuts/intro live. Last accepted live app remains814d5ce/nativeb15ed3d8. Next priority: restore native dispatch for currentmain and verify live before claiming acceptance; do not expand credentials or weaken access.

SEO-03: live XML1114uniqueURLs/all four city routes present; this differs from historical Google1102discovered and is not proof of crawl/indexing. Google overview baselines still processing. No sitemap resubmission/indexing request. FB drafts UNPUBLISHED. Photo rights/location tasks, genuine-reporter pet pilot and physical-phone/genuine resident acceptance OPEN. Public proof research/nov8-pest-providers-live.png; device emulation reset.


## November 8 — pest coverage and direct service discovery

DATA-20: published Moore Quality Pest Control (Tracy) and California Pest Control (service area only; Stockton mailing address is not a visitor office). Each official service-area page individually names all four launch cities.92dated website checks total; distinct Pest control and Window cleaning tags each have2published checked choices per city. Database name/domain/phone guards passed. No public street address or photos copied; no owner contact, credentials, insurance, treatment safety/effectiveness, quality, prices or availability independently confirmed. [Evidence](research/pest-coverage-2026-11-08.json) and matching SQL.

UX-05/LAUNCH-01: shared Pest control and Window cleaning shortcuts added for directory/city/Discover. Exact typed service names use the existing checked-tag search path. Window cleaning does not imply solar bird exclusion and pest control does not imply a specific treatment or safe chemical use. Existing category/city preservation tests expanded;152tests pass; final build/native/live acceptance pending.

SEO-03: canonical overview follow-up after11:41PMrequest still processing for performance/indexing/experience/enhancement baselines. No redundant submission or growth claim. Facebook drafts UNPUBLISHED; photo rights/location tasks, genuine-reporter pet pilot and physical-phone/genuine resident acceptance remain OPEN. Next: verify four-city mobile shortcut behavior and retain honest contact/evidence labels.


## November 8 — search-return release accepted

SEARCH-02 COMPLETE: source814d5ce/nativeb15ed3d8 Ready2m41s. Live390px Lathrop name search → detail → Back restores city/category/q/newest exactly; document width390/scroll390. Live Manteca electrical-services/electrician → Luminate → related Lainez → Back retains all filters and returns2results. Local production build also accepts All Cities without office-city narrowing.152tests, final OpenNext/TypeScript pass; device emulation reset. Category/breadcrumb browse semantics and authentication return controls unchanged. [Acceptance](research/search-return-acceptance-2026-11-08.md), screenshot research/nov8-search-return-live.png.

DATA-19 accepted: Top to Bottom Washers has explicit first-party all-four-city coverage; live name search returns1in each city.90dated website checks, not credential/quality/availability certification. No contact or photo reuse. Search Console sitemap remains Success/1,102discovered pages, no resubmission or indexing-growth claim. FB drafts unpublished; photo tasks, genuine pet pilot, genuine resident/owner acceptance and physical-phone/native-app checks OPEN.


## November 8 — search-return fix and exterior-provider follow-up

SEARCH-02: directory cards carry a validated directory-only return destination. Dedicated Back to results actions restore city (including All Cities), category, explicit service, search text and sort; related-provider visits retain the original return destination. Category/breadcrumb browse actions retain their existing semantics. Reject external URLs, other routes, unknown/duplicate parameters, invalid cities/categories, excessive/control-character query text; canonicalize compatible services and allowed sort. Authentication return policies unchanged.152 tests pass; final build/native/live acceptance pending.

DATA-19: published Top to Bottom Washers, actual office city Stockton, with explicit official FAQ coverage for Mountain House, Tracy, Lathrop and Manteca and advertised exterior/window/gutter/solar-panel cleaning.90dated website checks total. Name/domain/phone duplicate guard and database readback passed. No local branch, bird-exclusion specialization, credential/quality/availability endorsement, photo reuse or contact sent. [Evidence](research/exterior-followup-2026-11-08.json), matching publication SQL.

SEO-03: sitemap report follow-up remains Success, submitted/readNovember8,1,102discovered pages and0videos; this is not an indexed-page count and does not establish that the newest listings have been crawled. No resubmission. Overview baseline processing from preceding pass remains latest baseline evidence.

Facebook drafts UNPUBLISHED. Mountain House2026photo rights/location, Manteca exact-photo-location, genuine-reporter pet pilot and physical-phone/native contact-app acceptance OPEN. No synthetic residents, outcomes, claims, bookings or pet reports. Final acceptance evidence to follow.


## November 8 — late launch-readiness and exterior-cleaning acceptance

DATA-18: published Shamblin Softwash & Pressure Washing (Manteca based), with explicit official-site Mountain House, Tracy, Lathrop and Manteca coverage, public phone and advertised window/gutter/solar-panel cleaning and pressure washing. **89 dated website checks**; this is not credential, quality or appointment confirmation. No street address or image copied. Database name/domain/phone guard passed. Live name search shows one result in each city; detail preserves Lathrop context and actual Manteca office city. [Evidence](research/exterior-cleaning-2026-11-08.json), matching SQL and research/nov8-exterior-provider-live.png. Existing All Pro was identified and not duplicated; Quicky is held because direct page content/title did not substantiate the search snippet.

LAUNCH-01:150 regression tests pass. No app code, schema, RLS or deployment configuration changed this increment; current accepted app source remains6b28858/native9c8af722. Confirmed search-return gap: Lathrop q=Shamblin → detail → Back to Lathrop results omits q and adds Home Services. SEARCH-02 P2 remains OPEN: preserve safe search-return context without weakening authentication return-URL controls. Contact links inspected only; no calls, messages or synthetic participation.

SEO-03: canonical Search Console overview checked again after11:31PMrequest; performance/indexing/experience/enhancement baselines still processing. No redundant sitemap/indexing request or new indexing/traffic claim. Prior successful sitemap submission and city-index evidence remain valid historical evidence.

Facebook drafts remain UNPUBLISHED. Mountain House2026photo reuse/location task, Manteca exact-photo-location acceptance, genuine-reporter pet pilot, physical-phone notification/native contact-app tests and genuine resident/owner acceptance remain OPEN. Next priority: SEARCH-02 continuity, evidence-backed thin-category expansion and meaningful Search Console baseline changes.


## November 8 — electrical, city-context and typed-search acceptance

DATA-17:88dated website checks. Luminate Electric and Lainez Electric have explicit four-city electrical-service evidence; dated Electrical services shortlists show2in each city at390px with no document overflow. Source evidence/limits remain separate from license, insurance, quality and appointment confirmation. No calls, forms, bookings, messages or synthetic resident/pet outcomes created. [Provider evidence](research/electrical-coverage-2026-11-08.json).

UX-04 accepted:78a040f/nativee3c270a1 Ready1m59s, inherited by current source6b28858/native9c8af722 Ready2m16s. Provider theme follows validated resident browsing city; actual office city/neutral pin retained. Live Barton in Manteca changed from Mountain House blue to Manteca orange while office text stayed Modesto. New Luminate detail uses Manteca styling while labeled Lathrop. Local four-city gradient controls passed.

SEARCH-01 accepted: reproduced electrician on Manteca electrical shortlist0→2 after exact service-term lookup. All four electrical shortlists return2with typed electrician. Conflicting Manteca Pet Services or plumbing filters return0. Real city-page search form with electrician retains Manteca and returns3ordinary-search results including both checked providers; general search still permits ordinary text matches and does not claim every result checked.150tests and final OpenNext/TypeScript pass. [Acceptance](research/service-search-acceptance-2026-11-08.md), before/after screenshots research/nov8-electrician-search-before.png and research/nov8-electrician-search-live.png. Provider proof research/nov8-electrical-provider-live.png. Device emulation reset.

SEO-03 baseline remains processing; no redundant sitemap/indexing requests, new indexing count or growth claim. FB drafts unpublished, photo tasks and genuine-reporter pet pilot OPEN. Physical-phone delivery/native contact-app behavior and genuine resident/owner participation OPEN. Next UX acceptance includes typed-search→detail→return continuity; expand thin categories only with explicit source coverage.


## November 8 — typed-service search launch fix

SEARCH-01 P1: reproduced live Manteca Electrical services + electrician returning0despite2checked choices. Exact role/canonical terms now also match dated service tags via public checked IDs; existing city/category/explicit-service/publication constraints remain. No inference for ambiguous cleaning/solar/pet-care terms or company-name fragments; ordinary text results retain per-row evidence status. Anonymous public API composed-filter checks return2for all four electrical shortlists and0for conflicting Pet Services/plumbing cases. New regressions cover normalization, exactness and filter-like input. [Evidence](research/service-search-acceptance-2026-11-08.md). Final build/native/live acceptance pending.

Electrical/theme increment is already deployed:78a040f / nativee3c270a1 Ready1m59s. Live390px shortlists show2eachcity and active Electrical services shortcut; browsing Manteca now uses Manteca gradient while Modesto office label stays intact.88dated website checks remain. FB drafts unpublished, photo tasks and genuine-reporter pet pilot OPEN; physical-phone and genuine resident/owner acceptance OPEN. Search Console baseline still processing.


## November 8 — electrical coverage and provider-page city consistency

DATA-17: published Luminate Electric (Lathrop based) and Lainez Electric (Manteca based), each with explicit first-party service-area evidence for all four cities and public phone/name/domain duplicate checks.88dated checks; Electrical services has2choices in each city. No office/home street address, photographs, license/insurance/quality confirmation, price, appointment or emergency-response endorsement copied. [Evidence](research/electrical-coverage-2026-11-08.json) and matching SQL. Website information checks remain separate from required credential/availability checks.

LAUNCH-01/UX-04: shared Electrical services shortcut uses a distinct service tag, not generic handyman classification. Provider detail styling now follows validated browsing-city context while office text/emoji uses the business's actual city or neutral pin. Fixes unsupported office-city fallback to Mountain House styling. Local rendered checks on a Modesto provider confirm each four-city gradient with office label still Modesto.147tests and final OpenNext/TypeScript pass; native/live acceptance pending.

SEO-03 follow-up after7:53PMrequest: overview baseline reports still processing; no new traffic/indexing baseline or redundant submission. FB drafts unpublished. Photo acceptance tasks, genuine-reporter pet pilot, physical-phone delivery/native contact-app behavior and genuine resident/owner acceptance remain OPEN.


## November 8 — garage-door and landmark release accepted

DATA-16/LAUNCH-01: source8396829 deployed Ready2m21s, native3cbd34ed.86dated website checks total. Dedicated Garage door repair shortlist shows Barton Overhead Door and R&S Erection of Tri-County for each of Mountain House/Tracy/Lathrop/Manteca. Live390px city-link switching retains category/service, shows2of2choices in each city, selected shortcut remains active and no document overflow. Both office cities remain Modesto; no local walk-in office inferred. Detail and related-provider link preserve Manteca/garage-door context. No calls, bookings, messages or synthetic reports/outcomes created. [Evidence](research/garage-door-coverage-2026-11-08.json); screenshot research/nov8-garage-door-live.png.

A11Y-01 scoped acceptance: prior note naming city/directory nesting was too broad. Those pages already use div wrappers; My business requests was the confirmed duplicate-main case. Live request page changed from2main landmarks to1, shared focusable main-content retained, keyboard Tab reaches Skip to content and Enter focuses main-content. Local requests/directory/four-city pages each have one main.147tests and final OpenNext/TypeScript pass. This closes the scoped landmark fix, not a full accessibility audit or physical-device acceptance. Device emulation reset.

SEO-03 current baseline reports still processing; no redundant sitemap/indexing requests or growth claim. Pet-sitting/dog-walking depth remains OPEN where new leads lack current first-party coverage. FB drafts unpublished; photo acceptance tasks, genuine-reporter pet pilot, genuine resident/owner participation and physical-phone push/native contact-app acceptance remain OPEN. Next: expand supply with evidence and continue bounded resident task/mobile checks.


## November 8 — garage-door repair and scoped landmark fix

DATA-16: published Barton Overhead Door and R&S Erection of Tri-County with explicit first-party Mountain House/Tracy/Lathrop/Manteca coverage and Modesto office city.86dated checks; garage-door repair has two dated choices per city. Website/phone/name duplicate check passed. No local branch inferred, resident/home address or image reused, credential/quality/availability or emergency-response guarantee. Pet-sitting leads remain held without sufficient current first-party coverage. [Evidence](research/garage-door-coverage-2026-11-08.json) and matching SQL.

LAUNCH-01: added a distinct Garage door repair shortcut/tag through the shared service configuration for directory/city/Discover. Generic handyman listings are not classified as door repair. Local rendered shortcut checks pass for all four city pages and directory. A11Y-01 scope corrected: city/directory pages already use div; actual duplicate main was My business requests only. Changed that page wrapper to div, preserving shared main-content focus target. Local rendered requests/directory/four-city pages each have exactly one main and the focusable skip target.147tests and final OpenNext/TypeScript pass; native/live acceptance pending. No broad accessibility conformance claim.

SEO-03 follow-up after7:42PMrequest: overview performance/indexing/experience/enhancement reports still processing; no redundant sitemap submission/indexing request or growth claim. FB drafts unpublished. Photo tasks, genuine-reporter pet pilot, physical-phone delivery and genuine resident/owner acceptance remain OPEN.


## November 8 — grooming and city-sharing release accepted

DATA-15:84dated checks after two new providers and one existing-brand correction. California Pet Grooming Mobile names all four cities. Ana's Mobile Dog Grooming appears only in Lathrop/Manteca, with new-client exclusions and parking/apartment/weight restrictions retained. Bayberry ID50b70a38-4a16-44e4-8ba3-feaa10231ff1 now identifies iLuvMyPack/former Bayberry from official source evidence; former-brand search returns one result rather than duplicate operators. Live390px results: Mountain House3/Tracy4/Lathrop4/Manteca4, correct Ana inclusion/exclusion, no document overflow. No appointment, owner confirmation, quality/credential or photo-rights claim. [Evidence](research/grooming-followup-2026-11-08.json); screenshot research/nov8-mobile-grooming-live.png.

SEO-02/LAUNCH-01: sourcec6b6c94 deployed Ready2m12s, native2221be8a.147tests and final OpenNext/TypeScript pass. All four live city routes have matching city-specific canonical/og:url/title, own-logo og:image/alt and Twitter summary card. These are emitted metadata, not acceptance of Facebook/X cached previews; no platform rescrape or post performed. Root description names all four cities. All four city landing pages also fit320px without document overflow. Device emulation reset.

SEO-03: current baseline reports remain processing; no redundant sitemap/indexing requests or growth claim. A11Y-01 P2 queued: audit shared/page main-landmark ownership (SiteLayout wrapper plus page main elements) before accessibility conformance claims. Next supply work remains thin pet-sitting/dog-walking depth in Lathrop/Manteca, with genuine resident/owner acceptance and physical-phone delivery checks still OPEN. FB drafts unpublished; photo acceptance tasks and genuine-reporter pet pilot OPEN. No outreach/spend/monetization activated.


## November 8 — mobile-grooming depth, brand correction and city sharing

DATA-15: published California Pet Grooming Mobile with all four explicit service cities and Ana's Mobile Dog Grooming with Lathrop/Manteca only. Ana's FAQ excludes new clients in Mountain House/Tracy and lists parking/apartment/weight restrictions; no inferred coverage. Corrected existing Bayberry record to iLuvMyPack Mobile Grooming (formerly Bayberry Grooming), based on official former-brand statement, retaining its ID and not counting a duplicate operator.84dated checks; mobile-grooming choices now Mountain House3/Tracy4/Lathrop4/Manteca4. No public home/visitor address, photos, fixed prices or quality/credentials/availability endorsement. [Evidence](research/grooming-followup-2026-11-08.json) and matching SQL. Live city/eligibility acceptance pending.

SEO-02/LAUNCH-01: city routes now emit city-specific Open Graph and Twitter summary metadata using the existing MoHoLocal brand icon, explicitly labeled logo; no city photography generated/reused. Root description names all four cities. Local HTTP rendered checks pass for all four canonical/title/description/image/card combinations.147tests and final OpenNext/TypeScript pass. Native/live verification pending; actual Facebook/X cache rendering not tested and nothing posted.

SEO-03: current overview performance/indexing/experience/enhancement reports still processing; no redundant submission or growth/baseline claim. Keep successful prior sitemap/city-index evidence separate from later inventory additions. FB drafts unpublished. Photo tasks and genuine-reporter pet pilot OPEN; physical phone/push and genuine resident/owner acceptance remain OPEN.


## November 8 — carpet and utility-route release accepted

DATA-14:82dated checks. Reynolds Carpet Cleaning Service & Janitorial and Magic Wand Professional Cleaning Services are live with individually named coverage for all four cities. Phone-width390px search acceptance matches carpet-cleaning counts Mountain House3/Tracy4/Lathrop4/Manteca4, without horizontal overflow. No contact sent, photos reused, office address invented or quality/credentials/availability endorsement. [Evidence](research/carpet-expansion-2026-11-08.json); screenshot research/nov8-phone-carpet-options-live.png.

SEO-02/LAUNCH-01: source2ea7949 deployed Ready3m6s, native versionea0f0652.147tests and final OpenNext/TypeScript pass. Ten utility route groups have rendered noindex/nofollow locally. Live checks confirm login/register/requests/claim/business submission/community submission; public Manteca and business-detail negative controls have no noindex. Claim CTA now describes ownership review/tracking, with no instant-editing/two-minute claim. Live390px detail fits; screenshot research/nov8-phone-claim-review-live.png. Device emulation reset. No account/RLS/robots-account security changes; indexing metadata is not access control or guaranteed removal.

SEO-03: follow-up overview performance/indexing/experience/enhancement data still processing; no new baseline or growth claim and no redundant sitemap resubmission. Prior Google Success/1,102discovered and four indexed city pages remain accepted; that historical count does not imply all newly added catalog pages indexed. Next: thin Lathrop/Manteca pet-care/mobile-grooming depth, useful city/social previews and genuine resident/owner acceptance. Physical-phone push/native contact-app acceptance, photo tasks and genuine-reporter pet pilot remain OPEN. FB drafts remain unpublished; no outreach, spend or monetization activation.


## November 8 — carpet-cleaning coverage and utility-page launch polish

DATA-14 increment: published Reynolds Carpet Cleaning Service & Janitorial and Magic Wand Professional Cleaning Services, both with explicit first-party coverage for Mountain House/Tracy/Lathrop/Manteca, public phone checks and domain/name/phone deduplication.82dated checks total. Carpet-cleaning choices now3/4/4/4 respectively. No visitor-office address, photos, fixed offers, credential/quality or availability endorsement copied. Supreme identity/contact validation incomplete; Sampa footer/location conflict held. [Evidence](research/carpet-expansion-2026-11-08.json) and matching publication transaction. Live four-city UI acceptance pending.

SEO-02/LAUNCH-01: added noindex/nofollow metadata to ten utility route groups (login, register, profile, requests, admin, claim, report, business submission, community submission, auth callback), matching existing private message/pet report behavior. Local rendered output confirms all ten carry the rule while city/business detail pages remain indexable. No auth/RLS or crawler-account security settings changed; robots directives are not access control and blocked crawlers may not read metadata. Claim CTA now accurately describes ownership review/tracking and removes an unsupported two-minute/self-service promise.147tests and final OpenNext/TypeScript pass; native/live verification pending.

SEO-03 follow-up: performance/indexing/experience/enhancement overview still says Processing data; no fresh baseline or growth claim. Prior successful1,102-URL sitemap read and four indexed city landing pages remain the last accepted evidence; no redundant resubmission. FB drafts unpublished, photo tasks and genuine-reporter pet pilot OPEN.


## November 8 — launch follow-up accepted

SEO-03: canonical URL-prefix ownership verified using Google-provided public HTML file; retain it. Recovered property history had an old March13 sitemap read/107discovered pages. November8 resubmission now shows last read November8, Success and1,102discovered pages. All four city landing-page URL inspections report indexed. Mountain House live Google smartphone fetch succeeds with crawl/indexing allowed and expected canonical. Performance/index-coverage baselines are still processing; discovered pages are not all indexed pages. [Search Console evidence](marketing/search-console-2026-11-08.md). No new analytics tracking, DNS/OAuth grants or public posts.

LAUNCH-01: pet-board city handoff defect fixed and live-accepted at390px: Manteca board → /submit?submission_type=lost_pet&city=Manteca; Manteca aria-pressed=true, Mountain House=false, no horizontal overflow. Alias accepts only a single supported city; local HTTP checks exclude unknown/repeated cities. Source4620549/native68a769c3 Ready2m29s;147tests and final OpenNext/TypeScript pass. Device emulation reset after checks. No actual report/claim/submission or contact sent. Four-city phone-emulated pet-sitting results and no-result recovery passed earlier in this increment. Physical-device push/native contact-app behavior and genuine-user submission acceptance stay OPEN.

DATA-13 increment accepted:80dated checks; pet sitting/dog walking choices Mountain House3/Tracy3/Lathrop2/Manteca2, with explicit first-party city evidence and no blanket credentials/quality/availability endorsement. Next supply work: deepen Lathrop/Manteca pet-care choices and Mountain House carpet-cleaning options, preserving duplicates/service-area gates. Current FB drafts remain unpublished. Photo acceptance tasks and genuine-reporter pet pilot remain OPEN. No monetization activated.


## November 8 — phone-width launch checks, pet-care supply and Search Console

DATA-13: published Acti-Kare of Tracy pet-care offering (Mountain House/Tracy/Lathrop) and Growls N Meows (Mountain House/Tracy/Manteca), after domain/name/phone duplicate checks and dated first-party service-city checks.80dated checks total; pet-sitting and dog-walking coverage now3/3/2/2 across Mountain House/Tracy/Lathrop/Manteca. No inferred fourth-city coverage, public home addresses, reused photos, credentials, quality or current availability endorsement. [Evidence](research/pet-care-expansion-2026-11-08.json). Continue thin-category depth; this increment does not close ongoing supply work.

LAUNCH-01:390px browser-emulated four-city pet-sitting results fit without horizontal overflow; Manteca no-result recovery restores original city/service and two options. Provider detail preserves context and contact evidence. Physical-phone notification and genuine-user transaction acceptance remain OPEN. SEO-03: canonical Search Console URL-prefix setup and verification-file native build in progress; sitemap/index acceptance pending. No new analytics tracking or account access grants. FB drafts remain unpublished; photo tasks and genuine-reporter pet pilot remain OPEN. [Acceptance ledger](launch-readiness-2026-11-08.md).


## November 8 — monetization ownership and resident readiness

MON-01: role expanded to Growth, Community Marketing & Monetization Lead. Own pricing/offer research, willingness-to-pay validation, business retention, revenue/cost measurement and clearly disclosed sponsorship proposals. [Validation plan](marketing/monetization-validation-plan.md). Research/proposal only; no billing, charges, outreach, ad spend or commercial promises. Keep initial basic browsing/listings free; payment cannot buy verification or undisclosed recommendations.

LAUNCH-01: resident usability takes precedence over promotion. [Readiness ledger](launch-readiness-2026-11-08.md) distinguishes observed entry flows from genuine-user/device acceptance. Source344b9fb deployed via native Cloudflare build Ready1m47s, version0d2c120c. Live XML has1100 distinct URLs (1007business/41event/52static), no retired sitemap entries, and the explicit-coverage out-of-city provider is retained. /api/sitemap resolves to canonical /sitemap.xml. Live submission form offers exactly Mountain House, Tracy, Lathrop and Manteca.147 tests and final OpenNext/TypeScript build pass. Screenshot:research/nov8-four-city-submission-live.png. No production submission, claim, message, outcome or pet report created. Desktop browser checks only; attempted phone viewport override did not produce a phone-sized document and was reset. Search Console and genuine-user/device acceptance remain OPEN.

Four city Facebook drafts are complete and remain unsent/unpublished; no social scheduling. SEO-01 deployed and live-accepted (344b9fb / version0d2c120c); Search Console indexing and performance baseline remain OPEN. Continue DATA-13 verified pet-care expansion; photo tasks and genuine-reporter pet pilot remain OPEN.


## November 8 — growth role, local SEO and Facebook drafts

GROW-01: added Growth & Community Marketing Lead to OPERATIONS.md, covering local SEO, community content, honest measurement and business participation. Four founder-disclosed city-specific Facebook drafts are ready in [marketing/facebook-city-drafts-2026-11-08.md](marketing/facebook-city-drafts-2026-11-08.md). DRAFT ONLY: nothing posted, sent or scheduled; no outreach or paid spend.

SEO-01: corrected sitemap scope to our four cities, removed retired/regional sitemap entries, added Discover/Classes, paginated public catalog queries, fixed missing event/pet field queries and replaced silent query failures with retryable503. Alternate sitemap redirects to the canonical endpoint. Local XML and redirect checks pass:1100 URLs (52static/1007business/41event/0pet), including providers based outside our cities with explicit coverage.147 tests pass; final native build/deployment accepted. Removed static XML shadowing the live route. Business submission UI narrowed to four launch cities. Resident readiness now takes priority over promotion; [readiness ledger](launch-readiness-2026-11-08.md) records evidence and remaining gates. [Audit and next priorities](marketing/local-seo-audit-2026-11-08.md). SEO-02 content/social/utility-route audit and SEO-03 Search Console indexing/baseline remain OPEN. No ranking or growth lift claimed. DATA-13 pet-care expansion remains next data priority; photo acceptance tasks and genuine-reporter pet pilot remain OPEN.


## Current priorities — November 8 evening

Priority chosen from production coverage counts, rather than adding features by default. Heating/AC had1dated choice per city versus6–8plumbing choices. DATA-12: published IrishHeating&Air and Warren's, explicitly covering all four cities; heating/AC now3dated choices in MountainHouse,Tracy,Lathrop,Manteca. Native directory filters checked live in all four cities. Street addresses withheld where visitor-office evidence or conflicting addresses prevented certainty. These are website checks, not owner confirmations, credentials, availability or quality endorsements. [Evidence](research/heating-priority-2026-11-08.json), [publication SQL](research/publish-heating-priority-2026-11-08.sql), screenshot research/nov8-heating-priority-live.png. Data-only publication; existing application unchanged.

Next execution order:
1. DATA-13: strengthen pet sitting/dog walking, currently1dated option per city. Require explicit service cities; do not assume coverage from group membership or office location.
2. DATA-14: fill carpet-cleaning depth (MountainHouse1; other cities2 before this pass) and mobile-grooming depth (2percity exceptTracy3), with distinct operator/contact checks and no generalized house-cleaning tags.
3. PILOT-01/METRIC-01: genuine resident use and voluntary outcomes; no fake reports or conversion claims. Pet reporter pilot remains gated on a real eligible reporter, not a synthetic case.
4. Continue bounded UI/mobile checks tied to actual resident tasks and confirmed defects. Photo rights/location acceptance tasks stay OPEN; do not replace assets without meeting criteria. No outreach authorized.


## November 8 — private outcome overview and carpet-cleaning discovery

Added an admin-only30-Pacific-day outcome summary with all four city totals, refresh/error/loading states and explicit self-report/selection-bias limits. Database enforces confirmed non-anonymous non-banned admin access; public/ordinary users cannot retrieve the summary. Missing/error payloads do not become zero, and raw/private account/limit rows remain inaccessible. SQL transaction checks passed for no-auth/nonadmin rejection and admin city/date scope; no data written.144 tests and final OpenNext/TypeScript build pass. Source7646125 deployed Ready2m2s, version8f431669. Live owner admin summary and Refresh show October10–November8 with all four city rows and0actual updates. Lathrop carpet filter shows Ayres and selected shortcut.76 dated website checks;41 event records unchanged. Screenshot:research/nov8-carpet-discovery-live.png.

Published AyresCarpet&TileCleaning after official identity/contact/service-city check, explicitly Manteca/Lathrop/Tracy; no MountainHouse from and-more language. Added dedicated carpet/tile shortcut, not general house-cleaning classification. BasilBee held without first-party service evidence. No photo reuse, credentials/quality/safety or holiday availability endorsement. Photo tasks, genuine reporter pet pilot and real resident outcome participation remain OPEN. [Source evidence](research/carpet-summary-2026-11-08.json).


## November 8 — outcome sign-in continuity and holiday service evidence

Fixed an acceptance gap: /directory was absent from safeReturnTo, so the original optional outcome login could return home. Added plain directory and tightly validated city-only #resident-outcome targets; unknown cities, duplicate city parameters, foreign next parameters and alternate fragments fail closed. The form opens on its fragment, restores selected city after sign-in and clearly asks residents to choose a result again rather than silently submitting a draft. A top-of-directory shortcut makes the optional form discoverable without passive tracking.142 tests and final OpenNext/TypeScript build pass. Source3acab94 deployed Ready1m40s, version551c8860. Live Lathrop fragment auto-opens form with Lathrop selected; signed-out login and JoinFree link retain exact city/fragment target. Manteca top shortcut preserves current service filters and opens the form. Screenshot:research/nov8-outcome-return-live.png. No authenticated submission or outcome generated. Hosted total75 dated checks;41 event records unchanged.

Published LenziCleaning with dated first-party holiday-light service evidence for commercial coverage in Tracy/Lathrop/Manteca. Residential address coverage remains unconfirmed; MountainHouse excluded. Rudolph lead held for inconsistent footer/other-brand reference; no guessed phone. No photo reuse, outreach, holiday-hours or booking promises. Photo tasks, genuine reporter pet pilot and real resident outcome participation remain OPEN. [Evidence](research/holiday-return-2026-11-08.json).


## November 8 — optional resident outcomes and Lathrop/Manteca expansion

METRIC-01c first increment: optional directory form, explicit city/result, confirmed sign-in, one report/account/Pacific day. Private daily totals contain no resident/business/search/contact identifiers; separate private anti-repeat row holds latest day only. No passive tracking or verified-booking claim. Privacy disclosure updated. SQL rollback security/retry tests and141 tests pass; final OpenNext/TypeScript build passed. Sourced2cfe42 deployed Ready1m52s, versionc057c057. Live Manteca form defaults city correctly, stays optional, and signed-out submission shows sign-in without recording an outcome. Privacy disclosure verified; aggregate/limiter remain0 after test. Screenshot:research/nov8-outcome-form-live.png. [Release evidence](research/resident-outcome-release-2026-11-08.md). Passive search/contact instrumentation and genuine resident participation remain OPEN.

Published PerfectionCleaning for explicit Lathrop/Manteca coverage and VinceHaroHauling for explicit Lathrop/Manteca/Tracy coverage.74 dated website checks;41 approved event records unchanged. No MountainHouse inference, duplicates, image reuse or outreach. Photo acceptance tasks and genuine-reporter pet pilot stay OPEN.


## November 8 — Lathrop/Manteca supply and outcome audit

Published JVS Plumbing (explicit Lathrop service) and MW Plumbing (explicit Manteca service; POBox excluded from visitable address). Other-city coverage, emergency/holiday availability, credentials and quality not inferred. Sources/holds:research/lathrop-manteca-2026-11-08.json. No duplicated Salen record or referral-site operator, no images or outreach.

METRIC-01 audit found no application search/contact analytics; listing requests are not provider inquiries, and contact clicks would not prove successful connections. Live DOM confirms a Cloudflare Insights traffic beacon; delivery/dashboard totals remain unchecked, and this is not resident-outcome instrumentation. Prioritized privacy-preserving measurement and optional self-reported outcome stages are documented in [audit](research/resident-outcome-audit-2026-11-08.md); instrumentation is not shipped. REV-01 willingness-to-pay remains unproven.

UX: no-results can check other cities retaining service/category/query, or broaden local listings retaining city, with a coverage caution. 140 tests and final OpenNext/TypeScript build passed. Sourceca5357d deployed Ready1m42s, version5b2fd9fa. Live Manteca plumbing no-result → other cities retains query/category/service; Lathrop local recovery retains city and clears category/query. Evidence:research/nov8-no-results-recovery-live.png. Hosted total72 dated listing checks;41 approved event records unchanged. Keep MountainHouse/Manteca photo tasks and genuine-reporter pet pilot OPEN.


## November 8 — library programs, gym evidence and event duration

Published Iron Zone Gym in Mountain House after official contact/address/service checks; 24/7 is member access, not established staffed/visitor/holiday hours. Added MountainHouse November19 11:30AM–12:15PM AnimalServices storytime (no animals present) and November30 4–5PM winter reading kickoff (snow-themed activities; no real-snow promise). Winter kickoff appears in seasonal discovery. Hosted readback:70 dated listing checks,41 approved event records including past. SafeHaven source timed out and is held; existing TracyCyclery record was not duplicated or updated from an unverified domain. [Sources and holds](research/gym-library-2026-11-08.json).

UX across all four cities: event cards now show known end times and explicit PacificTime, with overnight end dates preserved and missing/invalid ends handled conservatively. Existing description previews already existed; no claim that they were newly added. 140 tests pass, including date rollover and invalid-end regressions. Final OpenNext/TypeScript build passed; source635258d deployed Ready2m11s, versione7591e4e. Live event-duration labels verified in all four city views; known ends show ranges, unknown ends retain start only. Screenshot:research/nov8-event-duration-live.png. User-confirmed project rules are recorded in PROJECT_ALIGNMENT.md. Photo tasks and genuine-reporter pet pilot remain OPEN. Next supply priority: independently checked Lathrop/Manteca providers; no unsupported service-area expansion.


## Cross-chat alignment — November 8

Reviewed recent decisions in Research online directory concept: its mobile-sawmill experiment and proposed Astro/D1 stack are separate from the existing four-city MoHoLocal app. Keep Next.js/Cloudflare/Supabase. Carry over source verification, service-area matching, confirmed holiday information and outcome measurement. Queue an audit of contact/inquiry measurement and dated holiday-hours evidence; no invented availability or revenue claims. [Decision record](PROJECT_ALIGNMENT.md).

## November 8 — HVAC discovery and newspaper home-service leads

Published Virginia Mechanical after first-party phone/address/service-area checks explicitly covering Mountain House, Tracy, Lathrop and Manteca. Published Image Tile & Stone with Tracy and Mountain House evidence only; office address and other cities not inferred. Added exact Lathrop November17 10:30–11AM preschool storytime from the official library occurrence. Hosted readback:69 dated listing checks and39 approved event records including past. Newspaper page30 pancake breakfast is retrospective and was not made an upcoming event. No credentials, quality, availability or image reuse endorsed.

UX: heating/air-conditioning service shortcut backed by dated provider coverage; archived event pages suppress calendar CTA and use Original event source, while current pages link Organizer details & attendance information. Tests139 and final OpenNext/TypeScript build pass. Source38810c6 deployed, native Ready1m49s, version2d8af0b0. Live MountainHouse HVAC shortcut shows VirginiaMechanical with selected service; archived Diwali event has0calendar CTA and Original event source. Cross-chat research did not change the app stack or city scope. Mountain House real2026 photo, Manteca exact-location verification and genuine-reporter pet pilot remain OPEN. No outreach or fabricated reports. [Evidence](research/matters-home-services-2026-11-08.json).


## November 8 afternoon — contact UX + newspaper continuation

Published The Pampered Pet Grooming & Spa after official contact/site verification (Tracy salon; wider mobile coverage held), plus TracyNov16 Fall Lanterns and MantecaDec4 DIY Winter Crafts from exact library occurrences. Totals67dated listing checks/38approved event records. Public API readbacks pass. Newspaper Hadestown article is retrospective; not added as upcoming. Paws on Puente/V6GarageDoor remain held without accessible first-party confirmation.

Contact UX: iThink Pet's verified host-and-phone pair now opens an empty SMS draft with a Text action across shared four-city discovery cards/detail actions; detail contact row also says Text. No automated outreach, body or recipient inferred.139tests and OpenNext/TypeScript pass; app641dab3 deployed: native build0ef5a790-bf3c-4745-8db0-2ab5b7488306 Ready (2m21s), version53eca25e. Live SMS links verified in all four city shortlists and the Manteca detail page; city/service filters retained. No message sent or physical-device SMS launch claimed. Photo tasks and genuine reporter pet pilot stay OPEN. [Evidence](research/nov8-contact-release.md).

## November 8 freshness + event discovery

Resumed source review: homepage still links October28 flagship. Newspaper pages26/29 leads independently checked; published Spencer Flooring & Paint and Golden Valley Nursery in Tracy. Added City-listed Nov18 4:30PM pickleball ribbon cutting, verified against official Form Center/courts page. Totals: 66 dated listing checks / 36 approved event occurrences (historical and future combined). Public API readbacks pass. No surrounding-city coverage inferred.

Events UX: upcoming count, collapsed accessible past-event archive, and no-upcoming recovery across all four cities. Corrected Sunday labeling so the next Saturday is not “This Weekend”; near-term group now “Next 7 Days.” 138 tests, TypeScript and final OpenNext build pass. Source d776c4b deployed: native ef1b07aa-56a3-4fa5-bd15-e300b4bff4f4 Ready (1m48s), version38181574. All four live city views, Lathrop archive keyboard open/close and390px overflow checks pass. Photo replacements and genuine-reporter pet pilot remain OPEN; fresh production has0reporter-linked reports. [Evidence](research/nov8-event-release.md).

## Newspaper verification + class coverage UX — November 6, 2026

Reviewed MH Matters current linked October28 issue civic/calendar/senior/business sections and the user's open official homepage. Published Zany Entertainment (Tracy), added a dated THub Cafe check retaining the cafe-linked 1158 address, and published two city November14 civic occurrences with official RSVP links. Totals: 64 dated listing checks / 35 approved events. Autobot/Falafel leads remain unverified; no guessed coverage or images copied.

Class discovery now shows topic-aware counts for all four cities, an explicit result summary, clear-topic action and counted nearby recovery. 137 tests, TypeScript and final OpenNext build pass. Source2a3e0ba is live (version5d6c0d5a); Manteca music0 → nearby1 recovery and 390px no-overflow checks pass. Native build808f6f70-7063-4b15-8b88-ce0c97fb1500 Ready (2m8s). Photo tasks and real-reporter pet pilot stay OPEN. [Evidence](research/matters-class-release-2026-11-06.md).

## Mountain House Matters source added — November 6, 2026

Confirmed local newspaper at https://www.mhmatters.net/ and linked October 28, 2026 flagship PDF. Add new issues to the twice-weekly source-review queue for provider, event, cultural-program and local-opening leads. Verify candidates with businesses/organizers before publishing. Photos remain rights-held; publication is not reuse permission. Review was targeted, not an exhaustive audit of all 32 pages. [Source note](research/mountain-house-matters-source-2026-11-06.md). Inventory unchanged at 62 checks / 33 events; photo tasks and pet pilot stay open.

## Pet-service discovery and four-city supply — November 6, 2026

Added grouped Home & yard / Pets & everyday care shortcuts and exact mobile-grooming, pet-sitting and dog-walking filters. Directory, Explore and city landing links use category-aware service routes, preserving resident city; incompatible filters rejected. 136 tests, TypeScript and OpenNext build pass; local Lathrop grooming results and 390px overflow checked. App f6aa6d0 deployed; native build 84262a5a-7444-48e2-b4fd-7320ed96160b Ready (2m21s), version a6919bd1. Live pet-sitting result/action and dog-walking route checked; production 390px has no horizontal overflow.

Published Wild Grace Mobile Pet Spa with explicit four-city coverage and four official event occurrences (MH Nov17 BINGO, Tracy Nov15 Chess, Lathrop Nov7 Legos, Manteca Nov18 Circus). Totals 62 dated listing checks / 33 approved events; hosted and anonymous API readbacks pass. No third-party photos copied. MH/Manteca photo tasks and genuine-reporter pet pilot remain OPEN. [Evidence](research/pet-discovery-release-2026-11-06.md).

## Four-city pet services and community programs — November 6, 2026

Published two additional website-checked pet providers, Bayberry Grooming and iThink Pet, each explicitly serving Mountain House, Tracy, Lathrop and Manteca. Added four official occurrences: MH meditation Nov 14; Tracy adult English conversation Nov 20; Lathrop tween keychains Nov 12; Manteca teen horror book club Nov 12. Totals: 61 dated listing checks / 29 approved event occurrences. Anonymous API readbacks passed; live provider/event detail checked. Bayberry waitlist and Lathrop registration/age limits are explicit. No code/schema/access changes or rebuild.

Photo replacements remain OPEN: second Manteca operator-linked gallery has generic/older imagery without a conclusive landmark match; no exact-kiosk claim made. New Mountain House real-estate/social leads have no established capture-and-reuse evidence. No photos copied, fake cases or outreach. Pet pilot remains OPEN; fresh production readback confirms 0 reporter-linked cases and 0 authenticated pet submissions. [Evidence](research/four-city-pet-supply-2026-11-06.md).

## Freshness continuation — November 6, late afternoon

Published one additional website-checked provider, Light Me Up USA serving Tracy, and three specific Mountain House library occurrences: Cards for Cubs (Nov 9), Family Story Time and Teen Nature Dome Displays (Nov 10). Totals: 59 dated listing checks and 25 approved event occurrences. Live provider/event pages and anonymous API readbacks verified; no code, schema or permission changes.

Photo tasks remain OPEN: Manteca candidate has verified April 2026 capture/license but no independently confirmed exact kiosk location. This pass inspected the 445 N Main gallery; its owner marketing close-up and older windmill images do not establish a match. Mountain House search found wrong-location/older Commons results and no qualifying replacement. No images reused or outreach sent. Genuine-reporter pet pilot stays OPEN pending an actual case; no synthetic production reports. [Evidence](research/freshness-evening-2026-11-06.md).

## Fresh content + genuine pet pilot readiness — November 6, afternoon

Published2website-checked providers (Bird Proof serving explicit MH/Lathrop areas; Watermill Main&Alameda inManteca) and3official library occurrences (TracyNov7DiamondPainting/Nov9BookBuddies; MantecaNov10ReptileExperience). Totals58dated listing checks/22approved occurrences. Anonymous API and live directory/event detail checks pass; no app/schema/permission change. Provider credential/quality/availability checks and photo rights remain separate. [Evidence](research/pilot-freshness-followup-2026-11-06.md).

Real-reporter pilot remains OPEN:0linked reporter records/0authenticated pet submissions. Actual signed-in account reaches My pet reports empty state and enabled, preselected pet intake; status selector tested without submitting. No genuine case available, fake record created or outreach sent. Manteca photo location remains HOLD after checking both official Watermill addresses and read-only older map imagery; no conclusive exact-kiosk match. Mountain House real2026photo remains OPEN.

## Pet matching/contact deployment accepted — November 6, 2026

PET-05 matching/contact increment deployed: application9996ab5, native buildeaae2ae5-73c6-4759-9ed2-fd31482f6cf6 Ready (2m17s), versionf169d1e7.135tests, TypeScript/OpenNext pass. Live board new explanations, four-city navigation and390px layout checked; missing report and removed local fixture return404. Anonymous RPC safe-read200/[] and mutation401 checks pass. Reporter permissions/revision/quota/visibility tests pass on disposable local Postgres. Current production:60legacy reports,0reporter-linked public cases; real-reporter saved-case pilot remains OPEN. No automatic identity match, reunion, message or notification is implied. [Release evidence](pet-matching-release-2026-11-06.md).

Photo continuation: Commons text search found a new April19,2026 Manteca Watermill Express photo by TaurusEmerald with explicit CC BY-SA4.0 and matching EXIF date. HOLD pending independent site corroboration/editorial suitability; no street address inferred. A generic2026 “Mountain house” image has no California location evidence and is excluded. Mountain House/Manteca replacements remain OPEN; no outreach. [Candidate checkpoint](research/photo-sources/pet-release-photo-checkpoint-20261106.json).

## Pet matching/contact release — November 6 afternoon, verification in progress

PET-05 manual possible-match linking and reporter contact milestones implemented.135tests pass; hosted anonymous read200/[] and mutation401 checks pass. Applied migration confirmed as20261106220449 and local filename aligned. Hosted data remains60legacy reports/0linked reporters/0eligible public cases; no fake production cases. Real-reporter pilot/disputes remain open.320/390px local fixture checks pass; QA route removed. Native deployment/live acceptance pending. [Release details](pet-matching-release-2026-11-06.md).

Mountain House/Manteca real2026 photo searches remain open. Current targeted search surfaced2024 DollarGeneral and2020 IHOP imagery reused on2026 pages; no qualifying new asset or replacement. Previous wider catalog/Flickr/Mapillary checkpoints retained. No outreach.

## Mountain House / Manteca photo continuation — November 6, late afternoon

Expanded Commons geographic metadata review:100 returned Mountain House-area files and87 Manteca-area files within10km searches; no2026 capture dates in returned metadata (bounded searches, not exhaustive). New Manteca charger-page lead rejected after original Mapillary capture proved July14,2018; Time travel comparison November23,2021 also fails. Manteca Flickr commercial-use/modification-permitted2026 query explicitly returned no matches. Evidence: [photo checkpoint](research/photo-sources/mh-manteca-photo-checkpoint-20261106-late.json).

Mountain House real2026 street photo and Manteca photo remain OPEN. No replacement, rights assumption or outreach. Lathrop c27b38a/version05c8fa94 remains latest accepted image release. Continue new existing-license sources with actual capture dates; do not repeat rejected sources as new candidates.

## Lathrop photo release accepted — November 6, 2026

Application c27b38a / native build2f624477-25fe-49da-b3fd-937b1da90d48 Ready, version05c8fa94. Licensed March23,2026 Lathrop Harlan Road-area photograph now replaces the guide/hub placeholder, with Anthrico/Panoramax credit and CC BY-SA4.0 source/license links. Live image-load and390px width checks pass;135 workspace tests, TypeScript and OpenNext pass. Separate credits navigation was blocked by browser security policy; no workaround attempted. Source/rights record and screenshot saved.

Mountain House real2026 street photo and Manteca photo remain OPEN; satellite/welcome panel retained. More recent search checkpoints include Panoramax all three cities, wider Manteca Mapillary coverage and KartaView (0), plus rejected older/all-rights-reserved/wrong-location results. No outreach. [Research evidence](research/city-photos-2026-afternoon-followup.md).

## 2026 photo follow-up — November 6 afternoon

Lathrop qualifying March23,2026 Anthrico/Panoramax street photo found: original publisher GPS/capture/CC BY-SA4.0 verified, landmark cross-checked with official IHG. Guide/hub welcome panel replaced locally; deployment pending. Mountain House street photo and Manteca photo remain open. Rejected2016 imagery, Colorado namesake and2026 Flickr photo with all-rights-reserved license. No messages sent. [Evidence](research/city-photos-2026-afternoon-followup.md).

## Resident guide release accepted — November 6, 2026

Application deac43c deployed through native Cloudflare build 43db9bfa-e9b4-4c24-9e7d-282fafbc7986 (Ready; version fad66bdf). Live hub and all four city guides checked; Mountain House checklist increments, switching to Tracy resets its page-local progress, 320/390px document widths match viewport. Brentwood guide displays 404. Exact committed release passes 123 tests; full workspace including pending pet work passes 135. TypeScript/OpenNext pass.

RES-01 guide accuracy corrections complete: official utilities/enrollment links replace unsupported scores, estimates and legacy provider selections. Catalog duplicate cleanup remains DATA-02. RES-02 core layout/checklist complete; photo completion remains open for Lathrop/Manteca and a real2026 Mountain House street view. Existing image credits preserved. No new providers/events imported by this release. Pet matching remains separate and unreleased. See [release evidence](new-resident-release-2026-11-06.md).

## New Resident Guide implementation — November 6 afternoon

RES-01 core accuracy corrections and RES-02 checklist/layout implemented; release verification in progress. Guide now uses official utility and enrollment resources for exactly four relaunch cities. Removed hardcoded school ratings, unsupported endorsements, travel estimates and legacy business selections; directory discovery uses city-preserving links instead, so the guide no longer has a silent database-failure empty state. Existing duplicate/legacy catalog audit remains open under DATA-02.

Interactive six-step checklist is page-local and explicitly not saved to an account. Tracy uses the existing rights-checked 2026 street photo; Mountain House uses the labeled 2026 satellite image. Lathrop/Manteca photos and Mountain House street photography remain open until location/capture/reuse evidence is available. Designed welcome panels fill unapproved photo slots. No substituted city imagery. TypeScript and 135 repository tests passed; native build/live acceptance pending. Pet matching work remains separate and unreleased.

## New Resident Guide follow-up — November 6

RES-01 (P1, queued): utility accuracy, unsupported school scores, listing evidence/duplicates and fetch-error handling. RES-02 (P2, queued): align four-city scope and redesign around practical move-in tasks, licensed photos, current events/classes and city context. [Audit and acceptance](research/new-resident-audit-2026-11-06.md). No redesign deployed by this audit.

## Relaunch backlog — updated November 6, 2026 (current priority)

Regional direction (November 5 follow-up): one shared discovery experience for Mountain House, Tracy, Lathrop and Manteca; verify city coverage separately. Initial editorial verification remains Mountain House/Tracy.

Founder direction: retain Next.js, Cloudflare and Supabase; relaunch Mountain House and Tracy with a revised UX/UI. This backlog supersedes historical sprint priorities below. No bulk seeding or automatic publication. Individually sourced and editorially checked additional providers are authorized by the November 5 follow-up. Security and workflow implementation is authorized; broader rollout follows the acceptance gates.

| ID | Priority / workstream | Deliverable and acceptance | Dependency / status |
|---|---|---|---|
| SEC-01 | P0 · Backend | Replace unrestricted business/image/city/staging policies; public reads expose publishable rows/fields; cross-user writes denied; RLS stays on | Implemented and deployed; see docs/security/release-2026-11-05.txt |
| SEC-02 | P0 · Worker | Fail-closed verified admin authorization; protect manual run/validation routes; mutating routes require POST; negative authorization tests | Implemented and deployed; see docs/security/release-2026-11-05.txt |
| SEC-03 | P0 · Intake/email | Bounded validated requests, durable rate controls, trusted identity, same-origin writes; retire public arbitrary email endpoints | Implemented and deployed; see docs/security/release-2026-11-05.txt |
| SEC-04 | P0 · Release | Capture schema/policy baseline; reproducible dependency/build checks; role-based regression tests; migration/rollback and deployment evidence | 90 automated regressions pass; current dependency audits show zero known vulnerabilities; live account acceptance passes; both native Git builds passed; temporary setup permission removed; SEC-07 complete |
| SEC-05 | P0 · Dependencies | Supported OpenNext Cloudflare build; patched pinned Next.js 15.5.29; existing adapter caps Next.js <=15.5.2; verify preview before Pages/domain cutover | Supported adapter deployed and clean build verified; legacy Pages auto-build disabled; both native Worker Git builds passed |
| AUTH-01 | P0 · Real-account acceptance | Single explicit PKCE code exchange; preserve safe return path; verify Google sign-in and receipt access on live domain | Deployed and real Google sign-in passed; pending receipt → admin rejection with notes → requester status verified on live domain |
| FLOW-01 | P1 · Submission | Save a pending request and receipt; explain sign-in if required; canonical cities; no self-publication; moderator can approve/reject with evidence | Implemented and deployed |
| FLOW-02 | P1 · Claims | Durable requester-bound claim; no early claimed flag; admin checks ownership evidence; atomic owner assignment; duplicate/racing claims handled | Implemented and deployed |
| FLOW-03 | P1 · Moderation | Unified pending/needs-review handling; approval distinct from information checks; affected-row confirmation; audit trail and accurate errors | Implemented and deployed |
| DATA-01 | P1 · Editorial | Audit 72 focus-city Home Services candidates (56 initially public); inspect seed provenance/duplicates; check public contacts, exact services, service areas and sources | 72 baseline candidates researched; twenty-eight individually sourced additions; 56 total dated website checks across categories and 27 unique original launch-category providers, plus specialized roof/bird/lighting and cultural supply. Mountain House: landscaping 8, handyman 5, cleaning 4, plumbing 6; Tracy: 8/5/5/8. Owner confirmations remain open. Latest sources/exclusions in docs/research/provider-legacy-pass-2026-11-06.json and earlier passes |
| DATA-02 | P1 · Trust | Hide unsupported stars; dated scoped checks; private contact/evidence separation; image source/rights review; correction and recheck cadence | 168 unsupported focus-city ratings cleared with audit trail; dated website-check scope and owner-claim labels deployed; image-rights and recheck operations remain open |
| DATA-03 | P1 · Accuracy | Correct aggregate counts, Supabase error handling, city-scoped modules and stale event/community presentation | Homepage counts use exact city queries; false trending removed; results show retry errors; pet board has recent/history views; city/category/discovery error and trust presentation corrected; Discover redesign implemented with four relaunch cities, exact-service routes, readable inventory counts and metadata; local mobile acceptance, native build and live route/metadata/city-card acceptance pass (`c605832`). Legacy Best Of replaced with city/category/service-preserving308 redirects; 110 tests, local/production308/404 and final native/live acceptance pass (`a2f71ad`). Pet board failure handling remains open: distinguish failed fetch from zero reports, suppress count/empty claims and offer retry; fault-injection acceptance required. City/category and broader SEO surfaces still need review |
| UX-01 | P2 · Product/design | Mobile prototypes: city/task homepage, results, business detail, submission and claims; test states, contrast, keyboard/touch access | Homepage/results/detail deployed; city pages redesigned with task search, checked service areas, contacts, pet links and honest wider-directory labels; 320px/390px production checks pass, keyboard skip/Escape work, 44px contact targets and full-width mobile evidence are live; resident testing remains open. Screenshot follow-up: footer community strip simplified to four launch cities with consistent high-contrast 44px links; deployed; tablet header overflow fixed and verified at 888px; 320px/1024px/1280px layout checks also pass |
| UX-02 | P2 · Engineering | Implement exact-service taxonomy and cities-served model, clear contact actions, dated trust labels, scoped search/empty states | Explicit service tags, source-backed service areas, dated trust details, direct contacts and honest empty shortlists deployed; two additional checked providers published. City/task-preserving detail links, checked-area/service related cards, request-first contact guidance and accessible actions deployed (`93d60a4`); native build and live 320px/390px/desktop acceptance passed. 101 tests; evidence in docs/discovery-provider-release-2026-11-06.md. Independent filter-removal, accessible search and city-card contact pass deployed (`5ce1ffc`); 106 tests, final TypeScript/OpenNext/native build and live empty-state/320px/390px acceptance pass. Evidence in docs/filter-openings-release-2026-11-06.md |
| UX-03 | P1 · Local visual identity | Exact-city street photography with confirmed2026 capture and reusable rights; visible source/creator/license/adaptation credits | Tracy July 8, 2026 Mapillary photograph verified, deployed and production accepted (native build 9c74bb7d-193c-47c8-8805-893024130a77). Mountain House replacement unresolved: open catalog checks yielded no qualifying candidate, City content rights reserved. Three joined FB groups reviewed; aerial and ground-level leads held, no external reuse permission established. Retain accurately labeled 2026 satellite image; private evidence outside Git. Existing-rights-only sourcing; user prohibits outreach, no messages sent. Commons geographic and Panoramax capture-date checks yielded no qualifying replacement; source evidence retained |
| OPEN-01 | P2 · Local editorial | Source-checked openings/closures, actual city and status, current links, no expired promotions or invented future events; monthly recheck and stale-feature expiry | New openings researcher/community editor responsibilities documented in OPERATIONS.md. Five source-linked updates for Mountain House/Tracy/Lathrop deployed on homepage and city pages; sixth Manteca Jersey Mike’s update source-checked, deployed and production accepted; evidence in docs/research/local-openings-2026-11-06.md. Native build and live city/mobile acceptance pass; next editorial review due December 6, unrefreshed updates expire after that date. Twice-weekly chat refresh active, Tuesday/Friday9AM Pacific |
| UX-05 | P1 · Explore freshness | Current city-aware Explore menu and Discover page, live source-check cards/events, cultural and exact-service shortcuts, accessible phone navigation | Deployed925f141/native52235ad5-f8a9-4236-9dd2-727f47af39c1 success;113tests, TypeScript/OpenNext and production four-city/search/390px acceptance pass |
| CULT-01 | P1 · Community relevance | Source-check Indian groceries, food, language/cultural classes and public celebrations while retaining inclusive city-wide discovery | Nine food/grocery/language/dance listings newly checked or repaired across four cities; Lathrop Diwali and Manteca observance published with honest participation/time limits; MH community education added. City/topic cultural-class guide deployed10964bc,114tests/native/live acceptance pass; Tabla lessons added. Continue wider offerings and source checks; no profiling or outreach |
| DATA-04 | P1 · Regional coverage | Expand useful service and event coverage to all four relaunch cities; keep city/service freshness and source evidence explicit | Founder scope expanded November6. Latest checked landscaping/handyman/cleaning/plumbing: Mountain House8/5/4/6, Tracy8/5/5/8, Lathrop5/3/5/7, Manteca5/3/5/6. Continue underserved categories; no blanket legacy-inventory verification claim |
| IMG-01 | P2 · Service/event imagery | Useful city-relevant service and actual-event photos with creator, source, capture context, existing reuse grant and visible credits | Open: sixteen initial city/service scopes and five event images recorded in research/service-event-image-backlog-2026-11-06.json; rights-reserved portfolio/flyer leads held. No images borrowed; UX-03 exact-city2026 requirement unchanged |
| CULT-02 | P1 · Class discovery | City/topic guide for checked language/culture, dance and music programs; contact/source/date and honest empty states | Deployed10964bc/native16815f0e-7f62-4666-9534-b6d6c526c3df;114tests and local320/live390px filters/city/recovery acceptance pass. Expand inventory and validate with residents |
| PET-05 | P1 · Pet progress clarity | Distinguish sightings from secured animals; reporter-owned timeline for scan/contact/reunion, private ownership evidence and moderated disputes | First increment deployed9e2c6b4/nativea39cde72-f4e2-4986-bb62-e6b11116e666;121tests/TypeScript/OpenNext/local and live mobile acceptance pass; real-reporter pilot open. Follow-ups: possible-match confirmation, chip/contact milestones and disputes. See pet-progress-release-2026-11-06.md. Qualitative FB thread evidence, no automatic import or unverified animal-care/legal advice. Existing status/DM features remain live |
| DATA-05 | P1 · Quote preparation | Cleaning scope checklist and fabricate/repair/install guidance; existing contacts, no prices or booking promises | Backlog, next after PET-05; detailed Lathrop threads; acceptance in research/resident-priorities-2026-11-06.md |
| SEASON-03 | P1 · Eligibility and venue | Readable actual occurrence date/year, venue, organizer audience and conflict handling for classes/events | Backlog; preserve live calendar/expiry; primary-source verification required |
| DATA-06 | P1 · Delivery clarity | Separately checked pickup base, delivery cities, preorder cutoff and retail/wholesale; explicit unknown fees/availability | Backlog; no geography inference from FB group |
| PET-06 | P1 · Official animal resources | City/species/jurisdiction-specific official sources and dated contact/eligibility checks | Tracy official city-jurisdiction and report/appointment source checked; other cities/species and form destinations remain queued. No resource UI or crowdsourced medical/legal claims |
| FAMILY-01 | P2 · Family-care evidence | Verify childcare identity, official license source/date and current scope before expansion | Candidate leads only; self-promotion is not resident demand |
| COMM-04 | P2 · Community offer lifecycle | Available/reserved/collected/expired and private pickup; moderation and ownership checks | Hold behind core usefulness/resident validation; no new marketplace published |
| FB-01 | P1 · Resident research | Detailed accessible-group post-by-post review across four cities; body/comments/outcome/source/date coverage ledger; anonymized product implications | Active, incomplete. Nine initial group batches /30 mixed-completeness records; new priorities in research/resident-priorities-2026-11-06.md. Initial30-day target; private ledger outsideGit, remaining groups/posts tracked. No messages, joins, bulk copying or representative-prevalence claim; research/facebook-needs-review-2026-11-06.md |
| FRESH-01 | P1 · Living-directory upkeep | Twice-weekly primary-source refresh, stale-event/offer handling, useful additions/corrections, planning/refresh ledger and production acceptance | ACTIVE heartbeat automation moholocal-twice-weekly-freshness-refresh, Tuesday/Friday9AM America/Los_Angeles; first future run November10. Attached to current chat, no outreach; meaningful-change notifications only |
| UX-04 | P2 · Visual cards | Photo-led opening/service/event headers, contained secondary logos, text beneath images and accessible detail/contact actions; provenance and exact-location rules retained | Founder image references reviewed November6. Tracy city-backdrop photo headers implemented with explicit city-versus-business/event context and creator/license credits; 111 tests, OpenNext/native build and live320px acceptance pass. Genuine storefront/service/event asset rights and Domino’s exact-location evidence unestablished, no reference image published. Follow IMG-01 procurement |
| OPS-01 | P2 · Operations | Maintainable admin queues, correction ownership, monthly link checks and proposed 90-day fact rechecks; availability expires | FLOW-03 · Backlog |
| SEO-01 | P2 · Release | Preserve IDs/URLs or redirect; canonical HTTPS host and bare-domain behavior; sitemap/structured data; no private/pending indexing | Bare-domain www redirect confirmed in browser; broader sitemap/structured-data/private indexing and legacy routes remain open |
| PILOT-01 | P3 · Validation | 30–40 unique checked providers; four launch categories; useful coverage in both cities; 20 residents and 10 providers in pilot | P0/P1 gates · Backlog |
| METRIC-01 | P3 · Analytics | Measure search success, no results, contacts, replies, corrections, freshness and maintenance cost with minimal personal data | First optional outcome-report increment implemented; passive search/contact instrumentation and genuine participation open |
| GROW-01 | P3 · Distribution | Shareable useful pages; local search; owner/resident research; administrator partnerships subject to group rules and explicit outreach authorization | Pilot outcomes · Backlog |
| SEC-06 | P1 · Follow-up | Authenticate/rate-limit legacy anonymous reactions; review pg_trgm schema and compromised-password checking availability; no-policy private tables intentionally deny browser access | Complete: confirmed-account reactions with durable 60/hour quota; old definer execution revoked; pg_trgm moved; compromised-password protection enabled |
| OPS-02 | P1 · Delivery | Connect moho-web Worker to GitHub Builds or provision scoped CI credentials; legacy Pages main auto-build must not be used for the OpenNext branch | Complete: both existing Workers connected to moho-app/main; clean push-triggered builds passed; temporary Builds Configuration Edit removed, registry access denied with 403; watch paths isolate app/worker changes; legacy Pages auto-build disabled |
| SEC-10 | P0 · Rendering | Escape listing-derived JSON-LD script data so submitted text cannot terminate the script tag | Deployed: central safe serializer used by 33 JSON-LD pages; script-termination regression passes |
| SEC-09 | P1 · Contributions | Scope public replies/reviews to published parent records; confirmed account identity and persistent daily budget for direct posts/replies/reviews | Database deployed: parent publication boundaries and confirmed account identity enforced; shared durable 60/day contribution quota; role regression tests pass |
| SEC-08 | P1 · Legacy intake | Retire anonymous suggestion/report inserts and direct pet publication; route existing URLs to saved, confirmed-account intake; retain lost/found/reunited status through moderation | Database and redirects deployed: suggestion/correction/pet legacy writes closed; existing URLs route to moderated intake; pet status preserved |
| SEC-07 | P0 · Credentials | Remove legacy embedded service credentials, scan tracked files, rotate exposed legacy credentials and verify ingestion/web after rotation | Complete: five scripts sanitized; modern keys deployed; legacy apikeys disabled and previous HS256 verifier revoked; old-key REST/Auth/Storage requests all return 401; modern server and signed-in requester checks pass |
| PRIV-01 | P1 · Release policy | Replace verified 404 privacy/terms routes with accurate data-handling and participation information based on actual operations; validate footer destinations | Deployed: accurate Privacy and Terms, message/report boundaries, retention limits and operator contact. Live pages/footer verified; both native builds pass |
| PET-02 | P1 · Resident discussion | Report-linked discussion threads with confirmed-account replies, durable limits, reporting and moderation; published-parent boundaries | Implemented/deployed November 5; published-parent comments, confirmed account, owner soft-hide, reporting, moderation and durable quotas; 55 local regressions pass; live anonymous gates, owner inbox and moderation queue verified; both native builds pass |
| MSG-01 | P1 · Private contact | Report-linked DMs with participant-only access, explicit recipient, blocking, reporting and spam controls; no public phone/location requirement | Deployed participant-only inbox, blocking and reported-message moderation; no admin conversation access. MSG-03 adds opt-in push and capped native Cloudflare email pilot after operator inbox delivery. No production test DMs sent |
| MSG-02 | P1 · Notifications | Durable private unread counts, participant-only read cursors, global badges and optional no-content browser alerts; blocked threads silent | Durable unread badges/read cursors deployed. Foreground popup controls replaced by optional durable push under MSG-03; inbox remains usable without notification permission |
| MSG-03 | P1 · Away notifications | Opt-in confirmed-address email and per-device encrypted push; generic content, unsubscribe, blocked/read cancellation, bounded retries and durable leases | Deployed queue, preferences, encryption, unsubscribes, resident push opt-in and self-test receipts. 90 tests pass. Cloudflare native email avoids exhausted Resend quota; actual operator Gmail Inbox delivery verified. Limited pilot deployed and live email opt-in verified; hard 500-attempt/31-day budget including retries. Actual closed-tab Chrome received/displayed receipts passed after hosted safeupdate and redirect fixes |
| PET-04 | P1 · Automatic freshness | Public report expires 30 days after confirmation/creation, immediate database visibility rule, scheduled status audit, reporter renewal and preserved moderation holds | Deployed migration 20261106043716, expiry RLS, five-minute scheduled audit and reporter renewal. 67 regressions, native builds and signed-in management acceptance pass. All 60 report rows preserved; no fake public pet test |
| MSG-04 | P1 · Email operational gate | Restore provider sending availability, confirm an actual delivered operator test, add authenticated delivery/failure events and bounce/suppression handling; HTTP acceptance alone must not be labeled delivered | Deployed and verified: exact domain/account/subscription queue filtering, private lifecycle events, duplicate/early-event reconciliation, bounded retry/dead letters, bounce/complaint address pauses and cancellation, current-address protection. Real operator delivery event matched its acceptance ID. 90 regressions pass; no resident opt-ins/test DMs. Monitor dead letters and shared allowance; in-app operator paging and automated dead-letter replay remain separate follow-ups |
| MSG-05 | P1 · Real device acceptance | Owned-device self-test through scheduled encrypted delivery, capability-bound received/displayed/opened receipts, no fake pets or DMs | Actual Chrome test passed: encrypted push received and browser display confirmed at 9:45 PM with test inbox tab closed, browser running. No fake pet/DM. Phone-specific installation/permission/device-label guidance deployed; iPhone/iPad/Android logic and iPhone setup simulation pass. Physical phone/control tools unavailable; native phone delivery, OS banner/click and fully quit browser testing remain pending device access |
| PET-03 | P1 · Report lifecycle | Linked reporter can confirm lost/found/reunited or archive/restore; revision guard, private audit, moderation holds preserved | Deployed: archive returns to private management for restore; owner/revision/hold/archive tests pass, account-scoped management page verified; no imported-owner guessing or production test status changes |
| PET-01 | P1 · Community utility | Reuse existing city filters and lost/found/reunited states; add recent-confirmation/expiry, owner updates, moderated reporting, consented public contact and privacy-safe location; audit imported records before presenting them as current | Recent/history presentation, moderated intake, source caution, reporter status/archive/restore and automatic 30-day expiry/renewal deployed. Eleven unsourced reunion stories held. Wider editing, privacy-safe photos and imported-source evidence remain open |
| SEASON-01 | P1 · Engagement pilot | Thanksgiving/Christmas 2026 source-checked events, city/month browsing, organizer links, calendar downloads, expiry and participation requirements | Nineteen approved event occurrences (11 seasonal and8 community) published across four cities, including organizer-checked Mountain House Diwali Mela; November craft, stroll, Veterans Day and library games added with checked times and participation details; Manteca park/parade and Lathrop parade added with truthful source/venue limitations; city/month filters, Pacific-time display/expiry and .ics downloads implemented. Native/live acceptance complete; 96 tests and production calendar download verified. Event discussions and seasonal notification consent remain open; no unverified imagery or attendance |
| SEASON-02 | Later · Community celebrations | Halloween 2027, cultural celebrations, owner-consented display submissions and clearly labeled expiring offers; separate season/city notification opt-in and real account-only saves/RSVPs | SEASON-01 pilot outcomes; no private Facebook photos/addresses, inferred beliefs or invented attendance |
| AI-01 | P2 · Useful discovery | Natural-language service/city search grounded in published listing evidence; dated sources, explicit unknowns, normal search fallback and existing contact actions; evaluate supported matches and contact outcomes | Planned after notification delivery and expiry; no AI integration deployed, no vendor selected |
| AI-02 | Later · Editorial assistance | Suggest duplicate/stale-record checks and draft categories from permitted public sources; human evidence review before any publication; exclude private discussions/DMs | AI-01 evaluation and editorial capacity · Planned |
| REV-01 | Later · Business | Free basic pilot; validate paid value; disclose sponsorship and separate payment from verification | Demonstrated useful inquiries · Deferred |
| EXP-01 | Later · Categories | Validate auto repair, catering, childcare/preschools; expand geography only after maintenance economics work | Pilot outcomes · Deferred |
| ARCH-01 | Later · Architecture | Optional measured Astro prototype; no framework migration for current relaunch | Demonstrated benefit · Deferred |

Launch categories: handyman/small repairs (including painting), plumbing, house cleaning, landscaping/yard maintenance. Priority is qualitative, not a measured market-size ranking. Confirm approximately 4–5 useful choices per category serving each city; do not duplicate providers across cities.

Pilot decision gates (proposed internal experiment, not industry benchmarks): at least 15/20 residents find two plausible providers within two minutes; at least 8 contact one; at least 80% of contacted providers reply within two business days (report denominator). Every public trust claim needs dated evidence and every pilot listing needs a working contact. Contact clicks do not establish completed jobs.

Evidence baseline: read-only audit at 8bf92e2; 430 focus-city records pass existing public flags, only 17 business records have dated verification, 65 focus public records lack phone and website, and 123 have positive stars without positive review counts. These are candidate records, not independently checked businesses. Competitor/Facebook research supports task fit, service geography, contact clarity and documented freshness; it does not establish product-market fit. No outreach authorized by this backlog.

Execution order: P0 access controls → saved submission/claim/moderation flows → checked data and redesigned discovery → pilot → expansion/revenue. Product, security, engineering, editorial and validation responsibilities remain explicit in each work item.

---

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
| **`lib/cities.ts` — Canonical 8-city config created (single source of truth)** | ✅ Complete |
| **Hardcoded city arrays removed from homepage, discover, directory** | ✅ Complete |
| **South Bay cities visible in Browse by City, Choose Your City, Directory filters** | ✅ Complete |
| **City state sync fix — nav picker and banner now derive city from pathname** | ✅ Complete |
| **Zero-rating UI cleanup — `rating=0`/`null`/`review_count=0` hides rating UI globally** | ✅ Complete |
| **BIBLE.md — City System Architecture section added (locked rules)** | ✅ Complete |
| **PLAYBOOK.md — City Handling, UI Consistency, and Rating Display standards added** | ✅ Complete |
| Submit `/san-jose`, `/santa-clara`, `/sunnyvale` to Google Search Console | ⬜ Founder action required |

> **Platform note:** With shared city config, city state sync, and unified UI surfaces complete, the platform is now structurally ready for multi-city scaling. Adding any future city requires editing a single file: `lib/cities.ts`.

### Success Criteria

- [x] San Jose, Santa Clara, Sunnyvale city pages show restaurant/bar listings
- [x] 507 businesses seeded (324 / 100 / 83 per city)
- [x] Image enrichment complete — 65% overall match rate (≥60% threshold met)
- [x] 1,624 verified Google Places photos saved to Supabase Storage
- [x] Zero duplicate records (dedup guard confirmed idempotent)
- [x] Every enriched listing has at least 1 verified image (Google Places)
- [x] `lib/cities.ts` created — single source of truth for all 8 cities
- [x] Nav, Homepage, Discover, Directory unified — all derive from shared config
- [x] City state sync fixed — pathname always drives active city in nav
- [x] Zero-rating UI suppressed across all card surfaces
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
| `e0b97ce` | City state sync fix — getCityFromPath(), pathname-driven nav, handleCitySelect routing |
| `347ce8e` | lib/cities.ts + unified city config across homepage/discover/directory + zero-rating UI fix |

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

## SPRINT 4.5 — Data & UX Polish + Cron Hardening ✅ COMPLETE — March 2026

**Theme:** Stabilize before Sprint 5 (Growth Engine)
**Goal:** Fix all visual regressions, data gaps, empty UX states, and harden the ingestion worker

### Sprint 4.5 Tasks

| Task | Status | Notes |
|------|--------|-------|
| **Image fallback system** — replace city-colored gradient blocks with neutral gray placeholder | ✅ Complete | |
| **Community CTA upgrade** — replace "Coming Soon" with "Be the first to post in [City]" + amber button | ✅ Complete | |
| **Category matrix cleanup** — South Bay empty cells muted/non-clickable, "🍽️ dining" column label, mobile chips skip South Bay empties | ✅ Complete | |
| **South Bay data diagnostic** — SQL diagnostic script to find why Santa Clara/Sunnyvale show 2 listings | ✅ Complete | `sql/sprint45_southbay_diagnostic.sql` |
| **South Bay data fix** — run SQL fix on founder's machine to restore Santa Clara + Sunnyvale | ⬜ Founder action | Run diagnostic, then Fix A or B |
| **South Bay listing target** — Santa Clara ≥ 20 public listings, Sunnyvale ≥ 20 | ⬜ Pending founder DB action | |
| **Mobile QA pass** — validate city chips wrap, grids responsive, no overflow | ⬜ Founder action | Spot-check on iPhone |

### Cron System Hardening (completed March 2026)

| Task | Status | Commit |
|------|--------|--------|
| Fix wrangler.toml cron day-of-week numbers (CF uses 1=Sunday, not 1=Monday) | ✅ Complete | `6e5fa5e` |
| Fix `handleScheduled` — route by UTC hour instead of fragile cron string matching | ✅ Complete | `6e5fa5e` |
| Remove auto-approve violation in `events.ts` (Eventbrite/farmers-markets-static) | ✅ Complete | `6e5fa5e` |
| Add structured JSON logging — `MOHO_RUN` / `MOHO_WEEKLY` prefixes to `logger.ts` | ✅ Complete | `6e5fa5e` |
| Add per-adapter START/END/FAIL logging in `runAdapters()` | ✅ Complete | `6e5fa5e` |
| Add `/run/all` manual endpoint — runs all 3 jobs in sequence with per-job try/catch | ✅ Complete | `cf33d97` |
| **Permanently block `209times-rss` from lost-and-found pipeline** — violent content | ✅ Complete | `6a87079` |
| Deploy updated worker from Mac terminal (`npx wrangler deploy`) | ✅ Complete | Version `6faa6537` |
| Verify `/run/all` endpoint live and all 3 jobs execute | ✅ Complete | Manual curl verify |

### Cron Schedule (confirmed live)

| Job | Schedule | CF Cron | Status |
|-----|----------|---------|--------|
| Directory ingestion | Mon 03:00 UTC | `0 3 * * 2` | ✅ Live |
| Events ingestion (full) | Mon 04:00 UTC | `0 4 * * 2` | ✅ Live |
| Lost & Found ingestion | Mon 05:00 UTC | `0 5 * * 2` | ✅ Live |
| Events ingestion (mid-week) | Thu 04:00 UTC | `0 4 * * 5` | ✅ Live |

### Remaining Founder Actions (Sprint 4.5)

```sql
-- Run South Bay diagnostic to restore Santa Clara / Sunnyvale listing counts:
-- https://supabase.com/dashboard/project/ozjlfgipfzykzrjakwzb/editor
-- File: sql/sprint45_southbay_diagnostic.sql

-- After fix: verify /santa-clara and /sunnyvale show 20+ listings
```

- Enable Workers Logs in Cloudflare dashboard → Workers & Pages → moho-ingestion → Settings → Observability → Enable
- Revoke GitHub PAT in `push-cron-audit.sh` at github.com/settings/tokens
- Mobile QA pass: spot-check on iPhone at /discover and /[city]

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

November 5 UX follow-up: mobile navigation now has visible 48px touch targets, Escape/focus handling and a skip link; city/category evidence and discovery count errors are corrected. TypeScript, clean native build and live interactions pass; the revised navigation and full-width mobile evidence/contact cards are deployed. Design acceptance criteria: `docs/ux/design-standard.md`. No competitor-superiority or resident-validation claim is made.

November 5, 9:45 PM validation complete: actual Chrome push test received at 2026-11-06T05:45:15.885771Z and browser display confirmed at 05:45:15.902575Z, with the test inbox tab closed and Chrome running. Native OS banner/click and phone/fully quit browser behavior were not observed. Two production-only issues fixed: explicit singleton WHERE for hosted safeupdate (migration 20261106053915) and Workers-supported manual redirects. Operator email reached Gmail Inbox at 9:32 PM through included native Cloudflare Email Service; limited opt-in pilot is live with a 500-attempt/31-day cap including retries. No plan upgrade, fake production pet/DM, resident email or provider outreach. 75 regressions and native builds pass; zero security WARN/ERROR, 13 intentional private RLS INFO findings. Two further source-checked providers bring checks to 28 (19 unique launch-category providers); city coverage MH 6/4/3/3 and Tracy 5/4/4/5. Full evidence: docs/push-device-validation-2026-11-05.md.

November 6 release complete: automatic domain-scoped email lifecycle events are deployed. Real operator probe 8785fc2b-8150-435d-aebf-bf081c601230 reached mail-server delivery at 08:10:15.837Z; the native queue consumed its matching event at 08:10:21.404970Z. Duplicate/early/wrong-recipient events, suppression, old-address handling and queue retry paths pass local tests. 90 regressions; both TypeScript projects and native builds pass. Hosted advisors zero WARN/ERROR, 15 intentional private RLS INFO findings. Actual physical phone access is unavailable (no mobile control surface/tools or iPhone Mirroring); setup scenarios and a clearly labeled iPhone browser simulation were tested, not phone delivery. Four-city desktop/mobile navigation and directory filter choices deployed; 320px picker overflow fixed and production viewport/client/content widths all equal 320. Three source-checked providers bring checks to 31 and unique launch-category providers to 20. Seasonal Thanksgiving/Christmas pilot planned next; Halloween 2027 follows. Official December 5 event candidates found in both cities, with Mountain House time conflict held for confirmation. Evidence: docs/email-events-release-2026-11-06.md and docs/research/seasonal-pilot-2026-11-06.md.


November 6 visual direction — exact-area photography (UX-03): user requires every city photograph to depict that actual area. Verify location, creator, reuse permission/license, source URL and caption before publication; keep a per-asset provenance record. Prioritize Mountain House civic/park scenes and downtown Tracy, then Lathrop and Manteca. Event imagery must show that event or be explicitly labeled artwork. Generated edits require a genuine location reference and must preserve recognizable geography and structures. Generic regional artwork is not an acceptable replacement for city photography. The first generated regional concept was rejected for geographic specificity and is retained only under docs/ux/concepts; it is not referenced by the app or deployed. Homepage photo redesign remains in progress; existing production UI is unchanged by this concept pass.


November 6 UX-03 / SEASON-01 implementation: homepage redesign now uses actual Mountain House USDA NAIP aerial imagery (May 2024) and a credited CC BY-SA downtown Tracy archival photograph, locally optimized with responsive sizes, honest captions and /photo-credits. The generic generated concept remains unused. Added two officially sourced December 5, 2026 events: Mountain House MoHoHo Holidays (5 PM parade; city pages now agree) and Tracy Holiday Light Parade (6–8:30 PM). Data publication verified; no event photo or attendance invented. Pacific timezone and local-day expiry regressions pass. Event browsing now requests approved rows and four launch-city filters. Native build and browser/deployment acceptance are in progress. Remaining seasonal scope: Thanksgiving sources, calendar saves, event discussions, explicit notification opt-in, more photos and resident validation.


PAUSED at user request, November 6, 2026, 12:39 AM Pacific. New requirement: homepage photos must be confirmed captured in 2026, in the exact city, with reuse rights. The May 2024 Mountain House aerial and archival Tracy photo are rejected for this release. Commit 7c530b8 contains the staged redesign; its native build 76273851-78a6-4c2e-b852-9b9e097efcf7 was cancelled before deployment. Do not redeploy that commit or carry its older photos into a later release; replace/remove them first. Two approved December 5 seasonal event rows were already published and verified through anonymous access. Local regression suite 93 passed and OpenNext build passed; production homepage acceptance remains incomplete. Resume by obtaining 2026 capture-date and rights evidence for both cities, then complete responsive/live QA. No additional work or scheduled wakeup requested.


November 6 morning release accepted: source 1fef2a8a17c702b3692a145f57ca0c24eb703ad7 passed native Cloudflare build e0ac6380-e133-4e24-9544-639043e7d087; live web version 0abbc795-3a6c-41f8-949e-2d2b9a77aab8 (deployed 2026-11-06T16:16:50Z). Production homepage shows only November 4, 2026 satellite city views and all three seasonal events. Both city photos have exact capture/geographic/license evidence; street-level 2026 photography remains open. Desktop1280 and phone320/390 checks pass; four 44px city buttons, three live event cards, November filtering and Friendsgiving time/cost/registration verified. All four live WebP assets match repository hashes; rejected older image URLs return404. Production Tracy calendar HTTP200 preserves exact UTC times; actual browser Friendsgiving .ics download contains correct noon–2 PM Pacific instants. Invalid calendar IDs return404. 96 tests, root TypeScript and OpenNext build pass. Temporary viewport overrides cleared, local preview stopped, live homepage left open. Evidence: docs/homepage-seasonal-release-2026-11-06.md, docs/ux/homepage-2026-live.png, docs/ux/homepage-2026-tracy-mobile.png and docs/ux/seasonal-event-2026-live.png. Event discussions, separate seasonal-notification consent, resident testing and street-level photo procurement remain open.


November 6 midday increment — DATA-04 / SEASON-01 / UX-04: founder identified pigeon roof cleanup, solar bird exclusion and Christmas-light installation/removal as useful local needs. Added exact solar-bird-exclusion and holiday-light-installation shortcuts (cleaning alone never qualifies as exclusion). Three individually website-checked providers published with scoped listing_checks and private correction history: Clear Gutter and Eagle Home Solutions list all four launch cities; K & T Lights lists Mountain House, Tracy and Manteca only. Lathrop seasonal-light installer coverage remains a gap. Total checked listings42; original four launch-category provider count remains27; these three specialties are additional. Four more November events published, one per city: MH Grinchmas craft, Tracy Ornament Stroll, Lathrop Veterans Day, Manteca Dinovember. Seasonal inventory9; no invented end time, ticket availability or credentials. MH Veterans luncheon held for conflicting official times. Evidence: research/roof-holiday-providers-2026-11-06.json and november-events-2026-11-06.json, with exact executed SQL alongside.

Photo-led card increment: Tracy place/event cards can use the already-cleared July8,2026 Ninth Street photo, explicitly labeled city backdrop rather than business/event/venue image, with license/creator/crop credits. Other cities fail closed rather than borrowing Tracy or satellite as a storefront. Genuine store/service/event photos and real2026MountainHouse street photo remain open; no new asset rights or outreach. Additional targeted Commons/Flickr queries surfaced City renderings, existing local-media imagery and MLS listings, none establishing both real2026 capture and reuse rights. Tests/build/native/live acceptance pending for this increment.


CULT-01 — culturally relevant local discovery (founder steering, November6): research first-party Indian groceries/restaurants, language/cultural classes and public Diwali/Holi/Navratri/regional celebrations, starting Mountain House/Tracy and extending verified service/event coverage to Lathrop/Manteca. Use specific published offerings/languages and organizer-defined audiences. Do not infer residents’ ethnicity, religion, preferred language or festival participation; do not invent demographic percentages or make a single tradition stand for the whole community. Preserve inclusive discovery and user-selected city/category preferences; no sensitive profiling or outreach. Current-season events require actual2026 date/venue/eligibility, not an annual-pattern guess. Additional category evidence and rights-cleared imagery remain open.


Midday research follow-up: CULT-01 initial primary review completed; Mountain House Diwali Mela organizer header confirms November7,2026,10AM–5PMPST; published with older body-year typo disclosed and corroborated current bulletin. Ten seasonal events now span MH4/Tracy2/Lathrop2/Manteca2. V5 Diwali Mahotsav venue/admission remains held (ticket form closed). No messages or images reused. See photo-specialty-release-2026-11-06.md and research/cultural-discovery-2026-11-06.md.


Midday acceptance complete: source a9b519373460130e697c3fe657b1e5336ae26337, native build3d4f05eb-eccc-484b-8f9c-cce9628010d0 success.111 regressions and final TypeScript/OpenNext pass. Production320px Tracy cards show loaded licensed photos, honest context, credit links, no nested links or overflow. Live holiday-light shortlist returns K&T Lights; homepage shows six task shortcuts, Sprouts city-backdrop card and upcoming Diwali Mela. Live Diwali/Lathrop calendar200 preserves exact UTC times and absent unknown end. All data readbacks pass; totals42 checked listings/ten seasonal events. CULT-01 scope and unresolved image/venue/provider gaps recorded. No messages, purchases or new access.


November6 CULT-01 / DATA-04 supply increment: ten individually website-checked records added or repaired (three existing restaurants repaired; seven additions). Cuisine/program supply: Aappakadai MH, Dhaba Tracy, Rasoi Lathrop, NewIndianSupermarket Tracy, RaunakBazar Manteca, AapliMarathiShala MH/Manteca. Specialists: GrimeGetterz, MAANPermLights, BrightProdigy and AllPro. Total52 dated listing checks; original four service-category provider count remains27. Three solar-exclusion choices per city; holiday-light choices MH3/Tracy4/Lathrop3/Manteca4. AllPro additionally advertises pigeon roof-waste cleanup, with solar-array work explicitly separate. Blank phone for form-first BrightProdigy/MarathiShala is intentional; no invented contacts. Primary evidence, exact executed SQL and holds in research/cultural-specialty-supply-2026-11-06.json, allpro-services-2026-11-06.json and cultural-specialty-holds-2026-11-06.md. Readbacks and live eight city/service routes pass.

Three community events published: LathropKiDiwali Nov14,6PM (endtimeconflict explicit; performer-registration scope retained), MantecaKarthika observance Nov9,8AM (unknownend/programduration/cost explicit), MHShala studenthackathon Nov21,9AM–3PM (ages13+,parentpermission,registrationfooterconflict explicit). Thirteen approved events total:11seasonal+2community education/cultural. Primary-source readbacks and all3 .ics exports200 preserve correct UTC starts/knownend; unknownends omitted. TracyREACH Diwali alreadyOct31; do not present as upcoming. V5venue/admission hold persists.

Founder screenshot steering: refresh Explore dropdown and Discover destination with selected-city continuity, cultural/food/service shortcuts, dynamic recent website checks and current approved events, plus city-specific local openings. Mobile gains Explore shortcut. UX-05 tracks this refresh; implementation and113regressions pass, TypeScript/OpenNext/native/live acceptance pending. Keep genuine city/store/event media rights open. Latest MountainHouse photo lead resolved to SantaClarita2014 at its originalCommons source and rejected. No outreach, photos reused, memberships or payments.

November6 Explore release accepted: source925f141, native52235ad5-f8a9-4236-9dd2-727f47af39c1 success.113regressions, TypeScript/OpenNext pass; live four-city content, city-preserving Lathrop search, desktop menu and390px phone Explore48px/no-overflow pass.52 dated listing checks/13 approved events (11seasonal,2community); photo rights/2026MHstreet replacement remain open. Evidence: explore-cultural-release-2026-11-06.md and ux/explore-cultural-live.png.

November6 cultural/market data release: three dance programs plus three dated Tracy markets published;55dated checks/16approved event occurrences confirmed. Live Explore and detail UI verified; all three calendar HTTP200 with correct16:00–21:00UTC. Broader cultural class discovery and event-detail city-context navigation remain next UX follow-ups. Source925f141 application unchanged; no build required for content-only publication. Exact executed SQL and primary sources: research/publish-dance-market-2026-11-06.sql and dance-market-2026-11-06.json.

November6 cultural-class guide accepted: application10964bc/native16815f0e-7f62-4666-9534-b6d6c526c3df successful (initial guide13bb657/native2aefacb6-72a5-4267-a226-4432e1f993d5).114regressions, TypeScript/OpenNext pass. /classes has city-preserving topic filters, dated public information checks, contact/source actions, honest empty states and Explore navigation. Live checked programs MH3/Tracy4/Lathrop2/Manteca3. Added TablaNiketan MH/Tracy, plus3official library occurrences: MHbabyNov12, Tracy preschoolNov12, MantecaCascadaNov13. Totals56dated checks/19approved occurrences;11seasonal+8community. All3newcalendar200times pass. FB-01 deep per-post review active; no exhaustive-review claim. Photo task remains open.

FB-01 checkpoint: initial batches in7accessible groups, including all3joinedMHgroups; full cleaning18comment, secured-dog15comment and regionalfood4comment threads read. Remaining posts/groups/date normalization/partial replies remain open. Clinic flyer-versus-caption eligibility conflict and stale/out-of-area sports/event posts held. No exhaustive/representative claim.
