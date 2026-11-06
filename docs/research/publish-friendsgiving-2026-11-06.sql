-- City calendar, event EID 2557, checked November 6, 2026.
-- Exact official venue and costs retained; no unverified age cutoff inferred.
insert into public.events(title,description,city,location,start_date,end_date,category,source_url,confidence,status,source,confidence_score,needs_review,ingestion_status)
select 'Prime Time Seniors Friendsgiving Brunch',
'The City of Mountain House Prime Time Seniors program lists a Friendsgiving potluck brunch on November 13, noon–2 PM, with shared food and seasonal activities. The calendar lists TH-1 Room at 201 E. Main Street. Cost: free when bringing a dish; $5 without a dish. Registration is linked on the city event page; confirm eligibility, availability and dish arrangements with the organizer at (209) 831-5623. No specific age cutoff was established in the event notice. Official city calendar checked November 6, 2026.',
'Mountain House','TH-1 Room, 201 E. Main Street, Mountain House, CA 95391','2026-11-13T12:00:00-08:00'::timestamptz,'2026-11-13T14:00:00-08:00'::timestamptz,'Seasonal celebrations',
'https://www.mountainhouseca.gov/Calendar.aspx?EID=2557','HIGH','approved','editorial_seasonal_2026',1.0,false,'approved'
where not exists(select 1 from public.events where source_url='https://www.mountainhouseca.gov/Calendar.aspx?EID=2557' and start_date='2026-11-13T12:00:00-08:00'::timestamptz);
