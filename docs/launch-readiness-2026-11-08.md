# Resident launch readiness — November 8, 2026

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


Decision: prioritize a dependable four-city directory before public promotion. This is an evidence ledger, not blanket launch approval. No Facebook posts or outreach sent.

| Journey / safeguard | Evidence and remaining gate |
| --- | --- |
| Find help in each city | Live Mountain House, Tracy, Lathrop and Manteca landing pages render their own heading/title/canonical; earlier four-city service filter acceptance recorded in BACKLOG. Attempted viewport override did not yield a phone-sized document and was reset; narrow mobile acceptance remains OPEN before broad promotion. |
| Contact a provider | Live Ayres detail shows dated website-check evidence, explicit three-city coverage and separate Ripon office location, tel and official website actions. No calls or inquiries sent. Existing iThink SMS correction is documented separately. A link click is not a successful connection. |
| Suggest a business | Live form reaches account-aware submission UI with moderation explanation; found extra legacy cities and narrowed UI to our four launch cities in this release. Do not submit a fictitious production business for testing. Prior request/security regression evidence remains in the backlog; genuine submission acceptance is not established by viewing the form. |
| Claim a business | Live claim link reaches the correct business form with confirmed-account email, ownership review explanation and tracking instructions. No fake ownership claim submitted. |
| Current events | Approved event records are not the same as upcoming events. Sitemap has41 approved records including historical ones. Live city event screens show37 current/upcoming records (Mountain House15, Tracy9, Lathrop5, Manteca8) on November8; the remaining4are archived. This checks display, not a fresh organizer confirmation. Recheck organizer links and city empty-state recovery; do not promote unconfirmed holiday hours or attendance. |
| Pets and notifications | Live Mountain House board shows0eligible reports, a posting action, city/status recovery and a30-day expiry explanation. No reports created. Existing features remain live; genuine-reporter matching/contact pilot and phone push acceptance stay OPEN. Do not advertise them as proven reunions or guaranteed delivery. |
| Security / moderation | Prior P0 credential retirement and request moderation tests documented in BACKLOG. This pass makes no claim of a fresh full security audit. RLS/auth not weakened. |
| Search discovery | Fixed static sitemap collision, retired-route scope and silent catalog omissions. Local XML1100 URLs:52static,1007business pages,41events,0eligiblepet pages; pages in sitemap are not all independently source-checked. Search Console ownership, sitemap success and all four city-index inspections accepted; baseline reports remain processing. |
| Honest inventory |89dated listing checks now, distinct from the legacy catalog. Keep legacy listing status/evidence distinct from owner confirmation, credentials, availability and quality. Pet-care category depth remains next data priority. |
| Photos | Mountain House2026street-image rights/location and Manteca exact-location acceptance stay OPEN. Current clearly labeled placeholders/satellite are an enhancement gap, not justification to use unlicensed or wrong-city photos. |

## Execution order

1. Sitemap/submission-city release COMPLETE:344b9fb / Cloudflare0d2c120c Ready1m47s; live sitemap1100 distinct URLs and exactly four submission city choices verified.147tests and final OpenNext/TypeScript pass.
2. Run bounded end-to-end acceptance with genuine residents/owners and mobile devices; fix confirmed failures first. Never fabricate submissions, outcomes or pet reports.
3. Expand thin pet sitting/dog walking coverage and keep event dates/source checks fresh.
4. Audit no-result recovery, contact actions, mobile navigation and indexing/utility-route metadata. Record pass/fail evidence rather than declaring the whole site ready from a build.
5. Only distribute the prepared founder-disclosed Facebook drafts after explicit posting authorization and exact group-rule checks. Current instruction remains draft-only.


## Follow-up — November 8, 6:54 PM request

Published two duplicate-checked pet sitting/dog walking providers with first-party named service-city evidence.80dated checks total. Pet-sitting choices: Mountain House3, Tracy3, Lathrop2, Manteca2. Acti-Kare is excluded from Manteca; Growls N Meows is excluded from Lathrop. No office/home address invented, no photo reused, no availability/quality/background-check endorsement. Evidence: research/pet-care-expansion-2026-11-08.json and matching publication transaction.

