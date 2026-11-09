-- Privileged integration check. Every test write is rolled back; never a real resident report.
begin;
do $test$
declare uid uuid; r jsonb; before_total bigint; after_total bigint;
begin
  if has_function_privilege('anon','public.record_resident_outcome(text,text)','EXECUTE') then raise exception 'anonymous execute granted'; end if;
  if has_table_privilege('authenticated','directory_private.resident_outcome_daily','SELECT') or has_table_privilege('authenticated','directory_private.resident_outcome_limits','SELECT') then raise exception 'private tables exposed'; end if;
  perform set_config('request.jwt.claim.sub','',true);
  begin
    perform public.record_resident_outcome('Lathrop','found_help'); raise exception 'missing auth accepted';
  exception when insufficient_privilege then null; end;
  select u.id into uid from auth.users u where u.email_confirmed_at is not null and u.is_anonymous is not true and (u.banned_until is null or u.banned_until<now()) and not exists(select 1 from directory_private.resident_outcome_limits l where l.user_id=u.id and l.last_report_day=(now() at time zone 'America/Los_Angeles')::date) limit 1;
  if uid is null then raise exception 'No eligible confirmed test identity'; end if;
  perform set_config('request.jwt.claim.sub',uid::text,true);
  select coalesce(sum(reports),0) into before_total from directory_private.resident_outcome_daily;
  begin
    perform public.record_resident_outcome('San Jose','found_help'); raise exception 'invalid city accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.record_resident_outcome('Lathrop','booked_job'); raise exception 'invalid outcome accepted';
  exception when invalid_parameter_value then null; end;
  r:=public.record_resident_outcome('Lathrop','reached_provider');
  if r->>'accepted'<>'true' then raise exception 'first report failed'; end if;
  r:=public.record_resident_outcome('Manteca','found_help');
  if r->>'accepted'<>'false' or r->>'reason'<>'already_reported_today' then raise exception 'cross-city repeat accepted'; end if;
  select coalesce(sum(reports),0) into after_total from directory_private.resident_outcome_daily;
  if after_total<>before_total+1 then raise exception 'wrong counter'; end if;
end $test$;
rollback;
