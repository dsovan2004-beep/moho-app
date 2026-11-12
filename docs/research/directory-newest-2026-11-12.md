# Directory All Listings/Newest — November 12, 2026

## Confirmed findings

All Listings already includes approved+verified records using four city locations OR explicit listing_checks coverage. Default A–Z is intentional, not evidence that newly public records are absent. Newest used created_at only and no final unique key. Live database examples: THub createdMar2/approvalNov7; Dhaba/Rasoi createdMar16/approvalNov6. Those actual later approvals were buried by creation-date ordering. Live moderation function verified_at=case when p_action='approve' then now() else null end confirms the recorded workflow timestamp. No separate approved_at/published_at exists. Global1862public records include1756without this timestamp; these are global historical inventory figures, not regional fresh-check counts.

## Implementation

Newest approved orders verified_at DESC NULLS LAST,created_at DESC NULLS LAST,id ASC. Known approval timestamps first; legacy without timestamp ordered by creation date thereafter. Explicit sort explanation and per-card recorded-approval/legacy-date distinction. All other sorts add id tie-breaker. Existing approval+verified publication gate and city/service filters unchanged. No backfill or guessed dates. Rechecking listing_checks does not change approval ordering.

Activity business stream also orders recorded approval and uses that actual timestamp with Listing approved label; legacy fallback stays Listing added. Latest actual approval/check per business wins; check wins equal timestamp. Prevents newer approval being suppressed by older evidence. Not a complete historical approval/edit log. No schema, grant, RLS or production data changes.

## Verification

174tests pass, TypeScript pass. New isolated database regression invokes the actual moderation RPC for an older pending fixture; tests approval ordering, deterministic tied-page selection and anonymous exclusion of pending record. Production synthetic fixtures were not created. New activity regression verifies later approval wins older check and correct approval label/date; equal-date check wins.

Anonymous public baseline: regional1023,MH117,Tracy398,Lathrop286,Manteca393. Counts overlap across service areas, not additive unique inventory. Expected first40public records fetched by A–Z and Newest for each. All ten actual localhost first pages matched expected first20IDs exactly. Regional Newest LoadMore20→40 matched all40expectedIDs with40unique; no tie duplication. Pending visibility remains gated; source fixture verifies publication transition without real production approval. Final OpenNext production build passed. LIVE accepted source3e24821ba78a379cc8f950a986238c6e0645d1ce: exact public marker with explicit verify query and actual production behavior. All ten live first pages (A–Z/Newest × regional/four cities) matched baseline20IDs. Newest pagination in every one of the five scopes matched40expectedIDs with40unique each.320px viewport/document both320; recorded approval date displayed. Screenshot research/nov12-newest-approved-live.png inspected; emulation cleared. Activity still shows today’s four check records first; no approval cards present in current40, so the approval label behavior is established by isolated regression rather than invented production activity.

Photo/pet pilot and physical-phone acceptance remain open; FB unpublished. No fake posts, outcomes or business additions.
