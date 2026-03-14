# Pending Queue Audit — March 14, 2026

**Scope:** Tracy · Lathrop · Manteca · Brentwood
**Auditor:** Claude coworker (automated + web research)
**SQL file:** `sql/audits/20260314_pending_queue_audit.sql`

---

## Executive Summary

The pending queue for these four cities is comprised almost entirely of businesses seeded by `seed_businesses_5.py` and `seed_businesses_6.py`. **All 200 of these businesses have sequential placeholder phone numbers** (e.g. `(209) 835-9001` through `9050`), meaning they cannot go live as-is — the directory would show wrong contact info.

Web research confirmed **5 businesses are real** with verified contact data ready to correct. The rest require individual founder review before approval.

---

## Pending Queue Size

| City | Pending Count | Source Script |
|------|--------------|---------------|
| Tracy | ~50 | seed_businesses_5.py |
| Lathrop | ~50 | seed_businesses_6.py |
| Manteca | ~50 | seed_businesses_6.py |
| Brentwood (seed_6 batch) | ~50 | seed_businesses_6.py |
| **Total** | **~200** | — |

*Run `STEP 1` query in the SQL file to confirm exact counts.*

---

## Root Cause

`seed_businesses_5.py` and `seed_businesses_6.py` correctly defaulted to `status='pending'` and `verified=False` per the trust policy. However, the phone numbers used sequential placeholders (`(209) 835-9001`, `9002`, etc.) because real phone data wasn't available at seed time.

These numbers are not real and must be corrected before any business can go live.

---

## Audit Results by City

### Tracy (50 pending)

| Business | Verification | Action |
|---|---|---|
| Pho Saigon Tracy | ✅ **REAL** — 2437 Naglee Rd, (209) 830-0444 | **APPROVE** + correct data |
| The Habit Burgers Tracy | ✅ **REAL** — 2682 Naglee Rd Ste 100, (209) 362-2540 | **APPROVE** + correct data |
| Kumon Math & Reading Tracy | ✅ **REAL** — 1858 W 11th St, (209) 833-9400 | **APPROVE** + correct data |
| El Jardin Mexican Grill | ⚠️ Uncertain — similar businesses exist | **HOLD** — verify address |
| Tracy Tandoor Kitchen | ⚠️ Uncertain — may exist under different name | **HOLD** |
| Tracy Animal Hospital | ⚠️ Partial match — "Paws and Claws Vet Hospital" may be this | **HOLD** |
| Bright Smiles Dental Tracy | ⚠️ Partial match — "Brite Smiles Dentistry" at 1170 W 11th St | **HOLD** |
| Tracy Tire & Auto Center | ⚠️ Partial match — A1 Tracy Tires at N MacArthur Dr | **HOLD** |
| Sunrise Dim Sum & Tea | ❌ Not found | **DO NOT APPROVE** |
| Ramen Republic Tracy | ❌ Not found | **DO NOT APPROVE** |
| Bella Italia Tracy | ❌ Not found | **DO NOT APPROVE** |
| *(remaining 39)* | Not individually checked | **HOLD** — founder review |

**Tracy result: 3 approved · 8 flagged for review · rest on hold**

---

### Lathrop (50 pending)

| Business | Verification | Action |
|---|---|---|
| Lathrop Urgent Care | ✅ **REAL** — 15810 S Harlan Rd #A, (209) 983-9000 | **APPROVE** + correct data |
| Lathrop Dental Group | ⚠️ Partial match — "First Lathrop Dental" 15136 S Harlan Rd | **HOLD** |
| River Islands Café | ⚠️ Partial match — "Islander Coffee Cafe" at River Islands Pkwy | **HOLD** |
| Lathrop Pet Hospital | ⚠️ Partial match — "Lathrop Veterinary Center" 17600 Golden Valley Pkwy | **HOLD** |
| Saffron Indian Kitchen Lathrop | ❌ Not found | **DO NOT APPROVE** |
| Delta Karate Academy | ❌ Not found | **DO NOT APPROVE** |
| Falafel & Shawarma Palace | ❌ Not found | **DO NOT APPROVE** |
| Lathrop STEM Lab | ❌ Not found | **DO NOT APPROVE** |
| *(remaining 42)* | Not individually checked | **HOLD** — founder review |

**Lathrop result: 1 approved · 4 flagged for review · rest on hold**

