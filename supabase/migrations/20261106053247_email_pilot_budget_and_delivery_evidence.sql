begin;
-- Cap actual leased email attempts, including retries, below the included allowance.
-- 31 days bounds sends across any monthly billing period; account-wide usage must still be monitored.
create table directory_private.email_delivery_attempts(id bigint generated always as identity primary key,job_id uuid not null references directory_private.notification_jobs(id),created_at timestamptz not null default now());
alter table directory_private.email_delivery_attempts enable row level security;
revoke all on directory_private.email_delivery_attempts from public,anon,authenticated,service_role;
create index email_delivery_attempts_created on directory_private.email_delivery_attempts(created_at);
alter table directory_private.notification_jobs add column provider_id text;
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
   if job.channel='email' then
    perform pg_advisory_xact_lock(195271,20);
    if (select count(*) from directory_private.email_delivery_attempts where created_at>now()-interval '31 days')>=500 then
     update directory_private.notification_jobs set available_at=now()+interval '1 hour',error_code='pilot_email_budget_exhausted' where id=job.id;continue;
    end if;
    insert into directory_private.email_delivery_attempts(job_id) values(job.id);
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
   finished_at=case when decision='retry' and attempts<5 then null else now() end,error_code=left(p->>'code',80),provider_id=case when decision='sent' then left(p->>'provider_id',200) else provider_id end where id=job.id;
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

notify pgrst,'reload schema';
commit;
