/** UI locales shipped in v1. Add a locale here and a matching JSON file to expand. */
export const uiLocales = ['en', 'am'] as const;
export type UiLocale = (typeof uiLocales)[number];

export const defaultLocale: UiLocale = 'en';

/** next-intl routing: omit prefix for the default locale. */
export const localePrefix = 'as-needed' as const;

/** Agaz chat languages (includes Afaan Oromo; not a UI locale until later). */
export const agazLanguages = ['auto', 'en', 'am', 'om'] as const;
export type AgazLanguage = (typeof agazLanguages)[number];

/** BCP 47 tags used for Intl number/date formatting. */
export const intlLocaleByUiLocale = {
  en: 'en-ET',
  am: 'am-ET',
} as const satisfies Record<UiLocale, string>;

export function isUiLocale(value: string): value is UiLocale {
  return (uiLocales as readonly string[]).includes(value);
}

export function toIntlLocale(locale: string | undefined | null): string {
  if (locale && isUiLocale(locale)) return intlLocaleByUiLocale[locale];
  return intlLocaleByUiLocale[defaultLocale];
}

/** When Agaz language is `auto`, use the active UI locale. */
export function resolveAgazLanguage(
  agazLanguage: AgazLanguage,
  uiLocale: UiLocale = defaultLocale,
): Exclude<AgazLanguage, 'auto'> {
  if (agazLanguage === 'auto') return uiLocale;
  return agazLanguage;
}
