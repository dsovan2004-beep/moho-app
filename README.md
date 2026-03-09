# MoHoLocal

The hyperlocal community directory for Mountain House, Tracy, Lathrop, and Manteca — San Joaquin County, CA.

**Live site:** [moholocal.com](https://www.moholocal.com)

---

## Stack

- **Next.js 15** (App Router, Edge Runtime)
- **TypeScript / TSX**
- **Supabase** (PostgreSQL + Auth + Storage)
- **Cloudflare Pages**
- **Tailwind CSS**
- **shadcn/ui**

## Build

```bash
npx @cloudflare/next-on-pages@1
```

Output: `.vercel/output/static`
Compatibility flag: `nodejs_compat`

## Deploy

Push to `main` → Cloudflare auto-builds and deploys to `moholocal.com`.

---

## Documentation

Architecture and product documentation are stored in the [`/docs`](./docs) folder.

| Document | Description |
|----------|-------------|
| [PRODUCT_BIBLE.md](./docs/PRODUCT_BIBLE.md) | Vision, mission, product thesis, core modules, AI strategy, and strategic moat |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Tech stack, deployment pipeline, routes, UX principles, city branding, and Supabase config |
| [DATA_MODEL.md](./docs/DATA_MODEL.md) | Full database schema — all tables, columns, constraints, and canonical values |
| [ROADMAP.md](./docs/ROADMAP.md) | 6-phase product roadmap, current sprint priorities, and success metrics |
| [PLAYBOOK_V1_PRODUCT.md](./docs/PLAYBOOK_V1_PRODUCT.md) | Product Playbook — Foundation phase engineering standards, QA checklist, data quality rules |
| [PLAYBOOK_V2_GROWTH.md](./docs/PLAYBOOK_V2_GROWTH.md) | Growth Playbook — growth loops, SEO, monetization, and city expansion model |

### QA Reports

Platform QA audit reports are stored in [`/docs/qa`](./docs/qa).

| File | Description |
|------|-------------|
| [2026-03-09-platform-qa-audit.md](./docs/qa/2026-03-09-platform-qa-audit.md) | Full platform audit — 2 HIGH bugs fixed, 1 MEDIUM fixed, 15 flows verified |
| [TEMPLATE.md](./docs/qa/TEMPLATE.md) | QA audit report template for future audits |

---

## Key Rules

- All pages require `export const runtime = 'edge'`
- All public business queries require `.eq('status', 'approved')`
- Use `getSupabaseClient()` inside functions only — never at module scope
- Only 9 canonical categories and 4 canonical cities are valid
- Do not modify `CLAUDE.md`, environment variables, or infrastructure

---

## Repository

`github.com/dsovan2004-beep/moho-app` — production branch: `main`
