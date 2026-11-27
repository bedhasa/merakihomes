// Regression tests for Phase 1 fixes in docs/architecture/refactoring-roadmap.md (TD ids refer to
// docs/architecture/technical-debt-register.md). Uses the same PGlite harness as api.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes, scryptSync } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createApp, migrate } from './index.mjs';

const hashPassword = password => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, 64).toString('hex')}`;
};

async function fixture(t) {
  process.env.SESSION_SECRET = 'test-session-secret-for-hardening-regressions-32-bytes';
  const db = new PGlite();
  const pool = { query: (...args) => db.query(...args), connect: async () => ({ query: (...args) => db.query(...args), release() {} }) };
  await migrate(pool, { skipBtreeGist: true });
  const password = 'StaffPassword123!';
  await db.query('INSERT INTO staff_users(full_name,email,password_hash,role_id) VALUES($1,$2,$3,$4)', ['Hardening Admin', 'admin@example.test', hashPassword(password), 'admin']);
  const server = createServer(createApp({ pool }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { server.close(); await db.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const login = await post(base, '/api/management/auth/login', { email: 'admin@example.test', password });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  return { base, db, cookie };
}

const post = (base, path, body, headers = {}) => fetch(base + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
});

const guestRequest = (overrides = {}) => ({
  serviceId: 'handyman_plumbing', name: 'Guest Customer', phone: '+251 911 222 333', neighborhood: 'Bole',
  address: 'House 4 near the clinic', requestedStart: new Date(Date.now() + 86_400_000).toISOString(), details: 'Leaking tap', ...overrides,
});

test('TD-001: reschedule proposal and worker assignment audit rows store the booking id as entity_id', async t => {
  const { base, db, cookie } = await fixture(t);
  const headers = { Cookie: cookie, 'Content-Type': 'application/json' };
  const { booking } = await post(base, '/api/bookings', guestRequest()).then(r => r.json());
  const reason = 'Customer requested a later visit';
  const proposal = await fetch(`${base}/api/management/bookings/${booking.id}/reschedule-proposals`, {
    method: 'POST', headers, body: JSON.stringify({ requestedStart: new Date(Date.now() + 3 * 86_400_000).toISOString(), reason }),
  });
  assert.equal(proposal.status, 201);
  const audit = (await db.query("SELECT entity_id,reason FROM audit_logs WHERE action='booking.reschedule_proposed'")).rows[0];
  assert.equal(audit.entity_id, booking.id);
  assert.equal(audit.reason, reason);
});

test('TD-004: replaying a verified demo payment returns the original receipt; the key cannot be reused on another booking', async t => {
  const { base, db } = await fixture(t);
  const pack = (await db.query("INSERT INTO service_packages(service_id,name,description,base_price,currency,estimated_duration_minutes) VALUES('premium_home_cleaning','Replay Visit','Replay test package',1200,'ETB',120) RETURNING id")).rows[0];
  const request = guestRequest({ serviceId: 'premium_home_cleaning', packageId: pack.id, expectedPackagePrice: 1200, expectedPackageCurrency: 'ETB', expectedPackageDuration: 120 });
  const first = await post(base, '/api/bookings', request).then(r => r.json());
  const second = await post(base, '/api/bookings', request).then(r => r.json());
  const pay = reference => post(base, `/api/bookings/${reference}/demo-payment`,
    { phone: request.phone, provider: 'telebirr', amount: 1200, outcome: 'success', paymentType: 'full' }, { 'Idempotency-Key': 'replay-key-1' });

  const original = await pay(first.booking.reference);
  assert.equal(original.status, 201);
  const originalBody = await original.json();

  const replay = await pay(first.booking.reference);
  assert.equal(replay.status, 200);
  const replayBody = await replay.json();
  assert.equal(replayBody.receipt.transactionReference, originalBody.receipt.transactionReference);
  assert.equal(replayBody.receipt.amountPaid, 1200);
  assert.equal(replayBody.receipt.remainingBalance, 0);
  assert.equal(replayBody.paymentStatus, 'paid');

  // Same key against a different booking must not disclose the first booking's receipt.
  const reused = await pay(second.booking.reference);
  assert.equal(reused.status, 409);
  assert.equal((await reused.json()).receipt, undefined);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM payments')).rows[0].count, 1);
});

test('TD-009: malformed identifiers return 400 and duplicate records return 409 instead of 500', async t => {
  const { base, cookie } = await fixture(t);
  const malformed = await fetch(`${base}/api/management/bookings/not-a-uuid`, { headers: { Cookie: cookie } });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).error.code, 'INVALID_IDENTIFIER');

  const staff = { name: 'Second Admin', email: 'second@example.test', password: 'AnotherPassword123!', roleId: 'operations' };
  assert.equal((await post(base, '/api/management/staff', staff, { Cookie: cookie })).status, 201);
  const duplicate = await post(base, '/api/management/staff', staff, { Cookie: cookie });
  assert.equal(duplicate.status, 409);
  assert.equal((await duplicate.json()).error.code, 'CONFLICT');
});

test('TD-007: an availability window ending before midnight does not cover a job that runs past midnight', async t => {
  const { base, db } = await fixture(t);
  const serviceId = 'handyman_plumbing';
  await db.query('DELETE FROM service_skill_requirements WHERE service_id=$1', [serviceId]);
  const worker = (await db.query("INSERT INTO workers(full_name,operational_status,eligibility_status) VALUES('Late Shift Worker','active','eligible') RETURNING id")).rows[0];
  await db.query("INSERT INTO worker_services(worker_id,service_id,qualification_status,qualification_name) VALUES($1,$2,'verified','Plumbing')", [worker.id, serviceId]);
  // 23:00 in Addis Ababa (UTC+3) two days from now, for 120 minutes, which ends at 01:00 the next day.
  const day = new Date(Date.now() + 2 * 86_400_000);
  const addisDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Addis_Ababa' }).format(day);
  const requestedStart = new Date(`${addisDate}T23:00:00+03:00`).toISOString();
  await db.query("INSERT INTO worker_availability(worker_id,specific_date,start_time,end_time,timezone) VALUES($1,$2,'20:00','23:59','Africa/Addis_Ababa')", [worker.id, addisDate]);

  const query = new URLSearchParams({ serviceId, requestedStart, durationMinutes: '120' });
  const response = await fetch(`${base}/api/workers/eligible?${query}`);
  assert.equal(response.status, 200);
  const match = (await response.json()).workers.find(w => w.id === worker.id);
  assert.ok(match, 'worker should still be listed');
  assert.notEqual(match.availability, 'available');

  // Control: a job that fits inside the window is still reported as available.
  const fits = new URLSearchParams({ serviceId, requestedStart: new Date(`${addisDate}T21:00:00+03:00`).toISOString(), durationMinutes: '60' });
  const fitting = (await fetch(`${base}/api/workers/eligible?${fits}`).then(r => r.json())).workers.find(w => w.id === worker.id);
  assert.equal(fitting.availability, 'available');
});

test('TD-018: uploads are rejected before body parsing without a staff session, and malformed input returns 400', async t => {
  const { base, cookie } = await fixture(t);
  const anonymous = await fetch(`${base}/api/management/uploads`, { method: 'POST', headers: { 'Content-Type': 'image/jpeg', 'X-Filename': 'a.jpg' }, body: Buffer.alloc(1024, 7) });
  assert.equal(anonymous.status, 401);

  const badName = await fetch(`${base}/api/management/uploads`, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'image/jpeg', 'X-Filename': '%E0%A4%A' }, body: Buffer.alloc(1024, 7) });
  assert.equal(badName.status, 400);

  const badJson = await fetch(`${base}/api/management/uploads`, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: '{not json' });
  assert.equal(badJson.status, 400);
});

test('TD-023: a deactivated professional credential cannot sign in', async t => {
  const { base, db } = await fixture(t);
  const password = 'WorkerPassword123!';
  const worker = (await db.query("INSERT INTO workers(full_name,operational_status,eligibility_status) VALUES('Inactive Credential','active','eligible') RETURNING id")).rows[0];
  await db.query('INSERT INTO worker_auth(worker_id,phone,password_hash) VALUES($1,$2,$3)', [worker.id, '251911000999', hashPassword(password)]);
  assert.equal((await post(base, '/api/professionals/auth/login', { phone: '+251 911 000 999', password })).status, 200);
  await db.query('UPDATE worker_auth SET is_active=FALSE WHERE worker_id=$1', [worker.id]);
  const denied = await post(base, '/api/professionals/auth/login', { phone: '+251 911 000 999', password });
  assert.equal(denied.status, 401);
  assert.equal((await denied.json()).accessToken, undefined);
});

test('TD-010 diagnostic: client-ip endpoint is off by default and never echoes credentials', async t => {
  const { base } = await fixture(t);
  const previous = process.env.DEBUG_CLIENT_IP;
  t.after(() => { if (previous === undefined) delete process.env.DEBUG_CLIENT_IP; else process.env.DEBUG_CLIENT_IP = previous; });

  delete process.env.DEBUG_CLIENT_IP;
  assert.equal((await fetch(`${base}/api/debug/client-ip`)).status, 404);

  process.env.DEBUG_CLIENT_IP = '1';
  const response = await fetch(`${base}/api/debug/client-ip`, {
    headers: { 'X-Forwarded-For': '203.0.113.7, 198.51.100.2', 'X-Real-IP': '203.0.113.7', Cookie: 'meraki_staff_session=secret', Authorization: 'Bearer secret' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.equal(body.headers['x-forwarded-for'], '203.0.113.7, 198.51.100.2');
  assert.equal(body.headers['x-real-ip'], '203.0.113.7');
  assert.equal(body.trustProxy, false);
  assert.ok(body.socketAddress);
  assert.equal(JSON.stringify(body).includes('secret'), false);
});
