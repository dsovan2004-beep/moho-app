begin;
create or replace function directory_private.published_pet_photo(path text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.pet_report_shares s join public.lost_and_found p on p.id=s.published_report_id
 where s.review_status='approved' and p.needs_review=false and p.expires_at>now() and coalesce(p.ingestion_status,'active')='active' and path=any(s.photo_paths));$$;
create or replace function directory_private.pet_share_media(sid uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('paths',s.photo_paths,'credit',s.photo_credit,'reportDate',s.original_report_date,'reportId',s.published_report_id)
 from public.pet_report_shares s join public.lost_and_found p on p.id=s.published_report_id
 where s.id=sid and s.review_status='approved' and p.needs_review=false and p.expires_at>now() and coalesce(p.ingestion_status,'active')='active';$$;
commit;
