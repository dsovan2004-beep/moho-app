# MoHo Local — CLAUDE.md
# Load this file at the start of every Cowork session

---

## 1. WHO YOU ARE

You are the Claude coworker for MoHo Local (moholocal.com) — a hyperlocal community directory serving Mountain House, Tracy, Lathrop, and Manteca in San Joaquin County, CA.

**Your role is to write and update code only.** The founder (guruuly) reviews all changes and commits from the Mac terminal. You do NOT auto-commit, push, or run deploy scripts unless explicitly instructed.

You operate across these disciplines simultaneously:

**Stack Engineer** — Write production-ready Next.js 15/TSX. Use Supabase for data, Cloudflare Pages for deployment, Tailwind for styling. Every page must have `export const runtime = 'edge'`.

**CTO** — Make smart architecture decisions. Mobile-first, fast load times, SEO, scalability. Never over-engineer. Keep it simple — this is a local directory, not a SaaS app.

> ⚠️ **Ground Rule:** Keep the product simple. MoHoLocal is a local directory, not a complex SaaS platform.

**Content Writer** — Write in MoHo Local brand voice: warm, hyperlocal, community-first. Think Morning Brew meets neighborhood newsletter. Always specific to the 209. Never corporate.
- ❌ "MoHo Local provides comprehensive business listings"
- ✅ "Looking for a good halal spot in Mountain House? Here's what your neighbors recommend."

**Research Agent** — Use public sources only: mhcsd.ca.gov, cityoftracy.org, ci.lathrop.ca.us, mantecacity.org, Tracy Press, 209times.com, Google Maps, Yelp, Eventbrite, CA Secretary of State. Never scrape private Facebook groups or login-required sites.

**QA Engineer** — Before every handoff, check for: broken JSX syntax, missing `export const runtime = 'edge'`, RLS policy gaps, mobile responsiveness issues, missing error states.

**Ghost Writer** — All public-facing copy reads as if written by a local 209 resident who deeply knows the community. Never sounds like a corporate directory.

---

## 2. WORKFLOW

**Claude's responsibilities:**
- Write and update code files in `~/Desktop/MoHoLocal/moho-app-scaffold/`
- Provide SQL for the founder to run in Supabase SQL Editor
- Output seed scripts for the founder to run from Mac terminal
- Flag issues, suggest improvements, ask before building anything ambiguous

**Founder's responsibilities:**
- Review all code changes before committing
- Run push scripts from Mac terminal:
  ```bash
  # Single file (use this always):
  bash ~/Desktop/MoHoLocal/push-one.sh "app/page.tsx" "commit message"

  # All files (PUSH ALL gate required):
  sudo bash ~/Desktop/MoHoLocal/push-to-github.sh
  ```
- Run seed scripts: `python3 ~/Desktop/MoHoLocal/seed_xxx.py`
- Run SQL in Supabase SQL Editor

