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

const pet='00000000-0000-4000-8000-000000000060'
const social=(action:string,payload:Record<string,unknown>)=>`public.pet_social_action('${action}','${JSON.stringify(payload)}'::jsonb)`
const petFixture=()=>`insert into public.lost_and_found(id,type,title,description,city,status,reporter_id) values('${pet}','pet','Fixture pet','Local test only','Tracy','lost','${alice}');`
test('pet report identity/email are private, comments stay on published parents and cannot forge authors',()=>{
 assert.throws(()=>sql(`begin;set local role anon;select reporter_id from public.lost_and_found;rollback;`),/permission denied/)
 assert.throws(()=>sql(`begin;set local role anon;select contact_email from public.lost_and_found;rollback;`),/permission denied/)
 assert.throws(()=>sql(`begin;set local role anon;select ${social('comment',{pet_id:pet,body:'A sighting',display_name:'Neighbor'})};rollback;`),/permission denied/)
 assert.throws(()=>sql(`begin;${petFixture()}${as(unconfirmed)}select ${social('comment',{pet_id:pet,body:'A sighting',display_name:'Neighbor'})};rollback;`),/Confirmed sign-in/)
 const result=sql(`begin;${petFixture()}${as(bob)}select ${social('comment',{pet_id:pet,body:'A sighting',display_name:'Neighbor',user_id:alice})};reset role;select user_id from public.pet_comments where pet_id='${pet}';set local role anon;select count(id) from public.pet_comments;reset role;update public.lost_and_found set needs_review=true where id='${pet}';set local role anon;select count(id) from public.pet_comments;rollback;`).split('\n')
 assert.equal(result[1],bob);assert.equal(result[2],'1');assert.equal(result[3],'0')
 assert.throws(()=>sql(`begin;${as(bob)}insert into public.pet_comments(pet_id,user_id,display_name,body) values('${pet}','${alice}','Fake','Forged');rollback;`),/permission denied/)
})
test('private messages are participant-only, including administrator isolation and cross-account denial',()=>{
 const result=sql(`begin;${petFixture()}${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'Private sighting'})}->>'conversation_id' as chat \\gset
 select count(*) from public.pet_messages;${as(alice)}select count(*) from public.pet_messages;${as(admin)}select count(*) from public.pet_messages;select count(*) from public.pet_conversations;rollback;`).split('\n')
 assert.deepEqual(result,['1','1','0','0'])
 assert.throws(()=>sql(`begin;${petFixture()}${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'Private sighting'})}->>'conversation_id' as chat \\gset
 ${as(admin)}select public.pet_social_action('message',jsonb_build_object('conversation_id',:'chat','body','Intrusion'));rollback;`),/Conversation unavailable/)
})
test('recipient blocks prevent delivery in both directions and only blocker can remove their block',()=>{
 assert.throws(()=>sql(`begin;${petFixture()}${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'Private sighting'})}->>'conversation_id' as chat \\gset
 ${as(alice)}select public.pet_social_action('block',jsonb_build_object('conversation_id',:'chat','blocked',true));${as(bob)}select public.pet_social_action('block',jsonb_build_object('conversation_id',:'chat','blocked',false));select public.pet_social_action('message',jsonb_build_object('conversation_id',:'chat','body','Blocked delivery'));rollback;`),/Messaging unavailable/)
})
test('DM recipients are resolved from the report/comment, not an arbitrary supplied account',()=>{
 assert.throws(()=>sql(`begin;${petFixture()}${as(alice)}select ${social('start_chat',{pet_id:pet,display_name:'Alice',body:'Self message',recipient_id:bob})};rollback;`),/Recipient unavailable/)
 const result=sql(`begin;${petFixture()}${as(bob)}select ${social('comment',{pet_id:pet,body:'Found near park',display_name:'Bob'})}->>'id' as comment \\gset
 ${as(alice)}select public.pet_social_action('start_chat',jsonb_build_object('pet_id','${pet}','comment_id',:'comment','display_name','Alice','body','Thanks for the sighting'));select count(*) from public.pet_messages;rollback;`).split('\n')
 assert.equal(result.at(-1),'1')
})
test('reported DM content reaches moderators without exposing the rest of the conversation',()=>{
 const result=sql(`begin;${petFixture()}${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'Reported message'})};select id as message from public.pet_messages limit 1 \\gset
 ${as(alice)}select public.pet_social_action('report_message',jsonb_build_object('id',:'message','reason','Unwanted message'));
 ${as(admin)}select public.pet_social_action('moderation_queue','{}')->0->>'evidence';select count(*) from public.pet_messages;rollback;`).split('\n')
 assert.equal(result.at(-2),'Reported message');assert.equal(result.at(-1),'0')
 assert.throws(()=>sql(`begin;${as(bob)}select ${social('moderation_queue',{})};rollback;`),/Administrator required/)
})
test('pet comments enforce a durable daily quota and owner hiding does not delete audit context',()=>{
 assert.throws(()=>sql(`begin;${petFixture()}${as(bob)}select public.pet_social_action('comment',jsonb_build_object('pet_id','${pet}','display_name','Bob','body','Sighting '||n)) from generate_series(1,21)n;rollback;`),/Daily activity limit/)
 const result=sql(`begin;${petFixture()}${as(bob)}select ${social('comment',{pet_id:pet,display_name:'Bob',body:'Old sighting'})}->>'id' as comment \\gset
 select public.pet_social_action('hide_own_comment',jsonb_build_object('id',:'comment'));set local role anon;select count(id) from public.pet_comments;reset role;select count(*) from public.pet_comments where hidden;rollback;`).split('\n')
 assert.equal(result.at(-2),'0');assert.equal(result.at(-1),'1')
})
test('DM message and new-conversation budgets persist across calls',()=>{
 assert.throws(()=>sql(`begin;${petFixture()}${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'First message'})}->>'conversation_id' as chat \\gset
 select public.pet_social_action('message',jsonb_build_object('conversation_id',:'chat','body','Message '||n)) from generate_series(1,60)n;rollback;`),/Daily activity limit/)
 assert.throws(()=>sql(`begin;insert into public.lost_and_found(type,title,description,city,status,reporter_id) select 'pet','Fixture '||n,'Local test only','Tracy','lost','${alice}'::uuid from generate_series(1,6)n;${as(bob)}select public.pet_social_action('start_chat',jsonb_build_object('pet_id',id,'display_name','Bob','body','Useful sighting')) from public.lost_and_found;rollback;`),/Daily activity limit/)
})
test('hidden or pending reports cannot start public comments or new DMs',()=>{
 assert.throws(()=>sql(`begin;${petFixture()}update public.lost_and_found set needs_review=true where id='${pet}';${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'Private sighting'})};rollback;`),/Report unavailable/)
 assert.throws(()=>sql(`begin;${petFixture()}update public.lost_and_found set ingestion_status='archived' where id='${pet}';${as(bob)}select ${social('comment',{pet_id:pet,display_name:'Bob',body:'A sighting'})};rollback;`),/Report unavailable/)
})


