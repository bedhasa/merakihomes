import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { PGlite } from '@electric-sql/pglite';
import { geoapifyReverseUrl, geoapifySearchText, geoapifySearchUrl, mapGeoapifyReverseFeature, mapGeoapifySearchFeatures } from './geo.mjs';
import { createApp, migrate } from './index.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
dotenv.config({ path: resolve(root, '.env') });
dotenv.config({ path: resolve(root, '.env.dev') });

test('maps Geoapify features and drops invalid or non-Ethiopia coordinates', () => {
  const results = mapGeoapifySearchFeatures([
    { properties: { formatted: 'Bole, Addis Ababa, Ethiopia', lat: 9.01, lon: 38.76, country_code: 'et', place_id: 'p1', neighbourhood: 'Bole' } },
    { properties: { formatted: 'Null island', lat: 0, lon: 0, country_code: 'et' } },
    { properties: { formatted: 'Nairobi', lat: -1.29, lon: 36.82, country_code: 'ke' } },
    { properties: { formatted: '', lat: 9.02, lon: 38.75, country_code: 'et' } },
  ]);
  assert.equal(results.length, 1);
  assert.equal(results[0].latitude, 9.01);
  assert.equal(results[0].longitude, 38.76);
  assert.equal(results[0].placeId, 'p1');
});

test('search URL keeps the typed query and does not rewrite coordinates', () => {
  const url = geoapifySearchUrl('Kazanchis', 'test-key');
  assert.equal(url.searchParams.get('text'), 'Kazanchis');
  assert.equal(url.searchParams.get('filter'), 'countrycode:et');
  assert.equal(url.searchParams.get('bias'), 'proximity:38.7578,9.03');
  assert.equal(geoapifySearchText('  Bole Medhanialem  '), 'Bole Medhanialem');
  const reverse = geoapifyReverseUrl(9.03, 38.75, 'test-key');
  assert.equal(reverse.searchParams.get('lat'), '9.03');
  assert.equal(reverse.searchParams.get('lon'), '38.75');
});

test('reverse mapping keeps provider formatted address without inventing one', () => {
  assert.deepEqual(mapGeoapifyReverseFeature({ properties: { formatted: 'Bole, Addis Ababa', place_id: 'x', neighbourhood: 'Bole', name: 'Bole' } }), {
    formattedAddress: 'Bole, Addis Ababa',
    placeId: 'x',
    area: 'Bole',
    landmark: 'Bole',
  });
  assert.equal(mapGeoapifyReverseFeature({}).formattedAddress, null);
});

test('location search reports a missing Geoapify key instead of fake results', async t => {
  process.env.SESSION_SECRET = 'test-session-secret-for-geoapify-suite-32b';
  const original = process.env.GEOAPIFY_API_KEY;
  delete process.env.GEOAPIFY_API_KEY;
  const db = new PGlite();
  const pool = { query: (...args) => db.query(...args), connect: async () => ({ query: (...args) => db.query(...args), release() {} }) };
  await migrate(pool, { skipBtreeGist: true });
  const server = createServer(createApp({ pool }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    server.close();
    await db.close();
    if (original !== undefined) process.env.GEOAPIFY_API_KEY = original;
  });
  const response = await fetch(`${base}/api/location/search?q=Bole`);
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.match(body.error.message, /not configured/i);
  assert.equal(body.results, undefined);
  assert.equal(JSON.stringify(body).includes('apiKey'), false);
});

test('mobile app config injects Android Maps keys into native config only', () => {
  const source = readFileSync(resolve(root, 'meraki-homes-mobile/app.config.ts'), 'utf8');
  assert.match(source, /googleMaps:\s*\{\s*apiKey:\s*androidGoogleMapsApiKey/);
  assert.match(source, /googleMapsAndroidConfigured:\s*Boolean/);
  assert.doesNotMatch(source, /EXPO_PUBLIC_GOOGLE/);
  assert.doesNotMatch(source, /GEOAPIFY/);
});

test('live Geoapify search when GEOAPIFY_API_KEY is configured', async t => {
  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  if (!apiKey) {
    t.skip('GEOAPIFY_API_KEY is not configured');
    return;
  }
  const response = await fetch(geoapifySearchUrl('Bole Addis Ababa', apiKey), { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  if (response.status === 401 || response.status === 403) {
    assert.fail('GEOAPIFY_API_KEY is present but Geoapify rejected it.');
  }
  assert.equal(response.ok, true);
  const data = await response.json();
  const results = mapGeoapifySearchFeatures(data.features);
  assert.ok(results.length >= 1, 'Expected at least one Ethiopia-relevant result');
  assert.ok(results[0].latitude > 3 && results[0].latitude < 15);
  assert.ok(results[0].longitude > 32 && results[0].longitude < 48);
});
