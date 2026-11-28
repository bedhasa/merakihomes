import React from 'react';
import { Award, Heart, HeartHandshake, ShieldCheck, BriefcaseBusiness } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';

export const OurValues: React.FC = () => {
  const t = useTranslations('values');
  const reduceMotion = useReducedMotion();

  const values = [
    { titleKey: 'trustTitle', bodyKey: 'trustBody', icon: ShieldCheck },
    { titleKey: 'qualityTitle', bodyKey: 'qualityBody', icon: Award },
    { titleKey: 'reliabilityTitle', bodyKey: 'reliabilityBody', icon: HeartHandshake },
    { titleKey: 'careTitle', bodyKey: 'careBody', icon: Heart },
    { titleKey: 'professionalTitle', bodyKey: 'professionalBody', icon: BriefcaseBusiness },
  ] as const;

  return (
    <section
      aria-labelledby="our-values-title"
      className="bg-[#F8FAFC] py-20 transition-colors duration-300 dark:bg-[#0b1724] lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D4A853]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#102A43] dark:text-white">
            <span>{t('eyebrow')}</span>
          </div>
          <h2
            id="our-values-title"
            className="mt-4 text-3xl font-bold tracking-tight text-[#102A43] dark:text-white sm:text-4xl lg:text-5xl"
          >
            {t('title')}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {values.map(({ titleKey, bodyKey, icon: Icon }, index) => (
            <motion.article
              key={titleKey}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.36, delay: reduceMotion ? 0 : index * 0.06 }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#D4A853] hover:shadow-lg dark:border-slate-700 dark:bg-[#14283b]"
            >
              <div
                className="grid h-11 w-11 place-items-center rounded-full bg-[#D4A853]/15 text-[#102A43] transition-colors group-hover:bg-[#D4A853] dark:text-[#D4A853]"
                aria-hidden="true"
              >
                <Icon size={21} strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 text-base font-bold text-[#102A43] dark:text-white">{t(titleKey)}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t(bodyKey)}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
