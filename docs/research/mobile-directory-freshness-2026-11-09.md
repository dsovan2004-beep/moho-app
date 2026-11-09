# Mobile directory and four-city freshness — November 9, 2026

## Resident-facing increment

Mobile search now has 16px text, search input semantics and search keyboard hint. Submit clears the pending typing debounce. Mobile residents can choose the existing A–Z, Newest or Top Rated order; city/category/exact service are retained. Search queries explain automatic relevance ordering instead. Owner claims moved below contact actions alongside corrections, with a business-specific accessible name, leaving the full card heading width available to residents. No change to claim permissions or public listing gates.

Local 390px acceptance: sort Newest retained Mountain House/Home Services/handyman; city changes Manteca, Lathrop and Tracy retained category/service/newest. Typing Matt and pressing Enter retained Tracy/category/service/query and displayed relevance ordering. Mobile search computed 16px/type search; 320px document width equals viewport. Mountain House Handyman heading measured 316px at 390px; owner claim target retains its existing UUID route. 163 regression tests and TypeScript pass. Final OpenNext build passes; live acceptance completed below. Before release, production at 390px measured the same handyman title at 237.75px, mobile search 14px and no mobile sort control. Local revised title is 316px with 16px search.

## Bounded freshness pass — four existing listings

| Existing listing / base | Primary source checked November 9 | Facts and limits |
| --- | --- | --- |
| Mountain House Handyman — Matt Disko / Mountain House | https://www.mattdisko.com/ | Browser confirms public phone, base, maintenance work and request-form option naming all four cities. Request form first; operator disclaimer retained. No trade credentials or availability confirmed. Residential address omitted. |
| American KeyTech / Tracy | https://americankeytech.com/ | Direct fresh fetch confirms repeated local phone, Tracy storefront and locksmith/rekeying offerings. Site has unrelated template copy/placeholder phone; no emergency availability or wider travel coverage adopted. |
| Molly Maid of Stockton, Elk Grove, Tracy, and Modesto / Lathrop | https://www.mollymaid.com/locations/california/mountain-house/ | Direct fresh fetch confirms repeated phone, Lathrop office, cleaning offerings and named areas. Exact property eligibility still requires business confirmation. |
| The Cleaning Authority — Tracy-Manteca / Manteca | https://www.thecleaningauthority.com/discovery-bay/ | Live browser used after direct fetch denial. Phone/office and named Tracy/Lathrop/Manteca cleaning coverage confirmed on website; Mountain House remains excluded because ZIP 95391 alone does not establish named coverage. |

No new businesses, duplicate rows, phone/address changes, service expansions, rating changes or credentials inferred. Updated check dates/scope notes only. Four original listing_checks preserved in private listing_corrections audit before refresh; Further scoped audits removed retrieval implementation detail from the public scope note and added the explicitly checked location field for the Mountain House and Manteca records. Read-back confirms all four dates 2026-11-09T17:00:27.359341Z and unchanged service areas. Anonymous public Supabase client independently returned all four published rows with new check dates. No schema, permissions, auth or resident-outcome changes.

Supabase changelog index fetched; current update documentation consulted. No relevant client/schema feature upgrade required. Retrieval issues remain in this evidence record, not resident copy.

Facebook unpublished. Real 2026 photo location/reuse-rights tasks and genuine-reporter pet pilot OPEN. Physical phone and screen-reader acceptance still OPEN. No outreach or post.

## Live release acceptance

Source 191edac1846af2a6e4bdeec117707e895e7a6e14; Cloudflare native version 27728d36 Ready in 1m46s; public build-info.json matches. Live 390px same-name heading is 316px; search computes 16px with enterkeyhint search. Newest selection and city switches Mountain House → Manteca → Lathrop → Tracy preserve category Home Services and service handyman. Live Matt Enter search retains Tracy/category/service/query and shows relevance label. Live 320px document width equals viewport. Refreshed Mountain House listing visibly shows November 9 website check, request-first action and owner/correction links after contacts. Screenshot nov9-resident-mobile-card-live.png inspected; temporary emulation/viewport reset. No native phone or screen-reader completion claim.
