begin;
do $fresh$
declare changed integer;
begin
 update public.events set
 location='Parade: Central Parkway from Mustang Way toward Main Street; tree lighting: Town Hall Plaza; holiday market: Town Hall parking lot, Mountain House',
 description='City holiday program on December 5, 2026: parade at 5 PM along Central Parkway from Mustang Way toward Main Street; tree lighting at 6 PM at Town Hall Plaza; holiday market from 6 to 9 PM in the Town Hall parking lot. The market venue is distinct from the plaza. Overall event end time and admission terms are not established here; check the City page for updates. Organizer: City of Mountain House. Official schedule and venues checked November 17, 2026.'
 where id='a7dea964-55db-4608-8bad-dfd8e931a4e2' and status='approved' and needs_review=false
 and location='Central Parkway parade route; Town Hall Plaza' and end_date is null
 and source_url='https://www.mountainhouseca.gov/277/MoHoHo-Holidays';
 get diagnostics changed=row_count;
 if changed<>1 then raise exception 'Event changed; review before updating';end if;
 if exists(select 1 from public.events where city='Mountain House' and (source_url='https://www.mountainhouseca.gov/466/Breakfast-with-Santa' or title ilike '%breakfast%') and start_date>='2026-12-12T08:00:00Z' and start_date<'2026-12-13T08:00:00Z') then raise exception 'Possible duplicate breakfast event; review required';end if;
 insert into public.events(title,description,city,location,start_date,end_date,category,source_url,source,status,needs_review,confidence,confidence_score,ingestion_status,image_url) values
 ('Breakfast with the Grinch — 9 AM seating','City holiday breakfast at Unity Center, December 12, 9–10 AM Pacific. The City lists $12 per person ages 2 and up, provides registration links and states space is limited. Check current booking terms and availability on the official page. A second seating is separate. Website details checked November 17, 2026.','Mountain House','Unity Center, Mountain House (street address not listed on event page)','2026-12-12T17:00:00Z','2026-12-12T18:00:00Z','Seasonal celebrations','https://www.mountainhouseca.gov/466/Breakfast-with-Santa','editorial_seasonal_2026','approved',false,'HIGH',1,'approved',null),
 ('Breakfast with the Grinch — 10:30 AM seating','City holiday breakfast at Unity Center, December 12, 10:30–11:30 AM Pacific. The City lists $12 per person ages 2 and up, provides registration links and states space is limited. Check current booking terms and availability on the official page. An earlier seating is separate. Website details checked November 17, 2026.','Mountain House','Unity Center, Mountain House (street address not listed on event page)','2026-12-12T18:30:00Z','2026-12-12T19:30:00Z','Seasonal celebrations','https://www.mountainhouseca.gov/466/Breakfast-with-Santa','editorial_seasonal_2026','approved',false,'HIGH',1,'approved',null);
end $fresh$;
commit;
