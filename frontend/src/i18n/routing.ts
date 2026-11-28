import { defineRouting } from 'next-intl/routing';
import { defaultLocale, localePrefix, uiLocales } from '../../../shared/locales/config';

export const routing = defineRouting({
  locales: [...uiLocales],
  defaultLocale,
  localePrefix,
});
