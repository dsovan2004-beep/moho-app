# Shareable city and service shortlists — November 9, 2026

LIVING-03: resident-controlled Share this service shortlist / Share this city directory disclosure. Copy link, Copy suggested text and optional native device share menu. Read-only selectable fallback fields show exactly what is shared. No Facebook composer, post API, messaging, permissions or automated distribution.

Fixed public routes: /shortlists/{launch-city-slug}/{optional-service-key}. Only four relaunch cities and known exact services accepted; unknown/retired cities, unknown services and extra path segments404. Shared destination renders the same DirectoryBrowser and current public results, rather than a saved provider-count snapshot. Navigation city comes from the path; top-nav city switches retain the service. Normal directory filters/search/return/correction/outcome code reused.

Share payload built from allowlisted city/service only: no arbitrary current URL, typed q, sort, user/session/account fields or provider endorsement. City-only action explicitly shares the general city directory. Service text says website-checked contact shortlist and asks readers to confirm exact job/address/availability. Uses existing own-brand logo, no new city/provider photo.

Metadata: city/service title, description, canonical/og:url, own-logo image/alt and Twitter summary. Utility share routes noindex/follow and omitted from sitemap, avoiding another set of indexed duplicate directory pages. Local facebookexternalhit/1.1 request confirms OG metadata emitted in head for city-only and service routes. This is not actual Facebook cached-preview acceptance; no Facebook debugger/rescrape or post.

Local production browser acceptance at390px:
- Manteca/window-cleaning with private-example q and newest sort → copied URL https://www.moholocal.com/shortlists/manteca/window-cleaning exactly; q/sort excluded.
- Suggested text copied accurately, retains evidence/availability limits.
- Destination shows2checked window-cleaning providers and Manteca navigation/metadata.
- Top-nav city switches retain window-cleaning for Tracy, Mountain House and Lathrop; same data contract.
-390px no document overflow. Native share menu not sent/exercised; clipboard tested only.
- City-only/service routes200; retired city/unknown service/extra path404.
-160tests and final OpenNext/TypeScript pass. Sourceadc6b86 deployed native9265c5a4 Ready2m36s; marker matchesadc6b866e61f1149bb3cce6a8cd58736e2625ff2. Live Manteca service shortlist2results, correct title/OG title, copy URL exactly,390px no overflow; service-preserving top-nav switch to Tracy and city-only Manteca share URL accepted. All four service URLs/city-only200; unknown service404. Screenshot nov9-share-shortlist-live.png. Native/FB sending not exercised. Emulation reset.

Facebook unpublished. Photo rights/location tasks, genuine-reporter pet pilot and physical-phone/genuine-resident acceptance remain OPEN.
