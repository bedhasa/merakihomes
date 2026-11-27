import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { postContact, ApiError } from '@shared/api';

export const ContactForm: React.FC = () => {
  const t = useTranslations('contact');
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      await postContact({ ...form, email: form.email || undefined });
      setState('sent');
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      setState('error');
      setError(err instanceof ApiError ? err.message : t('errorGeneric'));
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 max-w-2xl rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
      {state === 'sent' && (
        <p
          role="status"
          className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {t('success')}
        </p>
      )}
      {state === 'error' && (
        <p role="alert" className="mb-5 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          {t('nameLabel')}
          <input
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3"
          />
        </label>
        <label className="text-sm font-medium">
          {t('phoneLabel')}
          <input
            required
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium">
        {t('emailLabel')}
        <input
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3"
        />
      </label>
      <label className="mt-4 block text-sm font-medium">
        {t('messageLabel')}
        <textarea
          required
          minLength={5}
          maxLength={3000}
          rows={4}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 p-3"
        />
      </label>
      <button disabled={state === 'sending'} className="meraki-button mt-5 disabled:opacity-60">
        {state === 'sending' ? t('sending') : t('send')}
      </button>
    </form>
  );
};
