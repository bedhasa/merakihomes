import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Baby,
  Building2,
  Check,
  ChefHat,
  Clock3,
  Flower2,
  Hammer,
  HeartHandshake,
  Home,
  LoaderCircle,
  Shirt,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { formatDemoEstimate, getDemoEstimate } from '@shared/demoPricing';
import { Currency, ServiceCategory, ServicePackage } from '@shared/types';
import { formatCurrency } from '@shared/utils/formatters';

type Props = {
  services: ServiceCategory[];
  servicesState: 'loading' | 'ready' | 'error';
  serviceId: string;
  onServiceChange: (serviceId: string) => void;
  packages: ServicePackage[];
  packagesState: 'idle' | 'loading' | 'ready' | 'error';
  packageId: string;
  onPackageChange: (packageId: string) => void;
  packageMessage: string;
  onRetry: () => void;
  currency: Currency;
  details: string;
  onDetailsChange: (value: string) => void;
};

const serviceIcons: Record<string, LucideIcon> = {
  Wrench,
  Flower2,
  Building2,
  HeartHandshake,
  Baby,
  ChefHat,
  Shirt,
  Sparkles,
};

const serviceDescriptions: Record<string, string> = {
  premium_home_cleaning: 'A fresh, cared-for home.',
  handyman_plumbing: 'Repairs and upkeep around the home.',
  gardening_outdoor: 'Garden care and outdoor upkeep.',
  office_cleaning: 'A clean, welcoming workspace.',
  elder_companion: 'Companionship and everyday support.',
  childcare_nanny: 'Thoughtful care for your family.',
  cooking_service: 'Fresh meals, prepared at home.',
  maid_laundry: 'Laundry and garment care.',
};

