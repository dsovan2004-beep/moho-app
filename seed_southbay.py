#!/usr/bin/env python3
"""
MoHoLocal — South Bay seed script (San Jose · Santa Clara · Sunnyvale)

Pulls bars, restaurants, and cafes from OpenStreetMap via Overpass API.
Follows the same 3-rule ingestion safeguard as seed_overpass.py.

Data license: ODbL (openstreetmap.org/copyright)

⚠️  SCOPE NOTE
These cities are outside the core 209/San Joaquin County territory.
This script was created specifically to support FIFA World Cup 2026 traffic
and South Bay search intent for users landing on /restaurants-near-levis-stadium
and related discovery pages.

⚠️  TRUST MODEL NOTE
By default, records are inserted as status='pending', verified=false.
Pass --force-approve to insert as status='approved', verified=true.
Only use --force-approve when you have verified the OSM data quality.

Usage:
    SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_southbay.py
    SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_southbay.py --dry-run
    SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_southbay.py --force-approve
    SUPABASE_SERVICE_ROLE_KEY=<key> python3 seed_southbay.py --city "San Jose" --force-approve
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
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_KEY")
    or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96amxmZ2lwZnp5a3pyamFrd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzMzI3NiwiZXhwIjoyMDg4MDA5Mjc2fQ.g9f2Il1nWEfgyuvTXHUiHn4EgWsrHVV1QBbdxehT0gM"
)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# South Bay bounding boxes: [south, west, north, east]
# Focused on the city cores to get quality bar/restaurant density
CITY_BOUNDS = {
    "San Jose":     (37.2800, -122.0200, 37.4200, -121.7800),
    "Santa Clara":  (37.3100, -122.0650, 37.4000, -121.9100),
    "Sunnyvale":    (37.3350, -122.0650, 37.4100, -122.0000),
}

# OSM tags for bars, restaurants, and cafes only
# All map to the "Restaurants" category in MoHoLocal schema
FOOD_AND_DRINK_TAGS = [
    ("amenity", "restaurant"),
    ("amenity", "fast_food"),
    ("amenity", "cafe"),
    ("amenity", "bar"),
    ("amenity", "pub"),
    ("amenity", "biergarten"),
    ("amenity", "food_court"),
]

# Known national chains to skip — we want local/independent businesses
SKIP_NAMES = {
    "mcdonald's", "subway", "starbucks", "walmart", "target", "costco",
    "7-eleven", "7eleven", "dollar tree", "dollar general", "family dollar",
    "cvs", "walgreens", "rite aid", "home depot", "lowe's", "lowes",
    "autozone", "o'reilly auto parts", "o reilly", "advance auto parts",
    "panda express", "taco bell", "jack in the box", "burger king",
    "wendy's", "wendys", "in-n-out", "in n out", "chick-fil-a", "chick fil a",
    "chipotle", "domino's", "pizza hut", "little caesars", "papa john's",
    "kfc", "popeyes", "del taco", "wingstop", "raising cane's",
    "chase bank", "wells fargo", "bank of america",
    "shell", "chevron", "arco", "76", "valero",
    "denny's", "ihop", "applebee's", "olive garden", "red lobster",
    "outback steakhouse", "cheesecake factory", "p.f. chang's",
    "jersey mike's", "jimmy john's", "firehouse subs", "potbelly",
}

# Generic placeholder names — Rule 3 rejects these
GENERIC_NAMES = {
    "restaurant", "cafe", "café", "coffee", "food", "bar", "grill", "kitchen",
    "diner", "eatery", "bistro", "pizza", "burger", "thai", "chinese",
    "mexican", "indian", "sushi", "fast food", "takeaway", "takeout",
    "snack bar", "refreshments", "unnamed", "unknown", "pub",
    "bar & grill", "bar and grill",
}

# ── CLI flags ──────────────────────────────────────────────────────────────────

DRY_RUN      = "--dry-run"      in sys.argv
FORCE_APPROVE = "--force-approve" in sys.argv

FILTER_CITY: Optional[str] = None
for i, arg in enumerate(sys.argv[1:]):
    if arg == "--city" and i + 1 < len(sys.argv) - 1:
        FILTER_CITY = sys.argv[i + 2]

# ── Ingestion safeguard ────────────────────────────────────────────────────────

def validate_record(biz: dict) -> Tuple[bool, str]:
    """
    3-rule ingestion safeguard — same rules as seed_overpass.py.
    Rule 1: Address must start with a street number.
    Rule 2: Phone must be present, not 555-fake, at least 7 digits.
    Rule 3: Business name must not be a generic placeholder.
    """
    name    = (biz.get("name")    or "").strip()
    address = (biz.get("address") or "").strip()
    phone   = (biz.get("phone")   or "").strip()

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
    if re.search(r"555.?0\d{3}", phone):
        return False, "RULE2_FAKE_555"

    # Rule 3 — name must not be a generic placeholder
    if name.lower() in GENERIC_NAMES:
        return False, "RULE3_GENERIC_NAME"

    return True, "OK"

# ── Overpass ───────────────────────────────────────────────────────────────────

def build_overpass_query(bounds: tuple, osm_tags: list) -> str:
    south, west, north, east = bounds
    bbox = f"{south},{west},{north},{east}"
    tag_queries = ""
    for key, value in osm_tags:
        tag_queries += f'  node["{key}"="{value}"]({bbox});\n'
        tag_queries += f'  way["{key}"="{value}"]({bbox});\n'
    return f"""
