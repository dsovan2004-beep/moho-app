# MoHoLocal Playbook V1 — Product & Operations

> **Phase:** Foundation (Phases 1–3)
> **Goal:** Stable platform with high data quality and basic contribution loops
> **Source:** MoHoLocal Master Playbook and Product Bible

---

## Overview

Playbook V1 covers the operational and engineering standards for the Foundation phase of MoHoLocal. This is the period when the platform is establishing its utility, trust, and core data quality. No monetization. No growth hacks. Just a reliable, clean, trustworthy local directory with working community features.

---

## Operational Roles

### Founder Responsibilities

The founder (guruuly) owns:

- Approve product direction and priorities
- Manage local quality standards
- Run sensitive database and infrastructure changes
- Execute all SQL migrations
- Run seed scripts
- Decide monetization timing
- Modify CLAUDE.md and environment variables

### Coworker (Claude) Responsibilities

The Claude coworker owns:

- Implement code changes
- Fix bugs
- Improve UX
- Create small incremental features
- Produce commit messages and patch summaries
- Push to GitHub main branch
- Trigger Cloudflare deployments

### Guardrails

- Do not overengineer
- Protect production data
- Preserve local usability
- Prefer simple solutions
- Never modify CLAUDE.md, environment variables, or infrastructure

---

## Engineering Standards

### Code Requirements

Every page file must include:

```ts
export const runtime = 'edge'
```

No exceptions. This is required for Cloudflare Pages compatibility.

### Supabase Usage Pattern

Never call `createClient()` at module scope. Always use the factory:

```ts
// ✅ Correct
async function getData() {
  const supabase = getSupabaseClient()
  const { data } = await supabase.from('businesses')...
}

// ❌ Wrong
const supabase = createClient(...)  // module scope
```

### Status Filter Rule

All public business queries must filter by **both** approved status and verified flag:

```ts
.eq('status', 'approved')
.eq('verified', true)
```

Both conditions are required. Setting only one is a no-op — the business will not appear publicly. This applies to: `/directory`, `/business/[id]`, `/[city]/page.tsx`, `/[city]/[category]/page.tsx`, homepage popular and featured sections, and the sitemap.

### Category Validation

Only the 9 canonical categories are valid. Any form or import that writes to `businesses.category` must use exactly these values:

```
Restaurants | Health & Wellness | Beauty & Spa | Home Services
Automotive | Pet Services | Real Estate | Education | Retail
```

### City Validation

Only the 5 canonical cities are valid:

```
Mountain House | Tracy | Lathrop | Manteca | Brentwood
```

---

## Data Quality Standards

### Approved Listings Only

The public directory never shows unapproved content. Only the admin panel shows pending or rejected listings.

### Duplicate Prevention

Before inserting a new business, check for existing `(name, city)` duplicates. SQL:

```sql
SELECT name, city, COUNT(*)
FROM businesses
WHERE status = 'approved'
GROUP BY name, city
HAVING COUNT(*) > 1;
```

### Category Normalization

Aliases from old data or external imports must be normalized:

| Alias | Canonical |
|-------|-----------|
| Childcare | Education |
| Tutoring | Education |
| Daycare | Education |
| Preschool | Education |
| Auto Services | Automotive |
| Auto Repair | Automotive |
| Car Services | Automotive |

### Contact Completeness

A listing is considered "complete" when it has at minimum: name, category, city, address, and at least one of phone, website, or contact_email.

---

## QA Checklist (Before Every Handoff)

Run through this checklist before committing any new page or feature:

- [ ] JSX syntax is valid (no unclosed tags, correct prop types)
- [ ] `export const runtime = 'edge'` is present
- [ ] All business queries include `.eq('status', 'approved').eq('verified', true)`
- [ ] `getSupabaseClient()` called inside functions only (not module scope)
- [ ] Page is mobile responsive (tested at 375px width)
- [ ] Loading states present for async data
- [ ] Error states present for failed queries
- [ ] `notFound()` called for invalid IDs or slugs
- [ ] No hardcoded Supabase keys or tokens in source code
- [ ] Tailwind classes are static (no string interpolation)

---

## Content Sources

Approved research sources for business data and events:

- `mhcsd.ca.gov` — Mountain House Community Services District
- `cityoftracy.org` — City of Tracy
- `ci.lathrop.ca.us` — City of Lathrop
- `mantecacity.org` — City of Manteca
- Tracy Press (`ttownmedia.com`)
- `209times.com`
- Google Maps
- Yelp
- Eventbrite
- CA Secretary of State

**Never scrape:** private Facebook groups, Nextdoor, or any login-required websites.

---

## Commit Convention

All commits follow this format:

```
type: short description

- bullet points for individual changes
- keep it factual and clear
```

Types: `feat` · `fix` · `docs` · `refactor` · `style` · `chore`

Example:

```
fix: add status filter to business detail page

- getBusiness() now filters .eq('status','approved')
- unapproved businesses return 404 instead of displaying
```

---

## Deployment Process

1. Claude commits fixed/updated files to the local git repo
2. Claude pushes to `github.com/dsovan2004-beep/moho-app` main branch
3. Cloudflare auto-builds and deploys to `moholocal.com`
4. Deployment is live within ~2 minutes

**Note on git lock files:** The Cowork VM cannot delete lock files on the Mac-mounted repo directory. If `.git/index.lock` or `.git/HEAD.lock` block a commit, run this from your **Mac terminal** to clear all locks and commit in one shot:
```bash
rm -f ~/Desktop/MoHoLocal/moho-app-scaffold/.git/*.lock 2>/dev/null; git add <files> && git commit -m "message" && git push origin main
```

---

## Phase 1–3 Definition of Done

The Foundation phase is complete when:

- All 9 canonical categories are functional with real businesses
- All 4 cities have at least 40 approved listings each
- Homepage, directory, business detail, community, events, and lost & found all pass QA
- No unapproved businesses are publicly accessible
- Mobile experience is smooth on iOS Safari and Android Chrome
- Suggest, Report, and Claim flows all write to the correct tables

---

*Last updated: March 2026*
