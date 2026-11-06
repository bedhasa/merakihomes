import React from 'react';
import { Search, CalendarCheck, UserCheck, Sparkles, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface HowItWorksProps {
  onBookNow: () => void;
}

const steps = [
  {
    number: '01',
    title: 'Choose Service',
    description: 'Explore our verified home services and select the exact cleaning, cooking, care, or repair task your household requires.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Book Online',
    description: 'Pick your preferred date and time, choose your location or map pin, and submit your request in under two minutes.',
    icon: CalendarCheck,
  },
  {
    number: '03',
    title: 'Professional Arrives',
    description: 'Your verified specialist arrives promptly on time with clear credentials and your private one-time entry code.',
    icon: UserCheck,
  },
  {
    number: '04',
    title: 'Enjoy Your Home',
    description: 'Sit back and enjoy your spotless, refreshed home with complete peace of mind, backed by our 24-hour guarantee.',
    icon: Sparkles,
  },
];

export const HowItWorks: React.FC<HowItWorksProps> = ({ onBookNow }) => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC] dark:bg-[#0b1724] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#102A43]/5 dark:bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#102A43] dark:text-white">
            <span>Effortless Process</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Booking professional, reliable home help in Addis Ababa takes less than two minutes.
          </p>
        </div>

        {/* 4 Connected Steps Grid */}
        <div className="relative">
          {/* Desktop Visual Connector Line */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-1/2 left-16 right-16 -translate-y-8 h-0.5 bg-gradient-to-r from-[#D4A853]/20 via-[#D4A853] to-[#D4A853]/20 -z-0"
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                  whileHover={reduceMotion ? undefined : { y: -6 }}
                  className="group relative flex flex-col items-center text-center rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#14283b] p-7 shadow-sm transition-all duration-300 hover:border-[#D4A853] hover:shadow-xl hover:shadow-[#102A43]/08"
                >
                  {/* Step Number Badge */}
                  <span className="absolute top-4 right-4 text-xs font-black tracking-widest text-slate-300 dark:text-slate-600 group-hover:text-[#D4A853] transition-colors">
                    {step.number}
                  </span>

                  {/* Icon Circle */}
                  <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-[#102A43] text-[#D4A853] shadow-md shadow-[#102A43]/20 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#D4A853] group-hover:text-[#102A43]">
                    <Icon size={28} strokeWidth={2} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[#102A43] dark:text-white tracking-tight">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-14 text-center">
          <button
            onClick={onBookNow}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#102A43] dark:bg-[#D4A853] dark:text-[#102A43] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#102A43]/20 hover:bg-[#193a5b] dark:hover:bg-[#deb35e] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Your Booking Request</span>
            <ArrowRight size={16} className="text-[#D4A853] dark:text-[#102A43]" />
          </button>
        </div>
      </div>
    </section>
  );
};
