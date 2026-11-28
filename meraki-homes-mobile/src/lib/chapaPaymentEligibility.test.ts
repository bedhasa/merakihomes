import assert from 'node:assert/strict';
import test from 'node:test';
import { isMobileChapaPaymentEligible } from './chapaPaymentEligibility';

const eligibleBooking = {
  authenticated: true,
  agreedAmount: '1250.00',
  remainingBalance: '1250.00',
  bookingStatus: 'approved',
};

test('shows Chapa eligibility for an authenticated customer with an approved unpaid balance', () => {
  assert.equal(isMobileChapaPaymentEligible(eligibleBooking), true);
});

test('does not show Chapa eligibility to guests, unapproved, fully paid, or terminal bookings', () => {
  assert.equal(isMobileChapaPaymentEligible({ ...eligibleBooking, authenticated: false }), false);
  assert.equal(isMobileChapaPaymentEligible({ ...eligibleBooking, agreedAmount: null }), false);
  assert.equal(isMobileChapaPaymentEligible({ ...eligibleBooking, agreedAmount: 0 }), false);
  assert.equal(isMobileChapaPaymentEligible({ ...eligibleBooking, remainingBalance: 0 }), false);
  assert.equal(isMobileChapaPaymentEligible({ ...eligibleBooking, bookingStatus: 'cancelled' }), false);
  assert.equal(isMobileChapaPaymentEligible({ ...eligibleBooking, bookingStatus: 'rejected' }), false);
});
