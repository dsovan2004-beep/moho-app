import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'

// This harness only connects to the disposable local cluster on this fixed port.
const args = ['-h', '127.0.0.1', '-p', '55439', '-d', 'moho_security_test', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1']
const sql = (query: string) => execFileSync('psql', args, { input: query, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
const admin = '00000000-0000-4000-8000-000000000001'
const alice = '00000000-0000-4000-8000-000000000002'
const bob = '00000000-0000-4000-8000-000000000003'
const unconfirmed = '00000000-0000-4000-8000-000000000004'
const business = '00000000-0000-4000-8000-000000000010'
const as = (user: string) => `set local role authenticated; set local request.jwt.claim.sub='${user}';`
const submission = JSON.stringify({ name: 'Fixture Plumbing', category: 'Home Services', city: 'Tracy', description: 'Local plumbing repairs', phone: '2095550100' })
const claim = JSON.stringify({ owner_name: 'Alice Test', owner_phone: '2095550100', role: 'Owner' })
const create = (kind = 'submission', key = '00000000-0000-4000-8000-000000000020', payload = submission) =>
  `public.create_business_request('${kind}',${kind === 'claim' ? `'${business}'` : 'null'},'${payload}'::jsonb,'${key}')`

test('setup isolated fixture and apply the exact production migration', () => {
  execFileSync('dropdb', ['-h', '127.0.0.1', '-p', '55439', '--if-exists', 'moho_security_test'])
  execFileSync('createdb', ['-h', '127.0.0.1', '-p', '55439', 'moho_security_test'])
  // Roles persist cluster-wide when the database is recreated.
  const schema = readFileSync('tests/fixtures/schema.sql', 'utf8').replace(/create role ([^;]+);/g,
    (_match, definition) => `do $$ begin create role ${definition}; exception when duplicate_object then null; end $$;`)
  sql(schema)
  sql(readFileSync('sql/add_post_reactions.sql', 'utf8'))
  sql('create extension pg_trgm; create index fixture_business_trgm on public.businesses using gin(name gin_trgm_ops);')
  sql(`insert into auth.users values ('${admin}','dsovan2004@gmail.com',now()),('${alice}','alice@example.test',now()),('${bob}','bob@example.test',now()),('${unconfirmed}','unconfirmed@example.test',null);`)
  for (const migration of readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort()) {
    sql(readFileSync(`supabase/migrations/${migration}`, 'utf8'))
  }
  sql(`insert into public.businesses(id,name,city,category,description,status,verified,claimed,contact_email) values
    ('${business}','Fixture Public','Tracy','Home Services','Fixture description','approved',true,false,'private@example.test'),
    ('00000000-0000-4000-8000-000000000011','Fixture Pending','Tracy','Home Services','Fixture description','pending',false,false,'private@example.test');`)
})

test('anonymous reads see only approved verified rows; private columns are denied', () => {
  assert.equal(sql('begin; set local role anon; select count(id) from public.businesses; rollback;'), '1')
  assert.throws(() => sql('begin; set local role anon; select contact_email from public.businesses; rollback;'), /permission denied/)
  assert.throws(() => sql('begin; set local role anon; select * from public.pending_review; rollback;'), /permission denied/)
  assert.throws(() => sql('begin; set local role anon; select * from public.community_submissions; rollback;'), /permission denied/)
})

test('authenticated users cannot edit arbitrary businesses, images, cities, staging or self-publish', () => {
  const result = sql(`begin; ${as(alice)} update public.businesses set claimed=true,verified=true;
    update public.city_status set status='verified'; delete from public.business_images;
    reset role; select claimed from public.businesses where id='${business}'; rollback;`)
  assert.equal(result, 'f')
  assert.throws(() => sql(`begin; ${as(alice)} insert into public.businesses(name,status,verified) values('Injected','approved',true); rollback;`), /row-level security/)
  assert.throws(() => sql(`begin; ${as(alice)} insert into public.community_submissions(title,description,city,submission_type) values('Injected','Injected description','Tracy','event'); rollback;`), /row-level security/)
  assert.throws(() => sql(`begin; ${as(alice)} insert into public.business_images(business_id,image_url,verified) values('${business}','https://example.test/image.jpg',true); rollback;`), /row-level security/)
})

test('a saved submission is pending, private, requester-bound and idempotent', () => {
  const result = sql(`begin; ${as(alice)} select ${create()}; select ${create()};
    select count(*)||':'||min(status)||':'||min(payload->>'contact_email') from public.business_requests;
    ${as(bob)} select count(*) from public.business_requests;
    reset role; select count(*) from public.businesses; rollback;`).split('\n')
  assert.equal(result[0], result[1])
  assert.equal(result[2], '1:pending:alice@example.test')
  assert.equal(result[3], '0')
  assert.equal(result[4], '2')
})

test('direct request inserts and status updates are denied', () => {
  assert.throws(() => sql(`begin; ${as(alice)} insert into public.business_requests(user_id,request_key,kind,payload,status)
    values('${alice}',gen_random_uuid(),'submission','{}','approved'); rollback;`), /permission denied/)
  assert.throws(() => sql(`begin; ${as(alice)} update public.business_requests set status='approved'; rollback;`), /permission denied/)
})

test('anonymous/unconfirmed users and forged publication fields cannot create requests', () => {
  assert.throws(() => sql(`begin; set local role anon; select ${create()}; rollback;`), /permission denied/)
  assert.throws(() => sql(`begin; ${as(unconfirmed)} select ${create()}; rollback;`), /Confirmed sign-in required/)
  assert.throws(() => sql(`begin; ${as(alice)} select ${create('submission', undefined, submission.replace('Local plumbing repairs', 'Local plumbing repairs').replace('"phone"', '"verified":"true","phone"'))}; rollback;`), /Supply a valid business/)
})

test('persistent per-user limit blocks the sixth distinct request', () => {
  assert.throws(() => sql(`begin; ${as(alice)}
    select public.create_business_request('submission',null,'${submission}'::jsonb,gen_random_uuid()) from generate_series(1,6); rollback;`), /Daily request limit/)
})

test('a claim stays unclaimed until authorized review atomically assigns its owner', () => {
  const result = sql(`begin; ${as(alice)} select ${create('claim', undefined, claim)} as request_id \\gset
    select claimed from public.businesses where id='${business}';
    ${as(admin)} select public.review_business_request(:'request_id','approve','Called listed business and independently verified requester control','https://example.test/business');
    ${as(alice)} select user_id::text from public.business_owners where business_id='${business}';
    select status from public.business_requests where id=:'request_id';
    select claimed from public.businesses where id='${business}'; rollback;`).split('\n')
  assert.equal(result[0], 'f'); assert.equal(result[2], alice); assert.equal(result[3], 'approved'); assert.equal(result[4], 't')
})

test('non-admin moderation, missing evidence and racing ownership assignments are rejected', () => {
  assert.throws(() => sql(`begin; ${as(alice)} select ${create('claim', undefined, claim)} as rid \\gset
    select public.review_business_request(:'rid','approve','Pretending to be the moderator','https://example.test'); rollback;`), /Admin required/)
  assert.throws(() => sql(`begin; ${as(alice)} select ${create()} as rid \\gset
    ${as(admin)} select public.review_business_request(:'rid','approve','Checked the official business website',null); rollback;`), /evidence URL/)
  assert.throws(() => sql(`begin; ${as(alice)} select ${create('claim', undefined, claim)} as a \\gset
    ${as(bob)} select ${create('claim', '00000000-0000-4000-8000-000000000021', claim)} as b \\gset
    ${as(admin)} select public.review_business_request(:'a','approve','Verified first owner independently','https://example.test');
    select public.review_business_request(:'b','approve','Verified competing claim independently','https://example.test'); rollback;`), /already claimed/)
})

test('submission approval publishes with dated evidence; rejection does not publish', () => {
  const result = sql(`begin; ${as(alice)} select ${create()} as rid \\gset
    ${as(admin)} select public.review_business_request(:'rid','approve','Checked official contact and service details','https://example.test/business');
    set local role anon; select status||':'||verified::text||':'||(verified_at is not null)::text from public.businesses where name='Fixture Plumbing'; rollback;`).split('\n')
  assert.equal(result[1], 'approved:true:true')
  const rejected = sql(`begin; ${as(alice)} select ${create()} as rid \\gset
    ${as(admin)} select public.review_business_request(:'rid','reject','Could not establish the business identity',null);
    reset role; select count(*) from public.businesses; rollback;`).split('\n')
  assert.equal(rejected[1], '2')
})

test('admin full projection is denied to residents; legacy moderation needs evidence', () => {
  assert.throws(() => sql(`begin; ${as(alice)} select * from public.admin_businesses(); rollback;`), /Admin required/)
  assert.equal(sql(`begin; ${as(admin)} select count(*) from public.admin_businesses(); rollback;`), '2')
  assert.throws(() => sql(`begin; ${as(admin)} select public.review_existing_business('${business}','approve','Checked all the business details',null); rollback;`), /evidence URL/)
})

test('confirmed community intake stays private/pending and is rate-limited at the database', () => {
  const signal = JSON.stringify({ title: 'Fixture community event', description: 'Fixture local community gathering', city: 'Tracy', submission_type: 'event', needs_review: false })
  const result = sql(`begin; ${as(alice)} select public.create_community_signal('${signal}'::jsonb);
    select count(*) from public.community_submissions; reset role;
    select needs_review::text||':'||submitted_by::text from public.community_submissions; rollback;`).split('\n')
  assert.equal(result[1], '0')
  assert.equal(result[2], `true:${alice}`)
  assert.throws(() => sql(`begin; ${as(alice)} select public.create_community_signal('${signal}'::jsonb) from generate_series(1,11); rollback;`), /Daily submission limit/)
})

test('anonymous and unconfirmed community intake is denied, unsafe links are rejected', () => {
  const signal = JSON.stringify({ title: 'Fixture signal', description: 'Fixture description', city: 'Tracy', submission_type: 'community_tip', contact_url: 'javascript:alert(1)' })
  assert.throws(() => sql(`begin; set local role anon; select public.create_community_signal('${signal}'::jsonb); rollback;`), /permission denied/)
  assert.throws(() => sql(`begin; ${as(unconfirmed)} select public.create_community_signal('${signal}'::jsonb); rollback;`), /Confirmed sign-in/)
  assert.throws(() => sql(`begin; ${as(alice)} select public.create_community_signal('${signal}'::jsonb); rollback;`), /Invalid public URL/)
})

test('review aggregate updates still work without granting arbitrary business updates', () => {
  const result = sql(`begin; create policy fixture_review_insert on public.reviews for insert to authenticated with check (user_id=auth.uid());
    ${as(alice)} insert into public.reviews(business_id,user_id,rating,comment,reviewer_name) values('${business}','${alice}',4,'Fixture local review','Fixture Alice');
    select rating::text||':'||review_count::text from public.businesses where id='${business}'; rollback;`)
  assert.equal(result, '4.0:1')
})

const publicPost = '00000000-0000-4000-8000-000000000030'
const pendingPost = '00000000-0000-4000-8000-000000000031'
const seedPosts = `insert into public.community_posts(id,title,content,city,category,status,user_id,author_name) values
  ('${publicPost}','Fixture published post','Fixture content','Tracy','General','approved','${alice}','Fixture Alice'),
  ('${pendingPost}','Fixture pending post','Fixture pending content','Tracy','General','pending','${alice}','Fixture Alice');`

test('pending community content is private; account holders cannot self-publish', () => {
  assert.equal(sql(`begin; ${seedPosts} set local role anon; select count(*) from public.community_posts; rollback;`), '1')
  assert.throws(() => sql(`begin; ${as(alice)} insert into public.community_posts(title,content,city,category,status,user_id,author_name)
    values('Forged','Forged content','Tracy','General','approved','${alice}','Fixture Alice'); rollback;`), /row-level security/)
})

test('account reactions derive identity, isolate users and expose only public counts', () => {
  const result = sql(`begin; ${seedPosts} ${as(alice)} select public.toggle_account_reaction('${publicPost}','helpful')->>'action';
    ${as(bob)} select public.my_reaction_state('${publicPost}')->'myReactions';
    select public.toggle_account_reaction('${publicPost}','helpful')->'counts'->>'helpful';
    ${as(alice)} select public.toggle_account_reaction('${publicPost}','helpful')->>'action';
    reset role; select user_id from public.post_reactions where post_id='${publicPost}';
    set local role anon; select count from public.reaction_counts where post_id='${publicPost}'; rollback;`).split('\n')
  assert.deepEqual(result, ['added','[]','2','removed',bob,'1'])
  assert.throws(() => sql(`begin; set local role anon; select ip_hash from public.post_reactions; rollback;`), /permission denied/)
  assert.throws(() => sql(`begin; ${as(bob)} select user_id from public.post_reactions; rollback;`), /permission denied/)
})

test('anonymous legacy reaction RPCs, direct inserts, unconfirmed users and pending posts are denied', () => {
  assert.throws(() => sql(`begin; set local role anon; select public.toggle_reaction('${publicPost}','helpful','forged','${alice}'); rollback;`), /permission denied/)
  assert.throws(() => sql(`begin; ${as(alice)} insert into public.post_reactions(post_id,reaction_type,user_id,ip_hash) values('${publicPost}','helpful','${bob}','forged'); rollback;`), /permission denied/)
  assert.throws(() => sql(`begin; ${as(unconfirmed)} select public.toggle_account_reaction('${publicPost}','helpful'); rollback;`), /Confirmed sign-in/)
  assert.throws(() => sql(`begin; ${seedPosts} ${as(alice)} select public.toggle_account_reaction('${pendingPost}','helpful'); rollback;`), /Published post not found/)
})

test('the persistent reaction budget stops the 61st change within an hour', () => {
  assert.throws(() => sql(`begin; ${seedPosts} ${as(alice)} select public.toggle_account_reaction('${publicPost}','helpful') from generate_series(1,61); rollback;`), /Reaction rate limit/)
})

test('relocating pg_trgm preserves index-backed public filtering and similarity access', () => {
  assert.equal(sql(`begin; set local role anon; select extensions.similarity('tracy','tracy');
    select count(id) from public.businesses where name ilike '%fixture%'; rollback;`), '1\n1')
})

test('listing evidence follows public listing visibility; raw corrections and evidence writes remain private', () => {
  const pending = '00000000-0000-4000-8000-000000000011'
  const result = sql(`begin; insert into public.listing_checks(business_id,source_url,checked_fields,scope_note)
    values('${business}','https://example.test',array['website'],'Desk check only'),('${pending}','https://example.test',array['website'],'Pending');
    set local role anon; select count(*) from public.listing_checks; rollback;`)
  assert.equal(result, '1')
  assert.throws(() => sql(`begin; ${as(alice)} insert into public.listing_checks(business_id,source_url,checked_fields,scope_note) values('${business}','https://example.test','{}','Forged'); rollback;`), /permission denied/)
  assert.throws(() => sql(`begin; ${as(alice)} select * from directory_private.listing_corrections; rollback;`), /permission denied/)
})

test('legacy suggestion, correction and pet endpoints cannot bypass the moderated intake quota', () => {
  assert.throws(() => sql(`begin; set local role anon; insert into public.business_suggestions(business_name,city,status) values('Injected','Tracy','approved'); rollback;`), /permission denied/)
  assert.throws(() => sql(`begin; set local role anon; insert into public.listing_reports(reason,status) values('Injected','approved'); rollback;`), /permission denied/)
  assert.throws(() => sql(`begin; ${as(alice)} insert into public.lost_and_found(type,description,city,status) values('pet','Injected','Tracy','reunited'); rollback;`), /permission denied/)
})

test('pet intake preserves reported status privately and rejects forged status values', () => {
  const payload=JSON.stringify({title:'Fixture found dog',description:'Fixture report',city:'Tracy',submission_type:'lost_pet',pet_status:'found'})
  const result=sql(`begin; ${as(alice)} select public.create_community_signal('${payload}'::jsonb); reset role;
    select pet_status||':'||needs_review from public.community_submissions where submitted_by='${alice}'; rollback;`).split('\n')
  assert.match(result[0], /^[0-9a-f-]{36}$/)
  assert.equal(result[1], 'found:true')
  assert.throws(()=>sql(`begin; ${as(alice)} select public.create_community_signal('${payload.replace('"pet_status":"found"','"pet_status":"approved"')}'::jsonb); rollback;`), /Invalid pet report status/)
})

test('public pet reads hide archived and unmoderated records', () => {
  const result=sql(`begin; insert into public.lost_and_found(type,description,city,status,needs_review) values
    ('pet','Published fixture','Tracy','found',false),('pet','Archived fixture','Tracy','archived',false),('pet','Pending fixture','Tracy','lost',true);
    set local role anon; select count(*) from public.lost_and_found; rollback;`)
  assert.equal(result,'1')
})

test('reply and review reads inherit parent publication; unconfirmed and cross-parent writes are denied', () => {
 const published=publicPost,pending=pendingPost
 const result=sql(`begin; ${seedPosts}
 insert into public.community_replies(post_id,user_id,author_name,content) values('${published}','${alice}','Alice','Public'),('${pending}','${alice}','Alice','Private');
 insert into public.reviews(business_id,user_id,rating) values('${business}','${alice}',5),('00000000-0000-4000-8000-000000000011','${alice}',5);
 set local role anon; select count(*) from public.community_replies; select count(*) from public.reviews; rollback;`).split('\n')
 assert.deepEqual(result,['1','1'])
 assert.throws(()=>sql(`begin; ${seedPosts} ${as(alice)} insert into public.community_replies(post_id,user_id,author_name,content) values('${pending}','${alice}','Alice','Injected'); rollback;`),/row-level security/)
 assert.throws(()=>sql(`begin; ${as(unconfirmed)} insert into public.reviews(business_id,user_id,rating) values('${business}','${unconfirmed}',5); rollback;`),/Confirmed account required/)
})

test('direct account contributions use a persistent server-timestamped quota', () => {
 assert.throws(()=>sql(`begin; insert into directory_private.contribution_events(user_id) select '${bob}' from generate_series(1,60);
 ${as(bob)} insert into public.community_posts(user_id,title,content,city,category,status) values('${bob}','Fixture post','Fixture content','Tracy','General','pending'); rollback;`),/Daily contribution limit reached/)
 assert.throws(()=>sql(`begin; ${as(alice)} select * from directory_private.contribution_events; rollback;`),/permission denied/)
})
