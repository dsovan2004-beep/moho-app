begin;
-- All resident intake now uses the confirmed-account, durable quota paths.
do $$ declare p record; begin
 for p in select tablename,policyname from pg_policies where schemaname='public' and tablename in ('business_suggestions','listing_reports','lost_and_found') and cmd in ('INSERT','ALL')
 loop execute format('drop policy %I on public.%I',p.policyname,p.tablename); end loop;
end $$;
revoke insert on public.business_suggestions,public.listing_reports,public.lost_and_found from public,anon,authenticated;
-- Hide moderation/archived pet records regardless of which public page reads them.
do $$ declare p record; begin
 for p in select policyname from pg_policies where schemaname='public' and tablename='lost_and_found' and cmd='SELECT'
 loop execute format('drop policy %I on public.lost_and_found',p.policyname); end loop;
end $$;
create policy public_pet_reports on public.lost_and_found for select to anon,authenticated
using (needs_review is not true and coalesce(ingestion_status,'active')='active' and status in ('active','lost','found','reunited'));
create policy pet_report_admin_read on public.lost_and_found for select to authenticated using (directory_private.is_admin());
create policy pet_report_upload_guard on storage.objects as restrictive for insert to authenticated
with check (bucket_id<>'pet-images' or directory_private.is_admin());
alter table public.community_submissions add column pet_status text check(pet_status in ('lost','found','reunited'));
create or replace function directory_private.create_signal(p_payload jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); signal_id uuid;
begin
  if uid is null or not exists (select 1 from auth.users where id=uid and email_confirmed_at is not null) then
    raise exception 'Confirmed sign-in required' using errcode='42501'; end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>16000
    or coalesce(length(trim(p_payload->>'title')),0) not between 5 and 200
    or coalesce(length(trim(p_payload->>'description')),0) not between 1 and 4000
    or coalesce(p_payload->>'city','') not in ('Mountain House','Tracy','Lathrop','Manteca','Brentwood','San Jose','Santa Clara','Sunnyvale')
    or coalesce(p_payload->>'submission_type','') not in ('event','lost_pet','business_update','community_tip','garage_sale') then
    raise exception 'Invalid community submission' using errcode='22023'; end if;
  if (coalesce(p_payload->>'contact_url','')<>'' and (p_payload->>'contact_url') !~ '^https?://[^[:space:]]+$')
    or (coalesce(p_payload->>'image_url','')<>'' and (p_payload->>'image_url') !~ '^https?://[^[:space:]]+$') then
    raise exception 'Invalid public URL' using errcode='22023'; end if;
  if p_payload->>'submission_type'='lost_pet' and coalesce(p_payload->>'pet_status','lost') not in ('lost','found','reunited') then
    raise exception 'Invalid pet report status' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,1));
  if (select count(*) from public.community_submissions where submitted_by=uid and created_at>now()-interval '1 day')>=10 then
    raise exception 'Daily submission limit reached' using errcode='P0001'; end if;
  insert into public.community_submissions(title,description,city,submission_type,event_date,image_url,contact_url,
    source,needs_review,submitted_by,source_file,raw_text,ocr_confidence,pet_status)
  values(trim(p_payload->>'title'),trim(p_payload->>'description'),p_payload->>'city',p_payload->>'submission_type',
    nullif(p_payload->>'event_date','')::timestamptz,nullif(p_payload->>'image_url',''),nullif(p_payload->>'contact_url',''),
    'community',true,uid,left(p_payload->>'source_file',200),left(p_payload->>'raw_text',3000),
    case when jsonb_typeof(p_payload->'ocr_confidence')='number' then greatest(0,least(1,(p_payload->>'ocr_confidence')::numeric)) else null end,
    case when p_payload->>'submission_type'='lost_pet' then coalesce(p_payload->>'pet_status','lost') else null end)
  returning id into signal_id;
  return signal_id;
end $$;
notify pgrst,'reload schema';
commit;
