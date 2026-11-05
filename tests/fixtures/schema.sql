-- Isolated test fixture, generated from live column metadata. No customer rows.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create schema storage;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;
create function auth.role() returns text language sql stable as $$ select current_user::text; $$;
grant usage on schema auth to anon,authenticated;
grant execute on function auth.uid(), auth.role() to anon,authenticated;
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/'); $$;
create table public."business_images" (
  "id" uuid not null default gen_random_uuid() primary key,
  "business_id" uuid not null,
  "image_url" text not null,
  "alt_text" text,
  "position" integer not null default 0,
  "created_at" timestamp with time zone default now(),
  "source" text default 'unknown'::text,
  "source_reference" text,
  "verified" boolean default false);
alter table public."business_images" enable row level security;
grant all on public."business_images" to anon,authenticated,service_role;
create table public."business_suggestions" (
  "id" uuid not null default gen_random_uuid() primary key,
  "business_name" text not null,
  "category" text,
  "city" text not null,
  "address" text,
  "phone" text,
  "website" text,
  "notes" text,
  "submitter_name" text,
  "submitter_email" text,
  "status" text not null default 'pending'::text,
  "created_at" timestamp with time zone not null default now());
alter table public."business_suggestions" enable row level security;
grant all on public."business_suggestions" to anon,authenticated,service_role;
create table public."businesses" (
  "id" uuid not null default gen_random_uuid() primary key,
  "name" text not null,
  "category" text not null,
  "city" text not null,
  "address" text,
  "phone" text,
  "website" text,
  "email" text,
  "description" text,
  "hours" text,
  "rating" numeric(2,1) default 0.0,
  "review_count" integer default 0,
  "claimed" boolean default false,
  "verified" boolean default false,
  "featured" boolean default false,
  "status" text default 'active'::text,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  "contact_email" text,
  "source" text default 'manual'::text,
  "source_url" text,
  "last_ingested_at" timestamp with time zone,
  "confidence_score" numeric(4,3) default 0.0,
  "needs_review" boolean default false,
  "image_source" text,
  "google_place_id" text,
  "verification_source" text,
  "verified_at" timestamp with time zone);
alter table public."businesses" enable row level security;
grant all on public."businesses" to anon,authenticated,service_role;
create table public."city_status" (
  "city" text not null primary key,
  "status" text not null default 'pending'::text,
  "updated_at" timestamp with time zone not null default now());
alter table public."city_status" enable row level security;
grant all on public."city_status" to anon,authenticated,service_role;
create table public."community_posts" (
  "id" uuid not null default gen_random_uuid() primary key,
  "title" text not null,
  "content" text not null,
  "city" text not null,
  "category" text,
  "source_url" text,
  "confidence" text default 'LOW'::text,
  "status" text default 'pending'::text,
  "created_at" timestamp with time zone default now(),
  "user_id" uuid,
  "author_name" text not null default 'Anonymous'::text,
  "likes" integer default 0,
  "reply_count" integer default 0,
  "image_url" text);
alter table public."community_posts" enable row level security;
grant all on public."community_posts" to anon,authenticated,service_role;
create table public."community_replies" (
  "id" uuid not null default gen_random_uuid() primary key,
  "post_id" uuid not null,
  "user_id" uuid not null,
  "author_name" text not null,
  "content" text not null,
  "created_at" timestamp with time zone default now());
alter table public."community_replies" enable row level security;
grant all on public."community_replies" to anon,authenticated,service_role;
create table public."community_submissions" (
  "id" uuid not null default gen_random_uuid() primary key,
  "title" text not null,
  "description" text not null,
  "city" text not null,
  "submission_type" text not null,
  "event_date" timestamp with time zone,
  "image_url" text,
  "contact_url" text,
  "source" text not null default 'community'::text,
  "confidence_score" numeric not null default 0.8,
  "needs_review" boolean not null default true,
  "submitted_at" timestamp with time zone not null default now(),
  "created_at" timestamp with time zone not null default now(),
  "source_file" text,
  "raw_text" text,
  "ocr_confidence" numeric);
alter table public."community_submissions" enable row level security;
grant all on public."community_submissions" to anon,authenticated,service_role;
create table public."events" (
  "id" uuid not null default gen_random_uuid() primary key,
  "title" text not null,
  "description" text,
  "city" text not null,
  "location" text,
  "start_date" timestamp with time zone not null,
  "end_date" timestamp with time zone,
  "category" text,
  "source_url" text,
  "confidence" text default 'LOW'::text,
  "status" text default 'pending'::text,
  "created_at" timestamp with time zone default now(),
  "source" text default 'manual'::text,
  "last_ingested_at" timestamp with time zone,
  "confidence_score" numeric(4,3) default 0.0,
  "needs_review" boolean default false,
  "image_source" text,
  "ingestion_status" text default 'approved'::text,
  "image_url" text);
alter table public."events" enable row level security;
grant all on public."events" to anon,authenticated,service_role;
create table public."listing_reports" (
  "id" uuid not null default gen_random_uuid() primary key,
  "business_id" uuid,
  "business_name" text,
  "reason" text not null,
  "details" text,
  "reporter_email" text,
  "status" text not null default 'pending'::text,
  "created_at" timestamp with time zone not null default now());
alter table public."listing_reports" enable row level security;
grant all on public."listing_reports" to anon,authenticated,service_role;
create table public."lost_and_found" (
  "id" uuid not null default gen_random_uuid() primary key,
  "type" text not null,
  "pet_name" text,
  "pet_type" text,
  "description" text not null,
  "city" text not null,
  "location_last_seen" text,
  "contact_name" text,
  "contact_phone" text,
  "contact_email" text,
  "status" text default 'active'::text,
  "image_url" text,
  "created_at" timestamp with time zone default now(),
  "breed" text,
  "age" text,
  "gender" text,
  "last_seen" text,
  "location_detail" text,
  "coat_description" text,
  "reward" text,
  "title" text,
  "source" text default 'manual'::text,
  "source_url" text,
  "last_ingested_at" timestamp with time zone,
  "confidence_score" numeric(4,3) default 0.0,
  "needs_review" boolean default false,
  "image_source" text,
  "ingestion_status" text default 'active'::text);
alter table public."lost_and_found" enable row level security;
grant all on public."lost_and_found" to anon,authenticated,service_role;
create table public."members" (
  "id" uuid not null default gen_random_uuid() primary key,
  "email" text not null,
  "name" text,
  "city" text,
  "role" text default 'resident'::text,
  "created_at" timestamp with time zone default now());
alter table public."members" enable row level security;
grant all on public."members" to anon,authenticated,service_role;
create table public."post_reactions" (
  "id" uuid not null default gen_random_uuid() primary key,
  "post_id" uuid not null,
  "reaction_type" text not null,
  "user_id" uuid,
  "ip_hash" text not null,
  "created_at" timestamp with time zone default now());
alter table public."post_reactions" enable row level security;
grant all on public."post_reactions" to anon,authenticated,service_role;
create table public."reviews" (
  "id" uuid not null default gen_random_uuid() primary key,
  "business_id" uuid not null,
  "user_id" uuid not null,
  "rating" integer not null,
  "comment" text,
  "reviewer_name" text,
  "created_at" timestamp with time zone default now());
alter table public."reviews" enable row level security;
grant all on public."reviews" to anon,authenticated,service_role;
create view public.pending_review as select id::text as id from public.businesses where needs_review=true;
grant all on public.pending_review to anon,authenticated;
