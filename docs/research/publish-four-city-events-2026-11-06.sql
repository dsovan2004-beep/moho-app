begin;
insert into public.events(title,description,city,location,start_date,end_date,category,source_url,confidence,status,source,confidence_score,needs_review,ingestion_status)
select 'Manteca Christmas in the Park & Parade',
'Manteca Chamber of Commerce lists Christmas in the Park on December 5, 2026 from noon to 9 PM at 320 W. Center Street, with vendors, food, activities and a Santa visit. The Christmas parade starts at 5 PM along Yosemite Avenue in downtown Manteca. Confirm activity costs, participation requirements, parking and schedule changes with the organizer. Official Chamber event page checked November 6, 2026; no event photographs reused.',
'Manteca','Park: 320 W. Center Street; parade: Yosemite Avenue, Downtown Manteca','2026-12-05T12:00:00-08:00'::timestamptz,'2026-12-05T21:00:00-08:00'::timestamptz,'Seasonal celebrations','https://manteca.org/2026-manteca-christmas-in-the-park-parade/','HIGH','approved','editorial_seasonal_2026',1.0,false,'approved'
where not exists(select 1 from public.events where city='Manteca' and source_url='https://manteca.org/2026-manteca-christmas-in-the-park-parade/' and start_date='2026-12-05T12:00:00-08:00'::timestamptz);
insert into public.events(title,description,city,location,start_date,end_date,category,source_url,confidence,status,source,confidence_score,needs_review,ingestion_status)
select 'Lathrop Christmas Parade & Tree Lighting',
'The City of Lathrop Parks & Recreation calendar lists its Christmas Parade & Tree Lighting for Saturday, December 5, 2026 at 5 PM. The current event page does not establish the parade route, tree-lighting venue, end time or admission details. Check the official City page or Parks & Recreation before planning travel. General department contact addresses are not confirmed event venues. Official page inspected November 6, 2026; no event photograph reused.',
'Lathrop','Lathrop — parade route and tree-lighting venue to be confirmed','2026-12-05T17:00:00-08:00'::timestamptz,null,'Seasonal celebrations','https://www.ci.lathrop.ca.us/parksrec/page/christmas-parade-tree-lighting-0','HIGH','approved','editorial_seasonal_2026',0.9,false,'approved'
where not exists(select 1 from public.events where city='Lathrop' and source_url='https://www.ci.lathrop.ca.us/parksrec/page/christmas-parade-tree-lighting-0' and start_date='2026-12-05T17:00:00-08:00'::timestamptz);
commit;
