# Safe business-sharing acceptance — November 9, 2026

SHARE-02: existing business ShareButton used window.location.href, which could carry directory returnTo/search context. It now accepts public business UUID and browsing city props; a fixed canonical www.moholocal.com URL includes only the UUID and one of four supported city names. No current URL, service, search, tracking, hash, account or return destination is copied. Invalid UUID yields no share action; unsupported city omitted.

Explicit share disclosure shows exactly what is shared. Copy business link has persistent role=status success/failure feedback, busy state, a read-only selectable manual-copy URL and optional native device share action. Native cancellation is distinct from errors and never falls through to copying. Nothing posts automatically. Shared copy helper used by existing shortlist widget too; no new permissions or storage/telemetry.

Evidence:
- 163 tests pass: canonical host/path and only-city key for all four cities; invalid ID/injected city/array inputs rejected or stripped; copy helper receives exact safe payload and reports false for missing/rejected clipboard access.
- Final OpenNext/TypeScript pass.
- Local actual page with simulated private returnTo/q/tracking/hash shows only canonical business UUID+Manteca in share field; manual select/copy verified exact URL through clipboard.
- Automatic copy handler displayed success; automation clipboard read/paste retained an earlier value while native manual copying updated it. Do not claim automatic clipboard integration independently accepted from that artifact. Exact automatic payload/failure contract verified by tests; manual fallback verified in browser.
- Expanded layout fits320px/390px and desktop without document overflow.
- Native sharing/cancellation not activated; no Facebook post, message, clipboard permission change or synthetic resident activity.

Feature source 3b57e30; accepted application and release-guard source ee872dbe2131fbcae760af3ef7fa7135caee8352. Guarded native deployment e7b2d059 Ready in 1m36s; public build-info.json matches that full source revision. Live share panel and canonical field checked; shortlist route returned 200 and correction entry retained its expected 307 redirect. Screenshot: nov9-safe-business-share-live.png. FB unpublished; photo rights/location tasks, genuine-reporter pet pilot and physical-phone/genuine resident acceptance OPEN.

## Deployment regression and guard

An old revision c1b04bd redeployed after newer accepted application code; the public revision marker was missing. Restored current code, then persisted release:check in both Cloudflare build and deploy commands and added scripts/** to watched paths. The guard fetches origin main and compares protected application trees; docs-only changes are allowed, stale app code or unavailable verification stops the release. Older source missing the script also fails closed under the central command. Local Git fixtures verify those cases. A manual retry of current ee872db with the persisted commands completed Ready. Underlying delivery timing is not established. No credential expansion or database change.
