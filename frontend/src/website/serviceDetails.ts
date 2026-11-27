import { useTranslations } from 'next-intl';

export interface ServiceDetailsCopy {
  overview: string;
  included: string[];
  limitations: string[];
}

/**
 * Service detail copy (overview, what is included, limitations) from the `serviceCopy` catalog.
 * Lists are stored as numbered keys ("1", "2", …) because the i18n check compares leaf strings.
 * Returns undefined for services without catalog copy (for example ones added by staff).
 */
export function useServiceDetailsCopy() {
  const t = useTranslations('serviceCopy');
  return (serviceId?: string): ServiceDetailsCopy | undefined => {
    if (!serviceId || !t.has(`${serviceId}.overview` as never)) return undefined;
    const list = (key: string) =>
      Object.values((t.raw(`${serviceId}.${key}` as never) ?? {}) as Record<string, string>);
    return {
      overview: t(`${serviceId}.overview` as never),
      included: list('included'),
      limitations: list('limitations'),
    };
  };
}
