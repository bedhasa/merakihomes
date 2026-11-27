import { Currency } from '../types';
import { defaultLocale, toIntlLocale } from '../locales/config';

export type FormatLocale = string | undefined | null;

function intlLocale(locale: FormatLocale): string {
  return toIntlLocale(locale ?? defaultLocale);
}

/** Locale-aware number formatting for customer-facing UI. */
export function formatNumber(value: number, locale: FormatLocale = defaultLocale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

/** Locale-aware date formatting. Does not enable the Ethiopian calendar. */
export function formatDate(
  value: Date | number | string,
  locale: FormatLocale = defaultLocale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(intlLocale(locale), options).format(date);
}

/** Locale-aware date+time formatting. */
export function formatDateTime(
  value: Date | number | string,
  locale: FormatLocale = defaultLocale,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatDate(value, locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  });
}

/** Format an amount already denominated in `currency` (no FX conversion). */
export function formatMoney(
  amount: number,
  currency: Currency | string,
  locale: FormatLocale = defaultLocale,
): string {
  const code = currency || 'ETB';
  try {
    return new Intl.NumberFormat(intlLocale(locale), {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'ETB' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${formatNumber(amount, locale)} ${code}`;
  }
}

export function formatETBOnly(etbAmount: number, locale: FormatLocale = defaultLocale): string {
  return formatMoney(etbAmount, 'ETB', locale);
}
