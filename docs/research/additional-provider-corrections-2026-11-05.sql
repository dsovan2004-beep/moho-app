begin;
with input(id,name,city,address,phone,website,category,description,tags,areas) as (values
('c0d491e5-8ee1-4966-b90f-2e2fda3c61c9'::uuid,'The Home Depot — Tracy #1020','Tracy','2461 Naglee Rd, Tracy, CA 95304','(209) 834-8975','https://www.homedepot.com/l/Tracy/CA/Tracy/95304/1020','Retail','Home improvement store with hardware, garden supplies and tool rentals. This is a retail store; confirm installation services and contractor arrangements separately.',array['hardware','tool rental','garden supplies'],array['Tracy']),
('203ec58d-0738-4ca4-a31d-1a5bb2749ba6'::uuid,'TWO MEN AND A TRUCK — Stockton serving Tracy','Stockton','2453 Grand Canal Blvd #231, Stockton, CA 95207','(209) 222-4884','https://twomenandatruck.com/movers/ca/tracy','Home Services','Moving, packing and junk removal advertised for Tracy and Mountain House. The official Tracy service page lists the Stockton office. Confirm your address, pricing and availability directly.',array['moving','packing','junk removal'],array['Tracy','Mountain House'])
), logged as (
insert into directory_private.listing_corrections(business_id,previous_values,applied_values,reason,source_reference)
select b.id,jsonb_build_object('name',b.name,'city',b.city,'address',b.address,'phone',b.phone,'website',b.website,'category',b.category,'description',b.description,'rating',b.rating,'review_count',b.review_count,'verified_at',b.verified_at,'verification_source',b.verification_source),
jsonb_build_object('name',i.name,'city',i.city,'address',i.address,'phone',i.phone,'website',i.website,'category',i.category,'description',i.description,'rating',null,'review_count',0),
'Official website desk check: corrected outdated location/contact and scope; no quality, license, owner or availability verification',i.website
from public.businesses b join input i on b.id=i.id returning business_id
), changed as (
update public.businesses b set name=i.name,city=i.city,address=i.address,phone=i.phone,website=i.website,category=i.category,description=i.description,rating=null,review_count=0,verified_at=now(),verification_source='first_party_website_desk_check'
from input i join logged l on l.business_id=i.id where b.id=i.id returning b.id
)
insert into public.listing_checks(business_id,source_url,checked_fields,service_areas,service_tags,scope_note)
select id,website,array['identity','public phone','website','location','advertised services','advertised service area'],areas,tags,
'Official website desk check only. No phone call, owner confirmation, license or insurance verification, availability check or quality endorsement. Store and office locations are distinguished from advertised service areas.'
from input where id in(select id from changed)
on conflict(business_id) do update set checked_at=now(),source_url=excluded.source_url,checked_fields=excluded.checked_fields,service_areas=excluded.service_areas,service_tags=excluded.service_tags,scope_note=excluded.scope_note;
with logged as (
insert into directory_private.listing_corrections(business_id,previous_values,applied_values,reason,source_reference)
select id,jsonb_build_object('status',status,'verified',verified),jsonb_build_object('status','pending_review','verified',false),
'Duplicate generic Tracy Home Depot entry; retain corrected canonical store c0d491e5-8ee1-4966-b90f-2e2fda3c61c9; IDs and references preserved',
'https://www.homedepot.com/l/Tracy/CA/Tracy/95304/1020'
from public.businesses where id='0424631c-a91c-4b81-9a94-013e58b8e6e1' and status='approved' returning business_id
)
update public.businesses set status='pending_review',verified=false where id in(select business_id from logged);
commit;
select id,name,city,category,phone from public.businesses where id in('c0d491e5-8ee1-4966-b90f-2e2fda3c61c9','203ec58d-0738-4ca4-a31d-1a5bb2749ba6');
