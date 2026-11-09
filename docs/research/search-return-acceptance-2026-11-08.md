# Search-return acceptance — November 8, 2026

Confirmed before: Lathrop q=Shamblin detail Back to results discarded q and added Home Services.

Implementation: directory cards encode a validated directory-only return destination; dedicated Back actions and related-provider navigation retain it. Ordinary category/breadcrumb browse links keep their existing category semantics. No arbitrary URL redirect and no authentication return policy changes.

Local production-build browser acceptance:
- Lathrop / All / Shamblin / newest → detail → Back: exact original filters restored.
- Manteca / Home Services / electrical-services / electrician / name → Luminate → Lainez related provider → Back: all five values restored.
- All Cities / All / Shamblin / newest → detail → Back: All Cities retained, not replaced by office city; link labeled Back to all cities results.

152 tests pass, including round-trip and rejection of external/non-directory destinations, duplicate/unknown fields, invalid geography/category, array input, excessive/control-character search text; punctuation stays safely encoded. OpenNext production build and TypeScript pass. Native source814d5ce/b15ed3d8 Ready2m41s. Live390px Lathrop name-search round trip restores all values with390px document/scroll width. Live Manteca electrical/electrician → Luminate → Lainez → Back returns2and retains all five filter values. Device emulation reset. Proof: nov8-search-return-live.png.

Data increment: Top to Bottom Washers IDb0d34b07-8d92-4a6b-8398-04a0438399ba, Stockton office city, explicit four-city service coverage; name search returns one live result in each city.90dated checks. No calls, forms, photos, credentials/quality/availability confirmation or synthetic activity.

Search Console sitemap report remains Success / Nov8submitted and read /1,102discoveredpages/0videos. No resubmission; discovered is not indexed or proof of new listing crawl. Photo acceptance tasks, genuine pet pilot and physical-phone acceptance OPEN; Facebook unpublished.
