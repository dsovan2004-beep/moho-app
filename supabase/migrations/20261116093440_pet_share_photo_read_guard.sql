begin;
create function directory_private.can_read_pet_share_photo(path text) returns boolean language sql stable security definer set search_path='' as $$
select (auth.uid() is not null and split_part(path,'/',1)=auth.uid()::text) or directory_private.is_admin() or directory_private.published_pet_photo(path);$$;
revoke all on function directory_private.can_read_pet_share_photo(text) from public;
grant execute on function directory_private.can_read_pet_share_photo(text) to anon,authenticated;
drop policy pet_share_photo_read on storage.objects;
create policy pet_share_photo_read on storage.objects for select to anon,authenticated using(bucket_id='pet-share-pending' and directory_private.can_read_pet_share_photo(name));
commit;
