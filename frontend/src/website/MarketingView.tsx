import React, { useEffect, useMemo, useState } from 'react';
import { ServiceCategory } from '@shared/types';
import {
  ArrowRight,
  Search,
  Clock3,
  ChevronDown,
  BadgeCheck,
  ShieldCheck,
  KeyRound,
  IdCard,
  Award,
  UserRoundCheck,
  Phone,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ContactForm } from './ContactForm';
import { getServiceDetails } from '@shared/api';
import { ServicePackage } from '@shared/types';
import { useServiceDetailsCopy, type ServiceDetailsCopy } from './serviceDetails';
import { Navbar } from './home/Navbar';
import { HomePage } from './home/HomePage';
import { Footer } from './home/Footer';
import AboutPage from './AboutPage';
import { useFormatters } from '../i18n/useFormatters';

interface MarketingViewProps {
  services: ServiceCategory[];
  servicesState: 'loading' | 'ready' | 'error';
  onBookService: (serviceId?: string, packageId?: string) => void;
  selectedServiceId?: string;
  onServiceDetails?: (serviceId: string) => void;
  initialSubPage?: string;
  onSubPageChange?: (page: string) => void;
}

const photo = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=85';
const imageForService = (id: string, image: string) =>
  id === 'elder_companion' ? '/elder-companion-care.jpg' : image;

