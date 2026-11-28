import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidContact } from './request';

test('guest contact validation rejects blank names and malformed phone numbers', () => {
  assert.equal(isValidContact('', '+251 911 234 567'), false);
  assert.equal(isValidContact('Mimi', 'abc'), false);
  assert.equal(isValidContact(' Mimi ', '+251 911 234 567'), true);
});
