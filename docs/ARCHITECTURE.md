# MoHoLocal Architecture

> **Version:** March 2026
> **Status:** Current
> **Sources:** CLAUDE.md · MoHoLocal Master Playbook and Product Bible

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript / TSX |
| Database | Supabase (PostgreSQL) |
| Hosting | Cloudflare Pages |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |

### Build Configuration

```
Build command:    npx @cloudflare/next-on-pages@1
Output directory: .vercel/output/static
Compatibility:    nodejs_compat
Node version:     18 or 20
```

### Edge Runtime Requirement

Every page and route handler **must** include:

```ts
export const runtime = 'edge'
```

This is non-negotiable for Cloudflare Pages compatibility.

---

## 2. Deployment Pipeline

```
Claude commits code
  → pushes to github.com/dsovan2004-beep/moho-app (main branch)
    → Cloudflare auto-build triggered
      → moholocal.com live
```

**Fallback deployment** (manual trigger):

```bash
curl -d "" "<cloudflare-deploy-hook>"
```

**Production branch:** `main`
**Cloudflare project:** `moho-app`

---

## 3. Information Architecture

### Primary Navigation

| Route | Module |
|-------|--------|
| `/` | Home — city hub, featured businesses, events, stats |
| `/directory` | Business Directory |
| `/community` | Community Board |
| `/events` | Events Calendar |
| `/lost-and-found` | Lost & Found Pets |
| `/new-resident` | New Resident Guide |

### Business Routes

| Route | Description |
|-------|-------------|
| `/business/[id]` | Business detail page |
| `/[city]/[category]` | SEO category landing pages |
| `/submit-business` | Add a business listing |
| `/claim-listing/[id]` | Claim ownership of a listing |
| `/report-listing/[id]` | Report an inaccurate listing |
| `/suggest-business` | Suggest a business for review |

### Community Routes

| Route | Description |
|-------|-------------|
| `/community/[id]` | Individual community post |
| `/post-lost-found` | Create a lost/found pet post |

### Auth Routes

| Route | Description |
|-------|-------------|
| `/login` | User login |
| `/register` | User registration |
| `/auth/callback` | OAuth callback handler |
| `/profile` | User profile |

### Admin Routes

| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard (founder only) |

### Future Navigation Layer

- Activity Feed
- Weekly Digest
- Local Deals

---

## 4. UX Architecture Principles

### 4.1 Sticky Local Context

Users should always know which city they are browsing. City context is surfaced on every page through branding, chips, and URL structure.

### 4.2 Search-First Discovery

The product supports both browsing (by category/city) and search (by keyword intent). Both paths must be fast and mobile-friendly.

### 4.3 Feed-Like Recency for Engagement

Over time, the Home page should evolve toward a combined local activity stream — not just a static landing page.

### 4.4 Contribution Entry Points

Users should always have visible ways to: **post · suggest · report · claim**

### 4.5 Empty States Must Guide Action

Every empty state should suggest a next step. Never show a blank page.

---

## 5. City Branding

Each city has a canonical gradient and chip color used consistently across all pages.

| City | Gradient | Chip |
|------|----------|------|
| Mountain House | `linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)` | `bg-blue-50 text-blue-700` |
| Tracy | `linear-gradient(135deg,#14532d 0%,#15803d 100%)` | `bg-green-50 text-green-700` |
| Lathrop | `linear-gradient(135deg,#581c87 0%,#7e22ce 100%)` | `bg-purple-50 text-purple-700` |
| Manteca | `linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)` | `bg-orange-50 text-orange-700` |

---

## 6. Architecture for Future Acquisition

MoHoLocal is designed as an acquirable system, not just a city website.

### Attractive Characteristics for Acquirers

- repeatable city-launch model
- structured local business graph
- local engagement data
- scalable content operations with AI
- monetization hooks already embedded
- community + directory + events in one stack

### Likely Acquirer Profiles

- local media groups
- community software platforms
- proptech / neighborhood platforms
- vertical AI or local commerce platforms
- regional publishers
- location intelligence products

### What Makes the Asset Valuable

- clean local data
- active local community
- repeat visits
- business relationships
- monetization proof
- replicable operating model

### Design Rule for Acquisition Readiness

> Everything should be designed so the same stack can launch another city without rebuilding the product.

---

## 7. Known Gotchas

| Issue | Notes |
|-------|-------|
| GitHub API blocked in cowork VM | Use `git push https://TOKEN@github.com/...` directly |
| Supabase REST blocked in cowork VM | Use `getSupabaseClient()` factory, not direct REST calls |
| Edge runtime required | All pages must have `export const runtime = 'edge'` |
| Tailwind dynamic classes break builds | Never use string-interpolated class names |
| RLS policies required | All tables need Row Level Security policies |
| Storage bucket policies required | `pet-images` and `community-images` buckets need policies |
| Always use ADD COLUMN IF NOT EXISTS | For safe schema migrations |
| Normalize status column | Use `approved` / `pending` / `rejected` consistently |
| PawBoost blocked by proxy | Cannot scrape lost pet data from PawBoost |

---

## 8. Supabase Configuration

| Property | Value |
|----------|-------|
| Project | `moholocal-db01` |
| URL | `https://ozjlfgipfzykzrjakwzb.supabase.co` |

### Storage Buckets

| Bucket | Used By |
|--------|---------|
| `pet-images` | Lost & Found photos |
| `community-images` | Community post photos |

### Supabase Usage Rules

- Never call `createClient()` at module scope
- Always use `getSupabaseClient()` factory inside functions/handlers
- All public directory queries must include `.eq('status', 'approved')`
- RLS policies must be present on all tables

---

*Last updated: March 2026*
