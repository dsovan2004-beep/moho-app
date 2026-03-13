# MoHoLocal — BIBLE.md
# Product Rules and Philosophy

This document defines the core principles of the MoHoLocal platform.

It exists to prevent AI agents and developers from making product decisions that conflict with the platform's mission.

**The rules in BIBLE.md override all automated behavior.**

This document is read-only. Only the founder may modify it.

---

## What MoHoLocal Is

MoHoLocal is an **AI-powered hyperlocal signal platform** that organizes real-world community information across multiple neighboring cities.

The platform collects signals from:
- Community flyers and event graphics
- Local event announcements
- School announcements
- Neighborhood groups and pages
- Local businesses
- Lost pet posts

Signals are processed through OCR extraction, signal classification, and human moderation before appearing publicly.

**The platform is designed to surface useful, positive, and community-building local information. It is not a news site.**

---

## Core Product Mission

> MoHoLocal helps neighbors discover what is happening around them.

The platform exists to strengthen community connection. It focuses on:

- Community events and gatherings
- Family and youth activities
- Local businesses and services
- Neighborhood updates
- Lost and found pets
- New resident discovery

If a piece of content does not help a neighbor connect, attend something, discover something, or help someone — **it does not belong on MoHoLocal.**

---

## Platform Identity

MoHoLocal is **not a newspaper.**

It is a **hyperlocal signal platform.**

The platform organizes community activity rather than reporting news. There are no journalists here. There are no crime blotters. There is no regional tragedy coverage. There is no politics.

MoHoLocal is the digital equivalent of a community bulletin board — the kind you find at the front of a library, a church, or a neighborhood rec center.

---

## Strict Content Rules

The following content types must **NEVER** appear on MoHoLocal under any circumstances:

- Crime reports
- Police incidents and press releases
- Violent news
- Regional tragedy coverage
- Political content of any kind
- Court cases
- Arrests
- Shootings or murders
- Gang activity
- Accident fatalities

This rule applies at every layer of the platform:

- RSS feed ingestion must filter these out before they enter the pipeline
- The OCR pipeline must not classify these as valid signals
- Moderators must reject any submission containing this content
- The AI agent must never suggest publishing this content

**Example:** Articles from 209times or Tracy Press that focus on crime, arrests, or violence must be filtered or discarded entirely — even if the same source also publishes positive community content.

---

## The Positive Signal Test

Before any content is approved or published, ask:

> Does this help a neighbor connect, attend something, discover something, or help someone?

If the answer is **yes** — it belongs on MoHoLocal.

If the answer is **no** — it does not.

This test applies to:
- Events
- Community posts
- Activity feed items
- Directory entries
- Lost and found posts

---

## Moderation Principle

```
Automation collects signals.
AI assists classification.
Humans approve signals.
```

No content should automatically publish without human moderation. Every signal — regardless of source — must enter the `community_submissions` table and receive explicit human approval before it appears publicly on the platform.

This rule has no exceptions.

---

## Signal Types

The platform currently supports these signal types:

| Signal Type | Description |
|-------------|-------------|
| `event` | Community event, class, market, clinic, celebration |
| `lost_pet` | Lost or found pet alert with location and contact info |
| `business_update` | New business opening, special offer, local business news |
| `community_tip` | Neighborhood update, recommendation, or community notice |
| `garage_sale` | Garage sale, estate sale, or free items announcement |

Signals must be categorized correctly during ingestion or moderation. Misclassified signals should be corrected before promotion, not after.

---

## City Coverage

Active cities:

- Mountain House
- Tracy
- Lathrop
- Manteca
- Brentwood

The architecture supports expansion into additional nearby cities without structural changes.

Future expansion candidates:

- Stockton
- Modesto
- Riverbank
- Oakdale
- Antioch
- Discovery Bay

Each new city should have a seeded business directory and a New Resident Guide before launch.

---

## Event Principle

**Events are the most valuable signals on the platform.**

High-value events include:
- Farmers markets
- Food truck nights
- School fundraisers and carnivals
- Sports clinics and youth leagues
- Community volunteer days
- Holiday celebrations
- Cultural festivals
- Pop-up shops and local markets

