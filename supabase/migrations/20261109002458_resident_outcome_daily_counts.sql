begin;
-- Aggregate choices have no account, business, search or contact identifiers.
create table directory_private.resident_outcome_daily (
  report_day date not null,
  city text not null check (city in ('Mountain House','Tracy','Lathrop','Manteca')),
  outcome text not null check (outcome in ('reached_provider','could_not_reach','found_help')),
  reports bigint not null default 1 check (reports > 0),
  primary key(report_day,city,outcome)
);
-- Separate anti-repeat state: only the latest reporting day, no city or choice.
create table directory_private.resident_outcome_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_report_day date not null
);
alter table directory_private.resident_outcome_daily enable row level security;
alter table directory_private.resident_outcome_limits enable row level security;
revoke all on directory_private.resident_outcome_daily,directory_private.resident_outcome_limits from public,anon,authenticated;
create function directory_private.record_resident_outcome(p_city text,p_outcome text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); accepted_uid uuid; today date:=(now() at time zone 'America/Los_Angeles')::date;
begin
  if uid is null or not exists(select 1 from auth.users u where u.id=uid and u.email_confirmed_at is not null and u.is_anonymous is not true and (u.banned_until is null or u.banned_until < now())) then
    raise exception 'Confirmed sign-in required' using errcode='42501';
  end if;
  if p_city is null or p_city not in ('Mountain House','Tracy','Lathrop','Manteca') or p_outcome is null or p_outcome not in ('reached_provider','could_not_reach','found_help') then
    raise exception 'Invalid outcome choice' using errcode='22023';
  end if;
  insert into directory_private.resident_outcome_limits(user_id,last_report_day) values(uid,today)
    on conflict(user_id) do update set last_report_day=excluded.last_report_day
    where directory_private.resident_outcome_limits.last_report_day<>excluded.last_report_day
    returning user_id into accepted_uid;
  if accepted_uid is null then return jsonb_build_object('accepted',false,'reason','already_reported_today'); end if;
  insert into directory_private.resident_outcome_daily(report_day,city,outcome,reports) values(today,p_city,p_outcome,1)
    on conflict(report_day,city,outcome) do update set reports=directory_private.resident_outcome_daily.reports+1;
  return jsonb_build_object('accepted',true);
end $$;
revoke all on function directory_private.record_resident_outcome(text,text) from public,anon,authenticated;
grant execute on function directory_private.record_resident_outcome(text,text) to authenticated;
create function public.record_resident_outcome(p_city text,p_outcome text) returns jsonb
language sql security invoker set search_path='' as $$ select directory_private.record_resident_outcome(p_city,p_outcome); $$;
revoke all on function public.record_resident_outcome(text,text) from public,anon;
grant execute on function public.record_resident_outcome(text,text) to authenticated;
notify pgrst,'reload schema';
commit;