Phone-width browser acceptance now observed using tab-scoped device emulation:390px document/client width and390px scroll width on all four pet-sitting result pages. Lathrop2/Manteca2/Mountain House3/Tracy3 results match coverage. Manteca no-result search shows removal/other-city guidance; removing only the search term restores two results while retaining city/service. Growls detail opens with Manteca/service context, dated coverage and correct tel/website actions. No call or message sent. This is browser emulation, not a physical-phone push or native SMS-app test.

Search Console: canonical URL-prefix property setup in current Google account requires HTML ownership verification. Google-supplied HTML file prepared and deployed through existing native build; verification and sitemap submission pending acceptance. No new DNS/OAuth access or Google Analytics tracking added. Facebook drafts stay unpublished. Photo tasks and genuine-reporter pet pilot remain OPEN.


A further phone intake check found selected-city loss through /post-lost-found. Fix prepared: board supplies its selected city, alias accepts only one of four named cities and passes it to the existing form; All Cities/unknown values do not invent a city. City buttons now expose aria-pressed.147tests and final OpenNext/TypeScript pass; native deployment/live acceptance pending. No genuine reporter transaction performed. Google canonical property ownership verified with the Google-provided HTML file (source31d32cc / native96371fa0 Ready2m14s); keep the file in place. Sitemap submission/indexing status remains pending.


## November 8 — launch follow-up accepted

SEO-03: canonical URL-prefix ownership verified using Google-provided public HTML file; retain it. Recovered property history had an old March13 sitemap read/107discovered pages. November8 resubmission now shows last read November8, Success and1,102discovered pages. All four city landing-page URL inspections report indexed. Mountain House live Google smartphone fetch succeeds with crawl/indexing allowed and expected canonical. Performance/index-coverage baselines are still processing; discovered pages are not all indexed pages. [Search Console evidence](marketing/search-console-2026-11-08.md). No new analytics tracking, DNS/OAuth grants or public posts.

LAUNCH-01: pet-board city handoff defect fixed and live-accepted at390px: Manteca board → /submit?submission_type=lost_pet&city=Manteca; Manteca aria-pressed=true, Mountain House=false, no horizontal overflow. Alias accepts only a single supported city; local HTTP checks exclude unknown/repeated cities. Source4620549/native68a769c3 Ready2m29s;147tests and final OpenNext/TypeScript pass. Device emulation reset after checks. No actual report/claim/submission or contact sent. Four-city phone-emulated pet-sitting results and no-result recovery passed earlier in this increment. Physical-device push/native contact-app behavior and genuine-user submission acceptance stay OPEN.

DATA-13 increment accepted:80dated checks; pet sitting/dog walking choices Mountain House3/Tracy3/Lathrop2/Manteca2, with explicit first-party city evidence and no blanket credentials/quality/availability endorsement. Next supply work: deepen Lathrop/Manteca pet-care choices and Mountain House carpet-cleaning options, preserving duplicates/service-area gates. Current FB drafts remain unpublished. Photo acceptance tasks and genuine-reporter pet pilot remain OPEN. No monetization activated.

## November 8 — carpet-cleaning coverage and utility-page launch polish

DATA-14 increment: published Reynolds Carpet Cleaning Service & Janitorial and Magic Wand Professional Cleaning Services, both with explicit first-party coverage for Mountain House/Tracy/Lathrop/Manteca, public phone checks and domain/name/phone deduplication.82dated checks total. Carpet-cleaning choices now3/4/4/4 respectively. No visitor-office address, photos, fixed offers, credential/quality or availability endorsement copied. Supreme identity/contact validation incomplete; Sampa footer/location conflict held. [Evidence](research/carpet-expansion-2026-11-08.json) and matching publication transaction. Live four-city UI acceptance pending.

SEO-02/LAUNCH-01: added noindex/nofollow metadata to ten utility route groups (login, register, profile, requests, admin, claim, report, business submission, community submission, auth callback), matching existing private message/pet report behavior. Local rendered output confirms all ten carry the rule while city/business detail pages remain indexable. No auth/RLS or crawler-account security settings changed; robots directives are not access control and blocked crawlers may not read metadata. Claim CTA now accurately describes ownership review/tracking and removes an unsupported two-minute/self-service promise.147tests and final OpenNext/TypeScript pass; native/live verification pending.

