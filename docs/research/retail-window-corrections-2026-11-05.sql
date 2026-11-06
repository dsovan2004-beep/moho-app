begin;
with input(id,name,city,address,phone,website,category,description,tags,areas) as (values
('4507a087-e7f0-4ed3-aaf8-0be89cc977d3'::uuid,'Van''s Ace Hardware','Tracy','2695 N Tracy Blvd, Tracy, CA 95376','(209) 835-8286','https://www.acehardware.com/store-details/17414','Retail','Hardware and home improvement retail store. The official store page lists electrical, plumbing, tools, garden and paint departments. Confirm service offerings directly.',array['hardware','garden supplies','paint'],array['Tracy']),
('38eadae0-d02e-4f79-9911-95ea2c40f132'::uuid,'Harbor Freight Tools — Tracy #516','Tracy','3021 N Tracy Blvd, Tracy, CA 95376','(209) 839-8418','https://www.harborfreight.com/storelocator/3021-n-tracy-blvd-tracy-95376?number=516','Retail','Tool and hardware retail store. Store address and phone checked against the official location page; this is not a home-service contractor.',array['tools','hardware'],array['Tracy']),
('851964f2-ef0d-4765-a431-26581188f2a2'::uuid,'Budget Blinds of Livermore serving Tracy','Livermore','','(925) 371-1170','https://www.budgetblinds.com/livermore/who-we-are/','Home Services','Custom blinds, shades, shutters and drapes. The official Livermore franchise page lists Tracy in its service area. Consultations are by appointment; no Tracy storefront address was confirmed.',array['window treatments','blinds','shades','shutters'],array['Tracy'])
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
'Duplicate generic Tracy Ace Hardware entry; retain official-address canonical store 4507a087-e7f0-4ed3-aaf8-0be89cc977d3; IDs and references preserved',
'https://www.acehardware.com/store-details/17414'
from public.businesses where id='1a20d6fd-74dc-4f4d-8e8a-6daa6c514bf6' and status='approved' returning business_id
)
update public.businesses set status='pending_review',verified=false where id in(select business_id from logged);
commit;
select id,name,city,category,phone from public.businesses where id in('4507a087-e7f0-4ed3-aaf8-0be89cc977d3','38eadae0-d02e-4f79-9911-95ea2c40f132','851964f2-ef0d-4765-a431-26581188f2a2');
