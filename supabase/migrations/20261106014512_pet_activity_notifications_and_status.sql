begin;
alter table public.pet_messages add column delivery_seq bigint generated always as identity;
create unique index pet_messages_delivery_sequence on public.pet_messages(delivery_seq);
create index pet_messages_conversation_delivery on public.pet_messages(conversation_id,delivery_seq desc);
alter table public.lost_and_found add column status_revision integer not null default 0, add column status_confirmed_at timestamptz;
grant select(status_revision,status_confirmed_at) on public.lost_and_found to anon,authenticated;
create index pet_owner_reports on public.lost_and_found(reporter_id,created_at desc) where reporter_id is not null;
create table public.pet_read_receipts(
 user_id uuid not null references auth.users(id) on delete cascade,
 conversation_id uuid not null references public.pet_conversations(id) on delete cascade,
 read_seq bigint not null,primary key(user_id,conversation_id)
);
create index pet_receipts_conversation on public.pet_read_receipts(conversation_id);
alter table public.pet_read_receipts enable row level security;
revoke all on public.pet_read_receipts from public,anon,authenticated;
grant select on public.pet_read_receipts to authenticated;
grant all on public.pet_read_receipts to service_role;
create policy own_pet_receipts on public.pet_read_receipts for select to authenticated using(user_id=(select auth.uid()));
create table directory_private.pet_status_history(
 id uuid primary key default gen_random_uuid(),pet_id uuid not null references public.lost_and_found(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,previous_status text not null,new_status text not null,
 revision integer not null,created_at timestamptz not null default now()
);
create index pet_status_history_parent on directory_private.pet_status_history(pet_id,created_at);
create index pet_status_history_actor on directory_private.pet_status_history(actor_id);
alter table directory_private.pet_status_history enable row level security;
revoke all on directory_private.pet_status_history from public,anon,authenticated;
create function directory_private.pet_activity(action text,p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
  return coalesce((select jsonb_agg(to_jsonb(q)) from(select id,title,pet_name,city,status,status_revision,status_confirmed_at,created_at,
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
  update public.lost_and_found set status=next_status,status_revision=status_revision+1,status_confirmed_at=now() where id=pet.id;
  return jsonb_build_object('status',next_status,'revision',pet.status_revision+1);
 end if;
 raise exception 'Unknown activity action' using errcode='22023';
end $$;
revoke all on function directory_private.pet_activity(text,jsonb) from public,anon;
grant execute on function directory_private.pet_activity(text,jsonb) to authenticated;
create function public.pet_activity_action(action text,payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select directory_private.pet_activity(action,payload)$$;
revoke all on function public.pet_activity_action(text,jsonb) from public,anon;
grant execute on function public.pet_activity_action(text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
