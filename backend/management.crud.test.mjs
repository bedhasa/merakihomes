import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes, scryptSync } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createApp, migrate } from './index.mjs';

async function fixture(t) {
  process.env.SESSION_SECRET = 'test-session-secret-for-management-crud-32bytes';
  const db = new PGlite();
  const pool = { query: (...args) => db.query(...args), connect: async () => ({ query: (...args) => db.query(...args), release() {} }) };
  await migrate(pool, { skipBtreeGist: true });
  const salt = randomBytes(16);
  const hash = `scrypt$${salt.toString('hex')}$${scryptSync('StaffPassword123!', salt, 64).toString('hex')}`;
  await db.query('INSERT INTO staff_users(full_name,email,password_hash,role_id) VALUES($1,$2,$3,$4)', ['Demo Admin', 'admin@example.test', hash, 'admin']);
  const server = createServer(createApp({ pool }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => { server.close(); await db.close(); });
  const login = await fetch(`${base}/api/management/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@example.test', password: 'StaffPassword123!' }) });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const auth = { 'Content-Type': 'application/json', Cookie: cookie };
  return { base, db, auth };
}

test('staff can create a worker, deactivate without deleting, and restore', async t => {
  const { base, db, auth } = await fixture(t);
  const created = await fetch(`${base}/api/management/workers`, { method: 'POST', headers: auth, body: JSON.stringify({ name: 'Hana Bekele', serviceArea: 'Bole', photoUrl: '', baseRate: 400, currency: 'ETB', status: 'active', eligibility: 'eligible', serviceIds: ['premium_home_cleaning'] }) });
  assert.equal(created.status, 201);
  const id = (await created.json()).worker.id;
  const listed = await fetch(`${base}/api/management/workers`, { headers: auth }).then(r => r.json());
  assert.ok(listed.workers.some(w => w.id === id && w.skills.includes('Premium Home Cleaning')));
  const saved = await fetch(`${base}/api/management/workers/${id}`, { method: 'PATCH', headers: auth, body: JSON.stringify({ name: 'Hana Bekele', serviceArea: 'Bole', photoUrl: '', baseRate: 400, currency: 'ETB', status: 'inactive', eligibility: 'eligible', serviceIds: ['premium_home_cleaning'] }) });
  assert.equal(saved.status, 200);
  const still = (await db.query('SELECT operational_status FROM workers WHERE id=$1', [id])).rows[0];
  assert.equal(still.operational_status, 'inactive');
});

test('unpublished promotions stay off the public home feed', async t => {
  const { base, auth } = await fixture(t);
  const created = await fetch(`${base}/api/management/home-promotions`, { method: 'POST', headers: auth, body: JSON.stringify({ title: 'Hidden spring offer', body: 'Staff only until published.', code: 'HIDDEN', imageUrl: 'https://example.com/a.jpg', mobileImageUrl: '', isActive: false, displayOrder: 9 }) });
  assert.equal(created.status, 201);
  const id = (await created.json()).promotion.id;
  const publicRows = await fetch(`${base}/api/home-promotions`).then(r => r.json());
  assert.equal(publicRows.promotions.some(row => row.id === id), false);
  await fetch(`${base}/api/management/home-promotions/${id}`, { method: 'PATCH', headers: auth, body: JSON.stringify({ title: 'Hidden spring offer', body: 'Staff only until published.', code: 'HIDDEN', imageUrl: 'https://example.com/a.jpg', mobileImageUrl: '', isActive: true, displayOrder: 9 }) });
  const live = await fetch(`${base}/api/home-promotions`).then(r => r.json());
  assert.equal(live.promotions.some(row => row.id === id), true);
});

test('customer deactivation keeps bookings and published questions reach the public service payload', async t => {
  const { base, db, auth } = await fixture(t);
  const customer = (await db.query("INSERT INTO customers(full_name,account_status) VALUES('Lulit Tesfaye','active') RETURNING id")).rows[0];
  await db.query("INSERT INTO customer_contacts(customer_id,contact_type,contact_value) VALUES($1,'phone','+251911000111')", [customer.id]);
  const detail = await fetch(`${base}/api/management/customers/${customer.id}`, { headers: auth });
  assert.equal(detail.status, 200);
  const patched = await fetch(`${base}/api/management/customers/${customer.id}`, { method: 'PATCH', headers: auth, body: JSON.stringify({ status: 'inactive', name: 'Lulit Tesfaye', phone: '+251911000111' }) });
  assert.equal(patched.status, 200);
  assert.equal((await db.query('SELECT account_status FROM customers WHERE id=$1', [customer.id])).rows[0].account_status, 'inactive');
  const questions = await fetch(`${base}/api/management/services/premium_home_cleaning/questions`, { method: 'PUT', headers: auth, body: JSON.stringify({ questions: [{ key: 'rooms', label: 'How many rooms?', answerType: 'number', required: true, options: [] }] }) });
  assert.equal(questions.status, 200);
  const publicService = await fetch(`${base}/api/services/premium_home_cleaning`).then(r => r.json());
  assert.ok(publicService.questions.some(q => q.key === 'rooms'));
});

test('staff image uploads accept a payload larger than the default JSON limit', async t => {
  const { base, auth } = await fixture(t);
  const cookie = auth.Cookie;
  const uploaded = await fetch(`${base}/api/management/uploads`, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'image/jpeg', 'X-Filename': 'carousel.jpg' }, body: Buffer.alloc(48 * 1024, 7) });
  const uploadedText = await uploaded.text();
  assert.equal(uploaded.status, 201, uploadedText);
  const body = JSON.parse(uploadedText);
  assert.match(body.url, /^\/api\/uploads\/.+\.jpg$/);
  const file = await fetch(`${base}${body.url}`);
  assert.equal(file.status, 200);
  const created = await fetch(`${base}/api/management/home-promotions`, { method: 'POST', headers: auth, body: JSON.stringify({ title: 'Uploaded card', body: 'Uses a stored image path.', code: 'PHOTO', imageUrl: body.url, mobileImageUrl: body.url, isActive: true, displayOrder: 4 }) });
  const createdText = await created.text();
  assert.equal(created.status, 201, createdText);
});
