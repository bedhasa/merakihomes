import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError, lookupBooking, PublicBookingStatus } from '@shared/api';
import { useApiErrorMessage } from './useApiErrorMessage';
import { translateDynamic } from './translateDynamic';
import { useFormatters } from '../i18n/useFormatters';

const LookupRow: React.FC<{ booking: PublicBookingStatus }> = ({ booking }) => {
  const t = useTranslations('booking');
  const { formatDateTime, formatNumber } = useFormatters();
  const statusLabel = translateDynamic(t, `status.${booking.status}`, booking.status);
  const payStatus = (status: string) =>
    translateDynamic(t, `payStatus.${status}`, status.replaceAll('_', ' '));
  const paymentParts = [
    booking.amountPaid !== undefined ? t('track.paidPart', { amount: formatNumber(booking.amountPaid) }) : '',
    booking.remainingBalance !== undefined
      ? t('track.balancePart', { amount: formatNumber(booking.remainingBalance) })
      : '',
  ].filter(Boolean);
  return (
    <article className="rounded-lg border border-[#D4A853]/50 bg-white p-5">
      <p className="font-mono text-xs text-slate-500">{booking.reference}</p>
      <h2 className="mt-2 font-semibold text-[#102A43]">{statusLabel}</h2>
      <p className="mt-2 text-sm text-slate-700">
        {t('track.serviceLine', {
          service: booking.serviceName,
          date: formatDateTime(booking.requestedStart),
        })}
      </p>
      {booking.paymentStatus && (
        <p className="mt-2 text-xs text-slate-500">
          {[t('track.payment', { status: payStatus(booking.paymentStatus) }), ...paymentParts].join(' - ')}
        </p>
      )}
      {booking.status === 'pending' && (
        <p className="mt-3 text-sm text-slate-600">{t('track.pendingNote')}</p>
      )}
    </article>
  );
};

/** Guest booking lookup. Both the reference and the phone used for the request are required (TD-011). */
export const RequestStatusLookup: React.FC<{ initialReference?: string }> = ({ initialReference = '' }) => {
  const t = useTranslations('booking');
  const errorMessage = useApiErrorMessage();
  const [reference, setReference] = useState(initialReference);
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<PublicBookingStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const response = await lookupBooking({ reference, phone });
      setResult(response.booking);
    } catch (err) {
      setError(errorMessage(err instanceof ApiError ? err : null, t('track.error')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#102A43]">{t('track.eyebrow')}</p>
      <h1 className="mt-2 text-2xl font-semibold text-[#102A43]">{t('track.title')}</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{t('track.intro')}</p>
      <form
        onSubmit={submit}
        className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2"
      >
        <label className="text-sm font-medium">
          {t('track.referenceLabel')}
          <input
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t('track.referencePlaceholder')}
            autoCapitalize="characters"
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3"
          />
        </label>
        <label className="text-sm font-medium">
          {t('track.phoneLabel')}
          <input
            required
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('track.phonePlaceholder')}
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3"
          />
        </label>
        <button disabled={busy} className="meraki-button sm:col-span-2 sm:justify-self-start">
          {busy ? t('track.checking') : t('track.find')}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {result && (
        <div className="mt-5">
          <LookupRow booking={result} />
        </div>
      )}
    </section>
  );
};
