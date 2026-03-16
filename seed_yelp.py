#!/usr/bin/env python3
"""
MoHoLocal — Yelp Fusion API bulk seed script
Pulls real, verified business data from Yelp for all 5 cities.

Yelp is an approved source per CLAUDE.md §13.
Yelp Fusion free tier: 500 API calls/day (sufficient for full coverage).

Prerequisites:
    1. Create a free Yelp app at: https://developer.yelp.com
    2. Copy your API key
    3. Run: YELP_API_KEY=<your_key> SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_yelp.py

All records inserted as status='pending', verified=false.

Usage:
    YELP_API_KEY=<key> SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_yelp.py
    YELP_API_KEY=<key> SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_yelp.py --dry-run
    YELP_API_KEY=<key> SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_yelp.py --city Tracy
    YELP_API_KEY=<key> SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_yelp.py --city Tracy --cat Restaurants
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from typing import Optional

# ── Config ─────────────────────────────────────────────────────────────────────

SUPABASE_URL = "https://ozjlfgipfzykzrjakwzb.supabase.co"
# Reads SUPABASE_SERVICE_ROLE_KEY (canonical project name) with SUPABASE_KEY as legacy fallback
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_KEY")
    or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96amxmZ2lwZnp5a3pyamFrd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzMzI3NiwiZXhwIjoyMDg4MDA5Mjc2fQ.g9f2Il1nWEfgyuvTXHUiHn4EgWsrHVV1QBbdxehT0gM"
)

YELP_API_KEY = os.environ.get("YELP_API_KEY", "")
YELP_SEARCH_URL = "https://api.yelp.com/v3/businesses/search"

# Max results per city+category combo (Yelp max per request: 50; we paginate up to 200)
MAX_PER_QUERY = 200
PAGE_SIZE = 50  # Yelp max per request

# Map MoHoLocal category → Yelp category aliases
# See: https://docs.developer.yelp.com/docs/resources-categories
CATEGORY_YELP_ALIASES = {
    "Restaurants": [
        "restaurants", "food", "bars", "cafes", "diners", "pizza",
        "sandwiches", "mexican", "chinese", "japanese", "thai",
        "italian", "burgers", "seafood", "breakfast_brunch",
        "desserts", "juicebars", "icecream",
    ],
    "Home Services": [
        "homeservices", "plumbing", "electricians", "painters",
        "carpentry", "hvacinstallation", "landscaping", "cleaning",
        "pestcontrol", "roofing", "movers", "appliancerepair",
        "handyman", "garagedoors", "localflavor",
    ],
    "Health & Wellness": [
        "health", "dentists", "doctors", "optometrists", "chiropractors",
        "physicaltherapy", "pharmacy", "gyms", "yoga",
        "acupuncture", "massage", "medspa", "mentalhealth",
        "weightlosscenters", "nutritionists",
    ],
    "Automotive": [
        "auto", "autorepair", "tires", "oilchange", "bodyshops",
        "carwash", "autodetailing", "transmission", "carstereoinstallation",
        "used_car_dealers", "newcardealers", "motorcyclerepair",
    ],
    "Beauty & Spa": [
        "hair", "beautysvc", "nailsalons", "spas",
        "skincare", "eyelashservice", "browsservices", "waxing",
        "makeupartists", "barbers",
    ],
    "Pet Services": [
        "pets", "veterinarians", "petstore", "dogwalkers",
        "petgroomers", "petboarding", "dogparks",
    ],
}

PRIORITY_CATEGORIES = [
    "Restaurants",
    "Home Services",
    "Health & Wellness",
    "Beauty & Spa",
    "Automotive",
    "Pet Services",
]

CITIES = [
    "Mountain House, CA",
    "Tracy, CA",
    "Lathrop, CA",
    "Manteca, CA",
    "Brentwood, CA",
]

# City name normalization (Yelp location string → MoHoLocal city name)
CITY_DISPLAY = {
    "Mountain House, CA": "Mountain House",
    "Tracy, CA": "Tracy",
    "Lathrop, CA": "Lathrop",
    "Manteca, CA": "Manteca",
    "Brentwood, CA": "Brentwood",
}

# ── CLI flags ──────────────────────────────────────────────────────────────────

DRY_RUN = "--dry-run" in sys.argv

FILTER_CITY: Optional[str] = None
FILTER_CAT: Optional[str] = None

for i, arg in enumerate(sys.argv[1:]):
    if arg == "--city" and i + 1 < len(sys.argv) - 1:
        FILTER_CITY = sys.argv[i + 2]
    if arg == "--cat" and i + 1 < len(sys.argv) - 1:
        FILTER_CAT = sys.argv[i + 2]

# ── Yelp API ──────────────────────────────────────────────────────────────────

def fetch_yelp_businesses(location: str, categories: list, offset: int = 0) -> dict:
    """Call Yelp Fusion Business Search API."""
    params = {
        "location": location,
        "categories": ",".join(categories),
        "limit": PAGE_SIZE,
        "offset": offset,
        "sort_by": "review_count",  # Most-reviewed first = most established local businesses
    }
    url = f"{YELP_SEARCH_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {YELP_API_KEY}",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"  ⚠️  Yelp HTTP {e.code}: {body[:300]}")
        return {}
    except Exception as e:
        print(f"  ⚠️  Yelp error: {e}")
        return {}

def yelp_to_business(biz: dict, city_display: str, category: str) -> Optional[dict]:
    """Convert a Yelp business object to a MoHoLocal business dict."""
    name = biz.get("name", "").strip()
    if not name:
        return None

    # Skip permanently closed
    if biz.get("is_closed", False):
        return None

    # Address
    loc = biz.get("location", {})
    display_address = loc.get("display_address", [])
    address = ", ".join(display_address) if display_address else f"{city_display}, CA"

    # Ensure address contains the city (Yelp sometimes returns businesses just outside bounds)
    city_variations = [
        city_display.lower(),
        city_display.lower().replace(" ", ""),
    ]
    if not any(v in address.lower() for v in city_variations):
        # Only allow if it's an adjacent area (zip code check would be better, but this is safe enough)
        zip_code = loc.get("zip_code", "")
        # Specific zip codes for each city
        CITY_ZIPS = {
            "Mountain House": {"95391"},
            "Tracy": {"95376", "95377", "95378", "95304"},
            "Lathrop": {"95330"},
            "Manteca": {"95336", "95337"},
            "Brentwood": {"94513"},
        }
        city_zips = CITY_ZIPS.get(city_display, set())
        if zip_code not in city_zips:
            return None

    # Phone
    phone = biz.get("display_phone", biz.get("phone", "")).strip()

    # Website — Yelp doesn't expose website URLs in basic search results
    # We'll use the Yelp URL as fallback, but leave website empty
    # so it can be enriched later (Google verification step will add real URLs)
    website = ""

    # Description — build from Yelp categories and price
    yelp_cats = biz.get("categories", [])
    cat_titles = [c.get("title", "") for c in yelp_cats if c.get("title")]
    price = biz.get("price", "")
    rating = biz.get("rating", 0)
    review_count = biz.get("review_count", 0)

    desc_parts = []
    if cat_titles:
        desc_parts.append(", ".join(cat_titles[:2]))
    desc_parts.append(f"in {city_display}.")
    if price:
        desc_parts.append(f"Price range: {price}.")

    description = " ".join(desc_parts)

    return {
        "name": name,
        "category": category,
        "city": city_display,
        "description": description,
        "address": address,
        "phone": phone,
        "website": website,
        "status": "pending",
        "verified": False,
        "claimed": False,
        "rating": float(rating),
        "review_count": int(review_count),
    }

# ── Supabase helpers ──────────────────────────────────────────────────────────

def get_existing_names(city: str) -> set:
    url = (
        f"{SUPABASE_URL}/rest/v1/businesses"
        f"?select=name&city=eq.{urllib.parse.quote(city)}&limit=5000"
    )
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {row["name"].lower() for row in data}
    except Exception as e:
        print(f"  ⚠️  Could not fetch existing names for {city}: {e}")
        return set()

def insert_businesses(records: list) -> tuple:
    if not records:
        return 0, 0
    payload = json.dumps(records).encode("utf-8")
    url = f"{SUPABASE_URL}/rest/v1/businesses"
    req = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates,return=minimal",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp.read()
            return len(records), 0
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"  ❌  Supabase insert error {e.code}: {body[:200]}")
        return 0, len(records)

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not SUPABASE_KEY:
        print("❌  Set SUPABASE_KEY env var first")
        raise SystemExit(1)

    if not YELP_API_KEY:
        print("❌  Set YELP_API_KEY env var first")
        print("    1. Go to https://developer.yelp.com")
        print("    2. Create a free app")
        print("    3. Copy your API key")
        print("    4. Re-run: YELP_API_KEY=<key> SUPABASE_KEY=<key> python3 seed_yelp.py")
        raise SystemExit(1)

    if DRY_RUN:
        print("🔍  DRY RUN — no records will be inserted\n")

    total_inserted = 0
    total_skipped = 0
    total_dupe = 0

    city_list = [FILTER_CITY + ", CA" if FILTER_CITY and not FILTER_CITY.endswith(", CA") else FILTER_CITY] if FILTER_CITY else CITIES
    cat_list = [FILTER_CAT] if FILTER_CAT else PRIORITY_CATEGORIES

    for city_loc in city_list:
        if city_loc not in CITY_DISPLAY:
            # Try to match
            matches = [c for c in CITIES if FILTER_CITY and FILTER_CITY.lower() in c.lower()]
            if matches:
                city_loc = matches[0]
            else:
                print(f"⚠️  Unknown city: {city_loc}")
                continue

        city_display = CITY_DISPLAY[city_loc]

        print(f"\n{'═' * 60}")
        print(f"📍  {city_display}")
        print(f"{'═' * 60}")

        existing_names: set = set()
        if not DRY_RUN:
            print(f"  Checking existing records in DB...")
            existing_names = get_existing_names(city_display)
            print(f"  Found {len(existing_names)} existing business names")

        for category in cat_list:
            yelp_aliases = CATEGORY_YELP_ALIASES.get(category, [])
            if not yelp_aliases:
                continue

            print(f"\n  🏷️  {category}")

            all_candidates = []
            seen_ids = set()

            # Paginate up to MAX_PER_QUERY results
            for offset in range(0, MAX_PER_QUERY, PAGE_SIZE):
                print(f"     Fetching offset {offset}...")
                data = fetch_yelp_businesses(city_loc, yelp_aliases, offset)

                businesses = data.get("businesses", [])
                if not businesses:
                    break

                total_yelp = data.get("total", 0)

                for biz in businesses:
                    biz_id = biz.get("id", "")
                    if biz_id in seen_ids:
                        continue
                    seen_ids.add(biz_id)

                    record = yelp_to_business(biz, city_display, category)
                    if record is None:
                        continue

                    name_lower = record["name"].lower()
                    if name_lower in existing_names:
                        total_dupe += 1
                        continue
                    if name_lower in {c["name"].lower() for c in all_candidates}:
                        continue

                    all_candidates.append(record)
                    existing_names.add(name_lower)

                # Don't fetch more pages than exist
                if offset + PAGE_SIZE >= min(total_yelp, MAX_PER_QUERY):
                    break

                # Yelp rate limit: 500 req/day; throttle to be safe
                time.sleep(0.5)

            print(f"     Valid new records: {len(all_candidates)}")

            if DRY_RUN:
                for b in all_candidates[:5]:
                    print(f"       • {b['name']} — {b['address']} ({b['rating']}★, {b['review_count']} reviews)")
                if len(all_candidates) > 5:
                    print(f"       … and {len(all_candidates) - 5} more")
                total_inserted += len(all_candidates)
                continue

            if all_candidates:
                inserted, failed = insert_businesses(all_candidates)
                total_inserted += inserted
                total_skipped += failed
                print(f"     ✅  Inserted {inserted}  |  ❌ Failed {failed}")

    print(f"\n{'═' * 60}")
    print(f"📊  SUMMARY")
    print(f"{'═' * 60}")
    if DRY_RUN:
        print(f"   Would insert: {total_inserted}")
    else:
        print(f"   Inserted:     {total_inserted}")
        print(f"   Failed:       {total_skipped}")
    print(f"   Dupes skipped: {total_dupe}")
    print(f"\n✅  Done. All records are status='pending', verified=false.")
    print(f"    Run audit_completeness.py to check quality before promoting.")

if __name__ == "__main__":
    main()
