// TD-030: customer-facing "from" prices come from the database, not a hard-coded client table.
// Decision log (2026-11-27): show the cheapest bookable package, otherwise "price after review".
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { PGlite } from '@electric-sql/pglite';
import { createApp, migrate } from './index.mjs';

async function fixture(t) {
  process.env.SESSION_SECRET = 'test-session-secret-for-pricing-tests-at-least-32-bytes';
  const db = new PGlite();
  const pool = { query: (...args) => db.query(...args), connect: async () => ({ query: (...args) => db.query(...args), release() {} }) };
  await migrate(pool, { skipBtreeGist: true });
  const server = createServer(createApp({ pool }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { server.close(); await db.close(); });
  return { base: `http://127.0.0.1:${server.address().port}`, db };
}

const addPackage = (db, serviceId, name, price, currency, extra = '') => db.query(
  `INSERT INTO service_packages(service_id,name,description,base_price,currency,estimated_duration_minutes${extra ? ',' + extra.split('=')[0] : ''})
   VALUES($1,$2,'',$3,$4,60${extra ? ',' + extra.split('=')[1] : ''})`, [serviceId, name, price, currency]);

test('TD-030: public services expose the cheapest bookable package as fromPrice', async t => {
  const { base, db } = await fixture(t);
  await addPackage(db, 'office_cleaning', 'Large office', 4200, 'ETB');
  await addPackage(db, 'office_cleaning', 'Small office', 1800, 'ETB');
  await addPackage(db, 'office_cleaning', 'Dollar package', 5, 'USD');                                // ETB is preferred over a lower USD number
  await addPackage(db, 'office_cleaning', 'Retired', 100, 'ETB', 'is_active=FALSE');                  // inactive: ignored
  await addPackage(db, 'office_cleaning', 'Next month', 50, 'ETB', "effective_from=now()+interval '30 days'"); // not yet bookable: ignored
  await addPackage(db, 'gardening_outdoor', 'Only dollars', 20, 'USD');

  const { services } = await fetch(`${base}/api/services`).then(r => r.json());
  const byId = Object.fromEntries(services.map(s => [s.id, s]));
  assert.deepEqual(byId.office_cleaning.fromPrice, { amount: 1800, currency: 'ETB' });
  assert.deepEqual(byId.gardening_outdoor.fromPrice, { amount: 20, currency: 'USD' });
  assert.equal(byId.premium_home_cleaning.fromPrice, null, 'no packages and quotation pricing: price after review');
  assert.equal('from_price' in byId.office_cleaning, false, 'internal join columns are not leaked');
  // Existing fields are unchanged.
  assert.equal(typeof byId.office_cleaning.basePrice, 'number');
  assert.equal(byId.office_cleaning.pricing_type, 'quotation');

  const detail = await fetch(`${base}/api/services/office_cleaning`).then(r => r.json());
  assert.deepEqual(detail.service.fromPrice, { amount: 1800, currency: 'ETB' });
  assert.deepEqual(detail.packages.map(p => p.name), ['Dollar package', 'Small office', 'Large office'],
    'only packages the booking route accepts are listed (inactive and not-yet-effective ones are hidden)');

  const empty = await fetch(`${base}/api/services/premium_home_cleaning`).then(r => r.json());
  assert.equal(empty.service.fromPrice, null);
  assert.deepEqual(empty.packages, []);
});

test('TD-030: a fixed-price service without packages uses its own price', async t => {
  const { base, db } = await fixture(t);
  await db.query("UPDATE services SET pricing_type='fixed',base_price=750,currency='ETB' WHERE id='maid_laundry'");
  const { services } = await fetch(`${base}/api/services`).then(r => r.json());
  assert.deepEqual(services.find(s => s.id === 'maid_laundry').fromPrice, { amount: 750, currency: 'ETB' });
  const detail = await fetch(`${base}/api/services/maid_laundry`).then(r => r.json());
  assert.deepEqual(detail.service.fromPrice, { amount: 750, currency: 'ETB' });
});
