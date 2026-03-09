# QA Audit Report

**Date:** YYYY-MM-DD
**Auditor:**
**Scope:**
**Commit:**

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 HIGH | | |
| 🟡 MEDIUM | | |
| 🟢 LOW | | |
| ✅ PASS | | |

---

## Bugs Found

### 🔴 HIGH — [Title]

**File:**
**Function / Component:**

**Root cause:**

**Fix applied:**

```diff
- old code
+ new code
```

---

### 🟡 MEDIUM — [Title]

**File:**

**Root cause:**

**Fix applied:**

---

### 🟢 LOW — [Title]

**File:**

**Root cause:**

**Fix applied:**

---

## Flows Audited

| Flow | File(s) Checked | Status |
|------|----------------|--------|
| Homepage | `app/page.tsx` | |
| Directory | `app/directory/page.tsx` | |
| Business Detail | `app/business/[id]/page.tsx` | |
| City Landing Pages | `app/[city]/page.tsx` | |
| Category SEO Pages | `app/[city]/[category]/page.tsx` | |
| Submit Business | `app/submit-business/page.tsx` | |
| Suggest Business | `app/suggest-business/page.tsx` | |
| Report Listing | `app/report-listing/[id]/page.tsx` | |
| Events | `app/events/page.tsx` | |
| Community Board | `app/community/page.tsx` | |
| Lost & Found | `app/lost-and-found/page.tsx` | |
| Post Lost & Found | `app/post-lost-found/page.tsx` | |
| Layout / Nav | `app/layout.tsx` | |

---

## Verification Checklist

### Edge Runtime

- [ ] All pages include `export const runtime = 'edge'`
- [ ] No module-scope `createClient()` calls — all use `getSupabaseClient()` factory

### Status Filtering

- [ ] `app/directory/page.tsx` — `eq('status', 'approved')`
- [ ] `app/[city]/page.tsx` — all queries have `eq('status', 'approved')`
- [ ] `app/[city]/[category]/page.tsx` — `eq('status', 'approved')`
- [ ] `app/business/[id]/page.tsx` — `getBusiness()` has `eq('status', 'approved')`
- [ ] `app/page.tsx` — popular/featured queries have `eq('status', 'approved')`

### Category Canonicalization

- [ ] All category dropdowns use only the 9 canonical categories
- [ ] No alias values (`Childcare`, `Auto Services`, etc.) in any form

### DB Write Patterns

- [ ] `submit-business` → inserts into `businesses` with `status: 'pending'`
- [ ] `suggest-business` → inserts into `business_suggestions` with `status: 'pending'`
- [ ] `report-listing` → inserts into `listing_reports` with `status: 'pending'`
- [ ] `post-lost-found` → inserts into `lost_and_found` with required `type` field
- [ ] Community posts are auth-gated

### Mobile & UX

- [ ] Loading states present on all async pages
- [ ] Error states present on all form pages
- [ ] `notFound()` called on invalid IDs/slugs
- [ ] City branding consistent across pages

---

## SQL Recommendations

> For manual founder execution only.

```sql
-- Add SQL recommendations here
```

---

## Deployment

**Commit:**
**Branch:** main
**Repository:** `github.com/dsovan2004-beep/moho-app`
**Cloudflare auto-deploy:**
**Deployed at:**