Every event record must include:
- Clear, readable title (no OCR garbage)
- Accurate start date
- Correct city
- Meaningful description
- Flyer image when available

Events with missing or garbled data should be cleaned before approval, not approved as-is.

---

## Lost Pet Principle

**Lost pets are urgent community signals and should be prioritized for visibility.**

A lost pet post reaches real neighbors who might have seen the animal. This is one of the highest-value things MoHoLocal can surface.

Every lost pet record should include:
- Pet type (dog, cat, bird, etc.)
- Pet name if known
- Last seen location
- Contact information for the owner
- Photo when available

Moderators should approve lost pet submissions quickly and accurately.

---

## Business Directory Principle

The directory exists to help residents discover local businesses that serve their community.

The directory should prioritize:
- Local small businesses and owner-operated shops
- Restaurants and cafes
- Health and wellness providers
- Family services and childcare
- Pet services
- Home services and trades
- Auto services

The directory must never become a spam listing directory. Generic national chains may be included for completeness but should not be prioritized over local businesses.

---

## Screenshot Signal Principle

Screenshots from community sources are a primary — and irreplaceable — signal source for MoHoLocal.

Screenshots may originate from:
- Facebook group posts
- Community flyers (physical or digital)
- School announcements
- Event graphics
- Neighborhood app posts

The OCR pipeline extracts text from these screenshots and submits the structured signal for moderation. Because OCR is imperfect, moderators must carefully review extracted titles, dates, and descriptions before approval.

**Moderation checklist for screenshot signals:**
- Is the title clean and readable?
- Is the date correct and in the future?
- Is the city correctly identified?
- Does the image show the event flyer (not Facebook chrome or a social media header)?
- Does the content pass the Positive Signal Test?

If any of these are wrong — fix it before approving, or reject and reprocess.

---

## AI Agent Behavior Rules

When the AI developer agent (Claude) is making product decisions, building features, or writing content for MoHoLocal, it must always prioritize:

1. **Community usefulness** — Does this help neighbors?
2. **Clarity** — Is this easy to understand and act on?
3. **Safety** — Does this avoid harmful or divisive content?
4. **Positive signal quality** — Does this meet the platform's content standards?

**Default behavior when uncertain:**

If the agent is uncertain whether a piece of content or a product decision belongs on MoHoLocal, it must **default to moderation review** rather than automatic publishing or automatic inclusion.

**The agent must never:**
- Publish content without moderation approval
- Surface crime, violence, political, or tragedy content
- Approve garbled OCR titles as final content
- Bypass the `community_submissions` staging table
- Modify secrets, credentials, or infrastructure config

---

## Summary of Non-Negotiables

| Rule | Non-Negotiable |
|------|---------------|
| No crime content | Ever |
| No political content | Ever |
| No auto-publishing | Ever |
| Human moderation required | Always |
| Positive Signal Test | Always |
| OCR quality check before approval | Always |
| Secrets never in documentation | Always |

---

## Founder Vision and Success Metric

MoHoLocal is being built as a scalable hyperlocal discovery platform that connects residents with local businesses, events, and community activity across neighboring cities.

The founder objective is to grow MoHoLocal into a profitable regional platform.

**Primary founder goal: Generate $1,000,000 in annual revenue within the next 6–12 months.**

---

## Primary Revenue Model

The fastest path to revenue for MoHoLocal is the local business discovery engine.

The platform already contains a seeded business directory across multiple cities. Revenue will be generated through:

- Featured business listings
- Sponsored placement in "Best Of" pages
- Sponsored event promotion
- Local advertising packages
- Business profile upgrades
- Lead generation for service providers

**Example pricing model:**

| Product | Price |
|---------|-------|
| Featured Listing | $49–$99 / month |
| Category Sponsorship | $199–$399 / month |
| Sponsored Events | $50–$200 / listing |
| Local Ads | $100–$500 / month |

With 200–500 paying local businesses across multiple cities, the platform can reach $1M in annual revenue.

---

## Growth Strategy

MoHoLocal grows through local discovery.

Key traffic sources:
- Local SEO pages (Best Of pages)
- Community signals and events
- Neighborhood discovery
- New Resident Guides
- Local business directory

