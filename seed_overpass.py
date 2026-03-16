#!/usr/bin/env python3
"""
MoHoLocal — Overpass/OpenStreetMap bulk seed script
Uses the free Overpass API (no key required) to pull real businesses
from OpenStreetMap for all 5 MoHoLocal cities.

Data license: ODbL (openstreetmap.org/copyright) — suitable for directory use.
All records inserted as status='pending', verified=false.

Ingestion safeguard (3 rules — applied before every insert):
  Rule 1: Address must start with a street number (digits).
  Rule 2: Phone must be present, not a 555-xxxx fake, and at least 7 digits.
  Rule 3: Business name must not be a generic placeholder word.
Records that fail any rule are rejected before reaching the database.

Usage:
    SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_overpass.py

Optional flags:
    --dry-run     Print records but do not insert
    --city NAME   Seed only one city (e.g. --city Tracy)
    --cat NAME    Seed only one category (e.g. --cat Restaurants)
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from typing import Optional, Tuple

# ── Config ─────────────────────────────────────────────────────────────────────

SUPABASE_URL = "https://ozjlfgipfzykzrjakwzb.supabase.co"
# Reads SUPABASE_SERVICE_ROLE_KEY (canonical project name) with SUPABASE_KEY as legacy fallback
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_KEY")
    or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96amxmZ2lwZnp5a3pyamFrd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzMzI3NiwiZXhwIjoyMDg4MDA5Mjc2fQ.g9f2Il1nWEfgyuvTXHUiHn4EgWsrHVV1QBbdxehT0gM"
)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Bounding boxes: [south, west, north, east]
CITY_BOUNDS = {
    "Mountain House": (37.7600, -121.5650, 37.7950, -121.5200),
    "Tracy":          (37.6900, -121.4850, 37.7650, -121.3900),
    "Lathrop":        (37.7900, -121.3200, 37.8450, -121.2400),
    "Manteca":        (37.7700, -121.2400, 37.8300, -121.1800),
    "Brentwood":      (37.8900, -121.7500, 37.9500, -121.6700),
}

# Map MoHoLocal category → OSM amenity/shop/leisure tags
# Each entry is a list of (key, value) OSM tag pairs to query
CATEGORY_OSM_TAGS = {
    "Restaurants": [
        ("amenity", "restaurant"),
        ("amenity", "fast_food"),
        ("amenity", "cafe"),
        ("amenity", "food_court"),
        ("amenity", "bar"),
        ("amenity", "pub"),
        ("amenity", "biergarten"),
        ("amenity", "ice_cream"),
    ],
    "Home Services": [
        ("shop", "hardware"),
        ("shop", "doityourself"),
        ("shop", "paint"),
        ("shop", "electrical"),
        ("shop", "plumber"),
        ("craft", "plumber"),
        ("craft", "electrician"),
        ("craft", "painter"),
        ("craft", "carpenter"),
        ("craft", "hvac"),
        ("shop", "locksmith"),
        ("shop", "glaziery"),
    ],
    "Health & Wellness": [
        ("amenity", "dentist"),
        ("amenity", "doctors"),
        ("amenity", "clinic"),
        ("amenity", "pharmacy"),
        ("amenity", "optician"),
        ("healthcare", "physiotherapist"),
        ("healthcare", "chiropractor"),
        ("healthcare", "alternative"),
        ("leisure", "fitness_centre"),
        ("leisure", "sports_centre"),
        ("shop", "optician"),
    ],
    "Automotive": [
        ("shop", "car_repair"),
        ("shop", "car"),
        ("shop", "car_parts"),
        ("shop", "tyres"),
        ("amenity", "car_wash"),
        ("amenity", "fuel"),
        ("shop", "motorcycle"),
        ("shop", "bicycle"),
    ],
    "Beauty & Spa": [
        ("shop", "hairdresser"),
        ("shop", "beauty"),
        ("shop", "cosmetics"),
        ("shop", "nail_salon"),
        ("leisure", "spa"),
        ("amenity", "spa"),
    ],
    "Pet Services": [
        ("amenity", "veterinary"),
        ("shop", "pet"),
        ("shop", "pet_food"),
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

# ── Ingestion safeguard ────────────────────────────────────────────────────────
# Generic placeholder names that signal fabricated or OSM-noise records.
# Rule 3 rejects any record whose name (case-insensitive) matches this set.
GENERIC_NAMES = {
    "restaurant", "cafe", "café", "coffee", "food", "bar", "grill", "kitchen",
    "diner", "eatery", "bistro", "pizza", "burger", "thai", "chinese",
    "mexican", "indian", "sushi", "fast food", "takeaway", "takeout",
    "snack bar", "refreshments", "unnamed", "unknown", "store", "shop",
    "market", "grocery", "bakery", "deli", "pharmacy", "clinic", "salon",
    "spa", "gym", "fitness", "auto", "garage", "repair", "services",
    "beauty", "nail salon", "barber", "hair salon",
}


def validate_record(biz: dict) -> Tuple[bool, str]:
    """
    Apply 3-rule ingestion safeguard before inserting any record.

    Rule 1 — Address must contain a street number.
              Rejects addresses that do not start with a digit.
              Prevents city-only placeholders like "Mountain House, CA 95391".

    Rule 2 — Phone must not be synthetic.
              Rejects: empty phone, 555-xxxx fakes, fewer than 7 digits.
              Note: sequential-phone detection is a batch-level concern and
              is handled by audit_completeness.py after seeding.

    Rule 3 — Business name must not be a generic placeholder.
              Rejects names like "Restaurant", "Cafe", "Food", etc.

    Returns:
        (True, "OK")              — record passes all rules, safe to insert
        (False, "RULE1_...")      — address rejected
        (False, "RULE2_...")      — phone rejected
        (False, "RULE3_...")      — name rejected
    """
    name = (biz.get("name") or "").strip()
    address = (biz.get("address") or "").strip()
    phone = (biz.get("phone") or "").strip()

    # Rule 1 — address must start with a digit
    if not address:
        return False, "RULE1_NO_ADDRESS"
    if not address[0].isdigit():
        return False, "RULE1_NO_STREET_NUMBER"

    # Rule 2 — phone must exist, not be fake, not be too short
    if not phone:
        return False, "RULE2_EMPTY_PHONE"
    digits_only = re.sub(r"\D", "", phone)
    if len(digits_only) < 7:
        return False, "RULE2_PHONE_TOO_SHORT"
    # 555-0xxx is the NANP reserved fake range (e.g. Hollywood numbers)
    if re.search(r"555.?0\d{3}", phone):
        return False, "RULE2_FAKE_555"

    # Rule 3 — name must not be a generic placeholder
    if name.lower() in GENERIC_NAMES:
        return False, "RULE3_GENERIC_NAME"

    return True, "OK"


# ── CLI flags ──────────────────────────────────────────────────────────────────

DRY_RUN = "--dry-run" in sys.argv

FILTER_CITY: Optional[str] = None
FILTER_CAT: Optional[str] = None

for i, arg in enumerate(sys.argv[1:]):
    if arg == "--city" and i + 1 < len(sys.argv) - 1:
        FILTER_CITY = sys.argv[i + 2]
    if arg == "--cat" and i + 1 < len(sys.argv) - 1:
        FILTER_CAT = sys.argv[i + 2]

# ── Overpass query builder ─────────────────────────────────────────────────────

def build_overpass_query(bounds: tuple, osm_tags: list) -> str:
    """Build an Overpass QL query for given bounding box and tag list."""
    south, west, north, east = bounds
    bbox = f"{south},{west},{north},{east}"

    tag_queries = ""
    for key, value in osm_tags:
        tag_queries += f'  node["{key}"="{value}"]({bbox});\n'
        tag_queries += f'  way["{key}"="{value}"]({bbox});\n'

    return f"""
