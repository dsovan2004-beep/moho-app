# Four-city directory scope — November 9, 2026

During mobile acceptance, observed the All Cities view still included legacy inventory from outside the four-city relaunch region. Read-only approved/verified location counts included San Jose324, Santa Clara100, Sunnyvale83 and Brentwood332. These counts establish location, not travel coverage or recent verification.

MOBILE-08 changes All Cities browsing to: office/store in Mountain House, Tracy, Lathrop or Manteca OR a listing_checks service-area record explicitly naming at least one of those cities. Outside bases with recorded coverage are retained. Existing direct city URLs remain readable, including legacy URLs; no business rows deleted/unpublished and no RLS/approval gates loosened. UI filter label is All four cities; internal query value remains All Cities for existing URLs. Both initial and next-page fetches use the same scope; coverage-query errors use the existing initial/next-page recovery paths. Service/search/category/sort filters continue to narrow within that regional boundary.

Read-only SQL comparison:1,023regional records, including46outside-city bases with recorded coverage;839unscoped legacy records excluded from this view. This is inventory scope, not a claim that1,023records were freshly checked.

Local browser:regional initial count1,023. Search for unique San Jose legacy name ¡Una Mas! yields0regional results, but1on explicit legacy San Jose URL. iThink query yields1regional result, preserving a covered outside-city provider.169tests pass including exact four-city/covered-ID predicate and malformed-ID rejection. Final TypeScript and OpenNext pass; live acceptance below. A test fixture initially treated the all-zero UUID as malformed; corrected fixture to an actual injected/malformed ID rather than imposing an unrelated UUID-version restriction.

Facebook UNPUBLISHED. Photo exact-location/reuse-rights tasks and genuine-reporter pet pilot OPEN. No outreach, new provider, availability/quality claim or data deletion.

## Live acceptance

Final sourcefdd3419013b93903a36160d46f8743b03b219731; native version83d6ab65 Ready1m47s; public build marker matches. Production All Cities inventory1,023; Load More20→40 with40unique main listing-card IDs. Legacy name ¡Una Mas! returns0regional results; iThink returns1, retaining recorded regional coverage. The legacy explicit city URL compatibility was verified locally. At320px document width equals viewport. Screenshot nov9-regional-directory-live.png shows All four cities selection and the outside-base provider with stated service areas; its older check date is not presented as a new recheck. Screenshot inspected and temporary emulation reset.
