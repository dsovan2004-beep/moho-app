# Mobile directory search redesign — November 9, 2026

Problem reproduced on production at390×844: search field begins1354px below viewport top on Manteca/window-cleaning text+service search. All service links and the optional outcome prompt precede resident search.

Change: mobile search and city/category filters precede service chooser. Browse/Change services opens an aria-expanded/aria-controls disclosure; service selection closes it. Desktop services remain visible. Optional outcome prompt now sits alongside its form below results. Existing search/service/city routing and evidence labels unchanged; no private data, auth, schema or publication change.

Local production browser acceptance:
- Search top318px at390px, down from1354px; document width/scroll width390.
- Expanded/closed service choices reflect aria-expanded and actual visibility.
- Change service → Pest control retains Manteca and returns3checked choices; closes chooser.
- Enter opens and Space closes the chooser.
-320px viewport has no document overflow.
- Desktop services visible, mobile toggle hidden.
-152tests and final OpenNext/TypeScript pass.

Sourcea8b67b3 deployed nativeec0ba5ab Ready2m6s; live build marker matches full sourcea8b67b3ed31e26fca72b22146b48a23c35a5eef8. Live390px with scrollY0 confirms search318px down, no document overflow; keyboard-open/service-selection retains Manteca, closes chooser and returns3. Emulation reset. Proof: nov9-mobile-search-live.png. All16roles refreshed in OPERATIONS with build-first ownership and boundaries. No repetitive source-count or unchanged indexing work this increment. Facebook unpublished; photo tasks, genuine-reporter pet pilot and physical-phone acceptance OPEN.
