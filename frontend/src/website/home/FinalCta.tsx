import React from 'react';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface FinalCtaProps {
  onBookNow: () => void;
  onContactUs: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onBookNow, onContactUs }) => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 lg:py-24 bg-[#F8FAFC] dark:bg-[#0b1724] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          className="relative overflow-hidden rounded-3xl bg-[#102A43] dark:bg-[#14283b] px-8 py-16 sm:px-14 sm:py-20 text-center shadow-2xl shadow-[#102A43]/20"
        >
          {/* Ambient Gold & Navy Glow Backgrounds */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 h-96 w-96 rounded-full bg-[#D4A853]/20 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 h-96 w-96 rounded-full bg-[#173A58] blur-3xl pointer-events-none"
          />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A853]/40 bg-[#D4A853]/15 px-4 py-1.5 backdrop-blur-md mb-6">
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#D4A853]">
                Start In Under 2 Minutes
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to make your home life easier?
            </h2>

            {/* Subheading */}
            <p className="mt-5 text-base sm:text-lg lg:text-xl text-white/85 leading-relaxed max-w-2xl mx-auto">
              Join hundreds of happy households in Addis Ababa. Experience prompt, verified, and reliable home care tailored for you.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onBookNow}
                className="w-full sm:w-auto inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#D4A853] px-9 py-4 text-base font-bold text-[#102A43] shadow-xl shadow-[#D4A853]/25 hover:bg-[#e0b764] hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all motion-reduce:transform-none motion-reduce:transition-none"
              >
                <span>Book Now</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={onContactUs}
                className="w-full sm:w-auto inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md hover:bg-white/20 hover:border-white/50 active:scale-[0.98] transition-all"
              >
                <span>Contact Us</span>
              </button>
            </div>

            {/* Micro Assurances */}
            <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#D4A853]" />
                <span>Zero Upfront Charge</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#D4A853]" />
                <span>Verified Professionals</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#D4A853]" />
                <span>24-Hour Quality Guarantee</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone size={15} className="text-[#D4A853]" />
                <span>Direct Addis Coordinator</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
