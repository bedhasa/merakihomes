import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { HeroVideoBackground } from '../../components/HeroVideoBackground';

interface HeroSectionProps {
  onBookNow: () => void;
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookNow, onExploreServices }) => {
  const t = useTranslations('home');
  const reduceMotion = useReducedMotion();
  const [goldLine, setGoldLine] = useState(0);
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const goldHeadlineLines = useMemo(
    () => [t('heroLine1'), t('heroLine2'), t('heroLine3')],
    [t],
  );

  const enter = (delay = 0) =>
    reduceMotion
      ? { initial: false as const, animate: { opacity: 1 } }
      : { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay, ease: 'easeOut' as const } };

  useEffect(() => {
    setGoldLine(0);
    setVisibleLetters(0);
    setIsDeleting(false);
  }, [goldHeadlineLines]);

  useEffect(() => {
    if (reduceMotion) {
      setVisibleLetters(goldHeadlineLines[0]?.length || 0);
      setGoldLine(0);
      setIsDeleting(false);
      return;
    }

    const phrase = goldHeadlineLines[goldLine] || '';
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
  }, [goldLine, goldHeadlineLines, isDeleting, reduceMotion, visibleLetters]);

  return (
    <section aria-labelledby="home-hero-title" className="relative isolate overflow-hidden bg-[#FBF8F0] pt-[92px] transition-colors duration-300 dark:bg-[#0b1724] lg:min-h-[700px] lg:pt-[84px]">
      {/* Full-width background video. Text is white in both themes because it always sits on the dark scrim. */}
      <HeroVideoBackground className="bg-[#102A43] dark:bg-[#0b1724]">
        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-center px-5 pb-12 pt-7 sm:min-h-[560px] sm:px-6 sm:pb-14 lg:min-h-[max(616px,calc(100svh-84px))] lg:px-8 lg:pb-8 lg:pt-5">
          <div className="flex flex-col items-start py-3 lg:py-8">
            <motion.h1 {...enter(0.08)} id="home-hero-title" className="max-w-[640px] text-[clamp(2.55rem,4.3vw,3.75rem)] font-bold leading-[1.15] tracking-[-0.045em] text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.35)]">
              {t('heroTitleBefore')}{' '}
              <br className="hidden lg:block" />
              {t('heroTitleMid')}{' '}
              <span className="inline-block min-w-[11ch] max-w-full text-[#D4A853]">
                <span aria-hidden="true" className="border-r-2 border-current pr-1">
                  {(goldHeadlineLines[goldLine] || '').slice(0, visibleLetters)}
                </span>
                <span className="sr-only">{goldHeadlineLines[0]}</span>
              </span>
            </motion.h1>

            <motion.p {...enter(0.16)} className="mt-5 max-w-[460px] text-[15px] leading-6 text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)] sm:text-base sm:leading-7">
              {t('heroSubtitle')}
            </motion.p>

            <motion.div {...enter(0.24)} className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-3.5">
              <motion.button
                onClick={onBookNow}
                whileHover={reduceMotion ? undefined : { y: -2, boxShadow: '0 10px 22px rgba(16,42,67,0.17)' }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-[#D4A853] px-6 py-3 text-sm font-bold text-[#102A43] shadow-md shadow-[#102A43]/10 transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4A853]/45"
              >
                {t('heroCtaBook')}
                <ArrowRight size={17} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
              <motion.button
                onClick={onExploreServices}
                whileHover={reduceMotion ? undefined : { y: -2, boxShadow: '0 8px 18px rgba(0,0,0,0.25)' }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/70 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4A853]/45"
              >
                {t('heroCtaExplore')}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </HeroVideoBackground>
    </section>
  );
};
