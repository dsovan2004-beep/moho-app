begin;
alter table public.lost_and_found add column expires_at timestamptz;
update public.lost_and_found set expires_at=coalesce(status_confirmed_at,created_at,now())+interval '30 days';
alter table public.lost_and_found alter column expires_at set default (now()+interval '30 days'),alter column expires_at set not null;
grant select(expires_at) on public.lost_and_found to anon,authenticated;
create index pet_expiry_due on public.lost_and_found(expires_at) where status in('active','lost','found','reunited');
alter policy public_pet_reports on public.lost_and_found using(needs_review is not true and coalesce(ingestion_status,'active')='active' and status in('active','lost','found','reunited') and expires_at>now());
alter policy published_pet_comments on public.pet_comments using(not hidden and exists(select 1 from public.lost_and_found p where p.id=pet_comments.pet_id and p.needs_review is not true and coalesce(p.ingestion_status,'active')='active' and p.status in('active','lost','found','reunited') and p.expires_at>now()));
create or replace function directory_private.pet_social(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid();pid uuid;target uuid;cid uuid;other_id uuid;new_id uuid;name text:=trim(coalesce(p->>'display_name','Neighbor'));
 body text:=trim(coalesce(p->>'body',''));reason text:=trim(coalesce(p->>'reason',''));c public.pet_conversations%rowtype;comment public.pet_comments%rowtype;m public.pet_messages%rowtype;report directory_private.pet_abuse_reports%rowtype;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise exception 'Confirmed sign-in required' using errcode='42501'; end if;
 if p is null or jsonb_typeof(p)<>'object' or length(p::text)>12000 then raise exception 'Invalid request' using errcode='22023'; end if;
 if action in('comment','context','start_chat') then
  pid:=(p->>'pet_id')::uuid;
  if not exists(select 1 from public.lost_and_found where id=pid and needs_review is not true and coalesce(ingestion_status,'active')='active' and status in('active','lost','found','reunited') and expires_at>now()) then raise exception 'Report unavailable' using errcode='22023'; end if;
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
   if comment.id is null or not exists(select 1 from public.lost_and_found where id=comment.pet_id and needs_review is not true and coalesce(ingestion_status,'active')='active' and status in('active','lost','found','reunited') and expires_at>now()) then raise exception 'Comment unavailable' using errcode='42501'; end if;
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
create or replace function directory_private.pet_activity(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); cid uuid; message_record public.pet_messages%rowtype; pet public.lost_and_found%rowtype; next_status text; result jsonb;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise exception 'Confirmed sign-in required' using errcode='42501'; end if;
 if p is null or jsonb_typeof(p)<>'object' or length(p::text)>2000 then raise exception 'Invalid request' using errcode='22023'; end if;
 if action='alerts' then
  with chats as (select c.id,c.pet_id,case when c.member_a=uid then c.label_b else c.label_a end label,
    case when c.member_a=uid then c.member_b else c.member_a end other_id from public.pet_conversations c where uid in(c.member_a,c.member_b)),
  unread as (select c.id,c.pet_id,c.label,count(*) n,max(m.created_at) latest_at,max(m.delivery_seq) latest_seq from chats c
    join public.pet_messages m on m.conversation_id=c.id and m.sender_id<>uid
    left join public.pet_read_receipts r on r.conversation_id=c.id and r.user_id=uid
    where m.delivery_seq>coalesce(r.read_seq,0)
    and not exists(select 1 from public.pet_message_blocks b where (b.user_id=uid and b.blocked_id=c.other_id) or (b.user_id=c.other_id and b.blocked_id=uid))
    group by c.id,c.pet_id,c.label)
  select jsonb_build_object('total',coalesce((select sum(n) from unread),0),'conversations',coalesce((select jsonb_agg(to_jsonb(q)) from(select id,pet_id,label,n,latest_at,latest_seq from unread order by latest_seq desc limit 50) q),'[]'::jsonb)) into result;
  return result;
 elsif action='mark_read' then
  cid:=(p->>'conversation_id')::uuid;
  if not exists(select 1 from public.pet_conversations where id=cid and uid in(member_a,member_b)) then raise exception 'Conversation unavailable' using errcode='42501'; end if;
  select * into message_record from public.pet_messages where id=(p->>'last_message_id')::uuid and conversation_id=cid;
  if message_record.id is null then raise exception 'Message unavailable' using errcode='22023'; end if;
  insert into public.pet_read_receipts(user_id,conversation_id,read_seq) values(uid,cid,message_record.delivery_seq)
   on conflict(user_id,conversation_id) do update set read_seq=excluded.read_seq
   where pet_read_receipts.read_seq<excluded.read_seq;
  return jsonb_build_object('saved',true);
 elsif action='my_reports' then
  return coalesce((select jsonb_agg(to_jsonb(q)) from(select id,title,pet_name,city,status,status_revision,status_confirmed_at,created_at,expires_at,(expires_at<=now()) expired,
    (needs_review is true or coalesce(ingestion_status,'active')<>'active') under_review
    from public.lost_and_found where reporter_id=uid order by created_at desc limit 100)q),'[]'::jsonb);
 elsif action='report_status' then
  select * into pet from public.lost_and_found where id=(p->>'pet_id')::uuid and reporter_id=uid for update;
  if pet.id is null then raise exception 'Your linked report is required' using errcode='42501'; end if;
  if pet.needs_review is true or coalesce(pet.ingestion_status,'active')<>'active' then raise exception 'This report is under review; status cannot be changed' using errcode='42501'; end if;
  next_status:=p->>'status';
  if next_status is null or next_status not in('lost','found','reunited','archived') then raise exception 'Choose a valid pet status' using errcode='22023'; end if;
  if (p->>'revision')::integer is distinct from pet.status_revision then raise exception 'Report changed; refresh before updating' using errcode='22023'; end if;
  perform directory_private.pet_budget(uid,'status',20);
  insert into directory_private.pet_status_history(pet_id,actor_id,previous_status,new_status,revision) values(pet.id,uid,pet.status,next_status,pet.status_revision+1);
  update public.lost_and_found set status=next_status,status_revision=status_revision+1,status_confirmed_at=now(),expires_at=case when next_status='archived' then now() else now()+interval '30 days' end where id=pet.id;
  return jsonb_build_object('status',next_status,'revision',pet.status_revision+1);
 end if;
 raise exception 'Unknown activity action' using errcode='22023';
end $$;
-- All notification configuration, addresses, device keys and delivery records stay private.
create table directory_private.notification_config(singleton boolean primary key default true check(singleton),email_ready boolean not null default false,push_ready boolean not null default false);
insert into directory_private.notification_config default values;
create table directory_private.notification_preferences(user_id uuid primary key references auth.users on delete cascade,email_enabled boolean not null default false,email_seq bigint not null default 0,last_email_at timestamptz,unsubscribe_token uuid not null unique default gen_random_uuid());
create table directory_private.push_subscriptions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,endpoint text not null unique,p256dh text not null,auth_key text not null,label text not null,active boolean not null default true,notified_seq bigint not null default 0,last_push_at timestamptz,created_at timestamptz not null default now());
create index notification_device_owner on directory_private.push_subscriptions(user_id);
create table directory_private.notification_jobs(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,channel text not null check(channel in('email','push')),target text not null,subscription_id uuid references directory_private.push_subscriptions on delete set null,ceiling_seq bigint not null,recipient_email text,status text not null default 'pending' check(status in('pending','leased','sent','cancelled','failed')),lease_id uuid,lease_until timestamptz,available_at timestamptz not null default now(),attempts integer not null default 0,created_at timestamptz not null default now(),finished_at timestamptz,error_code text,unique(user_id,channel,target,ceiling_seq));
create index notification_jobs_due on directory_private.notification_jobs(status,available_at);
create index notification_jobs_owner on directory_private.notification_jobs(user_id,created_at);
create index notification_jobs_device on directory_private.notification_jobs(subscription_id);
alter table directory_private.notification_config enable row level security;
alter table directory_private.notification_preferences enable row level security;
alter table directory_private.push_subscriptions enable row level security;
alter table directory_private.notification_jobs enable row level security;
revoke all on directory_private.notification_config,directory_private.notification_preferences,directory_private.push_subscriptions,directory_private.notification_jobs from public,anon,authenticated;

