begin;
alter table public.lost_and_found add column contact_stage text not null default 'unknown' check(contact_stage in('unknown','attempted','contacted','return_arranged')),add column contact_updated_at timestamptz,
 add constraint pet_contact_confirmation check((contact_stage='unknown' and contact_updated_at is null) or (contact_stage<>'unknown' and contact_updated_at is not null and isfinite(contact_updated_at)));
grant select(contact_stage,contact_updated_at) on public.lost_and_found to anon,authenticated;
alter table directory_private.pet_status_history add column contact_stage text,add column contact_updated_at timestamptz;
create or replace function directory_private.pet_activity(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); cid uuid; message_record public.pet_messages%rowtype; pet public.lost_and_found%rowtype; next_status text; next_progress text; observed timestamptz; contact text; contact_at timestamptz; result jsonb;
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
  return coalesce((select jsonb_agg(to_jsonb(q)) from(select id,title,pet_name,city,status,status_revision,status_confirmed_at,progress,progress_observed_at,contact_stage,contact_updated_at,created_at,expires_at,(expires_at<=now()) expired,
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
  contact:=case when p ? 'contact_stage' then p->>'contact_stage' when next_status=pet.status then pet.contact_stage else 'unknown' end;
  if contact is null or contact not in('unknown','attempted','contacted','return_arranged') then raise exception 'Choose a valid contact update' using errcode='22023'; end if;
  if contact<>'unknown' and next_status not in('lost','found') then raise exception 'Contact update does not match report status' using errcode='22023'; end if;
  contact_at:=case when contact='unknown' then null when p ? 'contact_stage' then now() else pet.contact_updated_at end;
  perform directory_private.pet_budget(uid,'status',20);
  insert into directory_private.pet_status_history(pet_id,actor_id,previous_status,new_status,revision,previous_progress,new_progress,observed_at,contact_stage,contact_updated_at) values(pet.id,uid,pet.status,next_status,pet.status_revision+1,pet.progress,next_progress,observed,contact,contact_at);
  update public.lost_and_found set status=next_status,contact_stage=contact,contact_updated_at=contact_at,progress=next_progress,progress_observed_at=observed,status_revision=status_revision+1,status_confirmed_at=now(),expires_at=case when next_status='archived' then now() else now()+interval '30 days' end where id=pet.id;
  return jsonb_build_object('status',next_status,'revision',pet.status_revision+1);
 end if;
 raise exception 'Unknown activity action' using errcode='22023';
end $$;

create or replace function directory_private.pet_progress_timeline(pid uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce((select jsonb_agg(to_jsonb(q) order by q.revision desc) from (
  select h.new_status status,h.new_progress progress,h.observed_at,h.created_at confirmed_at,h.revision,h.contact_stage,h.contact_updated_at
  from directory_private.pet_status_history h join public.lost_and_found p on p.id=h.pet_id
  where p.id=pid and p.needs_review is not true and coalesce(p.ingestion_status,'active')='active'
   and p.status in('active','lost','found','reunited') and p.expires_at>now()
   and h.actor_id is not null and h.new_status in('lost','found','reunited')
  order by h.revision desc limit 20
 )q),'[]'::jsonb)
$$;
revoke all on function directory_private.pet_progress_timeline(uuid) from public;
grant execute on function directory_private.pet_progress_timeline(uuid) to anon,authenticated;
create or replace function public.pet_progress_timeline(pet_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$select directory_private.pet_progress_timeline(pet_id)$$;
revoke all on function public.pet_progress_timeline(uuid) from public;
grant execute on function public.pet_progress_timeline(uuid) to anon,authenticated;

create table directory_private.pet_match_links(
 id uuid primary key default gen_random_uuid(),pet_a uuid not null references public.lost_and_found(id) on delete cascade,pet_b uuid not null references public.lost_and_found(id) on delete cascade,
 proposed_by uuid references auth.users(id) on delete set null,
 decision_a text not null default 'pending' check(decision_a in('pending','confirmed','ruled_out')),
 decision_b text not null default 'pending' check(decision_b in('pending','confirmed','ruled_out')),
 revision integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(pet_a,pet_b),check(pet_a<pet_b)
);
create index pet_match_links_other on directory_private.pet_match_links(pet_b,updated_at desc);
create index pet_match_links_proposer on directory_private.pet_match_links(proposed_by);
create table directory_private.pet_match_history(
 id uuid primary key default gen_random_uuid(),match_id uuid not null references directory_private.pet_match_links(id) on delete cascade,
 pet_id uuid not null references public.lost_and_found(id) on delete cascade,actor_id uuid references auth.users(id) on delete set null,
 decision text not null,revision integer not null,created_at timestamptz not null default now()
);
create index pet_match_history_parent on directory_private.pet_match_history(match_id,created_at);
create index pet_match_history_pet on directory_private.pet_match_history(pet_id);
create index pet_match_history_actor on directory_private.pet_match_history(actor_id);
alter table directory_private.pet_match_links enable row level security;
alter table directory_private.pet_match_history enable row level security;
revoke all on directory_private.pet_match_links,directory_private.pet_match_history from public,anon,authenticated;
grant all on directory_private.pet_match_links,directory_private.pet_match_history to service_role;

-- Internal publication fence; no browser access to this helper or private rows.
create function directory_private.pet_is_public(pid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.lost_and_found where id=pid and needs_review is not true and coalesce(ingestion_status,'active')='active' and status in('active','lost','found','reunited') and expires_at>now() and city in('Mountain House','Tracy','Lathrop','Manteca'))
$$;
revoke all on function directory_private.pet_is_public(uuid) from public,anon,authenticated;
create function directory_private.pet_matches(pid uuid,management boolean) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not directory_private.pet_is_public(pid) then return '[]'::jsonb;end if;
 if management and not exists(select 1 from public.lost_and_found where id=pid and reporter_id=auth.uid()) then return '[]'::jsonb;end if;
 return coalesce((select jsonb_agg(q.item order by q.updated_at desc,q.id) from(
  select l.id,l.updated_at,jsonb_build_object('id',l.id,'other_pet_id',o.id,'title',coalesce(o.title,o.pet_name,'Pet report'),'city',o.city,'status',o.status,'updated_at',l.updated_at,'revision',l.revision,
   'state',case when 'ruled_out' in(l.decision_a,l.decision_b) then 'ruled_out' when l.decision_a='confirmed' and l.decision_b='confirmed' then 'confirmed' else 'possible' end)
   ||case when management then jsonb_build_object('my_decision',case when pid=l.pet_a then l.decision_a else l.decision_b end) else '{}'::jsonb end item
  from directory_private.pet_match_links l join public.lost_and_found o on o.id=case when pid=l.pet_a then l.pet_b else l.pet_a end
  where pid in(l.pet_a,l.pet_b) and directory_private.pet_is_public(o.id) and (management or 'ruled_out' not in(l.decision_a,l.decision_b))
  order by l.updated_at desc,l.id limit 20
 )q),'[]'::jsonb);
end $$;
revoke all on function directory_private.pet_matches(uuid,boolean) from public,anon,authenticated;
create function directory_private.public_pet_matches(pid uuid) returns jsonb language sql stable security definer set search_path='' as $$select directory_private.pet_matches(pid,false)$$;
revoke all on function directory_private.public_pet_matches(uuid) from public;
grant execute on function directory_private.public_pet_matches(uuid) to anon,authenticated;
create function public.pet_match_links(pet_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$select directory_private.public_pet_matches(pet_id)$$;
revoke all on function public.pet_match_links(uuid) from public;
grant execute on function public.pet_match_links(uuid) to anon,authenticated;

create function directory_private.pet_match_action(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();pid uuid;other uuid;other_owner uuid;lo uuid;hi uuid;link directory_private.pet_match_links%rowtype;decision text;own boolean;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise exception 'Confirmed sign-in required' using errcode='42501';end if;
 if p is null or jsonb_typeof(p)<>'object' or length(p::text)>2000 then raise exception 'Invalid request' using errcode='22023';end if;
 pid:=(p->>'pet_id')::uuid;
 own:=directory_private.pet_is_public(pid) and exists(select 1 from public.lost_and_found where id=pid and reporter_id=uid);
 if action='context' then return jsonb_build_object('can_manage',own,'links',case when own then directory_private.pet_matches(pid,true) else '[]'::jsonb end);end if;
 if not own then raise exception 'Your available linked report is required' using errcode='42501';end if;
 if action='suggest' then
  other:=(p->>'other_pet_id')::uuid;
  if other=pid or not directory_private.pet_is_public(other) or not exists(select 1 from public.lost_and_found a join public.lost_and_found b on b.id=other where a.id=pid and ((a.status='lost' and b.status='found') or (a.status='found' and b.status='lost'))) then raise exception 'Choose an available lost report and a different found report' using errcode='22023';end if;
  select reporter_id into other_owner from public.lost_and_found where id=other;
  if exists(select 1 from public.pet_message_blocks where (user_id=uid and blocked_id=other_owner) or (user_id=other_owner and blocked_id=uid)) then raise exception 'Matching unavailable for these reports' using errcode='42501';end if;
  lo:=least(pid,other);hi:=greatest(pid,other);
  perform pg_advisory_xact_lock(hashtextextended(lo::text||hi::text,27));
  select * into link from directory_private.pet_match_links where pet_a=lo and pet_b=hi;
  if link.id is null then
   perform directory_private.pet_budget(uid,'match_suggest',10);
   insert into directory_private.pet_match_links(pet_a,pet_b,proposed_by) values(lo,hi,uid) returning * into link;
   insert into directory_private.pet_match_history(match_id,pet_id,actor_id,decision,revision) values(link.id,pid,uid,'pending',0);
  end if;
  return jsonb_build_object('id',link.id,'revision',link.revision);
 elsif action='review' then
  select * into link from directory_private.pet_match_links where id=(p->>'id')::uuid and pid in(pet_a,pet_b) for update;
  if link.id is null or not directory_private.pet_is_public(case when pid=link.pet_a then link.pet_b else link.pet_a end) then raise exception 'Match unavailable' using errcode='42501';end if;
  if (p->>'revision')::integer is distinct from link.revision then raise exception 'Match changed; refresh before updating' using errcode='22023';end if;
  decision:=p->>'decision';
  if decision is null or decision not in('pending','confirmed','ruled_out') then raise exception 'Choose a valid match decision' using errcode='22023';end if;
  select reporter_id into other_owner from public.lost_and_found where id=case when pid=link.pet_a then link.pet_b else link.pet_a end;
  if decision='confirmed' and exists(select 1 from public.pet_message_blocks where (user_id=uid and blocked_id=other_owner) or (user_id=other_owner and blocked_id=uid)) then raise exception 'Matching unavailable for these reports' using errcode='42501';end if;
  perform directory_private.pet_budget(uid,'match_review',20);
  update directory_private.pet_match_links set decision_a=case when pid=pet_a then decision else decision_a end,decision_b=case when pid=pet_b then decision else decision_b end,revision=revision+1,updated_at=now() where id=link.id;
  insert into directory_private.pet_match_history(match_id,pet_id,actor_id,decision,revision) values(link.id,pid,uid,decision,link.revision+1);
  return jsonb_build_object('saved',true,'revision',link.revision+1);
 end if;
 raise exception 'Unknown match action' using errcode='22023';
end $$;
revoke all on function directory_private.pet_match_action(text,jsonb) from public,anon;
grant execute on function directory_private.pet_match_action(text,jsonb) to authenticated;
create function public.pet_match_action(action text,payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select directory_private.pet_match_action(action,payload)$$;
revoke all on function public.pet_match_action(text,jsonb) from public,anon;
grant execute on function public.pet_match_action(text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
