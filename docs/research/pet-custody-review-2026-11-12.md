# November 12 — pet custody and match review

## Additional Facebook review

Four further selected posts across four city-group views; full selected bodies read. Exact references remain in private-research/facebook-post-review-2026-11-12-0755.json outside Git. No copied resident bodies, identities, phones or private messages are published.

| Context | Evidence and limits | Useful response |
| --- | --- | --- |
| Mountain House | Travel-agent referral request; All comments, seven entries read. Several replies move to DM/WhatsApp; private messages not accessed, booking outcome unknown. | Preserve checked business identity/service scope separately from private conversations. Referral leads held for primary-source checks; no demographic or broad demand inference. |
| Tracy | Full reported pet-safe announcement; All comments,15visible entries versus16displayed after scrolling, so partial. Image/GIF-only entries not independently interpreted. | Make the latest reporter outcome prominent; acknowledgements are not independent ownership/custody verification. No imported report or pet-pilot completion. |
| Lathrop group | Full mobile-mechanic offer; Stockton base, workdays and services stated, travel radius not established. Opened modal explicitly says No comments yet; flyer details not independently checked. | Hold provider candidate; verify exact service cities/contacts/duplicates before publication. |
| Manteca | Full embedded fundraiser notice distinguishes doors, dinner and ticket cutoff/no-door-sales. Opened modal explicitly says No comments yet. | EVT-GAP-01 follow-up: check organizer/ticketing and exact venue; preserve registration cutoff separately from event start. No event published from social claims alone. |

This is bounded qualitative evidence, not an exhaustive group/post review or representative demand count. Facebook remains UNPUBLISHED; no outreach, content imports, reactions or image reuse.

## PET-GAP-01 engineering increment

Confirmed form issue: changing progress from sighted to secured retained the old sighting observation. The form now clears the observation input whenever animal progress changes, and the existing required input/server validation requires a new explicit observation before saving. Compatible unchanged progress can retain its actual observation time. Switching secured to lost clears contradictory possession and its timestamp. No schema/RPC/security changes.

Latest reporter status/custody summary now precedes the original description on report details, with separate reporter-confirmation, observation and contact timestamps. The original narrative is labeled as possibly preceding updates. Found classification alone never establishes secured custody; incompatible legacy progress cannot display a secured label. Matching links jump to the other report's latest status. Comparison guidance covers markings, dates, nearby locations, potentially older photos, current custody and private ownership/pickup details. Mutual match/contact/return arrangement still never automatically marks reunion.

The same native expandable comparison/custody guide is available on the public four-city pet browsing page. No fabricated reports, matches, outcomes or engagement were created.

## Acceptance

Local-only, explicitly labeled QA route exercised actual reporter controls without submitting: sighted→secured cleared the old observation, input empty/required/invalid; secured→lost→found→sighted did not restore it.320px viewport had305px document width and controls fit. Guide expands natively and retains city view. Temporary QA route removed before production build. Pure component regression covers separate observation/confirmation times, unknown custody, match anchors and private-proof guidance. 180tests and TypeScript pass; final OpenNext build passed; native release pending. Initial typecheck after deleting the temporary route found stale generated .next/types references; generated type cache cleared, then typecheck passed. No source route retained. Real-reporter pilot and physical-device acceptance remain OPEN; no authenticated production mutation simulated.

## Next priorities

P1: genuine reporter validates custody transition, tentative-match review and return/reunion distinctions, including conflict/retry and notifications. P1: independently check held provider/event candidates. P2: retain explicit ticket cutoff/doors/start fields after primary-source confirmation. Photo exact-location/date/reuse tasks, FB unpublished and pet pilot OPEN.
