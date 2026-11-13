# November 13 — readable mobile navigation and checked boarding discovery

## MOBILE-12 implementation

Extracted the mobile navigation to MobileNavigation, preserving signed-in Messages/unread feedback and signed-out Sign in. Six named destinations now include Events with current city. Grid uses three columns/two rows below640px, six columns from640px and hides at1280px where desktop navigation takes over. Links retain48px minimum height, padding/gap, wrapping space and visible keyboard focus. No shortened Community/Messages labels or hidden contact actions. Existing desktop navigation and auth logic retained.

Pet boarding shortcut added to the existing checked-service mechanism: exact pet boarding tag, same approved/verified gate and city/evidence scope; no dog-walking/sitting tag inferred. This exposes the newly checked facilities and existing Tyler boarding evidence. No species-specific promises inferred from the broad boarding tag.

189regressions (two new signed-in/out navigation destination, city-context and badge tests), TypeScript and final OpenNext build passed. Source f4efb9c35df61782b65cbe4cdb4ae70f9d471b87 submitted to existing native Git Builds. LIVE accepted source f4efb9c35df61782b65cbe4cdb4ae70f9d471b87: GitHub Workers Builds success completed2026-11-13T19:53:39Z and exact production build-info marker matched. Actual signed-in320px navigation has six separate101px-wide/48px-high targets in two rows; all labels fit their cells and document/viewport both320.640px navigation has one six-item row;1280px mobile group hidden and document fits. Actual Events link navigates to Community Events retaining Manteca. Initial immediate click read preceded navigation; accepted only after waitForURL and actual page heading. No native version/duration asserted.

## Two existing providers individually corrected and newly checked

These are NOT new unique listings. Regional catalog remains1030. Both previously had no listing_check; no fresh approval date invented (verified_at remains null). Primary name/domain/phone searches found existing records, so updated those instead of duplicating. Existing approval/public gate retained. Guarded transaction locks the two records, requires no intervening check, captures before/after business+check and writes one private correction audit each. Anonymous read-back and audit count2 accepted; private excluded read-back retained outsideGit.

- Lathrop Veterinary Center aa02a19d-2ee2-4995-b75b-5399b76324c9: official https://www.lathropvet.com/services/boarding freshHTTP200. Filled missing phone2099447387/current website and specific17600GoldenValleyPkwy facility address. Scoped on-site boarding at Lathrop facility, not travel/home visits or medical capability. Species/admission/drop-off/quote/dates require direct confirmation. Separate legacy Clinic at16500Harlan/different phone not merged without identity evidence.
- Northgate Veterinary Hospital f2cd8a03-5c2e-4247-a744-5870b33d7b0a: current official https://www.northgatevetcare.com/services/boarding rendered in normal browser after directHTTP406. Replaced older forpetcare website, standardized published2098256060 phone and replaced generic description with on-site dog/cat boarding scope. Header/hospital listing296NorthgateDr conflicts with footerAvenue; retained existing Drive with explicit visible conflict and call-before-travel caveat. Manteca facility only, no home visits. Exact medical/vaccination eligibility not endorsed as advice; contact facility.

Check timestamp2026-11-13T19:50:37.957808Z (11:50:37AM Pacific). Neither check establishes independent credentials, workmanship, safety, insurance, quality, holiday hours or available bookings. No reviews/photos/testimonials copied. Existing legacy approval timestamps unchanged so rechecks belong in Activity, not artificially at top of Newest. Actual live details display corrected phone/website/scope; Lathrop expanded evidence and both call links accepted. Remaining city/filter/Activity checks below.

## Open gates

Facebook UNPUBLISHED. Photo tasks and genuine-reporter pet pilot OPEN; no production pet reports, outcomes or messages created. Physical phone, screen-reader voice and genuine unread-badge layout remain acceptance gaps unless separately evidenced. No schema/RPC/RLS/key or permission changes. No account creation, outreach or photo requests.

## Live data/discovery acceptance

Lathrop Pet boarding shortlist2: Lathrop Veterinary Center and Tyler’s Pet Boarding. Actual Manteca transition retains category/service and shows2: Northgate and Tyler. No sitting/walking claims introduced for these facilities. Both updated providers appear at top of actual regional Activity as Website checked Nov13, not new openings. Both detail pages show corrected public contact/source context and appropriate call links; Lathrop scope expanded and Northgate Drive/Avenue caveat visible.

Final screenshot nov13-mobile-navigation-live.png inspected with settled320px grid and six readable signed-in labels. An initial screenshot immediately after viewport switch captured stale desktop layout and was replaced; only final settled proof retained. Temporary viewport reset called. Signed-out navigation and unread badge behavior covered by rendered-component regression, not actual production sign-out or fabricated unread conversations. Physical phone, keyboard traversal with assistive technology, screen-reader voice and live nonzero unread badge acceptance remain OPEN.

No approval timestamps changed and no duplicate rows added; these are two newly scoped website checks of existing records, not two new unique providers. Generic legacy Lathrop Veterinary Clinic identity is a separate held audit item. Next priority: verify remaining stale pet contacts, continue actual new local sitter supply and validate navigation with genuine device/user feedback. Photo tasks and pet pilot remain OPEN; FB UNPUBLISHED.
