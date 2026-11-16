begin;
do $refresh$ declare bid uuid; before_b jsonb; before_c jsonb; after_b jsonb; after_c jsonb; r record; begin
for r in select * from (values
('2f711b8f-eb24-4d6e-988a-20b946a2dbdb'::uuid,'https://www.artpetgrooming.com/locations/lathrop/','Fresh normal-browser check November15,2026: opened Dog Walking tab on BOTH official Lathrop and Manteca pages. Each advertises30/60minute walks; regional San Joaquin2095546445 link present. This resolves the earlier hold on dog-walking scope; no homepage-only inference. Mobile grooming retained. No additional cities, credentials, experience claims, quality, safety, appointment availability, holiday hours, prices, photos or reviews adopted. Sources:https://www.artpetgrooming.com/locations/lathrop/ https://www.artpetgrooming.com/locations/manteca/'),
('04cd7731-a334-4e5f-828f-570b7f5fd9a1'::uuid,'https://www.ithinkpet.com/central-valley-rates.html','Fresh normal-browser check November15,2026: current Central Valley page explicitly names all four cities, dog/cat sitting and30minute neighborhood dog walks; text5102741750. Travel fees for MH/Lathrop/Manteca and holiday surcharges advertised,2027price increase warning present. No fixed quote or Thanksgiving availability adopted. Cached search snapshot differs from live travel fee; live page used, ask provider for total. No images reused; site explicitly forbids photo sharing. Credentials/quality/safety unverified.'),
('d52dd83c-ca46-48ea-9064-5b651286f7bd'::uuid,'https://www.mantecacrittersitters.com/','Fresh normal-browser homepage check November15,2026: public2095391025, in-home drop-in pet care/midday walks and explicit Proudly Serving Manteca retained. No other city or boarding inferred. Licensing, insurance, bonding, medication capability, quality and safety not independently verified; no availability/holiday hours promised or images/reviews copied.'),
('bbe01a21-b1f4-4e0b-b07f-7d6468fc2a1e'::uuid,'https://www.growlsnmeows.com/','Fresh normal-browser homepage check November15,2026: public2098083236, in-home pet sitting, separate30/45/60minute dog walks and explicit MH/Tracy/Manteca locations retained. No Lathrop coverage or office inferred. Posted guidelines not a current quote; no credentials, medical capability, quality, safety, appointment or Thanksgiving availability established. No images or testimonials copied.')
) as v(id,url,note) loop
bid:=r.id;
select to_jsonb(b) into before_b from businesses b where id=bid and verified and status='approved' and claimed=false for update;
select to_jsonb(c) into before_c from listing_checks c where business_id=bid;
if before_b is null or before_c is null then raise exception 'Refresh precondition changed'; end if;
if bid='2f711b8f-eb24-4d6e-988a-20b946a2dbdb' then
update businesses set description='Official Lathrop and Manteca pages advertise mobile dog grooming plus 30- and 60-minute dog walks. The published San Joaquin contact is used here. Confirm your address, dog eligibility, walking arrangement, full quote and available dates directly. No public visitor office or holiday availability established.' where id=bid;
update listing_checks set service_tags=array['mobile dog grooming','dog grooming','dog walking'] where business_id=bid;
end if;
update listing_checks set checked_at=now(),source_url=r.url,scope_note=r.note where business_id=bid;
select to_jsonb(b) into after_b from businesses b where id=bid;
select to_jsonb(c) into after_c from listing_checks c where business_id=bid;
insert into directory_private.listing_corrections(business_id,previous_values,applied_values,reason,source_reference) values(bid,before_b||jsonb_build_object('listing_check',before_c),after_b||jsonb_build_object('listing_check',after_c),'Individual primary-source recheck; existing approval date preserved. Art Pet walking coverage added only after city-specific tabs inspected.',r.url);
end loop; end $refresh$;
do $held$ declare b record; begin
for b in select * from businesses where id in ('77f37ae1-8835-4d96-b716-fc17e4bd9636','d079cd2c-3c92-4216-b59a-8f7cd0959633','0b71e027-f385-4835-b241-64c56eb50046') loop
if b.verified then raise exception 'Hold changed'; end if;
insert into directory_private.listing_corrections(business_id,previous_values,applied_values,reason,source_reference) values(b.id,to_jsonb(b),to_jsonb(b),'November15 follow-up: hold remains. Official chain California city indexes do not establish these Lathrop store records; exact hospital/name/phone search establishes no current primary source. Absence is not closure/nonexistence proof. No restoration or public closure claim.','https://stores.petco.com/ca/ ; https://www.petsmart.com/stores/us/ca/ ; docs/research/pet-care-mobile-evening-2026-11-15.md');
end loop; end $held$;
commit;
