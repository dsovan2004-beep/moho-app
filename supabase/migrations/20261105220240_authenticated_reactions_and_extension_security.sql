begin;

-- Publish only moderated community content. Requesters cannot self-publish.
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='community_posts' and cmd in ('SELECT','INSERT')
  loop execute format('drop policy %I on public.community_posts',p.policyname); end loop;
end $$;
create policy community_public_read on public.community_posts for select to anon
using (status in ('approved','active'));
create policy community_authenticated_read on public.community_posts for select to authenticated
using (status in ('approved','active') or user_id=(select auth.uid()) or directory_private.is_admin());
create policy community_pending_insert on public.community_posts for insert to authenticated
with check (user_id=(select auth.uid()) and status='pending');

-- Direct anonymous/authenticated writes and identifier reads are retired.
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='post_reactions'
  loop execute format('drop policy %I on public.post_reactions',p.policyname); end loop;
end $$;
revoke all on public.post_reactions from public,anon,authenticated;
grant select(post_id,reaction_type) on public.post_reactions to anon,authenticated;
create policy reactions_public_counts on public.post_reactions for select to anon,authenticated
using (exists(select 1 from public.community_posts p where p.id=post_id and p.status in ('active','approved')));
-- The invoker view needs only the two non-identifying, granted columns.
create view public.reaction_counts with (security_invoker=true) as
select post_id,reaction_type,count(*)::integer as count from public.post_reactions group by post_id,reaction_type;
revoke all on public.reaction_counts from public,anon,authenticated;
grant select on public.reaction_counts to anon,authenticated;
do $$ begin
  if to_regprocedure('public.toggle_reaction(uuid,text,text,uuid)') is not null then
    revoke execute on function public.toggle_reaction(uuid,text,text,uuid) from public,anon,authenticated;
  end if;
end $$;

create table directory_private.reaction_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index reaction_events_user_time on directory_private.reaction_events(user_id,created_at);
alter table directory_private.reaction_events enable row level security;
revoke all on directory_private.reaction_events from public,anon,authenticated;

create function directory_private.reaction_state(p_post_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); counts jsonb; mine jsonb;
begin
  if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then
    raise exception 'Confirmed sign-in required' using errcode='42501'; end if;
  if not exists(select 1 from public.community_posts where id=p_post_id and status in ('approved','active')) then
    raise exception 'Published post not found' using errcode='22023'; end if;
  select coalesce(jsonb_object_agg(reaction_type,n),'{}'::jsonb) into counts
    from (select reaction_type,count(*)::integer n from public.post_reactions where post_id=p_post_id group by reaction_type) c;
  select coalesce(jsonb_agg(reaction_type),'[]'::jsonb) into mine
    from public.post_reactions where post_id=p_post_id and user_id=uid;
  return jsonb_build_object('counts',counts,'myReactions',mine);
end $$;
revoke all on function directory_private.reaction_state(uuid) from public,anon,authenticated;
grant execute on function directory_private.reaction_state(uuid) to authenticated;

create function directory_private.toggle_account_reaction(p_post_id uuid,p_type text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result jsonb;
begin
  if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then
    raise exception 'Confirmed sign-in required' using errcode='42501'; end if;
  if p_type is null or p_type not in ('helpful','love','funny','thanks','following') then
    raise exception 'Invalid reaction' using errcode='22023'; end if;
  if not exists(select 1 from public.community_posts where id=p_post_id and status in ('approved','active')) then
    raise exception 'Published post not found' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,2));
  if (select count(*) from directory_private.reaction_events where user_id=uid and created_at>now()-interval '1 hour')>=60 then
    raise exception 'Reaction rate limit reached' using errcode='P0001'; end if;
  insert into directory_private.reaction_events(user_id) values(uid);
  if exists(select 1 from public.post_reactions where post_id=p_post_id and reaction_type=p_type and user_id=uid) then
    delete from public.post_reactions where post_id=p_post_id and reaction_type=p_type and user_id=uid;
    result:=jsonb_build_object('action','removed');
  else
    insert into public.post_reactions(post_id,reaction_type,user_id,ip_hash)
    values(p_post_id,p_type,uid,'account:'||uid::text);
    result:=jsonb_build_object('action','added');
  end if;
  return result || directory_private.reaction_state(p_post_id);
end $$;
revoke all on function directory_private.toggle_account_reaction(uuid,text) from public,anon,authenticated;
grant execute on function directory_private.toggle_account_reaction(uuid,text) to authenticated;
create function public.my_reaction_state(p_post_id uuid) returns jsonb
language sql security invoker set search_path='' as $$ select directory_private.reaction_state(p_post_id); $$;
create function public.toggle_account_reaction(p_post_id uuid,p_type text) returns jsonb
language sql security invoker set search_path='' as $$ select directory_private.toggle_account_reaction(p_post_id,p_type); $$;
revoke all on function public.my_reaction_state(uuid),public.toggle_account_reaction(uuid,text) from public,anon;
grant execute on function public.my_reaction_state(uuid),public.toggle_account_reaction(uuid,text) to authenticated;

-- pg_trgm is relocatable; indexes retain their operator-class OIDs.
create schema if not exists extensions;
revoke create on schema extensions from public,anon,authenticated;
grant usage on schema extensions to anon,authenticated,service_role;
do $$ begin
  if exists(select 1 from pg_extension where extname='pg_trgm' and extnamespace='public'::regnamespace and extrelocatable) then
    alter extension pg_trgm set schema extensions;
  end if;
end $$;
notify pgrst,'reload schema';
commit;
