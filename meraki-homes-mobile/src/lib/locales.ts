/**
 * Metro-resolvable entry for shared locale JSON (`@shared` → repo `shared/`).
 * Used by the i18next setup in Phase 3; imported here so production bundling
 * proves JSON resolution before that phase.
 */
import { defaultLocale, getMessages, loadMessages, type Messages, type UiLocale } from '@shared/locales';
import am from '@shared/locales/am.json';
import en from '@shared/locales/en.json';

export { defaultLocale, getMessages, loadMessages, am, en };
export type { Messages, UiLocale };

export const mobileMessageBundles = { en, am } as const;
