import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface FaqSectionProps {
  onContactClick: () => void;
}

const faqItems = [
  {
    question: 'When is my booking confirmed?',
    answer:
      'Submitting a request registers your interest and requirements. Our operations coordinator promptly verifies professional availability, location coverage, and schedule before contacting you to confirm all details. Your appointment is officially confirmed only once you approve the final scope.',
  },
  {
    question: 'Do I need an account to request a service?',
    answer:
      'No account creation is required! You can submit a booking request as a guest using simply your name, phone number, and address. You will receive a unique tracking reference (e.g. MRK-XXXXXXXXXXXX) to check your request status at any time.',
  },
  {
    question: 'How are prices calculated?',
    answer:
      'Our website displays transparent starting estimates based on standard property sizes and service durations. For custom requests or larger homes, our team reviews the exact scope and confirms the final price upfront with you — never any hidden or unexpected surprise charges.',
  },
  {
    question: 'How are domestic specialists screened and trained?',
    answer:
      'Every Meraki professional completes a comprehensive background verification process including official Kebele ID validation, police clearance records, and past employer audits, followed by 5 days of intensive hands-on customer service and safety training.',
  },
  {
    question: 'What is your Quality Guarantee?',
    answer:
      'We stand behind every service with our 24-hour Quality Guarantee. If any agreed task does not meet our high standards, simply let our support team know within 24 hours and we will send a specialist to rectify the work free of charge.',
  },
  {
    question: 'Which areas of Addis Ababa do you cover?',
    answer:
      'We actively serve households throughout Addis Ababa, including Bole, Kazanchis, Old Airport, Sarbet, Bisrate Gabriel, CMC, Summit, Ayat, Piassa, and surrounding sub-cities. Our coordinator confirms route coverage when reviewing your request.',
  },
];

export const FaqSection: React.FC<FaqSectionProps> = ({ onContactClick }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC] dark:bg-[#0b1724] transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#102A43]/5 dark:bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#102A43] dark:text-white">
            <HelpCircle size={14} className="text-[#D4A853]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Everything you need to know about booking, pricing, and our verified home services.
          </p>
        </div>

        {/* Accordion Cards */}
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.question}
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
                    {item.question}
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
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Questions Callout */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-white dark:bg-[#14283b] border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-left">
            <h3 className="font-bold text-[#102A43] dark:text-white">Still have questions?</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Our customer care team is available 7 days a week to help.
            </p>
          </div>
          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#102A43] dark:text-[#D4A853] hover:text-[#D4A853] transition-colors"
          >
            <span>Contact Support</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
};
