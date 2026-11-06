# 2026 street-level photo sourcing — November 6, 2026

## Tracy: verified replacement

Mapillary image 2915180395489942, by marker_geo1, captured July 8, 2026 as displayed in its image-details panel and viewer. The selected image point is on Ninth Street near East Street, in Tracy. The downloaded real 360° panorama shows the tree-lined street, water tower and civic buildings. Visible date/license/map evidence is in tracy-mapillary-2026-evidence.png; the unmodified downloaded source and JSON rights/projection record are alongside it. No source API key or browser session token was extracted. Mapillary’s official Download image action opened the image, which was saved through the browser’s media download API.

Source: https://www.mapillary.com/app/?lat=37.73753898838463&lng=-121.42041054990091&z=18&pKey=2915180395489942 . Creator: https://www.mapillary.com/app/user/marker_geo1 . Official website reuse/credit guidance: https://help.mapillary.com/hc/en-us/articles/115001770409-CC-BY-SA-license-for-open-data ; image details links to https://creativecommons.org/licenses/by-sa/4.0/ . Creator, source, license, perspective adaptation and downloadable adapted image are provided on the site. The derivative remains CC BY-SA 4.0. Original provider blurring retained; no unblurring, synthetic reconstruction or generative enhancement.

The provider reports a 7680×3840 original, while its Download image control supplied 2048×1024; the file is not represented as a full-resolution original. A deterministic rectilinear view is sampled with bilinear interpolation, yaw100°, pitch-2°, horizontal FOV85°, output1200×800, then encoded to responsive WebP. No geography was added or removed. Display crop is documented. This is street-view photography, not a newly commissioned professional photograph.

## Mountain House: no qualifying replacement established

