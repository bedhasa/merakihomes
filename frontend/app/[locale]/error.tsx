'use client';

import { useTranslations } from 'next-intl';

/** Error boundary for localized pages; it renders inside the locale layout, so translations are available. */
export default function LocaleErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errorPage');
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F8FA] px-5 text-center dark:bg-slate-900">
      <section className="max-w-lg rounded-md border border-slate-200 bg-white p-7 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-xl font-semibold text-[#102A43] dark:text-white">{t('title')}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('body')}</p>
        <button className="meraki-button mt-5" onClick={reset}>{t('retry')}</button>
      </section>
    </main>
  );
}
