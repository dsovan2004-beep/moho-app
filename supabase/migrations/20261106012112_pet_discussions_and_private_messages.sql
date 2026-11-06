begin;
alter table public.lost_and_found add column reporter_id uuid references auth.users(id) on delete set null;
create index pet_reporter_lookup on public.lost_and_found(reporter_id) where reporter_id is not null;
-- Public report fields are explicit; account identity and email are not public.
revoke select on public.lost_and_found from anon,authenticated;
grant select(id,type,pet_name,pet_type,description,city,location_last_seen,contact_name,contact_phone,status,image_url,created_at,breed,age,gender,last_seen,location_detail,coat_description,reward,title,source,source_url,last_ingested_at,confidence_score,needs_review,image_source,ingestion_status) on public.lost_and_found to anon,authenticated;

create table public.pet_comments (
 id uuid primary key default gen_random_uuid(), pet_id uuid not null references public.lost_and_found(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 display_name text not null check(length(display_name) between 2 and 40), body text not null check(length(body) between 1 and 2000),
 hidden boolean not null default false,created_at timestamptz not null default now()
);
create index pet_comments_parent_time on public.pet_comments(pet_id,created_at,id);
create index pet_comments_author on public.pet_comments(user_id);
alter table public.pet_comments enable row level security;
revoke all on public.pet_comments from public,anon,authenticated;
grant select(id,pet_id,display_name,body,created_at) on public.pet_comments to anon,authenticated;
create policy published_pet_comments on public.pet_comments for select to anon,authenticated using(not hidden and exists(select 1 from public.lost_and_found p where p.id=pet_id and p.needs_review is not true and coalesce(p.ingestion_status,'active')='active' and p.status in('active','lost','found','reunited')));

create table public.pet_conversations (
 id uuid primary key default gen_random_uuid(),pet_id uuid not null references public.lost_and_found(id) on delete cascade,
 member_a uuid not null references auth.users(id) on delete cascade,member_b uuid not null references auth.users(id) on delete cascade,
 label_a text not null,label_b text not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(member_a<member_b),unique(pet_id,member_a,member_b)
);
create index pet_chats_member_a on public.pet_conversations(member_a,updated_at desc);
create index pet_chats_member_b on public.pet_conversations(member_b,updated_at desc);
alter table public.pet_conversations enable row level security;
revoke all on public.pet_conversations from public,anon,authenticated;
grant select on public.pet_conversations to authenticated;
create policy chat_participants on public.pet_conversations for select to authenticated using((select auth.uid()) in(member_a,member_b));
create table public.pet_messages (
 id uuid primary key default gen_random_uuid(),conversation_id uuid not null references public.pet_conversations(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,body text not null check(length(body) between 1 and 3000),created_at timestamptz not null default now()
);
create index pet_messages_parent_time on public.pet_messages(conversation_id,created_at,id);
create index pet_messages_sender on public.pet_messages(sender_id);
alter table public.pet_messages enable row level security;
revoke all on public.pet_messages from public,anon,authenticated;
grant select on public.pet_messages to authenticated;
create policy message_participants on public.pet_messages for select to authenticated using(exists(select 1 from public.pet_conversations c where c.id=conversation_id and (select auth.uid()) in(c.member_a,c.member_b)));
create table public.pet_message_blocks (
 user_id uuid not null references auth.users(id) on delete cascade,blocked_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),primary key(user_id,blocked_id),check(user_id<>blocked_id)
);
alter table public.pet_message_blocks enable row level security;
revoke all on public.pet_message_blocks from public,anon,authenticated;
grant select on public.pet_message_blocks to authenticated;
create policy own_message_blocks on public.pet_message_blocks for select to authenticated using(user_id=(select auth.uid()));

create table directory_private.pet_social_events(user_id uuid not null references auth.users(id) on delete cascade,kind text not null,created_at timestamptz not null default now());
create index pet_social_budget_lookup on directory_private.pet_social_events(user_id,kind,created_at);
alter table directory_private.pet_social_events enable row level security;
create table directory_private.pet_abuse_reports (
 id uuid primary key default gen_random_uuid(),reported_by uuid references auth.users(id) on delete set null,
 kind text not null check(kind in('comment','message')),target_id uuid not null,pet_id uuid references public.lost_and_found(id) on delete set null,
 reason text not null,evidence text not null,status text not null default 'pending' check(status in('pending','hidden','reviewed')),created_at timestamptz not null default now()
);
create index pet_abuse_reports_queue on directory_private.pet_abuse_reports(status,created_at);
alter table directory_private.pet_abuse_reports enable row level security;
revoke all on directory_private.pet_social_events,directory_private.pet_abuse_reports from public,anon,authenticated;
grant all on public.pet_comments,public.pet_conversations,public.pet_messages,public.pet_message_blocks to service_role;

create function directory_private.pet_budget(uid uuid,k text,maximum integer) returns void language plpgsql set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(uid::text,14));
 if(select count(*) from directory_private.pet_social_events where user_id=uid and kind=k and created_at>now()-interval '1 day')>=maximum then raise exception 'Daily activity limit reached' using errcode='P0001'; end if;
 insert into directory_private.pet_social_events(user_id,kind) values(uid,k);
