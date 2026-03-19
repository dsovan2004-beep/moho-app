# MoHoLocal — Sprint 5 Founder Checklist
# Distribution & Traffic Activation
# Target: Complete before April 15, 2026

> **This is your action list.** Claude handles code. You handle GSC, social, and DB.
> Work through this top to bottom. Check off items as you complete them.

---

## PHASE 1 — DATA FIXES (Do These First)

These unblock everything else. GSC submission is pointless if pages show 0 listings.

---

### 1A — Fix South Bay Listing Counts

Santa Clara and Sunnyvale are showing ~2 listings despite 100/83 records seeded.

**Steps:**

1. Open Supabase SQL Editor:
   → https://supabase.com/dashboard/project/ozjlfgipfzykzrjakwzb/sql

2. Open `sql/sprint5_southbay_fix.sql` in this repo

3. Run **Step 1 only** first — read the output carefully:
   ```sql
   SELECT city, status, verified, COUNT(*) AS count
   FROM businesses
   WHERE city IN ('Santa Clara', 'Sunnyvale', 'San Jose')
   GROUP BY city, status, verified
   ORDER BY city, count DESC;
   ```

4. Based on output, apply the correct fix:
   - If records show `status != 'approved'` or `verified = false` → run **Fix A**
   - If records show wrong category values → run **Fix B**
   - The fix statements are already in the file — just uncomment and run

5. Run the verify query at the bottom to confirm ≥ 20 listings per city:
   ```sql
   SELECT city, COUNT(*) AS public_count
   FROM businesses WHERE city IN ('Santa Clara', 'Sunnyvale')
     AND status = 'approved' AND verified = true
   GROUP BY city;
   ```

**Done when:** Santa Clara ≥ 20, Sunnyvale ≥ 20 ✅

---

### 1B — Expand Mountain House to 80–100 Listings

Mountain House currently has ~41 listings in `pending_review` and more in `pending`.

**Steps:**

1. From Mac terminal, navigate to repo:
   ```
   cd ~/Desktop/MoHoLocal/moho-app-scaffold
   ```

2. Dry run first — review what will be seeded:
   ```
   python3 seed_mountain_house_expansion.py
   ```
   Read the output. Verify names, addresses, phones look real. Check for any `REJECT` lines.

3. If dry run looks good, run with insert (records go in as `status='pending'`):
   ```
   python3 seed_mountain_house_expansion.py --insert
   ```

