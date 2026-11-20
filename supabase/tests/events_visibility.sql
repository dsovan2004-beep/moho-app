-- Transaction-only RLS fixtures: no committed events or public activity.
begin;
insert into public.events(id,title,description,city,location,start_date,category,status,ingestion_status)
values
('aaeecccc-2222-4444-8888-000000000001','TRANSACTION ONLY approved event','RLS test fixture','Lathrop','Test only',now(),'Test','approved','approved'),
('aaeecccc-2222-4444-8888-000000000002','TRANSACTION ONLY held event','RLS test fixture','Lathrop','Test only',now(),'Test','pending','pending');
set local role anon;
do $$ begin
if not exists(select 1 from public.events where id='aaeecccc-2222-4444-8888-000000000001') then raise exception 'anon approved read failed'; end if;
if exists(select 1 from public.events where id='aaeecccc-2222-4444-8888-000000000002') then raise exception 'anon held event exposed'; end if;
end $$;
reset role;
set local role authenticated;
do $$ begin
if not exists(select 1 from public.events where id='aaeecccc-2222-4444-8888-000000000001') then raise exception 'authenticated approved read failed'; end if;
if exists(select 1 from public.events where id='aaeecccc-2222-4444-8888-000000000002') then raise exception 'authenticated held event exposed'; end if;
end $$;
reset role;
do $$ begin
if not exists(select 1 from public.events where id='aaeecccc-2222-4444-8888-000000000002') then raise exception 'editorial held record missing'; end if;
end $$;
rollback;
select 'event visibility fixture assertions passed; fixtures rolled back' as result;