end $$;
revoke all on function directory_private.pet_budget(uuid,text,integer) from public,anon,authenticated;

create function directory_private.pet_social(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid();pid uuid;target uuid;cid uuid;other_id uuid;new_id uuid;name text:=trim(coalesce(p->>'display_name','Neighbor'));
 body text:=trim(coalesce(p->>'body',''));reason text:=trim(coalesce(p->>'reason',''));c public.pet_conversations%rowtype;comment public.pet_comments%rowtype;m public.pet_messages%rowtype;report directory_private.pet_abuse_reports%rowtype;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise exception 'Confirmed sign-in required' using errcode='42501'; end if;
 if p is null or jsonb_typeof(p)<>'object' or length(p::text)>12000 then raise exception 'Invalid request' using errcode='22023'; end if;
 if action in('comment','context','start_chat') then
  pid:=(p->>'pet_id')::uuid;
  if not exists(select 1 from public.lost_and_found where id=pid and needs_review is not true and coalesce(ingestion_status,'active')='active' and status in('active','lost','found','reunited')) then raise exception 'Report unavailable' using errcode='22023'; end if;
 end if;
 if action='context' then
  return jsonb_build_object('own_comment_ids',coalesce((select jsonb_agg(id) from public.pet_comments where pet_id=pid and user_id=uid and not hidden),'[]'::jsonb),'can_message_reporter',exists(select 1 from public.lost_and_found where id=pid and reporter_id is not null and reporter_id<>uid));
 elsif action='comment' then
  if length(name) not between 2 and 40 or length(body) not between 1 and 2000 then raise exception 'Check name and comment length' using errcode='22023'; end if;
  perform directory_private.pet_budget(uid,'comment',20);
  insert into public.pet_comments(pet_id,user_id,display_name,body) values(pid,uid,name,body) returning id into new_id;
  return jsonb_build_object('id',new_id);
 elsif action='hide_own_comment' then
  update public.pet_comments set hidden=true where id=(p->>'id')::uuid and user_id=uid returning id into new_id;
  if new_id is null then raise exception 'Comment unavailable' using errcode='42501'; end if;
  return jsonb_build_object('id',new_id);
 elsif action='start_chat' then
  if length(name) not between 2 and 40 or length(body) not between 1 and 3000 then raise exception 'Enter a name and message' using errcode='22023'; end if;
  if nullif(p->>'comment_id','') is not null then
   select * into comment from public.pet_comments where id=(p->>'comment_id')::uuid and pet_id=pid and not hidden;
   other_id:=comment.user_id;
  else
   select reporter_id into other_id from public.lost_and_found where id=pid;
  end if;
  if other_id is null or other_id=uid then raise exception 'Recipient unavailable; use the original report contact for imported reports' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(least(uid,other_id)::text||greatest(uid,other_id)::text,15));
  if exists(select 1 from public.pet_message_blocks where (user_id=uid and blocked_id=other_id) or (user_id=other_id and blocked_id=uid)) then raise exception 'Messaging unavailable for this conversation' using errcode='42501'; end if;
  select * into c from public.pet_conversations where pet_id=pid and member_a=least(uid,other_id) and member_b=greatest(uid,other_id);
  if c.id is null then
   perform directory_private.pet_budget(uid,'conversation',5);
   insert into public.pet_conversations(pet_id,member_a,member_b,label_a,label_b)
   values(pid,least(uid,other_id),greatest(uid,other_id),case when uid<other_id then name else coalesce(comment.display_name,'Reporter') end,case when uid<other_id then coalesce(comment.display_name,'Reporter') else name end) returning * into c;
  end if;
  perform directory_private.pet_budget(uid,'message',60);
  insert into public.pet_messages(conversation_id,sender_id,body) values(c.id,uid,body);
  update public.pet_conversations set updated_at=now() where id=c.id;
  return jsonb_build_object('conversation_id',c.id);
 elsif action in('message','block') then
  select * into c from public.pet_conversations where id=(p->>'conversation_id')::uuid and uid in(member_a,member_b);
  if c.id is null then raise exception 'Conversation unavailable' using errcode='42501'; end if;
  other_id:=case when uid=c.member_a then c.member_b else c.member_a end;
  perform pg_advisory_xact_lock(hashtextextended(least(uid,other_id)::text||greatest(uid,other_id)::text,15));
  if action='block' then
   if coalesce((p->>'blocked')::boolean,true) then insert into public.pet_message_blocks(user_id,blocked_id) values(uid,other_id) on conflict do nothing;
   else delete from public.pet_message_blocks where user_id=uid and blocked_id=other_id; end if;
   return jsonb_build_object('saved',true);
  end if;
  if exists(select 1 from public.pet_message_blocks where (user_id=uid and blocked_id=other_id) or (user_id=other_id and blocked_id=uid)) then raise exception 'Messaging unavailable for this conversation' using errcode='42501'; end if;
  if length(body) not between 1 and 3000 then raise exception 'Message must be 1–3000 characters' using errcode='22023'; end if;
  perform directory_private.pet_budget(uid,'message',60);
  insert into public.pet_messages(conversation_id,sender_id,body) values(c.id,uid,body) returning id into new_id;
  update public.pet_conversations set updated_at=now() where id=c.id;
  return jsonb_build_object('id',new_id);
 elsif action in('report_comment','report_message') then
  if length(reason) not between 5 and 1000 then raise exception 'Explain the report (5–1000 characters)' using errcode='22023'; end if;
  target:=(p->>'id')::uuid;
  if action='report_comment' then
   select * into comment from public.pet_comments where id=target and not hidden;
   if comment.id is null or not exists(select 1 from public.lost_and_found where id=comment.pet_id and needs_review is not true and coalesce(ingestion_status,'active')='active' and status in('active','lost','found','reunited')) then raise exception 'Comment unavailable' using errcode='42501'; end if;
   pid:=comment.pet_id;body:=comment.body;
  else
   select * into m from public.pet_messages where id=target;
   select * into c from public.pet_conversations where id=m.conversation_id and uid in(member_a,member_b);
   if c.id is null then raise exception 'Message unavailable' using errcode='42501'; end if;
   pid:=c.pet_id;body:=m.body;
  end if;
  perform directory_private.pet_budget(uid,'report',10);
  insert into directory_private.pet_abuse_reports(reported_by,kind,target_id,pet_id,reason,evidence)
  values(uid,case when action='report_comment' then 'comment' else 'message' end,target,pid,reason,body) returning id into new_id;
  return jsonb_build_object('id',new_id);
 elsif action='moderation_queue' then
  if not directory_private.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  return coalesce((select jsonb_agg(to_jsonb(q)) from(select r.id,r.kind,r.target_id,r.pet_id,r.reason,r.evidence,r.status,r.created_at from directory_private.pet_abuse_reports r where r.status='pending' order by r.created_at limit 100)q),'[]'::jsonb);
 elsif action='review_report' then
  if not directory_private.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  select * into report from directory_private.pet_abuse_reports where id=(p->>'id')::uuid and status='pending' for update;
  if report.id is null then raise exception 'Report unavailable' using errcode='22023'; end if;
  if p->>'decision'='hide' and report.kind='comment' then
   update public.pet_comments set hidden=true where id=report.target_id;
   update directory_private.pet_abuse_reports set status='hidden' where id=report.id;
  elsif p->>'decision'='reviewed' then update directory_private.pet_abuse_reports set status='reviewed' where id=report.id;
  else raise exception 'Invalid review decision' using errcode='22023'; end if;
  return jsonb_build_object('saved',true);
 end if;
 raise exception 'Unknown action' using errcode='22023';
end $$;
revoke all on function directory_private.pet_social(text,jsonb) from public,anon;
grant execute on function directory_private.pet_social(text,jsonb) to authenticated;
create function public.pet_social_action(action text,payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select directory_private.pet_social(action,payload)$$;
revoke all on function public.pet_social_action(text,jsonb) from public,anon;
grant execute on function public.pet_social_action(text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