SEO-03 follow-up: performance/indexing/experience/enhancement overview still says Processing data; no fresh baseline or growth claim. Prior successful1,102-URL sitemap read and four indexed city landing pages remain the last accepted evidence; no redundant resubmission. FB drafts unpublished, photo tasks and genuine-reporter pet pilot OPEN.

## November 8 — carpet and utility-route release accepted

DATA-14:82dated checks. Reynolds Carpet Cleaning Service & Janitorial and Magic Wand Professional Cleaning Services are live with individually named coverage for all four cities. Phone-width390px search acceptance matches carpet-cleaning counts Mountain House3/Tracy4/Lathrop4/Manteca4, without horizontal overflow. No contact sent, photos reused, office address invented or quality/credentials/availability endorsement. [Evidence](research/carpet-expansion-2026-11-08.json); screenshot research/nov8-phone-carpet-options-live.png.

SEO-02/LAUNCH-01: source2ea7949 deployed Ready3m6s, native versionea0f0652.147tests and final OpenNext/TypeScript pass. Ten utility route groups have rendered noindex/nofollow locally. Live checks confirm login/register/requests/claim/business submission/community submission; public Manteca and business-detail negative controls have no noindex. Claim CTA now describes ownership review/tracking, with no instant-editing/two-minute claim. Live390px detail fits; screenshot research/nov8-phone-claim-review-live.png. Device emulation reset. No account/RLS/robots-account security changes; indexing metadata is not access control or guaranteed removal.

SEO-03: follow-up overview performance/indexing/experience/enhancement data still processing; no new baseline or growth claim and no redundant sitemap resubmission. Prior Google Success/1,102discovered and four indexed city pages remain accepted; that historical count does not imply all newly added catalog pages indexed. Next: thin Lathrop/Manteca pet-care/mobile-grooming depth, useful city/social previews and genuine resident/owner acceptance. Physical-phone push/native contact-app acceptance, photo tasks and genuine-reporter pet pilot remain OPEN. FB drafts remain unpublished; no outreach, spend or monetization activation.

## November 8 — mobile-grooming depth, brand correction and city sharing

DATA-15: published California Pet Grooming Mobile with all four explicit service cities and Ana's Mobile Dog Grooming with Lathrop/Manteca only. Ana's FAQ excludes new clients in Mountain House/Tracy and lists parking/apartment/weight restrictions; no inferred coverage. Corrected existing Bayberry record to iLuvMyPack Mobile Grooming (formerly Bayberry Grooming), based on official former-brand statement, retaining its ID and not counting a duplicate operator.84dated checks; mobile-grooming choices now Mountain House3/Tracy4/Lathrop4/Manteca4. No public home/visitor address, photos, fixed prices or quality/credentials/availability endorsement. [Evidence](research/grooming-followup-2026-11-08.json) and matching SQL. Live city/eligibility acceptance pending.

SEO-02/LAUNCH-01: city routes now emit city-specific Open Graph and Twitter summary metadata using the existing MoHoLocal brand icon, explicitly labeled logo; no city photography generated/reused. Root description names all four cities. Local HTTP rendered checks pass for all four canonical/title/description/image/card combinations.147tests and final OpenNext/TypeScript pass. Native/live verification pending; actual Facebook/X cache rendering not tested and nothing posted.

SEO-03: current overview performance/indexing/experience/enhancement reports still processing; no redundant submission or growth/baseline claim. Keep successful prior sitemap/city-index evidence separate from later inventory additions. FB drafts unpublished. Photo tasks and genuine-reporter pet pilot OPEN; physical phone/push and genuine resident/owner acceptance remain OPEN.

Narrow-phone follow-up: all four city landing pages render their correct city heading at320px client width with320px document scroll width. This is an overflow check, not a complete accessibility or real-device acceptance. A11Y-01 follow-up: SiteLayout supplies a main landmark while city/directory content also uses main; audit shared/page landmark ownership before making accessibility conformance claims. No account, report, booking or message created.

## November 8 — grooming and city-sharing release accepted

DATA-15:84dated checks after two new providers and one existing-brand correction. California Pet Grooming Mobile names all four cities. Ana's Mobile Dog Grooming appears only in Lathrop/Manteca, with new-client exclusions and parking/apartment/weight restrictions retained. Bayberry ID50b70a38-4a16-44e4-8ba3-feaa10231ff1 now identifies iLuvMyPack/former Bayberry from official source evidence; former-brand search returns one result rather than duplicate operators. Live390px results: Mountain House3/Tracy4/Lathrop4/Manteca4, correct Ana inclusion/exclusion, no document overflow. No appointment, owner confirmation, quality/credential or photo-rights claim. [Evidence](research/grooming-followup-2026-11-08.json); screenshot research/nov8-mobile-grooming-live.png.

