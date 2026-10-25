import React from 'react';
import {formatDemoEstimate,getDemoEstimate} from '@shared/demoPricing';
import { Clock3 } from 'lucide-react';
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
};

const fieldClass = 'mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#334155] outline-none transition focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/30 disabled:cursor-not-allowed disabled:bg-slate-100';

export const ServicePackageSelector: React.FC<Props> = ({ services, servicesState, serviceId, onServiceChange, packages, packagesState, packageId, onPackageChange, packageMessage, onRetry, currency }) => {
  const service = services.find(item => item.id === serviceId);

  return <div className="space-y-5" aria-label="Choose a service and package">
    <label htmlFor="booking-service" className="block text-sm font-semibold text-[#102A43]">Service <span aria-hidden="true" className="text-red-700">*</span>
      <select id="booking-service" name="serviceId" required value={serviceId} disabled={servicesState !== 'ready'} onChange={event => onServiceChange(event.target.value)} className={fieldClass} aria-describedby="booking-service-hint">
        <option value="">{servicesState === 'loading' ? 'Loading services…' : servicesState === 'error' ? 'Services unavailable' : 'Select a service'}</option>
        {services.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
      </select>
    </label>
    <p id="booking-service-hint" className="-mt-4 text-xs leading-5 text-slate-500" role={servicesState === 'error' ? 'alert' : undefined}>{servicesState === 'error' ? 'We could not load the current service catalogue. Please refresh and try again.' : service?.description || 'Choose from the currently published Meraki Homes services.'}</p>

    {service && <div className="border-t border-slate-200 pt-4">
      <label htmlFor="booking-package" className="block text-sm font-semibold text-[#102A43]">Package <span className="font-normal text-slate-500">{packagesState === 'ready' && packages.length ? '(required)' : '(optional)'}</span>
        <select id="booking-package" name="packageId" value={packageId} disabled={packagesState !== 'ready' || packages.length === 0} onChange={event => onPackageChange(event.target.value)} className={fieldClass} aria-describedby="booking-package-hint">
          <option value="">{packagesState === 'loading' ? 'Checking current options…' : packagesState === 'error' ? 'Package options unavailable' : packages.length ? 'Select a package' : 'No package configured'}</option>
          {packages.map(option => <option value={option.id} key={option.id}>{option.name} — {option.basePrice.toLocaleString()} {option.currency}, {option.durationMinutes} min</option>)}
        </select>
      </label>
      <div id="booking-package-hint" className="mt-2 min-h-5 text-xs leading-5 text-slate-600" aria-live="polite">
        {packageMessage && <span role="alert" className="text-amber-800">{packageMessage}</span>}
        {!packageMessage && packagesState === 'loading' && <span role="status">Verifying current service options…</span>}
        {!packageMessage && packagesState === 'error' && <span role="alert">Live options could not be verified. You can still submit a quote request. </span>}{packagesState === 'error' && <button type="button" onClick={onRetry} className="ml-1 font-semibold text-[#102A43] underline focus:outline-none focus:ring-2 focus:ring-[#D4A853]">Try again</button>}
        {!packageMessage && packagesState === 'ready' && packages.length > 0 && <span>Choose one of the packages currently configured for this service.</span>}
        {packagesState === 'error' && <span className="mt-2 block">Prototype demo estimate: {formatDemoEstimate(service.id)} / {getDemoEstimate(service.id)?.unit || 'request'}. This is illustrative only.</span>}
        {!packageMessage && packagesState === 'ready' && packages.length === 0 && <span>Demo estimate: {formatDemoEstimate(service.id)} / {getDemoEstimate(service.id)?.unit || 'request'}. Illustrative prototype amount; the team reviews scope before agreeing a final price.</span>}
      </div>
      {packageId && packagesState === 'ready' && packages.find(option => option.id === packageId) && <div className="mt-3 flex items-start gap-2 rounded-md border border-[#D4A853]/60 bg-[#D4A853]/10 p-3 text-sm text-[#102A43]"><Clock3 size={16} className="mt-0.5 shrink-0 text-[#8C6A2F]"/><span><strong>{packages.find(option => option.id === packageId)?.name}</strong> — {packages.find(option => option.id === packageId)?.basePrice.toLocaleString()} {packages.find(option => option.id === packageId)?.currency}, {packages.find(option => option.id === packageId)?.durationMinutes} minutes</span></div>}
    </div>}
  </div>;
};