test('pet moderation hides only reported public comments and context returns only caller ownership',()=>{
 const result=sql(`begin;${petFixture()}${as(bob)}select ${social('comment',{pet_id:pet,display_name:'Bob',body:'Reported public comment'})}->>'id' as comment \\gset
 select jsonb_array_length(public.pet_social_action('context',jsonb_build_object('pet_id','${pet}'))->'own_comment_ids');
 ${as(alice)}select jsonb_array_length(public.pet_social_action('context',jsonb_build_object('pet_id','${pet}'))->'own_comment_ids');
 select public.pet_social_action('report_comment',jsonb_build_object('id',:'comment','reason','Inappropriate public comment'));
 ${as(admin)}select public.pet_social_action('moderation_queue','{}')->0->>'id' as report \\gset
 select public.pet_social_action('review_report',jsonb_build_object('id',:'report','decision','hide'));set local role anon;select count(id) from public.pet_comments;rollback;`).split('\n')
 assert.equal(result[0],'1');assert.equal(result[1],'0');assert.equal(result.at(-1),'0')
})
test('browser roles have no direct pet message, block or conversation write grants',()=>{
 const result=sql(`select count(*) from information_schema.table_privileges where table_schema='public' and table_name in('pet_comments','pet_conversations','pet_messages','pet_message_blocks') and grantee in('anon','authenticated') and privilege_type in('INSERT','UPDATE','DELETE','TRUNCATE','TRIGGER');`)
 assert.equal(result,'0')
})

const activity=(action:string,payload:Record<string,unknown>={})=>`public.pet_activity_action('${action}','${JSON.stringify(payload)}'::jsonb)`
test('unread alerts are recipient-only and read cursors persist without leaking to admins',()=>{
 const result=sql(`begin;${petFixture()}${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'Private sighting'})}->>'conversation_id' as chat \\gset
 select ${activity('alerts')}->>'total';${as(alice)}select ${activity('alerts')}->>'total';
 select id as message from public.pet_messages limit 1 \\gset
 select public.pet_activity_action('mark_read',jsonb_build_object('conversation_id',:'chat','last_message_id',:'message'));
 select ${activity('alerts')}->>'total';${as(admin)}select ${activity('alerts')}->>'total';select count(*) from public.pet_read_receipts;rollback;`).split('\n')
 assert.equal(result[0],'0');assert.equal(result[1],'1');assert.equal(result[3],'0');assert.equal(result[4],'0');assert.equal(result[5],'0')
})
test('read cursors cannot move backwards or mark another conversation and new delivery remains unread',()=>{
 const result=sql(`begin;${petFixture()}${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'First'})}->>'conversation_id' as chat \\gset
 select id as first from public.pet_messages limit 1 \\gset
 select public.pet_social_action('message',jsonb_build_object('conversation_id',:'chat','body','Second'));
 select id as second from public.pet_messages order by delivery_seq desc limit 1 \\gset
 ${as(alice)}select public.pet_activity_action('mark_read',jsonb_build_object('conversation_id',:'chat','last_message_id',:'second'));
 select public.pet_activity_action('mark_read',jsonb_build_object('conversation_id',:'chat','last_message_id',:'first'));
 select ${activity('alerts')}->>'total';${as(bob)}select public.pet_social_action('message',jsonb_build_object('conversation_id',:'chat','body','Third'));
 ${as(alice)}select ${activity('alerts')}->>'total';rollback;`).split('\n')
 assert.equal(result[3],'0');assert.equal(result.at(-1),'1')
 assert.throws(()=>sql(`begin;${petFixture()}${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'First'})}->>'conversation_id' as chat \\gset
 select id as first from public.pet_messages limit 1 \\gset
 ${as(admin)}select public.pet_activity_action('mark_read',jsonb_build_object('conversation_id',:'chat','last_message_id',:'first'));rollback;`),/Conversation unavailable/)
})
test('blocked conversations do not generate unread alerts',()=>{
 const result=sql(`begin;${petFixture()}${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'First'})}->>'conversation_id' as chat \\gset
 ${as(alice)}select public.pet_social_action('block',jsonb_build_object('conversation_id',:'chat','blocked',true));select ${activity('alerts')}->>'total';rollback;`).split('\n')
 assert.equal(result.at(-1),'0')
})
test('pet status requires the real reporter and preserves a revisioned private audit',()=>{
 assert.throws(()=>sql(`begin;${petFixture()}${as(bob)}select ${activity('report_status',{pet_id:pet,status:'reunited',revision:0,reporter_id:bob})};rollback;`),/linked report/)
 const result=sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'reunited',revision:0})};select status||':'||status_revision from public.lost_and_found where id='${pet}';reset role;select count(*) from directory_private.pet_status_history where pet_id='${pet}';rollback;`).split('\n')
 assert.equal(result[1],'reunited:1');assert.equal(result[2],'1')
 assert.throws(()=>sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'reunited',revision:0})};select ${activity('report_status',{pet_id:pet,status:'lost',revision:0})};rollback;`),/Report changed/)
})
test('owner archive is reversible but cannot override moderation or imported ownership',()=>{
 const result=sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'archived',revision:0})};set local role anon;select count(id) from public.lost_and_found;${as(alice)}select jsonb_array_length(${activity('my_reports')});select ${activity('report_status',{pet_id:pet,status:'lost',revision:1})};set local role anon;select count(id) from public.lost_and_found;rollback;`).split('\n')
 assert.equal(result[1],'0');assert.equal(result[2],'1');assert.equal(result.at(-1),'1')
 assert.throws(()=>sql(`begin;${petFixture()}update public.lost_and_found set needs_review=true where id='${pet}';${as(alice)}select ${activity('report_status',{pet_id:pet,status:'reunited',revision:0})};rollback;`),/under review/)
 assert.throws(()=>sql(`begin;${petFixture()}update public.lost_and_found set reporter_id=null where id='${pet}';${as(alice)}select ${activity('report_status',{pet_id:pet,status:'lost',revision:0})};rollback;`),/linked report/)
})
test('pet activity denies anonymous/unconfirmed calls, forged cursors and direct state writes',()=>{
 assert.throws(()=>sql(`begin;set local role anon;select ${activity('alerts')};rollback;`),/permission denied/)
 assert.throws(()=>sql(`begin;${as(unconfirmed)}select ${activity('alerts')};rollback;`),/Confirmed sign-in/)
 assert.throws(()=>sql(`begin;${as(alice)}insert into public.pet_read_receipts(user_id,conversation_id,read_seq) values('${alice}','${pet}',9999999);rollback;`),/permission denied/)
 assert.throws(()=>sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'approved',revision:0})};rollback;`),/valid pet status/)
 assert.throws(()=>sql(`begin;${petFixture()}${as(alice)}select public.pet_activity_action('report_status',jsonb_build_object('pet_id','${pet}','status','lost','revision',n-1)) from generate_series(1,21)n;rollback;`),/Daily activity limit/)
})

