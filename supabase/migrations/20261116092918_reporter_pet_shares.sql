begin;
create table public.pet_report_shares (
 id uuid primary key, submitted_by uuid not null references auth.users(id),
 city text not null check(city in ('Mountain House','Tracy','Lathrop','Manteca')),
 title text not null check(length(title) between 5 and 200), description text not null check(length(description) between 1 and 4000),
 pet_status text not null check(pet_status in ('lost','found','reunited')),
 facebook_url text not null, original_report_date date not null, photo_credit text not null,
 photo_paths text[] not null check(cardinality(photo_paths) between 1 and 3),
 permission_version text not null check(permission_version='2026-11-16-v1'), permission_text text not null,
 permission_granted_at timestamptz not null default now(), created_at timestamptz not null default now(),
 review_status text not null default 'pending' check(review_status in ('pending','approved','rejected','withdrawn')),
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 published_report_id uuid references public.lost_and_found(id)
);
alter table public.pet_report_shares enable row level security;
revoke all on public.pet_report_shares from anon,authenticated;
grant select on public.pet_report_shares to authenticated;
create policy pet_share_read on public.pet_report_shares for select to authenticated
 using(submitted_by=(select auth.uid()) or directory_private.is_admin());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('pet-share-pending','pet-share-pending',false,5242880,array['image/jpeg','image/png','image/webp']);
create function directory_private.published_pet_photo(path text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.pet_report_shares s join public.lost_and_found p on p.id=s.published_report_id
 where s.review_status='approved' and p.needs_review=false and path=any(s.photo_paths)); $$;
revoke all on function directory_private.published_pet_photo(text) from public;
grant execute on function directory_private.published_pet_photo(text) to anon,authenticated;
create function directory_private.can_upload_pet_share() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null and not coalesce(is_anonymous,false))
 and (select count(*) from storage.objects where bucket_id='pet-share-pending' and owner_id=auth.uid()::text and created_at>now()-interval '1 day')<30;$$;
revoke all on function directory_private.can_upload_pet_share() from public;grant execute on function directory_private.can_upload_pet_share() to authenticated;
create policy pet_share_upload on storage.objects for insert to authenticated with check(
 bucket_id='pet-share-pending' and (storage.foldername(name))[1]=(select auth.uid())::text and directory_private.can_upload_pet_share());
create policy pet_share_photo_read on storage.objects for select to anon,authenticated using(
 bucket_id='pet-share-pending' and ((storage.foldername(name))[1]=(select auth.uid())::text
 or directory_private.is_admin() or directory_private.published_pet_photo(name)));
create function directory_private.submit_pet_share(p jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); sid uuid; paths text[]; path text; existing public.pet_report_shares;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Confirmed sign-in required' using errcode='42501';end if;
 if p is null or jsonb_typeof(p)<>'object' or octet_length(p::text)>12000 then raise exception 'Invalid report' using errcode='22023';end if;
 sid:=(p->>'id')::uuid;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,72));
 select * into existing from public.pet_report_shares where id=sid;
 if found then if existing.submitted_by=uid then return sid;else raise exception 'Invalid reference' using errcode='42501';end if;end if;
 if (select count(*) from public.pet_report_shares where submitted_by=uid and created_at>now()-interval '1 day')>=10 then raise exception 'Daily limit reached' using errcode='P0001';end if;
 if p->'permission' is distinct from 'true'::jsonb or p->>'permission_version' is distinct from '2026-11-16-v1'
 or coalesce(p->>'city','') not in ('Mountain House','Tracy','Lathrop','Manteca')
 or coalesce(p->>'status','') not in ('lost','found','reunited')
 or coalesce(length(trim(p->>'title')),0) not between 5 and 200
 or coalesce(length(trim(p->>'description')),0) not between 1 and 4000
 or coalesce(length(trim(p->>'credit')),0) not between 1 and 120
 or coalesce(p->>'facebook_url','') !~ '^https://(www\.|m\.)?facebook\.com/[^[:space:]#]+$'
 or length(p->>'facebook_url')>2000
 or coalesce(p->>'report_date','') !~ '^\d{4}-\d{2}-\d{2}$'
 or (p->>'report_date')::date>current_date
 or jsonb_typeof(p->'photo_paths') is distinct from 'array' then raise exception 'Check report and permission fields' using errcode='22023';end if;
 select array_agg(value) into paths from jsonb_array_elements_text(p->'photo_paths');
 if coalesce(cardinality(paths),0) not between 1 and 3 then raise exception 'Add one to three photos' using errcode='22023';end if;
 foreach path in array paths loop
 if path !~ ('^'||uid::text||'/'||sid::text||'/[0-2]\.jpg$') or not exists(select 1 from storage.objects where bucket_id='pet-share-pending' and name=path and owner_id=uid::text) then raise exception 'Photo ownership unavailable' using errcode='42501';end if;
 end loop;
 insert into public.pet_report_shares(id,submitted_by,city,title,description,pet_status,facebook_url,original_report_date,photo_credit,photo_paths,permission_version,permission_text)
 values(sid,uid,p->>'city',trim(p->>'title'),trim(p->>'description'),p->>'status',p->>'facebook_url',(p->>'report_date')::date,trim(p->>'credit'),paths,'2026-11-16-v1',
 'I am the original reporter or have their permission to share this report. I own these photos or have permission from their creator to publish them. I authorize MoHoLocal to display the submitted report, Facebook source link, photos and photo credit after review. I have checked the current status and removed private addresses, phone numbers and sensitive ownership details.');
 return sid;