4. If you want to skip the manual approval queue (only if you've spot-checked the data):
   ```
   python3 seed_mountain_house_expansion.py --insert --force-approve
   ```
   ⚠️ Only use `--force-approve` if you've verified a sample against Google Maps.

5. After insert, run the enrichment script to add photos:
   ```
   python3 verify_business_places.py --city "Mountain House"
   ```

**Done when:** Mountain House shows 80–100 public verified listings in the admin panel ✅

---

### 1C — Category Audit (Optional but Recommended)

Run this to see where each city stands across all 9 categories:

1. Open `sql/sprint5_category_audit.sql` in Supabase SQL Editor
2. Run each query block individually
3. Note any cities with 0 listings in Restaurants, Health & Wellness, or Retail — those need attention

**Done when:** You've reviewed the category matrix and flagged gaps ✅

---

## PHASE 2 — GOOGLE SEARCH CONSOLE

Submit all new pages for indexing. Google won't crawl them unless you request it.

**URL:** https://search.google.com/search-console

---

### 2A — South Bay City Pages

Submit these 3 URLs via GSC URL Inspection → "Request Indexing":

```
https://www.moholocal.com/san-jose
https://www.moholocal.com/santa-clara
https://www.moholocal.com/sunnyvale
```

Also submit the Restaurants category pages (the only active South Bay category):

```
https://www.moholocal.com/san-jose/restaurants
https://www.moholocal.com/santa-clara/restaurants
https://www.moholocal.com/sunnyvale/restaurants
```

---

### 2B — Sprint 4 Discovery Pages (Best Of + FIFA)

These are the static SEO pages built in Sprint 4. Submit them in batches using the Sitemap tool or URL Inspection.

**209 Best Of pages:**
```
https://www.moholocal.com/best-restaurants-tracy
https://www.moholocal.com/best-pizza-tracy
https://www.moholocal.com/best-pizza-mountain-house
https://www.moholocal.com/best-pizza-manteca
https://www.moholocal.com/best-breakfast-tracy
https://www.moholocal.com/best-breakfast-mountain-house
https://www.moholocal.com/best-breakfast-manteca
https://www.moholocal.com/best-lunch-tracy
https://www.moholocal.com/best-lunch-mountain-house
https://www.moholocal.com/best-lunch-manteca
https://www.moholocal.com/best-dinner-tracy
https://www.moholocal.com/best-dinner-mountain-house
https://www.moholocal.com/best-dinner-manteca
https://www.moholocal.com/best-dentists-tracy
https://www.moholocal.com/best-dentists-mountain-house
https://www.moholocal.com/best-dentists-manteca
https://www.moholocal.com/best-hair-salon-tracy
https://www.moholocal.com/best-hair-salon-mountain-house
https://www.moholocal.com/best-hair-salon-manteca
https://www.moholocal.com/best-nail-salon-tracy
https://www.moholocal.com/best-nail-salon-mountain-house
https://www.moholocal.com/best-nail-salon-manteca
https://www.moholocal.com/best-family-restaurants-tracy
https://www.moholocal.com/best-brunch-manteca
https://www.moholocal.com/best-coffee-tracy
```

**FIFA / World Cup pages (TIME-SENSITIVE — must rank before June 2026):**
```
https://www.moholocal.com/restaurants-near-levis-stadium
https://www.moholocal.com/coffee-near-levis-stadium
https://www.moholocal.com/best-places-watch-world-cup-san-jose
https://www.moholocal.com/best-bars-watch-world-cup-san-jose
```

**Tip:** Use the Sitemaps tool in GSC to submit `https://www.moholocal.com/sitemap.xml` — this will queue all pages at once instead of one-by-one.

---

### 2C — Verify Sitemap Is Current

Before submitting, check that the sitemap includes all the above pages:

```
https://www.moholocal.com/sitemap.xml
```

Open it in a browser and scan for the pages above. If any are missing, ping Claude to update `app/sitemap.xml/route.ts`.

---

## PHASE 3 — SOCIAL DISTRIBUTION

Real people drive early traffic. Post in channels where 209 residents are active.

---

### 3A — Facebook Groups (Best Of Pages)

Post in these groups. Keep it casual — you're a neighbor sharing a resource, not advertising.

**Target groups:**
- Mountain House, CA Community
- Tracy, CA Community / Tracy Locals
- Manteca Community / Manteca Residents
- Lathrop Community

**Template post (customize for each city):**
> "Hey neighbors 👋 — I built a free local directory for Tracy (and the 209 area).
> Check out the best restaurants, dentists, and coffee spots near you:
> 👉 moholocal.com/best-restaurants-tracy
>
> All local businesses, no chains. Would love feedback from locals!"

Post one per city. Don't cross-post the same link in multiple groups — keep each post city-specific.

---

### 3B — Reddit Distribution

Post in relevant subreddits. Reddit requires authenticity — share as a founder/resident, not a marketer.

**Subreddits:**
- r/Tracy (primary — most active 209 community on Reddit)
- r/SanJose (for FIFA pages)
- r/bayarea (for South Bay pages)
- r/209 (if active)

**Template post for r/Tracy:**
> **Title:** "I built a free local directory for Tracy — moholocal.com"
>
> "Hey r/Tracy — I'm a local and built a free directory for Tracy businesses.
> It's like Yelp but just for the 209, with real verified listings.
>
> Check it out: moholocal.com/tracy
>
> Would love feedback from locals on what's missing or wrong."

**Template post for r/SanJose (FIFA):**
> **Title:** "Best restaurants near Levi's Stadium for the World Cup — local guide"
>
> "Built a page with local spots near Levi's for the 2026 games:
> moholocal.com/restaurants-near-levis-stadium
>
> All local places, not chains. Thoughts? Anything missing?"

---

### 3C — Nextdoor (Optional)

If you have a Nextdoor account, post the Best Of pages in the Mountain House and Tracy neighborhoods. Keep it personal — "I made this for our neighborhood."

---

## PHASE 4 — FIFA PAGES (Time-Sensitive)

Levi's Stadium games start June 2026. Pages need to be indexed and ranking by May 2026.

---

### 4A — Verify FIFA Pages Are Live

Visit each URL and confirm they load with real listings (not empty):

```
https://www.moholocal.com/restaurants-near-levis-stadium
https://www.moholocal.com/coffee-near-levis-stadium
https://www.moholocal.com/best-places-watch-world-cup-san-jose
https://www.moholocal.com/best-bars-watch-world-cup-san-jose
```

If any show empty or error — let Claude know immediately.

---

### 4B — Share FIFA Pages in South Bay Channels

Post in South Bay community spaces to get early backlinks and social signals:

- r/SanJose (see template above)
- r/bayarea
- Santa Clara County Facebook groups
- Nextdoor Santa Clara / Sunnyvale (if you have access)

---

## PHASE 5 — MONITORING

Set a 30-day reminder to check these.

### GSC Check (30 days after submission)

- Open GSC → Performance → Pages
- Look for `/san-jose`, `/santa-clara`, `/sunnyvale`, `/restaurants-near-levis-stadium`
- Confirm impressions > 0

**If impressions are still 0 after 30 days:** use GSC URL Inspection to check if pages are indexed. If not indexed, check for crawl errors.

### Claim Conversion Rate

- Open Supabase → claim_requests table
- Count how many claim requests came in during Sprint 5
- Target: at least 5 claims by end of April 2026

---

## QUICK REFERENCE — PARALLEL STATUS

| Item | Owner | Status |
|------|-------|--------|
| Fix South Bay SQL (sprint5_southbay_fix.sql) | Founder | ⬜ |
| Seed Mountain House expansion | Founder | ⬜ |
| Run verify_business_places.py for Mountain House | Founder | ⬜ |
| Submit South Bay pages to GSC | Founder | ⬜ |
| Submit Sprint 4 Best Of pages to GSC | Founder | ⬜ |
| Submit FIFA pages to GSC | Founder | ⬜ |
| Verify sitemap.xml includes all pages | Claude | ⬜ |
| Post Best Of pages in Facebook groups | Founder | ⬜ |
| Post in r/Tracy + r/SanJose | Founder | ⬜ |
| Post FIFA pages in South Bay channels | Founder | ⬜ |
| 30-day GSC impressions check | Founder | ⬜ |
| 30-day claim conversion check | Founder | ⬜ |

---

## DEADLINE

**April 15, 2026** — Full Sprint 5 completion

**May 2026** — FIFA pages must be indexed and ranking before game season

---

*MoHoLocal Sprint 5 Founder Checklist — March 2026*
