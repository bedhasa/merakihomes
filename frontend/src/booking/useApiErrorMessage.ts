import { useTranslations } from 'next-intl';
import { ApiError } from '@shared/api';
import { translateDynamic } from './translateDynamic';

const ERROR_CODE = /^[A-Z][A-Z0-9_]+$/;

/**
 * Returns a function that turns an unknown error into display text.
 * Prefers API `error.code`, then CODE-shaped messages, then server text.
 */
export function useApiErrorMessage() {
  const t = useTranslations('errors');
  return (error: unknown, fallback: string): string => {
    if (error instanceof ApiError && error.status === 0) return t('NETWORK_UNREACHABLE');
    if (error instanceof ApiError && error.code) {
      return translateDynamic(t, error.code, t('UNKNOWN'));
    }
    if (error instanceof Error) {
      const message = error.message.trim();
      if (ERROR_CODE.test(message)) return translateDynamic(t, message, t('UNKNOWN'));
      if (message) return message;
    }
    return fallback;
  };
}