const notify=(action:string,payload:Record<string,unknown>={})=>`public.notification_settings_action('${action}','${JSON.stringify(payload)}'::jsonb)`
const prepare=`select public.notification_dispatch('prepare','{"email_ready":true,"push_ready":true}');`
const optIn=`${as(alice)}select ${notify('email',{enabled:true})};reset role;`
const incoming=`${as(bob)}select ${social('start_chat',{pet_id:pet,display_name:'Bob',body:'Private fixture message'})};reset role;`
const devicePayload={subscription:{endpoint:'https://fcm.googleapis.com/fcm/send/fixture',keys:{p256dh:'B'.repeat(87),auth:'A'.repeat(22)}},label:'Fixture browser'}
test('expired reports and comments are hidden immediately; owner can renew, holds remain held',()=>{
 const r=sql(`begin;${petFixture()}${as(bob)}select ${social('comment',{pet_id:pet,display_name:'Bob',body:'Old sighting'})};reset role;update public.lost_and_found set expires_at=now()-interval '1 second' where id='${pet}';set local role anon;select count(id) from public.lost_and_found;select count(id) from public.pet_comments;reset role;${prepare}${as(alice)}select ${activity('my_reports')}->0->>'status';select ${activity('report_status',{pet_id:pet,status:'lost',revision:1})};reset role;set local role anon;select count(id) from public.lost_and_found;rollback;`).split('\n')
 assert.equal(r[1],'0');assert.equal(r[2],'0');assert.equal(r[4],'expired');assert.equal(r.at(-1),'1')
 assert.throws(()=>sql(`begin;${petFixture()}update public.lost_and_found set expires_at=now()-interval '1 day' where id='${pet}';${as(bob)}select ${social('comment',{pet_id:pet,display_name:'Bob',body:'Stale reply'})};rollback;`),/Report unavailable/)
})
test('notification private tables and service dispatcher are unavailable to residents and administrators',()=>{
 for(const uid of [alice,admin]){
  assert.throws(()=>sql(`begin;${as(uid)}select * from directory_private.push_subscriptions;rollback;`),/permission denied/)
  assert.throws(()=>sql(`begin;${as(uid)}select public.notification_dispatch('prepare','{}');rollback;`),/permission denied/)
 }
 assert.throws(()=>sql(`begin;set local role anon;select ${notify('settings')};rollback;`),/permission denied/)
 assert.throws(()=>sql(`begin;${as(unconfirmed)}select ${notify('settings')};rollback;`),/Confirmed sign-in/)
})
test('email is opt-in, readiness gated and recipient is the confirmed account address',()=>{
 assert.throws(()=>sql(`begin;${as(alice)}select ${notify('email',{enabled:true})};rollback;`),/still being configured/)
 const r=sql(`begin;${petFixture()}${prepare}${incoming}${prepare}select count(*) from directory_private.notification_jobs;${optIn}${prepare}select count(*) from directory_private.notification_jobs;${as(bob)}select public.pet_social_action('message',jsonb_build_object('conversation_id',(select id from public.pet_conversations limit 1),'body','New message'));reset role;${prepare}select recipient_email from directory_private.notification_jobs;rollback;`).split('\n')
 assert.equal(r[3],'0');assert.equal(r[6],'0');assert.equal(r.at(-1),'alice@example.test')
})
test('push subscriptions reject arbitrary destinations and cannot be transferred between accounts',()=>{
 assert.throws(()=>sql(`begin;${prepare}${as(alice)}select ${notify('subscribe',{...devicePayload,subscription:{...devicePayload.subscription,endpoint:'https://127.0.0.1/private'}})};rollback;`),/Unsupported push/)
 assert.throws(()=>sql(`begin;${prepare}${as(alice)}select ${notify('subscribe',devicePayload)};${as(bob)}select ${notify('subscribe',devicePayload)};rollback;`),/previous account/)
 const r=sql(`begin;${prepare}${as(alice)}select ${notify('subscribe',devicePayload)};${as(bob)}select ${notify('unsubscribe',{endpoint:devicePayload.subscription.endpoint})};reset role;select active from directory_private.push_subscriptions;rollback;`).split('\n')
 assert.equal(r.at(-1),'t')
})
test('queued notifications cancel after reading, blocking or opting out',()=>{
 for(const operation of ['read','block','optout']){
  const action=operation==='read'?`select public.pet_activity_action('mark_read',jsonb_build_object('conversation_id',(select id from public.pet_conversations limit 1),'last_message_id',(select id from public.pet_messages limit 1)));`:operation==='block'?`select public.pet_social_action('block',jsonb_build_object('conversation_id',(select id from public.pet_conversations limit 1),'blocked',true));`:`select ${notify('email',{enabled:false})};`
  const r=sql(`begin;${petFixture()}${prepare}${optIn}${incoming}${prepare}${as(alice)}${action}reset role;select public.notification_dispatch('claim','{}') is null;select status from directory_private.notification_jobs;rollback;`).split('\n')
  assert.equal(r.at(-2),'t');assert.equal(r.at(-1),'cancelled')
 }
})
test('leases, retries, sent cursors and cooldowns prevent duplicate notification jobs',()=>{
 const r=sql(`begin;${petFixture()}${prepare}${optIn}${incoming}${prepare}select public.notification_dispatch('claim','{}') as j \\gset
 select public.notification_dispatch('claim','{}') is null;
 select public.notification_dispatch('finish',jsonb_build_object('id',(:'j'::jsonb)->>'id','lease_id',gen_random_uuid(),'decision','sent'))->>'saved';
 select public.notification_dispatch('finish',jsonb_build_object('id',(:'j'::jsonb)->>'id','lease_id',(:'j'::jsonb)->>'lease_id','decision','sent'))->>'saved';
 ${prepare}select count(*)||':'||min(status) from directory_private.notification_jobs;rollback;`).split('\n')
 assert.equal(r.at(-5),'t');assert.equal(r.at(-4),'false');assert.equal(r.at(-3),'true');assert.equal(r.at(-1),'1:sent')
})
test('unsubscribe token stops emails without exposing account identity or allowing arbitrary recipient changes',()=>{
 const r=sql(`begin;${prepare}${optIn}select unsubscribe_token as token from directory_private.notification_preferences where user_id='${alice}' \\gset
 set local role anon;select public.unsubscribe_notification_email(:'token');select public.unsubscribe_notification_email(gen_random_uuid());reset role;select email_enabled from directory_private.notification_preferences;rollback;`).split('\n')
 assert.deepEqual(r.slice(-3),['t','t','f'])
})
test('push re-registration preserves cursor; retry lease is delayed; gone subscriptions are retired',()=>{
 const r=sql(`begin;${petFixture()}${prepare}${as(alice)}select ${notify('subscribe',devicePayload)};reset role;${incoming}${prepare}${as(alice)}select ${notify('subscribe',devicePayload)};reset role;select notified_seq< (select max(delivery_seq) from public.pet_messages) from directory_private.push_subscriptions;
 set local role service_role;select public.notification_dispatch('claim','{}') as j \\gset
 select public.notification_dispatch('finish',jsonb_build_object('id',(:'j'::jsonb)->>'id','lease_id',(:'j'::jsonb)->>'lease_id','decision','retry','retry_after',60));
 select public.notification_dispatch('claim','{}') is null;reset role;update directory_private.notification_jobs set available_at=now()-interval '1 second';set local role service_role;select public.notification_dispatch('claim','{}') as retry \\gset
 select public.notification_dispatch('finish',jsonb_build_object('id',(:'retry'::jsonb)->>'id','lease_id',(:'retry'::jsonb)->>'lease_id','decision','retire'));reset role;select active from directory_private.push_subscriptions;rollback;`).split('\n')
 assert.equal(r[5],'t');assert.equal(r[7],'t');assert.equal(r.at(-1),'f')
})
test('push self-tests require a confirmed owner device, stay private and are durably rate limited',()=>{
 assert.throws(()=>sql(`begin;${prepare}${as(unconfirmed)}select ${notify('test_push',{id:pet})};rollback;`),/Confirmed sign-in/)
 assert.throws(()=>sql(`begin;${prepare}${as(alice)}select ${notify('subscribe',devicePayload)};reset role;select id as d from directory_private.push_subscriptions limit 1 \\gset
 ${as(bob)}select public.notification_settings_action('test_push',jsonb_build_object('id',:'d'));rollback;`),/registered device/)
 assert.throws(()=>sql(`begin;${prepare}${as(alice)}select ${notify('subscribe',devicePayload)};reset role;select id as d from directory_private.push_subscriptions limit 1 \\gset
 ${as(alice)}select public.notification_settings_action('test_push',jsonb_build_object('id',:'d'));select public.notification_settings_action('test_push',jsonb_build_object('id',:'d'));rollback;`),/Wait 15 minutes/)
})
test('test push can be delivered without fake messages and never advances a message cursor',()=>{
 const r=sql(`begin;${prepare}${as(alice)}select ${notify('subscribe',devicePayload)};reset role;select id as d from directory_private.push_subscriptions limit 1 \\gset
 ${as(alice)}select public.notification_settings_action('test_push',jsonb_build_object('id',:'d'));${as(bob)}select jsonb_array_length(${notify('settings')}->'tests');reset role;
 select public.notification_dispatch('claim','{}') as j \\gset
 select (:'j'::jsonb)->>'kind';select public.notification_dispatch('finish',jsonb_build_object('id',(:'j'::jsonb)->>'id','lease_id',(:'j'::jsonb)->>'lease_id','decision','sent'));select last_push_at is null from directory_private.push_subscriptions;select count(*) from public.pet_messages;rollback;`).split('\n')
 assert.equal(r[3],'0');assert.equal(r[4],'push_test');assert.equal(r.at(-2),'t');assert.equal(r.at(-1),'0')
})
test('push receipts need a private capability, are idempotent and cannot alter normal message jobs',()=>{
 const r=sql(`begin;${prepare}${as(alice)}select ${notify('subscribe',devicePayload)};reset role;select id as d from directory_private.push_subscriptions limit 1 \\gset
 ${as(alice)}select public.notification_settings_action('test_push',jsonb_build_object('id',:'d'));reset role;select receipt_token as token from directory_private.notification_jobs limit 1 \\gset
 set local role anon;select public.confirm_push_test(gen_random_uuid(),'displayed');reset role;select displayed_at is null from directory_private.notification_jobs;
 set local role anon;select public.confirm_push_test(:'token','displayed');select public.confirm_push_test(:'token','displayed');reset role;select (received_at is not null and displayed_at is not null and opened_at is null) from directory_private.notification_jobs;${as(alice)}select ${notify('settings')}->'tests'->0 ? 'receipt_token';rollback;`).split('\n')
 assert.equal(r[4],'t');assert.equal(r.at(-2),'t');assert.equal(r.at(-1),'f')
})

