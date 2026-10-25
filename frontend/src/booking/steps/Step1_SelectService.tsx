import React from 'react';
import { MOCK_SERVICES } from '@shared/data/mockServices';
import { formatCurrency } from '@shared/utils/formatters';
import { Clock, Star, Check, ChevronRight } from 'lucide-react';
import { Currency } from '@shared/types';

interface Step1Props {
  selectedServiceId: string | null;
  currency: Currency;
  onSelect: (serviceId: string) => void;
}

const FEATURED_IDS = ['premium_home_cleaning', 'childcare_nanny', 'cooking_service', 'handyman_plumbing'];

export const Step1_SelectService: React.FC<Step1Props> = ({
  selectedServiceId,
  currency,
  onSelect,
}) => {
  const featured = MOCK_SERVICES.filter(s => FEATURED_IDS.includes(s.id));

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          What service do you need?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select a service to get started
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featured.map(s => {
          const isSelected = selectedServiceId === s.id;
          return (
            <button
              key={s.id}
              id={`service-card-${s.id}`}
              onClick={() => onSelect(s.id)}
              className={`text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-golden-500 focus:ring-offset-2 ${
                isSelected
                  ? 'border-golden-500 shadow-lg shadow-golden-100 dark:shadow-golden-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-golden-300 dark:hover:border-golden-600 hover:shadow-md'
              }`}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-700">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Selection overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-golden-500/25 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-golden-500 flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-slate-950" />
                    </div>
                  </div>
                )}
                {/* Badge */}
                {s.popularBadge && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-golden-500 text-slate-950 font-black text-[10px] uppercase rounded-md shadow">
                    {s.popularBadge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className={`p-4 space-y-3 transition-colors ${
                isSelected
                  ? 'bg-golden-50 dark:bg-golden-950/20'
                  : 'bg-white dark:bg-slate-800'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      {s.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${
                      isSelected ? 'text-golden-600' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {s.pricingType === 'quotation' ? 'Price after review' : formatCurrency(s.basePrice, currency)}
                      {s.pricingType !== 'quotation' && <span className="text-xs text-slate-400 dark:text-slate-500 font-normal"> / {s.unit}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" />
                    <span>{s.durationMinutes} min</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