---

### Manteca (50 pending)

| Business | Verification | Action |
|---|---|---|
| Manteca Auto & Tire | ✅ **REAL** (as "Manteca Tire" at 201 W Edison St) — needs name/phone correction | **HOLD** (rename required) |
| El Torero Mexican Restaurant | ⚠️ Uncertain | **HOLD** |
| Manteca Family Medicine | ⚠️ Category exists but not exact name match | **HOLD** |
| Punjab Palace Manteca | ❌ Not found (Punjab grocery exists, not restaurant) | **DO NOT APPROVE** |
| Manteca Sushi Lounge | ❌ Not found (Matsu Sushi, Sakana exist instead) | **DO NOT APPROVE** |
| The Breakfast Club Manteca | ❌ Not found | **DO NOT APPROVE** |
| Manteca Brewery & Grill | ❌ Not found ("Brethren Brewing" exists but is different) | **DO NOT APPROVE** |
| Big Paws Dog Park & Training | ❌ Not found | **DO NOT APPROVE** |
| Bump & Beyond Prenatal Care | ❌ Not found | **DO NOT APPROVE** |
| Young Coders Manteca | ❌ Not found | **DO NOT APPROVE** |
| *(remaining 40)* | Not individually checked | **HOLD** — founder review |

**Manteca result: 0 approved · 3 flagged for review · rest on hold**

---

### Brentwood — seed_6 batch (50 pending, placeholder phones)

All 50 have `(925) 240-9001` through `9050` placeholder phones.

| Business | Verification | Action |
|---|---|---|
| Brentwood Plumbing Co. | ✅ **REAL** — confirmed at (925) 441-7855 | **APPROVE** + correct phone |
| Lone Tree Landscaping | ❌ Not found | **DO NOT APPROVE** |
| Empire Ave Electric | ❌ Not found | **DO NOT APPROVE** |
| *(remaining 47)* | Not individually checked | **HOLD** — founder review |

**Brentwood seed_6 result: 1 approved · rest on hold**

---

### Brentwood — main script (142 businesses, real data)

These businesses from `seed_businesses_brentwood.py` were seeded with real addresses and real websites. They do **not** have placeholder phone patterns. If their `status` is `'pending'`, the founder can safely approve these in bulk — they were researched from Google Maps.

Run this query to check:
```sql
SELECT id, name, address, phone, status, verified
FROM businesses
WHERE city = 'Brentwood'
  AND phone NOT LIKE '(925) 240-9%'
  AND status = 'pending'
ORDER BY name;
```

If any show up as pending, bulk approve with:
```sql
UPDATE businesses
SET status = 'approved', verified = true
WHERE city = 'Brentwood'
  AND phone NOT LIKE '(925) 240-9%'
  AND status = 'pending';
```

---

## Recommended Actions

### Immediate (run today)
Run the 5 confirmed approvals in `sql/audits/20260314_pending_queue_audit.sql` — these have real verified contact info and are ready to go live.

| # | Business | City | Approved With |
|---|---|---|---|
| 1 | Pho Saigon Tracy | Tracy | 2437 Naglee Rd, (209) 830-0444 |
| 2 | The Habit Burgers | Tracy | 2682 Naglee Rd Ste 100, (209) 362-2540 |
| 3 | Kumon Math & Reading | Tracy | 1858 W 11th St, (209) 833-9400 |
| 4 | Lathrop Urgent Care | Lathrop | 15810 S Harlan Rd #A, (209) 983-9000 |
| 5 | Brentwood Plumbing Co. | Brentwood | (925) 441-7855 |

### Short Term (next sprint)
Review the partial-match businesses by googling the suggested real names and updating the DB record with correct name + phone before approving.

### Longer Term
Consider running `verify_business_places.py` for Tracy, Lathrop, Manteca to get real place data from Google Maps API for the ~150 remaining pending businesses.

---

## Data Quality Note

The placeholder phone problem is fixable at scale. The cleanest solution is a Google Places lookup script — given a business name + city, it returns the real phone, address, and verified status. This would let us process all 200 pending businesses in a single run.

Recommend adding **"Fix placeholder phones via Places API"** as a sprint task.

---

*Audit completed: March 14, 2026*
*SQL file: `sql/audits/20260314_pending_queue_audit.sql`*