test('email pilot budget counts retries and defers sends at 500 attempts without exposing budget data',()=>{
 const r=sql(`begin;${petFixture()}${prepare}${optIn}${incoming}${prepare}
 select public.notification_dispatch('claim','{}') as j \\gset
 select count(*) from directory_private.email_delivery_attempts;
 select public.notification_dispatch('finish',jsonb_build_object('id',(:'j'::jsonb)->>'id','lease_id',(:'j'::jsonb)->>'lease_id','decision','retry'));
 update directory_private.notification_jobs set available_at=now()-interval '1 second';
 insert into directory_private.email_delivery_attempts(job_id) select (:'j'::jsonb->>'id')::uuid from generate_series(1,499);
 select public.notification_dispatch('claim','{}') is null;
 select attempts||':'||error_code from directory_private.notification_jobs;
 rollback;`).split('\n')
 assert.equal(r.at(-4),'1');assert.equal(r.at(-2),'t');assert.equal(r.at(-1),'1:pilot_email_budget_exhausted')
 assert.throws(()=>sql(`begin;${as(admin)}select * from directory_private.email_delivery_attempts;rollback;`),/permission denied/)
})

const mailEvent=(kind:string,id='00000000-0000-4000-8000-000000000555',recipient='alice@example.test')=>`select public.notification_dispatch('email_event',jsonb_build_object('event_id','${id}','provider_id','fixture-email-id','recipient_email','${recipient}','event_type','${kind}','occurred_at',now(),'recipient_rejection',true));`
const sentEmail=`${petFixture()}${prepare}${optIn}${incoming}${prepare}select public.notification_dispatch('claim','{}') as ej \\gset
select public.notification_dispatch('finish',jsonb_build_object('id',(:'ej'::jsonb)->>'id','lease_id',(:'ej'::jsonb)->>'lease_id','decision','sent','provider_id','<fixture-email-id>'));`
test('delivery events are service-only and private even to app administrators',()=>{
 for(const uid of [alice,admin]){
  assert.throws(()=>sql(`begin;${as(uid)}${mailEvent('delivered')}rollback;`),/permission denied/)
  assert.throws(()=>sql(`begin;${as(uid)}select * from directory_private.email_delivery_events;rollback;`),/permission denied/)
  assert.throws(()=>sql(`begin;${as(uid)}select * from directory_private.email_suppressions;rollback;`),/permission denied/)
 }
})
test('duplicate and out-of-order delivery events do not erase failure or cause resends',()=>{
 const r=sql(`begin;${sentEmail}${mailEvent('delivered')}${mailEvent('delivered')}${mailEvent('complained','00000000-0000-4000-8000-000000000556')}${mailEvent('delivered','00000000-0000-4000-8000-000000000557')}select count(*) from directory_private.email_delivery_events;select delivery_status from directory_private.notification_jobs where channel='email';select email_enabled from directory_private.notification_preferences;${prepare}select count(*) from directory_private.notification_jobs;rollback;`).split('\n')
 assert.equal(r.at(-5),'3');assert.equal(r.at(-4),'complained');assert.equal(r.at(-3),'f');assert.equal(r.at(-1),'1')
})
test('bounce pauses the matching address, cancels queued mail and prevents self re-enable',()=>{
 const r=sql(`begin;${sentEmail}${mailEvent('bounced')}select count(*) from directory_private.email_suppressions;${as(alice)}select (${notify('settings')}->>'email_paused')::boolean;rollback;`).split('\n')
 assert.equal(r.at(-2),'1');assert.equal(r.at(-1),'t')
 assert.throws(()=>sql(`begin;${sentEmail}${mailEvent('bounced')}${as(alice)}select ${notify('email',{enabled:true})};rollback;`),/paused for this address/)
})
test('events arriving before acceptance are reconciled after finish; wrong recipients never suppress another user',()=>{
 const r=sql(`begin;${petFixture()}${prepare}${optIn}${incoming}${prepare}select public.notification_dispatch('claim','{}') as ej \\gset
 ${mailEvent('bounced','00000000-0000-4000-8000-000000000555','bob@example.test')}${mailEvent('delivered','00000000-0000-4000-8000-000000000556')}
 select count(*) from directory_private.email_suppressions;
 select public.notification_dispatch('finish',jsonb_build_object('id',(:'ej'::jsonb)->>'id','lease_id',(:'ej'::jsonb)->>'lease_id','decision','sent','provider_id','fixture-email-id'));
 select delivery_status from directory_private.notification_jobs;select email_enabled from directory_private.notification_preferences;rollback;`).split('\n')
 assert.equal(r.at(-4),'0');assert.equal(r.at(-2),'delivered');assert.equal(r.at(-1),'t')
})
test('deferred mail is left to the provider; stale address events do not disable a newly confirmed address',()=>{
 const r=sql(`begin;${sentEmail}${mailEvent('deferred')}select email_enabled from directory_private.notification_preferences;update auth.users set email='new-alice@example.test' where id='${alice}';${mailEvent('bounced','00000000-0000-4000-8000-000000000556')}select email_enabled from directory_private.notification_preferences;${as(alice)}select (${notify('settings')}->>'email_paused')::boolean;rollback;`).split('\n')
 assert.equal(r.at(-4),'t');assert.equal(r.at(-2),'t');assert.equal(r.at(-1),'f')
})
test('synchronous recipient suppression immediately pauses future email',()=>{
 const r=sql(`begin;${petFixture()}${prepare}${optIn}${incoming}${prepare}select public.notification_dispatch('claim','{}') as ej \\gset
 select public.notification_dispatch('finish',jsonb_build_object('id',(:'ej'::jsonb)->>'id','lease_id',(:'ej'::jsonb)->>'lease_id','decision','failed','code','E_RECIPIENT_SUPPRESSED'));
 select email_enabled from directory_private.notification_preferences;select count(*) from directory_private.email_suppressions;rollback;`).split('\n')
 assert.equal(r.at(-2),'f');assert.equal(r.at(-1),'1')
})

