begin;
alter table directory_private.notification_jobs add column kind text not null default 'message' check(kind in('message','push_test')),add column receipt_token uuid not null default gen_random_uuid() unique,add column received_at timestamptz,add column displayed_at timestamptz,add column opened_at timestamptz;
create or replace function directory_private.notification_settings(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();s jsonb;ep text;device directory_private.push_subscriptions%rowtype;baseline bigint;enabled boolean;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise exception 'Confirmed sign-in required' using errcode='42501';end if;
 if p is null or jsonb_typeof(p)<>'object' or length(p::text)>4000 then raise exception 'Invalid request' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,14));
 select coalesce(max(delivery_seq),0) into baseline from public.pet_messages;
 insert into directory_private.notification_preferences(user_id,email_seq) values(uid,baseline) on conflict do nothing;
 if action='test_push' then
  if not(select push_ready from directory_private.notification_config) then raise exception 'Push delivery is still being configured' using errcode='22023';end if;
  select * into device from directory_private.push_subscriptions where id=(p->>'id')::uuid and user_id=uid and active;
  if device.id is null then raise exception 'Your registered device is required' using errcode='42501';end if;
  if exists(select 1 from directory_private.notification_jobs where user_id=uid and kind='push_test' and created_at>now()-interval '15 minutes') then raise exception 'Wait 15 minutes before another push test' using errcode='P0001';end if;
  perform directory_private.pet_budget(uid,'push_test',3);
  insert into directory_private.notification_jobs(user_id,channel,target,subscription_id,ceiling_seq,kind) values(uid,'push','test:'||gen_random_uuid()::text,device.id,baseline,'push_test');
 elsif action='email' then
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
 return jsonb_build_object('email_enabled',(select email_enabled from directory_private.notification_preferences where user_id=uid),'email_ready',(select email_ready from directory_private.notification_config),'push_ready',(select push_ready from directory_private.notification_config),'tests',coalesce((select jsonb_agg(to_jsonb(t)) from(select id,subscription_id,status,created_at,received_at,displayed_at,opened_at,error_code from directory_private.notification_jobs where user_id=uid and kind='push_test' order by created_at desc limit 5)t),'[]'::jsonb),'devices',coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',label,'created_at',created_at)) from directory_private.push_subscriptions where user_id=uid and active),'[]'::jsonb));
end $$;
create or replace function directory_private.notification_dispatch(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
    or (job.kind='message' and directory_private.notification_unread(job.user_id,case when job.channel='email' then pref.email_seq else device.notified_seq end,job.ceiling_seq) is null) then
    update directory_private.notification_jobs set status='cancelled',finished_at=now() where id=job.id;continue;
   end if;
   lease:=gen_random_uuid();
   update directory_private.notification_jobs set status='leased',lease_id=lease,lease_until=now()+interval '5 minutes',attempts=attempts+1 where id=job.id;
   return jsonb_build_object('id',job.id,'lease_id',lease,'kind',job.kind,'receipt_token',case when job.kind='push_test' then job.receipt_token else null end,'channel',job.channel,'recipient_email',job.recipient_email,'unsubscribe_token',pref.unsubscribe_token,'subscription',case when job.channel='push' then jsonb_build_object('endpoint',device.endpoint,'expirationTime',null,'keys',jsonb_build_object('p256dh',device.p256dh,'auth',device.auth_key)) else null end);
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
  if decision='sent' and job.kind='message' then
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

create function directory_private.push_receipt(token uuid,stage text) returns boolean language plpgsql security definer set search_path='' as $$
begin
 if stage not in('received','displayed','opened') or stage is null then raise exception 'Invalid receipt' using errcode='22023';end if;
 update directory_private.notification_jobs set received_at=coalesce(received_at,now()),displayed_at=case when stage in('displayed','opened') then coalesce(displayed_at,now()) else displayed_at end,opened_at=case when stage='opened' then coalesce(opened_at,now()) else opened_at end
 where receipt_token=token and kind='push_test' and channel='push' and created_at>now()-interval '1 day';
 return true;
end $$;
revoke all on function directory_private.push_receipt(uuid,text) from public;
grant execute on function directory_private.push_receipt(uuid,text) to anon,authenticated;
create function public.confirm_push_test(token uuid,stage text) returns boolean language sql security invoker set search_path='' as $$select directory_private.push_receipt(token,stage)$$;
revoke all on function public.confirm_push_test(uuid,text) from public;
grant execute on function public.confirm_push_test(uuid,text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
