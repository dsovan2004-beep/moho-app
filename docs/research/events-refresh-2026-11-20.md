# CORE-02 — November 20 event freshness batch

Resident problem: upcoming events are sparse, while existing holiday listings must not be duplicated or given guessed venues/hours. Primary outcome: add independently checked upcoming local activities and verify affected Events/Activity/detail surfaces. Stop when supported additions read back publicly; hold incomplete candidates. Keep photo/pet pilot gates open and FB unpublished.

Published outcome: live Better World Rescue page confirms Quickly Donuts Car Show, November21 11AM–3PM at O’Reilly Auto Parts, 515 Yosemite Ave Manteca; December5 breakfast8–10AM at Applebee’s3060NagleeRdTracy. Linked Zeffy primary booking page names Better World Rescue and Santa Paws title. No imagery reused or ticket/availability guarantee. New candidates deduplicated against all event statuses; no matches.

Sources: https://betterworldrescue.org/events/ and https://www.zeffy.com/en-US/ticketing/pancake-breakfast-featuring-santa-paws . Source source URLs, fields checked and dates will remain in published descriptions; private source/publication records remain outside Git. Existing editorial approved-event schema/workflow only; no schema or permission changes.

## Publication and acceptance

Two new approved events published through the existing events editorial columns, with guarded identity/date deduplication; SQL retained in publish-events-refresh-2026-11-20.sql. No schema, auth, storage or application changes. The source field classifies the breakfast as seasonal; the car show remains general Community. No event images imported. Retained private publication decision and source captures under gitignored .private-refresh; these are editorial records, not resident activity.

- Manteca Quickly Donuts Car Show: November21,11AM–3PM Pacific, O’Reilly Auto Parts,515YosemiteAve exactly as the primary participating organization lists it. Exact entrance, admission, parking, registration and pet/adoption arrangements unconfirmed. Public event9e98c504-4ac8-4148-b7b8-ef84ad871ee0.
- Tracy Pancake Breakfast featuring Santa Paws: December5,8–10AM Pacific, Applebee’s3060NagleeRd. Better World Rescue event calendar supplies date/time; its linked Zeffy booking page names host, matching address and Santa Paws title. Current ticket availability, dietary and animal-attendance details not promised. Public eventc9c26c96-07ca-47b2-988e-72767e685fa8.

Anonymous Data API read-back accepted both approved rows with exact date/city/source. Browser accepted Manteca Events (Tomorrow bucket,11AM–3PM), Tracy seasonal Events, both event details and both city Activity event streams. Mountain House and Lathrop Events retain their existing holiday listings. Screenshot: [Manteca event live](events-live-2026-11-20.jpg). Browser/source observations saved privately. Browser navigation to Chamber/booking source timed out; no claim of live browser acceptance for those pages. Web primary-source extraction supported booking cross-check. No calls, purchases, posts or messages sent.

## Four-city source checks and holds

- Mountain House official MoHoHo page freshly HTTP200: December5 parade5PM; existing record already reflects separate market venue and schedule. No duplicate or fake update timestamp. https://www.mountainhouseca.gov/277/MoHoHo-Holidays
- Lathrop official event page freshly HTTP200: December5 at5PM remains. Main content does not establish route/tree venue; general department address is not an event venue. Existing unknown-venue notice retained. https://www.ci.lathrop.ca.us/parksrec/page/christmas-parade-tree-lighting-0
- Tracy City parade calendar extracted by web source; terminal fetch failed. Existing December5,6–8:30PM record agrees; no duplicate. https://www.cityoftracy.org/I-Want-To/View/City-Calendar/2026/Events-Folder/Holiday-Light-Parade-and-Tree-Lighting
- Manteca Chamber Christmas in the Park/Parade primary page agrees with existing December5 noon–9PM park and5PM parade. No second parade record. https://manteca.org/2026-manteca-christmas-in-the-park-parade/
- Separate Christmas at the Center held for fuller organizer schedule: Chamber December3,5:30–9PM at Council Chamber; Better World Rescue lists its participation5–9PM at Senior Center; third-party8PM/6PM descriptions not adopted. These may describe separate segments; no guessed unified schedule or duplicate BWR segment published. https://manteca.org/events/event/christmas-at-the-center-city-of-manteca/
- Thanksgiving business availability/hours not inferred. No unsupported closure notices or promotional prices published. No expired event falsely labeled new; existing archive handles elapsed events.

## Next / stop conditions

This CORE-02 batch is LIVE and accepted; broader events coverage remains ongoing. Next CORE-03 directory discovery batch: junk-removal/dryer-vent shortcuts missing despite newly checked providers; stale seasonal global checked-November6 banner should instead direct residents to each event’s own check scope/date. Batch changes and test actual search/city/return/contact journeys before release. Do not start another pet-form cosmetic release. CORE-01 coverage expansion continues based on explicit service gaps; no universal freshness claim. Photo location/date/reuse tasks and genuine-reporter pilot remain OPEN; Facebook drafts UNPUBLISHED; no outreach or unauthorized imports. No app build needed for data-only publication. This overnight batch is separate from the scheduled Friday9AM freshness run and does not mark that period complete.