AI development agents should prioritize building features that increase:
- Local search traffic
- Business visibility
- Discovery of local services
- Directory engagement
- City expansion

---

## High Priority Features for Platform Growth

AI agents should prioritize development work that directly supports revenue and growth:

- Directory discoverability
- Best Of category pages
- City SEO pages
- Business profile pages
- Featured listing system
- Sponsored placement logic
- Event promotion tools

These features directly support revenue generation and should be prioritized above all other work.

---

## Lower Priority Features

AI agents should avoid spending significant development time on features that do not contribute to growth or monetization:

- Complex social feeds
- Generic news aggregation
- Low-value UI experiments
- Features unrelated to local discovery

When deciding what to build next, the first question is always: **does this help a resident discover a local business, event, or community signal?** If not, it is low priority.

---

## Platform Principle

MoHoLocal exists to help residents discover local businesses, events, and community signals.

Businesses gain visibility. Residents gain useful local information. The platform succeeds when it connects these two groups efficiently and at scale.

---

---

## Growth Phase — Directory & Best Of Strategy

MoHoLocal's immediate growth strategy focuses on expanding the business directory and strengthening "Best Of" discovery pages. These two systems drive the majority of organic discovery and local search traffic.

Rather than adding new product features, the priority is increasing the density and quality of listings and ranking content so the platform becomes the most useful discovery tool for local residents.

The platform is no longer a prototype. Core features are functional across 5 cities. The next phase is growth through content density and search discoverability — not engineering expansion.

---

### Growth Lever 1 — Directory Seeding

The business directory is the foundation of the platform. Every additional listing increases the platform's utility for residents and its credibility with businesses.

**Directory expansion targets:**

| Phase | Target |
|-------|--------|
| Current | ~986 listings |
| Phase 1 | 1,500 listings |
| Phase 2 | 3,000+ listings |

Increasing directory density directly improves:
- Local search discoverability (more pages indexed by Google)
- User utility (more useful results when residents search)
- Business visibility (more businesses aware of the platform)
- Platform credibility (a denser directory signals an established platform)

Directory expansion is a **strategic priority**. Seeding effort should be continuous and should cover all supported cities evenly. No city should have a significantly thinner directory than others.

---

### Growth Lever 2 — Best Of Pages (SEO Discovery)

Best Of pages are one of the most important traffic acquisition systems on the platform.

These pages function as search entry points for residents looking for recommendations in their city. When a resident searches "best coffee in Mountain House" or "best preschools in Tracy", a well-structured Best Of page is the most likely result to capture that traffic.

**Examples of high-value Best Of pages:**

```
/best/coffee/mountain-house
/best/restaurants/tracy
/best/dentists/lathrop
/best/preschools/manteca
/best/hair-salons/brentwood
/best/pediatricians/mountain-house
/best/pizza/tracy
/best/auto-repair/manteca
```

Best Of pages should be generated for multiple categories across every supported city. Each page should be structured, SEO-optimized, and populated with real local listings from the directory.

These pages are not marketing content — they are structured discovery tools that directly serve residents and capture organic search traffic.

---

## Platform Growth Principle

MoHoLocal grows when residents discover useful local information and businesses gain visibility. The platform succeeds by connecting these two groups through searchable, structured local knowledge.

Growth comes from increasing useful local signals — businesses, events, and community information — rather than adding unnecessary product features.

Every engineering decision should be evaluated against this question:

> Does this help more residents discover local businesses, events, or community signals?

If the answer is no, it is not a growth priority.

---

## AI-Powered Local Signal Engine

MoHoLocal is an **AI-powered hyperlocal discovery platform** that continuously collects and organizes local signals across supported cities.

Rather than relying on manual curation, MoHoLocal uses AI systems to ingest signals from multiple sources simultaneously:

- Community submissions from residents
- Screenshot signal pipelines (flyers, event graphics, school announcements)
- Public event feeds and local calendars
- Business directory datasets and public business data

The AI layer classifies and structures this raw information into useful local knowledge:

- Business listings with category, location, and contact data
- Events with accurate dates, cities, and descriptions
- Lost and found pet alerts with location and owner contact
- Neighborhood activity and community tips
- New business openings and local business updates

