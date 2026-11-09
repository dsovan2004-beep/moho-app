# Mobile pagination recovery and second four-city recheck — November 9, 2026

## MOBILE-05

A next-page request failure previously set the initial-load error flag, hiding the listings already loaded. Separate next-page error state now retains those cards and their contacts, keeps the current offset and offers Try loading more beneath the existing results. Pending retry stays visible/disabled with Trying feedback; success clears the recovery message. Initial-page failures retain the initial Try again flow. New filters clear old failure state; existing request-sequence checks prevent stale responses from changing current results. No new storage, telemetry or permissions.

Local-only browser fetch fixtures: first page 20 of 21 fictional rows; offset20 failed without hiding any of the20. Retry offset20 appended exactly one, total21, no duplicated cards; recovery message disappeared. Delayed retry kept20 cards and the retry button disabled/visible. Separate initial-page failure showed zero cards and the initial Try again alert. Fictional fixtures lived only in the localhost tab; reload removed them. No production record, report, claim or outcome created. Raw CDP startup-script injection was unavailable; ordinary local Runtime fetch fixture used instead. Screenshot nov9-pagination-failure-local.png explicitly shows a Local QA fixture and is not a production incident. Temporary emulation reset.

Final163 regression tests, TypeScript and OpenNext build pass. Live acceptance below.

## Four existing listings refreshed

| Listing/base | Primary sources | Recheck limits |
| --- | --- | --- |
| Aapli Marathi Shala & Community / Mountain House | https://mhshala.org/admissions/ | Fresh source names Marathi/cultural classes, Mountain House and Manteca batches and Mountain House classroom. No available seats or current-term schedule guarantee; Manteca classroom still requires confirmation. |
| Roto-Rooter Tracy / Tracy | https://www.rotorooter.com/tracyca/ | Live browser confirms phone and plumbing/drain/water-heater offerings, plus all four named service areas. No street office established; removed location from fields-checked. Holiday response time, price and credentials unconfirmed. |
| Knights Plumbing & Drain / Lathrop | https://knightsplumbinganddrain.com/service-areas/mountain-house-ca/ | Fresh direct fetch confirms phone, Lathrop contact footer and named four-city coverage. A separate map references Manteca; public note asks to confirm visit location. Affiliation retained without creating duplicate Tony’s listing. |
| Raunak Bazar / Manteca | https://www.raunakbazar.com/ and https://www.raunakbazar.com/ourStore/ | Fresh browser confirms public phone/address and Indian grocery, spice and festival/puja offerings. Homepage alone lacked full inventory detail; Our Store explicitly supports festival-item tag. No live stock, dietary assurance, hours or delivery coverage assumed. |

Updated only listing-check date, scoped note and explicitly checked fields. Original records saved in private listing_corrections, one audit row per recheck. SQL read-back confirms 2026-11-09T17:09:50.962790Z and retained service areas/tags. Anonymous public read-back independently returned all four published records with new dates. No new business rows, duplicate listings, approval/rating/owner changes or schema/security changes. This is four scoped website rechecks, not a full-catalog certification.

Facebook UNPUBLISHED; photo exact-location/reuse-rights tasks and genuine-reporter pet pilot OPEN. Physical-phone and screen-reader acceptance OPEN.

## Release acceptance

Source2d899cdd50a8c7b80c6a4632c3c82542d2f3521a deployed as native versionf60647bb, Ready2m27s; public build-info.json matches. Production All Cities Load More expanded20→40; scoped main business-card links yield40 unique listing IDs. Initial broad heading count included footer/service headings, so it was not used as a duplicate-listing measure. Public result count includes legacy inventory and is not a freshly checked catalog count. Production document width equals390px/320px viewport. No production failure injected or resident record/outcome created. Native emulation reset after checks.