- KartaView photo API, 2026 date range centered on Mountain House: zero returned candidates. Expanded city-area bbox without date restriction also returned zero. Requests/responses preserved; this is a result for these searches, not proof no photograph exists anywhere.
- KartaView terms explicitly permit imagery under CC BY-SA 4.0 (https://kartaview.org/terms). The documented legacy API hostname failed certificate verification; verification was not bypassed. The current api.kartaview.org HTTPS endpoint responded normally. No downloaded KartaView image used.
- Mapillary public map with dateFrom2026-01-01/dateTo2026-11-06, centered at37.7719,-121.53204,z13: no selectable qualifying coverage seen within the city. The visible green route to the southeast lies outside the named city area and was not relabeled as Mountain House. Filter/extent screenshot: mountain-house-mapillary-2026-coverage-check.png. Source https://www.mapillary.com/app/?lat=37.7719&lng=-121.53204&z=13&dateFrom=2026-01-01&dateTo=2026-11-06&focus=map .
- City copyright notice: https://www.mountainhouseca.gov/copyright explicitly reserves rights to content. A public page and current publication year do not establish photo reuse permission or capture date. City renderings are not photographs. No City image copied.
- Corrected on deeper inspection: https://www.skyestoury.com/photography-mountain-house depicts the Mountain House outdoor-food brand, not the California city. Excluded from local-photo sourcing; no license purchased or message sent.

Keep the existing accurately labeled November 4,2026 Mountain House satellite view until a real 2026 street photo has both location/capture evidence and reusable rights. Next external dependency: a qualifying openly licensed image or express permission from a rights holder with 2026 capture confirmation. The exact requirement remains open; no claim both cities are complete.

## Other rejected candidates

City of Tracy Flickr Earth Day photo https://www.flickr.com/photos/cityoftracy/55365313766 establishes April25,2026 capture but says All rights reserved. It was not copied. Tracy's March3 council photo has the same rights barrier. These were not used to shortcut licensing.


## Local acceptance

96 regressions, root TypeScript and OpenNext build pass. Browser preview shows the actual street photograph with July 8, 2026, creator/source/license/adaptation credits, and no horizontal overflow at320px. The credits page accurately distinguishes the Tracy street photo from Mountain House satellite imagery, provides the licensed derivative download and leaves the Mountain House procurement gap explicit. Native deployment succeeded for source 3f63638128d0a907d52d4006712b3a8ccd48c77a, build 9c74bb7d-193c-47c8-8805-893024130a77. Live homepage and credits checked; both asset hashes match; 320px viewport/content widths equal 320. Screenshot: ../../ux/tracy-street-2026-live.png.


Final Mountain House catalog check: Flickr search for `"Mountain House" California`, capture dates January 1–November 6, 2026, and “Commercial use & mods allowed” returned no matches. Evidence: mountain-house-flickr-2026-check.png. This documents that specific search, not proof that no suitable photo exists. Mountain House street-photo acquisition remains open pending a qualifying source or express permission with capture-date evidence.


Facebook continuation: three joined Mountain House groups were reviewed in the signed-in browser. Two leads are held for missing capture/location/rights evidence, including one dated aerial that fails street-level scope; no photo published. See facebook-photo-review-2026-11-06.md for sanitized findings.


## Existing-rights-only continuation — November 6, 2026

User explicitly prohibited messages and requested sources with already established reuse rights. This supersedes photographer-outreach drafts: no requests were sent, no follow-up should be sent, and no scheduled outreach exists. Held Facebook leads cannot be used without an already applicable grant; group visibility alone does not clear rights.

Additional source checks:

| Source | Search and result | Decision |
| --- | --- | --- |
| Wikimedia Commons geographic API | 3,500 m radius around 37.7719,-121.542, file namespace, public image metadata: four records, no continuation. Holi2023.jpg states March 5, 2023; three NAIP TIFF names identify 2018/2020/2022 imagery. Metadata publication years were not treated as capture years. | No qualifying 2026 street candidate. Full request/response retained in mountain-house-commons-geosearch-20261106.json. This geographic catalog query does not cover untagged photographs. |
| Panoramax federated catalog | Public STAC /api/search, bbox -121.575,37.745,-121.515,37.795, capture interval January 1–November 6, 2026: zero features and no next link. | No candidate from that queried extent/time. Response retained in mountain-house-panoramax-20261106.json. Do not generalize to absence everywhere. |
| Flickr World Map | Official map page opened, but map/search controls did not render; only header/footer visible. | Unavailable check, not zero results. Earlier keyword/date/license results remain the established evidence. |
| Openverse API | Earlier unauthenticated image query returned HTTP 401. | Unavailable check, not proof of no matching media. No registration, credential expansion or payment performed. |

Panoramax documentation distinguishes capture datetime and upload date and requires the source instance’s actual image license; the software’s MIT license is not permission to use every picture. No generic license assumption was used. Primary references: https://docs.panoramax.fr/backend/dev/STAC_compatibility/ ; https://docs.panoramax.fr/backend/install/settings/ ; https://docs.panoramax.fr/how-to-contribute/use-panoramax/ . Flickr geographic-search guidance: https://blog.flickr.net/all/2025/07/23/flickr-fundamentals-improve-your-flickr-searches/ .

Result: Mountain House UX-03 stays open for a verified 2026 street photograph with existing reuse rights. No new app asset/code/database change; no production deployment needed. Existing clearly labeled satellite remains; Tracy’s accepted street image remains live. Next eligible work is verification of a newly discovered open-licensed source, not unsolicited contact or using held social images. Last application validation remains 96 passing tests, TypeScript/OpenNext/native build and production mobile acceptance; those were not re-run for this documentation-only research pass.


## Follow-up during local openings / filter UX pass — November 6

Focused public searches for Mountain House California, 2026 capture, licensing/Creative Commons and Flickr yielded no newly qualifying street photograph. Three leads were inspected rather than adopting search-result years as capture dates:

- Mountain House Live’s community page displays a Town Hall/Library image, but its about/standards pages credit historic place imagery to USDA/USGS NAIP and Tranistrider1979 (CC BY-SA 3.0), and retain rights in original footage. No documented 2026 capture date and applicable external reuse grant for that displayed image were established. Held; nothing copied. Sources: https://mountainhouselive.com/community ; https://mountainhouselive.com/about ; https://mountainhouselive.com/standards .
- Wikimedia’s `Mountain House (4270113674).jpg` search result has a 2026 page-edit date, but its description depicts a house in Afghanistan, with old/conflicting 2007/2009 capture metadata. It is not the California city or a 2026 photograph. Excluded. Source: https://commons.wikimedia.org/wiki/File:Mountain_House_(4270113674).jpg .
- KNOWOL’s “Map of Mountain House, California in 2026” is a commercial aerial/map print, not a qualifying street photograph; a creation year is not a documented camera capture year, and no existing website image reuse grant was established. Excluded. Source: https://www.knowol.com/information/california/map-of-mountain-house-california/ .

No new photo asset, outreach, purchase or satellite replacement. UX-03 remains open; this is a bounded source check, not a claim no suitable image exists.


## Regional discovery continuation — November 6

Additional targeted open-license/stock searches led to https://aroundus.com/p/5520771-mountain-house . It attributes a photograph to Tranistrider1979 under CC BY-SA3.0, but October8,2026 is labeled **Latest update**, not image capture date. No original2026 camera capture evidence was established; image held and not copied. Generic Unsplash/Pexels “mountain house” searches mix cabins, countries and older images and did not establish an exact-city2026 candidate. The City gallery https://www.mountainhouseca.gov/Gallery.aspx exposes older named albums; https://www.mountainhouseca.gov/464/Citywide-Project-Renderings includes planned November2026 projects but labels its visuals as renderings. Neither a current webpage year nor a rendering satisfies the real2026 street-photograph requirement, and the existing City copyright restriction was not waived. No assets downloaded or replaced, no outreach. UX-03 remains open.


## Legacy discovery / broader service-image pass — November 6

An additional CC0/public-domain search returned https://commons.wikimedia.org/wiki/File:Mountain_house.jpg . The file was transferred in2013, gives no capture date, and is categorized under mountains of unidentified countries. A generic name/public-domain grant does not establish Mountain House California or a2026 capture. Excluded; nothing downloaded. Provider portfolio photographs on Choice One and Paramount pages remain rights-reserved leads, not reusable service assets. New all-four-city service/event-image procurement scope is recorded in ../service-event-image-backlog-2026-11-06.json. No messages, copied photographs or city-photo replacement.


## Midday continuation, November6
Targeted Commons/Flickr queries for exact Mountain House California2026/CreativeCommons surfaced no newly qualifying candidate. City project page remains renderings; local-media page retains prior date/rights gap; 2026 MLS publication date does not establish street-photo capture or external reuse. Sources https://www.mountainhouseca.gov/464/Citywide-Project-Renderings , https://mountainhouselive.com/places . No replacement or outreach. Existing cleared Tracy street derivative may appear as explicitly labeled city backdrop on Tracy cards with full credits; it is never labeled as a store, provider project or actual event image. Genuine media for all four cities remains open.