end $$;
revoke all on function directory_private.submit_pet_share(jsonb) from public;
grant execute on function directory_private.submit_pet_share(jsonb) to authenticated;
create function public.submit_pet_share(p jsonb) returns uuid language sql set search_path='' as $$ select directory_private.submit_pet_share(p); $$;
revoke all on function public.submit_pet_share(jsonb) from public,anon;grant execute on function public.submit_pet_share(jsonb) to authenticated;
create function directory_private.review_pet_share(sid uuid,decision text,reviewed boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare s public.pet_report_shares; pid uuid;
begin
 if directory_private.is_admin() is distinct from true then raise exception 'Admin required' using errcode='42501';end if;
 select * into s from public.pet_report_shares where id=sid for update;
 if not found or s.review_status<>'pending' or decision not in ('approve','reject') then raise exception 'Not a pending report' using errcode='22023';end if;
 if decision='approve' then
 if reviewed is distinct from true then raise exception 'Review permission, privacy, source and duplicates first' using errcode='22023';end if;
 insert into public.lost_and_found(type,title,description,city,status,reporter_id,contact_name,source_url,image_url,source,needs_review,last_seen,status_confirmed_at,expires_at)
 values('pet',s.title,s.description,s.city,s.pet_status,s.submitted_by,'Reporter submission',s.facebook_url,
 'https://www.moholocal.com/api/pet-share-photo/'||s.id::text||'/0','community',false,s.original_report_date,s.created_at,s.created_at+interval '30 days') returning id into pid;
 end if;
 update public.pet_report_shares set review_status=case when decision='approve' then 'approved' else 'rejected' end,reviewed_by=auth.uid(),reviewed_at=now(),published_report_id=pid where id=sid;
 return pid;
end $$;
revoke all on function directory_private.review_pet_share(uuid,text,boolean) from public;grant execute on function directory_private.review_pet_share(uuid,text,boolean) to authenticated;
create function public.review_pet_share(sid uuid,decision text,reviewed boolean default false) returns uuid language sql set search_path='' as $$select directory_private.review_pet_share(sid,decision,reviewed);$$;
revoke all on function public.review_pet_share(uuid,text,boolean) from public,anon;grant execute on function public.review_pet_share(uuid,text,boolean) to authenticated;
create function directory_private.pet_share_media(sid uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('paths',s.photo_paths,'credit',s.photo_credit,'reportDate',s.original_report_date,'reportId',s.published_report_id)
 from public.pet_report_shares s join public.lost_and_found p on p.id=s.published_report_id
 where s.id=sid and s.review_status='approved' and p.needs_review=false;$$;
revoke all on function directory_private.pet_share_media(uuid) from public;grant execute on function directory_private.pet_share_media(uuid) to anon,authenticated;
create function public.pet_share_media(sid uuid) returns jsonb language sql stable set search_path='' as $$select directory_private.pet_share_media(sid);$$;
revoke all on function public.pet_share_media(uuid) from public;grant execute on function public.pet_share_media(uuid) to anon,authenticated;
create function directory_private.withdraw_pet_share(sid uuid) returns void language plpgsql security definer set search_path='' as $$
declare s public.pet_report_shares;
begin
 select * into s from public.pet_report_shares where id=sid and submitted_by=auth.uid() for update;
 if not found then raise exception 'Report unavailable' using errcode='42501';end if;
 if s.review_status not in ('pending','approved') then return;end if;
 update public.pet_report_shares set review_status='withdrawn' where id=sid;
 if s.published_report_id is not null then update public.lost_and_found set needs_review=true where id=s.published_report_id and reporter_id=auth.uid();end if;
end $$;
revoke all on function directory_private.withdraw_pet_share(uuid) from public;grant execute on function directory_private.withdraw_pet_share(uuid) to authenticated;
create function public.withdraw_pet_share(sid uuid) returns void language sql set search_path='' as $$select directory_private.withdraw_pet_share(sid);$$;
revoke all on function public.withdraw_pet_share(uuid) from public,anon;grant execute on function public.withdraw_pet_share(uuid) to authenticated;

notify pgrst,'reload schema';
commit;
