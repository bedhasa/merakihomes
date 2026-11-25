import React from 'react';
import { HeartHandshake, Compass } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';

const heroImage = '/meraki-home-services-team.png';
const storyImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85';
const missionImage = '/elder-companion-care.jpg';
const visionImage = 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85';

export const AboutPage: React.FC = () => {
  const t = useTranslations('about');
  const reduceMotion = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : delay, ease: 'easeOut' as const },
  });

  return (
    <div className="overflow-hidden bg-[#F8FAFC] text-[#102A43] dark:bg-[#0b1724]">
      <section aria-labelledby="about-hero-title" className="group relative isolate -mt-20 min-h-[410px] overflow-hidden bg-[#F8FAFC] px-5 pb-14 pt-32 dark:bg-[#102A43] sm:min-h-[460px] sm:pb-16 lg:min-h-[500px] lg:px-8 lg:pb-20">
        <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
          <img src={heroImage} alt="" className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-white/90 via-white/75 to-white/30 dark:from-[#102A43]/90 dark:via-[#102A43]/75 dark:to-[#102A43]/45" />
        <motion.div {...reveal()} className="relative z-10 mx-auto flex min-h-[260px] max-w-7xl items-center sm:min-h-[290px]">
          <div className="max-w-2xl">
            <h1 id="about-hero-title" className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[#102A43] dark:text-white sm:text-5xl lg:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 dark:text-white/90 sm:text-lg">
              {t('heroSubtitle')}
            </p>
          </div>
        </motion.div>
      </section>

      <section aria-labelledby="about-story-title" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-9 px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-8">
          <motion.div {...reveal()} className="group relative overflow-hidden rounded-3xl shadow-xl shadow-[#102A43]/10">
            <img src={storyImage} alt={t('storyImageAlt')} loading="lazy" className="h-[280px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none sm:h-[390px] lg:h-[440px]" />
          </motion.div>
          <motion.div {...reveal(0.08)}>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8C6A2F] dark:text-[#D4A853]">{t('storyEyebrow')}</p>
            <h2 id="about-story-title" className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#102A43] dark:text-white sm:text-4xl">{t('storyTitle')}</h2>
            <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">{t('storyBody1')}</p>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{t('storyBody2')}</p>
          </motion.div>
        </div>
      </section>

      <section aria-labelledby="about-mission-title" className="bg-white py-16 dark:bg-[#0d1e2e] sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-9 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <motion.div {...reveal()} className="group order-1 overflow-hidden rounded-3xl shadow-xl shadow-[#102A43]/10">
            <img src={missionImage} alt={t('missionImageAlt')} loading="lazy" className="h-[280px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none sm:h-[390px] lg:h-[430px]" />
          </motion.div>
          <motion.div {...reveal(0.08)} className="order-2">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D4A853]/20 text-[#76571F] dark:text-[#E5C883]"><HeartHandshake size={24} aria-hidden="true" /></div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-[#8C6A2F] dark:text-[#D4A853]">{t('missionEyebrow')}</p>
            <h2 id="about-mission-title" className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#102A43] dark:text-white sm:text-4xl">{t('missionTitle')}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">{t('missionBody')}</p>
          </motion.div>
        </div>
      </section>

      <section aria-labelledby="about-vision-title" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-9 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <motion.div {...reveal()} className="order-2 lg:order-1">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D4A853]/20 text-[#76571F] dark:text-[#E5C883]"><Compass size={24} aria-hidden="true" /></div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-[#8C6A2F] dark:text-[#D4A853]">{t('visionEyebrow')}</p>
            <h2 id="about-vision-title" className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#102A43] dark:text-white sm:text-4xl">{t('visionTitle')}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">{t('visionBody')}</p>
          </motion.div>
          <motion.div {...reveal(0.08)} className="group order-1 overflow-hidden rounded-3xl shadow-xl shadow-[#102A43]/10 lg:order-2">
            <img src={visionImage} alt={t('visionImageAlt')} loading="lazy" className="h-[280px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none sm:h-[390px] lg:h-[430px]" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
