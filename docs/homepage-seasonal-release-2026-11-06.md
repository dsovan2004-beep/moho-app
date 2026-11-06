# Homepage and seasonal release — November 6, 2026

## Delivered implementation

Warm task-first homepage with real November 4, 2026 Sentinel-2 satellite city views, visible acquisition/date/source/modified-data credits, responsive local WebP files, photo-credit page, four-city choices, task search, participation links and three approved seasonal events. Older 2024/archival images are removed from public assets and app references. Exact image capture/geographic/license evidence: research/photo-sources/README.md and adjacent STAC/crop records. These are 10 m satellite views, not street-level photographs. Street-level 2026 imagery remains unavailable with both verified capture and reuse rights; procurement remains open, with no outreach or purchase assumed.

Events: Mountain House Friendsgiving brunch (November 13, noon–2 PM; senior program, potluck pricing and registration), Mountain House MoHoHo (December 5, parade 5 PM, tree 6 PM per city), Tracy Holiday Light Parade (December 5, 6–8:30 PM). Source/check dates and participation details retained. No invented event photo, attendance, age cutoff or availability. Anonymous projection verified all three approved rows.

Seasonal city/month filters, event details in Pacific Time, proper end-time display, automatic upcoming removal, ended-event archive label and .ics downloads implemented. Calendar output escapes property injection and folds Unicode lines. Invalid/nonexistent/nonapproved event calendars return 404; upstream query failure is 503, not a fake missing event. New event data uses existing schema/RLS with no changes to credentials or grants.

## Validation before deployment

96 tests pass, including acquisition-year/geography/assets, Pacific evening/DST/local-day expiry, unknown end-time handling, calendar property injection and Unicode folding. Root TypeScript and OpenNext build pass. Local browser checks: desktop1280, phone320 with zero horizontal overflow and 44px city controls; seasonal three-event browse, November one-event filter, Tracy/November honest empty state and Tracy/December event detail. Actual HTTP calendar responses have text/calendar and attachment headers, correct UTC instants and no guessed Mountain House end. Malformed/nonexistent event IDs return404. Production/native acceptance completed; see the evidence below.

## Remaining scope

Verified and licensed 2026 street/park photos; more organizer-sourced events, event-linked discussion authorization/moderation, separate seasonal notification consent, real resident saves/RSVPs and usability observation. Existing phone push hardware validation also remains open. No user acceptance, measured engagement increase or competitive superiority claimed.


November 6 morning release accepted: source 1fef2a8a17c702b3692a145f57ca0c24eb703ad7 passed native Cloudflare build e0ac6380-e133-4e24-9544-639043e7d087; live web version 0abbc795-3a6c-41f8-949e-2d2b9a77aab8 (deployed 2026-11-06T16:16:50Z). Production homepage shows only November 4, 2026 satellite city views and all three seasonal events. Both city photos have exact capture/geographic/license evidence; street-level 2026 photography remains open. Desktop1280 and phone320/390 checks pass; four 44px city buttons, three live event cards, November filtering and Friendsgiving time/cost/registration verified. All four live WebP assets match repository hashes; rejected older image URLs return404. Production Tracy calendar HTTP200 preserves exact UTC times; actual browser Friendsgiving .ics download contains correct noon–2 PM Pacific instants. Invalid calendar IDs return404. 96 tests, root TypeScript and OpenNext build pass. Temporary viewport overrides cleared, local preview stopped, live homepage left open. Evidence: docs/homepage-seasonal-release-2026-11-06.md, docs/ux/homepage-2026-live.png, docs/ux/homepage-2026-tracy-mobile.png and docs/ux/seasonal-event-2026-live.png. Event discussions, separate seasonal-notification consent, resident testing and street-level photo procurement remain open.

## Photography limitation

The initial visual release uses openly licensed, dated 2026 satellite photography. It does not finish the request for warm street-level city/park photography. Public 2026 street-photo candidates checked did not establish reusable rights; no older image or generated replacement was used to fill that gap. This remains explicitly open in UX-03.
