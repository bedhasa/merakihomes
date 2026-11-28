// Tests for the behaviour changes approved in docs/architecture/refactoring-roadmap.md
// ("Decision log (2026-11-27)"). TD ids refer to docs/architecture/technical-debt-register.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes, scryptSync } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createApp, demoPaymentsEnabled, migrate } from './index.mjs';
import { haversineMeters } from './geo.mjs';

const hashPassword = (password) => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, 64).toString('hex')}`;
};
const post = (base, path, body, headers = {}) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
const patch = (base, path, body, headers = {}) =>
  fetch(base + path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

async function fixture(t) {
  process.env.SESSION_SECRET = 'test-session-secret-for-owner-decision-tests-32-bytes';
  const db = new PGlite();
  const pool = {
    query: (...args) => db.query(...args),
    connect: async () => ({ query: (...args) => db.query(...args), release() {} }),
  };
  await migrate(pool, { skipBtreeGist: true });
  const password = 'StaffPassword123!';
  await db.query('INSERT INTO staff_users(full_name,email,password_hash,role_id) VALUES($1,$2,$3,$4)', [
    'Decision Admin',
    'admin@example.test',
    hashPassword(password),
    'admin',
  ]);
  const server = createServer(createApp({ pool }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    server.close();
    await db.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const login = await post(base, '/api/management/auth/login', { email: 'admin@example.test', password });
  const staffHeaders = { Cookie: login.headers.get('set-cookie').split(';')[0] };
  return { base, db, staffHeaders };
}

const guestRequest = (overrides = {}) => ({
  serviceId: 'handyman_plumbing',
  name: 'Guest Customer',
  phone: '+251 911 222 333',
  neighborhood: 'Bole',
  address: 'House 4 near the clinic',
  requestedStart: new Date(Date.now() + 86_400_000).toISOString(),
  details: 'Leaking tap',
  ...overrides,
});

function withEnv(t, values) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test('TD-011: booking lookup requires both the reference and the phone used for the request', async (t) => {
  const { base } = await fixture(t);
  const { booking } = await post(base, '/api/bookings', guestRequest()).then((r) => r.json());

  const phoneOnly = await post(base, '/api/bookings/lookup', { mode: 'phone', phone: '+251 911 222 333' });
  assert.equal(phoneOnly.status, 400);
  assert.equal((await phoneOnly.json()).error.code, 'LOOKUP_DETAILS_REQUIRED');

  const referenceOnly = await post(base, '/api/bookings/lookup', {
    mode: 'reference',
    reference: booking.reference,
  });
  assert.equal(referenceOnly.status, 400);

  const wrongPhone = await post(base, '/api/bookings/lookup', {
    mode: 'reference',
    reference: booking.reference,
    phone: '+251 911 000 111',
  });
  assert.equal(wrongPhone.status, 404);
  assert.equal((await wrongPhone.json()).error.code, 'LOOKUP_NOT_FOUND');

  const found = await post(base, '/api/bookings/lookup', {
    mode: 'reference',
    reference: booking.reference.toLowerCase(),
    phone: '+251911222333',
  });
  assert.equal(found.status, 200);
  const body = await found.json();
  assert.equal(body.mode, 'reference');
  assert.equal(body.booking.reference, booking.reference);
  assert.equal(body.bookings, undefined);

  // The legacy body (no mode) keeps its response shape.
  const legacy = await post(base, '/api/bookings/lookup', {
    reference: booking.reference,
    phone: '+251 911 222 333',
  }).then((r) => r.json());
  assert.equal(legacy.booking.reference, booking.reference);
  assert.equal(legacy.mode, undefined);
});

test('TD-011: demo payment receipts no longer include the customer name or phone', async (t) => {
  const { base, db } = await fixture(t);
  const pack = (
    await db.query(
      "INSERT INTO service_packages(service_id,name,description,base_price,currency,estimated_duration_minutes) VALUES('premium_home_cleaning','Receipt Visit','Receipt test package',900,'ETB',120) RETURNING id",
    )
  ).rows[0];
  const request = guestRequest({
    serviceId: 'premium_home_cleaning',
    packageId: pack.id,
    expectedPackagePrice: 900,
    expectedPackageCurrency: 'ETB',
    expectedPackageDuration: 120,
  });
  const { booking } = await post(base, '/api/bookings', request).then((r) => r.json());

  const paid = await post(
    base,
    `/api/bookings/${booking.reference}/demo-payment`,
    { phone: request.phone, provider: 'telebirr', amount: 900, outcome: 'success', paymentType: 'full' },
    { 'Idempotency-Key': 'receipt-pii-1' },
  );
  assert.equal(paid.status, 201);
  const { receipt } = await paid.json();
  assert.equal(receipt.bookingReference, booking.reference);
  assert.equal('customerName' in receipt, false);
  assert.equal('customerPhone' in receipt, false);

  const looked = await post(base, '/api/payments/receipt-lookup', {
    reference: booking.reference,
    phone: request.phone,
  }).then((r) => r.json());
  assert.equal(looked.receipt.transactionReference, receipt.transactionReference);
  assert.equal('customerName' in looked.receipt, false);
  assert.equal('customerPhone' in looked.receipt, false);
});

test('TD-011: demo payments default off in production and can be switched explicitly', async (t) => {
  assert.equal(demoPaymentsEnabled({}), true);
  assert.equal(demoPaymentsEnabled({ NODE_ENV: 'development' }), true);
  assert.equal(demoPaymentsEnabled({ NODE_ENV: 'production' }), false);
  assert.equal(demoPaymentsEnabled({ NODE_ENV: 'production', DEMO_PAYMENTS_ENABLED: 'true' }), true);
  assert.equal(demoPaymentsEnabled({ NODE_ENV: 'development', DEMO_PAYMENTS_ENABLED: 'false' }), false);

  const { base, db } = await fixture(t);
  withEnv(t, { DEMO_PAYMENTS_ENABLED: 'false' });
  assert.deepEqual(await fetch(`${base}/api/public-config`).then((r) => r.json()), { demoPayments: false });

  const pack = (
    await db.query(
      "INSERT INTO service_packages(service_id,name,description,base_price,currency,estimated_duration_minutes) VALUES('premium_home_cleaning','Switch Visit','Switch test package',500,'ETB',60) RETURNING id",
    )
  ).rows[0];
  const request = guestRequest({
    serviceId: 'premium_home_cleaning',
    packageId: pack.id,
    expectedPackagePrice: 500,
    expectedPackageCurrency: 'ETB',
    expectedPackageDuration: 60,
  });
  const { booking } = await post(base, '/api/bookings', request).then((r) => r.json());
  const blocked = await post(
    base,
    `/api/bookings/${booking.reference}/demo-payment`,
    { phone: request.phone, provider: 'telebirr', amount: 500, outcome: 'success', paymentType: 'full' },
    { 'Idempotency-Key': 'switch-off-1' },
  );
  assert.equal(blocked.status, 403);
  assert.equal((await blocked.json()).error.code, 'DEMO_PAYMENTS_DISABLED');
  assert.equal((await db.query('SELECT count(*)::int AS count FROM payments')).rows[0].count, 0);

  process.env.DEMO_PAYMENTS_ENABLED = 'true';
  assert.deepEqual(await fetch(`${base}/api/public-config`).then((r) => r.json()), { demoPayments: true });
});

test('TD-002: cancelling a service item frees its assigned worker', async (t) => {
  const { base, db, staffHeaders } = await fixture(t);
  const { booking } = await post(base, '/api/bookings', guestRequest()).then((r) => r.json());
  const item = (await db.query('SELECT id FROM booking_items WHERE booking_id=$1', [booking.id])).rows[0];
  const worker = (
    await db.query(
      "INSERT INTO workers(full_name,operational_status,eligibility_status) VALUES('Freed Worker','active','eligible') RETURNING id",
    )
  ).rows[0];
  const assignment = (
    await db.query(
      "INSERT INTO booking_assignments(booking_id,booking_item_id,worker_id,assignment_status,assigned_by,assignment_start,assignment_end) VALUES($1,$2,$3,'assigned','test',now()+interval '1 day',now()+interval '1 day 2 hours') RETURNING id",
      [booking.id, item.id, worker.id],
    )
  ).rows[0];

  const cancelled = await patch(
    base,
    `/api/management/bookings/${booking.id}/items/${item.id}/status`,
    { status: 'cancelled', reason: 'Customer no longer needs this service' },
    staffHeaders,
  );
  assert.equal(cancelled.status, 200, await cancelled.clone().text());
  assert.equal(
    (await db.query('SELECT assignment_status FROM booking_assignments WHERE id=$1', [assignment.id])).rows[0]
      .assignment_status,
    'cancelled',
  );
});

test('TD-003: a new price quote withdraws earlier open quotes, so only the newest can be accepted', async (t) => {
  const { base, db, staffHeaders } = await fixture(t);
  const customer = await post(base, '/api/customers/register', {
    name: 'Quote Customer',
    email: 'quotes@example.test',
    phone: '+251 911 222 333',
    password: 'CustomerPassword1',
  });
  const customerCookie = customer.headers.get('set-cookie').split(';')[0];
  const { booking } = await post(base, '/api/bookings', guestRequest({ name: 'Quote Customer' }), {
    Cookie: customerCookie,
  }).then((r) => r.json());
  const item = (await db.query('SELECT id,currency FROM booking_items WHERE booking_id=$1', [booking.id]))
    .rows[0];
  const quote = (amount) =>
    post(
      base,
      `/api/management/bookings/${booking.id}/items/${item.id}/price-proposals`,
      { amount, currency: item.currency.trim(), reason: `Quote of ${amount}` },
      staffHeaders,
    ).then((r) => r.json());

  const first = (await quote(600)).proposal;
  const second = (await quote(800)).proposal;
  const statuses = Object.fromEntries(
    (
      await db.query('SELECT id,proposal_status FROM booking_price_proposals WHERE booking_item_id=$1', [
        item.id,
      ])
    ).rows.map((r) => [r.id, r.proposal_status]),
  );
  assert.equal(statuses[first.id], 'withdrawn');
  assert.equal(statuses[second.id], 'sent');

  const approvals = await fetch(`${base}/api/customers/me/approvals`, {
    headers: { Cookie: customerCookie },
  }).then((r) => r.json());
  const priceApprovals = approvals.approvals.filter((a) => a.kind === 'price');
  assert.deepEqual(
    priceApprovals.map((a) => a.id),
    [second.id],
  );

  const acceptOld = await patch(
    base,
    `/api/customers/me/approvals/price/${first.id}`,
    { decision: 'accepted' },
    { Cookie: customerCookie },
  );
  assert.notEqual(acceptOld.status, 200);
  assert.equal(
    (await db.query('SELECT agreed_amount FROM bookings WHERE id=$1', [booking.id])).rows[0].agreed_amount,
    null,
  );
});

test('TD-012: public professional endpoints round coordinates; the professional still sees the exact position', async (t) => {
  const { base, db } = await fixture(t);
  const password = 'WorkerPassword123!';
  const worker = (
    await db.query(`INSERT INTO workers(full_name,operational_status,eligibility_status,service_area,base_rate,rate_currency,rating,review_count)
    VALUES('Precise Worker','active','eligible','Bole',450,'ETB',4.8,10) RETURNING id`)
  ).rows[0];
  await db.query('INSERT INTO worker_auth(worker_id,phone,password_hash) VALUES($1,$2,$3)', [
    worker.id,
    '251911555666',
    hashPassword(password),
  ]);
  const { accessToken } = await post(base, '/api/professionals/auth/login', {
    phone: '+251 911 555 666',
    password,
  }).then((r) => r.json());
  const headers = { Authorization: `Bearer ${accessToken}` };
  await patch(base, '/api/professionals/me/location-settings', { shareLocation: true }, headers);
  const exact = { latitude: 9.012345, longitude: 38.765432 };
  assert.equal(
    (await post(base, '/api/professionals/me/location', { ...exact, accuracyMeters: 8 }, headers)).status,
    200,
  );

  const serviceId = 'premium_home_cleaning';
  await db.query(
    "INSERT INTO worker_services(worker_id,service_id,qualification_status,qualification_name) VALUES($1,$2,'verified','Home cleaning')",
    [worker.id, serviceId],
  );
  await db.query(
    "INSERT INTO worker_skills(worker_id,skill_id,verification_status,verified_at) SELECT $1,skill_id,'verified',now() FROM service_skill_requirements WHERE service_id=$2 AND is_mandatory",
    [worker.id, serviceId],
  );
  const requested = new Date(Date.now() + 2 * 86_400_000);
  requested.setUTCHours(6, 0, 0, 0);
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Addis_Ababa' }).format(requested);
  await db.query(
    "INSERT INTO worker_availability(worker_id,specific_date,start_time,end_time) VALUES($1,$2,'00:00','23:59')",
    [worker.id, day],
  );

  const origin = { latitude: 9, longitude: 38.75 };
  const query = new URLSearchParams({
    latitude: String(origin.latitude),
    longitude: String(origin.longitude),
    radiusKm: '5',
    serviceId,
    requestedStart: requested.toISOString(),
    sort: 'distance',
  });
  const nearby = await fetch(`${base}/api/professionals/nearby?${query}`).then((r) => r.json());
  const listed = nearby.professionals.find((p) => p.id === worker.id);
  assert.ok(listed, JSON.stringify(nearby));
  assert.equal(listed.latitude, 9.012);
  assert.equal(listed.longitude, 38.765);
  assert.equal(listed.locationApproximate, true);
  assert.ok(listed.accuracyMeters >= 100);
  // Distance is computed from the rounded position, so it cannot be used to recover the exact one.
  assert.equal(listed.distanceMeters, haversineMeters(origin.latitude, origin.longitude, 9.012, 38.765));

  const profile = await fetch(`${base}/api/professionals/${worker.id}?latitude=9&longitude=38.75`).then((r) =>
    r.json(),
  );
  assert.equal(profile.professional.latitude, 9.012);
  assert.equal(profile.professional.longitude, 38.765);

  const own = await fetch(`${base}/api/professionals/me`, { headers }).then((r) => r.json());
  const ownLocation = own.professional ?? own;
  assert.equal(Number(ownLocation.latitude), exact.latitude);
  assert.equal(Number(ownLocation.longitude), exact.longitude);
});

test('TD-006: two workers on one booking can each open a location-sharing session', async (t) => {
  const { base, db } = await fixture(t);
  const { booking } = await post(base, '/api/bookings', guestRequest()).then((r) => r.json());
  const workers = [];
  for (const name of ['Worker One', 'Worker Two'])
    workers.push(
      (
        await db.query(
          "INSERT INTO workers(full_name,operational_status,eligibility_status) VALUES($1,'active','eligible') RETURNING id",
          [name],
        )
      ).rows[0].id,
    );
  for (const workerId of workers) {
    await db.query(
      "INSERT INTO booking_location_sharing(booking_id,worker_id,status,expires_at) VALUES($1,$2,'pending_customer_consent',now()+interval '1 hour')",
      [booking.id, workerId],
    );
  }
  assert.equal(
    (
      await db.query('SELECT count(*)::int AS count FROM booking_location_sharing WHERE booking_id=$1', [
        booking.id,
      ])
    ).rows[0].count,
    2,
  );
  // Still one open session per worker on a booking.
  await assert.rejects(
    db.query(
      "INSERT INTO booking_location_sharing(booking_id,worker_id,status,expires_at) VALUES($1,$2,'active',now()+interval '1 hour')",
      [booking.id, workers[0]],
    ),
    (error) => /duplicate key|unique/i.test(error.message),
  );
});
