'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, LogIn, Moon, Sun } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getServices, postBooking, BookingRequestPayload, setApiLocale } from '@shared/api';
import { MarketingView } from './website/MarketingView';
import { CustomerAuthPage, CustomerAccountPage } from './booking/CustomerAccountPage';
import { RequestStatusLookup } from './booking/RequestStatusLookup';
import { useTheme } from './contexts/ThemeContext';
import { ChatWidget } from './assistant/ChatWidget';
import { BrandMark } from './website/home/BrandMark';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Link, useRouter } from './i18n/navigation';
import { splitPathAndSearch, stripLocalePrefix } from './i18n/path';

const RequestFlow = dynamic(() => import('./booking/RequestFlow').then((module) => module.RequestFlow), {
  ssr: false,
  loading: () => <BookingLoading />,
});

function BookingLoading() {
  const t = useTranslations('booking');
  return (
    <div role="status" className="mx-auto max-w-5xl px-5 py-12 text-sm text-slate-600">
      {t('loadingExperience')}
    </div>
  );
}

const staffPortalUrl =
  process.env.NEXT_PUBLIC_MANAGEMENT_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3004/login' : '');
const pageByPath: Record<string, string> = {
  '/': 'home',
  '/about': 'about',
  '/services': 'services',
  '/team': 'team',
  '/trust': 'trust',
  '/contact': 'contact',
  '/faq': 'faq',
  '/blog': 'blog',
};
const pathByPage: Record<string, string> = {
  home: '/',
  about: '/about',
  services: '/services',
  team: '/team',
  trust: '/trust',
  contact: '/contact',
  faq: '/faq',
  blog: '/blog',
};

