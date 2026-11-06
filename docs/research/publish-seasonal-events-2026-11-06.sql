-- Primary city sources checked November 6, 2026; no borrowed event photos.
-- Mountain House detail and Special Events pages now agree on a 5 PM parade.
-- Existing rows are never overwritten; repeated execution adds no duplicates.
begin;
insert into public.events(title,description,city,location,start_date,end_date,category,source_url,confidence,status,source,confidence_score,needs_review,ingestion_status)
select 'MoHoHo Holidays: Parade, Tree Lighting & Market',
'Mountain House’s holiday celebration includes a lighted parade along Central Parkway from Mustang Way toward Main Street, followed by tree lighting and a market at Town Hall Plaza. City pages list the parade at 5 PM and tree lighting at 6 PM; the overall end time and admission details were not established. Check the city’s current page for participation and schedule changes. Organizer: City of Mountain House. Official detail and Special Events pages checked November 6, 2026.',
'Mountain House','Central Parkway parade route; Town Hall Plaza','2026-12-05T17:00:00-08:00'::timestamptz,null,'Seasonal celebrations',
'https://www.mountainhouseca.gov/277/MoHoHo-Holidays','HIGH','approved','editorial_seasonal_2026',1.0,false,'approved'
where not exists(select 1 from public.events where source_url='https://www.mountainhouseca.gov/277/MoHoHo-Holidays' and start_date='2026-12-05T17:00:00-08:00'::timestamptz);
insert into public.events(title,description,city,location,start_date,end_date,category,source_url,confidence,status,source,confidence_score,needs_review,ingestion_status)
select 'Holiday Light Parade and Tree Lighting',
'Tracy City Center Association presents a free holiday parade and tree lighting in downtown Tracy, listed for 6–8:30 PM. The city calendar names 6th Street, Central Avenue, 10th Street and Front Street Plaza. Several downtown streets close earlier in the afternoon; review the official notice before planning parking or travel. Official City of Tracy calendar checked November 6, 2026. Confirm schedule changes with the organizer before attending.',
'Tracy','Downtown Tracy: 6th Street, Central Avenue, 10th Street and Front Street Plaza','2026-12-05T18:00:00-08:00'::timestamptz,'2026-12-05T20:30:00-08:00'::timestamptz,'Seasonal celebrations',
'https://www.cityoftracy.org/I-Want-To/View/City-Calendar/2026/Events-Folder/Holiday-Light-Parade-and-Tree-Lighting','HIGH','approved','editorial_seasonal_2026',1.0,false,'approved'
where not exists(select 1 from public.events where source_url='https://www.cityoftracy.org/I-Want-To/View/City-Calendar/2026/Events-Folder/Holiday-Light-Parade-and-Tree-Lighting' and start_date='2026-12-05T18:00:00-08:00'::timestamptz);
commit;