[out:json][timeout:30];
(
{tag_queries.rstrip()}
);
out center tags;
"""

def fetch_overpass(query: str) -> list:
    """Execute an Overpass query and return the elements list."""
    encoded = urllib.parse.urlencode({"data": query}).encode("utf-8")
    req = urllib.request.Request(
        OVERPASS_URL,
        data=encoded,
        headers={"User-Agent": "MoHoLocal/1.0 (moholocal.com; hello@moholocal.com)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("elements", [])
    except urllib.error.HTTPError as e:
        print(f"  ⚠️  Overpass HTTP {e.code}: {e.reason}")
        return []
    except Exception as e:
        print(f"  ⚠️  Overpass error: {e}")
        return []

# ── OSM element → MoHoLocal business ─────────────────────────────────────────

def osm_to_business(element: dict, city: str, category: str) -> Optional[dict]:
    """Convert an OSM element to a MoHoLocal business dict. Returns None if unusable."""
    tags = element.get("tags", {})

    name = tags.get("name", "").strip()
    if not name or len(name) < 2:
        return None  # Skip unnamed elements

    # Skip chains / known non-local franchises (rough filter)
    SKIP_NAMES = {
        "mcdonald's", "subway", "starbucks", "walmart", "target", "costco",
        "7-eleven", "7eleven", "dollar tree", "dollar general", "family dollar",
        "cvs", "walgreens", "rite aid", "home depot", "lowe's", "lowes",
        "autozone", "o'reilly auto parts", "o reilly", "advance auto parts",
        "panda express", "taco bell", "jack in the box", "burger king",
        "wendy's", "wendys", "in-n-out", "in n out", "chick-fil-a",
        "chipotle", "domino's", "pizza hut", "little caesars",
        "chase bank", "wells fargo", "bank of america",
        "shell", "chevron", "arco", "76", "valero",
    }
    if name.lower() in SKIP_NAMES:
        return None

    # Address assembly
    housenumber = tags.get("addr:housenumber", "")
    street = tags.get("addr:street", "")
    postcode = tags.get("addr:postcode", "")
    state = tags.get("addr:state", "CA")

    if housenumber and street:
        address = f"{housenumber} {street}, {city}, {state} {postcode}".strip().rstrip(",")
    elif street:
        address = f"{street}, {city}, {state}".strip()
    else:
        address = f"{city}, CA"

    # Phone — normalize
    phone = (
        tags.get("phone", "")
        or tags.get("contact:phone", "")
        or tags.get("telephone", "")
    ).strip()
    # Drop non-US or malformed
    if phone and not phone.startswith(("+1", "(", "1-", "209", "925", "408", "510", "650", "707", "916", "559")):
        phone = ""

    website = (
        tags.get("website", "")
        or tags.get("contact:website", "")
        or tags.get("url", "")
    ).strip()
    if website and not website.startswith(("http://", "https://")):
        website = "https://" + website

    # Build a short description from OSM tags
    cuisine = tags.get("cuisine", "")
    opening_hours = tags.get("opening_hours", "")

    desc_parts = []
    if cuisine:
        desc_parts.append(f"{cuisine.replace(';', ', ').title()} restaurant")
    elif category == "Restaurants":
        amenity = tags.get("amenity", "")
        if amenity == "cafe":
            desc_parts.append("Local café")
        elif amenity in ("bar", "pub"):
            desc_parts.append("Bar and pub")
        elif amenity == "fast_food":
            desc_parts.append("Quick-service restaurant")
        else:
            desc_parts.append("Local restaurant")

    desc_parts.append(f"serving {city}.")
    description = " ".join(desc_parts)

    return {
        "name": name,
        "category": category,
        "city": city,
        "description": description,
        "address": address,
        "phone": phone,
        "website": website,
        "status": "pending",
        "verified": False,
        "claimed": False,
        "rating": 0,
        "review_count": 0,
    }

# ── Supabase upsert ───────────────────────────────────────────────────────────

def get_existing_names(city: str) -> set:
    """Fetch names of businesses already in DB for this city to avoid dupes."""
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
    """Insert a batch of business records. Returns (inserted, skipped) counts."""
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
        print("❌  Set SUPABASE_SERVICE_ROLE_KEY env var first:  export SUPABASE_SERVICE_ROLE_KEY=<key>")
        raise SystemExit(1)

    if DRY_RUN:
        print("🔍  DRY RUN — no records will be inserted\n")

    total_inserted = 0
    total_skipped = 0
    total_dupe = 0
    total_rejected = 0
    rejection_reasons: dict = {}

    cities = [FILTER_CITY] if FILTER_CITY else list(CITY_BOUNDS.keys())
    categories = [FILTER_CAT] if FILTER_CAT else PRIORITY_CATEGORIES

    for city in cities:
        if city not in CITY_BOUNDS:
            print(f"⚠️  Unknown city: {city}. Options: {list(CITY_BOUNDS.keys())}")
            continue

        bounds = CITY_BOUNDS[city]
        print(f"\n{'═' * 60}")
        print(f"📍  {city}")
        print(f"{'═' * 60}")

        # Fetch existing names once per city
        existing_names: set = set()
        if not DRY_RUN:
            print(f"  Checking existing records in DB...")
            existing_names = get_existing_names(city)
            print(f"  Found {len(existing_names)} existing business names")

        for category in categories:
            osm_tags = CATEGORY_OSM_TAGS.get(category, [])
            if not osm_tags:
                continue

            print(f"\n  🏷️  {category}")

            # Build and execute Overpass query
            query = build_overpass_query(bounds, osm_tags)
            print(f"     Querying Overpass API...")
            elements = fetch_overpass(query)
            print(f"     Raw OSM results: {len(elements)}")

            # Throttle — Overpass asks for 1 req/sec courtesy limit
            time.sleep(1.5)

            # Convert to business records
            candidates = []
            for el in elements:
                biz = osm_to_business(el, city, category)
                if biz is None:
                    continue
                # Deduplicate against DB
                if biz["name"].lower() in existing_names:
                    total_dupe += 1
                    continue
                # Also deduplicate within this batch
                if biz["name"].lower() in {c["name"].lower() for c in candidates}:
                    continue
                # ── Ingestion safeguard (3-rule validation) ──────────────────
                valid, reason = validate_record(biz)
                if not valid:
                    total_rejected += 1
                    rejection_reasons[reason] = rejection_reasons.get(reason, 0) + 1
                    continue
                # ─────────────────────────────────────────────────────────────
                candidates.append(biz)
                existing_names.add(biz["name"].lower())  # Mark as seen

            print(f"     Valid new records: {len(candidates)}")

            if DRY_RUN:
                for b in candidates[:5]:
                    print(f"       • {b['name']} — {b['address']}")
                if len(candidates) > 5:
                    print(f"       … and {len(candidates) - 5} more")
                total_inserted += len(candidates)
                continue

            if candidates:
                inserted, failed = insert_businesses(candidates)
                total_inserted += inserted
                total_skipped += failed
                print(f"     ✅  Inserted {inserted}  |  ❌ Failed {failed}")
            else:
                print(f"     — No new records to insert")

    print(f"\n{'═' * 60}")
    print(f"📊  SUMMARY")
    print(f"{'═' * 60}")
    if DRY_RUN:
        print(f"   Would insert:    {total_inserted}")
    else:
        print(f"   Inserted:        {total_inserted}")
        print(f"   Failed:          {total_skipped}")
    print(f"   Dupes skipped:   {total_dupe}")
    print(f"   Safeguard rejected: {total_rejected}")
    if rejection_reasons:
        for reason, count in sorted(rejection_reasons.items(), key=lambda x: -x[1]):
            label = {
                "RULE1_NO_ADDRESS":      "Rule 1 — no address",
                "RULE1_NO_STREET_NUMBER":"Rule 1 — no street number",
                "RULE2_EMPTY_PHONE":     "Rule 2 — empty phone",
                "RULE2_PHONE_TOO_SHORT": "Rule 2 — phone too short",
                "RULE2_FAKE_555":        "Rule 2 — 555 fake phone",
                "RULE3_GENERIC_NAME":    "Rule 3 — generic name",
            }.get(reason, reason)
            print(f"     {count:4d}  {label}")
    print(f"\n✅  Done. All new records are status='pending', verified=false.")
    print(f"    Ingestion safeguard active — fabricated/incomplete records blocked.")
    print(f"    Run audit_completeness.py next to check data quality.")
    print(f"    Then use the SQL promotion script to approve quality records.")

if __name__ == "__main__":
    main()