export const ServicePackageSelector: React.FC<Props> = ({
  services,
  servicesState,
  serviceId,
  onServiceChange,
  packages,
  packagesState,
  packageId,
  onPackageChange,
  packageMessage,
  onRetry,
  currency,
  details,
  onDetailsChange,
}) => (
  <div aria-label="Choose a service and package">
    <fieldset>
      <legend className="sr-only">Choose one service</legend>
      <p className="sr-only" id="booking-service-hint">Choose one service. Required.</p>

      {servicesState === 'loading' ? (
        <div role="status" className="flex items-center gap-2 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600"><LoaderCircle size={16} className="animate-spin text-[#8C6A2F]" aria-hidden="true"/>Loading services…</div>
      ) : servicesState === 'error' ? (
        <p id="booking-service-hint" role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          We couldn’t load the current service catalogue. Please refresh and try again.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map(item => {
            const Icon = item.id === 'handyman_plumbing' ? Hammer : serviceIcons[item.iconName] || Home;
            const selected = item.id === serviceId;
            const hasPackages = packagesState === 'ready' && packages.length > 0;
            const noPackages = packagesState === 'ready' && packages.length === 0;
            const showPackagePanel = selected && (hasPackages || noPackages || packagesState === 'loading' || packagesState === 'error');
            const packagePanelId = `packages-${item.id}`;

            return (
              <motion.article layout transition={{ duration: 0.22, ease: 'easeOut' }} key={item.id} className={`overflow-hidden rounded-2xl border transition duration-200 ${selected ? 'border-[#102A43] bg-white shadow-md ring-1 ring-[#102A43]/10' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#D4A853]/80 hover:shadow-md'}`}>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-describedby="booking-service-hint"
                  aria-expanded={showPackagePanel}
                  aria-controls={showPackagePanel ? packagePanelId : undefined}
                  onClick={() => onServiceChange(item.id)}
                  className="group relative w-full p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D4A853]"
                >
                  <span className="flex items-start gap-3">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors duration-200 ${selected ? 'bg-[#102A43] text-[#D4A853]' : 'bg-[#D4A853]/15 text-[#102A43] group-hover:bg-[#D4A853]/25'}`} aria-hidden="true">
                      <Icon size={23} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1 pr-7">
                      <span className="block text-sm font-semibold text-[#102A43]">{item.name}</span>
                      <span className="mt-1 block truncate text-xs leading-5 text-slate-500">{serviceDescriptions[item.id] || item.description}</span>
                    </span>
                    <span className={`absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full transition-all duration-200 ${selected ? 'scale-100 bg-[#102A43] text-white' : 'scale-90 border border-slate-300 text-transparent group-hover:border-[#D4A853]'}`} aria-hidden="true">
                      <Check size={14} />
                    </span>
                  </span>
                  <span className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-slate-500"><Clock3 size={13} aria-hidden="true" />~{item.durationMinutes} min</span>
                    <span className="font-semibold text-[#8C6A2F]">{item.pricingType === 'fixed' ? `From ${formatCurrency(item.basePrice, currency)}` : 'Custom Quote'}</span>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {showPackagePanel && (
                    <motion.section
                      id={packagePanelId}
                      aria-labelledby={`${packagePanelId}-title`}
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="overflow-hidden border-t border-slate-100 bg-[#F7F8FA] p-4"
                    >
                      {hasPackages ? (
                        <div className="flex items-center justify-between gap-3">
                          <h3 id={`${packagePanelId}-title`} className="text-sm font-semibold text-[#102A43]">Choose a package</h3>
                          <span className="text-[11px] font-medium text-slate-500">Required</span>
                        </div>
                      ) : <h3 id={`${packagePanelId}-title`} className="sr-only">{noPackages ? 'Request description' : 'Package options'}</h3>}

                      {packagesState === 'loading' && <p role="status" className="flex items-center gap-2 text-xs text-slate-600"><LoaderCircle size={14} className="animate-spin text-[#8C6A2F]" aria-hidden="true"/>Loading packages…</p>}

                      {hasPackages && (
                        <div className="mt-3 grid gap-2">
                          {packages.map(option => {
                            const packageSelected = option.id === packageId;
                            return (
                              <motion.button
                                key={option.id}
                                type="button"
                                aria-pressed={packageSelected}
                                onClick={() => onPackageChange(option.id)}
                                whileTap={{ scale: 0.99 }}
                                className={`flex min-h-[76px] items-center justify-between gap-3 rounded-xl border p-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] ${packageSelected ? 'border-[#D4A853] bg-[#D4A853]/10 shadow-sm' : 'border-slate-200 bg-white hover:border-[#D4A853]/70 hover:shadow-sm'}`}
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${packageSelected ? 'border-[#102A43] bg-[#102A43] text-white' : 'border-slate-300 text-transparent'}`} aria-hidden="true"><Check size={12} /></span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium text-[#102A43]">{option.name}</span>
                                    <span className="mt-0.5 block max-w-[230px] truncate text-[11px] text-slate-500">{option.description}</span>
                                    <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-500"><Clock3 size={12} aria-hidden="true" />~{option.durationMinutes} min</span>
                                  </span>
                                </span>
                                <strong className="shrink-0 text-sm text-[#102A43]">{option.basePrice.toLocaleString()} {option.currency}</strong>
                              </motion.button>
                            );
                          })}
                        </div>
                      )}

                      {packagesState === 'error' && (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-slate-600" aria-live="polite">
                          {packageMessage && <span role="alert" className="text-amber-800">{packageMessage}</span>}
                          {!packageMessage && <span role="alert">Live packages couldn’t be verified. Quote requests are still available.</span>}
                          <button type="button" onClick={onRetry} className="font-semibold text-[#102A43] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]">Retry</button>
                          <span>Estimate: {formatDemoEstimate(item.id)} / {getDemoEstimate(item.id)?.unit || 'request'}.</span>
                        </div>
                      )}

                      {noPackages && (
                        <label className="block" htmlFor={`request-description-${item.id}`}>
                          <span className="text-sm font-semibold text-[#102A43]">Request description</span>
                          <textarea id={`request-description-${item.id}`} value={details} onChange={event => onDetailsChange(event.target.value)} rows={3} maxLength={1000} placeholder="What would you like help with?" className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15" />
                        </label>
                      )}
                    </motion.section>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      )}
    </fieldset>
  </div>
);
