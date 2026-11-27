import assert from 'node:assert/strict';
import test from 'node:test';
import { ChapaInitializationResponseError, parseChapaInitializationResponse } from './chapaPaymentResponse';

const validResponse = {
  checkoutUrl: 'https://checkout.chapa.co/checkout/payment/synthetic-test',
  transactionReference: 'meraki-synthetic-reference',
  message: 'Hosted Link',
  status: 'success',
  data: { checkout_url: 'https://checkout.chapa.co/checkout/payment/synthetic-test' },
};

test('accepts and returns a valid backend hosted checkout URL', () => {
  assert.deepEqual(parseChapaInitializationResponse(validResponse), {
    ...validResponse,
    checkoutUrl: validResponse.checkoutUrl,
  });
});

test('accepts the nested checkout URL when the top-level field is absent', () => {
  const { checkoutUrl: _checkoutUrl, ...nestedOnly } = validResponse;
  assert.equal(parseChapaInitializationResponse(nestedOnly).checkoutUrl, validResponse.checkoutUrl);
});

test('rejects missing or malformed checkout URLs', () => {
  const invalidResponses = [
    { ...validResponse, checkoutUrl: undefined, data: { checkout_url: undefined } },
    ...['', 'not a URL', 'http://checkout.chapa.co/pay', 'https://evil.example/pay', 'https://user:pass@checkout.chapa.co/pay']
      .map(checkoutUrl => ({ ...validResponse, checkoutUrl })),
  ];
  for (const response of invalidResponses) {
    assert.throws(
      () => parseChapaInitializationResponse(response),
      (error: unknown) => error instanceof ChapaInitializationResponseError,
    );
  }
});

test('rejects responses without a successful status or transaction reference', () => {
  assert.throws(() => parseChapaInitializationResponse({ ...validResponse, status: 'failed' }), ChapaInitializationResponseError);
  assert.throws(() => parseChapaInitializationResponse({ ...validResponse, transactionReference: '' }), ChapaInitializationResponseError);
});
