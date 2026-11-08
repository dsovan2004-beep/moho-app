# Resident outcome measurement audit — November 8, 2026

## Evidence and limits

Source inspected: app/layout.tsx, app/directory/page.tsx, app/components/BusinessContactActions.tsx, app/api/business-requests/route.ts, lib/directory-filters.ts, wrangler.jsonc, package.json, public schema table inventory. Repository text search across app/lib/workers/migrations for analytics, outbound, contact_click, trackEvent, beacon, gtag, Clarity, PostHog and inquiry terms found no application contact/search outcome instrumentation. Cloudflare observability is enabled for moho-web; operational logs do not establish successful resident connections. Cloudflare Web Analytics configuration and any dashboard-only settings were not audited in this pass, so traffic reporting outside the source remains unknown.

## Current coverage

| Outcome | Current evidence | Verdict |
|---|---|---|
| Traffic | Hosting observability configured; dashboard traffic analytics not checked | Cannot claim a resident-outcome baseline |
| Search/no result | Search/filter state exists in browser; no stored aggregate events found | Not measured by app |
| Contact intent | Direct tel/sms/website anchors, no application tracking handler | Not measured by app |
| Provider inquiry | business_requests stores listing submissions, claims and corrections, not service inquiries | Do not count as customer leads |
| Provider reply/booking | No provider inquiry/booking outcome workflow found | Unknown, not zero |
| Pet connection | Private conversations/progress exist; genuine-reporter pilot still open | Not evidence of provider conversion or a completed real pilot |
| Freshness | listing_checks dates, fields, sources and service areas | Measurable editorial operations, not resident success |

No private message bodies, search histories or contact details were exported for this audit. No new tracking, cookies, schema or permissions were added.

## Prioritized follow-through

1. METRIC-01a: audit live Cloudflare analytics settings and exact privacy disclosures before instrumentation. Define consent/opt-out behavior, retention, aggregate storage and bounded city/service/action dimensions.
2. METRIC-01b: measure search submitted, no-results, recovery selected and contact intent. Exclude free text, phone numbers, email, precise addresses, DM content and stable resident identifiers from analytics. Distinguish requests accepted by the server from button clicks; don't delay or break native contact links if recording fails. Rate-limit and deduplicate accidental repeats; report that bot/repeat traffic can inflate counts.
3. METRIC-01c: optional resident-reported contact outcome (reached provider / not reached / found help) with clear self-report labeling. A click is not a sent text, answered call, quote, booking or successful connection. Real booking claims need separate evidence and participation.
4. REV-01: keep willingness-to-pay validation open until useful inquiries and voluntary business commitments exist. No revenue forecast derived from traffic, listing count or competitor price cards.

## UX improvement from audit

No-result recovery previously offered remove-search, broaden-service and clear-all. It now adds Check other cities preserving the exact category/service/query, with an explicit coverage caution, and a local all-listings recovery preserving city when no service is active. No nearby coverage inferred. Acceptance requires live navigation to preserve filters.
