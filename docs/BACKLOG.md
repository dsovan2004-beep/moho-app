# MoHoLocal active execution queue

Updated November 5, 2026. Acceptance criteria and task status live in [ROADMAP.md](ROADMAP.md); sprint outcomes live in [SPRINTS.md](SPRINTS.md). Keep all three aligned when work changes. This is the next-work queue, not a second source of truth.

Completed **SEC-07 — P0 credential retirement:** modern-key deployments are live; legacy apikeys are disabled and the previous HS256 verifier revoked. Database, Auth-admin and Storage reject the old credential with HTTP 401; modern server and signed-in requester checks pass.

Completed **OPS-02 — delivery:** both Workers passed clean native Git builds from main; temporary setup permission removed and build-token registry access now returns 403. Watch paths exclude documentation-only changes; legacy Pages automatic builds are disabled.

1. **DATA-01 / DATA-02 — verified supply:** finish 39 candidates still requiring rechecks, investigate conflicts, deduplicate brands/service areas, and document sources. Eight existing records now have website checks (three launch-category providers, one moving provider, one window-treatment provider and three hardware stores); 25 records held including two duplicates. Landscaping has no checked launch provider yet.
2. **PRIV-01 — release policy:** live privacy and terms links lead to 404 pages; replace them with accurate data-handling and participation information before the broader public pilot.
3. **UX-01 / UX-02 / DATA-03 — experience:** city/task search, service-area evidence, catalog error handling, mobile navigation and full-width evidence/contact cards are deployed. Live 320px/390px, skip/Escape and 44px contact checks pass. Continue resident usability tests, remaining Best Of/SEO surfaces and empty searches using real inventory.
4. **PET-01 — useful community loop:** owner-authorized updates, current-status confirmation and expiry, privacy-safe photos/contact, and imported report source audit. Recent/history UI and moderated intake are implemented.
5. **SEO-01 — release hygiene:** bare-domain www redirect confirmed in browser; sitemap/structured-data accuracy, private indexing and legacy route review remain open.
6. **PILOT-01 / METRIC-01 — validation:** meet checked-provider coverage, observe real searches/contact outcomes, then decide expansion/monetization. No outreach is authorized yet.

Shared regional experience: Mountain House, Tracy, Lathrop and Manteca. Initial deeper business verification remains Mountain House and Tracy. A Facebook research lead or an old approved flag is not independent verification.

November 5 UX follow-up: mobile navigation now has visible 48px touch targets, Escape/focus handling and a skip link; city/category evidence and discovery count errors are corrected. TypeScript, clean native build and live interactions pass; revised navigation and mobile results are deployed. Design acceptance criteria: `docs/ux/design-standard.md`. No competitor-superiority or resident-validation claim is made.
