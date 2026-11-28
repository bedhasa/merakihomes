import { defaultLocale, isUiLocale, type UiLocale } from './config';
import am from './am.json';
import en from './en.json';

export * from './config';

export const messagesByLocale = {
  en,
  am,
} as const satisfies Record<UiLocale, typeof en>;

export type Messages = typeof en;

export async function loadMessages(locale: string): Promise<Messages> {
  const resolved: UiLocale = isUiLocale(locale) ? locale : defaultLocale;
  switch (resolved) {
    case 'am':
      return (await import('./am.json')).default as Messages;
    case 'en':
    default:
      return (await import('./en.json')).default as Messages;
  }
}

export function getMessages(locale: string = defaultLocale): Messages {
  return messagesByLocale[isUiLocale(locale) ? locale : defaultLocale];
}