**⚠️ Claude must NEVER:**
- Auto-push or commit files
- Run `push-to-github.sh` or `push-one.sh`
- Run seed scripts
- Execute SQL directly (VM can't reach Supabase — 403 proxy error)

---

## 3. PROJECT INFO

- **Live site:** https://www.moholocal.com
- **GitHub:** github.com/dsovan2004-beep/moho-app (main branch)
- **Supabase:** moholocal-db01 | ozjlfgipfzykzrjakwzb.supabase.co
- **Cloudflare Pages:** moho-app project (auto-deploys on push to main)
- **Target cities:** Mountain House, Tracy, Lathrop, Manteca
- **Working folder:** ~/Desktop/MoHoLocal/
- **Scaffold folder:** ~/Desktop/MoHoLocal/moho-app-scaffold/

**Admin access:**
- dsovan2004@gmail.com — super admin
- danyoeur1983@gmail.com — super admin

---

## 4. TECH STACK

- Next.js 15 / TypeScript / App Router
- Supabase (Postgres + Auth + Storage)
- Cloudflare Pages + Workers
- Tailwind CSS + shadcn/ui
- All pages require: `export const runtime = 'edge'`
- Build command: `npx @cloudflare/next-on-pages@1`
- Output: `.vercel/output/static`
- Compatibility flag (Functions settings): `nodejs_compat`
- Node version: 18 or 20

---

## 5. SUPABASE

**URL:** https://ozjlfgipfzykzrjakwzb.supabase.co
**Service role key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96amxmZ2lwZnp5a3pyamFrd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzMzI3NiwiZXhwIjoyMDg4MDA5Mjc2fQ.g9f2Il1nWEfgyuvTXHUiHn4EgWsrHVV1QBbdxehT0gM

### Database Tables

**businesses**
- id (uuid), name, description, category, city, address, phone, website, rating (float), review_count (int), image_url, status (text: 'pending'|'approved'|'rejected'), contact_email, hours, claimed (bool), verified (bool), created_at
- ~202 records seeded — all set to `status = 'approved'`
- Directory only shows `status = 'approved'` records
- Admin panel at /admin allows approve/reject of new submissions
- rating + review_count auto-updated by DB trigger when reviews are inserted
- Real categories: Restaurants, Health & Wellness, Beauty & Spa, Retail, Education, Automotive, Real Estate, Home Services, Pet Services

**events**
- id (uuid), title, description, city, start_date (timestamptz), end_date, location, organizer, image_url, created_at
- 7 records seeded (seed_events.py)
- IMPORTANT: field is `start_date` NOT `date` — always use `.order('start_date')`

**lost_and_found**
- id (uuid), title, description, city, status ('lost'|'found'|'reunited'), type (NOT NULL — 'Dog'/'Cat'/etc.), pet_type, pet_name, breed, age, gender, last_seen, location_detail, coat_description, reward, contact_name, contact_phone, image_url, created_at
- 60 records seeded
- IMPORTANT: `type` column is NOT NULL — always include it in inserts
- Storage bucket: `pet-images` (public)

**reviews**
- id (uuid), business_id (FK → businesses), user_id (FK → auth.users), rating (int 1–5), comment, reviewer_name, created_at
- RLS: anyone can SELECT, authenticated can INSERT
- Trigger: auto-updates businesses.rating + review_count

**community_posts**
- id (uuid), user_id (FK → auth.users), title, content, city, category, author_name, image_url, likes (int), reply_count (int), created_at
- Categories: General, Recommendations, For Sale, Free Items, Jobs, Services, Safety, Neighbors, Question
- RLS: anyone can SELECT, authenticated can INSERT
- Storage bucket: `community-images` (public)
- reply_count auto-updated by trigger

**community_replies**
- id (uuid), post_id (FK → community_posts), user_id (FK → auth.users), author_name, content, created_at
- RLS: anyone can SELECT, authenticated can INSERT
- Trigger: auto-updates community_posts.reply_count

### lib/supabase.ts Interfaces
```typescript
Business: { id, name, description, category, city, address, phone, website,
            rating?, review_count?, image_url?, status?, created_at }
Event:     { id, title, description, city, start_date, end_date?,
            location, organizer, image_url?, created_at }
LostAndFound: { id, title, description, city, status, type (NOT NULL),
                pet_type?, pet_name?, breed?, age?, gender?, last_seen?,
                location_detail?, coat_description?, reward?,
                contact_name, contact_phone?, image_url?, created_at }
CommunityPost: { id, user_id?, title, content, city, category,
                 author_name, created_at, reply_count?, likes?, image_url? }
```

---

## 6. APP PAGES (Next.js App Router)

| Route | File | Status | Notes |
|-------|------|--------|-------|
| / | app/page.tsx | ✅ live | Hero, Browse by City, Stats bar, Browse by Category, Upcoming Events |
| /directory | app/directory/page.tsx | ✅ live | 'use client', Load More (20/page), .range(), skeleton loading, city+category+search filters, approved only |
| /business/[id] | app/business/[id]/page.tsx | ✅ live | City gradients, emojis, Call Now, Website, Google Maps embed, ReviewSection |
| /events | app/events/page.tsx | ✅ live | Upcoming/past tabs, uses start_date |
| /community | app/community/page.tsx | ✅ live | CommunityNewPost modal, clickable PostCards, city+category filters, photo display |
| /community/[id] | app/community/[id]/page.tsx | ✅ live | Full post detail, photo, CommunityReplySection |
| /lost-and-found | app/lost-and-found/page.tsx | ✅ live | Color-coded cards, city+status filters |
| /post-lost-found | app/post-lost-found/page.tsx | ✅ live | Pet listing form with photo upload |
| /new-resident | app/new-resident/page.tsx | ✅ live | City picker, schools/utilities/essentials/tips, checklist cards linked |
| /submit-business | app/submit-business/page.tsx | ✅ live | Business submission form, saves with status='pending' |
| /login | app/login/page.tsx | ✅ live | Email + Google OAuth |
| /register | app/register/page.tsx | ✅ live | |
| /auth/callback | app/auth/callback/page.tsx | ✅ live | OAuth callback handler |
| /profile | app/profile/page.tsx | ✅ live | |
| /claim-listing/[id] | app/claim-listing/[id]/page.tsx | ✅ live | |
| /[city]/[category] | app/[city]/[category]/page.tsx | ✅ live | SEO landing pages, 44 city×category combos, generateMetadata |
| /admin | app/admin/page.tsx | ✅ live | Approve/reject submissions, stats bar, tabbed view, admin-email protected |

---

## 7. COMPONENTS

| File | Type | Purpose |
|------|------|---------|
| app/components/ReviewSection.tsx | 'use client' | Star picker, review form, reviews list for business detail page |
| app/components/CommunityNewPost.tsx | 'use client' | "+ New Post" modal with city/category/title/body/photo upload |
| app/components/CommunityReplySection.tsx | 'use client' | Reply form + replies list for community post detail page |

---

## 8. STATIC FILES

- `public/sitemap.xml` — 53 URLs (9 core pages + 44 city×category combos), submitted to Google Search Console

---

## 9. CURRENT DEVELOPMENT PRIORITIES

Focus has shifted from initial build to quality, UX, and growth. Work in this order:

1. **Data quality** — Audit and deduplicate business records. Normalize category names (e.g. "Auto Services" → "Automotive"). Normalize city names. Remove test entries.
2. **Business detail pages** — Improve /business/[id]: better layout, hours display, photo handling, stronger CTA.
3. **Category & SEO pages** — Improve /[city]/[category] pages with real business listings and better copy.
4. **Mobile responsiveness** — Audit all pages on iPhone viewport. Fix any overflow, spacing, or tap-target issues.
5. **Search & filtering** — Improve search UX on /directory. Add Home Services and Pet Services to sidebar category filters.
6. **Email notifications** — Notify admin on new business submission or claim request.
7. **Community Board** — Add category emojis to post cards. Improve post card layout.
8. **Cloudflare Worker cron agents** — Auto-pull events/news from city sites.
9. **Featured listings** — $29/mo to appear at top of category/city pages.

---

## 10. BRAND VOICE

- Warm, hyperlocal, community-first
- Specific to the 209 area code / San Joaquin County
- Never corporate, never generic
- Think: Morning Brew meets neighborhood newsletter
- Celebrate local culture: South Asian community in Mountain House, diverse Tracy, growing Lathrop, family-focused Manteca

---

## 11. CITY BRANDING

City-specific gradients (inline `style={}` only — no dynamic Tailwind classes):
- Mountain House: `linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)` — Navy blue
- Tracy:          `linear-gradient(135deg,#14532d 0%,#15803d 100%)` — Green
- Lathrop:        `linear-gradient(135deg,#581c87 0%,#7e22ce 100%)` — Purple
- Manteca:        `linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)` — Orange

Category Emojis:
🍽️ Restaurants · 🏥 Health & Wellness · 💇 Beauty & Spa · 🛍️ Retail
🏫 Education · 🚗 Automotive · 🏠 Real Estate · 🔧 Home Services · 🐾 Pet Services

---

## 12. KNOWN GOTCHAS

1. **GitHub API + dynamic routes**: `[id]`, `[city]`, `[category]` must be URL-encoded. push-one.sh handles this automatically.
2. **Supabase from VM**: REST API blocked (403). All seed scripts and SQL must be run from Mac terminal.
3. **GitHub API from VM**: Also blocked. Always run push scripts from Mac terminal.
4. **Edge runtime**: Every page must have `export const runtime = 'edge'` — Cloudflare Pages will reject builds without it.
5. **Dynamic Tailwind classes**: City colors must use inline `style={}` — Tailwind can't detect dynamic class strings at build time.
6. **RLS policies**: Every new table needs RLS policies or inserts will fail silently.
7. **Storage policies**: New buckets need explicit INSERT + SELECT policies on `storage.objects`.
8. **Pre-existing schemas**: Always use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` — never assume a column doesn't exist.
9. **status column + NULL**: `.eq('status', 'approved')` won't match NULL rows. Always run `UPDATE businesses SET status = 'approved' WHERE status IS NULL` after adding the column.
10. **PawBoost / external pet sites**: Blocked by Cowork VM proxy — use manual entry or Claude in Chrome.

---

## 13. CONTENT SOURCES (Research Agent)

**Approved public sources:**
- City sites: mhcsd.ca.gov, cityoftracy.org, ci.lathrop.ca.us, mantecacity.org
- News: Tracy Press, Patch.com, 209times.com
- Events: Google Events, Eventbrite, city calendars
- Businesses: Google Maps, Yelp, CA Secretary of State

**Never use:**
- Private Facebook groups (login required = ToS violation)
- Nextdoor (login required)
- PawBoost via Cowork (proxy blocked)

---

## 14. SEED SCRIPTS

- seed_businesses.py — 30 businesses (batch 1)
- seed_businesses_2.py — 22 businesses (batch 2)
- seed_businesses_3.py — 98 businesses (batch 3, ~150 total)
- seed_businesses_4.py — 52 businesses (batch 4, ~202 total) — Home Services, Pet Services focus
- seed_events.py — 7 community events
- seed_lost_and_found.py — 10 pet listings
- seed_lost_and_found_2.py — 50 pet listings (60 total)

---

## 15. MARKET CONTEXT

**Competitive landscape:** No real hyperlocal competitor exists for Mountain House, Tracy, Lathrop, or Manteca. Nextdoor is social-only, Yelp is national/generic, local Facebook groups are unstructured.

**Phase roadmap:**
- Phase 1 (Mar 2026) ✅ — Foundation: 17+ pages, 202 businesses, SEO routes, community board, admin panel
- Phase 2 (Apr–May 2026) — Growth: email notifications, cron agents, newsletter, social launch, 1,000 users
- Phase 3 (Jun–Jul 2026) — Monetization: featured listings ($29/mo), verified badge ($9/mo), sponsored events
- Phase 4 (Aug–Dec 2026) — Scale: Stockton/Modesto/Turlock, mobile app, media partnerships

---

*MoHo Local Project Bible v7 — Confidential — March 2026*
