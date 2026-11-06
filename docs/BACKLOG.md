# MoHoLocal active execution queue

Updated November 5, 2026. Acceptance criteria and task status live in [ROADMAP.md](ROADMAP.md); sprint outcomes live in [SPRINTS.md](SPRINTS.md). Keep all three aligned when work changes. This is the next-work queue, not a second source of truth.

Completed **SEC-07 — P0 credential retirement:** modern-key deployments are live; legacy apikeys are disabled and the previous HS256 verifier revoked. Database, Auth-admin and Storage reject the old credential with HTTP 401; modern server and signed-in requester checks pass.

Completed **OPS-02 — delivery:** both Workers passed clean native Git builds from main; temporary setup permission removed and build-token registry access now returns 403. Watch paths exclude documentation-only changes; legacy Pages automatic builds are disabled.

1. **DATA-01 / DATA-02 — verified supply:** finish 39 candidates still requiring rechecks, investigate conflicts, deduplicate brands/service areas, and document sources. Eight existing records now have website checks (three launch-category providers, one moving provider, one window-treatment provider and three hardware stores); 25 records held including two duplicates. Landscaping has no checked launch provider yet.
2. **UX-01 / UX-02 / DATA-03 — experience:** city-page task search/service evidence/contact redesign and discovery accuracy fixes are locally verified, with deployment next; continue keyboard/resident testing, remaining category/SEO surfaces and empty searches using real inventory.
3. **PET-01 — useful community loop:** owner-authorized updates, current-status confirmation and expiry, privacy-safe photos/contact, and audit imported report sources. Recent/history UI and moderated intake are implemented.
4. **SEO-01 — release hygiene:** canonical bare-domain behavior, sitemap/structured-data accuracy, pending/private indexing and legacy route review.
5. **PILOT-01 / METRIC-01 — validation:** meet the checked-provider coverage gate, observe real searches and contact outcomes, then decide expansion/monetization. No outreach is authorized yet.

Shared regional experience: Mountain House, Tracy, Lathrop and Manteca. Initial deeper business verification remains Mountain House and Tracy. A Facebook research lead or an old approved flag is not independent verification.

November 5 UX follow-up: mobile navigation now has visible 48px touch targets, Escape/focus handling and a skip link; city/category evidence and discovery count errors are corrected. TypeScript and local interactions pass; final navigation deployment is being verified. Design acceptance criteria: `docs/ux/design-standard.md`. No competitor-superiority or resident-validation claim is made.
