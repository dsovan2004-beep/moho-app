# November 28 — services, events and mobile date discovery

Resident outcome: expand source-checked service contacts and exact library occurrences across Mountain House, Tracy, Lathrop and Manteca, then make dates easier to reach on narrow screens. Starting clean main589a128. No scheduled refresh period completed by this separate increment.

## Published editorial batch
Two new unique businesses, individually deduplicated by name/domain/phone before guarded transaction:
- Mr. Ed’s Plumbing & Rooter Service, 0df154a3-490f-4482-90b7-8bb07c5414c9. [Primary](https://www.mredsplumbing.com/) freshHTTP200: public2095979571, Stockton dispatch3504GrangeAvenue, plumbing/drains/water-heater/leak/camera services and individually named all4city coverage. No owner confirmation, license/insurance/quality/ratings, emergency-response/holiday availability or visitor access inferred.
- Valley City Plumbing, c830bb1b-295e-4202-b848-dd556e0efd0a. [Contact/coverage](https://valleycityplumbing.com/contact/) and [services](https://valleycityplumbing.com/services/) freshHTTP200. Public2095217594, Modesto1509KStreet#119. ExplicitTracy/Lathrop/Manteca only; no MountainHouse inference. Advertised plumbing/drains/water-heater installation/sewer work; current job/address/price/availability requires provider confirmation. No copied portfolio images.

Four new exact events, checked official library pages and branch addresses/phones in [primary branch directory](https://www.ssjcpl.org/your-library/locations), all freshHTTP200:
- Mountain House: [Superspy Day ages5–12](https://www.ssjcpl.org/events-services/events-calendar/mountain-house/steam-crew-superspy-day-ages-5-12), December7,4–5PM Pacific,201EastMainStreet. ID5e5d457d-315d-4665-ad56-4c25cc316af0.
- Lathrop: [Toddler Time](https://www.ssjcpl.org/events-services/events-calendar/lathrop/toddler-time-stay-play3?id=1796410800-250204), December4,11AM–noon,450SpartanWay. ID1923e850-e99a-4ad0-b1cf-6f922c139f60. No precise age/caregiver conditions inferred.
- Tracy: [Clay Holiday Ornaments](https://www.ssjcpl.org/events-services/events-calendar/tracy/december-2026/clay-holiday-ornaments-for-kids), December16,2–3PM,20EastEatonAvenue. ID0a56827e-f5b1-4b08-be7e-7c699108801a. No precise age or room inferred.
- Manteca: [Adult Ornaments/Wreaths](https://www.ssjcpl.org/events-services/events-calendar/manteca-branch/ornaments-wreaths-workshop-for-ages-18?id=1797015600-249837), December11,11AM–noon,320WestCenterStreet. ID7451a76b-2bbb-4f99-8471-afb0ede4be8a. Official free18+; supplies/space limited. Room/registration/remaining places unconfirmed.

Descriptions distinguish exact checked facts from missing attendance details; no blanket free/admission/availability guarantee. New approval/check dates actualNovember28. Private business publication history retained in directory_private.listing_corrections. SQL publish-services-events-2026-11-28.sql ALREADY EXECUTED; do not rerun. Fresh source text/private readback in .private-refresh/2026-11-28-*.json, outsideGit. AnonymousHTTP200 returned2businesses,2checks,4events.

Public acceptance: DirectoryNewest/Discover/Activity eachall4cities show Mr.Ed’s; ValleyCity presentTracy/Lathrop/Manteca and absentMountainHouse. All4new events appear cityEvents/Activity. Mr.Ed’s publicdetail phone/source/checkdate/coverage accepted; Mantecaeventdetail correctdate/time/source/18+free/capacity limitations accepted. No copiedimages, resident posts, testimonials or engagement.

## Mobile change and validation
Measured priorproductionManteca320px: first eventarticle top808px, later1208–2000px, no compactdateindex. Added current-view upcoming date/title anchors with44pxminimumtargets, article focus/scrolloffset, all-city quicklist citylabels, Allfourcities label. Past archive excluded from index; existingcity/season/month filtering preserved. No new query/data claims.

222testsPASS, TypeScriptPASS, OpenNextCloudflarebuildPASS. Firstsuiteattempt failed because disposablelocalPostgres was stopped; restarted existing isolatedtestcluster and fullsuite passed. LocalproductionbrowserPASS: all4cities at320px, zero broken anchors, allquicklinks≥44px and nooverflow. Manteca keyboardEnter focuses correctarticle; after smoothscroll settles article top112px. SeasonalTracyDecember list retains fivecurrent holidayevents; AllCities desktop1280px21entries/citylabels/nooverflow. Screenshot exposed the172pxsticky mobile navigation covering the heading at112px anchoroffset; increased offset to224px before acceptance. Native/productionUI acceptance pending.

## Remaining priorities and boundaries
Independent Lathrop/Manteca sitter/walker supply stillopen; unchanged iThink not republished. Photos remain OPEN with correctlocation/date/creator/reuserights needed; labeledsatellite retained, no photos imported. Petreporting LIVE, ongoingQA. FB unpublished, no outreach/messages/accounts/access/purchases. Existing Knights listing’s oldercontact/location differs from current general service-area source; follow up with its exactstorepage before any correction, no assumed consolidation. December1scheduledrefresh remains upcoming.
