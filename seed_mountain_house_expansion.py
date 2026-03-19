#!/usr/bin/env python3
"""
MoHoLocal — Mountain House Expansion Seed Script
Targets ~80–100 total verified listings across all 9 categories.

Mountain House (ZIP 95391) is a small planned community. This script uses
a broader bounding box than seed_overpass.py to capture the full town center
and surrounding commercial corridors on W Grant Line Rd.

Uses Overpass/OSM — no API key required.
All records inserted as status='pending', verified=false (default).

Usage:
    python3 seed_mountain_house_expansion.py              # dry run preview
    python3 seed_mountain_house_expansion.py --insert     # insert to Supabase
    python3 seed_mountain_house_expansion.py --insert --force-approve  # ⚠️ founder only

Requires: SUPABASE_SERVICE_ROLE_KEY in moho-app-scaffold/.env.local
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path
from typing import Optional

# ── Env loader ─────────────────────────────────────────────────────────────────

def _load_env_local() -> None:
    script_dir = Path(__file__).parent.resolve()
    candidates = [
        script_dir / ".env.local",
        script_dir.parent / "moho-app-scaffold" / ".env.local",
    ]
    for path in candidates:
        if path.exists():
            for line in path.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())
            print(f"✅ Loaded env from {path}")
            break

_load_env_local()

# ── Config ─────────────────────────────────────────────────────────────────────

SUPABASE_URL = "https://ozjlfgipfzykzrjakwzb.supabase.co"
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_KEY")
)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Mountain House broader bounding box: captures full town + W Grant Line Rd corridor
# Slightly wider than seed_overpass.py to catch edge businesses
MH_BOUNDS = (37.7550, -121.5750, 37.8050, -121.5100)

# OSM tags → MoHoLocal categories
CATEGORY_TAGS = {
    "Restaurants": [
        ("amenity", "restaurant"),
        ("amenity", "fast_food"),
        ("amenity", "cafe"),
        ("amenity", "bar"),
        ("amenity", "pub"),
        ("amenity", "ice_cream"),
        ("amenity", "food_court"),
    ],
    "Health & Wellness": [
        ("amenity", "dentist"),
        ("amenity", "doctors"),
        ("amenity", "clinic"),
        ("amenity", "pharmacy"),
        ("amenity", "optician"),
        ("healthcare", "physiotherapist"),
        ("amenity", "hospital"),
        ("amenity", "veterinary"),
        ("leisure", "fitness_centre"),
        ("leisure", "sports_centre"),
        ("amenity", "spa"),
    ],
    "Beauty & Spa": [
        ("shop", "hairdresser"),
        ("shop", "beauty"),
        ("shop", "cosmetics"),
        ("shop", "massage"),
        ("amenity", "beauty_salon"),
        ("shop", "nail_salon"),
    ],
    "Retail": [
        ("shop", "supermarket"),
        ("shop", "convenience"),
        ("shop", "clothes"),
        ("shop", "shoes"),
        ("shop", "electronics"),
        ("shop", "books"),
        ("shop", "sports"),
        ("shop", "toys"),
        ("shop", "jewelry"),
        ("shop", "florist"),
        ("shop", "gift"),
        ("shop", "bakery"),
        ("shop", "butcher"),
        ("shop", "deli"),
        ("shop", "greengrocer"),
    ],
    "Education": [
        ("amenity", "school"),
        ("amenity", "kindergarten"),
        ("amenity", "childcare"),
        ("amenity", "college"),
        ("amenity", "library"),
        ("amenity", "tutoring"),
        ("shop", "tutoring"),
    ],
    "Automotive": [
        ("amenity", "car_repair"),
        ("amenity", "car_wash"),
        ("amenity", "fuel"),
        ("shop", "car"),
        ("shop", "car_parts"),
        ("shop", "tyres"),
        ("amenity", "car_rental"),
    ],
    "Real Estate": [
        ("office", "estate_agent"),
        ("office", "real_estate"),
    ],
    "Home Services": [
        ("shop", "hardware"),
        ("shop", "doityourself"),
        ("craft", "plumber"),
        ("craft", "electrician"),
        ("craft", "painter"),
        ("craft", "carpenter"),
        ("shop", "locksmith"),
        ("amenity", "storage_rental"),
    ],
    "Pet Services": [
        ("amenity", "veterinary"),
        ("shop", "pet"),
        ("shop", "grooming"),
        ("amenity", "animal_shelter"),
        ("leisure", "dog_park"),
    ],
}

# Names to skip — chains with no local value for directory
SKIP_NAMES = {
    "mcdonald's", "subway", "taco bell", "pizza hut", "domino's",
    "burger king", "wendy's", "jack in the box", "popeyes",
    "dollar tree", "dollar general", "family dollar",
    "7-eleven", "7eleven",
}

# ── 3-Rule Ingestion Safeguard ─────────────────────────────────────────────────

def validate_record(name: str, address: str, phone: str) -> Optional[str]:
    """Returns None if valid, or a rejection reason string."""
    # Rule 1: address must start with a street number
    if not address or not re.match(r"^\d", address.strip()):
        return f"Rule 1 fail — address doesn't start with number: '{address}'"
    # Rule 2: phone must be present and not synthetic
    if not phone or len(re.sub(r"\D", "", phone)) < 7:
        return f"Rule 2 fail — phone missing or too short: '{phone}'"
    # Rule 3: business name must not be generic placeholder
    generic = {"business", "company", "store", "shop", "place", "unknown", "n/a", ""}
    if name.strip().lower() in generic or len(name.strip()) < 3:
        return f"Rule 3 fail — generic or missing name: '{name}'"
    return None

# ── Overpass fetcher ───────────────────────────────────────────────────────────

def fetch_overpass(osm_key: str, osm_value: str, bounds: tuple) -> list:
    """Fetch nodes/ways/relations from Overpass for a tag + bounding box."""
    south, west, north, east = bounds
    bbox = f"{south},{west},{north},{east}"
    query = f"""
