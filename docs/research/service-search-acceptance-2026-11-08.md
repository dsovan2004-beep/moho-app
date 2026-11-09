# Service-term search acceptance — November 8, 2026

## Reproduced problem

Live /directory?city=Manteca&category=Home+Services&service=electrical-services&q=electrician returned0results despite two dated electrical-service choices. Ordinary search checked business text fields; an advertised service role could exist only in listing_checks tags. No production reports or accounts created to reproduce this read-only search.

## Change

Exact known role terms (for example electrician/electricians, plumber/plumbers, dog walker) and canonical service names map to their checked service tag. For those terms only, public listing-check IDs with the same named city coverage join the existing text-field OR filter. Category, explicit service, approval/publication and city constraints remain in force. Normal text results remain eligible; this is not a claim that every general-search result is independently checked. Each card retains its own evidence status.

Ambiguous words such as cleaning, solar and pet care, company-name fragments and filter-like input do not infer a specialty. No fuzzy/AI recommendation, credential assertion, new telemetry, permissions, migration or private-data access. Existing sanitized text handling and stale-response sequence checks remain. Failed source queries show an error rather than silently broadening results.

## Verification

Anonymous public Supabase queries reproduce the composed filters: each four-city electrical shortlist plus electrician yields2; Manteca Pet Services and Manteca plumbing plus electrician yield0. These are read-only requests using existing public access, not privileged SQL-only acceptance. Helper regressions cover role/whitespace/case, canonical punctuation normalization, ambiguous terms, company fragments and filter-like input. 150tests and final OpenNext/TypeScript build pass. Source6b28858 / native9c8af722 Ready2m16s accepted. Live electrician search now returns2on each four-city electrical shortlist; Pet Services and conflicting plumbing cases return0. Actual Manteca city-page search form returns3general results including both checked providers. General search is not a checked-only shortlist. All390px checks fit without document overflow; emulation reset. Before/after screenshots: nov8-electrician-search-before.png / nov8-electrician-search-live.png. No actual user transaction recorded.

References: [Supabase contains](https://supabase.com/docs/reference/javascript/contains), [Supabase OR filters](https://supabase.com/docs/reference/javascript/or). Raw OR values are limited to existing sanitized text and validated database UUIDs; tags come from a fixed service dictionary.
