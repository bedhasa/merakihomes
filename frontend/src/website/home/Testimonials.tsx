import React, { useEffect, useRef } from 'react';
import { Star, Quote, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface Testimonial {
  name: string;
  location: string;
  service: string;
  rating: number;
  avatar: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Selamawit Tadesse',
    location: 'Bole Atlas, Addis Ababa',
    service: 'Premium Home Cleaning',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    quote:
      'Finding reliable cleaning in Addis used to be stressful. Meraki’s specialist arrived right on time with all supplies, and having her ID verification sent to my phone beforehand gave our family complete peace of mind.',
  },
  {
    name: 'Dr. Dawit Haile',
    location: 'Old Airport, Addis Ababa',
    service: 'Elder Companion Care',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    quote:
      'The companion care arranged for my mother has been an incredible blessing. Her caregiver is patient, respectful, and punctual. Meraki’s operations team even calls to check in after visits. Highly recommended!',
  },
  {
    name: 'Bethlehem Alemu',
    location: 'Kazanchis, Addis Ababa',
    service: 'Personal Cooking & Meal Prep',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    quote:
      'As a working professional, preparing healthy Ethiopian dishes every evening was exhausting. Our Meraki cook prepares fresh, delicious meals for the week right in our kitchen. Impeccable hygiene and incredible taste.',
  },
  {
    name: 'Yonas Gebremedhin',
    location: 'Sarbet, Addis Ababa',
    service: 'Plumbing & Handyman Repairs',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    quote:
      'Prompt response when our bathroom plumbing backed up on a weekend. The handyman arrived with proper tools, identified the issue immediately, and fixed it without leaving any mess behind. Transparent pricing with zero surprise charges.',
  },
  {
    name: 'Hanna Mekonnen',
    location: 'CMC, Addis Ababa',
    service: 'Childcare & Babysitting',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    quote:
      'Our nanny is wonderful with our two young children. She is attentive, gentle, and trustworthy. Being able to book verified, police-cleared caregivers in Addis Ababa has completely transformed our work-life balance.',
  },
];

export const Testimonials: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || track.scrollWidth <= track.clientWidth) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const nextScroll = track.scrollLeft + Math.abs(event.deltaY);
      if (track.scrollLeft < maxScroll) {
        event.preventDefault();
        track.scrollLeft = Math.max(0, Math.min(maxScroll, nextScroll));
      }
    };

    track.addEventListener('wheel', handleWheel, { passive: false });
    return () => track.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <section className="border-b border-slate-200/80 bg-white py-20 transition-colors duration-300 dark:border-slate-800 dark:bg-[#0d1e2e] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#102A43]/5 dark:bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#102A43] dark:text-white">
            <Sparkles size={14} className="text-[#D4A853]" />
            <span>Customer Experiences</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
            Loved by Homes Across Addis
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Read real stories from homeowners and families who rely on Meraki Homes for stress-free living.
          </p>
        </div>

        <div
          ref={trackRef}
          role="region"
          aria-label="Customer testimonials. Scroll horizontally to read more experiences."
          tabIndex={0}
          className="testimonials-scroll-track mx-auto flex w-full max-w-5xl snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-4 dark:focus-visible:ring-offset-[#0d1e2e]"
        >
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-35px' }}
              transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : index * 0.06 }}
              className="flex min-h-[360px] w-full shrink-0 snap-center flex-col rounded-3xl border border-slate-200/90 bg-[#F8FAFC] p-7 shadow-sm transition-shadow duration-300 hover:shadow-lg dark:border-slate-700/80 dark:bg-[#14283b] sm:min-h-[380px] sm:p-10 lg:p-12"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <Quote size={30} className="shrink-0 text-[#D4A853]/60" aria-hidden="true" />
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D4A853]/15 px-2.5 py-1 text-xs font-bold text-[#76571F] dark:text-[#F0D594]" aria-label={`${testimonial.rating} out of 5 stars`}>
                  <Star size={13} fill="currentColor" aria-hidden="true" /> {testimonial.rating}.0
                </span>
              </div>
              <blockquote className="flex-1 text-sm leading-7 text-[#102A43] dark:text-white">“{testimonial.quote}”</blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-200/80 pt-5 dark:border-slate-700/80">
                <img src={testimonial.avatar} alt="" className="h-12 w-12 rounded-full border-2 border-[#D4A853] object-cover shadow-sm" loading="lazy" />
                <div className="min-w-0"><h3 className="truncate text-sm font-bold text-[#102A43] dark:text-white">{testimonial.name}</h3><p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{testimonial.location}</p></div>
              </div>
              <p className="mt-4 w-fit rounded-full bg-[#102A43]/5 px-3 py-1 text-[11px] font-semibold text-[#102A43] dark:bg-white/10 dark:text-[#D4A853]">{testimonial.service}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
