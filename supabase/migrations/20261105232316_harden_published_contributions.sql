begin;
-- Replies/reviews inherit the publication boundary of their parent record.
do $$ declare p record; begin
 for p in select tablename,policyname from pg_policies where schemaname='public' and tablename in ('community_replies','reviews') and cmd in ('SELECT','INSERT','ALL')
 loop execute format('drop policy %I on public.%I',p.policyname,p.tablename); end loop;
end $$;
create policy public_replies on public.community_replies for select to anon,authenticated
using (exists(select 1 from public.community_posts p where p.id=post_id and p.status in ('approved','active')));
create policy account_replies on public.community_replies for insert to authenticated
with check(user_id=(select auth.uid()) and length(content) between 1 and 5000 and exists(select 1 from public.community_posts p where p.id=post_id and p.status in ('approved','active')));
create policy public_reviews on public.reviews for select to anon,authenticated
using (exists(select 1 from public.businesses b where b.id=business_id and b.status='approved' and b.verified=true));
create policy account_reviews on public.reviews for insert to authenticated
with check(user_id=(select auth.uid()) and rating between 1 and 5 and exists(select 1 from public.businesses b where b.id=business_id and b.status='approved' and b.verified=true));
create table directory_private.contribution_events (
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create index contribution_events_user_time on directory_private.contribution_events(user_id,created_at);
alter table directory_private.contribution_events enable row level security;
revoke all on directory_private.contribution_events from public,anon,authenticated;
create function directory_private.limit_account_contributions() returns trigger
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 -- Preserve server ingestion/maintenance; browser roles never take this branch.
 if uid is null and coalesce(current_setting('role',true),'none') not in ('anon','authenticated') then return new; end if;
 if uid is null or new.user_id is distinct from uid or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then
   raise exception 'Confirmed account required' using errcode='42501'; end if;
 if length(coalesce(to_jsonb(new)->>'content',to_jsonb(new)->>'comment',''))>5000 then
   raise exception 'Contribution is too long' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,3));
 if (select count(*) from directory_private.contribution_events where user_id=uid and created_at>now()-interval '1 day')>=60 then
   raise exception 'Daily contribution limit reached' using errcode='P0001'; end if;
 insert into directory_private.contribution_events(user_id) values(uid);
 new.created_at:=now();
 return new;
end $$;
revoke all on function directory_private.limit_account_contributions() from public,anon,authenticated;
create trigger directory_post_budget before insert on public.community_posts for each row execute function directory_private.limit_account_contributions();
create trigger directory_reply_budget before insert on public.community_replies for each row execute function directory_private.limit_account_contributions();
create trigger directory_review_budget before insert on public.reviews for each row execute function directory_private.limit_account_contributions();
notify pgrst,'reload schema';
commit;
