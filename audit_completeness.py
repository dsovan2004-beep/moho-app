#!/usr/bin/env python3
"""
MoHoLocal — Business completeness audit
Checks pending records for data quality before bulk promotion.

Outputs:
  - Category/city breakdown of pending records
  - Completeness scores per record
  - Promotion-ready count (meets minimum quality bar)
  - Records missing critical fields (flagged for manual review)
  - SQL block to bulk-promote quality records

Usage:
    SUPABASE_SERVICE_ROLE_KEY=<key> python3 audit_completeness.py
    SUPABASE_SERVICE_ROLE_KEY=<key> python3 audit_completeness.py --city Tracy
    SUPABASE_SERVICE_ROLE_KEY=<key> python3 audit_completeness.py --output-sql  # print SQL only
"""

import json
import os
import sys
import urllib.request
import urllib.parse
from collections import defaultdict

# ── Config ─────────────────────────────────────────────────────────────────────

SUPABASE_URL = "https://ozjlfgipfzykzrjakwzb.supabase.co"
# Reads SUPABASE_SERVICE_ROLE_KEY (canonical project name) with SUPABASE_KEY as legacy fallback
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_KEY")
    or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96amxmZ2lwZnp5a3pyamFrd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzMzI3NiwiZXhwIjoyMDg4MDA5Mjc2fQ.g9f2Il1nWEfgyuvTXHUiHn4EgWsrHVV1QBbdxehT0gM"
)

OUTPUT_SQL_ONLY = "--output-sql" in sys.argv
FILTER_CITY = None
for i, arg in enumerate(sys.argv[1:]):
    if arg == "--city" and i + 1 < len(sys.argv) - 1:
        FILTER_CITY = sys.argv[i + 2]

# Quality thresholds for promotion
# A record is "promotion-ready" if it meets the minimum bar
MIN_NAME_LEN = 3
REQUIRE_ADDRESS = True
REQUIRE_PHONE_OR_WEBSITE = False  # Optional — many small businesses have neither
MIN_DESCRIPTION_LEN = 10

CITIES = ["Mountain House", "Tracy", "Lathrop", "Manteca", "Brentwood"]

# ── Fetch ──────────────────────────────────────────────────────────────────────

def fetch_pending_businesses(city: str = None) -> list:
    params = "select=id,name,city,category,address,phone,website,description,status,verified"
    params += "&status=eq.pending"
    if city:
        params += f"&city=eq.{urllib.parse.quote(city)}"
    params += "&limit=10000"

    url = f"{SUPABASE_URL}/rest/v1/businesses?{params}"
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"❌  Could not fetch businesses: {e}")
        return []

def fetch_approved_counts() -> dict:
    """Get approved+verified counts by city and category."""
    url = (
        f"{SUPABASE_URL}/rest/v1/businesses"
        f"?select=city,category&status=eq.approved&verified=eq.true&limit=10000"
    )
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            counts = defaultdict(lambda: defaultdict(int))
            for row in data:
                counts[row["city"]][row["category"]] += 1
            return counts
    except Exception as e:
        print(f"⚠️  Could not fetch approved counts: {e}")
        return {}

# ── Quality check ─────────────────────────────────────────────────────────────

