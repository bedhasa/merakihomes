import React, { useEffect, useState } from 'react';
import { ArrowRight, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  ApiError,
  CustomerAccount,
  getCustomerAccount,
  getCustomerBookings,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from '@shared/api';
import { useApiErrorMessage } from './useApiErrorMessage';
import { translateDynamic } from './translateDynamic';
import { Link } from '../i18n/navigation';
import { useFormatters } from '../i18n/useFormatters';

const input =
  'mt-2 h-12 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#D4A853]/30';

export const CustomerAuthPage: React.FC<{ mode: 'login' | 'register'; onSignedIn: () => void }> = ({
  mode,
  onSignedIn,
}) => {
  const t = useTranslations('auth');
  const errorMessage = useApiErrorMessage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') await registerCustomer({ name, email, phone, password });
      else await loginCustomer(email, password);
      onSignedIn();
    } catch (err) {
      setError(errorMessage(err instanceof ApiError ? err : null, t('connectError')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F8FA] px-5 py-12">
      <section className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#D4A853]/20 text-[#102A43]">
            <UserRound size={19} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6A2F]">{t('eyebrow')}</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#102A43]">
              {mode === 'login' ? t('loginTitle') : t('createAccount')}
            </h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{t('guestNote')}</p>
        {error && (
          <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <>
              <label className="block text-sm font-medium">
                {t('fullNameLabel')}
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={input}
                />
              </label>
              <label className="block text-sm font-medium">
                {t('phoneLabel')}
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={input}
                />
              </label>
            </>
          )}
          <label className="block text-sm font-medium">
            {t('emailLabel')}
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </label>
          <label className="block text-sm font-medium">
            {t('passwordLabel')}
            <input
              required
              type="password"
              minLength={10}
              maxLength={200}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
            {mode === 'register' && (
              <span className="mt-1 block text-xs text-slate-500">{t('passwordHint')}</span>
            )}
          </label>
          <button disabled={busy} className="meraki-button w-full">
            {busy ? t('wait') : mode === 'login' ? t('submitButton') : t('createButton')}{' '}
            <ArrowRight size={16} />
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          {mode === 'login' ? (
            <>
              {t('newHere')}{' '}
              <Link className="font-semibold text-[#102A43] underline" href="/register">
                {t('createAccount')}
              </Link>
            </>
          ) : (
            <>
              {t('haveAccount')}{' '}
              <Link className="font-semibold text-[#102A43] underline" href="/login">
                {t('submitButton')}
              </Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
};

export const CustomerAccountPage: React.FC<{ bookings: boolean; onSignOut: () => void }> = ({
  bookings,
  onSignOut,
}) => {
  const t = useTranslations('auth');
  const tStatus = useTranslations('booking');
  const errorMessage = useApiErrorMessage();
  const { formatDateTime } = useFormatters();
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof getCustomerBookings>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getCustomerAccount(), getCustomerBookings()])
      .then(([c, b]) => {
        if (active) {
          setCustomer(c);
          setRows(b);
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e instanceof ApiError ? e : null, t('account.loadError')));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [errorMessage, t]);

  const signOut = async () => {
    await logoutCustomer();
    onSignOut();
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12" role="status">
        {t('account.loading')}
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12">
        <div role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}{' '}
          <Link className="underline" href="/login">
            {t('submitButton')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6A2F]">
            {t('account.eyebrow')}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#102A43]">
            {t('account.hello', { name: customer?.name ?? '' })}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{customer?.email}</p>
        </div>
        <button
          onClick={() => void signOut()}
          className="min-h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold"
        >
          {t('account.signOut')}
        </button>
      </div>
      <div className="mt-8 flex gap-4 border-b border-slate-200">
        <Link
          href="/my-account"
          className={`pb-3 text-sm ${!bookings ? 'border-b-2 border-[#D4A853] font-semibold' : ''}`}
        >
          {t('account.overview')}
        </Link>
        <Link
          href="/my-account/bookings"
          className={`pb-3 text-sm ${bookings ? 'border-b-2 border-[#D4A853] font-semibold' : ''}`}
        >
          {t('account.myBookings', { count: rows.length })}
        </Link>
      </div>
      {!bookings ? (
        <section className="mt-7 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-[#102A43]">{t('account.yourBookings')}</h2>
          <p className="mt-2 text-sm text-slate-600">{t('account.overviewBody')}</p>
          <Link href="/booking" className="meraki-button mt-5">
            {t('account.requestService')} <ArrowRight size={16} />
          </Link>
        </section>
      ) : (
        <section className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white px-5">
          {rows.length === 0 ? (
            <p className="py-8 text-sm text-slate-600">{t('account.noBookings')}</p>
          ) : (
            rows.map((b) => (
              <article key={b.reference} className="flex flex-wrap justify-between gap-4 py-4">
                <div>
                  <p className="font-mono text-xs text-slate-500">{b.reference}</p>
                  <h2 className="mt-1 font-semibold">{b.service_name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {t('account.preferred', { date: formatDateTime(b.requested_start) })}
                  </p>
                </div>
                <p className="h-fit rounded-sm bg-[#D4A853]/15 px-2 py-1 text-xs font-medium text-[#102A43]">
                  {translateDynamic(tStatus, `statusShort.${b.status}`, b.status)}
                </p>
              </article>
            ))
          )}
        </section>
      )}
    </main>
  );
};
