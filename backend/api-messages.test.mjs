// TD-049: customer-facing API errors are translated even where the route passes only English text.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { codeForMessage, localizeFields } from './i18n.mjs';
import { createApp, migrate } from './index.mjs';

const en = JSON.parse(readFileSync(new URL('../shared/locales/en.json', import.meta.url), 'utf8'));
const am = JSON.parse(readFileSync(new URL('../shared/locales/am.json', import.meta.url), 'utf8'));

test('codeForMessage maps exact English catalog text to its code', () => {
  assert.equal(codeForMessage('Search with at least 3 characters.'), 'ADDRESS_SEARCH_TOO_SHORT');
  assert.equal(codeForMessage('Search with at least 3 characters'), null, 'exact match only');
  assert.equal(codeForMessage('Some unrelated staff message.'), null);
  assert.equal(codeForMessage(undefined), null);
});

test('localizeFields translates plain-English field messages that match the catalog', () => {
  const fields = localizeFields('am', { latitude: 'Latitude must be between -90 and 90.', note: 'Custom note' });
  assert.equal(fields.latitude, am.errors.LATITUDE_RANGE);
  assert.equal(fields.note, 'Custom note');
});

test('API errors without a code are returned in Amharic with a code; English is unchanged', async t => {
  process.env.SESSION_SECRET = 'test-session-secret-for-api-message-tests-32-bytes';
  const db = new PGlite();
  const pool = { query: (...args) => db.query(...args), connect: async () => ({ query: (...args) => db.query(...args), release() {} }) };
  await migrate(pool, { skipBtreeGist: true });
  const server = createServer(createApp({ pool }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { server.close(); await db.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;

  const english = await fetch(`${base}/api/location/search?q=ab`).then(r => r.json());
  assert.deepEqual(english.error, { message: 'Search with at least 3 characters.', code: 'ADDRESS_SEARCH_TOO_SHORT' });

  const amharic = await fetch(`${base}/api/location/search?q=ab`, { headers: { 'Accept-Language': 'am' } }).then(r => r.json());
  assert.deepEqual(amharic.error, { message: am.errors.ADDRESS_SEARCH_TOO_SHORT, code: 'ADDRESS_SEARCH_TOO_SHORT' });

  // Catalogue names/descriptions are translated only while the database text matches the catalog's English source.
  await db.query("UPDATE services SET name='Laundry, Ironing & Folding' WHERE id='maid_laundry'");
  const enServices = await fetch(`${base}/api/services`).then(r => r.json());
  const amServices = await fetch(`${base}/api/services`, { headers: { 'Accept-Language': 'am' } }).then(r => r.json());
  const byId = list => Object.fromEntries(list.services.map(s => [s.id, s]));
  assert.equal(byId(enServices).premium_home_cleaning.name, 'Premium Home Cleaning');
  assert.equal(byId(amServices).premium_home_cleaning.name, am.serviceCatalog.premium_home_cleaning.name);
  assert.equal(byId(amServices).premium_home_cleaning.description, am.serviceCatalog.premium_home_cleaning.description);
  assert.equal(byId(amServices).maid_laundry.name, 'Laundry, Ironing & Folding', 'a staff-edited name is never paired with a stale translation');
  assert.equal(byId(amServices).maid_laundry.description, am.serviceCatalog.maid_laundry.description, 'the unchanged description is still translated');
  const amDetail = await fetch(`${base}/api/services/office_cleaning`, { headers: { 'Accept-Language': 'am' } }).then(r => r.json());
  assert.equal(amDetail.service.name, am.serviceCatalog.office_cleaning.name);

  // A route that already passes a code keeps it.
  const missing = await fetch(`${base}/api/services/not-a-service`, { headers: { 'Accept-Language': 'am' } }).then(r => r.json());
  assert.equal(missing.error.code, 'BOOKING_SERVICE_UNAVAILABLE');
  assert.equal(missing.error.message, am.errors.BOOKING_SERVICE_UNAVAILABLE);
});

// Drift guard: editing a server message without updating the catalog would silently drop its translation.
test('every errors.* entry is used by its code or by its exact English text', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const files = [];
  const walk = dir => {
    for (const name of readdirSync(dir)) {
      if (['node_modules', '.next', 'dist', 'uploads', 'locales'].includes(name)) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(mjs|ts|tsx)$/.test(name) && !/\.test\./.test(name)) files.push(path);
    }
  };
  for (const dir of ['backend', 'frontend/src', 'frontend/app', 'shared', 'meraki-homes-mobile/src', 'meraki-homes-mobile/app']) walk(join(root, dir));
  const source = files.map(file => readFileSync(file, 'utf8')).join('\n');
  // Pre-existing catalog entries that nothing references yet (kept; not part of the drift this test guards against).
  const knownUnused = new Set(['AUTH_SESSION_EXPIRED']);
  const unused = Object.entries(en.errors).filter(([code, text]) => !knownUnused.has(code) && !source.includes(`'${code}'`) && !source.includes(`"${code}"`) && !source.includes(text));
  assert.deepEqual(unused.map(([code]) => code), []);
});
