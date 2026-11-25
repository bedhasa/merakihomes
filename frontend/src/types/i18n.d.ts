import type { Messages, UiLocale } from '../../../shared/locales';

/**
 * next-intl AppConfig augmentation (library installed in Phase 2).
 * Message keys stay type-safe against the shared English catalog.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: UiLocale;
    Messages: Messages;
  }
}
