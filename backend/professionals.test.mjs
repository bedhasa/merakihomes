import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes, scryptSync } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createApp, migrate } from './index.mjs';
import { haversineMeters, coordinateError } from './geo.mjs';

async function fixture(t) {
  process.env.SESSION_SECRET = 'test-session-secret-for-professional-location-tests-32-bytes';
  const db = new PGlite();
  const pool = { query: (...args) => db.query(...args), connect: async () => ({ query: (...args) => db.query(...args), release() {} }) };
  await migrate(pool, { skipBtreeGist: true });
  const salt = randomBytes(16);
  const password = 'WorkerPassword123!';
  const passwordHash = `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, 64).toString('hex')}`;
  const staffSalt = randomBytes(16);
  const staffPassword = 'AdminPassword123!';
  const staffHash = `scrypt$${staffSalt.toString('hex')}$${scryptSync(staffPassword, staffSalt, 64).toString('hex')}`;
  await db.query('INSERT INTO staff_users(full_name,email,password_hash,role_id) VALUES($1,$2,$3,$4)', ['Location Admin', 'location-admin@example.test', staffHash, 'admin']);
  const worker = (await db.query(`INSERT INTO workers(full_name,operational_status,eligibility_status,photo_url,service_area,base_rate,rate_currency,is_demo,rating,review_count)
    VALUES('Aster Mekonnen','active','eligible','https://example.test/aster.jpg','Bole',450,'ETB',false,4.8,23) RETURNING id`)).rows[0];
  await db.query('INSERT INTO worker_auth(worker_id,phone,password_hash) VALUES($1,$2,$3)', [worker.id, '251911222333', passwordHash]);
  const server = createServer(createApp({ pool }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { server.close(); await db.close(); });
  return { db, base: `http://127.0.0.1:${server.address().port}`, workerId: worker.id, password, staffPassword };
}

const post = (base, path, body, headers = {}) => fetch(base + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
});

test('Haversine distance uses raw coordinates and rejects invalid coordinates', () => {
  const meters = haversineMeters(9.0, 38.75, 9.01, 38.75);
  assert.ok(meters > 1100 && meters < 1120, `expected about 1.1 km, got ${meters}`);
  assert.equal(coordinateError(91, 38.75), 'Latitude must be between -90 and 90.');
  assert.equal(coordinateError(9, 181), 'Longitude must be between -180 and 180.');
  assert.equal(haversineMeters(9, 38, null, null), null);
});

test('professional location update requires authentication and validates/persists own coordinates', async t => {
  const { base, db, workerId, password, staffPassword } = await fixture(t);
  assert.equal((await post(base, '/api/professionals/me/location', { latitude: 9, longitude: 38 })).status, 401);
  const login = await post(base, '/api/professionals/auth/login', { phone: '+251 911 222 333', password });
  assert.equal(login.status, 200);
  const { accessToken } = await login.json();
  const headers = { Authorization: `Bearer ${accessToken}` };
  assert.equal((await post(base, '/api/professionals/me/location', { latitude: 9, longitude: 38.75 }, headers)).status, 403);
  assert.equal((await post(base, '/api/professionals/me/location', { latitude: 91, longitude: 38 }, headers)).status, 400);
  assert.equal((await post(base, '/api/professionals/me/location', { latitude: 9, longitude: 181 }, headers)).status, 400);
  assert.equal((await post(base, '/api/professionals/me/location', { latitude: 9, longitude: 38, accuracyMeters: -1 }, headers)).status, 400);
  const enable = await fetch(base + '/api/professionals/me/location-settings', { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ shareLocation: true }) });
  assert.equal(enable.status, 200);
  const update = await post(base, '/api/professionals/me/location', { latitude: 9, longitude: 38.75, accuracyMeters: 14 }, headers);
  assert.equal(update.status, 200);
  const saved = (await db.query('SELECT latitude,longitude,location_accuracy_meters,location_updated_at FROM workers WHERE id=$1', [workerId])).rows[0];
  assert.equal(Number(saved.latitude), 9);
  assert.equal(Number(saved.longitude), 38.75);
  assert.equal(Number(saved.location_accuracy_meters), 14);
  assert.ok(saved.location_updated_at);
  const otherWorker = (await db.query("INSERT INTO workers(full_name,operational_status,eligibility_status) VALUES('Other Worker','active','eligible') RETURNING id")).rows[0];
  assert.equal((await post(base, '/api/professionals/me/location', { latitude: 10, longitude: 39, workerId: otherWorker.id }, headers)).status, 200);
  const otherSaved = (await db.query('SELECT latitude,longitude FROM workers WHERE id=$1', [otherWorker.id])).rows[0];
  assert.equal(otherSaved.latitude, null);

  const staffLogin = await post(base, '/api/management/auth/login', { email: 'location-admin@example.test', password: staffPassword });
  const staffCookie = staffLogin.headers.get('set-cookie').split(';')[0];
  const account = await fetch(`${base}/api/management/workers/${workerId}/professional-account`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: staffCookie }, body: JSON.stringify({ phone: '+251 911 222 334', password: 'ChangedWorkerPassword123!' }) });
  assert.equal(account.status, 200);
  assert.equal((await post(base, '/api/professionals/auth/login', { phone: '+251 911 222 334', password: 'ChangedWorkerPassword123!' })).status, 200);
});

