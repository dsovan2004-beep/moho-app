# MoHo Local — Bulk Business Import: Data Sources & Workflow
**Last updated:** March 2026
**Goal:** Expand directory from ~800 → 5,000–10,000 listings using open public data

---

## ⚠️ Data Source Roles — Policy (Read First)

These rules are non-negotiable. Violating them is how fabricated listings enter the directory.

### OSM / Overpass — Candidate Seeding Only

- Used to discover candidate businesses in a city or category
- All records inserted as `status = 'pending'`, `verified = false`
- Must pass the 3-rule ingestion safeguard before insertion (street number, real phone, non-generic name)
- **OSM data is not verification-grade.** A record passing the safeguard means it is safe to queue for review — not that it is a confirmed real business
- Never insert OSM records as `verified = true`
- Never insert OSM records directly as `status = 'approved'`

### Google Maps / Places — Verification and Enrichment Only

- Used to confirm whether a pending business is real and still active
- Used to enrich `phone`, `website`, `hours`, and `place_id` on existing records
- The `verify_business_places.py` script follows this rule — it only enriches, never creates
- **Google Maps / Places must never be used as the main bulk seed source** (violates ToS Section 3.2.3)
- Never use Places API to create new listings at scale
- Never store raw Places data in the database beyond the fields listed above

### City Business License Data — Authoritative Seed Source

- OpenGovUS, HDLGov portals, and Public Records Act requests are the highest-quality bulk sources
- Inserted as `status = 'pending'`, `verified = false`
- After normalization, run `verify_business_places.py` to enrich before promoting

### Completeness ≠ Verification

Passing the 3-rule ingestion safeguard (address, phone, name) means a record is **complete enough to queue** — it does not mean the business has been confirmed as real.

Verification requires one of:
- Google Places match (place_id confirmed)
- Manual review against Google Maps or an authoritative source
- Business owner claim

A record with `status = 'approved'` and `verified = false` is only acceptable for business-license-sourced records that have real addresses and phones but have not yet been enriched. It is not acceptable for OSM-sourced records.

---

## Overview

All imported records default to:
- `status = pending`
- `verified = false`

They will NOT appear on the live site until manually approved or bulk-approved via SQL.

---

## Step 1 — Download Datasets

### 🟢 Tracy — Best Source (4,000+ records available)

**Source 1: City of Tracy — New Business License Listings (monthly PDF)**
- URL: https://www.cityoftracy.org/our-city/departments/finance-department/business-license-tax/new-business-license-tax-listing
- Format: PDF listing of businesses that applied in the last month
- Use: Copy-paste or PDF extract into CSV. Small batch only (~50/month).

**Source 2: OpenGovUS — Tracy Business Licenses (4,000+ records)**
- URL: https://opengovus.com/tracy-business
- Format: Web table with export button (CSV download)
- Fields: account number, business name, location, business type
- Action: Click "Export" or "Download CSV" button on the page
- Note: This is the **best bulk source** for Tracy. Free download, no login required.

**Source 3: Tracy HDLGov Business Search**
- URL: https://tracy.hdlgov.com/Search/Index/BusinessLicense
- Format: Web search — search for `*` or leave blank to browse all
- Action: Use browser dev tools (Network tab) to find the underlying JSON API call, then download all pages. Or contact tracy@hdlgov.com to request a bulk export.

---

### 🟡 Manteca — Public Records Request Route

**Source 1: Manteca HDLGov Business License Portal**
- URL: https://manteca.hdlgov.com/
- Format: Web search
- Action: Search for all active businesses. Request CSV export from the Finance Dept.

**Source 2: Manteca Public Records Request (NextRequest)**
- URL: https://cityofmanteca.nextrequest.com/
- Action: Submit a Public Records Act request for:
  > "A complete list of all active business licenses in the City of Manteca, including business name, address, and business type, in CSV or Excel format."
- Response time: 10 business days max (California law)
- Cost: Usually free for electronic records

**Source 3: OpenGovUS — check for Manteca**
- URL: https://opengovus.com/manteca-business (try this URL directly)
- May have a dataset similar to Tracy

---

### 🟡 Lathrop — Portal Request Route

**Source 1: Lathrop Civic Access Portal (LCAP)**
- URL: https://cityoflathropca-energovweb.tylerhost.net/apps/selfservice
- Format: Web portal — individual searches, no bulk export visible
- Action: Contact Finance Dept at (209) 941-7320 to request bulk CSV

**Source 2: Lathrop Public Records Request**
- Email: finance@lathropca.gov (or use city website contact form)
- URL: https://www.ci.lathrop.ca.us/finance/page/business-license-tax
- Request:
  > "A list of all current active business licenses in the City of Lathrop in CSV or Excel format under the California Public Records Act."

---

### 🟡 Mountain House — San Joaquin County Route

Mountain House is an unincorporated community — business licenses are issued by **San Joaquin County**, not a city hall.

**Source 1: SJ County Business License Search**
- URL: https://permits.sjgov.org/Departments/Treasurer-Tax-Collector/Business-License
- Format: Web search — search by address/zip code 95391 (Mountain House zip)
- Action: Search zip 95391, export or copy results