[out:json][timeout:30];
(
  node["{osm_key}"="{osm_value}"]({bbox});
  way["{osm_key}"="{osm_value}"]({bbox});
  relation["{osm_key}"="{osm_value}"]({bbox});
);
out center tags;
""".strip()
    data = urllib.parse.urlencode({"data": query}).encode()
    req = urllib.request.Request(OVERPASS_URL, data=data)
    req.add_header("User-Agent", "MoHoLocal-Seed/1.0 (moholocal.com)")
    try:
        with urllib.request.urlopen(req, timeout=35) as resp:
            return json.loads(resp.read().decode())["elements"]
    except Exception as e:
        print(f"  ⚠️  Overpass error [{osm_key}={osm_value}]: {e}")
        return []

def extract_fields(element: dict) -> dict:
    """Extract name/address/phone from OSM element tags."""
    tags = element.get("tags", {})
    lat = element.get("lat") or element.get("center", {}).get("lat")
    lon = element.get("lon") or element.get("center", {}).get("lon")

    name    = tags.get("name", "").strip()
    housenr = tags.get("addr:housenumber", "").strip()
    street  = tags.get("addr:street", "").strip()
    address = f"{housenr} {street}".strip() if housenr and street else ""
    phone   = tags.get("phone", tags.get("contact:phone", "")).strip()
    website = tags.get("website", tags.get("contact:website", "")).strip()
    hours   = tags.get("opening_hours", "").strip()

    return {
        "name": name,
        "address": address,
        "phone": phone,
        "website": website,
        "hours": hours or None,
        "lat": lat,
        "lon": lon,
        "osm_id": element.get("id"),
    }

# ── Supabase helpers ───────────────────────────────────────────────────────────

def get_existing_records() -> set:
    """Fetch existing (name, city) pairs to prevent duplicates."""
    url = f"{SUPABASE_URL}/rest/v1/businesses?city=eq.Mountain+House&select=name,address"
    req = urllib.request.Request(url)
    req.add_header("apikey", SUPABASE_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            rows = json.loads(resp.read().decode())
            return {(r["name"].strip().lower(), r.get("address", "").strip().lower()) for r in rows}
    except Exception as e:
        print(f"⚠️  Could not fetch existing records: {e}")
        return set()

def insert_business(record: dict) -> bool:
    """Insert one business into Supabase. Returns True on success."""
    url = f"{SUPABASE_URL}/rest/v1/businesses"
    data = json.dumps(record).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("apikey", SUPABASE_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=minimal")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status in (200, 201)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "duplicate" in body.lower() or "unique" in body.lower():
            return False  # silent dedup
        print(f"  ❌ Insert error: {e.code} — {body[:200]}")
        return False

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    dry_run     = "--insert" not in sys.argv
    force_approve = "--force-approve" in sys.argv

    if dry_run:
        print("🔍 DRY RUN — no records will be inserted")
        print("   Add --insert to insert into Supabase\n")
    else:
        if not SUPABASE_KEY:
            print("❌ SUPABASE_SERVICE_ROLE_KEY not found in env or .env.local")
            sys.exit(1)
        print(f"✅ Supabase key loaded ({SUPABASE_KEY[:20]}...)")
        if force_approve:
            print("⚠️  --force-approve: records will be status='approved', verified=true")
            print("   Only use this if OSM data has been spot-checked\n")
        else:
            print("   Records will be status='pending', verified=false (default)\n")

    existing = get_existing_records() if not dry_run else set()
    print(f"📊 Existing Mountain House records in DB: {len(existing)}\n")

    total_discovered = 0
    total_inserted   = 0
    total_skipped    = 0
    total_rejected   = 0

    seen_this_run: set = set()  # dedup within this run

    for category, tag_list in CATEGORY_TAGS.items():
        cat_count = 0
        print(f"\n📂 {category}")

        for osm_key, osm_value in tag_list:
            elements = fetch_overpass(osm_key, osm_value, MH_BOUNDS)
            time.sleep(0.5)  # rate limit Overpass

            for el in elements:
                fields = extract_fields(el)
                name    = fields["name"]
                address = fields["address"]
                phone   = fields["phone"]

                if not name:
                    continue

                # Skip chains
                if name.strip().lower() in SKIP_NAMES:
                    continue

                # Dedup within run
                dedup_key = (name.lower(), address.lower())
                if dedup_key in seen_this_run:
                    continue
                seen_this_run.add(dedup_key)
                total_discovered += 1

                # 3-rule validation
                rejection = validate_record(name, address, phone)
                if rejection:
                    total_rejected += 1
                    if dry_run:
                        print(f"  ⛔ REJECT [{category}] {name} — {rejection}")
                    continue

                # Already in DB?
                if dedup_key in existing:
                    total_skipped += 1
                    continue

                cat_count += 1

                record = {
                    "name":        name,
                    "description": f"Local {category.lower()} in Mountain House, CA.",
                    "category":    category,
                    "city":        "Mountain House",
                    "address":     address,
                    "phone":       phone,
                    "website":     fields["website"] or None,
                    "hours":       fields["hours"],
                    "status":      "approved" if force_approve else "pending",
                    "verified":    force_approve,
                    "claimed":     False,
                }

                if dry_run:
                    print(f"  ✅ [{category}] {name} | {address} | {phone}")
                else:
                    ok = insert_business(record)
                    if ok:
                        total_inserted += 1
                        print(f"  ✅ Inserted: {name}")
                    else:
                        total_skipped += 1

        if cat_count == 0 and dry_run:
            print(f"  (no valid new records found for this category)")

    print(f"""
─────────────────────────────────────────────
MOUNTAIN HOUSE EXPANSION SEED — SUMMARY
─────────────────────────────────────────────
Discovered (from OSM):  {total_discovered}
Rejected (3-rule fail): {total_rejected}
Skipped (already in DB):{total_skipped}
{"Inserted (preview only)" if dry_run else "Inserted (to Supabase)"}:{total_inserted if not dry_run else total_discovered - total_rejected - total_skipped}
─────────────────────────────────────────────
""")

    if not dry_run and not force_approve:
        print("📋 Next step: run verify_business_places.py --city 'Mountain House'")
        print("   to enrich verified listings with Google Places photos.\n")

if __name__ == "__main__":
    main()
