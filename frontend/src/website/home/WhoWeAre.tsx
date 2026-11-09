import React, { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { ArrowRight, Award, Headphones, HeartHandshake, Home, ShieldCheck, Star } from 'lucide-react';

interface WhoWeAreProps {
  image?: string;
  onAboutClick: () => void;
}

const metrics = [
  { value: 600, suffix: '+', label: 'Happy homes served', icon: Home },
  { value: 4.9, suffix: ' / 5', decimals: 1, label: 'Customer rating', icon: Star },
  { value: 100, suffix: '%', label: 'Verified professionals', icon: ShieldCheck },
  { value: 24, suffix: '/7', label: 'Customer support', icon: Headphones },
];

const AnimatedMetric: React.FC<{ value: number; suffix: string; decimals?: number }> = ({ value, suffix, decimals = 0 }) => {
  const reduceMotion = useReducedMotion();
  const counter = useMotionValue(reduceMotion ? value : 0);
  const display = useTransform(counter, (latest) => `${decimals ? latest.toFixed(decimals) : Math.round(latest).toLocaleString()}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.65 });

  useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) {
      counter.set(value);
      return;
    }
    const controls = animate(counter, value, { duration: 1.25, ease: 'easeOut' });
    return () => controls.stop();
  }, [counter, isInView, reduceMotion, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

export const WhoWeAre: React.FC<WhoWeAreProps> = ({ image, onAboutClick }) => {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="who-we-are-title" className="bg-white py-20 transition-colors duration-300 dark:bg-[#0b1724] lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[.95fr_1.05fr] lg:gap-16 lg:px-8">
        <div className="group relative">
          <div aria-hidden="true" className="absolute -bottom-4 -left-4 h-1/2 w-1/2 rounded-[2rem] bg-[#D4A853]/15" />
          <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_rgba(16,42,67,0.18)]">
            <img
              src={image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=85'}
              alt="A Meraki home professional caring for a welcoming home"
              loading="lazy"
              className="h-[320px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none sm:h-[420px] lg:h-[500px]"
            />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#102A43]/5 px-3.5 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#102A43] dark:bg-white/10 dark:text-white">
            <span>Who We Are</span>
          </div>
          <h2 id="who-we-are-title" className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[#102A43] dark:text-white sm:text-4xl lg:text-[2.75rem]">
            More than a cleaning company
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
            Meraki means doing something with soul, creativity, and love. We connect skilled domestic professionals with households across Addis Ababa, bringing trusted care and opportunity into everyday home life.
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <article className="border-l-2 border-[#D4A853] pl-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#102A43] dark:text-white"><HeartHandshake size={17} className="text-[#8C6A2F] dark:text-[#D4A853]" aria-hidden="true" />Our Mission</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Deliver peace of mind to every household we serve, while creating dignified, well-paid employment for domestic workers.</p>
            </article>
            <article className="border-l-2 border-[#D4A853] pl-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#102A43] dark:text-white"><Award size={17} className="text-[#8C6A2F] dark:text-[#D4A853]" aria-hidden="true" />Our Vision</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">To become the most trusted household brand in East Africa, expanding across Ethiopia and beyond by 2030.</p>
            </article>
          </div>

          <button type="button" onClick={onAboutClick} className="group mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#102A43]/30 px-5 text-sm font-semibold text-[#102A43] transition-all hover:-translate-y-0.5 hover:border-[#D4A853] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] dark:border-white/25 dark:text-white">
            Learn more about us <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
          </button>

          <div role="group" aria-label="Meraki Homes at a glance" className="mt-9 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 dark:border-slate-700 sm:grid-cols-4 lg:gap-3">
            {metrics.map(({ value, suffix, decimals, label, icon: Icon }, index) => (
              <motion.div
                key={label}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.07 }}
                className="min-w-0"
              >
                <Icon size={17} className="text-[#8C6A2F] dark:text-[#D4A853]" aria-hidden="true" />
                <p className="mt-2 text-xl font-extrabold tracking-tight text-[#102A43] dark:text-white sm:text-2xl">
                  <AnimatedMetric value={value} suffix={suffix} decimals={decimals} />
                </p>
                <p className="mt-1 text-[11px] leading-4 text-slate-600 dark:text-slate-300 sm:text-xs">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
