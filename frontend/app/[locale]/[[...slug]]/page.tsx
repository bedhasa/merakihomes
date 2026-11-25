import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import CustomerApp from '../../../src/App';
import { routing } from '../../../src/i18n/routing';

type PageProps = {
  params: Promise<{ locale: string; slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const metaTitleKeys: Record<string, 'aboutTitle' | 'servicesTitle' | 'teamTitle' | 'trustTitle' | 'contactTitle' | 'faqTitle' | 'blogTitle' | 'bookingTitle' | 'trackTitle' | 'loginTitle' | 'registerTitle' | 'accountTitle'> = {
  about: 'aboutTitle',
  services: 'servicesTitle',
  team: 'teamTitle',
  trust: 'trustTitle',
  contact: 'contactTitle',
  faq: 'faqTitle',
  blog: 'blogTitle',
  booking: 'bookingTitle',
  'track-booking': 'trackTitle',
  login: 'loginTitle',
  register: 'registerTitle',
  'my-account': 'accountTitle',
};

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { locale, slug = [] } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'meta' });
  const pageKey = slug[0] || 'home';
  const title =
    pageKey === 'home'
      ? t('homeTitle')
      : pageKey === 'services' && slug[1]
        ? t('serviceTitle', { name: slug[1].replaceAll('_', ' ') })
        : metaTitleKeys[pageKey]
          ? t(metaTitleKeys[pageKey])
          : t('titleDefault');

  return {
    title,
    description: t('description'),
  };
}

export default async function CustomerRoute({ params, searchParams }: PageProps) {
  const [{ locale, slug = [] }, query] = await Promise.all([params, searchParams]);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) value.forEach((item) => search.append(key, item));
    else if (value !== undefined) search.set(key, value);
  }

  const initialPath = slug.length ? `/${slug.join('/')}` : '/';
  return <CustomerApp initialPath={initialPath} initialQuery={search.toString()} />;
}