export const MarketingView: React.FC<MarketingViewProps> = ({
  services: allServices,
  servicesState,
  onBookService,
  selectedServiceId,
  onServiceDetails,
  initialSubPage = 'home',
  onSubPageChange,
}) => {
  const tNav = useTranslations('nav');
  const tServices = useTranslations('servicesPage');
  const tDetail = useTranslations('serviceDetail');
  const tTrust = useTranslations('trustPage');
  const tTeam = useTranslations('teamPage');
  const tBlog = useTranslations('blogPage');
  const tFaq = useTranslations('faqPage');
  const tContact = useTranslations('contact');
  const tPricing = useTranslations('pricingPage');
  const { formatFromPrice, formatMoney } = useFormatters();
  const serviceCopy = useServiceDetailsCopy();

  const [page, setPage] = useState(initialSubPage);
  const [query, setQuery] = useState('');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [detailPackages, setDetailPackages] = useState<ServicePackage[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [packageRetry, setPackageRetry] = useState(0);

  const trustCommitments = [
    { titleKey: 'idTitle' as const, bodyKey: 'idBody' as const, icon: IdCard },
    { titleKey: 'insuranceTitle' as const, bodyKey: 'insuranceBody' as const, icon: ShieldCheck },
    { titleKey: 'accessTitle' as const, bodyKey: 'accessBody' as const, icon: KeyRound },
    { titleKey: 'profileTitle' as const, bodyKey: 'profileBody' as const, icon: UserRoundCheck },
    { titleKey: 'qualityTitle' as const, bodyKey: 'qualityBody' as const, icon: Award },
    { titleKey: 'sameWorkerTitle' as const, bodyKey: 'sameWorkerBody' as const, icon: BadgeCheck },
  ];

  const faqItems = [
    { q: 'q1' as const, a: 'a1' as const },
    { q: 'q2' as const, a: 'a2' as const },
    { q: 'q3' as const, a: 'a3' as const },
    { q: 'q4' as const, a: 'a4' as const },
    { q: 'q5' as const, a: 'a5' as const },
    { q: 'q6' as const, a: 'a6' as const },
  ];

  useEffect(() => setPage(initialSubPage), [initialSubPage]);
  useEffect(() => {
    if (page !== 'service-detail' || !selectedServiceId) return;
    let live = true;
    setDetailLoading(true);
    setDetailError('');
    setDetailPackages([]);
    setSelectedPackageId('');
    getServiceDetails(selectedServiceId)
      .then((data) => {
        if (live) setDetailPackages(data.packages);
      })
      .catch((error) => {
        if (live) setDetailError(error instanceof Error ? error.message : 'load-failed');
      })
      .finally(() => {
        if (live) setDetailLoading(false);
      });
    return () => {
      live = false;
    };
  }, [page, selectedServiceId, packageRetry]);

  const changePage = (id: string) => {
    setPage(id);
    onSubPageChange?.(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const services = useMemo(
    () => allServices.filter((s) => `${s.name} ${s.description}`.toLowerCase().includes(query.toLowerCase())),
    [allServices, query],
  );
  const btn = 'meraki-button';

  const renderDemoPackageCard = (
    service: ServiceCategory,
    copy: ServiceDetailsCopy | undefined,
    showPrototypeNote: boolean,
  ) => (
    <div className="mt-4 rounded-md border border-[#D4A853]/70 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#8C6A2F]">
        {tDetail('demoPackage')}
      </p>
      <h3 className="mt-2 text-base font-semibold text-[#102A43]">
        {tDetail('requestSuffix', { name: service.name })}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy?.overview || service.description}</p>
      <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-600">
        {(copy?.included || [tDetail('fallbackIncluded')]).slice(0, 3).map((task) => (
          <li key={task}>- {task}</li>
        ))}
      </ul>
      <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-semibold text-[#102A43]">
        {service.fromPrice
          ? tDetail('fromPrice', { amount: formatFromPrice(service.fromPrice) ?? '' })
          : tDetail('priceAfterReview')}
      </p>
      {showPrototypeNote && (
        <p className="mt-2 text-xs leading-5 text-slate-500">{tDetail('prototypeNote')}</p>
      )}
      <button onClick={() => onBookService(service.id)} className="meraki-button mt-4 w-full">
        {tDetail('requestService')} <ArrowRight size={16} />
      </button>
    </div>
  );

  return (
    <div id="public-site" className="min-h-screen bg-[#F8FAFC] text-[#102A43]">
      <Navbar
        currentPage={page}
        onPageChange={changePage}
        onBookNow={() => onBookService()}
        isTransparentTop={page === 'home'}
      />

      <main className={page !== 'home' ? 'pt-24 sm:pt-28' : ''}>
        {page === 'home' && (
          <HomePage
            services={allServices}
            servicesState={servicesState}
            onBookNow={(serviceId) => onBookService(serviceId)}
            onExploreServices={() => changePage('services')}
            onAboutClick={() => changePage('about')}
            onContactClick={() => changePage('contact')}
          />
        )}

        {page === 'services' && (
          <>
            <section
              className="relative isolate -mt-20 min-h-[420px] w-full overflow-hidden bg-cover bg-center px-5 pb-12 pt-32 sm:pb-14 lg:min-h-[500px] lg:px-8 lg:pb-16"
              style={{
                backgroundImage: `url('${photo}')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            >
              <div
                className="absolute inset-0 z-0 bg-gradient-to-r from-white/85 via-white/65 to-white/25 dark:from-[#102A43]/80 dark:via-[#102A43]/60 dark:to-[#102A43]/30"
                aria-hidden="true"
              />
              <div className="relative z-10 mx-auto max-w-7xl">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#8C6A2F] dark:text-[#D4A853]">
                    {tServices('eyebrow')}
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold text-[#102A43] sm:text-4xl dark:text-white">
                    {tServices('title')}
                  </h1>
                  <p className="mt-3 max-w-2xl text-slate-700 dark:text-white/90">{tServices('subtitle')}</p>
                </div>
              </div>
            </section>
            <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
              <label className="mt-7 flex max-w-lg items-center gap-3 rounded-lg border border-slate-300 bg-white px-4">
                <Search size={18} className="text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tServices('searchPlaceholder')}
                  className="h-12 w-full bg-transparent text-sm outline-none"
                />
              </label>
              {servicesState === 'loading' ? (
                <p role="status" className="mt-8 text-sm">
                  {tServices('loading')}
                </p>
              ) : servicesState === 'error' ? (
                <p role="alert" className="mt-8 text-sm text-red-700">
                  {tServices('loadError')}
                </p>
              ) : (
                <div className="mt-9 space-y-6 lg:space-y-8">
                  {services.map((s, index) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => onServiceDetails?.(s.id)}
                      className="group grid w-full overflow-hidden rounded-md border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-[#D4A853] hover:shadow-[0_8px_24px_rgba(212,168,83,0.2)] focus:outline-none focus:ring-2 focus:ring-[#D4A853] lg:grid-cols-2"
                    >
                      <img
                        src={imageForService(s.id, s.image)}
                        alt={tServices('serviceAlt', { name: s.name })}
                        className={`h-56 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none sm:h-72 lg:h-full lg:min-h-[22rem] ${index % 2 === 0 ? 'lg:order-2' : ''}`}
                      />
                      <div
                        className={`flex flex-col justify-center p-6 sm:p-8 lg:p-10 ${index % 2 === 0 ? 'lg:order-1' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-xl font-semibold text-[#102A43] sm:text-2xl">{s.name}</h2>
                            <span className="mt-2 inline-block text-xs font-semibold text-[#102A43] underline underline-offset-4">
                              {tServices('viewDetails')}
                            </span>
                          </div>
                          <span className="shrink-0 pt-1 text-xs text-slate-500">
                            <Clock3 size={13} className="mr-1 inline" />
                            {tServices('minutes', { count: s.durationMinutes })}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-600">{s.description}</p>
                        <p className="mt-5 text-sm font-semibold">
                          {s.fromPrice
                            ? tServices('fromPrice', { amount: formatFromPrice(s.fromPrice) ?? '' })
                            : tServices('priceAfterReview')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {services.length === 0 && servicesState === 'ready' && (
                <p className="py-12 text-center text-slate-500">{tServices('emptySearch')}</p>
              )}
            </section>
          </>
        )}

        {page === 'service-detail' &&
          (() => {
            const service = allServices.find((s) => s.id === selectedServiceId);
            const copy = serviceCopy(selectedServiceId);
            const selectedPackage = detailPackages.find((p) => p.id === selectedPackageId);
            if (!service) {
              return (
                <section className="mx-auto max-w-3xl px-5 py-16">
                  <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#8C6A2F]">
                    {tDetail('eyebrow')}
                  </p>
                  <h1 className="mt-3 text-2xl font-semibold text-[#102A43]">{tDetail('notFoundTitle')}</h1>
                  <p className="mt-3 text-sm text-slate-600">{tDetail('notFoundBody')}</p>
                  <button onClick={() => changePage('services')} className="meraki-button mt-6">
                    {tDetail('allServices')}
                  </button>
                </section>
              );
            }
            return (
              <>
                <button
                  type="button"
                  onClick={() => changePage('services')}
                  aria-label={tDetail('backAria')}
                  title={tDetail('backAria')}
                  className="fixed left-5 top-[104px] z-40 inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white/95 text-[#102A43] shadow-md backdrop-blur transition-colors hover:border-[#D4A853] hover:bg-[#FBF8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] sm:left-8"
                >
                  <ArrowRight size={18} className="rotate-180" aria-hidden="true" />
                </button>
                <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                  <nav aria-label={tDetail('breadcrumb')} className="mb-6 text-sm text-slate-500">
                    <button onClick={() => changePage('home')} className="hover:text-[#102A43]">
                      {tNav('home')}
                    </button>
                    <span className="mx-2">/</span>
                    <button onClick={() => changePage('services')} className="hover:text-[#102A43]">
                      {tNav('services')}
                    </button>
                    <span className="mx-2">/</span>
                    <span className="text-[#102A43]">{service.name}</span>
                  </nav>
                  <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
                    <img
                      src={imageForService(service.id, service.image)}
                      alt={service.name}
                      className="h-64 w-full rounded-md object-cover sm:h-[400px]"
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#8C6A2F]">
                        {tDetail('brandEyebrow')}
                      </p>
                      <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#102A43] sm:text-4xl">
                        {service.name}
                      </h1>
                      <p className="mt-4 text-base leading-7 text-slate-600">{service.description}</p>
                      <p className="mt-4 text-sm font-semibold text-[#102A43]">
                        {detailPackages.length
                          ? tDetail('selectPackage')
                          : service.fromPrice
                            ? tDetail('fromPrice', { amount: formatFromPrice(service.fromPrice) ?? '' })
                            : tDetail('priceAfterReview')}
                        <span className="mt-1 block font-normal text-slate-600">
                          {detailPackages.length === 0
                            ? tDetail('afterReviewNote')
                            : tDetail('packageReviewNote')}
                        </span>
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {service.durationMinutes
                          ? tDetail('typicalDuration', { count: service.durationMinutes })
                          : tDetail('durationReview')}
                      </p>
                    </div>
                  </div>
                </section>
                <section className="border-y border-slate-200 bg-white">
                  <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[1fr_340px] lg:px-8">
                    <div>
                      <h2 className="text-xl font-semibold text-[#102A43]">{tDetail('coversTitle')}</h2>
                      <p className="mt-3 leading-7 text-slate-600">{copy?.overview || service.description}</p>
                      <h3 className="mt-7 text-base font-semibold text-[#102A43]">
                        {tDetail('typicalTasks')}
                      </h3>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                        {(copy?.included || [tDetail('fallbackIncluded')]).map((task) => (
                          <li key={task}>{task}</li>
                        ))}
                      </ul>
                      <h3 className="mt-7 text-base font-semibold text-[#102A43]">
                        {tDetail('importantDetails')}
                      </h3>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                        {(copy?.limitations || [tDetail('fallbackLimit')]).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <aside className="h-fit rounded-md border border-slate-200 bg-[#F7F8FA] p-5">
                      <h2 className="text-lg font-semibold text-[#102A43]">
                        {detailPackages.length ? tDetail('availablePackages') : tDetail('pricing')}
                      </h2>
                      {detailLoading ? (
                        <p role="status" className="mt-4 text-sm text-slate-600">
                          {tDetail('checkingPackages')}
                        </p>
                      ) : detailError ? (
                        <div className="mt-4">
                          <p role="alert" className="text-sm text-red-700">
                            {tDetail('packagesError')}
                          </p>
                          <button
                            onClick={() => setPackageRetry((value) => value + 1)}
                            className="mt-3 min-h-11 text-sm font-semibold text-[#102A43] underline underline-offset-4"
                          >
                            {tDetail('retryPackages')}
                          </button>
                          {renderDemoPackageCard(service, copy, false)}
                        </div>
                      ) : detailPackages.length === 0 ? (
                        renderDemoPackageCard(service, copy, true)
                      ) : (
                        <>
                          <div className="mt-4 space-y-3">
                            {detailPackages.map((pack) => (
                              <button
                                key={pack.id}
                                onClick={() => setSelectedPackageId(pack.id)}
                                aria-pressed={selectedPackageId === pack.id}
                                className={`w-full rounded-md border bg-white p-4 text-left ${selectedPackageId === pack.id ? 'border-[#D4A853] ring-1 ring-[#D4A853]' : 'border-slate-200 hover:border-[#102A43]'}`}
                              >
                                <span className="flex items-start justify-between gap-3">
                                  <strong className="text-sm text-[#102A43]">{pack.name}</strong>
                                  <span className="text-sm font-semibold text-[#102A43]">
                                    {formatMoney(pack.basePrice, pack.currency)}
                                  </span>
                                </span>
                                {pack.description && (
                                  <span className="mt-2 block text-xs leading-5 text-slate-600">
                                    {pack.description}
                                  </span>
                                )}
                                <span className="mt-2 block text-xs text-slate-500">
                                  {tServices('minutes', { count: pack.durationMinutes })}
                                </span>
                              </button>
                            ))}
                          </div>
                          <button
                            disabled={!selectedPackage}
                            onClick={() => selectedPackage && onBookService(service.id, selectedPackage.id)}
                            className="meraki-button mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {selectedPackage ? tDetail('bookThis') : tDetail('choosePackage')}{' '}
                            <ArrowRight size={16} />
                          </button>
                        </>
                      )}
                    </aside>
                  </div>
                </section>
                <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                  <button
                    onClick={() => changePage('services')}
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#102A43] underline"
                  >
                    <ArrowRight size={16} className="rotate-180" />
                    {tDetail('allServices')}
                  </button>
                </section>
              </>
            );
          })()}

        {page === 'trust' && (
          <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#8C6A2F]">
                {tTrust('eyebrow')}
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#102A43] sm:text-5xl">
                {tTrust('title')}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
                {tTrust('subtitle')}
              </p>
            </div>
            <div className="mt-12 grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
              {trustCommitments.map(({ titleKey, bodyKey, icon: Icon }, index) => (
                <article key={titleKey} className="border-t border-slate-200 py-7 sm:px-4">
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#D4A853]/15 text-[#102A43]">
                      <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#8C6A2F]">0{index + 1}</p>
                      <h2 className="mt-1 text-lg font-semibold text-[#102A43]">{tTrust(titleKey)}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{tTrust(bodyKey)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 rounded-md bg-[#102A43] px-6 py-8 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-9">
              <div>
                <p className="text-xl font-semibold">{tTrust('ctaTitle')}</p>
                <p className="mt-2 text-sm leading-6 text-white/75">{tTrust('ctaBody')}</p>
              </div>
              <button className="meraki-button-accent mt-5 shrink-0 sm:mt-0" onClick={() => onBookService()}>
                {tTrust('ctaButton')} <ArrowRight size={16} />
              </button>
            </div>
          </section>
        )}

        {page === 'about' && <AboutPage />}

        {page === 'team' && (
          <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#102A43]">
              {tTeam('eyebrow')}
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{tTeam('title')}</h1>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">{tTeam('body')}</p>
            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="font-semibold">{tTeam('hireTitle')}</h2>
              <p className="mt-2 text-sm text-slate-600">{tTeam('hireBody')}</p>
              <button
                className="mt-4 text-sm font-semibold text-[#102A43]"
                onClick={() => changePage('contact')}
              >
                {tTeam('getInTouch')} <ArrowRight size={14} className="ml-1 inline" />
              </button>
            </div>
          </section>
        )}

        {page === 'blog' && (
          <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#102A43]">
              {tBlog('eyebrow')}
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{tBlog('title')}</h1>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">{tBlog('subtitle')}</p>
            <article className="mt-8 max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img src={photo} alt={tBlog('imageAlt')} className="h-60 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#102A43]">
                  {tBlog('articleEyebrow')}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{tBlog('articleTitle')}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{tBlog('articleBody')}</p>
              </div>
            </article>
          </section>
        )}

        {page === 'faq' && (
          <section className="mx-auto max-w-3xl px-5 py-14">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#102A43]">
              {tFaq('eyebrow')}
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{tFaq('title')}</h1>
            <div className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white px-5">
              {faqItems.map((item, i) => (
                <div key={item.q}>
                  <button
                    className="flex min-h-14 w-full items-center justify-between gap-4 text-left font-medium"
                    aria-expanded={faqOpen === i}
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  >
                    {tFaq(item.q)}
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition ${faqOpen === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {faqOpen === i && (
                    <p className="max-w-2xl pb-5 text-sm leading-6 text-slate-600">{tFaq(item.a)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {page === 'contact' && (
          <section className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#102A43]">
              {tContact('eyebrow')}
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{tContact('title')}</h1>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">{tContact('subtitle')}</p>
            <ContactForm />
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <a
                className="inline-flex items-center gap-2 font-medium text-[#102A43]"
                href="tel:+251936259142"
              >
                <Phone size={16} aria-hidden="true" />
                +251 936 259 142
              </a>
              <a
                className="inline-flex items-center gap-2 font-medium text-[#102A43]"
                href="tel:+251913394404"
              >
                <Phone size={16} aria-hidden="true" />
                +251 913 394 404
              </a>
            </div>
          </section>
        )}

        {page === 'pricing' && (
          <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#102A43]">
              {tPricing('eyebrow')}
            </p>
            <h1 className="mt-3 text-3xl font-semibold">{tPricing('title')}</h1>
            <p className="mt-4 max-w-2xl text-slate-600">{tPricing('subtitle')}</p>
            <button className={`${btn} mt-7`} onClick={() => changePage('services')}>
              {tPricing('browse')} <ArrowRight size={16} />
            </button>
          </section>
        )}
      </main>

      <Footer
        onPageChange={changePage}
        onBookNow={() => onBookService()}
        onServiceSelect={(serviceId) => {
          if (onServiceDetails) onServiceDetails(serviceId);
          else changePage('services');
        }}
      />
    </div>
  );
};
