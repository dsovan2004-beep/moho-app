# Homepage and seasonal release — November 6, 2026

## Delivered implementation

Warm task-first homepage with real November 4, 2026 Sentinel-2 satellite city views, visible acquisition/date/source/modified-data credits, responsive local WebP files, photo-credit page, four-city choices, task search, participation links and three approved seasonal events. Older 2024/archival images are removed from public assets and app references. Exact image capture/geographic/license evidence: research/photo-sources/README.md and adjacent STAC/crop records. These are 10 m satellite views, not street-level photographs. Street-level 2026 imagery remains unavailable with both verified capture and reuse rights; procurement remains open, with no outreach or purchase assumed.

Events: Mountain House Friendsgiving brunch (November 13, noon–2 PM; senior program, potluck pricing and registration), Mountain House MoHoHo (December 5, parade 5 PM, tree 6 PM per city), Tracy Holiday Light Parade (December 5, 6–8:30 PM). Source/check dates and participation details retained. No invented event photo, attendance, age cutoff or availability. Anonymous projection verified all three approved rows.

Seasonal city/month filters, event details in Pacific Time, proper end-time display, automatic upcoming removal, ended-event archive label and .ics downloads implemented. Calendar output escapes property injection and folds Unicode lines. Invalid/nonexistent/nonapproved event calendars return 404; upstream query failure is 503, not a fake missing event. New event data uses existing schema/RLS with no changes to credentials or grants.

## Validation before deployment

96 tests pass, including acquisition-year/geography/assets, Pacific evening/DST/local-day expiry, unknown end-time handling, calendar property injection and Unicode folding. Root TypeScript and OpenNext build pass. Local browser checks: desktop1280, phone320 with zero horizontal overflow and 44px city controls; seasonal three-event browse, November one-event filter, Tracy/November honest empty state and Tracy/December event detail. Actual HTTP calendar responses have text/calendar and attachment headers, correct UTC instants and no guessed Mountain House end. Malformed/nonexistent event IDs return404. Production/native deployment acceptance pending.

## Remaining scope

Verified and licensed 2026 street/park photos; more organizer-sourced events, event-linked discussion authorization/moderation, separate seasonal notification consent, real resident saves/RSVPs and usability observation. Existing phone push hardware validation also remains open. No user acceptance, measured engagement increase or competitive superiority claimed.
