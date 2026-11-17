# Tuesday November 17, 2026 — scheduled freshness refresh

Completed the Tuesday9AM Pacific FRESH-01 period once. No prior completed November17 scheduled period was present. Worktree clean at entry. Read OPERATIONS/BACKLOG/ROADMAP/SPRINTS and the November13 completed refresh, then reviewed intervening ledger/source history through9f47723. Existing pet-share releases and provider additions are not counted as fresh output today.

## Published changes — data only

1. Corrected existing Mountain House MoHoHo Holidays location/schedule text: parade5PM on Central Parkway from Mustang Way toward Main Street; tree lighting6PM at Town Hall Plaza; holiday market6–9PM in the Town Hall parking lot. The parking lot is distinct from the plaza. Preserved original creation/approval date and null overall end_time; the market's9PM end is not asserted as the entire program end. [City source](https://www.mountainhouseca.gov/277/MoHoHo-Holidays), parsed source crawled today.
2. Added the City's December12 holiday breakfast as two separate seatings:9–10AM and10:30–11:30AM Pacific, Unity Center. City source lists12dollars/person ages2+ and limited spaces with registration links; no under2price or current seat availability inferred. Street address was not stated on the event page and remains explicitly unestablished rather than copying the City Hall footer. [City breakfast source](https://www.mountainhouseca.gov/466/Breakfast-with-Santa), fresh direct HTTP200 plus parent2026season/date context. No photos/posters copied.

Published IDs: d61f50d2-683b-444b-9487-4bc9396d8512 and fe7847cc-9e24-44cb-a3f2-7586c0476a57. Corrected existing a7dea964-55db-4608-8bad-dfd8e931a4e2. These are two timed seatings of one City program, not two unrelated festivals.

SQL in publish-freshness-2026-11-17.sql uses an expected-current-record guard, global same-day source/title duplicate guard and atomic transaction. Private before/after history is stored in git-excluded .private-refresh/2026-11-17-events-before.json and .private-refresh/2026-11-17-events-after.json, mode0600. Dedicated server-side event audit storage remains a follow-up; business-only audit tables were not misused.

## Public acceptance

Anonymous Supabase read returned exactly3affected approved records, two breakfast rows with image_url=null and correct17:00–18:00Z /18:30–19:30Z instants. New detail pages HTTP200 and title/location/date text accepted. MountainHouse city Events includes both seating titles. All4city Events pages HTTP200. Regional Activity includes both actual new event records. MoHoHo detail displays the corrected parking-lot venue and6–9PM market time; its title is correctly HTML-escaped, not missing. Both breakfast calendar routes return200 and exact DTSTART/DTEND UTC pairs; public location caveat retained.

No application/schema/key/RLS/deployment change, app build or unnecessary test rerun. Retain the last accepted application source86dab9567015e5af75c545369ca99162cb182402; this is live data publication, not a new software deployment. Venue clarity/calendar-ready separate seating times improve the resident journey without rebuilding UI.

## Four-city upcoming-event sample

- MountainHouse: current MoHoHo/Breakfast sources above support changes. Other catalog entries not globally reverified.
- Lathrop: [official Christmas page](https://www.ci.lathrop.ca.us/parksrec/page/christmas-parade-tree-lighting-0) fresh direct HTTP200 still gives December5,5PM only; department contact addresses are not venues. Route, tree venue and end-time remain unconfirmed; unchanged. [Nov17Storytime](https://www.ssjcpl.org/events-services/events-calendar/lathrop/preschool-storytime?id=1794940200-212861) web source crawled today agrees10:30–11AM/450SpartanWay; unchanged.
- Manteca: [Dinovember](https://www.ssjcpl.org/events-services/events-calendar/manteca-branch/dinovember-game-night) web source crawled today agrees Nov17,3:30–4:30PM/320WCenter/ages6–12. [Chamber holiday source](https://manteca.org/2026-manteca-christmas-in-the-park-parade/), crawled yesterday, agrees Dec5,noon–9PM park/5PMparade; no change.
- Tracy: [City holiday event](https://www.cityoftracy.org/I-Want-To/View/City-Calendar/2026/Events-Folder/Holiday-Light-Parade-and-Tree-Lighting), crawled today, agrees Dec5,6–8:30PM and named downtown route. [Nov20conversation club](https://www.ssjcpl.org/events-services/events-calendar/tracy/reoccurring-weekly-monthly-events/english-conversation-club-for-adults?id=1795219200-211630) cached source crawled2days ago agrees4–5PM/20EEaton/WadsworthRoom; no fresh direct-body confirmation claimed.

Direct HTTP200 responses from3library URLs did not expose expected event text in the simple parser; they are not treated as fresh full-body confirmations beyond the web-tool source dates above. Past November13/14/16events stay archived by the existing upcoming/past partition; no historical records destructively removed or retimestamped. Not a full-calendar audit or attendance/availability confirmation.

## Openings, providers and imagery

Current local-openings feature still has its dated December7monthly hide deadline. No expired opening-weekend coupon exists in the7notice configuration. Fresh direct primary HTTP200 for MountainHouse Domino's/Wingstop, Tracy Sprouts and Lathrop ColdStone retains operating-store context. Manteca JerseyMike's primary still403; not a closure finding or fresh verification. No normal-hours→Thanksgiving-hours inference or source date retimestamp. No justified opening/closure edit in this sample.

Fresh [Tyler homepage](https://www.tylerspetboarding.com/) and [iThink rates/service-area page](https://www.ithinkpet.com/central-valley-rates.html) HTTP200 retain stated services/coverage/contact routes. Tyler: Lathrop/Manteca/Tracy, smaller dogs, client-home visits versus home boarding distinguished; no dog-walking or MH tag inferred. iThink: explicit all4cities, text5102741750, travel/holiday terms; no fixed quote or availability claim. Listings unchanged rather than manufacturing new Activity dates. No new qualified independent sitter/walker added. Current approved+verified exact-tag snapshots: MH sitting3/walking3, Tracy6/5, Lathrop3/3, Manteca4/4; overlapping provider coverage, not summed unique businesses or quality/availability.

New service discovery results included MoHoLocal's own pages and wrong-region businesses; neither independently validates a new provider. Lathrop/Manteca expansion remains P1. Rights search yielded an old2013Commons Mountain-house image, not a qualifying real2026MH street photo. City's slideshow/event imagery has no established reusable rights/capture evidence for our photo task; iThink explicitly prohibits photo sharing. No image downloaded/reused. Existing accepted credits and labeled satellite remain. No FB review/imports/posts, contact, permission requests, account creation, purchases or access expansion.

## Next priorities / gates

Recheck exact upcoming library occurrences and holiday registration terms; resolve Lathrop parade venue only with event-specific City evidence. Continue primary-qualified Lathrop/Manteca services and verified rights/capture/location imagery. Dedicated event audit persistence, genuine-reporter pet pilot, physical-phone/screen-reader acceptance and abandoned-upload retention remain OPEN. FB remains UNPUBLISHED; no resident engagement fabricated.
