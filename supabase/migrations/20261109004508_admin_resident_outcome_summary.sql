begin;
create function directory_private.resident_outcome_summary() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare today date:=(now() at time zone 'America/Los_Angeles')::date; rows jsonb;
begin
  if not directory_private.is_admin() or not exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and u.is_anonymous is not true and (u.banned_until is null or u.banned_until<now())) then
    raise exception 'Administrator required' using errcode='42501';
  end if;
  select jsonb_agg(jsonb_build_object('city',c.city,
    'reached_provider',coalesce(t.reached_provider,0),
    'could_not_reach',coalesce(t.could_not_reach,0),
    'found_help',coalesce(t.found_help,0)) order by c.position) into rows
  from (values (1,'Mountain House'),(2,'Tracy'),(3,'Lathrop'),(4,'Manteca')) c(position,city)
  left join (
    select city,sum(reports) filter(where outcome='reached_provider') as reached_provider,
      sum(reports) filter(where outcome='could_not_reach') as could_not_reach,
      sum(reports) filter(where outcome='found_help') as found_help
    from directory_private.resident_outcome_daily where report_day between today-29 and today group by city
  ) t on c.city=t.city;
  return jsonb_build_object('start_day',today-29,'end_day',today,'cities',rows);
end $$;
revoke all on function directory_private.resident_outcome_summary() from public,anon,authenticated;
grant execute on function directory_private.resident_outcome_summary() to authenticated;
create function public.admin_resident_outcome_summary() returns jsonb
language sql stable security invoker set search_path='' as $$ select directory_private.resident_outcome_summary(); $$;
revoke all on function public.admin_resident_outcome_summary() from public,anon;
grant execute on function public.admin_resident_outcome_summary() to authenticated;
notify pgrst,'reload schema';
commit;
