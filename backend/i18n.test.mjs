import test from 'node:test';
import assert from 'node:assert/strict';
import { apiMessage, isUiLocale, localizeFields, resolveRequestLocale } from './i18n.mjs';

test('resolveRequestLocale prefers X-Locale over Accept-Language', () => {
  const req = {
    get(name) {
      if (name === 'X-Locale') return 'am';
      if (name === 'Accept-Language') return 'en-US,en;q=0.9';
      return '';
    },
  };
  assert.equal(resolveRequestLocale(req), 'am');
});

test('resolveRequestLocale reads Accept-Language primary tag', () => {
  const req = {
    get(name) {
      if (name === 'Accept-Language') return 'am-ET,am;q=0.9,en;q=0.8';
      return '';
    },
  };
  assert.equal(resolveRequestLocale(req), 'am');
  assert.equal(resolveRequestLocale({ get: () => '' }), 'en');
});

test('apiMessage localizes known error and validation keys', () => {
  assert.equal(isUiLocale('am'), true);
  assert.match(apiMessage('en', 'AUTH_INVALID_CREDENTIALS'), /incorrect/i);
  assert.match(apiMessage('am', 'AUTH_INVALID_CREDENTIALS'), /ኢሜይል|ይለፍ/);
  assert.match(apiMessage('en', 'nameRequired'), /name/i);
  assert.match(apiMessage('am', 'nameRequired'), /ስም/);
  assert.equal(apiMessage('en', 'NOT_A_REAL_KEY', 'fallback'), 'fallback');
});

test('localizeFields maps catalog keys and leaves plain text', () => {
  const fields = localizeFields('en', { name: 'nameRequired', note: 'Custom note' });
  assert.match(fields.name, /name/i);
  assert.equal(fields.note, 'Custom note');
});
