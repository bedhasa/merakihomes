import React, { useEffect, useState } from 'react';
import { ArrowRight, ChartNoAxesCombined, Clock3, ShieldCheck, UsersRound } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface HeroSectionProps {
  onBookNow: () => void;
  onExploreServices: () => void;
}

const trustItems = [
  { icon: UsersRound, title: 'Household Focused', description: 'Support shaped around your home and routine.' },
  { icon: ChartNoAxesCombined, title: 'Dependable Home Care', description: 'Consistent service with clear expectations.' },
  { icon: ShieldCheck, title: 'Verified Professionals', description: 'Profiles reviewed before an appointment.' },
  { icon: Clock3, title: 'Support When Needed', description: 'Our local team helps with booking details.' },
];

const goldHeadlineLines = ['Done With Soul', 'Made with Care', 'Here for Home'];

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookNow, onExploreServices }) => {
  const reduceMotion = useReducedMotion();
  const [goldLine, setGoldLine] = useState(0);
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const enter = (delay = 0) => reduceMotion
    ? { initial: false as const, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay, ease: 'easeOut' as const } };

  useEffect(() => {
    if (reduceMotion) {
      setVisibleLetters(goldHeadlineLines[0].length);
      setGoldLine(0);
      setIsDeleting(false);
      return;
    }

    const phrase = goldHeadlineLines[goldLine];
    let timer: number;
    if (isDeleting && visibleLetters > 0) {
      timer = window.setTimeout(() => setVisibleLetters((current) => current - 1), 85);
    } else if (isDeleting) {
      timer = window.setTimeout(() => {
        setIsDeleting(false);
        setGoldLine((current) => (current + 1) % goldHeadlineLines.length);
      }, 300);
    } else if (visibleLetters < phrase.length) {
      timer = window.setTimeout(() => setVisibleLetters((current) => current + 1), 125);
    } else {
      timer = window.setTimeout(() => setIsDeleting(true), 1600);
    }

    return () => window.clearTimeout(timer);
  }, [goldLine, isDeleting, reduceMotion, visibleLetters]);

  return (
    <section aria-labelledby="home-hero-title" className="relative isolate overflow-hidden bg-[#FBF8F0] pt-[92px] transition-colors duration-300 dark:bg-[#0b1724] lg:min-h-[700px] lg:pt-[84px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_24%_30%,rgba(212,168,83,0.075),transparent_42%)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-9 px-5 pb-12 pt-7 sm:px-6 sm:pb-14 lg:min-h-[616px] lg:grid-cols-[1.04fr_.96fr] lg:gap-12 lg:px-8 lg:pb-8 lg:pt-5">
        <div className="flex flex-col items-start py-3 lg:py-8">
          <motion.h1 {...enter(0.08)} id="home-hero-title" className="max-w-[590px] text-[clamp(2.55rem,4.3vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.045em] text-[#102A43] dark:text-white">
            Where Every Detail<br className="hidden lg:block" />Is{' '}
            <span className="inline-block min-w-[11ch] text-[#8C6A2F] dark:text-[#D4A853]">
              <span aria-hidden="true" className="border-r-2 border-current pr-1">{goldHeadlineLines[goldLine].slice(0, visibleLetters)}</span>
              <span className="sr-only">Done With Soul</span>
            </span>
          </motion.h1>

          <motion.p {...enter(0.16)} className="mt-5 max-w-[460px] text-[15px] leading-6 text-slate-600 dark:text-slate-300 sm:text-base sm:leading-7">
            Book cleaning, cooking, childcare, or repairs in Addis Ababa. We’ll review your request and confirm the details with you.
          </motion.p>

          <motion.div {...enter(0.24)} className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-3.5">
            <motion.button
              onClick={onBookNow}
              whileHover={reduceMotion ? undefined : { y: -2, boxShadow: '0 10px 22px rgba(16,42,67,0.17)' }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-[#D4A853] px-6 py-3 text-sm font-bold text-[#102A43] shadow-md shadow-[#102A43]/10 transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4A853]/45"
            >
              Book a Service
              <ArrowRight size={17} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
            <motion.button
              onClick={onExploreServices}
              whileHover={reduceMotion ? undefined : { y: -2, boxShadow: '0 8px 18px rgba(16,42,67,0.10)' }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#102A43]/80 bg-white/75 px-6 py-3 text-sm font-semibold text-[#102A43] shadow-sm transition-colors duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#102A43]/20 dark:border-slate-300/60 dark:bg-[#14283b] dark:text-white dark:hover:bg-[#1c354a] dark:focus-visible:ring-[#D4A853]/40"
            >
              Explore Services
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 72, damping: 20, delay: reduceMotion ? 0 : 0.12 }}
          whileHover={reduceMotion ? undefined : { rotateY: -0.8, rotateX: 0.5, scale: 1.004, transition: { duration: 0.45 } }}
          className="relative mx-auto w-full max-w-[590px] lg:ml-0 lg:mr-0 lg:max-w-none"
          style={{ perspective: 1000 }}
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -3, 0], scale: [1, 1.015, 1] }}
            transition={reduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="relative h-[300px] overflow-hidden rounded-[1.6rem] shadow-[0_22px_55px_rgba(16,42,67,0.16)] transition-shadow duration-500 hover:shadow-[0_28px_64px_rgba(16,42,67,0.2)] sm:h-[390px] md:h-[430px] lg:h-[530px] lg:rounded-l-[42%] lg:rounded-r-[22px] xl:h-[555px]"
          >
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=85"
              alt="A bright, welcoming home being professionally cared for"
              className="h-full w-full object-cover object-center"
              loading="eager"
            />
            {!reduceMotion && <>
              <motion.span
                aria-hidden="true"
                animate={{ x: ['-140%', '360%'] }}
                transition={{ duration: 7, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-y-0 left-0 w-[38%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-screen"
              />
              <motion.span aria-hidden="true" animate={{ y: [0, -22, -36], opacity: [0, 0.3, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1.2, ease: 'easeOut' }} className="pointer-events-none absolute left-[28%] top-[58%] h-1 w-1 rounded-full bg-white/80 blur-[1px]" />
              <motion.span aria-hidden="true" animate={{ y: [0, -18, -30], opacity: [0, 0.22, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 3, ease: 'easeOut' }} className="pointer-events-none absolute left-[64%] top-[38%] h-1 w-1 rounded-full bg-white/80 blur-[1px]" />
            </>}
          </motion.div>
        </motion.div>
      </div>

      <div className="relative z-10 border-t border-white/10 bg-[#102A43] text-white dark:bg-[#14283b]">
        {reduceMotion ? (
          <ul aria-label="Why households choose Meraki Homes" className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 px-5 py-3 sm:grid-cols-2 sm:divide-y-0 sm:px-6 lg:grid-cols-4 lg:px-8">
            {trustItems.map(({ icon: Icon, title, description }, index) => (
              <li key={title} className={`flex min-h-[86px] items-center gap-4 px-2 py-4 sm:px-4 ${index % 2 === 1 ? 'sm:border-l sm:border-white/10' : ''} ${index > 1 ? 'lg:border-l lg:border-white/10' : ''}`}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#D4A853]/12 text-[#D4A853]" aria-hidden="true"><Icon size={22} strokeWidth={1.8} /></span>
                <span><span className="block text-sm font-bold text-white">{title}</span><span className="mt-1 block text-xs leading-5 text-white/70">{description}</span></span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="overflow-hidden py-3" aria-label="Why households choose Meraki Homes">
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
              className="flex w-max"
            >
              {[0, 1].map((copy) => (
                <ul key={copy} aria-hidden={copy === 1 ? true : undefined} className="flex w-max shrink-0">
                  {trustItems.map(({ icon: Icon, title, description }, index) => (
                    <li key={title} className={`group flex min-h-[86px] w-[min(82vw,300px)] shrink-0 items-center gap-4 border-r border-white/10 px-5 py-4 sm:w-[min(42vw,340px)] sm:px-7 lg:w-[320px] ${index === 0 ? 'border-l border-white/10' : ''}`}>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#D4A853]/12 text-[#D4A853] transition-colors duration-300 group-hover:bg-[#D4A853]/20" aria-hidden="true"><Icon size={22} strokeWidth={1.8} /></span>
                      <span><span className="block text-sm font-bold text-white">{title}</span><span className="mt-1 block text-xs leading-5 text-white/70">{description}</span></span>
                    </li>
                  ))}
                </ul>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};
