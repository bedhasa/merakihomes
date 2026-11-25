/**
 * Message loader used by next-intl `getRequestConfig` (Phase 2).
 * Dynamic import path is relative so Next bundles JSON from `shared/locales`.
 */
import { defaultLocale, isUiLocale, type Messages, type UiLocale } from '../../../shared/locales';

export async function getMessagesForLocale(locale: string): Promise<Messages> {
  const resolved: UiLocale = isUiLocale(locale) ? locale : defaultLocale;
  switch (resolved) {
    case 'am':
      return (await import('../../../shared/locales/am.json')).default as Messages;
    case 'en':
    default:
      return (await import('../../../shared/locales/en.json')).default as Messages;
  }
}
