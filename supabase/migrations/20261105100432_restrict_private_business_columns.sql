-- Phase 2: apply only after every public business read uses its explicit projection.
begin;
revoke select on public.businesses from public,anon,authenticated;
revoke select (email,contact_email) on public.businesses from public,anon,authenticated;
-- Re-grant explicitly: PostgreSQL may optimize away column grants made while a
-- role already has table-level SELECT, so they cannot be assumed to survive.
grant select (id,name,category,city,address,phone,website,description,hours,rating,review_count,
  claimed,verified,featured,status,created_at,updated_at,source,source_url,last_ingested_at,
  confidence_score,needs_review,image_source,google_place_id,verification_source,verified_at)
  on public.businesses to anon,authenticated;
notify pgrst, 'reload schema';
commit;
