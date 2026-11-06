# Discovery/contact and provider release — November 6, 2026

## Problem and result

A resident looking for a handyman in Tracy could open a Mountain House-based provider and then get unrelated office-city/category suggestions. Search city/task context was lost. One provider also requires a service-request form before a follow-up call, while the interface promoted calling first.

Directory-to-detail links now retain city and supported task. Related providers must have dated service-area evidence for that city and overlapping service tags; the current listing is excluded and deterministic name order replaces rating sorting. Cards show office location separately from service coverage, dated check evidence and direct contact actions. Empty and failed queries have different copy. Return/category navigation retains the resident context, including service-area-only businesses.

Shared contact actions put the required request form first for the exact mattdisko.com host, with visible phone-for-follow-up instructions. Source instructions rechecked November 6; exact-host matching prevents lookalike-domain inheritance. This is an explicit editorial rule, not a claim every provider prefers a form. Other providers retain call/website choices. Contact, source and directory claim targets are at least 44px; related cards stack at narrow widths. No service request or phone call was submitted.

## Supply publication

Valley Pro Handyman and Lara’s Cleaning were individually checked on primary websites, deduplicated by normalized phone/domain/name, and published with scoped checks and private audit entries. They remain unclaimed with no ratings. Valley Pro’s operator disclaimer was retained; Lara’s office was not established and inconsistent weekend hours were omitted. No credentials, workmanship or availability was independently validated.

Totals confirmed by database read-back: 33 checked listings, 22 unique providers in launch categories. Mountain House landscaping/handyman/house-cleaning/plumbing: 6/5/4/3. Tracy: 6/5/5/5. Source records, exclusions and reference SQL are under docs/research/provider-ux-pass-2026-11-06.json and apply-provider-ux-pass-2026-11-06.sql. Sampa’s contradictory region/contact content was held; Next Day Fix was deferred for stronger identity corroboration.

## Validation and rollout

101 regression tests pass, including new city/task context, latest-evidence selection, safe detail URLs, exact-host request-first behavior and rendered contact order. Root TypeScript and OpenNext build pass. Local anonymous read-through verifies real joined related rows: a Tracy handyman detail includes checked service-area providers based elsewhere; a Mountain House cleaner detail includes three other checked cleaners. Directory link to the new cleaner retains Mountain House and house-cleaning context. 320px/390px viewport and content widths match; contact phone targets pass 44px. Final breadcrumb/return cleanup verified locally with no “Back to Service area only” link.

Source `93d60a401284e5b016d4f14947d64b5b305feffb` deployed through native Cloudflare build `39f865d6-8a94-4390-8c90-a05d54183c4e`; GitHub Workers Builds check completed successfully. Production acceptance passed on November 6: Matt Disko’s required request form precedes follow-up phone, four related handyman options serve Tracy (including Valley Pro), and all related links retain city/task. The live Mountain House cleaner shortlist shows four providers; clicking Lara’s Cleaning retains Mountain House and house-cleaning, shows three other checked cleaners, and returns to the same results without inventing an office city. Live 320px and 390px content widths match the viewport; phone targets are at least 44px. Screenshots: `docs/ux/discovery-contact-live.png` (desktop production) and `docs/ux/discovery-related-mobile.png` (390px production). No external forms were submitted.

Earlier source `6e117d405908e9abfaf0923df6df790c8a26ae7d` introduced the core feature; `93d60a4` completes breadcrumb/return navigation. Final TypeScript and OpenNext builds pass after that navigation cleanup.

## Remaining work

Mountain House UX-03 remains open for an actual 2026 street photo with existing reuse rights. No messages or outreach. Physical-phone push delivery, provider owner confirmations, resident usability research, remaining legacy discovery/Best Of surfaces and deeper category supply remain open; this pass does not claim the relaunch is fully complete.
