begin;
-- Unmatched early events must not occupy the bounded reconciliation batch.
create or replace function directory_private.reconcile_email_events(only_job uuid) returns void language plpgsql security definer set search_path='' as $$
declare ev directory_private.email_delivery_events%rowtype;j directory_private.notification_jobs%rowtype;
begin
 for ev in select e.* from directory_private.email_delivery_events e where e.processed_at is null and exists(select 1 from directory_private.notification_jobs ready where ready.channel='email' and ready.status='sent' and btrim(ready.provider_id,'<>')=e.provider_id and lower(ready.recipient_email)=e.recipient_email) and e.created_at>now()-interval '14 days' and (only_job is null or exists(select 1 from directory_private.notification_jobs n where n.id=only_job and btrim(n.provider_id,'<>')=e.provider_id and lower(n.recipient_email)=e.recipient_email)) order by e.occurred_at limit 100 for update skip locked loop
  select * into j from directory_private.notification_jobs n where n.channel='email' and n.status='sent' and btrim(n.provider_id,'<>')=ev.provider_id and lower(n.recipient_email)=ev.recipient_email order by n.created_at desc limit 1 for update;
  if j.id is null then continue;end if;
  -- A complaint/failure must never be erased by a duplicate or late delivery event.
  if ev.event_type='complained' or j.delivery_status is null or (j.delivery_status='deferred' and ev.event_type<>'deferred') or (j.delivery_status='delivered' and ev.event_type in('bounced','failed','rejected')) or (j.delivery_status='deferred' and ev.event_type='deferred' and ev.occurred_at>j.delivery_updated_at) then
   update directory_private.notification_jobs set delivery_status=ev.event_type,delivery_updated_at=ev.occurred_at where id=j.id;
  end if;
  if ev.suppress then
   insert into directory_private.email_suppressions(user_id,email,reason) values(j.user_id,lower(j.recipient_email),ev.event_type) on conflict(user_id,email) do update set reason=case when email_suppressions.reason='complained' then 'complained' else excluded.reason end;
   update directory_private.notification_preferences n set email_enabled=false where n.user_id=j.user_id and exists(select 1 from auth.users u where u.id=j.user_id and lower(u.email)=lower(j.recipient_email));
   update directory_private.notification_jobs set status='cancelled',finished_at=now(),error_code='email_address_suppressed' where user_id=j.user_id and channel='email' and lower(recipient_email)=lower(j.recipient_email) and status in('pending','leased');
  end if;
  update directory_private.email_delivery_events set job_id=j.id,processed_at=now() where event_id=ev.event_id;
 end loop;
end $$;
commit;
