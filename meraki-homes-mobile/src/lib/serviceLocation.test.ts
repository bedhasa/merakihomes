import assert from 'node:assert/strict';
import test from 'node:test';
import { locationFromParams, locationToParams } from './serviceLocation';

test('round-trips a confirmed GPS location through booking params', () => {
  const original = {
    latitude: 9.01012,
    longitude: 38.76123,
    formattedAddress: 'Bole Medhanialem, Addis Ababa',
    placeId: 'place-1',
    area: 'Bole',
    landmark: 'Medhanialem Church',
    locationSource: 'gps' as const,
    accuracy: 18,
  };
  const parsed = locationFromParams(locationToParams(original));
  assert.deepEqual(parsed, original);
});

test('rejects incomplete or invalid coordinates', () => {
  assert.equal(locationFromParams({}), null);
  assert.equal(locationFromParams({ latitude: '91', longitude: '38' }), null);
  assert.equal(locationFromParams({ latitude: '9', longitude: 'abc' }), null);
});
