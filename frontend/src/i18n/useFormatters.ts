'use client';

import { useLocale } from 'next-intl';
import { formatDemoEstimate } from '@shared/demoPricing';
import { Currency } from '@shared/types';
import {
  formatCurrency,
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
    formatDate: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => formatDate(value, locale, options),
    formatDateTime: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => formatDateTime(value, locale, options),
    formatMoney: (amount: number, currency: Currency | string) => formatMoney(amount, currency, locale),
    formatCurrency: (amountInUSD: number, currency: Currency) => formatCurrency(amountInUSD, currency, locale),
    formatDemoEstimate: (serviceId?: string) => formatDemoEstimate(serviceId, locale),
  };
}
