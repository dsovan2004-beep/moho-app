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

MoHoLocal Product Bible v2
Confidential — March 2026