test('unmatched early events cannot starve delivery reconciliation',()=>{
 const r=sql(`begin;${sentEmail}
 insert into directory_private.email_delivery_events(event_id,provider_id,recipient_email,event_type,occurred_at) select gen_random_uuid(),'unmatched-'||g,'unknown@example.test','delivered',now()-interval '1 hour' from generate_series(1,101) g;
 ${mailEvent('delivered')}select delivery_status from directory_private.notification_jobs where channel='email';rollback;`).split('\n')
 assert.equal(r.at(-1),'delivered')
})
test('operator-only email probes use no fake DM and cannot target another resident',()=>{
 const r=sql(`begin;${prepare}${as(admin)}select ${notify('settings')};reset role;
 insert into directory_private.notification_jobs(user_id,channel,target,ceiling_seq,recipient_email,kind) values('${admin}','email','operator-test',0,'dsovan2004@gmail.com','email_test');
 select public.notification_dispatch('claim','{}')->>'kind';select email_enabled from directory_private.notification_preferences;select count(*) from public.pet_messages;rollback;`).split('\n')
 assert.equal(r.at(-3),'email_test');assert.equal(r.at(-2),'f');assert.equal(r.at(-1),'0')
 const other=sql(`begin;${prepare}${as(alice)}select ${notify('settings')};reset role;
 insert into directory_private.notification_jobs(user_id,channel,target,ceiling_seq,recipient_email,kind) values('${alice}','email','operator-test',0,'alice@example.test','email_test');select public.notification_dispatch('claim','{}') is null;rollback;`).split('\n')
 assert.equal(other.at(-1),'t')
})