[out:json][timeout:45];
(
{tag_queries.rstrip()}
);
out center tags;
"""

def fetch_overpass(query: str) -> list:
    encoded = urllib.parse.urlencode({"data": query}).encode("utf-8")
    req = urllib.request.Request(
        OVERPASS_URL,
        data=encoded,
        headers={"User-Agent": "MoHoLocal/1.0 (moholocal.com; hello@moholocal.com)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("elements", [])
    except urllib.error.HTTPError as e:
        print(f"  ⚠️  Overpass HTTP {e.code}: {e.reason}")
        return []
    except Exception as e:
        print(f"  ⚠️  Overpass error: {e}")
        return []

# ── OSM element → MoHoLocal business ─────────────────────────────────────────

def osm_to_business(element: dict, city: str) -> Optional[dict]:
    tags = element.get("tags", {})

    name = tags.get("name", "").strip()
    if not name or len(name) < 2:
        return None

    if name.lower() in SKIP_NAMES:
        return None

    # Address
    housenumber = tags.get("addr:housenumber", "")
    street      = tags.get("addr:street", "")
    postcode    = tags.get("addr:postcode", "")
    state       = tags.get("addr:state", "CA")

    if housenumber and street:
        address = f"{housenumber} {street}, {city}, {state} {postcode}".strip().rstrip(",")
    elif street:
        address = f"{street}, {city}, {state}"
    else:
        address = f"{city}, CA"

    # Phone — accept 408, 669, 650, 510, 415, 831 area codes for South Bay
    phone = (
        tags.get("phone", "")
        or tags.get("contact:phone", "")
        or tags.get("telephone", "")
    ).strip()
    VALID_PREFIXES = ("+1", "(", "1-", "408", "669", "650", "510", "415", "831", "209", "925")
    if phone and not phone.startswith(VALID_PREFIXES):
        phone = ""

    website = (
        tags.get("website", "")
        or tags.get("contact:website", "")
        or tags.get("url", "")
    ).strip()
    if website and not website.startswith(("http://", "https://")):
        website = "https://" + website

    # Category — determine from OSM amenity tag
    amenity = tags.get("amenity", "")
    cuisine = tags.get("cuisine", "")

    if amenity in ("bar", "pub", "biergarten"):
        category = "Restaurants"  # No separate Bars category in schema
        if cuisine:
            description = f"Bar serving {cuisine.replace(';', ', ').title()} food in {city}."
        else:
            description = f"Local bar and pub in {city}."
    elif amenity == "cafe":
        category = "Restaurants"
        description = f"Café and coffee shop in {city}."
    elif amenity == "fast_food":
        category = "Restaurants"
        if cuisine:
            description = f"Quick-service {cuisine.replace(';', ', ').title()} spot in {city}."
        else:
            description = f"Quick-service restaurant in {city}."
    else:
        category = "Restaurants"
        if cuisine:
            description = f"{cuisine.replace(';', ', ').title()} restaurant in {city}."
        else:
            description = f"Local restaurant in {city}."

    return {
        "name":         name,
        "category":     category,
        "city":         city,
        "description":  description,
        "address":      address,
        "phone":        phone,
        "website":      website,
        "status":       "approved" if FORCE_APPROVE else "pending",
        "verified":     FORCE_APPROVE,
        "claimed":      False,
        "rating":       0,
        "review_count": 0,
    }

# ── Supabase ──────────────────────────────────────────────────────────────────

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
        print("❌  Set SUPABASE_SERVICE_ROLE_KEY env var first.")
        raise SystemExit(1)

    print("=" * 60)
    print("MoHoLocal — South Bay Seed Script")
    print("=" * 60)

    if DRY_RUN:
        print("🔍  DRY RUN — no records will be inserted\n")

    if FORCE_APPROVE:
        print("⚠️  --force-approve active:")
        print("    Records will be inserted as status='approved', verified=true.")
        print("    This overrides the standard trust model.")
        print("    Confirm: only pass this flag when data quality is acceptable.\n")
    else:
        print("ℹ️  Records will be inserted as status='pending', verified=false.")
        print("    Use --force-approve to insert as approved+verified.\n")

    total_inserted   = 0
    total_skipped    = 0
    total_dupe       = 0
    total_rejected   = 0
    rejection_reasons: dict = {}

    cities = [FILTER_CITY] if FILTER_CITY else list(CITY_BOUNDS.keys())

    for city in cities:
        if city not in CITY_BOUNDS:
            print(f"⚠️  Unknown city: {city}. Options: {list(CITY_BOUNDS.keys())}")
            continue

        bounds = CITY_BOUNDS[city]
        print(f"\n{'═' * 60}")
        print(f"📍  {city}")
        print(f"{'═' * 60}")

        existing_names: set = set()
        if not DRY_RUN:
            print(f"  Checking existing records in DB...")
            existing_names = get_existing_names(city)
            print(f"  Found {len(existing_names)} existing business names")

        print(f"\n  🍽️  Bars / Restaurants / Cafes")
        query    = build_overpass_query(bounds, FOOD_AND_DRINK_TAGS)
        print(f"     Querying Overpass API (South Bay bbox)...")
        elements = fetch_overpass(query)
        print(f"     Raw OSM results: {len(elements)}")
        time.sleep(2)  # Overpass courtesy delay

        candidates = []
        for el in elements:
            biz = osm_to_business(el, city)
            if biz is None:
                continue
            if biz["name"].lower() in existing_names:
                total_dupe += 1
                continue
            if biz["name"].lower() in {c["name"].lower() for c in candidates}:
                continue
            valid, reason = validate_record(biz)
            if not valid:
                total_rejected += 1
                rejection_reasons[reason] = rejection_reasons.get(reason, 0) + 1
                continue
            candidates.append(biz)
            existing_names.add(biz["name"].lower())

        print(f"     Valid new records: {len(candidates)}")

        if DRY_RUN:
            for b in candidates[:8]:
                verified_flag = "✅ approved+verified" if FORCE_APPROVE else "⏳ pending"
                print(f"       • {b['name']} — {b['address']}  [{verified_flag}]")
            if len(candidates) > 8:
                print(f"       … and {len(candidates) - 8} more")
            total_inserted += len(candidates)
            continue

        if candidates:
            inserted, failed = insert_businesses(candidates)
            total_inserted += inserted
            total_skipped  += failed
            status_label = "approved+verified" if FORCE_APPROVE else "pending"
            print(f"     ✅  Inserted {inserted} ({status_label})  |  ❌ Failed {failed}")
        else:
            print(f"     — No new records to insert")

    print(f"\n{'═' * 60}")
    print(f"📊  SUMMARY")
    print(f"{'═' * 60}")
    if DRY_RUN:
        print(f"   Would insert:       {total_inserted}")
    else:
        print(f"   Inserted:           {total_inserted}")
        print(f"   Failed:             {total_skipped}")
    print(f"   Dupes skipped:      {total_dupe}")
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

    if FORCE_APPROVE:
        print(f"\n⚠️  Records inserted as approved+verified (--force-approve was set).")
    else:
        print(f"\n✅  Done. All records inserted as status='pending', verified=false.")
        print(f"    To promote records: UPDATE businesses SET status='approved', verified=true")
        print(f"    WHERE city IN ('San Jose','Santa Clara','Sunnyvale') AND status='pending';")

if __name__ == "__main__":
    main()
