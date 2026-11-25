'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '../i18n/navigation';
import { uiLocales, type UiLocale } from '../../../shared/locales/config';

type Props = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({ className = '', compact = false }: Props) {
  const t = useTranslations('common');
  const locale = useLocale() as UiLocale;
  const router = useRouter();
  const pathname = usePathname();

  const labels: Record<UiLocale, string> = {
    en: t('english'),
    am: t('amharic'),
  };

  return (
    <div
      role="group"
      aria-label={t('language')}
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {uiLocales.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (active) return;
              router.replace(pathname, { locale: code });
            }}
            className={`min-h-9 rounded-md px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] ${
              active
                ? 'bg-[#102A43] text-white dark:bg-[#D4A853] dark:text-[#102A43]'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'
            }`}
          >
            {compact ? (code === 'am' ? 'አማ' : 'EN') : labels[code]}
          </button>
        );
      })}
    </div>
  );
}