SEO-02/LAUNCH-01: sourcec6b6c94 deployed Ready2m12s, native2221be8a.147tests and final OpenNext/TypeScript pass. All four live city routes have matching city-specific canonical/og:url/title, own-logo og:image/alt and Twitter summary card. These are emitted metadata, not acceptance of Facebook/X cached previews; no platform rescrape or post performed. Root description names all four cities. All four city landing pages also fit320px without document overflow. Device emulation reset.

SEO-03: current baseline reports remain processing; no redundant sitemap/indexing requests or growth claim. A11Y-01 P2 queued: audit shared/page main-landmark ownership (SiteLayout wrapper plus page main elements) before accessibility conformance claims. Next supply work remains thin pet-sitting/dog-walking depth in Lathrop/Manteca, with genuine resident/owner acceptance and physical-phone delivery checks still OPEN. FB drafts unpublished; photo acceptance tasks and genuine-reporter pet pilot OPEN. No outreach/spend/monetization activated.

## November 8 — garage-door repair and scoped landmark fix

DATA-16: published Barton Overhead Door and R&S Erection of Tri-County with explicit first-party Mountain House/Tracy/Lathrop/Manteca coverage and Modesto office city.86dated checks; garage-door repair has two dated choices per city. Website/phone/name duplicate check passed. No local branch inferred, resident/home address or image reused, credential/quality/availability or emergency-response guarantee. Pet-sitting leads remain held without sufficient current first-party coverage. [Evidence](research/garage-door-coverage-2026-11-08.json) and matching SQL.

LAUNCH-01: added a distinct Garage door repair shortcut/tag through the shared service configuration for directory/city/Discover. Generic handyman listings are not classified as door repair. Local rendered shortcut checks pass for all four city pages and directory. A11Y-01 scope corrected: city/directory pages already use div; actual duplicate main was My business requests only. Changed that page wrapper to div, preserving shared main-content focus target. Local rendered requests/directory/four-city pages each have exactly one main and the focusable skip target.147tests and final OpenNext/TypeScript pass; native/live acceptance pending. No broad accessibility conformance claim.

SEO-03 follow-up after7:42PMrequest: overview performance/indexing/experience/enhancement reports still processing; no redundant sitemap submission/indexing request or growth claim. FB drafts unpublished. Photo tasks, genuine-reporter pet pilot, physical-phone delivery and genuine resident/owner acceptance remain OPEN.

## November 8 — garage-door and landmark release accepted

DATA-16/LAUNCH-01: source8396829 deployed Ready2m21s, native3cbd34ed.86dated website checks total. Dedicated Garage door repair shortlist shows Barton Overhead Door and R&S Erection of Tri-County for each of Mountain House/Tracy/Lathrop/Manteca. Live390px city-link switching retains category/service, shows2of2choices in each city, selected shortcut remains active and no document overflow. Both office cities remain Modesto; no local walk-in office inferred. Detail and related-provider link preserve Manteca/garage-door context. No calls, bookings, messages or synthetic reports/outcomes created. [Evidence](research/garage-door-coverage-2026-11-08.json); screenshot research/nov8-garage-door-live.png.

A11Y-01 scoped acceptance: prior note naming city/directory nesting was too broad. Those pages already use div wrappers; My business requests was the confirmed duplicate-main case. Live request page changed from2main landmarks to1, shared focusable main-content retained, keyboard Tab reaches Skip to content and Enter focuses main-content. Local requests/directory/four-city pages each have one main.147tests and final OpenNext/TypeScript pass. This closes the scoped landmark fix, not a full accessibility audit or physical-device acceptance. Device emulation reset.

SEO-03 current baseline reports still processing; no redundant sitemap/indexing requests or growth claim. Pet-sitting/dog-walking depth remains OPEN where new leads lack current first-party coverage. FB drafts unpublished; photo acceptance tasks, genuine-reporter pet pilot, genuine resident/owner participation and physical-phone push/native contact-app acceptance remain OPEN. Next: expand supply with evidence and continue bounded resident task/mobile checks.

