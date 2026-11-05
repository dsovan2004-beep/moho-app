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
