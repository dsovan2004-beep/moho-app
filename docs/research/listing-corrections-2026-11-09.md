# Resident listing correction flow — November 9, 2026

LIVING-01: directory cards now expose Suggest a correction with a business-specific accessible label. Detail-page correction action retains resident city. The report route validates UUID, reads only the approved/public business and explicit coverage with the ordinary public client, then pre-fills business name/reference and affected city into the existing business_update form. Missing/invalid IDs return404; lookup errors remain errors rather than being misreported as nonexistent listings.

Focused form: clear correction heading, business identity/link, source/date guidance, affected city, correction summary and What changed fields. Unrelated submission-type choices hidden for linked corrections. Listing contact_url is read-only and fixed from the validated business UUID on send. Back returns to the listing/city. New labels are associated with their inputs. Confirmed-account gating and existing moderated business_update endpoint remain; no direct business editing or new data/schema/permissions.

Local production-build acceptance:
- Manteca directory → Luminate correction pre-fills Luminate name/UUID and Manteca, rather than its Lathrop office city.
- Listing link is fixed to the actual business detail URL; no report sent.
- Signed-out form retains its context and sign-in link; fields remain disabled.
- Correction params survive existing safeReturnTo policy unchanged.
- Invalid and absent business IDs404; repeated requested city ignored with supported actual-office fallback.
-155tests and final OpenNext/TypeScript pass. Source02055f6 deployed native36f178cd Ready1m36s; live build marker matches full source02055f6d4ad3e112f9d19c1332e397768a85decf. Live card→form confirms name, business UUID, Manteca city and read-only canonical listing URL;390px no document overflow. Emulation reset. Public screenshot: nov9-listing-correction-live.png. General event form retained. No real report submitted; genuine submission/review acceptance remains open.

Facebook unpublished. Photo rights/location, genuine-reporter pet pilot and physical-phone/genuine resident acceptance remain OPEN. No synthetic reports, claims, contacts or outcomes created.
