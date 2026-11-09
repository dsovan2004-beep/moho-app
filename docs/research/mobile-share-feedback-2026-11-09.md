# Mobile sharing feedback — November 9, 2026

SHARE-03 mobile feedback increment. Business and shortlist panels now share one feedback controller: immediate copying/opening status, synchronous duplicate-action lock while pending, all related share buttons disabled, and stale completion ignored after the public share target changes. Status is persistent, atomic and placed adjacent to actions; repeated attempts update the announcement content. Mobile action buttons span available width. Read-only copy fields use 16px mobile text.

Denied clipboard access offers Select link or Select text, focusing and selecting the entire matching field for the device Copy action. Native cancellation never attempts clipboard copying. Native resolution says to check the chosen app rather than claiming recipient delivery. Existing public UUID/city and city/service-only payload boundaries retained. No posting, recipients, new permissions or telemetry.

## Local acceptance

- 163 existing regression tests pass; TypeScript passes.
- Actual local shortlist at 390px: delayed clipboard fixture produced Copying status, disabled other actions and exactly one call with canonical Manteca/window-cleaning URL.
- Denied write produced visible recovery; Select link selected all 60 characters; Select text selected all 284 suggested-text characters. Both computed field font sizes 16px.
- Resolved mocked write showed Link copied feedback. Mock native AbortError showed cancellation and copy call count did not increase. Mock native resolution showed Check your chosen app to confirm it was sent.
- Local business with simulated private returnTo/q/hash: safe 84-character canonical UUID+Manteca field, full manual selection after denied clipboard. At 320px, viewport and document width both 320.
- Fixtures replaced browser methods only in the local QA tab, then reload removed them; temporary viewport override cleared. No production fixture or resident data writes.
- Physical iPhone/Android, actual OS clipboard integration, native share sheet delivery/cancellation and screen-reader voice acceptance remain OPEN. These mocks establish UI behavior, not physical device acceptance.

## Production acceptance

OpenNext build passed. Source a836ef8b8753fc1c5426688ca5cd193d07933e06 deployed as native version 26928c94, Ready in 2m40s; build e8a8b21f-bf58-4bf5-89c3-9e64f3f598e2 retained both release:check commands. Public build-info.json matches the full source revision. Live shortlist Copy link and Copy suggested text report the matching success; business Copy business link reports success with canonical UUID+Manteca field. At 390px shortlist copy button is 324px wide/44px high, fields 16px, document width 390. Shortlist and business document widths equal their 320px viewport. Screenshot nov9-mobile-share-feedback-live.png inspected. Actual OS clipboard and native-device delivery remain open; success feedback establishes resolved API behavior, not independent pasteboard acceptance. Viewport overrides reset after checks.

Observed historical build cbc1da49-490d-4293-abc9-c72757c6affe for pre-guard source 3b57e30 fail before deploy under the central release:check command because the old revision lacks that script. Did not retry or bypass that failure. Current guarded source deployed successfully. No new deployment permissions or configuration changes this turn.

 Facebook stays unpublished. Photo location/reuse-rights tasks and genuine-reporter pet pilot remain open.
