export type ChapaInitializationResult = {
  checkoutUrl: string;
  transactionReference: string;
  message: string;
  status: 'success';
  data: { checkout_url: string };
};

export class ChapaInitializationResponseError extends Error {
  constructor() {
    super('The payment service returned an invalid checkout response. Please try again.');
    this.name = 'ChapaInitializationResponseError';
  }
}

function validatedCheckoutUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new ChapaInitializationResponseError();
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'checkout.chapa.co' || url.username || url.password) {
      throw new ChapaInitializationResponseError();
    }
    return url.href;
  } catch (error) {
    if (error instanceof ChapaInitializationResponseError) throw error;
    throw new ChapaInitializationResponseError();
  }
}

/** Validate the backend response before exposing its hosted checkout URL to the caller. */
export function parseChapaInitializationResponse(value: unknown): ChapaInitializationResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ChapaInitializationResponseError();
  const response = value as Record<string, unknown>;
  if (response.status !== 'success' || typeof response.transactionReference !== 'string' || !response.transactionReference.trim()) {
    throw new ChapaInitializationResponseError();
  }

  const nestedData = response.data && typeof response.data === 'object' && !Array.isArray(response.data)
    ? response.data as Record<string, unknown>
    : undefined;
  const checkoutUrl = validatedCheckoutUrl(response.checkoutUrl ?? nestedData?.checkout_url);

  return {
    checkoutUrl,
    transactionReference: response.transactionReference.trim(),
    message: typeof response.message === 'string' ? response.message : '',
    status: 'success',
    data: { checkout_url: checkoutUrl },
  };
}
