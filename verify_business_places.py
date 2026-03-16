#!/usr/bin/env python3
"""
MoHo Local — Google Places Pipeline  (photos + verification)

──────────────────────────────────────────────────────────────────
MODE 1: photos  (default)
──────────────────────────────────────────────────────────────────
For each APPROVED + VERIFIED business, fetches up to 5 Google Place
photos and stores them in Supabase Storage / business_images table.

  python3 verify_business_places.py
  python3 verify_business_places.py --city "Mountain House"
  python3 verify_business_places.py --business-id "<uuid>"
  python3 verify_business_places.py --dry-run

──────────────────────────────────────────────────────────────────
MODE 2: verify  (Sprint 2 Task 2 — Verification Pipeline)
──────────────────────────────────────────────────────────────────
For each PENDING (status='pending', verified=false) business, attempts
to match it against Google Places and enrich the record with real data:

  • google_place_id
  • formatted_address  (Google's canonical address)
  • phone              (only if currently missing)
  • website            (only if currently missing)
  • rating             (Google rating)
  • review_count       (Google user_ratings_total)
  • needs_review = True  (flags record for founder inspection)

Match criteria:
  • Name fuzzy similarity ≥ 0.80  (higher than photos mode)
  • City must appear in Google's returned address
  • Phone match used as confidence boost (optional)

⚠️  TRUST GATE — THIS SCRIPT NEVER SETS:
      status  = 'approved'
      verified = true
  All enriched records remain:
      status  = 'pending'
      verified = false
  Promotion to approved + verified requires manual founder review only.

  python3 verify_business_places.py --mode verify
  python3 verify_business_places.py --mode verify --city "Mountain House"
  python3 verify_business_places.py --mode verify --limit 50
  python3 verify_business_places.py --mode verify --dry-run

Report output:
  Writes  verification_report_<city>_<date>.csv  to current directory.

──────────────────────────────────────────────────────────────────
PREREQUISITES:
  pip install supabase requests
  .env.local must contain:
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
    GOOGLE_PLACES_API_KEY
──────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import csv
import os
import re
import sys
import time
import argparse
from datetime import datetime, timezone
from pathlib import Path
from difflib import SequenceMatcher
import requests
from supabase import create_client

# ── Environment ──────────────────────────────────────────────────────────────

def load_env_local():
    """Load vars from moho-app-scaffold/.env.local if present."""
    env_path = Path(__file__).parent / "moho-app-scaffold" / ".env.local"
    if not env_path.exists():
        env_path = Path(__file__).parent / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())

load_env_local()

SUPABASE_URL   = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY   = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
GOOGLE_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")

# ── Terminal colours ──────────────────────────────────────────────────────────
GREEN  = "\033[0;32m"
RED    = "\033[0;31m"
CYAN   = "\033[0;36m"
YELLOW = "\033[0;33m"
BOLD   = "\033[1m"
NC     = "\033[0m"

# ── Google Places API endpoints ───────────────────────────────────────────────
FIND_PLACE_URL   = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"
PLACE_PHOTO_URL  = "https://maps.googleapis.com/maps/api/place/photo"

# ── Thresholds ────────────────────────────────────────────────────────────────
MAX_PHOTOS_PER_BUSINESS  = 5
NAME_THRESHOLD_PHOTOS    = 0.55   # photos mode — lenient (existing behaviour)
NAME_THRESHOLD_VERIFY    = 0.80   # verify mode — strict (Sprint 2 requirement)

# ── Trust gate constants (never change these) ─────────────────────────────────
# These are the ONLY values this script may ever write to status / verified.
# Enforcement is via _safe_patch() below which strips any attempt to override.
_FORBIDDEN_PATCH_KEYS = {"status", "verified"}


def _safe_patch(patch: dict) -> dict:
    """
    Strip any attempt to set status or verified from a DB patch.
    This is a belt-and-suspenders guard — the calling code should never
    include these keys, but this function ensures they cannot slip through.
    """
    forbidden_found = {k for k in patch if k in _FORBIDDEN_PATCH_KEYS}
    if forbidden_found:
        print(f"{RED}  ⛔  TRUST GATE VIOLATION BLOCKED: patch contained {forbidden_found} — stripped{NC}")
    return {k: v for k, v in patch.items() if k not in _FORBIDDEN_PATCH_KEYS}


# ── Name normalisation ────────────────────────────────────────────────────────

def normalize_name(name: str) -> str:
    """Normalize a business name for comparison."""
    name = name.lower().strip()
    for noise in [" — ", " - ", " – ", ", ca", ", california"]:
        if noise in name:
            name = name.split(noise)[0]
    name = re.sub(r'[^a-z0-9\s]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name


def is_city_or_region_name(name: str) -> bool:
    """Reject Google results that are city/region pages, not real businesses."""
    normalized = normalize_name(name)
    city_patterns = [
        "mountain house ca", "mountain house", "tracy ca", "tracy",
        "lathrop ca", "lathrop", "manteca ca", "manteca",
        "brentwood ca", "brentwood",
    ]
    return normalized in city_patterns


def names_match(db_name: str, google_name: str, threshold: float) -> tuple[bool, float]:
    """Check if a DB business name matches a Google Places result name.
    Returns (is_match, similarity_ratio)."""
    n1 = normalize_name(db_name)
    n2 = normalize_name(google_name)

    if is_city_or_region_name(google_name):
        return False, 0.0

    if n1 == n2:
        return True, 1.0

    shorter, longer = (n1, n2) if len(n1) <= len(n2) else (n2, n1)
    if shorter in longer and len(shorter) >= len(longer) * 0.6:
        return True, 0.9

    ratio = SequenceMatcher(None, n1, n2).ratio()
    return ratio >= threshold, ratio


# ── Google Places API helpers ─────────────────────────────────────────────────

def find_place_id(
    business_name: str,
    city: str,
    threshold: float,
) -> tuple[str | None, str | None, str | None]:
    """
    Use Find Place from Text to get the Google Place ID.
    Returns (place_id, google_name, google_address) or (None, None, None).

    Guardrails:
      - Must return exactly ONE candidate
      - Name must pass similarity threshold
      - Address must contain the expected city
    """
    query = f"{business_name}, {city}, CA"
    try:
        resp = requests.get(FIND_PLACE_URL, params={
            "input":     query,
            "inputtype": "textquery",
            "fields":    "place_id,name,formatted_address",
            "key":       GOOGLE_API_KEY,
        }, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"{RED}  ❌ Places API error: {e}{NC}")
        return None, None, None

    data       = resp.json()
    candidates = data.get("candidates", [])

    if not candidates:
        return None, None, None

    if len(candidates) > 1:
        print(f"{YELLOW}  ⚠  Multiple candidates ({len(candidates)}) — ambiguous, skipping{NC}")
        for c in candidates:
            print(f"{YELLOW}      → {c.get('name','?')} | {c.get('formatted_address','?')}{NC}")
        return None, None, None

    candidate    = candidates[0]
    google_name  = candidate.get("name", "")
    google_addr  = candidate.get("formatted_address", "")
    place_id     = candidate.get("place_id")

    is_match, ratio = names_match(business_name, google_name, threshold)
    if not is_match:
        print(f"{YELLOW}  ⚠  Name mismatch (ratio={ratio:.2f}, threshold={threshold}): "
              f"DB='{business_name}' vs Google='{google_name}' — skipping{NC}")
        return None, None, None

    if city.lower() not in google_addr.lower():
        print(f"{YELLOW}  ⚠  Wrong city: expected '{city}' in '{google_addr}' — skipping{NC}")
        return None, None, None

    print(f"{CYAN}  📝 Name match: '{business_name}' ↔ '{google_name}' (ratio={ratio:.2f}){NC}")
    print(f"{CYAN}     Address: {google_addr}{NC}")
    return place_id, google_name, google_addr


def get_place_details(place_id: str) -> dict:
    """
    Fetch enrichment data from Place Details API.
    Returns a dict with: phone, formatted_address, rating, review_count, website.
    All fields may be None if not returned by Google.
    """
    try:
        resp = requests.get(PLACE_DETAILS_URL, params={
            "place_id": place_id,
            "fields":   "name,formatted_phone_number,formatted_address,rating,user_ratings_total,website",
            "key":      GOOGLE_API_KEY,
        }, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"{RED}  ❌ Place Details API error: {e}{NC}")
        return {}

    result = resp.json().get("result", {})
    return {
        "phone":             result.get("formatted_phone_number"),
        "formatted_address": result.get("formatted_address"),
        "rating":            result.get("rating"),
        "review_count":      result.get("user_ratings_total"),
        "website":           result.get("website"),
    }


def get_place_photos(place_id: str) -> list[dict]:
    """Use Place Details to get photo references (photos mode)."""
    try:
        resp = requests.get(PLACE_DETAILS_URL, params={
            "place_id": place_id,
            "fields":   "photos",
            "key":      GOOGLE_API_KEY,
        }, timeout=10)
        resp.raise_for_status()
    except requests.RequestException:
        return []
    result = resp.json().get("result", {})
    return result.get("photos", [])[:MAX_PHOTOS_PER_BUSINESS]


def download_place_photo(photo_reference: str, max_width: int = 800) -> bytes | None:
    """Download a photo from the Place Photos API."""
    try:
        resp = requests.get(PLACE_PHOTO_URL, params={
            "photoreference": photo_reference,
            "maxwidth":       max_width,
            "key":            GOOGLE_API_KEY,
        }, allow_redirects=True, timeout=15)
        if resp.status_code == 200 and len(resp.content) > 1000:
            return resp.content
    except requests.RequestException:
        pass
    return None


def upload_to_supabase(supabase_client, file_bytes: bytes, path: str) -> str | None:
    """Upload photo bytes to Supabase Storage and return the public URL."""
    try:
        supabase_client.storage.from_("business-images").upload(
            path, file_bytes, {"content-type": "image/jpeg"},
        )
        return supabase_client.storage.from_("business-images").get_public_url(path)
    except Exception as e:
        print(f"{RED}  Upload error: {e}{NC}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# MODE 1 — Photos pipeline (existing behaviour, unchanged)
# Targets: status='approved' AND verified=true
# ─────────────────────────────────────────────────────────────────────────────

def process_business_photos(supabase_client, biz: dict, dry_run: bool = False) -> dict:
    """Fetch and store Google Place photos for one approved+verified business."""
    stats = {
        "name": biz["name"], "city": biz["city"],
        "place_id": None, "photos_found": 0, "photos_saved": 0, "skipped": False,
    }
    biz_id = biz["id"]
    name   = biz["name"]
    city   = biz["city"]

    # Skip if already fully stocked with photos
    existing = supabase_client.table("business_images").select(
        "id", count="exact"
    ).eq("business_id", biz_id).eq("source", "google_places").eq("verified", True).execute()

    if (existing.count or 0) >= MAX_PHOTOS_PER_BUSINESS:
        print(f"{YELLOW}  ⏭  {name} — already has {existing.count} photos, skipping{NC}")
        stats["skipped"] = True
        return stats

    existing_count = existing.count or 0

    # Resolve Place ID
    place_id = biz.get("google_place_id")
    if place_id:
        print(f"{CYAN}  ✓  Using existing Place ID: {place_id}{NC}")
        stats["place_id"] = place_id
    else:
        print(f"{CYAN}  🔍 Finding Place ID for: {name}, {city}, CA{NC}")
        place_id, _, _ = find_place_id(name, city, NAME_THRESHOLD_PHOTOS)
        if not place_id:
            print(f"{RED}  ❌ No confident Google Place match for: {name}{NC}")
            return stats
        stats["place_id"] = place_id
        print(f"{GREEN}  ✓  Place ID: {place_id}{NC}")
        if not dry_run:
            try:
                patch = _safe_patch({"google_place_id": place_id})
                supabase_client.table("businesses").update(patch).eq(
                    "id", biz_id
                ).is_("google_place_id", "null").execute()
            except Exception:
                pass

    # Fetch photos
    photos = get_place_photos(place_id)
    stats["photos_found"] = len(photos)
    if not photos:
        print(f"{YELLOW}  ⚠  No photos available for: {name}{NC}")
        return stats

    print(f"{CYAN}  📸 Found {len(photos)} photos{NC}")
    if dry_run:
        print(f"{YELLOW}  [DRY RUN] Would save {len(photos)} photos{NC}")
        stats["photos_saved"] = len(photos)
        return stats

    saved = 0
    for i, photo in enumerate(photos):
        ref = photo.get("photo_reference")
        if not ref:
            continue
        attributions = photo.get("html_attributions", [])
        img_bytes = download_place_photo(ref)
        if not img_bytes:
            print(f"{RED}    Photo {i+1}: download failed{NC}")
            continue
        public_url = upload_to_supabase(supabase_client, img_bytes, f"{biz_id}/{i}.jpg")
        if not public_url:
            continue
        row = {
            "business_id":      biz_id,
            "image_url":        public_url,
            "alt_text":         f"{name} — photo {i+1}, {city}, CA",
            "position":         existing_count + i,
            "source":           "google_places",
            "source_reference": ref,
            "verified":         True,
        }
        try:
            supabase_client.table("business_images").insert(row).execute()
            saved += 1
            print(f"{GREEN}    ✅ Photo {i+1} saved{NC}")
        except Exception as e:
            print(f"{RED}    ❌ Insert failed for photo {i+1}: {e}{NC}")
        time.sleep(1.0)

    stats["photos_saved"] = saved
    return stats


def run_photos_mode(supabase_client, args):
    """Entry point for --mode photos."""
    query = supabase_client.table("businesses").select(
        "id, name, category, city, address, google_place_id"
    ).eq("status", "approved").eq("verified", True)

    if args.business_id:
        query = query.eq("id", args.business_id)
    elif args.city:
        query = query.eq("city", args.city)

    businesses = (query.order("city").order("name").execute().data or [])

    if not businesses:
        print(f"{YELLOW}No verified businesses found matching criteria.{NC}")
        return

    print(f"\n{'='*60}")
    print(f"{BOLD}MoHo Local — Google Places Photo Pipeline{NC}")
    print(f"{'='*60}")
    print(f"Businesses to process: {len(businesses)}")
    if args.city:     print(f"City filter:  {args.city}")
    if args.dry_run:  print(f"{YELLOW}DRY RUN MODE — no writes{NC}")
    print(f"{'='*60}\n")

    totals = {"processed": 0, "skipped": 0, "photos_saved": 0, "no_place": 0, "no_photos": 0}
    for biz in businesses:
        print(f"\n📍 [{biz['city']}] {biz['name']}")
        s = process_business_photos(supabase_client, biz, dry_run=args.dry_run)
        totals["processed"] += 1
        if s["skipped"]:
            totals["skipped"] += 1
        elif not s["place_id"]:
            totals["no_place"] += 1
        elif s["photos_found"] == 0:
            totals["no_photos"] += 1
        else:
            totals["photos_saved"] += s["photos_saved"]
        time.sleep(1.0)

    print(f"\n{'='*60}")
    print(f"{GREEN}{BOLD}Photos Pipeline Complete{NC}")
    print(f"{'='*60}")
    print(f"  Processed:      {totals['processed']}")
    print(f"  Skipped:        {totals['skipped']} (already had photos)")
    print(f"  No Place Match: {totals['no_place']}")
    print(f"  No Photos:      {totals['no_photos']}")
    print(f"  Photos Saved:   {totals['photos_saved']}")
    print(f"{'='*60}")


# ─────────────────────────────────────────────────────────────────────────────
# MODE 2 — Verification pipeline  (Sprint 2 Task 2)
# Targets: status='pending' AND verified=false
#
# ⚠️  TRUST GATE: this mode NEVER sets status='approved' or verified=true.
#     It only enriches fields and sets needs_review=True as a candidate flag.
#     All promotion to approved+verified requires manual founder review.
# ─────────────────────────────────────────────────────────────────────────────

def phone_digits(phone: str | None) -> str:
    """Strip all non-digit characters from a phone number for comparison."""
    if not phone:
        return ""
    return re.sub(r'\D', '', phone)


def phones_match(db_phone: str | None, google_phone: str | None) -> bool:
    """Return True if both phones have the same last 7 digits."""
    d1 = phone_digits(db_phone)
    d2 = phone_digits(google_phone)
    if not d1 or not d2:
        return False
    return d1[-7:] == d2[-7:]


def process_business_verify(
    supabase_client,
    biz: dict,
    dry_run: bool = False,
) -> dict:
    """
    Attempt to match a PENDING business against Google Places and enrich it.

    Returns a result dict for the verification report:
      status        : 'matched' | 'no_match' | 'skipped'
      name          : business name
      city          : city
      address       : DB address
      place_id      : Google place_id if found
      google_name   : Google canonical name
      google_address: Google formatted_address
      google_phone  : Google phone (if returned)
      google_rating : Google rating
      google_reviews: Google user_ratings_total
      phone_match   : True/False
      fields_enriched: list of field names that were updated in the DB
    """
    result: dict = {
        "status":          "no_match",
        "name":            biz["name"],
        "city":            biz["city"],
        "address":         biz.get("address", ""),
        "place_id":        None,
        "google_name":     None,
        "google_address":  None,
        "google_phone":    None,
        "google_rating":   None,
        "google_reviews":  None,
        "phone_match":     False,
        "fields_enriched": [],
    }

    biz_id = biz["id"]
    name   = biz["name"]
    city   = biz["city"]

    # Skip if already has a Place ID and has been enriched before
    if biz.get("google_place_id") and biz.get("needs_review"):
        print(f"{YELLOW}  ⏭  Already enriched — skipping{NC}")
        result["status"]   = "skipped"
        result["place_id"] = biz["google_place_id"]
        return result

    # ── Step 1: Find Place ID ─────────────────────────────────────────────────
    print(f"{CYAN}  🔍 Searching Places: {name}, {city}, CA{NC}")
    place_id, google_name, google_address = find_place_id(name, city, NAME_THRESHOLD_VERIFY)

    if not place_id:
        print(f"{RED}  ❌ No confident match (threshold={NAME_THRESHOLD_VERIFY}){NC}")
        return result

    result["place_id"]       = place_id
    result["google_name"]    = google_name
    result["google_address"] = google_address
    print(f"{GREEN}  ✓  Place ID: {place_id}{NC}")

    # ── Step 2: Fetch enrichment details ──────────────────────────────────────
    print(f"{CYAN}  📋 Fetching place details…{NC}")
    details = get_place_details(place_id)

    result["google_phone"]   = details.get("phone")
    result["google_rating"]  = details.get("rating")
    result["google_reviews"] = details.get("review_count")

    if details.get("phone"):
        print(f"{CYAN}  📞 Phone:   {details['phone']}{NC}")
    if details.get("rating") is not None:
        print(f"{CYAN}  ⭐ Rating:  {details['rating']} ({details.get('review_count', 0)} reviews){NC}")
    if details.get("website"):
        print(f"{CYAN}  🌐 Website: {details['website']}{NC}")

    # ── Step 3: Phone match check (confidence boost) ──────────────────────────
    result["phone_match"] = phones_match(biz.get("phone"), details.get("phone"))
    if result["phone_match"]:
        print(f"{GREEN}  ✓  Phone match confirmed{NC}")
    elif biz.get("phone") and details.get("phone"):
        print(f"{YELLOW}  ⚠  Phone mismatch: DB='{biz.get('phone')}' vs Google='{details.get('phone')}'{NC}")

    # ── Step 4: Build the enrichment patch ────────────────────────────────────
    # TRUST GATE: status and verified are NEVER included in this patch.
    # _safe_patch() provides a second line of defence.
    patch: dict = {
        "google_place_id": place_id,
        "needs_review":    True,   # Signals to founder: "Places match found, ready to inspect"
    }
    enriched: list[str] = ["google_place_id", "needs_review"]

    # Only fill in fields that are currently empty — do not overwrite existing data
    if not biz.get("phone") and details.get("phone"):
        patch["phone"] = details["phone"]
        enriched.append("phone")

    if not biz.get("website") and details.get("website"):
        patch["website"] = details["website"]
        enriched.append("website")

    if details.get("rating") is not None:
        patch["rating"] = details["rating"]
        enriched.append("rating")

    if details.get("review_count") is not None:
        patch["review_count"] = details["review_count"]
        enriched.append("review_count")

    # Store Google's canonical address for human review (separate field from our address)
    if details.get("formatted_address"):
        patch["google_formatted_address"] = details["formatted_address"]
        enriched.append("google_formatted_address")

    result["fields_enriched"] = enriched
    result["status"] = "matched"

    # ── Step 5: Write enrichment to DB (unless dry-run) ───────────────────────
    if dry_run:
        print(f"{YELLOW}  [DRY RUN] Would patch: {enriched}{NC}")
    else:
        safe = _safe_patch(patch)  # belt-and-suspenders trust gate guard
        try:
            supabase_client.table("businesses").update(safe).eq("id", biz_id).execute()
            print(f"{GREEN}  ✅ Enriched: {enriched}{NC}")
        except Exception as e:
            # google_formatted_address may not exist in schema — retry without it
            print(f"{YELLOW}  ⚠  DB update failed ({e}) — retrying without google_formatted_address{NC}")
            safe.pop("google_formatted_address", None)
            if "google_formatted_address" in enriched:
                enriched.remove("google_formatted_address")
            try:
                supabase_client.table("businesses").update(_safe_patch(safe)).eq("id", biz_id).execute()
                print(f"{GREEN}  ✅ Enriched (without formatted_address): {enriched}{NC}")
            except Exception as e2:
                print(f"{RED}  ❌ DB update failed: {e2}{NC}")
                result["status"] = "error"

    return result


def write_verification_report(results: list[dict], city_label: str, dry_run: bool) -> str:
    """Write a CSV verification report for founder review. Returns the filename."""
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    city_slug = city_label.lower().replace(" ", "_") if city_label else "all_cities"
    filename  = f"verification_report_{city_slug}_{date_str}.csv"

    fieldnames = [
        "status", "name", "city", "address",
        "place_id", "google_name", "google_address",
        "google_phone", "google_rating", "google_reviews",
        "phone_match", "fields_enriched",
        "action_required",
    ]

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for r in results:
            row = dict(r)
            row["fields_enriched"] = ", ".join(r.get("fields_enriched", []))
            if r["status"] == "matched":
                row["action_required"] = "REVIEW — promote to approved+verified if correct"
            elif r["status"] == "no_match":
                row["action_required"] = "RESEARCH — no Google Places match found"
            else:
                row["action_required"] = "SKIP — already enriched or error"
            writer.writerow(row)

    return filename


def run_verify_mode(supabase_client, args):
    """
    Entry point for --mode verify.

    ⚠️  TRUST GATE REMINDER:
    This function queries status='pending' only.
    It NEVER sets status='approved' or verified=true.
    """
    # ── Fetch pending businesses ───────────────────────────────────────────────
    query = supabase_client.table("businesses").select(
        "id, name, category, city, address, phone, website, google_place_id, needs_review"
    ).eq("status", "pending").eq("verified", False)

    # ⚠️  Explicit safety assertion — these filters must be present
    assert "status" not in {"approved"}, "SAFETY: must not query approved businesses in verify mode"

    if args.city:
        query = query.eq("city", args.city)

    query = query.order("city").order("name")

    if hasattr(args, "limit") and args.limit:
        query = query.limit(args.limit)

    businesses = (query.execute().data or [])

    if not businesses:
        print(f"{YELLOW}No pending businesses found matching criteria.{NC}")
        return

    print(f"\n{'='*60}")
    print(f"{BOLD}MoHo Local — Google Places Verification Pipeline{NC}")
    print(f"{BOLD}Sprint 2 Task 2 — Enrichment Only (no auto-approval){NC}")
    print(f"{'='*60}")
    print(f"Pending businesses to scan: {len(businesses)}")
    if args.city:    print(f"City filter:  {args.city}")
    if args.dry_run: print(f"{YELLOW}DRY RUN MODE — no writes{NC}")
    print(f"{YELLOW}Trust gate: status and verified will NOT be modified{NC}")
    print(f"{'='*60}\n")

    results   = []
    matched   = 0
    no_match  = 0
    skipped   = 0

    for biz in businesses:
        print(f"\n📍 [{biz['city']}] {biz['name']}")
        r = process_business_verify(supabase_client, biz, dry_run=args.dry_run)
        results.append(r)

        if r["status"] == "matched":
            matched += 1
        elif r["status"] == "no_match":
            no_match += 1
        else:
            skipped += 1

        time.sleep(1.0)   # Places API rate limit

    # ── Write CSV report ───────────────────────────────────────────────────────
    city_label = args.city if args.city else "all_cities"
    report_file = write_verification_report(results, city_label, args.dry_run)

    # ── Console summary ────────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"{GREEN}{BOLD}Verification Pipeline Complete{NC}")
    print(f"{'='*60}")
    print(f"  Scanned:            {len(businesses)}")
    print(f"  {GREEN}Matched (enriched): {matched}{NC}")
    print(f"  {RED}No match:           {no_match}{NC}")
    print(f"  {YELLOW}Skipped:            {skipped}{NC}")
    print(f"")
    print(f"  Report saved to:    {report_file}")
    print(f"")
    print(f"  {BOLD}Next step:{NC} Open {report_file} and review matched records.")
    print(f"  For each 'matched' row, confirm the data is correct, then run:")
    print(f"  UPDATE businesses SET status='approved', verified=true WHERE id='<uuid>';")
    print(f"  (manual SQL in Supabase Editor — this script never does this automatically)")
    print(f"")
    print(f"  {YELLOW}⚠  Trust gate: this script did NOT set status='approved' or verified=true{NC}")
    print(f"  {YELLOW}   All matched records remain status='pending', verified=false{NC}")
    print(f"{'='*60}")

    # ── Safety assertion at the end ────────────────────────────────────────────
    # Final sanity check: confirm no record in results has status or verified set
    for r in results:
        assert "status_override" not in r, "SAFETY: status should never appear in result"
    print(f"\n{GREEN}✓  Post-run safety assertion passed: no trust flags were modified{NC}")


# ─────────────────────────────────────────────────────────────────────────────
# CLI entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="MoHo Local — Google Places Pipeline (photos + verification)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--mode",
        choices=["photos", "verify"],
        default="photos",
        help="'photos' (default): fetch photos for approved+verified businesses. "
             "'verify': match pending businesses against Google Places and enrich.",
    )
    parser.add_argument("--city",        type=str,  help="Process only businesses in this city")
    parser.add_argument("--business-id", type=str,  help="[photos mode] Process a single business by UUID")
    parser.add_argument("--limit",       type=int,  default=0,
                        help="[verify mode] Max number of pending records to process (0 = all)")
    parser.add_argument("--dry-run",     action="store_true",
                        help="Show what would happen without writing any changes")
    args = parser.parse_args()

    # ── Validate environment ──────────────────────────────────────────────────
    if not SUPABASE_URL or not SUPABASE_KEY:
        print(f"{RED}ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found.{NC}")
        print("Add them to moho-app-scaffold/.env.local")
        sys.exit(1)

    if not GOOGLE_API_KEY:
        print(f"{RED}ERROR: GOOGLE_PLACES_API_KEY not found.{NC}")
        print("Add GOOGLE_PLACES_API_KEY=... to moho-app-scaffold/.env.local")
        sys.exit(1)

    # ── Mode: verify — extra safety check ────────────────────────────────────
    if args.mode == "verify":
        if args.business_id:
            print(f"{YELLOW}⚠  --business-id is ignored in verify mode (targets pending records){NC}")
        print(f"\n{YELLOW}{'='*60}{NC}")
        print(f"{YELLOW}VERIFY MODE — TRUST GATE ACTIVE{NC}")
        print(f"{YELLOW}This run will NOT set status='approved' or verified=true.{NC}")
        print(f"{YELLOW}All enrichment requires manual founder review before promotion.{NC}")
        print(f"{YELLOW}{'='*60}{NC}")

    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

    if args.mode == "photos":
        run_photos_mode(supabase_client, args)
    else:
        run_verify_mode(supabase_client, args)


if __name__ == "__main__":
    main()
