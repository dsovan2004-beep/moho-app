begin;
-- No inference from legacy found reports: possession has not been confirmed.
alter table public.lost_and_found
 add column progress text not null default 'unknown' check(progress in('unknown','sighted','secured')),
 add column progress_observed_at timestamptz,
 add constraint pet_progress_observation check((progress='unknown' and progress_observed_at is null) or (progress in('sighted','secured') and progress_observed_at is not null and isfinite(progress_observed_at)));
grant select(progress,progress_observed_at) on public.lost_and_found to anon,authenticated;
alter table directory_private.pet_status_history add column previous_progress text,add column new_progress text,add column observed_at timestamptz;
create or replace function directory_private.pet_activity(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); cid uuid; message_record public.pet_messages%rowtype; pet public.lost_and_found%rowtype; next_status text; next_progress text; observed timestamptz; result jsonb;
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
  return coalesce((select jsonb_agg(to_jsonb(q)) from(select id,title,pet_name,city,status,status_revision,status_confirmed_at,progress,progress_observed_at,created_at,expires_at,(expires_at<=now()) expired,
    (needs_review is true or coalesce(ingestion_status,'active')<>'active') under_review
    from public.lost_and_found where reporter_id=uid order by created_at desc limit 100)q),'[]'::jsonb);
 elsif action='report_status' then
  select * into pet from public.lost_and_found where id=(p->>'pet_id')::uuid and reporter_id=uid for update;
  if pet.id is null then raise exception 'Your linked report is required' using errcode='42501'; end if;
  if pet.needs_review is true or coalesce(pet.ingestion_status,'active')<>'active' then raise exception 'This report is under review; status cannot be changed' using errcode='42501'; end if;
  next_status:=p->>'status';
  if next_status is null or next_status not in('lost','found','reunited','archived') then raise exception 'Choose a valid pet status' using errcode='22023'; end if;
  if (p->>'revision')::integer is distinct from pet.status_revision then raise exception 'Report changed; refresh before updating' using errcode='22023'; end if;
  next_progress:=case when p ? 'progress' then p->>'progress' when next_status=pet.status then pet.progress else 'unknown' end;
  if next_progress is null or next_progress not in('unknown','sighted','secured') then raise exception 'Choose a valid progress update' using errcode='22023'; end if;
  if (next_progress='secured' and next_status<>'found') or (next_progress='sighted' and next_status not in('lost','found')) then raise exception 'Progress does not match report status' using errcode='22023'; end if;
  observed:=case when next_progress='unknown' then null when p ? 'observed_at' then nullif(p->>'observed_at','')::timestamptz else pet.progress_observed_at end;
  if next_progress<>'unknown' and (observed is null or not isfinite(observed) or observed< timestamptz '2000-01-01 UTC' or observed>now()+interval '5 minutes') then raise exception 'Enter the observation time, not a future date' using errcode='22023'; end if;
  perform directory_private.pet_budget(uid,'status',20);
  insert into directory_private.pet_status_history(pet_id,actor_id,previous_status,new_status,revision,previous_progress,new_progress,observed_at) values(pet.id,uid,pet.status,next_status,pet.status_revision+1,pet.progress,next_progress,observed);
  update public.lost_and_found set status=next_status,progress=next_progress,progress_observed_at=observed,status_revision=status_revision+1,status_confirmed_at=now(),expires_at=case when next_status='archived' then now() else now()+interval '30 days' end where id=pet.id;
  return jsonb_build_object('status',next_status,'revision',pet.status_revision+1);
 end if;
 raise exception 'Unknown activity action' using errcode='22023';
end $$;

-- Deliberately narrow public projection of the existing private audit, with the
-- same publication/expiry fence as pet reports. Never return actor IDs or notes.
create function directory_private.pet_progress_timeline(pid uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce((select jsonb_agg(to_jsonb(q) order by q.revision desc) from (
  select h.new_status status,h.new_progress progress,h.observed_at,h.created_at confirmed_at,h.revision
  from directory_private.pet_status_history h join public.lost_and_found p on p.id=h.pet_id
  where p.id=pid and p.needs_review is not true and coalesce(p.ingestion_status,'active')='active'
   and p.status in('active','lost','found','reunited') and p.expires_at>now()
   and h.actor_id is not null and h.new_status in('lost','found','reunited')
  order by h.revision desc limit 20
 )q),'[]'::jsonb)
$$;
revoke all on function directory_private.pet_progress_timeline(uuid) from public;
grant execute on function directory_private.pet_progress_timeline(uuid) to anon,authenticated;
create function public.pet_progress_timeline(pet_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$select directory_private.pet_progress_timeline(pet_id)$$;
revoke all on function public.pet_progress_timeline(uuid) from public;
grant execute on function public.pet_progress_timeline(uuid) to anon,authenticated;
notify pgrst,'reload schema';
commit;
