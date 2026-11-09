import React, { useState } from 'react';
import { ArrowRight, Clock3, Star, CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { ServiceCategory } from '@shared/types';
import { formatDemoEstimate, getDemoEstimate } from '@shared/demoPricing';

interface PopularServicesProps {
  services: ServiceCategory[];
  servicesState: 'loading' | 'ready' | 'error';
  onExploreAll: () => void;
}

const imageForService = (id: string, image: string) =>
  id === 'elder_companion' ? '/elder-companion-care.jpg' : image;

const serviceBadges: Record<string, string> = {
  premium_home_cleaning: 'Most Popular',
  cooking_service: 'Customer Favorite',
  childcare_nanny: 'Verified Caregiver',
  elder_companion: 'Specialized Care',
  handyman_plumbing: 'Fast Dispatch',
  office_cleaning: 'Commercial Grade',
  gardening_outdoor: 'Seasonal Care',
  maid_laundry: 'Household Favorite',
};

const serviceRatings: Record<string, { rating: number; reviews: number }> = {
  premium_home_cleaning: { rating: 4.9, reviews: 184 },
  cooking_service: { rating: 4.9, reviews: 112 },
  childcare_nanny: { rating: 5.0, reviews: 88 },
  elder_companion: { rating: 5.0, reviews: 64 },
  handyman_plumbing: { rating: 4.8, reviews: 142 },
  office_cleaning: { rating: 4.9, reviews: 76 },
  gardening_outdoor: { rating: 4.8, reviews: 59 },
  maid_laundry: { rating: 4.9, reviews: 95 },
};

export const PopularServices: React.FC<PopularServicesProps> = ({
  services,
  servicesState,
  onExploreAll,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'cleaning' | 'care' | 'repairs'>('all');
  const reduceMotion = useReducedMotion();

  // Filter services based on category tab
  const filteredServices = services.filter((s) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'cleaning') {
      return ['premium_home_cleaning', 'office_cleaning', 'maid_laundry'].includes(s.id);
    }
    if (selectedFilter === 'care') {
      return ['childcare_nanny', 'elder_companion', 'cooking_service'].includes(s.id);
    }
    if (selectedFilter === 'repairs') {
      return ['handyman_plumbing', 'gardening_outdoor'].includes(s.id);
    }
    return true;
  });

  const displayServices = filteredServices.slice(0, 4);

  return (
    <section id="popular-services" aria-labelledby="featured-services-title" className="bg-[#F8FAFC] py-20 transition-colors duration-300 dark:bg-[#0b1724] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex flex-col justify-between gap-6 md:mb-12 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#102A43]/5 px-3.5 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#102A43] dark:bg-white/10 dark:text-white">
              <span>Tailored Household Care</span>
            </div>
            <h2 id="featured-services-title" className="mt-4 text-3xl font-bold tracking-tight text-[#102A43] dark:text-white sm:text-4xl lg:text-5xl">
              Featured Services
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              Every service is delivered by vetted, certified specialists equipped with genuine care and professional standards.
            </p>
          </div>
        </motion.div>

        <div className="mb-10 flex flex-wrap items-center gap-2" aria-label="Filter featured services">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'cleaning', label: 'Cleaning & Laundry' },
            { id: 'care', label: 'Care & Cooking' },
            { id: 'repairs', label: 'Repairs & Grounds' },
          ].map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedFilter(tab.id as 'all' | 'cleaning' | 'care' | 'repairs')}
                className={`min-h-10 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                  isSelected
                    ? 'border-[#102A43] bg-[#102A43] text-white shadow-sm dark:border-[#D4A853] dark:bg-[#D4A853] dark:text-[#102A43]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#D4A853] dark:border-slate-700 dark:bg-[#14283b] dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {servicesState === 'loading' && (
          <div role="status" aria-label="Loading services" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#14283b]">
                <div className="h-48 bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-4 p-5"><div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-700"/><div className="h-7 w-3/4 rounded bg-slate-200 dark:bg-slate-700"/><div className="h-16 rounded bg-slate-100 dark:bg-slate-800"/><div className="h-10 rounded bg-slate-200 dark:bg-slate-700"/></div>
              </div>
            ))}
          </div>
        )}

        {servicesState === 'error' && (
          <div role="alert" className="mx-auto my-8 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Services could not be loaded at this moment. Please refresh the page.</p>
          </div>
        )}

        {servicesState === 'ready' && displayServices.length > 0 && (
          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {displayServices.map((service, index) => {
              const badge = serviceBadges[service.id] || 'Verified Pro';
              const ratingData = serviceRatings[service.id] || { rating: 4.9, reviews: 95 };
              const estimate = getDemoEstimate(service.id);
              return (
                <motion.article
                  key={service.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.42, delay: reduceMotion ? 0 : Math.min(index % 4, 3) * 0.06 }}
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:border-[#D4A853]/70 hover:shadow-xl hover:shadow-[#102A43]/[0.08] dark:border-slate-700/80 dark:bg-[#14283b]"
                >
                  <div className="group/image relative h-48 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 sm:h-52">
                    <img
                      src={imageForService(service.id, service.image)}
                      alt={service.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/image:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none"
                      loading="lazy"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#102A43]/45 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover/image:opacity-50" />
                    <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-[#102A43]/90 px-3 py-1.5 text-[11px] font-bold tracking-wide text-white shadow-md backdrop-blur-sm">
                      <CheckCircle2 size={13} className="text-[#D4A853]" aria-hidden="true" />{badge}
                    </span>
                    <span className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#102A43] shadow-sm backdrop-blur-sm dark:bg-[#14283b]/95 dark:text-white">
                      <Clock3 size={14} className="text-[#8C6A2F] dark:text-[#D4A853]" aria-hidden="true" />{service.durationMinutes || 60} min
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A853]/15 px-3 py-1 text-xs font-semibold text-[#102A43] dark:text-[#F3F7FB]">
                        <Star size={13} fill="#D4A853" className="text-[#8C6A2F] dark:text-[#D4A853]" aria-hidden="true" />
                        {ratingData.rating} <span className="text-slate-500 dark:text-slate-300">({ratingData.reviews} reviews)</span>
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Verified Team</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold tracking-tight text-[#102A43] dark:text-white">{service.name}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{service.description}</p>

                    <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-200 pt-5 dark:border-slate-700">
                      <div>
                        <span className="block text-[11px] font-semibold uppercase tracking-[.15em] text-slate-500 dark:text-slate-400">Starting from</span>
                        <span className="mt-1 block text-xl font-extrabold tracking-tight text-[#102A43] dark:text-white">{formatDemoEstimate(service.id)}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{estimate?.unit || 'per session'}</span>
                    </div>

                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {servicesState === 'ready' && displayServices.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-[#14283b] dark:text-slate-300">
            No services are currently available in this category.
          </p>
        )}

        <div className="mt-9 flex justify-center">
          <button
            type="button"
            onClick={onExploreAll}
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#102A43]/30 bg-white px-6 py-3 text-sm font-bold text-[#102A43] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D4A853] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] dark:border-slate-600 dark:bg-[#14283b] dark:text-white"
          >
            View Details <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
};
