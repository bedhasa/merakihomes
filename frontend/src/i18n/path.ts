import { defaultLocale, isUiLocale, localePrefix, type UiLocale } from '../../../shared/locales/config';

/** Remove a leading `/en` or `/am` segment so client route matching stays locale-agnostic. */
export function stripLocalePrefix(pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const segments = normalized.split('/');
  if (segments.length > 1 && isUiLocale(segments[1])) {
    const rest = `/${segments.slice(2).join('/')}`;
    return rest === '/' ? '/' : rest.replace(/\/+$/, '') || '/';
  }
  return normalized === '/' ? '/' : normalized.replace(/\/+$/, '') || '/';
}

/** Build a public pathname for the given UI locale (`as-needed` omits the default prefix). */
export function localizeHref(pathname: string, locale: UiLocale): string {
  const bare = stripLocalePrefix(pathname);
  const path = bare.startsWith('/') ? bare : `/${bare}`;
  if (localePrefix === 'as-needed' && locale === defaultLocale) return path || '/';
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export function splitPathAndSearch(next: string): { pathname: string; search: string; hash: string } {
  const target = new URL(next, 'http://local.invalid');
  return {
    pathname: stripLocalePrefix(target.pathname),
    search: target.search,
    hash: target.hash,
  };
}
