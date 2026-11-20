-- Friday November 20, 2026 09:00 Pacific freshness period; source-checked editorial decisions.
begin;
do $$ begin
if exists(select 1 from public.events where city='Lathrop' and (title ilike '%Silver Harvest%' and start_date='2026-11-24T09:00:00-08:00'::timestamptz)) then raise exception 'Duplicate Silver Harvest occurrence'; end if;
end $$;
insert into public.events(id,title,description,city,location,start_date,end_date,category,source_url,confidence,status,source,confidence_score,needs_review,ingestion_status)
values('c09828c9-6e9c-43d8-8a35-e469ec70c754','Silver Harvest Food Distribution — November 24',
'City of Lathrop lists food distribution on November 24, 2026 from 9 to 11 AM in the Lathrop Senior Center parking lot. The City states participants must live in Lathrop or French Camp, be over age 60 and meet income guidelines. This is an eligibility-restricted program, not a general public food giveaway. Confirm documentation, enrollment, current income limits and food availability with the Senior Center at (209) 941-7380. Exact occurrence, venue, published eligibility and public contact checked November 20, 2026; no participant information or event photos collected.',
'Lathrop','Lathrop Senior Center parking lot, 15707 5th Street, Lathrop','2026-11-24T09:00:00-08:00','2026-11-24T11:00:00-08:00','Community programs','https://www.ci.lathrop.ca.us/parksrec/page/silver-harvest','HIGH','approved','editorial_refresh_2026',1.0,false,'approved');
do $$ begin
update public.events set status='pending',needs_review=true,ingestion_status='pending'
where id='ebaef4d0-5326-4f8d-8be4-5199422db1f5' and status='approved' and source_url='https://mhshala.org/events/mh-shala-ai-builders/';
if not found then raise exception 'Hackathon record changed; review current state'; end if;
end $$;
commit;
