begin;
create table public.listing_checks (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  checked_at timestamptz not null default now(),
  source_url text not null check (source_url ~ '^https://'),
  checked_fields text[] not null,
  service_areas text[] not null default '{}',
  service_tags text[] not null default '{}',
  scope_note text not null
);
alter table public.listing_checks enable row level security;
revoke all on public.listing_checks from public,anon,authenticated;
grant select on public.listing_checks to anon,authenticated;
create policy published_listing_checks on public.listing_checks for select to anon,authenticated
using (exists(select 1 from public.businesses b where b.id=business_id and b.status='approved' and b.verified=true));
create table directory_private.listing_corrections (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id),
  previous_values jsonb not null,
  applied_values jsonb not null,
  reason text not null,
  source_reference text not null,
  checked_at timestamptz not null default now()
);
alter table directory_private.listing_corrections enable row level security;
revoke all on directory_private.listing_corrections from public,anon,authenticated;
notify pgrst,'reload schema';
commit;