test('nearby endpoint applies verified service, recent opt-in location, radius and accurate distance', async t => {
  const { base, db, workerId, password, staffPassword } = await fixture(t);
  const login = await post(base, '/api/professionals/auth/login', { phone: '251911222333', password });
  const { accessToken } = await login.json();
  const headers = { Authorization: `Bearer ${accessToken}` };
  const settings = await fetch(base + '/api/professionals/me/location-settings', { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ shareLocation: true }) });
  assert.equal(settings.status, 200);
  await post(base, '/api/professionals/me/location', { latitude: 9.01, longitude: 38.75, accuracyMeters: 12 }, headers);

  const serviceId = 'premium_home_cleaning';
  await db.query('INSERT INTO worker_services(worker_id,service_id,qualification_status,qualification_name) VALUES($1,$2,\'verified\',\'Home cleaning\')', [workerId, serviceId]);
  await db.query("INSERT INTO worker_skills(worker_id,skill_id,verification_status,verified_at) SELECT $1,skill_id,'verified',now() FROM service_skill_requirements WHERE service_id=$2 AND is_mandatory", [workerId, serviceId]);
  // Use 06:00 UTC (09:00 Addis): the sample service takes longer than an hour.
  const requested = new Date(Date.now() + 2 * 86400000);
  requested.setUTCHours(6, 0, 0, 0);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Addis_Ababa', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(requested).map(p => [p.type, p.value]));
  await db.query('INSERT INTO worker_availability(worker_id,specific_date,start_time,end_time) VALUES($1,$2,\'00:00\',\'23:59\')', [workerId, `${parts.year}-${parts.month}-${parts.day}`]);
  const query = new URLSearchParams({ latitude: '9', longitude: '38.75', radiusKm: '5', serviceId, requestedStart: requested.toISOString(), sort: 'distance' });
  const response = await fetch(`${base}/api/professionals/nearby?${query}`);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.professionals.length, 1, JSON.stringify(result));
  const person = result.professionals[0];
  assert.equal(person.id, workerId);
  assert.ok(person.distanceMeters > 1100 && person.distanceMeters < 1120);
  assert.equal(person.distanceKind, 'straight_line');
  assert.equal(person.latitude, 9.01);
  assert.equal(person.locationVisible, true);
  assert.equal(person.availability, 'available');
  const outsideRadius = await fetch(`${base}/api/professionals/nearby?${new URLSearchParams({ latitude: '9', longitude: '38.75', radiusKm: '1', serviceId, requestedStart: requested.toISOString() })}`).then(r => r.json());
  assert.equal(outsideRadius.professionals.length, 0);
  assert.equal((await fetch(`${base}/api/professionals/nearby?${new URLSearchParams({ latitude: '9', longitude: '38.75', serviceId, requestedStart: requested.toISOString(), sort: 'nearest-ish' })}`)).status, 400);
  const disable = await fetch(base + '/api/professionals/me/location-settings', { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ shareLocation: false }) });
  assert.equal(disable.status, 200);
  const hidden = await fetch(`${base}/api/professionals/nearby?${query}`).then(r => r.json());
  assert.equal(hidden.professionals.length, 0);
  const privateCoordinates = (await db.query('SELECT latitude,longitude FROM workers WHERE id=$1', [workerId])).rows[0];
  assert.equal(privateCoordinates.latitude, null);
});

