# MoHoLocal active execution queue

Updated November 5, 2026. Acceptance criteria and task status live in [ROADMAP.md](ROADMAP.md); sprint outcomes live in [SPRINTS.md](SPRINTS.md). Keep all three aligned when work changes. This is the next-work queue, not a second source of truth.

Completed **SEC-07 — P0 credential retirement:** modern-key deployments are live; legacy apikeys are disabled and the previous HS256 verifier revoked. Database, Auth-admin and Storage reject the old credential with HTTP 401; modern server and signed-in requester checks pass.

1. **OPS-02 — delivery:** finish native Builds for the existing web and ingestion Workers, verify clean source builds, then remove temporary setup access. Legacy Pages auto-build is disabled.
3. **DATA-01 / DATA-02 — verified supply:** finish 46 unchecked candidates, investigate conflicts, deduplicate brands/service areas, and document sources. Current shortlists contain three website-checked existing providers; landscaping has no checked launch provider yet.
4. **UX-01 / UX-02 / DATA-03 — experience:** continue keyboard/resident testing, extend accurate counts/trust presentation to older city/discovery pages, and improve empty searches using real inventory.
5. **PET-01 — useful community loop:** owner-authorized updates, current-status confirmation and expiry, privacy-safe photos/contact, and audit imported report sources. Recent/history UI and moderated intake are implemented.
6. **SEO-01 — release hygiene:** canonical bare-domain behavior, sitemap/structured-data accuracy, pending/private indexing and legacy route review.
7. **PILOT-01 / METRIC-01 — validation:** meet the checked-provider coverage gate, observe real searches and contact outcomes, then decide expansion/monetization. No outreach is authorized yet.

Shared regional experience: Mountain House, Tracy, Lathrop and Manteca. Initial deeper business verification remains Mountain House and Tracy. A Facebook research lead or an old approved flag is not independent verification.
