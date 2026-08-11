import React, { useState, useEffect } from 'react';
import { MarketingSubPage, Currency } from '../types';
import { MOCK_SERVICES, MOCK_REVIEWS, MOCK_PRICING_PLANS } from '../data/mockServices';
import { formatCurrency } from '../utils/formatters';
import { 
  Sparkles, ShieldCheck, CheckCircle2, Star, ArrowRight, Phone, Mail, 
  MessageSquare, ChevronDown, Award, HeartHandshake, Snowflake, Wrench, Shirt, Bug
} from 'lucide-react';

interface MarketingViewProps {
  currency: Currency;
  onBookService: (serviceId?: string) => void;
  onNavigateToRole: (view: 'customer' | 'admin' | 'worker') => void;
  initialSubPage?: string;
  onSubPageChange?: (page: string) => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  currency,
  onBookService,
  onNavigateToRole,
  initialSubPage = 'home',
  onSubPageChange,
}) => {
  const [subPage, setSubPage] = useState<MarketingSubPage>(initialSubPage as MarketingSubPage);

  const navigateTo = (page: MarketingSubPage) => {
    setSubPage(page);
    if (onSubPageChange) onSubPageChange(page);
  };

  // Sync when parent changes the initialSubPage (e.g. from header nav)
  useEffect(() => {
    setSubPage(initialSubPage as MarketingSubPage);
  }, [initialSubPage]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How are Meraki Homes professionals vetted in Ethiopia?',
      a: 'Every Meraki professional undergoes a rigorous 5-stage background check: 100% Ethiopian National ID verification, clean police clearance certificate from the Ethiopian Federal Police, practical skill tests, health checkups, and continuous performance audits.'
    },
    {
      q: 'Which payment methods do you support in Addis Ababa?',
      a: 'We seamlessly integrate with Ethiopia’s top payment gateways including Telebirr, CBE Birr, Chapa, international Credit/Debit Cards (Visa, Mastercard), and Cash on Service Delivery.'
    },
    {
      q: 'What is the Meraki 100% Satisfaction Guarantee?',
      a: 'If you are not 100% satisfied with the quality of your home service, notify us within 24 hours via the Customer Portal. We will dispatch a senior team to re-clean or fix the issue free of charge, or refund your booking fee.'
    },
    {
      q: 'Can I request the same dedicated professional for recurring visits?',
      a: 'Yes! Our Weekly and Monthly subscription plans allow you to select your preferred favorite professional (e.g., Bethlehem or Hiwot) for guaranteed recurring dispatches.'
    },
    {
      q: 'Which areas in Addis Ababa do you cover?',
      a: 'We currently cover all major zones in Addis Ababa including Bole Atlas, Kazanchis, Old Airport, Sarbet, Bisrate Gabriel, CMC, Summit, Gerji, Nifas Silk, and Lideta.'
    }
  ];

  return (
    <div id="marketing-site" className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      


      {/* ==================== HOME SUB-PAGE ==================== */}
      {subPage === 'home' && (
        <div>
          {/* Hero Banner Section */}
          <section className="relative bg-gradient-to-b from-white via-slate-50 to-golden-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-golden-950/30 py-16 lg:py-20 border-b border-slate-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Column: Headlines */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-golden-50 border border-golden-200 text-golden-800 text-xs font-bold tracking-wide">
                    <Sparkles className="w-4 h-4 text-golden-600" />
                    <span> Home Services in Ethiopia</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Making Home Care <span className="text-golden-600 font-serif italic">Simple, Safe, and Reliable</span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    Connect with certified professionals for cleaning, laundry, childcare, babysitting, and pest control whenever you need them.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                    <button
                      onClick={() => onBookService()}
                      className="w-full sm:w-auto px-7 py-3.5 bg-golden-500 hover:bg-golden-400 text-slate-950 font-black text-sm rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all"
                    >
                      <span>Book Service Instantly</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigateTo('services')}
                      className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all"
                    >
                      <span>Explore Services</span>
                    </button>
                  </div>

                  {/* Trust Stats Bar */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 max-w-xl">
                    <div>
                      <div className="text-2xl font-black text-slate-900">15,00+</div>
                      <div className="text-xs text-slate-500">Completed Visits</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900 flex items-center">
                        <span>4.96</span>
                        <Star className="w-4 h-4 fill-golden-400 text-golden-400 ml-1" />
                      </div>
                      <div className="text-xs text-slate-500">CSAT Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-emerald-600">100%</div>
                      <div className="text-xs text-slate-500">Police Vetted Pros</div>
                    </div>
                  </div>

                </div>

                  {/* Right Column: Hero Visual Card */}
                  <div className="lg:col-span-5 relative">
                    <div className="relative mx-auto rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800 group">
                    <img
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
                      alt="Meraki Luxury Home"
                      className="w-full h-[380px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

                    {/* Floating Live Dispatch Badge */}
                    <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 space-y-2 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          
                        </div>
                        
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-700 dark:text-slate-300">
                       
                        <div>
                          
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

         

          {/* Popular Services Section */}
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold text-golden-700 dark:text-golden-400 uppercase tracking-widest">Unmatched Quality</span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">Our Featured Services</h2>
              </div>
              <button
                onClick={() => navigateTo('services')}
                className="text-golden-700 dark:text-golden-400 hover:text-golden-800 dark:hover:text-golden-300 font-bold text-sm flex items-center space-x-1 mt-4 md:mt-0"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MOCK_SERVICES.filter(s => ['home_cleaning', 'childcare_nanny', 'cooking_service', 'handyman_plumbing'].includes(s.id)).map((s) => (
                <div
                  key={s.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-golden-400 transition-all duration-300 flex flex-col shadow-xs hover:shadow-md group"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {s.popularBadge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-golden-500 text-slate-950 font-black text-[10px] uppercase rounded-md shadow-xs">
                        {s.popularBadge}
                      </span>
                    )}
                    <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 text-xs text-slate-800 dark:text-slate-200 font-bold flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-golden-400 text-golden-400" />
                      <span>{s.rating}</span>
                      <span className="text-slate-400">({s.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{s.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{s.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold">Starting from</span>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          {formatCurrency(s.basePrice, currency)} <span className="text-xs text-slate-500 font-normal">/ {s.unit}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onBookService(s.id)}
                        className="px-4 py-2 bg-golden-500 hover:bg-golden-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4-Step How It Works */}
          <section className="py-16 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-golden-700 dark:text-golden-400 uppercase tracking-widest">Seamless & Safe</span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">How Meraki Homes Works</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">Designed for maximum convenience and safety across Addis Ababa.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-6 text-center space-y-3 relative">
                  <div className="w-10 h-10 rounded-xl bg-golden-500 text-slate-950 font-black text-lg flex items-center justify-center mx-auto">
                    1
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Select & Schedule</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Choose your service, add-ons, and date/time slot in your neighborhood.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-6 text-center space-y-3 relative">
                  <div className="w-10 h-10 rounded-xl bg-golden-500 text-slate-950 font-black text-lg flex items-center justify-center mx-auto">
                    2
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Vetted Pro Dispatched</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">A police-checked, certified specialist is assigned with live GPS tracking.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-6 text-center space-y-3 relative">
                  <div className="w-10 h-10 rounded-xl bg-golden-500 text-slate-950 font-black text-lg flex items-center justify-center mx-auto">
                    3
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">OTP & Stopwatch</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Verify arrival with 4-digit OTP. Service executed with standard timer.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-6 text-center space-y-3 relative">
                  <div className="w-10 h-10 rounded-xl bg-golden-500 text-slate-950 font-black text-lg flex items-center justify-center mx-auto">
                    4
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Telebirr / CBE Pay</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Review photos, rate your pro, and settle payment via Telebirr or Card.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-golden-700 dark:text-golden-400 uppercase tracking-widest">Real Customer Feedback</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">Loved by Homeowners in Addis Ababa</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_REVIEWS.map((rev) => (
                <div key={rev.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center space-x-1 text-golden-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-golden-400" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed">"{rev.comment}"</p>

                  <div className="flex items-center space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <img src={rev.customerAvatar} alt={rev.customerName} className="w-9 h-9 rounded-full object-cover border border-golden-400" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{rev.customerName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{rev.neighborhood}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action Banner */}
          <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-golden-500 dark:bg-golden-600 rounded-2xl p-8 lg:p-10 text-slate-950 dark:text-slate-950 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-1.5 text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-black">Ready for a Spotless Home?</h2>
                <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-900 max-w-xl">
                  Book certified cleaners and technicians in Addis Ababa today. Enjoy transparent pricing and Telebirr integration.
                </p>
              </div>

              <button
                onClick={() => onBookService()}
                className="px-6 py-3.5 bg-slate-950 dark:bg-slate-900 hover:bg-slate-900 dark:hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Book Your First Visit
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ==================== ABOUT SUB-PAGE ==================== */}
      {subPage === 'about' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold text-golden-700 dark:text-golden-400 uppercase tracking-widest">About Meraki</span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">More Than a Cleaning Company</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              "Meraki" is a Greek word meaning to do something with soul, creativity, and love. We are Ethiopia's first full-stack residential services platform, bridging the gap between skilled domestic workers and the growing urban middle class.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center shadow-xs">
              <div className="text-2xl font-black text-slate-900 dark:text-white">600K+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Target Households</div>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center shadow-xs">
              <div className="text-2xl font-black text-slate-900 dark:text-white">3-5B</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">ETB Market Size</div>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center shadow-xs">
              <div className="text-2xl font-black text-slate-900 dark:text-white">5-Day</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Worker Training</div>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center shadow-xs">
              <div className="text-2xl font-black text-slate-900 dark:text-white">24hr</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Quality Guarantee</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Our Vision</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                To become the most trusted household brand in East Africa, expanding across Ethiopia and beyond by 2030.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Our Mission</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Deliver peace of mind to every household we serve, while creating dignified, well-paid employment for domestic workers.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">The Meraki Worker Programme</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-golden-600 dark:text-golden-400 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-200">Guaranteed minimum 5,000 ETB/month</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-golden-600 dark:text-golden-400 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-200">5-day paid training with certification</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-golden-600 dark:text-golden-400 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-200">Branded uniforms and all supplies</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-golden-600 dark:text-golden-400 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-200">Health insurance and accident coverage</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-golden-600 dark:text-golden-400 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-200">Performance bonuses monthly</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-golden-600 dark:text-golden-400 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-200">Career path to Team Leader</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SERVICES CATALOG SUB-PAGE ==================== */}
      {subPage === 'services' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-golden-700 dark:text-golden-400 uppercase tracking-widest">Our Services</span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Everything Your Home Needs</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">From deep cleaning to childcare, every service comes with our Meraki Quality Guarantee.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Personal Cooking', desc: 'Meal prep with daily or weekly plans tailored to your family.', price: '500 ETB / day', icon: '👩‍🍳' },
              { name: 'Gardening & Outdoor', desc: 'Compound, garden, and terrace upkeep and maintenance.', price: '400 ETB / visit', icon: '🌿' },
              { name: 'Laundry & Ironing', desc: 'Pick-up, wash, iron, and delivery within 24 hours.', price: '80 ETB / kg', icon: '🧺' },
              { name: 'Childcare & Babysitting', desc: 'Certified caregivers with flexible hours for your peace of mind.', price: '150 ETB / hr', icon: '👶' },
              { name: 'Elder Companion Care', desc: 'Companionship, hygiene assistance, and medication reminders.', price: '200 ETB / hr', icon: '🤝' },
              { name: 'Minor Home Repairs', desc: 'Plumbing, electrical fixes, and painting touch-ups.', price: '350 ETB / job', icon: '🔧' },
              { name: 'Premium Home Cleaning', desc: 'Full-room deep clean, 4 hours. All supplies and equipment provided.', price: '600 ETB / session', icon: '✨' },
              { name: 'Office & Commercial Clean', desc: 'Corporate contracts with nightly and weekend options.', price: 'Custom quote', icon: '🏢' },
            ].map((service, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:border-golden-400 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-golden-50 dark:bg-golden-950/30 border border-golden-200 dark:border-golden-700 flex items-center justify-center text-2xl">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{service.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">{service.desc}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-sm font-black text-golden-700 dark:text-golden-400">{service.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== PRICING SUB-PAGE ==================== */}
      {subPage === 'pricing' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-golden-700 dark:text-golden-400 uppercase tracking-widest">Transparent Rates</span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Simple, Honest Pricing in {currency}</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">No hidden fees, no surge lock-ins for subscribers. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_PRICING_PLANS.map(plan => (
              <div
                key={plan.id}
                className={`rounded-2xl p-7 flex flex-col justify-between space-y-6 relative ${
                  plan.recommended
                    ? 'bg-white dark:bg-slate-800 border-2 border-golden-500 dark:border-golden-400 shadow-md'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-golden-500 text-slate-950 font-black text-[10px] uppercase rounded-full shadow-xs">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{plan.description}</p>
                  
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                      {currency === 'ETB' ? `${plan.priceETB.toLocaleString()} ETB` : `$${plan.priceUSD}`}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">billing {plan.billingFrequency}</span>
                  </div>

                  <ul className="space-y-2.5 pt-3 text-xs text-slate-700 dark:text-slate-200">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onBookService()}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    plan.recommended
                      ? 'bg-golden-500 hover:bg-golden-400 text-slate-950 shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== FAQ SUB-PAGE ==================== */}
      {subPage === 'faq' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-golden-700 dark:text-golden-400 uppercase tracking-widest">Help Center</span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Everything you need to know about Meraki Homes services in Addis Ababa.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between space-x-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== CONTACT SUB-PAGE ==================== */}
      {subPage === 'contact' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-golden-700 dark:text-golden-400 uppercase tracking-widest">Get In Touch</span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Contact Meraki Support</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Our customer service team is available 24/7 in Addis Ababa.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {contactFormSubmitted ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                ✓ Message received! Our Addis Ababa team will call or email you shortly.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-700 dark:text-slate-200 font-bold">Your Name</label>
                    <input type="text" placeholder="Dr. Kebede Tadesse" className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:border-golden-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-700 dark:text-slate-200 font-bold">Phone Number</label>
                    <input type="text" placeholder="+251 91 123 4567" className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:border-golden-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-200 font-bold">Message or Inquiry</label>
                  <textarea rows={4} placeholder="How can we assist you with home cleaning or maintenance in Addis Ababa?" className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:border-golden-500"></textarea>
                </div>

                <button
                  onClick={() => setContactFormSubmitted(true)}
                  className="w-full py-3 bg-golden-500 hover:bg-golden-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
                >
                  Send Inquiry Message
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
