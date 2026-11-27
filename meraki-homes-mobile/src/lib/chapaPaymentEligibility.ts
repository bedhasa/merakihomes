export function isMobileChapaPaymentEligible(input: {
  authenticated: boolean;
  agreedAmount: number | string | null;
  remainingBalance: number | string | null;
  bookingStatus: string;
}): boolean {
  const agreedAmount = input.agreedAmount === null ? 0 : Number(input.agreedAmount);
  const remainingBalance = input.remainingBalance === null ? 0 : Number(input.remainingBalance);
  return input.authenticated
    && Number.isFinite(agreedAmount) && agreedAmount > 0
    && Number.isFinite(remainingBalance) && remainingBalance > 0
    && !['cancelled', 'rejected'].includes(input.bookingStatus.toLowerCase());
}
