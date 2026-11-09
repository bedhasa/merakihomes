import React from 'react';
import { Star, Home, ShieldCheck, Headphones, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricItem {
  id: string;
  icon: React.ElementType;
  value: string;
  label: string;
  isRating?: boolean;
}

const metrics: MetricItem[] = [
  {
    id: 'rating',
    icon: Star,
    value: '4.9 / 5',
    label: 'Customer Rating',
    isRating: true,
  },
  {
    id: 'homes',
    icon: Home,
    value: '600+',
    label: 'Happy Homes Served',
  },
  {
    id: 'verified',
    icon: ShieldCheck,
    value: '100%',
    label: 'Verified Professionals',
  },
  {
    id: 'support',
    icon: Headphones,
    value: '24/7',
    label: 'Customer Support',
  },
  {
    id: 'location',
    icon: MapPin,
    value: 'Serving',
    label: 'All Addis Ababa',
  },
];

export const StatisticsSection: React.FC = () => {
  return (
    <section
      aria-label="Trust Metrics"
      className="relative z-20 border-y border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0d1e2e] py-6 sm:py-8 shadow-sm transition-colors duration-300"
    >
      <div className="mx-auto w-[93%] max-w-[96rem] px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-slate-800 items-center">
          {metrics.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
                className={`flex flex-col items-center text-center ${
                  index > 0 ? 'pt-4 sm:pt-0 sm:pl-4' : ''
                }`}
              >
                {/* Gold Icon */}
                <div className="flex items-center justify-center mb-2 text-[#D4A853]">
                  {item.isRating ? (
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={17} fill="#D4A853" className="stroke-[#D4A853]" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4A853]/15 dark:bg-[#D4A853]/20">
                      <Icon size={20} strokeWidth={2.2} />
                    </div>
                  )}
                </div>

                {/* Primary Metric Value */}
                <div className="text-xl sm:text-2xl font-black tracking-tight text-[#102A43] dark:text-white">
                  {item.value}
                </div>

                {/* Metric Label */}
                <div className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
