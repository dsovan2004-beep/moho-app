-- Phase 1: backward-compatible authorization and request schema. Preserve existing
-- SELECT grants until the new web app is active; phase 2 restricts private columns.
-- No existing listing is deleted or re-verified.
begin;
revoke create on schema public from public,anon,authenticated;
create schema if not exists directory_private;
revoke all on schema directory_private from public, anon, authenticated;
grant usage on schema directory_private to authenticated;

create table directory_private.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table directory_private.admins enable row level security;
revoke all on directory_private.admins from public, anon, authenticated;
-- Bootstrap only existing, confirmed accounts from the existing admin allowlist.
insert into directory_private.admins(user_id)
select id from auth.users where lower(email) in ('dsovan2004@gmail.com','danyoeur1983@gmail.com')
and email_confirmed_at is not null;

create function directory_private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists
    (select 1 from directory_private.admins a where a.user_id = auth.uid());
$$;
revoke all on function directory_private.is_admin() from public, anon, authenticated;
grant execute on function directory_private.is_admin() to authenticated;
create function public.is_directory_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select directory_private.is_admin();
$$;
revoke all on function public.is_directory_admin() from public, anon;
grant execute on function public.is_directory_admin() to authenticated;

-- Replace policies, not RLS. Service-role jobs retain their existing grants.
do $$ declare p record; begin
  for p in select schemaname,tablename,policyname from pg_policies
    where schemaname='public' and tablename in
      ('businesses','business_images','community_submissions','city_status','members')
  loop execute format('drop policy %I on %I.%I',p.policyname,p.schemaname,p.tablename); end loop;
end $$;
alter table public.businesses enable row level security;
alter table public.business_images enable row level security;
alter table public.community_submissions enable row level security;
alter table public.city_status enable row level security;
alter table public.members enable row level security;

revoke insert,update,delete,truncate,references,trigger on public.businesses from public,anon,authenticated;
revoke all on public.business_images, public.community_submissions,
  public.city_status, public.members, public.pending_review from public, anon, authenticated;
-- Column-level grants keep private contact addresses out of direct API reads.
grant select (id,name,category,city,address,phone,website,description,hours,rating,review_count,
  claimed,verified,featured,status,created_at,updated_at,source,source_url,last_ingested_at,
  confidence_score,needs_review,image_source,google_place_id,verification_source,verified_at)
  on public.businesses to anon,authenticated;
grant insert,update,delete on public.businesses to authenticated;
create policy directory_public_businesses on public.businesses for select to anon
using (status='approved' and verified=true);
create policy directory_authenticated_businesses on public.businesses for select to authenticated
using ((status='approved' and verified=true) or directory_private.is_admin());
create policy directory_admin_insert on public.businesses for insert to authenticated
with check (directory_private.is_admin());
create policy directory_admin_update on public.businesses for update to authenticated
using (directory_private.is_admin()) with check (directory_private.is_admin());
create policy directory_admin_delete on public.businesses for delete to authenticated
using (directory_private.is_admin());

grant select on public.business_images to anon,authenticated;
grant insert,update,delete on public.business_images to authenticated;
create policy directory_public_images on public.business_images for select to anon,authenticated
using (verified=true and source in ('google_places','owner_upload','admin_verified') and exists
  (select 1 from public.businesses b where b.id=business_id and b.status='approved' and b.verified=true));
create policy directory_admin_images on public.business_images for all to authenticated
using (directory_private.is_admin()) with check (directory_private.is_admin());
grant select,insert,update,delete on public.community_submissions to authenticated;
create policy directory_admin_staging on public.community_submissions for all to authenticated
using (directory_private.is_admin()) with check (directory_private.is_admin());
grant select on public.city_status to anon,authenticated;
grant update on public.city_status to authenticated;
create policy directory_city_read on public.city_status for select to anon,authenticated using (true);
create policy directory_city_update on public.city_status for update to authenticated
using (directory_private.is_admin()) with check (directory_private.is_admin());
grant select on public.members to authenticated;
create policy directory_member_read on public.members for select to authenticated
using (directory_private.is_admin());
alter view public.pending_review set (security_invoker=true);
-- Keep the aggregate staging view internal; the admin UI uses its restricted tables.
grant all on directory_private.admins to service_role;

