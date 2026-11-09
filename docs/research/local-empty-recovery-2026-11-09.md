# Local-first empty results and third four-city freshness pass — November 9, 2026

## MOBILE-06

Empty directory results now use a compact named recovery region with full-width mobile actions. First remove search text while keeping city/category/exact service. Then broaden to all services in the category, or all listings in that city. Only the separately labeled other-cities action changes geography. Empty unfiltered inventory avoids a self-loop and provides the existing Suggest business entry. Copy distinguishes missing directory coverage from actual local service availability. Top-level filter chips still offer their existing explicit Clear all action.

Local acceptance at390px: removing unmatched Manteca query retains Home Services/plumbing; broadening service retains Manteca/Home Services and clears query+service; all city listings retains Manteca and clears category/query/service. At320px document width equals viewport; actions44–66px high, long labels wrap.165tests pass, including two new regression tests covering ordered recovery across all four cities and no self-loop for unfiltered empty inventory. TypeScript and final OpenNext pass; live release accepted below.

## FRESH-04: four existing records

| Listing/base | Primary source | Scoped recheck |
| --- | --- | --- |
| Aappakadai Indian Chettinad / Mountain House | https://www.aappakadaimountainhouse.com/ | Fresh direct fetch confirms public phone/address, cuisine and party-order link. No delivery boundary, live hours or dietary assurance inferred. |
| The Home Depot #1020 / Tracy | https://www.homedepot.com/l/Tracy/CA/Tracy/95304/1020 | Live browser detail confirms local store phone/address, rental center and garden retail. Global stored-city header was Modesto; used the explicit Tracy #1020 detail, without changing browser preferences. Do not equate retail location to contractor coverage, stock or holiday operation. |
| Rasoi Indian Kitchen / Lathrop | https://rasoitheindiankitchen.com/ | Live browser confirms phone/address, advertised Indian dishes, vegetarian options, catering and takeout. Exact delivery eligibility still needs confirmation; no food quality/allergen guarantee. |
| Watermill Express Main & Alameda / Manteca | https://watermillexpress.com/refill-stations/476-water-refill-station-in-manteca-ca/ | Fresh operator page confirms station/address, support phone and location-specific water marker. Generic water-and-ice copy does not establish station ice availability. Held photo remains unlocated/unreused. No water quality or operation test. |

Refreshed listing_checks only: date, scoped evidence notes and fields compared. Existing service areas/tags and business records unchanged. Original check rows preserved in private listing_corrections (one per record). SQL and anonymous public client read-back returned all four with check time2026-11-09T17:19:16.513176Z. No schema/permission, rating, owner, credential or approval changes. No newly published businesses or full-catalog freshness claim.

Facebook UNPUBLISHED; real2026 photo exact-location/reuse-rights tasks and genuine-reporter pet pilot OPEN. Physical-phone/screen-reader validation OPEN. No outreach, order, signup or post.

## Release acceptance

Source4842dd1cfa2413943d99317b4b3a73b65966ca93; native version53d03f74 Ready1m31s; public build-info.json matches. Live recovery region shows ordered local actions and separate other-city search. Remove search term retains Manteca/Home Services/plumbing; browse all city listings retains Manteca and resets category. At320px empty-region document width equals viewport and smallest action is44px high. Screenshot nov9-local-empty-recovery-live.png inspected at390px. Emulation reset; no resident submission/outcome or Facebook activity.
