# November 12 evening — pet match recovery and custody handoffs

Three newly detailed selected posts and one continued Tracy thread reviewed across four city-group views. Exact references/checkpoints stay in the private2128ledger outside Git. Not exhaustive group coverage, a population demand count or independent verification of animals/businesses/events. No resident bodies/identities/phones copied into public research.

| Context | Evidence and limitations | Decision |
| --- | --- | --- |
| Mountain House | Library open-house text names Nov16; selected text does not establish start time/exact venue. Opened modal explicitly No comments yet; image text not independently checked. | Hold event for organizer schedule/venue check. |
| Tracy continuation | Full earlier sighting post and expanded relevant replies, All comments.13visible entries versus14displayed, partial. New exchange clarifies intended request for animal services, not actual pickup. Animal condition/ownership not independently checked. | No custody/ownership inference from appearance, offers or intentions; no imported report. |
| Lathrop group | Expanded seasonal handmade offer with prices and limited-stock claims. Modal explicitly No comments yet; location, stock, fulfillment and image rights unverified. | Hold seller lead; offer is not resident demand or verified availability. |
| Manteca | Shared animal post asks whether anyone actually collected it. Outer modal explicitly No comments yet; embedded original thread not reviewed. No independent species identification from image. | Willingness to collect does not establish custody or reunion. Keep source/report author distinct from current custodian. |

## Implemented increment — PET-RECOVERY-01

Confirmed source bug: match mutation errors used the same state as initial-load errors, replacing loaded cards with an error-only result. Failed match actions now retain known cards and the candidate draft, show ambiguous-save wording rather than claiming no save occurred, and pause mutation controls until a deliberate read refresh checks the saved decision. Refresh is a read operation, not an automatic resend. Load failures do not masquerade as no matches. Changing report/account still resets the draft.

Custody guidance explicitly distinguishes collection offers/animal-services requests from a confirmed handoff. Reporter status fields are disabled during an in-flight save to avoid editing values already submitted. Archive and reunion buttons name their actual action; archiving no longer promises30day renewal. Existing API/RPC, revision guards, RLS and outcome semantics unchanged. No production pet data or fabricated engagement.

## Acceptance

Local-only marked QA harness rendered the actual match-results component: simulated revision conflict retained its card, disabled review, showed read-refresh guidance; refresh cleared the failure and enabled review. No API calls or production saves from the harness.320px viewport/document both320, refresh44px tall. Harness removed before build. Pending-save fieldset behavior is implemented but not validated with a genuine reporter; actual authenticated mutations, physical-phone and screen-reader checks remain open. 183tests, TypeScript and final OpenNext build pass; native release pending.

## Next

P1: genuine-reporter match/custody/conflict acceptance, including saved-state read-back and notifications. P1: verify held event schedule/venue and provider city/fulfillment against primary sources. Keep photo exact-location/date/existing-rights tasks and pet pilot OPEN; Facebook UNPUBLISHED. No outreach or permission requests.
