# Local SEO launch audit — November 8, 2026

Owner: Growth, Community Marketing & Monetization Lead. Scope: existing MoHoLocal Next.js / Cloudflare / Supabase application, Mountain House, Tracy, Lathrop and Manteca.

## Findings and first implementation

- Local route verification exposed a stale public/sitemap.xml asset shadowing the dynamic route; removed it and the unused root XML copy, with a regression check against reintroducing the public asset.
- Canonical sitemap previously advertised retired Best Of routes, Brentwood and older San Jose discovery pages. Removed these from the generated sitemap, while retaining the four city landing pages, category pages and resident guides. Added existing Discover and Classes routes. This changes sitemap discovery, not the availability of every historical route.
- Old event/pet sitemap queries selected updated_at, a column absent from those tables, and swallowed query errors. Select only existing fields; publish lastmod only where a real date exists. Do not manufacture modification dates on every request.
- Public catalog reads now paginate in batches of 500 instead of relying on the API's default row limit. Include approved, published business pages in our cities and providers based elsewhere whose public listing checks explicitly name at least one of our cities. This is website coverage evidence, not availability or quality verification.
- Database failures return a temporary 503 with Retry-After instead of silently serving an incomplete successful sitemap. XML output escapes values and deduplicates paths. The alternate /api/sitemap permanently redirects to /sitemap.xml.
- Live browser checks confirmed distinct titles, city headings and self-referencing HTTPS www canonicals for /mountain-house, /tracy, /lathrop and /manteca. A standalone urllib request received403; browser rendering succeeded. Do not infer crawler accessibility from these browser checks alone.
- Existing robots.txt references the canonical sitemap. Cloudflare adds managed crawler controls; no account crawler policy was changed.

## Next backlog

1. SEO-02: audit mobile city/category content, internal links, descriptions and social previews against actual inventory. Avoid near-duplicate city pages with no resident value. Audit noindex/canonicals for utility routes separately; robots.txt is not access control.
2. SEO-03: inspect existing Search Console ownership/access, sitemap submission, indexing, crawl failures and baseline query/city performance. Access and search-engine acceptance remain unverified. Do not create duplicate properties or verification credentials without need.
3. GROW-02: before any future authorized Facebook distribution, inspect the exact group's current promotional rules and validate each landing page/claim again. Four drafts prepared; no post, message, admin contact, social scheduling or paid campaign authorized.
4. METRIC-01: distinguish referral visits and useful contact actions from voluntary resident-reported connections. No ranking, booking, revenue or growth improvement has been measured. Existing outcome pilot remains open; never seed synthetic success reports.
5. Continue DATA-13 pet sitting/dog walking expansion using explicit service-city evidence. New leads remain research only until checked and deduplicated. Photo rights/location tasks and genuine-reporter pet pilot stay OPEN.

Do not create a Google Business Profile that presents the directory as a local storefront. Do not invent reviews, owner endorsements, holiday availability or group approval. Validate willingness to pay before monetization expansion.

Reference: [Google Search SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide). Sitemaps and metadata support discovery; they do not guarantee indexing or rankings.

## Validation / release

147 tests pass. Local production route returns200 with1100 distinct URLs:52static,1007business pages,41events,0eligiblepet pages. Checked an out-of-city provider with explicit service evidence is retained. Alternate route returns308 to canonical sitemap. Source344b9fb deployed via native Cloudflare build Ready1m47s, version0d2c120c. Live XML has1100 distinct URLs (1007business/41event/52static), no retired sitemap entries, and the explicit-coverage out-of-city provider is retained. /api/sitemap resolves to canonical /sitemap.xml. Live submission form offers exactly Mountain House, Tracy, Lathrop and Manteca.147 tests and final OpenNext/TypeScript build pass. Screenshot:research/nov8-four-city-submission-live.png. No production submission, claim, message, outcome or pet report created. Desktop browser checks only; attempted phone viewport override did not produce a phone-sized document and was reset. Search Console and genuine-user/device acceptance remain OPEN. Facebook drafts remain unpublished and unsent.


## Follow-up acceptance

SEO-03 ownership, sitemap and four-city checks now accepted: canonical property verified; Google November8 sitemap read Success/1,102discovered pages; all four landing pages report indexed. Mountain House live Google smartphone fetch Successful, crawl/indexing allowed and expected canonical. Performance/index-coverage baselines still processing; no ranking or traffic growth claim. Keep Google's verification HTML asset. [Detailed evidence](search-console-2026-11-08.md). Facebook drafts remain unpublished.