-- Existing public upload-to-signals policies allowed anonymous storage abuse.
drop policy if exists "Allow anon uploads to signals folder" on storage.objects;
drop policy if exists "anon upload signals" on storage.objects;
create policy directory_admin_signal_upload on storage.objects for insert to authenticated
with check (bucket_id='community-images' and (storage.foldername(name))[1]='signals'
  and directory_private.is_admin());

create table public.business_requests (
  id uuid primary key default gen_random_uuid(),
  request_key uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('submission','claim')),
  business_id uuid references public.businesses(id),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  review_note text,
  evidence_url text,
  unique(user_id,request_key),
  check (kind <> 'claim' or business_id is not null)
);
create index business_requests_queue on public.business_requests(status,created_at);
create index business_requests_requester on public.business_requests(user_id,created_at);
create unique index business_requests_pending_claim on public.business_requests(user_id,business_id)
where kind='claim' and status='pending';
create table public.business_owners (
  business_id uuid primary key references public.businesses(id),
  user_id uuid not null references auth.users(id),
  claim_id uuid not null unique references public.business_requests(id),
  approved_at timestamptz not null default now(),
  approved_by uuid not null references auth.users(id)
);
create index business_owners_user on public.business_owners(user_id);
alter table public.business_requests enable row level security;
alter table public.business_owners enable row level security;
revoke all on public.business_requests,public.business_owners from public,anon,authenticated;
grant select on public.business_requests,public.business_owners to authenticated;
grant all on public.business_requests,public.business_owners to service_role;
create policy directory_request_read on public.business_requests for select to authenticated
using (user_id=(select auth.uid()) or directory_private.is_admin());
create policy directory_owner_read on public.business_owners for select to authenticated
using (user_id=(select auth.uid()) or directory_private.is_admin());

