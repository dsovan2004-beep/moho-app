# MoHoLocal — Deployment Guide

> **Audience:** Engineers and founder
> **Last updated:** March 2026

---

## Deployment Architecture

MoHoLocal is deployed on **Cloudflare Pages** as a statically compiled Next.js application targeting the Cloudflare Workers runtime. There is no origin server — all pages execute at the edge.

```
GitHub (main branch)
  ↓ push event
Cloudflare Pages
  ↓ build trigger
npx @cloudflare/next-on-pages@1
  ↓ compile
.vercel/output/static
  ↓ deploy
Cloudflare global edge network
  ↓ serve
moholocal.com
```

---

## Deployment Flow

### Step 1 — Push to main

```bash
git push origin main
```

Or using the token-authenticated URL (for cowork VM where standard SSH/push may be blocked):

```bash
git push https://TOKEN@github.com/dsovan2004-beep/moho-app.git HEAD:main
```

### Step 2 — Cloudflare auto-build

Cloudflare Pages detects the push via GitHub webhook and automatically triggers a build. No manual action required.

**Build command:**

```bash
npx @cloudflare/next-on-pages@1
```

**Output directory:**

```
.vercel/output/static
```

**Compatibility flag:**

```
nodejs_compat
```

**Node version:** 18 or 20

### Step 3 — Build completes

Build typically completes in 2–4 minutes. Monitor in the Cloudflare Pages dashboard:
`https://dash.cloudflare.com → Pages → moho-app → Deployments`

### Step 4 — Live

The new version is live at `https://www.moholocal.com` immediately after build succeeds.

---

## Manual Deployment Trigger

If the GitHub webhook fails or a build needs to be triggered manually:

```bash
curl -d "" "<cloudflare-deploy-hook>"
```

The deploy hook URL is in the Cloudflare Pages dashboard under **Settings → Builds & deployments → Deploy hooks**.

This is a founder-only credential — not stored in code.

---

## Environment Variables

All environment variables are set in the **Cloudflare Pages dashboard** under:
`Settings → Environment variables`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL — `https://ozjlfgipfzykzrjakwzb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key for client-side queries |

**Important rules:**

- Never hardcode environment variables in source code
- Never commit `.env` or `.env.local` files to the repository
- The `NEXT_PUBLIC_` prefix is required for variables that must be available in the browser/edge context
- Adding or changing environment variables requires a new build to take effect

---

## Repository Configuration

| Setting | Value |
|---------|-------|
| Repository | `github.com/dsovan2004-beep/moho-app` |
| Production branch | `main` |
| Cloudflare project name | `moho-app` |
| Custom domain | `moholocal.com` |

All pushes to `main` trigger production deployments. There is no staging environment currently.

---

## Build Requirements

For a successful build, all pages must satisfy:

1. **Edge runtime export** — every page file must include:

```ts
export const runtime = 'edge'
```

2. **No module-scope Supabase** — `createClient()` must never be called at the top level of a module; use `getSupabaseClient()` inside async functions only.

3. **No dynamic Tailwind classes** — Tailwind class names must be complete strings. Template literals that assemble class names at runtime break the build:

```ts
// ❌ Breaks build
const cls = `bg-${color}-500`

// ✅ Safe
const cls = isActive ? 'bg-blue-500' : 'bg-gray-500'
```

4. **TypeScript must compile** — no type errors. Run `tsc --noEmit` before pushing if in doubt.

---

## Rollback

Cloudflare Pages retains previous deployment versions. To roll back:

1. Go to Cloudflare Pages dashboard → `moho-app` → Deployments
2. Find the previous successful deployment
3. Click **Rollback to this deployment**

This is instant and requires no code changes.

Alternatively, revert the commit on GitHub and push — this triggers a new build from the reverted code.

---

## Post-Deployment Verification

After each deployment, verify:

- [ ] Homepage loads at `moholocal.com`
- [ ] Directory page loads with business listings
- [ ] At least one business detail page loads correctly
- [ ] City landing page loads (e.g., `/mountain-house`)
- [ ] No JavaScript errors in browser console
- [ ] Mobile layout renders correctly

---

*For architecture details, see [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md).*
*For operations runbook, see [OPERATIONS.md](./OPERATIONS.md).*
