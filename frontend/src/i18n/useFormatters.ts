'use client';

import { useLocale } from 'next-intl';
import { Currency, type PublicPrice } from '@shared/types';
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
  type FormatLocale,
} from '@shared/utils/formatters';

/** Bind shared Intl helpers to the active next-intl locale. */
export function useFormatters() {
  const locale = useLocale() as FormatLocale;
  return {
    locale,
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => formatNumber(value, locale, options),
    formatDate: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      formatDate(value, locale, options),
    formatDateTime: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      formatDateTime(value, locale, options),
    formatMoney: (amount: number, currency: Currency | string) => formatMoney(amount, currency, locale),
    /** Formats an API "from" price; null when the service is priced after review. */
    formatFromPrice: (price?: PublicPrice | null) =>
      price ? formatMoney(price.amount, price.currency, locale) : null,
  };
}