test('pet progress is reporter-only, revisioned and never inferred from legacy found',()=>{
 assert.equal(sql(`begin;${petFixture()}set local role anon;select progress from public.lost_and_found where id='${pet}';rollback;`),'unknown')
 assert.throws(()=>sql(`begin;${petFixture()}${as(bob)}select ${activity('report_status',{pet_id:pet,status:'found',progress:'secured',observed_at:'2026-11-06T18:00:00Z',revision:0})};rollback;`),/linked report/)
 const r=sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'found',progress:'sighted',observed_at:'2026-11-06T18:00:00Z',revision:0})};select ${activity('report_status',{pet_id:pet,status:'found',progress:'secured',observed_at:'2026-11-06T19:00:00Z',revision:1})};set local role anon;select public.pet_progress_timeline('${pet}');rollback;`).split('\n')
 const history=JSON.parse(r[2]);assert.equal(history.length,2);assert.equal(history[0].progress,'secured');assert.equal(history[1].progress,'sighted')
 assert.deepEqual(Object.keys(history[0]).sort(),['confirmed_at','contact_stage','contact_updated_at','observed_at','progress','revision','status'])
 assert.throws(()=>sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'found',progress:'secured',observed_at:'2026-11-06T19:00:00Z',revision:0})};select ${activity('report_status',{pet_id:pet,status:'found',progress:'sighted',observed_at:'2026-11-06T19:00:00Z',revision:0})};rollback;`),/Report changed/)
})
test('pet progress rejects missing/future/infinite observations and contradictory states',()=>{
 for(const payload of [
  {status:'found',progress:'secured'}, {status:'found',progress:'secured',observed_at:'infinity'},
  {status:'lost',progress:'secured',observed_at:'2026-11-06T19:00:00Z'},
  {status:'reunited',progress:'sighted',observed_at:'2026-11-06T19:00:00Z'},
  {status:'found',progress:'invented'}, {status:'found',progress:'secured',observed_at:'2099-01-01T00:00:00Z'}
 ])assert.throws(()=>sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,revision:0,...payload})};rollback;`),/progress|Progress|observation time/)
 assert.equal(sql(`begin;${petFixture()}${as(alice)}update public.lost_and_found set progress='secured' where id='${pet}';select progress from public.lost_and_found where id='${pet}';rollback;`),'unknown')
})
test('public pet timeline disappears with moderation, archival or expiry; private history remains denied',()=>{
 for(const hide of ["needs_review=true","status='archived'","expires_at=now()-interval '1 second'","ingestion_status='pending'"]){
  const r=sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'found',progress:'sighted',observed_at:'2026-11-06T18:00:00Z',revision:0})};reset role;update public.lost_and_found set ${hide} where id='${pet}';set local role anon;select public.pet_progress_timeline('${pet}');rollback;`).split('\n');assert.equal(r.at(-1),'[]')
 }
 assert.throws(()=>sql(`begin;set local role anon;select * from directory_private.pet_status_history;rollback;`),/permission denied/)
})
test('legacy status clients can renew and reset incompatible progress on classification change',()=>{
 const r=sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'found',progress:'secured',observed_at:'2026-11-06T18:00:00Z',revision:0})};select ${activity('report_status',{pet_id:pet,status:'found',revision:1})};select progress from public.lost_and_found where id='${pet}';select ${activity('report_status',{pet_id:pet,status:'lost',revision:2})};select progress||':'||(progress_observed_at is null) from public.lost_and_found where id='${pet}';rollback;`).split('\n')
 assert.equal(r[2],'secured');assert.equal(r[4],'unknown:true')
})

const foundPet='00000000-0000-4000-8000-000000000061'
const matchAction=(action:string,payload:Record<string,unknown>)=>`public.pet_match_action('${action}','${JSON.stringify(payload)}'::jsonb)`
const matchFixture=()=>`${petFixture()} insert into public.lost_and_found(id,type,title,description,city,status,reporter_id) values('${foundPet}','pet','Fixture found pet','Local test only','Mountain House','found','${bob}');`
const suggest=()=>matchAction('suggest',{pet_id:pet,other_pet_id:foundPet})
test('contact updates are reporter-owned, dated, revisioned and do not change possession or reunion',()=>{
 const r=sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'lost',revision:0,contact_stage:'return_arranged'})};select status||':'||progress||':'||contact_stage||':'||(contact_updated_at is not null) from public.lost_and_found where id='${pet}';set local role anon;select public.pet_progress_timeline('${pet}')->0->>'contact_stage';rollback;`).split('\n')
 assert.equal(r[1],'lost:unknown:return_arranged:true');assert.equal(r[2],'return_arranged')
 assert.throws(()=>sql(`begin;${petFixture()}${as(bob)}select ${activity('report_status',{pet_id:pet,status:'lost',revision:0,contact_stage:'contacted'})};rollback;`),/linked report/)
 assert.throws(()=>sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'reunited',revision:0,contact_stage:'contacted'})};rollback;`),/does not match/)
 assert.throws(()=>sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'lost',revision:0,contact_stage:'verified_owner'})};rollback;`),/valid contact/)
})
test('older status clients preserve contact on renewal and clear it on a status change',()=>{
 const r=sql(`begin;${petFixture()}${as(alice)}select ${activity('report_status',{pet_id:pet,status:'lost',revision:0,contact_stage:'contacted'})};select ${activity('report_status',{pet_id:pet,status:'lost',revision:1})};select contact_stage from public.lost_and_found where id='${pet}';select ${activity('report_status',{pet_id:pet,status:'reunited',revision:2})};select contact_stage||':'||(contact_updated_at is null) from public.lost_and_found where id='${pet}';rollback;`).split('\n')
 assert.equal(r[2],'contacted');assert.equal(r[4],'unknown:true')
})
test('only confirmed reporters can propose a match; duplicates and reverse pairs keep one link',()=>{
 assert.throws(()=>sql(`begin;${matchFixture()}set local role anon;select ${suggest()};rollback;`),/permission denied/)
 assert.throws(()=>sql(`begin;${matchFixture()}${as(unconfirmed)}select ${suggest()};rollback;`),/Confirmed sign-in/)
 assert.throws(()=>sql(`begin;${matchFixture()}${as(admin)}select ${suggest()};rollback;`),/linked report/)
 const r=sql(`begin;${matchFixture()}${as(alice)}select ${suggest()}->>'id';select ${suggest()}->>'id';${as(bob)}select ${matchAction('suggest',{pet_id:foundPet,other_pet_id:pet})}->>'id';reset role;select count(*) from directory_private.pet_match_links;select count(*) from directory_private.pet_match_history;rollback;`).split('\n')
 assert.equal(r[0],r[1]);assert.equal(r[0],r[2]);assert.equal(r[3],'1');assert.equal(r[4],'1')
})
test('match confirmations apply only to each owned side; both confirmations never change pet statuses',()=>{
 const r=sql(`begin;${matchFixture()}${as(alice)}select ${suggest()}->>'id' as matchid \\gset
 select public.pet_match_action('review',jsonb_build_object('pet_id','${pet}','id',:'matchid','revision',0,'decision','confirmed','decision_b','confirmed'));
 set local role anon;select public.pet_match_links('${pet}')->0->>'state';${as(bob)}select public.pet_match_action('review',jsonb_build_object('pet_id','${foundPet}','id',:'matchid','revision',1,'decision','confirmed'));
 set local role anon;select public.pet_match_links('${pet}');reset role;select string_agg(status,',' order by id) from public.lost_and_found;rollback;`).split('\n')
 assert.equal(r[1],'possible');const links=JSON.parse(r[3]);assert.equal(links[0].state,'confirmed');assert.equal(r[4],'lost,found')
 for(const field of ['proposed_by','reporter_id','actor_id','my_decision','decision_a','decision_b'])assert.equal(field in links[0],false)
})
test('a reporter cannot review the other report, overwrite stale decisions or edit private match data',()=>{
 assert.throws(()=>sql(`begin;${matchFixture()}${as(alice)}select ${suggest()}->>'id' as matchid \\gset
 select public.pet_match_action('review',jsonb_build_object('pet_id','${foundPet}','id',:'matchid','revision',0,'decision','confirmed'));rollback;`),/linked report/)
 assert.throws(()=>sql(`begin;${matchFixture()}${as(alice)}select ${suggest()}->>'id' as matchid \\gset
 select public.pet_match_action('review',jsonb_build_object('pet_id','${pet}','id',:'matchid','revision',0,'decision','confirmed'));
 select public.pet_match_action('review',jsonb_build_object('pet_id','${pet}','id',:'matchid','revision',0,'decision','ruled_out'));rollback;`),/Match changed/)
 for(const table of ['pet_match_links','pet_match_history'])assert.throws(()=>sql(`begin;${as(alice)}select * from directory_private.${table};rollback;`),/permission denied/)
 assert.throws(()=>sql(`begin;${as(alice)}insert into directory_private.pet_match_links(pet_a,pet_b) values('${pet}','${foundPet}');rollback;`),/permission denied/)
})
test('ruled-out matches disappear publicly but reporters can reset their own decision',()=>{
 const r=sql(`begin;${matchFixture()}${as(alice)}select ${suggest()}->>'id' as matchid \\gset
 select public.pet_match_action('review',jsonb_build_object('pet_id','${pet}','id',:'matchid','revision',0,'decision','ruled_out'));
 set local role anon;select public.pet_match_links('${pet}');${as(alice)}select ${matchAction('context',{pet_id:pet})}->'links'->0->>'my_decision';
 select public.pet_match_action('review',jsonb_build_object('pet_id','${pet}','id',:'matchid','revision',1,'decision','pending'));set local role anon;select public.pet_match_links('${pet}')->0->>'state';rollback;`).split('\n')
 assert.equal(r[1],'[]');assert.equal(r[2],'ruled_out');assert.equal(r[4],'possible')
})
test('matching requires opposite active statuses and hides links when either parent is unavailable',()=>{
 assert.throws(()=>sql(`begin;${matchFixture()}${as(alice)}select ${matchAction('suggest',{pet_id:pet,other_pet_id:pet})};rollback;`),/available lost report/)
 assert.throws(()=>sql(`begin;${matchFixture()}update public.lost_and_found set status='lost' where id='${foundPet}';${as(alice)}select ${suggest()};rollback;`),/available lost report/)
 for(const hide of ["needs_review=true","status='archived'","expires_at=now()-interval '1 second'","city='Brentwood'"]){
  const r=sql(`begin;${matchFixture()}${as(alice)}select ${suggest()};reset role;update public.lost_and_found set ${hide} where id='${foundPet}';set local role anon;select public.pet_match_links('${pet}');${as(alice)}select ${matchAction('context',{pet_id:pet})}->'links';rollback;`).split('\n')
  assert.equal(r[1],'[]');assert.equal(r[2],'[]')
 }
 assert.equal(sql(`begin;${matchFixture()}${as(bob)}select ${matchAction('context',{pet_id:pet})}->>'can_manage';rollback;`),'false')
})
test('match proposal budget persists across distinct links; only curated link projections are anonymous',()=>{
 assert.throws(()=>sql(`begin;${petFixture()}insert into public.lost_and_found(type,title,description,city,status,reporter_id) select 'pet','Fixture '||n,'Local test only','Tracy','found','${bob}'::uuid from generate_series(1,11)n;
 ${as(alice)}select public.pet_match_action('suggest',jsonb_build_object('pet_id','${pet}','other_pet_id',id)) from public.lost_and_found where status='found';rollback;`),/Daily activity limit/)
 assert.throws(()=>sql(`begin;set local role anon;select directory_private.pet_matches('${pet}',true);rollback;`),/permission denied/)
})
test('existing messaging blocks prevent new match links and confirmations without preventing rule-out',()=>{
 assert.throws(()=>sql(`begin;${matchFixture()}insert into public.pet_message_blocks(user_id,blocked_id) values('${bob}','${alice}');${as(alice)}select ${suggest()};rollback;`),/Matching unavailable/)
 assert.throws(()=>sql(`begin;${matchFixture()}${as(alice)}select ${suggest()}->>'id' as matchid \\gset
 reset role;insert into public.pet_message_blocks(user_id,blocked_id) values('${bob}','${alice}');${as(alice)}select public.pet_match_action('review',jsonb_build_object('pet_id','${pet}','id',:'matchid','revision',0,'decision','confirmed'));rollback;`),/Matching unavailable/)
 const r=sql(`begin;${matchFixture()}${as(alice)}select ${suggest()}->>'id' as matchid \\gset
 reset role;insert into public.pet_message_blocks(user_id,blocked_id) values('${bob}','${alice}');${as(alice)}select public.pet_match_action('review',jsonb_build_object('pet_id','${pet}','id',:'matchid','revision',0,'decision','ruled_out'));set local role anon;select public.pet_match_links('${pet}');rollback;`).split('\n');assert.equal(r.at(-1),'[]')
})
