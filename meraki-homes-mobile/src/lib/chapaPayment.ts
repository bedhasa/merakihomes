import { ApiError, api, postJson } from './api';
import {
  ChapaInitializationResponseError,
  parseChapaInitializationResponse,
  type ChapaInitializationResult,
} from './chapaPaymentResponse';
export { parseChapaInitializationResponse } from './chapaPaymentResponse';

export type ChapaInitializationInput = {
  bookingReference: string;
  callbackUrl: string;
  returnUrl?: string;
};

export type { ChapaInitializationResult } from './chapaPaymentResponse';

/** Initialize checkout using the authenticated API client; payment details stay server-side. */
export async function initializeChapaPayment(input: ChapaInitializationInput): Promise<ChapaInitializationResult> {
  if (!input || typeof input.bookingReference !== 'string' || !input.bookingReference.trim()) {
    throw new ApiError('A booking reference is required to start payment.', 400);
  }
  if (typeof input.callbackUrl !== 'string' || !input.callbackUrl.trim()) {
    throw new ApiError('A callback URL is required to start payment.', 400);
  }

  const body = {
    bookingReference: input.bookingReference.trim(),
    callbackUrl: input.callbackUrl.trim(),
    ...(typeof input.returnUrl === 'string' && input.returnUrl.trim() ? { returnUrl: input.returnUrl.trim() } : {}),
  };
  const response = await api<unknown>('/payments/chapa/initialize', postJson(body));
  try {
    return parseChapaInitializationResponse(response);
  } catch (error) {
    if (error instanceof ChapaInitializationResponseError) {
      throw new ApiError(error.message, 502, undefined, 'CHAPA_INITIALIZATION_FAILED');
    }
    throw error;
  }
}
