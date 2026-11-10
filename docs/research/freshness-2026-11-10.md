# FRESH-01 — Tuesday November 10, 2026, 9 AM Pacific

Completed scheduled refresh period. Clean worktree and current OPERATIONS/BACKLOG/ROADMAP/SPRINTS/ledger reviewed. Last accepted app16109db; docs6fad1ce. Yesterday’s contact/city-selector and four-listing work retained without rerunning completed app checks.

## Published correction

[City of Tracy Ornament Stroll](https://www.cityoftracy.org/I-Want-To/View/City-Calendar/2026/Events-Folder/Ornament-Stroll-TCCA): current header, body and When section agree November14,2026,2–5PMPacific, Front Street Plaza,50East6thStreet. Fresh directHTTP200 independently inspected. Existing event e6b125fc-6e43-43f9-9021-eaf7aa3b0c86 had noon–9PM. Conditional update changed only start/end and descriptive correction/check date; same ID/source/location/status. No duplicate added. Ticket price, ornament stock or participation not guaranteed.

Original four inspected public event rows saved before mutation in excluded .private-refresh/2026-11-10-events-before.json (directory0700,file0600); corrected row saved after in same excluded directory. This is local private correction history, not server-side audit storage. No personal details or credentials committed. Dedicated event audit storage remains a follow-up rather than misusing business-specific audit tables.

Anonymous Supabase public read-back confirms22:00ZNov14–01:00ZNov15. Production calendar endpoint200 returns DTSTART:20261114T220000Z and DTEND:20261115T010000Z. Data-only update; no application/release/build required.

## Other near-term checks — unchanged, bounded scope

- [Mountain House teen nature domes](https://www.ssjcpl.org/events-services/events-calendar/mountain-house/teen-fall-nature-dome-displays-13-19yrs?id=1794358800-232256): retrieved official occurrence says Nov10,5–6PM,Makerspace201EMainSt,ages13–19,first-come materials. Existing values match. Search fetch reports three-day crawl; fresh directHTTP200 did not yield readable occurrence text in simple extraction, so no database check-date advanced.
- [Manteca Shedskin Reptile Experience](https://www.ssjcpl.org/events-services/events-calendar/manteca-branch/shedskin-reptile-experience?id=1794353400-247246): official retrieved occurrence says Nov10,3:30–4:30PM,MantecaLibrary,free/allages. Existing matches; directHTTP200 simple extraction lacked occurrence text. No row change or seat guarantee.
- [Lathrop Veterans Day](https://www.ci.lathrop.ca.us/parksrec/page/special-events-0): retrieved City page explicitly Nov11,11AM,CommunityCenter155575thStreet,free. Existing matches; end stays unknown. Fetch reports older crawl and fresh direct connection closed, so no freshness claim/date advancement.

## Openings and expiry review

Existing notices sampled: [Wingstop Mountain House](https://locations.wingstop.com/ca/mountain-house/wingstop-3218-mountain-house-ca-95391), [Sprouts Tracy Ellis](https://www.sprouts.com/tracyellis), [Cold Stone Lathrop](https://www.coldstonecreamery.com/stores/ice-cream-near-lathrop/23929), [Jersey Mike’s Manteca](https://www.jerseymikes.com/20449/manteca-ca). Retrieved official pages retain matching store addresses and ordering details; no supported closure or changed opening date identified. Sprouts redirects to its canonical store page successfully. No general-hours-to-Thanksgiving-hours inference, no date changes based on cached fetches, no portfolio/brand image reuse. LOCAL_OPENINGS monthly hide deadline Dec7 remains in force; not overdue. Events page still separates past via isUpcomingEvent; historical rows not deleted. This is not a complete closure watch or every event audit.

## Supply and imagery decisions

Read-only listing_checks coverage: pet sitting/dog walking each MH3,Tracy3,Lathrop2,Manteca2. Holiday-light installation MH3,Tracy6,Lathrop4,Manteca5;solar exclusion MH4,Tracy3,Lathrop4,Manteca3. Counts reflect recorded website coverage/tags, not independently validated credentials, live availability or newly added providers. Prioritize Lathrop/Manteca pet care in next supply pass.

Focused real2026MH/Manteca licensed-photo search found no qualifying new candidate. Results included unrelated MountainHouse shelters/Mohonk and [Manteca/Stockton image from2013](https://commons.wikimedia.org/wiki/File:Manteca_and_Stockton,_California_(10753656085).jpg); reject as2026street imagery. No photo downloaded/replaced, no permission requests sent. Service/event photos remain held without existing rights; no blanket rights inferred from public sites.

Facebook unpublished; photo exact-location/date/rights tasks and genuine-reporter pet pilot open. No synthetic residents, outreach, new accounts/scopes, spending or notifications sent. Next Friday cycle should recheck Nov13–18 organizer notices, pursue actual Lathrop/Manteca pet-care additions and continue eligible imagery sourcing.
