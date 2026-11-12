# ACT-01 — Activity freshness, November 12, 2026

User screenshot /activity showed creation-aged businesses, Brentwood and no recent listing checks. Source inspection confirmed businesses ordered only by created_at; listing_checks absent. This is a visibility gap, not evidence that earlier directory/data releases failed. No cache-refresh claim made without evidence.

## Change

Dynamic server page fetches RLS-public listing_checks with inner business join and approved/verified gates. Recorded coverage selects applicable city checks and outside offices; regular new listings use the same regional boundary helper as Directory. Each stream fetches up to40; merge uses actual timestamps, discards invalid dates, deduplicates and retains one latest website-check card instead of its older listing-added card. Output capped40, not complete revision history. Website-check date rendered in America/Los_Angeles. Editorial check labels do not imply business opening, owner confirmation, credentials, quality or a resident post.

Community matches existing flagged/removed exclusion; all public community/events/pet streams restricted to four cities. Events require approved/current via existing Pacific event-date helper; pet statuses use the actual lower-case lost/found schema. A stream failure produces the existing visible unavailable state instead of silently hiding a failed query. No event/portfolio imagery copied into this feed. Listing card copy uses business description, dated check and advertised coverage; detailed evidence remains on the listing. Business detail links retain selected/applicable city. Four44px city controls plus regional action; wrapping card badge/date layout. No database mutations, synthetic resident posts, comments, fake testimonials or counters.

## Evidence

Anonymous public query returned exact Nov12T13:57:40.468542Z checks for Rasoi,Aappakadai,MagicWand,Dhaba with approved/verified joined business records. Local actual feed shows these four first, all datedNov12, not three days old. All four actual city links tested:

- MH: MagicWand,Dhaba,Aappakadai among latest.
- Tracy: Dhaba,MagicWand,ActiKare among latest.
- Lathrop: MagicWand,Rasoi,Dhaba among latest.
- Manteca: MagicWand,Rasoi,GrowlsNMeows among latest.

Brentwood link absent in each.320px viewport/document both320.172tests pass, including check-date ordering, added/check deduplication, invalid-date recovery and exact check label/city routing. TypeScript pass. Final OpenNext production build pass. LIVE accepted source9fa397756669a9be6b994caa156345c00a081a6d; exact public marker and GitHub successful check observed. Native dashboard signed out, so native version/duration not asserted. Actual regional production feed has40items, today’s Aappakadai/Dhaba/MagicWand/Rasoi checks first, each datedNov12; zero Brentwood filter links. All four city views confirmed after waiting for the matching city subtitle. An initial Manteca read caught the prior city during navigation and was discarded; confirmed Manteca correctly shows MagicWand/Rasoi/Growls/iThink.320px document equals viewport. Screenshot nov12-activity-freshness-live.png inspected; temporary emulation cleared. No production data writes or fabricated activity.

## Scope limits and next work

Feed shows latest public records and latest website check per listing, not each historical edit. Event creation dates remain creation dates; corrected event times do not have a dedicated public change timestamp/history yet. Replies/pet status changes likewise must not be inferred as new activity until supported explicitly. ACT-02 tracks stream filters and genuine discussion discovery so useful conversations are accessible among editorial checks. Existing real-reporter pet pilot, physical phone/screen-reader acceptance and photo location/rights tasks remain open. FB unpublished.
