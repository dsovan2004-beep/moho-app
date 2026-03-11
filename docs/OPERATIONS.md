# MoHoLocal — Operations Guide

> **Audience:** Founder and Claude coworker
> **Last updated:** March 2026

---

## Overview

MoHoLocal operates with a two-role model: a **founder** who controls infrastructure, database, and business decisions, and a **Claude coworker** who handles autonomous engineering work at the application layer.

This document defines what each role owns, what guardrails exist, and how day-to-day operations flow.

---

## Founder Responsibilities

The founder retains exclusive control over:

| Responsibility | Notes |
|---------------|-------|
| Database SQL execution | All schema changes and data migrations |
| Supabase configuration | RLS policies, storage buckets, project settings |
| Environment variables | All secrets stored in Cloudflare Pages dashboard |
| Cloudflare configuration | Domain, deploy hooks, build settings |
| CLAUDE.md modifications | Project operating rules — only founder may edit |
| Business approvals | Review and approve/reject pending listings |
| Content moderation | Community posts, reports, and flagged items |
| Monetization decisions | Featured listings, pricing, billing setup |

---

## Coworker Responsibilities

The Claude coworker operates autonomously within the application layer:

| Responsibility | Notes |
|---------------|-------|
| Application code | Next.js pages, components, utilities |
| Bug fixes | Identify root cause, apply fix, verify |
| UI improvements | Mobile responsiveness, loading/error states |
| Feature development | Following roadmap priorities |
| QA audits | Full platform audit with bug reports |
| Documentation | Keeping docs/ folder current |
| Git commits | Committing with descriptive messages |
| GitHub push | Pushing to main branch |
| Cloudflare deploy | Triggering builds when necessary |

---

## Guardrails

### Hard Limits — Coworker Must Never

- Modify `CLAUDE.md`
- Modify environment variables or secrets
- Execute SQL on the live database
- Modify Supabase schema directly
- Change Cloudflare build settings
- Create or modify storage bucket policies
- Store API keys or tokens in code or files
- Run seed scripts against the live database

### Required Rules — Always Enforced

- All pages must export `export const runtime = 'edge'`
- All public business queries must include `.eq('status', 'approved')`
- Use `getSupabaseClient()` inside functions only — never at module scope
- Only 9 canonical categories are valid (see DATA_MODEL.md)
- Only 4 canonical cities are valid: Mountain House, Tracy, Lathrop, Manteca
- SQL output must be provided as text for manual founder execution — never run directly

---

## Release Process

### Standard Release

```
1. Coworker writes or fixes code
2. Coworker runs QA self-check (edge runtime, status filters, categories, mobile)
3. Coworker commits with conventional commit message
4. Coworker pushes to main branch
5. Cloudflare auto-build triggers within ~30 seconds
6. Live site updated within ~2 minutes of push
```

### Conventional Commit Format

```
<type>: <short description>

Types:
  feat     — new feature
  fix      — bug fix
  chore    — maintenance, deps
  docs     — documentation
  refactor — code restructure (no behavior change)
  style    — formatting, CSS
  perf     — performance improvement
```

### Manual Deployment Trigger

If the GitHub push hook fails or a manual deploy is needed:

```bash
curl -d "" "<cloudflare-deploy-hook>"
```

The deploy hook URL is stored in the Cloudflare Pages dashboard (founder access only).

---

## Database Operations

All SQL must be written by the coworker and executed manually by the founder.

The coworker provides SQL in the following format:

```sql
-- Description of what this SQL does
-- Safe to run: yes/no and why

SELECT ...
UPDATE ...
```

Founder executes via the Supabase SQL Editor at:
`https://supabase.com/dashboard/project/ozjlfgipfzykzrjakwzb/sql`

### Approved Database Operations

| Operation | Who |
|-----------|-----|
| Approve/reject business submissions | Founder via Supabase table editor |
| Normalize legacy data (category/city fields) | Founder via SQL provided by coworker |
| Add new columns | Founder — always use `ADD COLUMN IF NOT EXISTS` |
| Create new tables | Founder |
| Update RLS policies | Founder |
| Seed new data | Founder runs seed scripts from local machine |

---

## Content Moderation

All user-submitted content enters the system as `status: 'pending'` and is invisible to the public until approved.

**Review queues (Supabase table editor):**

| Table | What to review |
|-------|---------------|
| `businesses` | Pending business submissions and suggestions |
| `business_suggestions` | Suggested businesses from residents |
| `listing_reports` | Reports against existing listings |
| `community_posts` | Flagged or reported community posts |
| `lost_and_found` | New lost & found posts |

**Approval flow:**
1. Open Supabase dashboard → Table Editor
2. Filter by `status = 'pending'`
3. Review content for quality and accuracy
4. Set `status` to `'approved'` or `'rejected'`
5. Approved businesses become immediately visible on the site

---

## Monitoring & Alerts

Current monitoring is manual. Recommended checks:

| Check | Frequency |
|-------|-----------|
| Cloudflare Pages build status | After each push |
| Supabase dashboard — pending queue | Daily |
| Live site spot-check (homepage, directory) | After each deploy |
| Lost & found — new posts | Daily |

Automated monitoring (error tracking, uptime alerts) is a Phase 4 target.

---

## Known Operational Gotchas

| Issue | Workaround |
|-------|-----------|
| GitHub API blocked in cowork VM | Use `git push https://TOKEN@github.com/...` |
| Supabase REST blocked in cowork VM | Provide SQL as text for manual execution |
| `.git/index.lock` or `HEAD.lock` present | Use `GIT_INDEX_FILE=/tmp/...` + `git commit-tree` workaround |
| Tailwind dynamic classes break builds | Use full class names only — no template string assembly |
| PawBoost blocked by proxy | Skip — use other lost pet sources |

---

*For deployment details, see [DEPLOYMENT.md](./DEPLOYMENT.md).*
*For full project rules, see [CLAUDE.md](../CLAUDE.md).*