def quality_score(biz: dict) -> tuple:
    """
    Returns (score 0-100, issues list, is_promotion_ready bool)
    """
    issues = []
    score = 0

    name = (biz.get("name") or "").strip()
    address = (biz.get("address") or "").strip()
    phone = (biz.get("phone") or "").strip()
    website = (biz.get("website") or "").strip()
    description = (biz.get("description") or "").strip()
    city = (biz.get("city") or "").strip()
    category = (biz.get("category") or "").strip()

    # Name (30 pts)
    if len(name) >= MIN_NAME_LEN:
        score += 30
    else:
        issues.append("name too short or missing")

    # Address (30 pts)
    if address and len(address) > 5:
        score += 30
        # Extra: address contains city name
        if city.lower() in address.lower():
            score += 5
    elif REQUIRE_ADDRESS:
        issues.append("missing address")
    else:
        score += 10  # partial credit

    # Phone or website (20 pts)
    if phone and len(phone) > 7:
        score += 20
    elif website and website.startswith("http"):
        score += 15
    else:
        issues.append("no phone or website")

    # Description (15 pts)
    if len(description) >= MIN_DESCRIPTION_LEN:
        score += 15
        if len(description) >= 50:
            score += 5  # bonus for longer descriptions
    else:
        issues.append("description too short")

    # Category (5 pts)
    valid_categories = {
        "Restaurants", "Home Services", "Health & Wellness",
        "Automotive", "Beauty & Spa", "Pet Services",
        "Education", "Real Estate", "Retail",
    }
    if category in valid_categories:
        score += 5
    else:
        issues.append(f"invalid category: {category}")

    # Cap at 100
    score = min(score, 100)

    # Promotion-ready: name + address + valid category at minimum
    is_ready = (
        len(name) >= MIN_NAME_LEN
        and len(address) > 5
        and category in valid_categories
    )

    return score, issues, is_ready

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not SUPABASE_KEY:
        print("❌  Set SUPABASE_SERVICE_ROLE_KEY env var first:  export SUPABASE_SERVICE_ROLE_KEY=<key>")
        raise SystemExit(1)

    print("📊  Fetching pending records from Supabase...")
    pending = fetch_pending_businesses(FILTER_CITY)
    print(f"    Found {len(pending)} pending records")

    print("\n📊  Fetching approved+verified counts...")
    approved_counts = fetch_approved_counts()

    # Analyze
    city_cat_pending = defaultdict(lambda: defaultdict(int))
    city_cat_ready = defaultdict(lambda: defaultdict(int))
    all_issues = []
    ready_ids = []
    not_ready_ids = []

    for biz in pending:
        score, issues, is_ready = quality_score(biz)
        city = biz.get("city", "Unknown")
        cat = biz.get("category", "Unknown")

        city_cat_pending[city][cat] += 1

        if is_ready:
            city_cat_ready[city][cat] += 1
            ready_ids.append(biz["id"])
        else:
            not_ready_ids.append(biz["id"])
            if issues:
                all_issues.append({
                    "name": biz.get("name", ""),
                    "city": city,
                    "category": cat,
                    "issues": issues,
                    "score": score,
                })

    if OUTPUT_SQL_ONLY:
        print_sql_block(ready_ids, approved_counts)
        return

    # ── Report ────────────────────────────────────────────────────────────────

    print(f"\n{'═' * 70}")
    print(f"  CURRENT APPROVED + VERIFIED LISTINGS (live on site)")
    print(f"{'═' * 70}")

    CATEGORIES = [
        "Restaurants", "Home Services", "Health & Wellness",
        "Beauty & Spa", "Automotive", "Pet Services",
    ]
    cities = [FILTER_CITY] if FILTER_CITY else CITIES

    for city in cities:
        total_approved = sum(approved_counts.get(city, {}).values())
        print(f"\n  📍  {city} — {total_approved} approved+verified total")
        for cat in CATEGORIES:
            approved = approved_counts.get(city, {}).get(cat, 0)
            pending_count = city_cat_pending.get(city, {}).get(cat, 0)
            ready_count = city_cat_ready.get(city, {}).get(cat, 0)

            bar = "✅" if approved >= 20 else ("⚠️" if approved >= 5 else "❌")
            fifa_note = " ← FIFA threshold" if cat == "Restaurants" and approved + ready_count >= 10 else ""

            print(f"     {bar}  {cat:<22} approved={approved:<4} pending={pending_count:<4} promotion-ready={ready_count}{fifa_note}")

    print(f"\n{'═' * 70}")
    print(f"  PROMOTION SUMMARY")
    print(f"{'═' * 70}")
    print(f"  Total pending:          {len(pending)}")
    print(f"  Promotion-ready:        {len(ready_ids)}")
    print(f"  Needs review/fix:       {len(not_ready_ids)}")

    if all_issues[:10]:
        print(f"\n  Sample records needing attention (first 10):")
        for item in all_issues[:10]:
            print(f"    • {item['name']} ({item['city']}, {item['category']}) — {', '.join(item['issues'])}")
        if len(all_issues) > 10:
            print(f"    … and {len(all_issues) - 10} more")

    # ── FIFA readiness check ──────────────────────────────────────────────────
    print(f"\n{'═' * 70}")
    print(f"  FIFA PAGE READINESS")
    print(f"{'═' * 70}")

    fifa_pages = [
        {
            "route": "/restaurants-near-levis-stadium",
            "desc": "Restaurants near Levi's Stadium",
            "cities": ["Tracy", "Mountain House"],
            "cat": "Restaurants",
            "threshold": 10,
        },
        {
            "route": "/coffee-near-levis-stadium",
            "desc": "Coffee near Levi's Stadium",
            "cities": ["Tracy", "Mountain House"],
            "cat": "Restaurants",  # coffee shops in restaurant category
            "threshold": 5,
        },
        {
            "route": "/best-bars-watch-world-cup-san-jose",
            "desc": "Bars to watch World Cup near San Jose",
            "cities": ["Tracy", "Manteca"],
            "cat": "Restaurants",
            "threshold": 8,
        },
        {
            "route": "/late-night-food-santa-clara",
            "desc": "Late night food near Santa Clara",
            "cities": ["Tracy", "Mountain House", "Lathrop", "Manteca", "Brentwood"],
            "cat": "Restaurants",
            "threshold": 10,
        },
    ]

    for page in fifa_pages:
        total = sum(
            approved_counts.get(city, {}).get(page["cat"], 0)
            for city in page["cities"]
        )
        total_with_pending = total + sum(
            city_cat_ready.get(city, {}).get(page["cat"], 0)
            for city in page["cities"]
        )
        ready = total >= page["threshold"]
        ready_after_promote = total_with_pending >= page["threshold"]

        status = "✅ READY NOW" if ready else ("🟡 READY AFTER PROMOTION" if ready_after_promote else "❌ NOT YET")
        print(f"\n  {status}")
        print(f"  {page['route']}")
        print(f"  Need {page['threshold']} approved | Have {total} approved | {total_with_pending} after promotion")

    # ── SQL block ─────────────────────────────────────────────────────────────
    print(f"\n{'═' * 70}")
    print_sql_block(ready_ids, approved_counts)


def print_sql_block(ready_ids: list, approved_counts: dict):
    if not ready_ids:
        print("  No promotion-ready records found.")
        return

    id_list = ", ".join(f"'{id}'" for id in ready_ids)

    print(f"""
{'═' * 70}
  SQL PROMOTION BLOCK
  Paste this into Supabase SQL editor → Run
  (Spot-check the records above first — this is irreversible)
{'═' * 70}

-- Bulk-promote {len(ready_ids)} quality pending records to approved+verified
-- Generated by audit_completeness.py
-- Verify a sample of records in the Supabase table editor before running.

BEGIN;

UPDATE businesses
SET
  status    = 'approved',
  verified  = true
WHERE
  id IN ({id_list})
  AND status = 'pending'
  AND verified = false;

-- Verify the count before committing:
SELECT COUNT(*) FROM businesses WHERE status = 'approved' AND verified = true;

COMMIT;

-- To roll back if needed (before COMMIT):
-- ROLLBACK;
{'═' * 70}
""")
    print(f"  {len(ready_ids)} records queued for promotion.")
    print(f"  Copy the SQL block above and run it in Supabase SQL editor.")


if __name__ == "__main__":
    main()
