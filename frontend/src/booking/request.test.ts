import test from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_SERVICES } from '../../../shared/data/mockServices';
import { createBookingRequest, isValidContact } from './request';

test('guest contact validation rejects blank names and malformed phone numbers', () => {
  assert.equal(isValidContact('', '+251 911 234 567'), false);
  assert.equal(isValidContact('Mimi', 'abc'), false);
  assert.equal(isValidContact(' Mimi ', '+251 911 234 567'), true);
});

test('a submitted request snapshots the estimate without inventing payment or assignment', () => {
  const service = MOCK_SERVICES[0];
  const createdAt = new Date('2026-10-22T06:00:00.000Z');
  const request = createBookingRequest({
    service,
    details: '  Kitchen and bathroom focus  ',
    area: 'Bole Atlas',
    address: 'House 4, near the main road',
    visitAt: '2026-10-24T08:30',
    name: '  Hana Bekele ',
    phone: ' +251 911 234 567 ',
    email: ' hana@example.com ',
    workerPreference: 'Operations-assisted assignment requested',
  }, createdAt);

  assert.equal(request.status, 'requested');
  assert.equal(request.paymentStatus, 'pending');
  assert.equal(request.paymentMethod, 'not_selected');
  assert.equal(request.workerId, undefined);
  assert.equal(request.workerName, undefined);
  assert.equal(request.workerPreference, 'Operations-assisted assignment requested');
  assert.equal(request.totalPrice, service.basePrice);
  assert.equal(request.customerName, 'Hana Bekele');
  assert.equal(request.customerEmail, 'hana@example.com');
  assert.equal(request.neighborhood, 'Bole Atlas');
  assert.equal(request.notes, 'Kitchen and bathroom focus');
});

