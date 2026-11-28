import React from 'react';
import { CalendarClock, CircleDollarSign, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';

export const WhyChooseUs: React.FC = () => {
  const t = useTranslations('whyChoose');
  const reduceMotion = useReducedMotion();

  const features = [
    { titleKey: 'verifiedTitle', bodyKey: 'verifiedBody', icon: ShieldCheck },
    { titleKey: 'backgroundTitle', bodyKey: 'backgroundBody', icon: ShieldCheck },
    { titleKey: 'pricingTitle', bodyKey: 'pricingBody', icon: CircleDollarSign },
    { titleKey: 'bookingTitle', bodyKey: 'bookingBody', icon: CalendarClock },
  ] as const;

  return (
    <section
      aria-labelledby="why-choose-title"
      className="border-y border-slate-200/80 bg-white py-20 transition-colors duration-300 dark:border-slate-800 dark:bg-[#0d1e2e] lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#102A43]/5 px-3.5 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#102A43] dark:bg-white/10 dark:text-white">
            <span>{t('eyebrow')}</span>
          </div>
          <h2
            id="why-choose-title"
            className="mt-4 text-3xl font-bold tracking-tight text-[#102A43] dark:text-white sm:text-4xl lg:text-5xl"
          >
            {t('title')}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {features.map(({ titleKey, bodyKey, icon: Icon }, index) => (
            <motion.article
              key={titleKey}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.38, delay: reduceMotion ? 0 : index * 0.07 }}
              whileHover={reduceMotion ? undefined : { y: -5 }}
              className="group rounded-2xl border border-slate-200/90 bg-[#F8FAFC] p-6 shadow-sm transition-all duration-300 hover:border-[#D4A853] hover:shadow-xl hover:shadow-[#102A43]/[0.07] dark:border-slate-700/80 dark:bg-[#14283b] sm:p-7"
            >
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl bg-[#102A43] text-[#D4A853] shadow-md transition-colors duration-300 group-hover:bg-[#D4A853] group-hover:text-[#102A43]"
                aria-hidden="true"
              >
                <Icon size={23} strokeWidth={1.9} />
              </div>
              <h3 className="mt-6 text-lg font-bold tracking-tight text-[#102A43] dark:text-white">
                {t(titleKey)}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{t(bodyKey)}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
