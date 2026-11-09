import React from 'react';
import { Award, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const values = [
  {
    title: 'Trust',
    description: 'Full police clearance and past employer references checked before any professional ever steps foot inside your home.',
    icon: ShieldCheck,
  },
  {
    title: 'Quality',
    description: 'Your complete satisfaction is guaranteed. If any agreed task does not meet our standard, we re-clean or rectify it free within 24 hours.',
    icon: Award,
  },
  {
    title: 'Reliability',
    description: 'Attentive customer care coordinators available 7 days a week via phone and Telegram for changes, queries, and peace of mind.',
    icon: HeartHandshake,
  },
  {
    title: 'Care',
    description: 'Deliver peace of mind to every household we serve, while creating dignified, well-paid employment for domestic workers.',
    icon: Sparkles,
  },
  {
    title: 'Professionalism',
    description: 'Every specialist undergoes strict Kebele ID verification, identity auditing, and structured 5-day professional hospitality and service training.',
    icon: Sparkles,
  },
];

export const OurValues: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="our-values-title" className="bg-[#F8FAFC] py-20 transition-colors duration-300 dark:bg-[#0b1724] lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D4A853]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#102A43] dark:text-white">
            <Sparkles size={14} className="text-[#8C6A2F] dark:text-[#D4A853]" aria-hidden="true" />
            <span>What Guides Us</span>
          </div>
          <h2 id="our-values-title" className="mt-4 text-3xl font-bold tracking-tight text-[#102A43] dark:text-white sm:text-4xl lg:text-5xl">Our Values</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
            The standards behind every conversation, request, and visit.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {values.map(({ title, description, icon: Icon }, index) => (
            <motion.article
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.36, delay: reduceMotion ? 0 : index * 0.06 }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#D4A853] hover:shadow-lg dark:border-slate-700 dark:bg-[#14283b]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#D4A853]/15 text-[#102A43] transition-colors group-hover:bg-[#D4A853] dark:text-[#D4A853]" aria-hidden="true">
                <Icon size={21} strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 text-base font-bold text-[#102A43] dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
