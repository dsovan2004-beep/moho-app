# Correction receipt acceptance — November 9, 2026

Existing Worker POST /submit-signal returns201 with status=success, submission_id and needs_review=true after authenticated create_community_signal saves the request. Frontend previously discarded the response body.

LIVING-02 change: consume that exact saved-reference contract; show Received · pending review, the actual UUID, Return to listing with supported affected city, and Suggest another change retaining listing/city while clearing prior details. Ordinary community submissions receive a generic reference receipt. No approval/publication claim or invented My requests tracking.

Malformed/missing references on successful HTTP responses stay uncertain, not successful. Interrupted requests after send also stay uncertain, preserve form contents and disable immediate resubmission; before-send failures show a recoverable error. No automatic retries. Reference is not saved to browser storage or placed in a public tracking URL. No Worker/API/schema/RLS/permissions changes.

Verification:
-158tests pass, including actual Worker HTTP response→receipt validator contract, missing/false review flags and invalid references, fixed safe listing return, rendered pending copy/reference.
- Final OpenNext build passed; latest source TypeScript check passed.
- Actual receipt component rendered locally with compiled app CSS and explicitly labeled example reference;390px no document overflow. Screenshot nov9-correction-receipt-fixture.png is a LOCAL FIXTURE, not a saved production correction.
- No synthetic report or resident action submitted. Genuine saved-report/receipt review acceptance remains open.

Source1b4fbb5 deployed native0be44461 Ready2m15s; public build marker matches1b4fbb59964e7814a93f888e9e7641538031375a. Live correction form checked without submitting: Manteca retained, canonical listing URL read-only. Native build passed. Receipt itself verified through local component/contract fixture, not fabricated production activity. FB unpublished, photo rights/location tasks and genuine-reporter pet pilot open.