**Source 2: SJ County Public Records Request**
- URL: https://www.sjgov.org/department/ttc
- Phone: (209) 468-2133
- Request:
  > "All active business licenses for businesses located in the 95391 zip code (Mountain House) in CSV or Excel format."

**Source 3: SJ County Open Data Portal**
- URL: https://opendata.sjgov.org/
- Search: "business" in the Economy topic
- Note: May not have business license data, but worth checking

---

### 🟡 Brentwood — Contra Costa County Route

Brentwood is in Contra Costa County (not San Joaquin).

**Source 1: City of Brentwood Business License**
- URL: https://www.brentwoodca.gov/government/finance/business-license
- Action: Check for downloadable list or contact Finance Dept

**Source 2: Contra Costa County Open Data**
- URL: https://data.contracosta.ca.gov/
- Search: "business license"

**Source 3: OpenGovUS — Brentwood**
- URL: https://opengovus.com/brentwood-business (try directly)

---

## Step 2 — Normalize the Data

Once you have downloaded a CSV, XLSX, or JSON file, run the normalization script from your Mac terminal:

```bash
cd ~/Desktop/MoHoLocal/moho-app-scaffold

# First, check what columns your file has:
python3 normalize_business_import.py --input ~/Downloads/tracy_licenses.csv --show-columns

# Normalize a Tracy file (city auto-detected from data):
python3 normalize_business_import.py \
  --input ~/Downloads/tracy_licenses.csv \
  --city Tracy \
  --output ~/Desktop/tracy_import.csv

# Normalize a Mountain House file (all rows forced to Mountain House):
python3 normalize_business_import.py \
  --input ~/Downloads/mh_95391.csv \
  --city "Mountain House" \
  --output ~/Desktop/mh_import.csv

# Normalize a file that already has a city column:
python3 normalize_business_import.py \
  --input ~/Downloads/sj_county_all.csv \
  --output ~/Desktop/combined_import.csv
```

**Install dependencies first (one-time):**
```bash
pip3 install pandas openpyxl
```

The script will:
- Auto-detect columns by name (handles any column naming convention)
- Normalize phone numbers to `(209) 555-1234` format
- Infer MoHo category from business name / type
- Set all rows to `status=pending`, `verified=false`
- Remove duplicates by name + city
- Print a city and category breakdown before saving

---

## Step 3 — Import Into Supabase

1. Open: https://supabase.com/dashboard/project/ozjlfgipfzykzrjakwzb/editor
2. Navigate to: **Table Editor → businesses**
3. Click: **Insert → Import data from CSV**
4. Upload your normalized `_import.csv` file
5. Map columns (they should auto-match since column names match the table)
6. Click **Import**

**Important:** If Supabase import fails for large files (>1,000 rows), split the CSV:
```bash
# Split into 500-row chunks (each with header)
python3 -c "
import pandas as pd
df = pd.read_csv('tracy_import.csv')
for i, chunk in enumerate(range(0, len(df), 500)):
    df[chunk:chunk+500].to_csv(f'tracy_import_part{i+1}.csv', index=False)
print(f'Split into {i+1} files')
"
```

---

## Step 4 — Verify Public Safety

After import, confirm no live records snuck through:

```sql
-- Verify all new imports are pending
SELECT status, COUNT(*) FROM businesses GROUP BY status;

-- Spot check: make sure no pending row has wrong city
SELECT city, COUNT(*) FROM businesses WHERE status = 'pending' GROUP BY city;

-- Make sure phone normalization worked
SELECT phone FROM businesses WHERE status = 'pending' AND phone IS NOT NULL LIMIT 20;
```

---

## Step 5 — Approval Workflow

Once bulk-imported, use the existing verification workflow:

1. Use `verify_business_places.py` to auto-fill phones/websites via Google Places (enrichment only)
2. Batch approve clean records via SQL:
   ```sql
   -- Approve all pending records for a city that have a real address
   UPDATE businesses
   SET status = 'approved', verified = true
   WHERE city = 'Tracy'
     AND status = 'pending'
     AND address IS NOT NULL
     AND phone IS NOT NULL;
   ```
3. Manually review edge cases in Supabase Table Editor

---

## Expected Results

| City | Source | Estimated Records |
|---|---|---|
| Tracy | OpenGovUS export | ~4,000 |
| Manteca | Public records request | ~2,000 |
| Lathrop | Public records request | ~800 |
| Mountain House | SJ County (zip 95391) | ~300 |
| Brentwood | City portal / OpenGovUS | ~1,500 |
| **Total** | | **~8,600** |

Current listings: ~800 approved
After import + approval: **~5,000–10,000 total**

---

## Note on Google Places (Enrichment Only)

See **Data Source Roles — Policy** at the top of this document for the full rule.

Summary: Google Places enriches existing records (phone, website, hours, place_id). It does not seed new ones. The `verify_business_places.py` script enforces this — it only updates existing rows, never inserts.
