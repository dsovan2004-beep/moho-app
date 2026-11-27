-- November27 scheduled refresh. Retire expired dated copy; no reopening/hours claim.
begin;
do $correct$ declare bid uuid:='355f10cc-4c5f-4712-817d-8a74b27db18b'; old_b jsonb; old_c jsonb; new_b jsonb; new_c jsonb; begin
select to_jsonb(b) into old_b from businesses b where id=bid and name='Sam’s Club Lathrop #7684' and status='approved' and verified and claimed=false and description like '%closed Thursday, November 26, 2026%' for update;
select to_jsonb(c) into old_c from listing_checks c where business_id=bid and service_areas=array['Lathrop'] for update;
if old_b is null or old_c is null then raise exception 'Club record changed; review required';end if;
update businesses set description='Membership warehouse club at 16150 Golden Valley Parkway in Lathrop. Contact the club or use its official page for current shopping hours, membership requirements, inventory and pickup arrangements. Fuel, pharmacy and other departments have separate hours. This check establishes the physical Lathrop club; delivery coverage and current department availability are not confirmed.' where id=bid;
update listing_checks set checked_at=now(),checked_fields=array['identity','club number','public phone','physical address','warehouse retail services','expired dated notice removed'],scope_note='Official club page freshHTTP200 November27,2026 confirms club7684,16150GoldenValleyParkway,2093900324 and membership warehouse retail. Retired the expired November26 closure from current public description; prior wording and source retained in private correction history. This is not a reopening or current-hours/department-availability confirmation. Lathrop facility only; no delivery coverage or other-city service inferred. No promotion, rating, inventory, quality or photo adopted.' where business_id=bid;
select to_jsonb(b) into new_b from businesses b where id=bid;
select to_jsonb(c) into new_c from listing_checks c where business_id=bid;
insert into directory_private.listing_corrections(business_id,previous_values,applied_values,reason,source_reference)values(bid,old_b||jsonb_build_object('listing_check',old_c),new_b||jsonb_build_object('listing_check',new_c),'Scheduled post-holiday freshness: retire expired November26 club closure notice; preserve approval timestamp and private history','https://www.samsclub.com/club/7684-lathrop-ca');
end $correct$;
commit;
