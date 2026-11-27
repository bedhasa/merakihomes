import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import { Button, C, Card, Empty, ErrorBanner, Loading, Page, Title } from '../../src/components/ui';

type ReconciliationResult = {
  transactionReference: string;
  bookingReference: string;
  paymentStatus: 'verified' | 'pending_verification' | 'failed';
  duplicate: boolean;
};

type BookingDetails = {
  booking: { reference: string; currency: string };
  payment: { amountPaid: number; balance: number; status: string };
};

export default function ChapaPaymentReturnScreen() {
  // Only tx_ref is consumed. Browser status parameters are deliberately ignored.
  const { tx_ref: rawTransactionReference } = useLocalSearchParams<{ tx_ref?: string | string[] }>();
  const transactionReference = typeof rawTransactionReference === 'string' ? rawTransactionReference.trim() : '';
  const { customer, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const requestKey = useRef('');
  const [retryCount, setRetryCount] = useState(0);
  const [reconciliation, setReconciliation] = useState<ReconciliationResult | null>(null);
  const [reconciliationError, setReconciliationError] = useState('');
  const [reconciling, setReconciling] = useState(false);

  useEffect(() => {
    if (!transactionReference) return;
    const key = `${transactionReference}:${retryCount}`;
    if (requestKey.current === key) return;
    requestKey.current = key;
    setReconciliation(null);
    setReconciliationError('');
    setReconciling(true);

    // The public callback endpoint verifies with Chapa and reconciles the stored payment.
    void api<ReconciliationResult>(
      `/payments/chapa/callback?tx_ref=${encodeURIComponent(transactionReference)}`,
      {},
      false,
    ).then((result) => {
      if (requestKey.current !== key) return;
      if (!result || typeof result.bookingReference !== 'string' || !result.bookingReference.trim()) {
        throw new Error('The server did not return a booking reference for this payment.');
      }
      if (!['verified', 'pending_verification', 'failed'].includes(result.paymentStatus)) {
        throw new Error('The server returned an unknown payment status.');
      }
      setReconciliation(result);
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }).catch((error: unknown) => {
      if (requestKey.current !== key) return;
      setReconciliationError(error instanceof Error ? error.message : 'Could not check this payment. Please try again.');
    }).finally(() => {
      if (requestKey.current === key) setReconciling(false);
    });
  }, [transactionReference, retryCount, queryClient]);

  const bookingQuery = useQuery({
    queryKey: ['booking', reconciliation?.bookingReference],
    queryFn: () => api<BookingDetails>(`/customers/me/bookings/${encodeURIComponent(reconciliation!.bookingReference)}`),
    enabled: Boolean(customer && reconciliation?.bookingReference),
  });

  useEffect(() => {
    if (customer && reconciliation?.bookingReference) {
      void queryClient.invalidateQueries({ queryKey: ['booking', reconciliation.bookingReference] });
    }
  }, [customer, reconciliation?.bookingReference, queryClient]);

  const retry = () => setRetryCount((count) => count + 1);
  const openBooking = () => {
    const reference = bookingQuery.data?.booking.reference;
    if (!reference) return;
    router.replace({ pathname: '/booking-details/[reference]', params: { reference } });
  };

  if (!transactionReference) {
    return <Page><Title subtitle="We could not identify the payment to check.">Payment status</Title><Empty title="Transaction reference missing" body="Return to Meraki Homes from the Chapa checkout link, or open your booking and refresh its payment status." action={<Button title="Go to bookings" onPress={() => router.replace('/(tabs)/bookings')} />} /></Page>;
  }

  if (reconciling) return <Page><Title subtitle="Checking the payment directly with Meraki Homes.">Payment status</Title><Loading /></Page>;

  if (reconciliationError) {
    return <Page><Title subtitle="We could not confirm the payment status yet.">Payment status</Title><ErrorBanner message={reconciliationError} /><TextBlock>Try again when your internet connection is available. A browser return alone does not confirm payment.</TextBlock>{!authLoading && !customer ? <TextBlock>Sign in to view private booking details after the payment status is checked.</TextBlock> : null}{!authLoading && !customer ? <Button title="Sign in" onPress={() => router.push('/(auth)/login')} /> : null}<Button title="Retry verification" onPress={retry} /><Button title="Go to bookings" variant="outline" onPress={() => router.replace('/(tabs)/bookings')} /></Page>;
  }

  if (!reconciliation) return <Page><Title>Payment status</Title><Loading /></Page>;

  const paymentStatus = reconciliation.paymentStatus;
  const heading = paymentStatus === 'verified' ? 'Payment verified' : paymentStatus === 'pending_verification' ? 'Payment pending' : 'Payment failed';
  const description = paymentStatus === 'verified'
    ? 'Meraki Homes verified this payment with Chapa.'
    : paymentStatus === 'pending_verification'
      ? 'Chapa has not confirmed a final result yet. You can safely check again.'
      : 'Chapa reported that this payment did not complete.';

  return <Page>
    <Title subtitle="Payment status is based on the backend’s Chapa verification result.">Chapa payment</Title>
    <Card>
      <TextBlock color={paymentStatus === 'verified' ? C.green : paymentStatus === 'failed' ? C.red : C.navy}>{heading}</TextBlock>
      <TextBlock>{description}</TextBlock>
      {customer && bookingQuery.data ? <>
        <InfoRow label="Booking reference" value={bookingQuery.data.booking.reference} />
        <InfoRow label="Paid" value={money(bookingQuery.data.payment.amountPaid, bookingQuery.data.booking.currency)} />
        <InfoRow label="Remaining balance" value={money(bookingQuery.data.payment.balance, bookingQuery.data.booking.currency)} />
      </> : null}
      {customer && bookingQuery.isLoading ? <TextBlock>Loading your booking details…</TextBlock> : null}
      {customer && bookingQuery.isError ? <TextBlock color={C.red}>Payment status was checked, but private booking details could not be loaded. Sign in with the customer account that owns this booking, then retry.</TextBlock> : null}
      {!authLoading && !customer ? <TextBlock color={C.slate}>Sign in to view the private booking reference, paid amount, and remaining balance. Payment status has been checked, but no booking details are shown while signed out.</TextBlock> : null}
    </Card>
    {paymentStatus === 'pending_verification' || paymentStatus === 'failed' ? <Button title="Check payment again" variant="outline" onPress={retry} /> : null}
    {!authLoading && !customer ? <Button title="Sign in" onPress={() => router.push('/(auth)/login')} /> : null}
    {customer && bookingQuery.data ? <Button title="Open booking details" onPress={openBooking} /> : null}
    {customer && bookingQuery.isError ? <Button title="Retry booking details" variant="outline" onPress={() => void bookingQuery.refetch()} /> : null}
    <Button title="Go to bookings" variant="outline" onPress={() => router.replace('/(tabs)/bookings')} />
  </Page>;
}

function money(value: number, currency: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amount.toLocaleString()} ${currency || 'ETB'}` : 'Unavailable';
}

function TextBlock({ children, color = C.slate }: React.PropsWithChildren<{ color?: string }>) {
  return <Text style={{ color, fontSize: 13, lineHeight: 20 }}>{children}</Text>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Text style={{ flex: 1, color: C.slate, fontSize: 12, fontWeight: '700' }}>{label}</Text><Text style={{ flex: 1, color: C.navy, fontSize: 12, fontWeight: '800', textAlign: 'right' }}>{value}</Text></View>;
}