create function directory_private.notification_settings(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();s jsonb;ep text;device directory_private.push_subscriptions%rowtype;baseline bigint;enabled boolean;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise exception 'Confirmed sign-in required' using errcode='42501';end if;
 if p is null or jsonb_typeof(p)<>'object' or length(p::text)>4000 then raise exception 'Invalid request' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,14));
 select coalesce(max(delivery_seq),0) into baseline from public.pet_messages;
 insert into directory_private.notification_preferences(user_id,email_seq) values(uid,baseline) on conflict do nothing;
 if action='email' then
  enabled:=(p->>'enabled')::boolean;
  if enabled is null then raise exception 'Choose a preference' using errcode='22023';end if;
  if enabled and not(select email_ready from directory_private.notification_config) then raise exception 'Email delivery is still being configured' using errcode='22023';end if;
  if enabled then perform directory_private.pet_budget(uid,'notification',20);end if;
  update directory_private.notification_preferences set email_seq=case when enabled and not email_enabled then baseline else email_seq end,email_enabled=enabled where user_id=uid;
  if not enabled then update directory_private.notification_jobs set status='cancelled',finished_at=now() where user_id=uid and channel='email' and status in('pending','leased');end if;
 elsif action='subscribe' then
  if not(select push_ready from directory_private.notification_config) then raise exception 'Push delivery is still being configured' using errcode='22023';end if;
  s:=p->'subscription';ep:=s->>'endpoint';
  if ep is null or length(ep)>1800 or ep !~ '^https://(fcm[.]googleapis[.]com|updates[.]push[.]services[.]mozilla[.]com|web[.]push[.]apple[.]com|[a-zA-Z0-9-]+[.]notify[.]windows[.]com)/[^#[:space:]]+$'
   or coalesce(s->'keys'->>'p256dh','') !~ '^[A-Za-z0-9_-]{87}$' or coalesce(s->'keys'->>'auth','') !~ '^[A-Za-z0-9_-]{22}$' then raise exception 'Unsupported push subscription' using errcode='22023';end if;
  -- Serialize the same endpoint across accounts; a subscription cannot be transferred.
  perform pg_advisory_xact_lock(hashtextextended(ep,23));
  select * into device from directory_private.push_subscriptions where endpoint=ep;
  if device.id is not null and device.user_id<>uid then raise exception 'Remove this device from its previous account first' using errcode='42501';end if;
  if (device.id is null or not device.active) and (select count(*) from directory_private.push_subscriptions where user_id=uid and active)>=5 then raise exception 'Remove a device before adding another' using errcode='22023';end if;
  perform directory_private.pet_budget(uid,'notification',20);
  insert into directory_private.push_subscriptions(user_id,endpoint,p256dh,auth_key,label,notified_seq) values(uid,ep,s->'keys'->>'p256dh',s->'keys'->>'auth',left(coalesce(nullif(trim(p->>'label'),''),'My device'),40),baseline)
   on conflict(endpoint) do update set active=true,p256dh=excluded.p256dh,auth_key=excluded.auth_key,label=excluded.label,notified_seq=case when push_subscriptions.active then push_subscriptions.notified_seq else excluded.notified_seq end;
 elsif action='unsubscribe' then
  update directory_private.push_subscriptions set active=false where user_id=uid and (id::text=p->>'id' or endpoint=p->>'endpoint');
  update directory_private.notification_jobs j set status='cancelled',finished_at=now() where j.user_id=uid and j.channel='push' and j.status in('pending','leased') and exists(select 1 from directory_private.push_subscriptions d where d.id=j.subscription_id and not d.active);
 elsif action<>'settings' then raise exception 'Unknown preference action' using errcode='22023';end if;
 return jsonb_build_object('email_enabled',(select email_enabled from directory_private.notification_preferences where user_id=uid),'email_ready',(select email_ready from directory_private.notification_config),'push_ready',(select push_ready from directory_private.notification_config),'devices',coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',label,'created_at',created_at)) from directory_private.push_subscriptions where user_id=uid and active),'[]'::jsonb));
end $$;
revoke all on function directory_private.notification_settings(text,jsonb) from public,anon;
grant execute on function directory_private.notification_settings(text,jsonb) to authenticated;
create function public.notification_settings_action(action text,payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select directory_private.notification_settings(action,payload)$$;
revoke all on function public.notification_settings_action(text,jsonb) from public,anon;
grant execute on function public.notification_settings_action(text,jsonb) to authenticated;

create function directory_private.unsubscribe_email(token uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare uid uuid;
begin
 update directory_private.notification_preferences set email_enabled=false where unsubscribe_token=token returning user_id into uid;
 update directory_private.notification_jobs set status='cancelled',finished_at=now() where user_id=uid and channel='email' and status in('pending','leased');
 return true;
end $$;
revoke all on function directory_private.unsubscribe_email(uuid) from public;
grant usage on schema directory_private to anon;
grant execute on function directory_private.unsubscribe_email(uuid) to anon,authenticated;
create function public.unsubscribe_notification_email(token uuid) returns boolean language sql security invoker set search_path='' as $$select directory_private.unsubscribe_email(token)$$;
revoke all on function public.unsubscribe_notification_email(uuid) from public;
grant execute on function public.unsubscribe_notification_email(uuid) to anon,authenticated;

-- This helper is only reachable by the service dispatcher, never the browser.
create function directory_private.notification_unread(uid uuid,after_seq bigint,through_seq bigint default 9223372036854775807) returns bigint language sql stable set search_path='' as $$
 select max(m.delivery_seq) from public.pet_conversations c join public.pet_messages m on m.conversation_id=c.id
 left join public.pet_read_receipts r on r.conversation_id=c.id and r.user_id=uid
 where uid in(c.member_a,c.member_b) and m.sender_id<>uid and m.delivery_seq>greatest(after_seq,coalesce(r.read_seq,0)) and m.delivery_seq<=through_seq
 and not exists(select 1 from public.pet_message_blocks b where (b.user_id=uid and b.blocked_id=m.sender_id) or(b.user_id=m.sender_id and b.blocked_id=uid))
$$;
revoke all on function directory_private.notification_unread(uuid,bigint,bigint) from public,anon,authenticated;
create function directory_private.notification_dispatch(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare job directory_private.notification_jobs%rowtype;pref directory_private.notification_preferences%rowtype;device directory_private.push_subscriptions%rowtype;pet public.lost_and_found%rowtype;ceiling bigint;uid uuid;mail text;lease uuid;decision text;
begin
 if action='prepare' then
  perform pg_advisory_xact_lock(195271,19);
  update directory_private.notification_config set email_ready=coalesce((p->>'email_ready')::boolean,false),push_ready=coalesce((p->>'push_ready')::boolean,false);
  for pet in select * from public.lost_and_found where expires_at<=now() and status in('active','lost','found','reunited') and needs_review is not true and coalesce(ingestion_status,'active')='active' order by expires_at limit 500 for update skip locked loop
   insert into directory_private.pet_status_history(pet_id,actor_id,previous_status,new_status,revision) values(pet.id,null,pet.status,'expired',pet.status_revision+1);
   update public.lost_and_found set status='expired',status_revision=status_revision+1 where id=pet.id;
  end loop;
  update directory_private.notification_jobs set status='failed',finished_at=now(),error_code='delivery_window_elapsed' where status in('pending','leased') and created_at<now()-interval '20 hours';
  insert into directory_private.notification_jobs(user_id,channel,target,ceiling_seq,recipient_email)
   select n.user_id,'email','email',q.seq,u.email from directory_private.notification_preferences n join auth.users u on u.id=n.user_id
   cross join lateral(select directory_private.notification_unread(n.user_id,n.email_seq) seq)q
   where (select email_ready from directory_private.notification_config) and n.email_enabled and u.email_confirmed_at is not null and u.email is not null and q.seq is not null
   and coalesce(n.last_email_at,'epoch')<now()-interval '30 minutes'
   and not exists(select 1 from directory_private.notification_jobs j where j.user_id=n.user_id and j.channel='email' and (j.status in('pending','leased') or j.ceiling_seq=q.seq))
   and (select count(*) from directory_private.notification_jobs j where j.user_id=n.user_id and j.channel='email' and j.created_at>now()-interval '1 day')<4
   order by n.last_email_at nulls first limit 20 on conflict do nothing;
  insert into directory_private.notification_jobs(user_id,channel,target,subscription_id,ceiling_seq)
   select d.user_id,'push',d.id::text,d.id,q.seq from directory_private.push_subscriptions d join auth.users u on u.id=d.user_id
   cross join lateral(select directory_private.notification_unread(d.user_id,d.notified_seq) seq)q
   where (select push_ready from directory_private.notification_config) and d.active and u.email_confirmed_at is not null and q.seq is not null
   and coalesce(d.last_push_at,'epoch')<now()-interval '15 minutes'
   and not exists(select 1 from directory_private.notification_jobs j where j.subscription_id=d.id and (j.status in('pending','leased') or j.ceiling_seq=q.seq))
   and (select count(*) from directory_private.notification_jobs j where j.subscription_id=d.id and j.created_at>now()-interval '1 day')<20
   order by d.last_push_at nulls first limit 20 on conflict do nothing;
  return jsonb_build_object('prepared',true);
 elsif action='claim' then
  for job in select * from directory_private.notification_jobs where created_at>now()-interval '20 hours' and attempts<5 and ((status='pending' and available_at<=now()) or(status='leased' and lease_until<now())) order by available_at limit 20 for update skip locked loop
   select * into pref from directory_private.notification_preferences where user_id=job.user_id;
   select * into device from directory_private.push_subscriptions where id=job.subscription_id;
   select email into mail from auth.users where id=job.user_id and email_confirmed_at is not null;
   if mail is null or (job.channel='email' and (pref.email_enabled is not true or mail is distinct from job.recipient_email or not(select email_ready from directory_private.notification_config)))
    or(job.channel='push' and (device.active is not true or not(select push_ready from directory_private.notification_config)))
    or directory_private.notification_unread(job.user_id,case when job.channel='email' then pref.email_seq else device.notified_seq end,job.ceiling_seq) is null then
    update directory_private.notification_jobs set status='cancelled',finished_at=now() where id=job.id;continue;
   end if;
   lease:=gen_random_uuid();
   update directory_private.notification_jobs set status='leased',lease_id=lease,lease_until=now()+interval '5 minutes',attempts=attempts+1 where id=job.id;
   return jsonb_build_object('id',job.id,'lease_id',lease,'channel',job.channel,'recipient_email',job.recipient_email,'unsubscribe_token',pref.unsubscribe_token,'subscription',case when job.channel='push' then jsonb_build_object('endpoint',device.endpoint,'expirationTime',null,'keys',jsonb_build_object('p256dh',device.p256dh,'auth',device.auth_key)) else null end);
  end loop;
  return null;
 elsif action='finish' then
  select * into job from directory_private.notification_jobs where id=(p->>'id')::uuid and lease_id=(p->>'lease_id')::uuid and status='leased' for update;
  if job.id is null then return jsonb_build_object('saved',false);end if;
  decision:=p->>'decision';
  if decision not in('sent','retry','failed','retire') or decision is null then raise exception 'Invalid result';end if;
  update directory_private.notification_jobs set status=case when decision='sent' then 'sent' when decision='retry' and attempts<5 then 'pending' else 'failed' end,
   available_at=now()+make_interval(secs=>least(3600,greatest(60,coalesce((p->>'retry_after')::integer,60*(2^attempts)::integer)))),lease_until=null,
   finished_at=case when decision='retry' and attempts<5 then null else now() end,error_code=left(p->>'code',80) where id=job.id;
  if decision='sent' then
   if job.channel='email' then update directory_private.notification_preferences set email_seq=greatest(email_seq,job.ceiling_seq),last_email_at=now() where user_id=job.user_id;
   else update directory_private.push_subscriptions set notified_seq=greatest(notified_seq,job.ceiling_seq),last_push_at=now() where id=job.subscription_id;end if;
  elsif decision='retire' and job.channel='push' then
   update directory_private.push_subscriptions set active=false where id=job.subscription_id;
   update directory_private.notification_jobs set status='cancelled',finished_at=now() where subscription_id=job.subscription_id and status in('pending','leased');
  end if;
  return jsonb_build_object('saved',true);
 end if;
 raise exception 'Unknown dispatcher action';
end $$;
revoke all on function directory_private.notification_dispatch(text,jsonb) from public,anon,authenticated;
grant usage on schema directory_private to service_role;
grant execute on function directory_private.notification_dispatch(text,jsonb) to service_role;
create function public.notification_dispatch(action text,payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select directory_private.notification_dispatch(action,payload)$$;
revoke all on function public.notification_dispatch(text,jsonb) from public,anon,authenticated;
grant execute on function public.notification_dispatch(text,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