## November 8 — electrical coverage and provider-page city consistency

DATA-17: published Luminate Electric (Lathrop based) and Lainez Electric (Manteca based), each with explicit first-party service-area evidence for all four cities and public phone/name/domain duplicate checks.88dated checks; Electrical services has2choices in each city. No office/home street address, photographs, license/insurance/quality confirmation, price, appointment or emergency-response endorsement copied. [Evidence](research/electrical-coverage-2026-11-08.json) and matching SQL. Website information checks remain separate from required credential/availability checks.

LAUNCH-01/UX-04: shared Electrical services shortcut uses a distinct service tag, not generic handyman classification. Provider detail styling now follows validated browsing-city context while office text/emoji uses the business's actual city or neutral pin. Fixes unsupported office-city fallback to Mountain House styling. Local rendered checks on a Modesto provider confirm each four-city gradient with office label still Modesto.147tests and final OpenNext/TypeScript pass; native/live acceptance pending.

SEO-03 follow-up after7:53PMrequest: overview baseline reports still processing; no new traffic/indexing baseline or redundant submission. FB drafts unpublished. Photo acceptance tasks, genuine-reporter pet pilot, physical-phone delivery/native contact-app behavior and genuine resident/owner acceptance remain OPEN.

## November 8 — typed-service search launch fix

SEARCH-01 P1: reproduced live Manteca Electrical services + electrician returning0despite2checked choices. Exact role/canonical terms now also match dated service tags via public checked IDs; existing city/category/explicit-service/publication constraints remain. No inference for ambiguous cleaning/solar/pet-care terms or company-name fragments; ordinary text results retain per-row evidence status. Anonymous public API composed-filter checks return2for all four electrical shortlists and0for conflicting Pet Services/plumbing cases. New regressions cover normalization, exactness and filter-like input. [Evidence](research/service-search-acceptance-2026-11-08.md). Final build/native/live acceptance pending.

Electrical/theme increment is already deployed:78a040f / nativee3c270a1 Ready1m59s. Live390px shortlists show2eachcity and active Electrical services shortcut; browsing Manteca now uses Manteca gradient while Modesto office label stays intact.88dated website checks remain. FB drafts unpublished, photo tasks and genuine-reporter pet pilot OPEN; physical-phone and genuine resident/owner acceptance OPEN. Search Console baseline still processing.

## November 8 — electrical, city-context and typed-search acceptance

DATA-17:88dated website checks. Luminate Electric and Lainez Electric have explicit four-city electrical-service evidence; dated Electrical services shortlists show2in each city at390px with no document overflow. Source evidence/limits remain separate from license, insurance, quality and appointment confirmation. No calls, forms, bookings, messages or synthetic resident/pet outcomes created. [Provider evidence](research/electrical-coverage-2026-11-08.json).

UX-04 accepted:78a040f/nativee3c270a1 Ready1m59s, inherited by current source6b28858/native9c8af722 Ready2m16s. Provider theme follows validated resident browsing city; actual office city/neutral pin retained. Live Barton in Manteca changed from Mountain House blue to Manteca orange while office text stayed Modesto. New Luminate detail uses Manteca styling while labeled Lathrop. Local four-city gradient controls passed.

SEARCH-01 accepted: reproduced electrician on Manteca electrical shortlist0→2 after exact service-term lookup. All four electrical shortlists return2with typed electrician. Conflicting Manteca Pet Services or plumbing filters return0. Real city-page search form with electrician retains Manteca and returns3ordinary-search results including both checked providers; general search still permits ordinary text matches and does not claim every result checked.150tests and final OpenNext/TypeScript pass. [Acceptance](research/service-search-acceptance-2026-11-08.md), before/after screenshots research/nov8-electrician-search-before.png and research/nov8-electrician-search-live.png. Provider proof research/nov8-electrical-provider-live.png. Device emulation reset.

SEO-03 baseline remains processing; no redundant sitemap/indexing requests, new indexing count or growth claim. FB drafts unpublished, photo tasks and genuine-reporter pet pilot OPEN. Physical-phone delivery/native contact-app behavior and genuine resident/owner participation OPEN. Next UX acceptance includes typed-search→detail→return continuity; expand thin categories only with explicit source coverage.