-- Privileged code lives outside the exposed schema and checks its own identity.
create function directory_private.create_request(p_kind text,p_business_id uuid,p_payload jsonb,p_key uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid(); account_email text; existing public.business_requests; request_id uuid;
begin
  select email into account_email from auth.users where id=uid and email_confirmed_at is not null;
  if uid is null or account_email is null then raise exception 'Confirmed sign-in required' using errcode='42501'; end if;
  if p_kind not in ('submission','claim') or p_kind is null or p_key is null
     or p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>16000 then
    raise exception 'Invalid request' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select * into existing from public.business_requests where user_id=uid and request_key=p_key;
  if found then
    if existing.kind<>p_kind or existing.business_id is distinct from p_business_id
       or existing.payload - 'contact_email' is distinct from p_payload - 'contact_email' then
      raise exception 'Request key already used' using errcode='23505'; end if;
    return existing.id;
  end if;
  if (select count(*) from public.business_requests where user_id=uid and created_at>now()-interval '1 day')>=5 then
    raise exception 'Daily request limit reached; try again tomorrow' using errcode='P0001'; end if;
  if exists (select 1 from jsonb_each(p_payload) v where jsonb_typeof(v.value)<>'string' or length(v.value#>>'{}')>4000) then
    raise exception 'Invalid field value' using errcode='22023'; end if;
  if p_kind='submission' then
    if p_business_id is not null or exists (select 1 from jsonb_object_keys(p_payload) k
      where k not in ('name','category','city','address','phone','website','description','hours','contact_email'))
      or coalesce(length(trim(p_payload->>'name')),0) not between 2 and 160
      or coalesce(length(trim(p_payload->>'description')),0) not between 10 and 4000
      or coalesce(p_payload->>'city','') not in ('Mountain House','Tracy','Lathrop','Manteca','Brentwood','San Jose','Santa Clara','Sunnyvale')
      or coalesce(p_payload->>'category','') not in ('Restaurants','Health & Wellness','Beauty & Spa','Home Services','Automotive','Pet Services','Real Estate','Education','Retail')
      or (coalesce(trim(p_payload->>'phone'),'')='' and coalesce(trim(p_payload->>'website'),'')='') then
      raise exception 'Supply a valid business, city, category, description and public phone or website' using errcode='22023'; end if;
    if coalesce(p_payload->>'website','')<>'' and (p_payload->>'website') !~ '^https?://[^[:space:]]+$' then
      raise exception 'Website must use http or https' using errcode='22023'; end if;
  else
    if exists (select 1 from jsonb_object_keys(p_payload) k where k not in ('owner_name','owner_phone','role','contact_email'))
      or coalesce(length(trim(p_payload->>'owner_name')),0) not between 2 and 160
      or coalesce(length(trim(p_payload->>'owner_phone')),0) not between 7 and 40
      or coalesce(p_payload->>'role','') not in ('Owner','Manager','Employee') then
      raise exception 'Supply your name, phone and role' using errcode='22023'; end if;
    if not exists (select 1 from public.businesses where id=p_business_id and status='approved' and verified=true) then
      raise exception 'Public listing not found' using errcode='22023'; end if;
    if exists (select 1 from public.business_owners where business_id=p_business_id)
      or exists (select 1 from public.businesses where id=p_business_id and claimed=true) then
      raise exception 'This listing already has an owner; contact support' using errcode='23505'; end if;
    select * into existing from public.business_requests where user_id=uid and business_id=p_business_id and kind='claim' and status='pending';
    if found then return existing.id; end if;
  end if;
  insert into public.business_requests(user_id,request_key,kind,business_id,payload)
  values(uid,p_key,p_kind,p_business_id,p_payload || jsonb_build_object('contact_email',account_email)) returning id into request_id;
  return request_id;
end $$;
revoke all on function directory_private.create_request(text,uuid,jsonb,uuid) from public,anon,authenticated;
grant execute on function directory_private.create_request(text,uuid,jsonb,uuid) to authenticated;
create function public.create_business_request(p_kind text,p_business_id uuid,p_payload jsonb,p_key uuid)
returns uuid language sql security invoker set search_path='' as $$
  select directory_private.create_request(p_kind,p_business_id,p_payload,p_key);
$$;
revoke all on function public.create_business_request(text,uuid,jsonb,uuid) from public,anon;
grant execute on function public.create_business_request(text,uuid,jsonb,uuid) to authenticated;

create function directory_private.review_request(p_id uuid,p_action text,p_note text,p_evidence_url text)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.business_requests; bid uuid; actor uuid:=auth.uid();
begin
  if not directory_private.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  if p_action is null or p_action not in ('approve','reject') or coalesce(length(trim(p_note)),0) not between 10 and 2000 then
    raise exception 'Choose approve/reject and record review notes (10-2000 characters)' using errcode='22023'; end if;
  if p_action='approve' and (p_evidence_url is null or length(p_evidence_url)>2048 or p_evidence_url !~ '^https?://[^[:space:]]+$') then
    raise exception 'A public business evidence URL is required' using errcode='22023'; end if;
  select * into r from public.business_requests where id=p_id for update;
  if not found then raise exception 'Request not found' using errcode='22023'; end if;
  if r.status<>'pending' then raise exception 'Request already reviewed' using errcode='23505'; end if;
  bid:=r.business_id;
  if p_action='approve' then
    if r.kind='claim' then
      perform 1 from public.businesses where id=bid and status='approved' and verified=true and claimed=false for update;
      if not found then raise exception 'Listing unavailable or already claimed' using errcode='23505'; end if;
      insert into public.business_owners(business_id,user_id,claim_id,approved_by) values(bid,r.user_id,r.id,actor);
      update public.businesses set claimed=true,updated_at=now() where id=bid;
    else
      insert into public.businesses(name,category,city,address,phone,website,description,hours,contact_email,
        status,verified,claimed,source,needs_review,verification_source,verified_at)
      values(r.payload->>'name',r.payload->>'category',r.payload->>'city',nullif(r.payload->>'address',''),
        nullif(r.payload->>'phone',''),nullif(r.payload->>'website',''),r.payload->>'description',nullif(r.payload->>'hours',''),
        r.payload->>'contact_email','approved',true,false,'owner_submission',false,p_evidence_url,now()) returning id into bid;
    end if;
  end if;
  update public.business_requests set status=case p_action when 'approve' then 'approved' else 'rejected' end,
    business_id=bid,reviewed_at=now(),reviewed_by=actor,review_note=trim(p_note),evidence_url=p_evidence_url where id=r.id;
  return r.id;
end $$;
revoke all on function directory_private.review_request(uuid,text,text,text) from public,anon,authenticated;
grant execute on function directory_private.review_request(uuid,text,text,text) to authenticated;
create function public.review_business_request(p_id uuid,p_action text,p_note text,p_evidence_url text)
returns uuid language sql security invoker set search_path='' as $$
  select directory_private.review_request(p_id,p_action,p_note,p_evidence_url);
$$;
revoke all on function public.review_business_request(uuid,text,text,text) from public,anon;
grant execute on function public.review_business_request(uuid,text,text,text) to authenticated;

-- Admin-only full projection, including private contacts; ordinary SELECT cannot read them.
create function directory_private.admin_businesses() returns setof public.businesses
language plpgsql stable security definer set search_path='' as $$
begin
  if not directory_private.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  return query select * from public.businesses;
end $$;
revoke all on function directory_private.admin_businesses() from public,anon,authenticated;
grant execute on function directory_private.admin_businesses() to authenticated;
create function public.admin_businesses() returns setof public.businesses
language sql stable security invoker set search_path='' as $$ select * from directory_private.admin_businesses(); $$;
revoke all on function public.admin_businesses() from public,anon;
grant execute on function public.admin_businesses() to authenticated;

-- Review inserts must still maintain aggregates after ordinary business writes are denied.
create function directory_private.recalculate_rating() returns trigger
language plpgsql security definer set search_path='' as $$
declare bid uuid := coalesce(new.business_id,old.business_id);
begin
  update public.businesses set
    rating=(select round(avg(rating)::numeric,1) from public.reviews where business_id=bid),
    review_count=(select count(*) from public.reviews where business_id=bid) where id=bid;
  return null;
end $$;
revoke all on function directory_private.recalculate_rating() from public,anon,authenticated;
drop trigger if exists update_business_rating_trigger on public.reviews;
create trigger update_business_rating_trigger after insert or update or delete on public.reviews
for each row execute function directory_private.recalculate_rating();
-- Existing-listing moderation is evidence-bound and auditable too.
create table directory_private.business_audit (
  id uuid primary key default gen_random_uuid(), business_id uuid not null,
  actor uuid not null, action text not null, note text not null, evidence_url text,
  previous_record jsonb not null, created_at timestamptz not null default now()
);
alter table directory_private.business_audit enable row level security;
revoke all on directory_private.business_audit from public,anon,authenticated;
create function directory_private.review_existing(p_id uuid,p_action text,p_note text,p_evidence_url text)
returns uuid language plpgsql security definer set search_path='' as $$
declare b public.businesses;
begin
  if not directory_private.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  if p_action is null or p_action not in ('approve','reject','unpublish') or coalesce(length(trim(p_note)),0) not between 10 and 2000 then
    raise exception 'Decision and review notes are required' using errcode='22023'; end if;
  if p_action='approve' and (p_evidence_url is null or length(p_evidence_url)>2048 or p_evidence_url !~ '^https?://[^[:space:]]+$') then
    raise exception 'Public business evidence URL required' using errcode='22023'; end if;
  select * into b from public.businesses where id=p_id for update;
  if not found then raise exception 'Listing not found' using errcode='22023'; end if;
  insert into directory_private.business_audit(business_id,actor,action,note,evidence_url,previous_record)
  values(p_id,auth.uid(),p_action,p_note,p_evidence_url,to_jsonb(b));
  update public.businesses set status=case p_action when 'approve' then 'approved' when 'reject' then 'rejected' else 'pending_review' end,
    verified=(p_action='approve'), needs_review=(p_action='unpublish'), updated_at=now(),
    verification_source=case when p_action='approve' then p_evidence_url else null end,
    verified_at=case when p_action='approve' then now() else null end where id=p_id;
  return p_id;
end $$;
revoke all on function directory_private.review_existing(uuid,text,text,text) from public,anon,authenticated;
grant execute on function directory_private.review_existing(uuid,text,text,text) to authenticated;
create function public.review_existing_business(p_id uuid,p_action text,p_note text,p_evidence_url text)
returns uuid language sql security invoker set search_path='' as $$
  select directory_private.review_existing(p_id,p_action,p_note,p_evidence_url);
$$;
revoke all on function public.review_existing_business(uuid,text,text,text) from public,anon;
grant execute on function public.review_existing_business(uuid,text,text,text) to authenticated;
-- Preserve resident community intake without reopening raw staging writes.
alter table public.community_submissions add column if not exists submitted_by uuid references auth.users(id);
create index community_submissions_requester on public.community_submissions(submitted_by,created_at);
create function directory_private.create_signal(p_payload jsonb) returns uuid
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
  perform pg_advisory_xact_lock(hashtextextended(uid::text,1));
  if (select count(*) from public.community_submissions where submitted_by=uid and created_at>now()-interval '1 day')>=10 then
    raise exception 'Daily submission limit reached' using errcode='P0001'; end if;
  insert into public.community_submissions(title,description,city,submission_type,event_date,image_url,contact_url,
    source,needs_review,submitted_by,source_file,raw_text,ocr_confidence)
  values(trim(p_payload->>'title'),trim(p_payload->>'description'),p_payload->>'city',p_payload->>'submission_type',
    nullif(p_payload->>'event_date','')::timestamptz,nullif(p_payload->>'image_url',''),nullif(p_payload->>'contact_url',''),
    'community',true,uid,left(p_payload->>'source_file',200),left(p_payload->>'raw_text',3000),
    case when jsonb_typeof(p_payload->'ocr_confidence')='number' then greatest(0,least(1,(p_payload->>'ocr_confidence')::numeric)) else null end)
  returning id into signal_id;
  return signal_id;
end $$;
revoke all on function directory_private.create_signal(jsonb) from public,anon,authenticated;
grant execute on function directory_private.create_signal(jsonb) to authenticated;
create function public.create_community_signal(p_payload jsonb) returns uuid
language sql security invoker set search_path='' as $$ select directory_private.create_signal(p_payload); $$;
revoke all on function public.create_community_signal(jsonb) from public,anon;
grant execute on function public.create_community_signal(jsonb) to authenticated;
-- Restrictive policy prevents older permissive upload grants from bypassing the signals gate.
create policy directory_signal_upload_guard on storage.objects as restrictive for insert to authenticated
with check (bucket_id<>'community-images' or (storage.foldername(name))[1]<>'signals' or directory_private.is_admin());
-- Harden existing helper search paths without changing their behavior.
do $$ declare signature text; begin
  foreach signature in array array['public.update_business_rating()', 'public.update_post_reply_count()',
    'public.toggle_reaction(uuid,text,text,uuid)'] loop
    if to_regprocedure(signature) is not null then
      execute 'alter function ' || signature || ' set search_path=public,pg_temp';
    end if;
  end loop;
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public,anon,authenticated;
  end if;
end $$;
notify pgrst,'reload schema';
commit;
