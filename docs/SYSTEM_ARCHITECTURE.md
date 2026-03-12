# MoHoLocal — System Architecture

> **Audience:** Engineers, technical reviewers, and acquirers
> **Last updated:** March 2026

---

## Overview

MoHoLocal is a hyperlocal community directory serving Mountain House, Tracy, Lathrop, and Manteca in San Joaquin County, CA. The platform is built as a lean, scalable Next.js application deployed to Cloudflare's global edge network backed by Supabase as its managed database and auth layer.

The architecture prioritizes speed, SEO, and simplicity over complexity. There are no microservices, no job queues, and no separate API servers. Everything runs as a single Next.js application at the edge.

---

## Platform Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15 (App Router) | All pages use Edge Runtime |
| Language | TypeScript / TSX | Strict typing throughout |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, no CSS modules |
| Database | Supabase (PostgreSQL) | Managed, hosted on `ozjlfgipfzykzrjakwzb.supabase.co` |
| Auth | Supabase Auth | Email/password + magic link |
| Storage | Supabase Storage | `pet-images` and `community-images` buckets |
| Hosting | Cloudflare Pages | Edge CDN, global distribution |
| Build | `@cloudflare/next-on-pages@1` | Compiles Next.js for Cloudflare Workers |
| Repo | GitHub | `github.com/dsovan2004-beep/moho-app` |

---

## Deployment Pipeline

```
Developer commit
  → git push origin main
    → GitHub webhook fires
      → Cloudflare Pages auto-build triggers
        → npx @cloudflare/next-on-pages@1
          → Output: .vercel/output/static
            → Deployed to moholocal.com
```

**Build command:** `npx @cloudflare/next-on-pages@1`
**Output directory:** `.vercel/output/static`
**Compatibility flag:** `nodejs_compat`
**Node version:** 18 or 20

Fallback trigger (manual):

```bash
curl -d "" "<cloudflare-deploy-hook>"
```

---

## Application Structure

```
app/
  page.tsx                        # Homepage
  layout.tsx                      # Root layout + nav
  directory/
    page.tsx                      # Full business directory
  business/
    [id]/page.tsx                 # Business detail page
  [city]/
    page.tsx                      # City landing page
    [category]/page.tsx           # City + category SEO page
  events/
    page.tsx                      # Events calendar
  community/
    page.tsx                      # Community board
    [id]/page.tsx                 # Post detail
  lost-and-found/
    page.tsx                      # Lost & found listings
  post-lost-found/
    page.tsx                      # Submit lost & found post
  submit-business/
    page.tsx                      # Business submission form
  suggest-business/
    page.tsx                      # Suggest a business form
  report-listing/
    [id]/page.tsx                 # Report a listing
  new-resident/
    page.tsx                      # New resident guide
  login/page.tsx
  register/page.tsx
  auth/callback/page.tsx
  profile/page.tsx
  claim-listing/[id]/page.tsx
  admin/page.tsx
components/
  CommunityNewPost.tsx
  ReviewSection.tsx
  ... (shared UI components)
lib/
  supabase.ts                     # getSupabaseClient() factory
```

---

## Edge Runtime Strategy

Every page in the application exports:

```ts
export const runtime = 'edge'
```

This is a hard requirement for Cloudflare Pages compatibility. Pages without this directive will fail to build or deploy.

**Why edge runtime matters:**
- Pages run at Cloudflare's global edge nodes — not a single origin server
- Eliminates cold starts
- Dramatically reduces TTFB for users in the 209 area
- Required for Cloudflare Workers environment

---

## Supabase Client Pattern

Supabase clients must **never** be created at module scope. All clients must be instantiated inside server functions using the factory:

```ts
// ✅ Correct
async function getBusinesses() {
  const supabase = getSupabaseClient()
  return supabase.from('businesses')...
}

// ❌ Wrong — breaks edge runtime
const supabase = createClient(url, key)
```

The factory is defined in `lib/supabase.ts` and handles environment variable access safely within the edge request lifecycle.

---

## Multi-City Architecture

City is always a **data field**, never a code branch. The same codebase serves all cities without modification.

**Canonical cities:**

| City | Slug | Status |
|------|------|--------|
| Mountain House | `mountain-house` | ✅ Live |
| Tracy | `tracy` | Phase 6 |
| Lathrop | `lathrop` | Phase 6 |
| Manteca | `manteca` | Phase 6 |

**City branding (CSS gradients):**

| City | Gradient |
|------|----------|
| Mountain House | `linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)` |
| Tracy | `linear-gradient(135deg,#14532d 0%,#15803d 100%)` |
| Lathrop | `linear-gradient(135deg,#581c87 0%,#7e22ce 100%)` |
| Manteca | `linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)` |

To launch a new city: add the city name to canonical lists, define gradient + chip color, seed 40+ businesses, and the existing routes automatically serve it.

---

## AI Development Workflow

MoHoLocal uses a Claude coworker for autonomous engineering tasks. The coworker operates with the following boundaries:

**Coworker may do autonomously:**
- Write and modify application code
- Fix bugs and improve UI
- Commit and push to GitHub main
- Trigger Cloudflare deployment

**Founder-only operations (coworker may not do):**
- Modify CLAUDE.md
- Modify environment variables or secrets
- Execute SQL directly on the database
- Modify Cloudflare or Supabase infrastructure

This separation ensures that the AI operates at the application layer only, with no access to infrastructure or credentials.

---

## Security Architecture

**Row Level Security (RLS):** All Supabase tables have RLS policies enabled. Public reads are restricted to `status = 'approved'` records on the businesses table.

**Status filtering rule:** Every public-facing query against the `businesses` table must include:

```ts
.eq('status', 'approved')
```

Failure to include this filter would expose pending, rejected, or draft listings to the public.

**Write patterns:** All user-submitted content enters the system with `status: 'pending'` and requires founder approval before becoming publicly visible.

| Form | Table | Default status |
|------|-------|---------------|
| Submit Business | `businesses` | `pending` |
| Suggest Business | `business_suggestions` | `pending` |
| Report Listing | `listing_reports` | `pending` |
| Post Lost & Found | `lost_and_found` | (type required) |
| Community Post | `community_posts` | auth-gated |

---

*For full schema details, see [DATA_MODEL.md](./DATA_MODEL.md).*
*For deployment specifics, see [DEPLOYMENT.md](./DEPLOYMENT.md).*
