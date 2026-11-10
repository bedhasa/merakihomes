import React from 'react';
import { HeartHandshake, Compass } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const heroImage = '/meraki-home-services-team.png';
const storyImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85';
const missionImage = '/elder-companion-care.jpg';
const visionImage = 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85';

export const AboutPage: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : delay, ease: 'easeOut' as const },
  });

  return (
    <div className="overflow-hidden bg-[#F8FAFC] text-[#102A43] dark:bg-[#0b1724]">
      {/* Intro hero follows the same full-width image treatment as Services. */}
      <section aria-labelledby="about-hero-title" className="group relative isolate -mt-20 min-h-[410px] overflow-hidden bg-[#F8FAFC] px-5 pb-14 pt-32 dark:bg-[#102A43] sm:min-h-[460px] sm:pb-16 lg:min-h-[500px] lg:px-8 lg:pb-20">
        <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
          <img src={heroImage} alt="" className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-white/90 via-white/75 to-white/30 dark:from-[#102A43]/90 dark:via-[#102A43]/75 dark:to-[#102A43]/45" />
        <motion.div {...reveal()} className="relative z-10 mx-auto flex min-h-[260px] max-w-7xl items-center sm:min-h-[290px]">
          <div className="max-w-2xl">
            <h1 id="about-hero-title" className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[#102A43] dark:text-white sm:text-5xl lg:text-6xl">
              Caring for every home, like it’s our own
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 dark:text-white/90 sm:text-lg">
              We connect Addis Ababa households with trusted home services, thoughtfully arranged around the people who live and work in them.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Our story */}
      <section aria-labelledby="about-story-title" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-9 px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-8">
          <motion.div {...reveal()} className="group relative overflow-hidden rounded-3xl shadow-xl shadow-[#102A43]/10">
            <img src={storyImage} alt="A bright, comfortable home cared for by its household" loading="lazy" className="h-[280px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none sm:h-[390px] lg:h-[440px]" />
          </motion.div>
          <motion.div {...reveal(0.08)}>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8C6A2F] dark:text-[#D4A853]">Our story</p>
            <h2 id="about-story-title" className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#102A43] dark:text-white sm:text-4xl">A more thoughtful way to find help at home</h2>
            <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300"><span className="font-semibold text-[#102A43] dark:text-white">Meraki</span> is a Greek word for doing something with soul, creativity, and love. We started Meraki Homes to make trusted household support easier to find and to create a more dignified connection between families and skilled domestic professionals.</p>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Our platform helps people describe what they need, understand the service details, and connect with professionals through a clear, supported process. Every home is different, so we take the time to understand yours.</p>
          </motion.div>
        </div>
      </section>

      {/* Mission with image */}
      <section aria-labelledby="about-mission-title" className="bg-white py-16 dark:bg-[#0d1e2e] sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-9 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <motion.div {...reveal()} className="group order-1 overflow-hidden rounded-3xl shadow-xl shadow-[#102A43]/10">
            <img src={missionImage} alt="A home professional carefully preparing a living space" loading="lazy" className="h-[280px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none sm:h-[390px] lg:h-[430px]" />
          </motion.div>
          <motion.div {...reveal(0.08)} className="order-2">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D4A853]/20 text-[#76571F] dark:text-[#E5C883]"><HeartHandshake size={24} aria-hidden="true" /></div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-[#8C6A2F] dark:text-[#D4A853]">Our mission</p>
            <h2 id="about-mission-title" className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#102A43] dark:text-white sm:text-4xl">Make everyday living feel a little easier</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">We simplify everyday life through trusted, high-quality home services. We also work to create dignified, meaningful opportunities for the professionals who care for the homes and families we serve.</p>
          </motion.div>
        </div>
      </section>

      {/* Vision with image */}
      <section aria-labelledby="about-vision-title" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-9 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <motion.div {...reveal()} className="order-2 lg:order-1">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D4A853]/20 text-[#76571F] dark:text-[#E5C883]"><Compass size={24} aria-hidden="true" /></div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-[#8C6A2F] dark:text-[#D4A853]">Our vision</p>
            <h2 id="about-vision-title" className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#102A43] dark:text-white sm:text-4xl">To be Ethiopia’s most trusted home-services platform</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">We envision a future where every household can find dependable help with confidence, and every home professional can build a respected, sustainable livelihood.</p>
          </motion.div>
          <motion.div {...reveal(0.08)} className="group order-1 overflow-hidden rounded-3xl shadow-xl shadow-[#102A43]/10 lg:order-2">
            <img src={visionImage} alt="A calm, welcoming home representing a better everyday life" loading="lazy" className="h-[280px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none sm:h-[390px] lg:h-[430px]" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
