import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';

interface FaqSectionProps {
  onContactClick: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onContactClick }) => {
  const t = useTranslations('faqHome');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  const faqItems = [
    { qKey: 'q1', aKey: 'a1' },
    { qKey: 'q2', aKey: 'a2' },
    { qKey: 'q3', aKey: 'a3' },
    { qKey: 'q4', aKey: 'a4' },
    { qKey: 'q5', aKey: 'a5' },
    { qKey: 'q6', aKey: 'a6' },
  ] as const;

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC] dark:bg-[#0b1724] transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#102A43]/5 dark:bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#102A43] dark:text-white">
            <HelpCircle size={14} className="text-[#D4A853]" />
            <span>{t('eyebrow')}</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.qKey}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className={`overflow-hidden rounded-2xl border bg-white dark:bg-[#14283b] transition-all duration-200 ${
                  isOpen
                    ? 'border-[#D4A853] shadow-md shadow-[#D4A853]/10'
                    : 'border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-[#102A43] dark:text-white">
                    {t(item.qKey)}
                  </span>
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform duration-300 ${
                      isOpen
                        ? 'bg-[#D4A853] text-[#102A43] rotate-180'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700/60">
                        {t(item.aKey)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center p-6 rounded-2xl bg-white dark:bg-[#14283b] border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-left">
            <h3 className="font-bold text-[#102A43] dark:text-white">{t('moreTitle')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t('moreBody')}
            </p>
          </div>
          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#102A43] dark:text-[#D4A853] hover:text-[#D4A853] transition-colors"
          >
            <span>{t('contactSupport')}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
};