This approach allows MoHoLocal to scale local discovery much faster than traditional directories that depend entirely on manual entry.

---

### Platform Operating Model

```
Automation collects signals
AI classifies and structures signals
Humans review and approve content before publication
```

This hybrid model ensures both **scale** and **quality**. The AI layer removes the bottleneck of manual signal discovery. The human moderation layer ensures only accurate, positive, community-appropriate content reaches residents.

Neither layer can be removed without degrading the platform. AI without moderation produces noise. Moderation without AI cannot scale.

---

### Platform Differentiation

Traditional directories rely on manual curation and static listings. Once created, a listing sits unchanged until someone manually updates it.

MoHoLocal uses AI to continuously discover and organize local information, creating a **living knowledge layer** for each city. Events are discovered as they are announced. New businesses are captured as they open. Community signals surface as neighbors share them.

This continuous signal collection is what separates MoHoLocal from a static business directory. The platform is not a snapshot of local life — it is a continuously updated local knowledge system.

---

## Data Moat

MoHoLocal's long-term competitive advantage is not its codebase — it is the continuously growing dataset of local signals and structured community knowledge that the platform accumulates over time.

Every business listing, event, lost pet alert, community tip, and neighborhood signal that enters the platform strengthens a local data layer that becomes increasingly difficult for competitors to replicate. Code can be copied. A living, city-specific dataset built over years cannot.

MoHoLocal builds a living knowledge graph of each city by continuously collecting, organizing, and moderating signals including:

- Local businesses across every category and neighborhood
- Events and recurring community gatherings
- Lost and found pets with location history
- Community tips and neighborhood activity
- New resident information and city-specific knowledge

Over time this creates a structured local intelligence layer that grows more valuable with every signal added.

---

### Local Knowledge Graph

Each supported city gradually develops its own knowledge graph consisting of interconnected local data:

- Business listings with categories, ratings, and review history
- Category rankings and Best Of page performance data
- Event histories showing recurring local activity patterns
- Community signals tied to specific neighborhoods and streets
- User activity and engagement patterns by city

The value of the platform increases as these datasets grow and interconnect. A business listing becomes more valuable when it has reviews. A Best Of page becomes more useful when it has ranking history. An event record becomes more meaningful when it shows recurring community patterns.

This interconnected local knowledge is the product. The website is just the interface.

---

### Network Effect

MoHoLocal's data moat is reinforced by compounding network effects:

**More businesses** → more listings, more categories, more Best Of pages
**More signals** → more useful discovery pages, better search coverage
**More users** → more submissions, more reviews, more community activity

As these layers grow together, each new signal becomes more valuable because it connects to an existing web of local knowledge. The platform becomes increasingly useful and increasingly difficult to reproduce from scratch.

A competitor starting today would need years of continuous signal collection to approach the same local coverage — assuming they could build the same community trust and submission pipeline.

---

### Strategic Principle

MoHoLocal's long-term moat is its structured local data.

Engineering decisions should prioritize collecting, organizing, and preserving local signals that strengthen this data layer. Features that help the platform gather more signals, improve signal quality, or make signals more discoverable are always high priority.

Features that do not contribute to the data layer should be evaluated critically before any engineering time is invested.

> The platform that owns the most useful structured local knowledge wins the local discovery market.

---

## Current Product Focus

The current product phase prioritizes:

- Expanding the business directory toward 1,500+ listings
- Strengthening Best Of discovery pages across all supported cities and categories
- Improving local search visibility and SEO coverage
- Increasing platform coverage across all supported cities

Engineering effort should favor improvements that enhance discovery, SEO, and listing quality. Feature development should only be considered when the directory seeding strategy and Best Of coverage are advancing consistently.

The platform has the features it needs. What it needs now is **density, coverage, and discoverability.**

---

## Local Authority SEO Model

MoHoLocal grows by becoming the **authoritative local knowledge hub** for each city it serves. The platform does not compete on features — it competes on structured local knowledge that Google indexes and residents trust.

Authority is built through a layered page architecture where every city generates multiple indexable discovery pages:

```
/[city]                        — City hub page
/[city]/[category]             — Category page (e.g. /mountain-house/restaurants)
/best/[category]/[city]        — Best Of page (e.g. /best/dentists/tracy)
/new-resident/[city]           — New resident guide
/events (filtered by city)     — Local events
/business/[id]                 — Individual business profiles
```

Each page targets a specific local search intent. When a resident searches "best pizza in Mountain House" or "dentists near Tracy CA", MoHoLocal's structured pages are designed to capture that traffic.

The more pages indexed with accurate local data, the more Google treats MoHoLocal as the authoritative source for that city. This compounds over time.

---

### Local Authority Loop

MoHoLocal's growth engine is a compounding authority loop:

```
Local content (businesses, events, signals)
→ Google indexes structured city/category pages
→ Residents discover pages via local search
→ Local mentions and backlinks from community sharing
→ Google trust increases for moholocal.com
→ Higher rankings for local queries
→ More organic discovery
→ More listings, events, and signals contributed
→ Authority compounds
```

This loop is the core growth mechanism. Every verified business listing, every accurate event, and every community signal strengthens it. Low-quality or fake data breaks it.

---

## Trust-First Directory Rule

The MoHoLocal business directory operates on a **trust-first model**. No business listing is visible to residents unless it has been independently verified.

**Non-negotiable rules:**

- Every business in the `businesses` table defaults to `verified = false`
- Only businesses with both `status = 'approved'` AND `verified = true` appear on any public-facing page
- Verification requires cross-checking against Google Maps, Yelp, or the CA Secretary of State
- Seed scripts must never generate fictional businesses — every seeded listing must correspond to a real, operating business at a real address in the correct city
- The system blocks unverified data before it goes live — the founder should never have to manually catch fake listings after publication

**Verification fields on the `businesses` table:**

| Field | Purpose |
|-------|---------|
| `verified` | Boolean gate — `false` = hidden from all public pages |
| `verification_source` | Audit trail — e.g. `google_maps_audit_2026-03-12` |
| `verified_at` | Timestamp of when verification occurred |
| `google_place_id` | Optional — links to Google Maps for future automation |

**Pages enforcing the verified filter (9 total):**

- `/` (homepage)
- `/directory`
- `/business/[id]`
- `/[city]`
- `/[city]/[category]`
- `/best/[category]/[city]`
- `/new-resident/[city]`
- `/claim-listing/[id]`
- `/report-listing/[id]`

The admin page (`/admin`) intentionally does NOT filter by verified — moderators need full visibility.

---

## Image Integrity Rule

Business photos must meet one of these criteria to display publicly:

- Sourced from Google Places API via verified pipeline (`source = 'google_places'`)
- Owner uploaded via claim listing flow (`source = 'owner_upload'`)
- Admin approved by founder (`source = 'admin_verified'`)

**The following are prohibited:**

- Stock photos (e.g. Unsplash, Pexels)
- AI-generated business images
- Generic category placeholder images
- Scraped website images
- Any image not tied to a verified business identity

**Current state (as of 2026-03-12):**

The verified Google Places photo pipeline is live and operational. All ~3,994 Unsplash stock photos have been permanently deleted. The `business_images` table now contains only verified photos sourced from Google Places API.

Gallery rendering is active on business detail pages. The `getBusinessImages()` query enforces:

```ts
.eq('verified', true)
.in('source', ['google_places', 'owner_upload', 'admin_verified'])
```

If a business has zero verified images, no gallery renders. No placeholders. No fallbacks.

**Image storage:**

- Supabase Storage bucket: `business-images` (public read)
- Image path format: `{business_uuid}/{0-4}.jpg`
- Uploads use Service Role Key (bypasses RLS)
- `source_reference` stores the Google `photo_reference` string (not the Place ID)
- Place ID is stored on `businesses.google_place_id` (not duplicated on images)

**Seed script lockdown:**

`seed_business_images.py` has been permanently disabled (renamed to `.DISABLED`). No seed script may ever insert images into `business_images`. Only the verified pipeline (`verify_business_places.py`) and future owner upload / admin approval flows may insert images.

---

## Distribution Strategy

MoHoLocal SEO is amplified by distributing key pages to local communities where residents already gather:

- Local Facebook groups (Mountain House Community, Tracy Neighbors, etc.)
- Community newsletters and email lists
- Reddit local threads (r/209, r/BayArea, r/CentralValley)
- Neighborhood forums and community boards
- School parent groups

Best Of pages and New Resident Guides are the highest-value pages for distribution because they provide immediate utility to residents and generate organic backlinks.

---

## Verified Photo Pipeline — Production Workflow

The Google Places photo pipeline is the only approved method for adding business photos at scale. It runs locally on the founder's Mac (not in the Cowork VM, which blocks Supabase and Google APIs).

**Step 1 — Verify businesses in DB**

Businesses must have `verified = true` before the photo pipeline will process them. Run a Google Maps verification audit first (see PLAYBOOK.md Step 10).

**Step 2 — Dry run**

```bash
cd ~/Desktop/MoHoLocal
python3.11 verify_business_places.py --city "CITY_NAME" --dry-run
```

The dry run calls Google APIs to evaluate matches and count photos but writes nothing to Supabase.

**Step 3 — Review matches**

For each business, verify the output shows a confident match (not a city page, not a wrong-city address, not an ambiguous multi-candidate result). Any business the pipeline skips is a correct safety decision — do not override.

**Step 4 — Real import**

```bash
cd ~/Desktop/MoHoLocal
python3.11 verify_business_places.py --city "CITY_NAME"
```

Photos are downloaded from Google, uploaded to Supabase Storage (`business-images` bucket), and inserted into `business_images` with `source = 'google_places'`, `verified = true`.

**Step 5 — Confirm galleries render**

Visit business detail pages on moholocal.com. Verified businesses with photos should show the image gallery with thumbnail strip.

**Pipeline guardrails (non-negotiable):**

| Guardrail | Enforcement |
|-----------|-------------|
| Never overwrite existing `google_place_id` | UPDATE uses `.is_("google_place_id", "null")` |
| Only process `verified = true` businesses | Query filters `.eq("verified", True)` |
| Reject city/region page results | `is_city_or_region_name()` check |
| Reject multiple candidates | `len(candidates) > 1` → skip |
| Reject weak name matches | `SequenceMatcher` ratio < 0.55 → skip |
| Reject containment matches where shorter < 60% of longer | Prevents "Mountain House CA" matching business names |
| Reject wrong-city addresses | Google address must contain expected city name |
| Max 5 photos per business | `photos[:MAX_PHOTOS_PER_BUSINESS]` |
| 1 second rate limit | `time.sleep(1.0)` between requests |
| `source_reference` stores `photo_reference` | Not the Place ID (Place ID lives on `businesses` table) |

---

## City Expansion Strategy — Density Before Expansion

MoHoLocal prioritizes **depth over breadth**. A city should have dense, verified directory coverage before the platform expands to additional cities.

**Current launch focus order:**

1. Mountain House (audit complete — 17 verified businesses)
2. Tracy (audit pending)
3. Lathrop (audit pending)
4. Manteca (audit pending)
5. Brentwood (audit pending)

**Expansion readiness checklist for each city:**

- [ ] Business directory seeded with real, verified businesses
- [ ] Google Maps audit completed
- [ ] `verified = true` set on confirmed businesses
- [ ] Photo pipeline dry run completed and reviewed
- [ ] Photo pipeline real run completed (verified images live)
- [ ] New Resident Guide populated with city-specific content
- [ ] Best Of pages generating with verified listings
- [ ] City hub page (`/[city]`) rendering correctly

No new city should be added until the existing 5 cities have verified directory coverage.

**Scaling photo pipeline to additional cities:**

```bash
# Step 1: Complete business verification audit for the city
# Step 2: Dry run
python3.11 verify_business_places.py --city "Tracy" --dry-run

# Step 3: Review output, confirm no false matches
# Step 4: Real run
python3.11 verify_business_places.py --city "Tracy"

# Step 5: Check galleries on moholocal.com
```

Repeat for Lathrop, Manteca, Brentwood. Each city must complete its business verification audit before the photo pipeline can run.

---

MoHoLocal Product Bible v4
Confidential — March 2026