test('booking location sharing requires both parties, scopes access, and stops/clears immediately on withdrawal', async t => {
  const { base, db, workerId, password, staffPassword } = await fixture(t);
  const professionalLogin = await post(base, '/api/professionals/auth/login', { phone: '251911222333', password });
  const { accessToken: workerToken } = await professionalLogin.json();
  const workerHeaders = { Authorization: `Bearer ${workerToken}` };
  const customerLogin = await post(base, '/api/mobile/auth/register', { name: 'Tracking Customer', email: 'tracking@example.test', phone: '+251911111111', password: 'CustomerPassword123!' });
  assert.equal(customerLogin.status, 201);
  const { customer, accessToken: customerToken } = await customerLogin.json();
  const customerHeaders = { Authorization: `Bearer ${customerToken}` };
  const booking = (await db.query(`INSERT INTO bookings(reference,customer_id,service_id,service_name_snapshot,status,booking_source,selection_method,customer_name_snapshot,customer_phone_snapshot,address_snapshot,neighborhood,requested_start,estimated_duration_minutes,currency)
    VALUES('MRK-TRACKING-0001',$1,'premium_home_cleaning','Premium Home Cleaning','confirmed','mobile_app','operations_selected','Tracking Customer','+251911111111','Bole Home','Bole',$2,60,'ETB') RETURNING id`, [customer.id, new Date(Date.now() + 86400000)])).rows[0];
  const item = (await db.query(`INSERT INTO booking_items(booking_id,item_number,service_id,item_status,estimated_duration_minutes,service_name_snapshot,pricing_model_snapshot,currency)
    VALUES($1,1,'premium_home_cleaning','confirmed',60,'Premium Home Cleaning','quotation','ETB') RETURNING id`, [booking.id])).rows[0];
  await db.query("INSERT INTO booking_assignments(booking_id,booking_item_id,worker_id,assignment_status) VALUES($1,$2,$3,'confirmed')", [booking.id, item.id, workerId]);

  const otherCustomerLogin = await post(base, '/api/mobile/auth/register', { name: 'Other Customer', email: 'other-tracking@example.test', phone: '+251922222222', password: 'CustomerPassword123!' });
  const { accessToken: otherCustomerToken } = await otherCustomerLogin.json();
  assert.equal((await fetch(`${base}/api/bookings/${booking.id}/location-sharing`, { headers: { Authorization: `Bearer ${otherCustomerToken}` } })).status, 404);

  const customerConsent = await post(base, `/api/bookings/${booking.id}/location-sharing/consent`, { decision: 'grant', workerId }, customerHeaders);
  assert.equal(customerConsent.status, 200);
  assert.equal((await customerConsent.json()).session.status, 'pending_professional_consent');
  let state = await fetch(`${base}/api/bookings/${booking.id}/location-sharing`, { headers: customerHeaders }).then(r => r.json());
  assert.equal(state.sessions[0].counterpart, null);

  const professionalConsent = await post(base, `/api/bookings/${booking.id}/location-sharing/consent`, { decision: 'grant' }, workerHeaders);
  assert.equal(professionalConsent.status, 200);
  assert.equal((await professionalConsent.json()).session.status, 'active');
  const update = await post(base, `/api/bookings/${booking.id}/location-sharing/update`, { latitude: 9.01, longitude: 38.75, accuracyMeters: 10 }, workerHeaders);
  assert.equal(update.status, 200);
  state = await fetch(`${base}/api/bookings/${booking.id}/location-sharing`, { headers: customerHeaders }).then(r => r.json());
  assert.equal(state.sessions[0].counterpart.latitude, 9.01);

  const withdrawn = await post(base, `/api/bookings/${booking.id}/location-sharing/consent`, { decision: 'withdraw', workerId }, customerHeaders);
  assert.equal(withdrawn.status, 200);
  assert.equal((await withdrawn.json()).session.status, 'stopped');
  assert.equal((await post(base, `/api/bookings/${booking.id}/location-sharing/update`, { latitude: 9.02, longitude: 38.76 }, workerHeaders)).status, 403);
  state = await fetch(`${base}/api/bookings/${booking.id}/location-sharing`, { headers: customerHeaders }).then(r => r.json());
  assert.equal(state.sessions[0].counterpart, null);
  const stored = (await db.query('SELECT worker_latitude,worker_longitude,customer_latitude,customer_longitude FROM booking_location_sharing WHERE booking_id=$1', [booking.id])).rows[0];
  assert.equal(stored.worker_latitude, null);
  assert.equal(stored.customer_latitude, null);

  await post(base, `/api/bookings/${booking.id}/location-sharing/consent`, { decision: 'grant', workerId }, customerHeaders);
  await post(base, `/api/bookings/${booking.id}/location-sharing/consent`, { decision: 'grant' }, workerHeaders);
  assert.equal((await post(base, `/api/bookings/${booking.id}/location-sharing/update`, { latitude: 9.01, longitude: 38.75 }, workerHeaders)).status, 200);
  const staffLogin = await post(base, '/api/management/auth/login', { email: 'location-admin@example.test', password: staffPassword });
  const staffCookie = staffLogin.headers.get('set-cookie').split(';')[0];
  const cancelled = await fetch(`${base}/api/management/bookings/${booking.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: staffCookie }, body: JSON.stringify({ status: 'cancelled', reason: 'Customer requested cancellation' }) });
  assert.equal(cancelled.status, 200);
  state = await fetch(`${base}/api/bookings/${booking.id}/location-sharing`, { headers: customerHeaders }).then(r => r.json());
  assert.equal(state.sessions[0].status, 'stopped');
  assert.equal(state.sessions[0].counterpart, null);
  assert.ok([403, 404].includes((await post(base, `/api/bookings/${booking.id}/location-sharing/update`, { latitude: 9.03, longitude: 38.77 }, workerHeaders)).status));
  const cancelledPosition = (await db.query('SELECT worker_latitude,customer_latitude FROM booking_location_sharing WHERE booking_id=$1 ORDER BY created_at DESC LIMIT 1', [booking.id])).rows[0];
  assert.equal(cancelledPosition.worker_latitude, null);
});