export default function App({
  initialPath = '/',
  initialQuery = '',
}: {
  initialPath?: string;
  initialQuery?: string;
}) {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    setApiLocale(locale);
  }, [locale]);
  const [services, setServices] = useState<Awaited<ReturnType<typeof getServices>>>([]);
  const [servicesState, setServicesState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [bookingSelection, setBookingSelection] = useState(() => {
    const query = new URLSearchParams(initialQuery);
    return { serviceId: query.get('service'), packageId: query.get('package') };
  });
  const [path, setPath] = useState(() => stripLocalePrefix(initialPath));
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    let live = true;
    // Service names/descriptions are localized by the API (Accept-Language), so refetch when the language changes.
    setApiLocale(locale);
    getServices()
      .then((s) => {
        if (live) {
          setServices(s);
          setServicesState('ready');
        }
      })
      .catch(() => {
        if (live) setServicesState('error');
      });
    return () => {
      live = false;
    };
  }, [locale]);

  useEffect(() => {
    setPath(stripLocalePrefix(initialPath));
    const query = new URLSearchParams(initialQuery);
    setBookingSelection({ serviceId: query.get('service'), packageId: query.get('package') });
  }, [initialPath, initialQuery]);

  const navigate = (next: string) => {
    const { pathname, search, hash } = splitPathAndSearch(next);
    router.push(`${pathname}${search}${hash}`);
    setPath(pathname);
    const query = new URLSearchParams(search);
    setBookingSelection({ serviceId: query.get('service'), packageId: query.get('package') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitBooking = (payload: BookingRequestPayload, key: string) => postBooking(payload, key);

  const serviceRoute = path.match(/^\/services\/([^/]+)$/);
  const bookingRoute = path.match(/^\/booking\/([^/]+)$/);
  const marketingPage = serviceRoute ? 'service-detail' : pageByPath[path];
  const nonMarketing = Boolean(marketingPage === undefined);
  const themeLabel = isDarkMode ? tNav('ariaThemeLight') : tNav('ariaThemeDark');

  const Header = nonMarketing ? (
    <header id="app-nav" className="sticky top-0 z-30 border-b border-white/10 bg-[#102A43] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-left">
          <ArrowLeft size={16} />
          <BrandMark onNavy />
          <small className="hidden text-[10px] text-white/65 sm:block">{tNav('customerPortal')}</small>
        </button>
        <nav className="flex items-center gap-2">
          <Link href="/services" className="hidden px-3 py-2 text-sm text-white/80 hover:text-white sm:inline">
            {tNav('services')}
          </Link>
          <Link href="/track-booking" className="hidden px-3 py-2 text-sm text-white/80 hover:text-white sm:inline">
            {tNav('trackRequest')}
          </Link>
          <LanguageSwitcher className="hidden sm:inline-flex [&_button]:text-white [&_button[aria-pressed=true]]:bg-white [&_button[aria-pressed=true]]:text-[#102A43]" compact />
          <Link
            href="/login"
            aria-label={tNav('ariaSignIn')}
            className="inline-flex min-h-10 items-center gap-2 rounded-sm px-3 text-sm text-white/80 hover:bg-white/10"
          >
            <LogIn size={16} />
            <span className="hidden sm:inline">{tNav('signIn')}</span>
          </Link>
          <button onClick={toggleTheme} aria-label={themeLabel} className="rounded-sm p-2 text-white/80 hover:bg-white/10">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  ) : null;

  if (marketingPage) {
    return (
      <>
        <MarketingView
          services={services}
          servicesState={servicesState}
          selectedServiceId={serviceRoute ? decodeURIComponent(serviceRoute[1]) : undefined}
          onServiceDetails={(id) => navigate(`/services/${encodeURIComponent(id)}`)}
          onBookService={(id, packageId) =>
            navigate(
              id
                ? `/booking?service=${encodeURIComponent(id)}${packageId ? `&package=${encodeURIComponent(packageId)}` : ''}`
                : '/booking',
            )
          }
          initialSubPage={marketingPage}
          onSubPageChange={(page) => navigate(pathByPage[page] || '/')}
        />
        <ChatWidget />
      </>
    );
  }

  let content: React.ReactNode;
  if (path === '/booking') {
    content = (
      <RequestFlow
        services={services}
        servicesState={servicesState}
        presetServiceId={bookingSelection.serviceId}
        presetPackageId={bookingSelection.packageId}
        onSubmit={submitBooking}
        onViewBookings={() => navigate('/track-booking')}
      />
    );
  } else if (path === '/track-booking' || bookingRoute) {
    content = <RequestStatusLookup initialReference={bookingRoute ? decodeURIComponent(bookingRoute[1]) : ''} />;
  } else if (path === '/login' || path === '/register') {
    content = (
      <CustomerAuthPage
        mode={path === '/register' ? 'register' : 'login'}
        onSignedIn={() => navigate('/my-account')}
      />
    );
  } else if (path === '/my-account' || path === '/my-account/bookings') {
    content = <CustomerAccountPage bookings={path.endsWith('/bookings')} onSignOut={() => navigate('/login')} />;
  } else {
    content = (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="text-2xl font-semibold text-[#102A43]">{tCommon('notFound')}</h1>
        <Link className="mt-4 inline-block underline" href="/">
          {tCommon('returnHome')}
        </Link>
      </main>
    );
  }

  return (
    <>
      <div id="customer-portal" className="min-h-screen bg-[#F7F8FA] text-[#334155]">
        {Header}
        <main>{content}</main>
        <footer className="mt-10 border-t border-slate-200 bg-white px-5 py-5 text-center text-xs text-slate-500">
          {staffPortalUrl ? (
            <>
              <a href={staffPortalUrl} className="text-[#102A43] underline">
                {tNav('staffSignIn')}
              </a>
              <span className="mx-3" aria-hidden="true">
                &middot;
              </span>
            </>
          ) : null}
          <Link href="/" className="text-[#102A43] underline">
            {tCommon('brand')}
          </Link>
        </footer>
      </div>
      <ChatWidget />
    </>
  );
}
