# MoHoLocal Playbook V2 — Growth & Monetization

> **Phase:** Growth Engine (Phases 4–6)
> **Goal:** Repeat visits, revenue, and city expansion
> **Source:** MoHoLocal Master Playbook and Product Bible

---

## Overview

Playbook V2 covers the strategy and operating model for the Growth phase of MoHoLocal. This playbook activates after the Foundation phase is stable — meaning the platform has high data quality, a working contribution loop, and consistent resident engagement in Mountain House.

V2 introduces growth loops, monetization, and the city expansion model.

---

## Core Growth Loops

### Recommendation Loop

Residents ask for local service recommendations → discover businesses on MoHoLocal → share the directory link with neighbors → reinforces directory value. This is the primary organic acquisition channel.

### Lost Pet Loop

Residents post lost or found pet content → high emotion drives shares and visits → increases brand awareness and return behavior. Lost & Found is a top-of-funnel acquisition tool, not just a utility feature.

### Events Loop

Residents check MoHoLocal for what's happening locally → events calendar drives weekly return visits → community calendar habit forms over time.

### Contribution Loop

Residents submit community posts, business listings, reports, and suggestions → platform gets richer → more residents find it useful → more contributions. This is the self-reinforcing flywheel.

---

## Growth Channels

| Channel | Notes |
|---------|-------|
| Local Facebook groups | Share relevant MoHoLocal links (non-spammy, genuinely helpful replies) |
| Neighborhood referrals | Word of mouth from Mountain House early adopters |
| SEO — new resident discovery | `/new-resident`, `/[city]/[category]` pages target "moving to Mountain House" queries |
| SEO — local service discovery | Category pages rank for "[service] in [city]" queries |
| Direct outreach to local businesses | Invite businesses to claim and verify their free listings |
| Community reposts and spotlights | Businesses share their MoHoLocal page when we feature them |

---

## First 1,000 Users Strategy

1. Seed 200+ high-quality business listings across all 5 cities
2. Seed events and local community posts to populate the feed
3. Monitor local Facebook groups for recommendation requests
4. Reply helpfully with relevant MoHoLocal links
5. Use new-resident and lost-pet content as acquisition levers
6. Reach out directly to business owners to claim their listings

---

## SEO Strategy

MoHoLocal has a structural SEO advantage through its city+category URL structure.

### Priority Pages for SEO

| Page Type | Example URL |
|-----------|-------------|
| City landing pages | `/mountain-house`, `/tracy` |
| Category SEO pages | `/mountain-house/restaurants`, `/tracy/automotive` |
| New Resident Guide | `/new-resident` |
| Business detail pages | `/business/[id]` (with name in title) |

### SEO Requirements

- All page titles and meta descriptions must include the specific city name
- `generateMetadata()` must return unique title/description per page
- Category pages must use canonical category names matching `businesses.category`
- Schema markup (JSON-LD) on business detail pages is a Phase 4 target

---

## Monetization Strategy

### Phase 1–3: No Hard Monetization

Focus entirely on utility and data quality. Trust is the asset being built. Do not introduce any paid features until the product passes the community utility test.

### Phase 4–5: Introduce Soft Monetization

| Feature | Description |
|---------|-------------|
| Featured listings | Businesses pay to appear at the top of directory and homepage |
| Premium profile upgrades | Enhanced listing with photos, hours, and verified badge |
| Sponsored homepage sections | Branded placements in city or category sections |

### Phase 5–6: Full Revenue Model

| Revenue Stream | Description |
|---------------|-------------|
| Newsletter sponsorships | Ads or sponsored content in the weekly local digest |
| Local deals | Time-limited offers from local businesses |
| Category sponsorships | Exclusive placement in a category (e.g., "Automotive — sponsored by X") |
| Premium business claim tools | Verified owner dashboard with analytics and editing tools |

### Monetization Guardrail

> Never compromise trust for revenue. The directory's value is that listings are earned, not paid for. Featured placement is paid promotion layered *on top of* the organic directory — not a replacement for it.

---

## Featured Listings Implementation

Featured listings are the first monetization lever. Implementation notes:

- Businesses with `featured = true` appear in the Featured Businesses section on the homepage
- The homepage query: `.eq('featured', true).eq('status', 'approved')`
- Featured badge is displayed as a star (⭐) on business cards
- Featured section includes "Sponsored" label for transparency
- Featured businesses also receive priority placement in directory results (Phase 5)

---

## City Expansion Model

### Design Rule

Everything in the product must be designed so the same stack can launch another city without rebuilding the product. City is always a data field, never a code branch.

### Launch Checklist for a New City

- [ ] Add city name to canonical cities list in CLAUDE.md and CITY_CFG configs
- [ ] Define city gradient and chip color
- [ ] Seed 40+ approved businesses in the new city
- [ ] Seed at least 5 upcoming events
- [ ] Create `/[city-slug]` landing page content
- [ ] Verify `/[city-slug]/[category]` SEO pages work correctly
- [ ] Add city to city switcher in layout nav
- [ ] Verify `?city=CityName` filter works on directory page

### Target Expansion Markets

| City | County | Priority |
|------|--------|----------|
| Mountain House | San Joaquin | ✅ Live |
| Tracy | San Joaquin | ✅ Live (seeded, pending audit) |
| Lathrop | San Joaquin | ✅ Live (seeded, pending audit) |
| Manteca | San Joaquin | ✅ Live (seeded, pending audit) |
| Brentwood | Contra Costa | ✅ Live (seeded, pending audit) |
| Stockton | San Joaquin | Phase 6 |

---

## AI Growth Features (Phase 4)

AI features in the Growth phase are operational tools, not resident-facing features:

| Feature | Description |
|---------|-------------|
| Weekly local digest | AI-generated summary of local events, new businesses, and community highlights |
| Business description drafts | AI drafts descriptions for newly approved listings with incomplete data |
| Event roundups | AI-generated "What's happening this weekend" content |
| Moderation assistance | AI flags potential spam or duplicate submissions before admin review |
| AI local search | Natural language queries ("best halal food in Tracy") mapped to directory results |

---

## Acquisition Positioning

MoHoLocal should be designed as an acquirable system from day one. The asset value compounds with:

- More cities launched on the same stack
- More clean, verified local business data
- Demonstrated community engagement and return behavior
- Monetization proof (even at small scale)
- AI operating infrastructure that reduces cost to run

### Likely Acquirer Profiles

- Local media groups looking for digital infrastructure
- Community software platforms (neighborhood apps, HOA tools)
- Proptech or neighborhood platforms
- Vertical AI or local commerce platforms
- Regional publishers
- Location intelligence products

---

## V2 Phase Definition of Done

The Growth phase is complete when:

- Mountain House has 100+ community posts/month
- Events calendar has at least 10 upcoming events at any given time
- At least 5 business owners have claimed their listings
- Featured listing revenue covers hosting costs
- Tracy, Lathrop, Manteca, and Brentwood each have 40+ approved+verified listings
- Weekly digest or activity feed has been launched

---

*Last updated: March 2026*
