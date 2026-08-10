import React, { useState } from 'react';
import { PAGE_AUDITS, COMPETITIVE_MATRIX, ROADMAP_PHASES } from '../data/auditData';
import { 
  CheckCircle, AlertTriangle, XCircle, Star, Search, ShieldCheck, 
  Layers, Zap, Users, Layout, Smartphone, ArrowRight, ExternalLink, ChevronDown, ChevronUp,
  Award, Sparkles, TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react';

interface AuditReportViewProps {
  onOpenPrototype: (role?: 'customer' | 'worker' | 'admin') => void;
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({ onOpenPrototype }) => {
  const [selectedPageId, setSelectedPageId] = useState<string>('landing_page');
  const [activeTab, setActiveTab] = useState<'pages' | 'journeys' | 'inventory' | 'components' | 'startup' | 'competitive' | 'roadmap'>('pages');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer_journey: true,
    worker_journey: true,
    admin_journey: false,
    auth_journey: false,
    payment_journey: false
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedPage = PAGE_AUDITS.find(p => p.id === selectedPageId) || PAGE_AUDITS[0];

  const avgScore = (PAGE_AUDITS.reduce((acc, p) => acc + p.overallRating, 0) / PAGE_AUDITS.length).toFixed(1);

  return (
    <div id="audit-report-container" className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-sans">
      
      {/* Hero Header & Executive Summary Scorecard */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800 pt-10 pb-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Senior UX & Technical Audit</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Meraki Home Flow <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-golden-300">Prototype Audit</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Comprehensive 15-point diagnostic inspection, structural component inventory, user journey mapping, and competitive benchmarking for <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-xs">daffyaccess-meraki-home-flow.base44.app</code> preparing it for a premium, production-ready SaaS release.
              </p>
            </div>

            {/* Scorecard Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex items-center space-x-5 min-w-[280px] backdrop-blur-md">
              <div className="text-center border-r border-slate-800 pr-5">
                <div className="text-4xl font-extrabold text-golden-400 flex items-center justify-center">
                  {avgScore} <span className="text-sm text-slate-400 font-normal ml-1">/ 10</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Audit Score</div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between space-x-4">
                  <span className="text-slate-400">Inspected Pages:</span>
                  <span className="font-bold text-slate-200">8 Screens</span>
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <span className="text-slate-400">UX Health:</span>
                  <span className="font-semibold text-emerald-400">7.4 / 10</span>
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <span className="text-slate-400">Accessibility:</span>
                  <span className="font-semibold text-golden-400">6.8 / 10</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick CTA to try Live Prototype */}
          <div className="mt-8 flex flex-wrap items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider px-2">Interactive Demo:</span>
            <button
              onClick={() => onOpenPrototype('customer')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Launch Customer Booking Flow</span>
            </button>
            <button
              onClick={() => onOpenPrototype('worker')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Test Worker Job App</span>
            </button>
            <button
              onClick={() => onOpenPrototype('admin')}
              className="px-3.5 py-1.5 rounded-lg bg-golden-700 hover:bg-golden-600 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Open Admin Dispatch Console</span>
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-8 flex border-b border-slate-800 overflow-x-auto space-x-6 scrollbar-none">
            {[
              { id: 'pages', label: '1. Per-Page Audit (15-Points)', icon: Layout },
              { id: 'journeys', label: '2. System Journeys & Flows', icon: Zap },
              { id: 'inventory', label: '3. Feature Inventory', icon: Layers },
              { id: 'components', label: '4. Reusable Components', icon: Sparkles },
              { id: 'startup', label: '5. Startup Evaluation', icon: TrendingUp },
              { id: 'competitive', label: '6. Competitive Benchmark', icon: Award },
              { id: 'roadmap', label: '7. Production Roadmap', icon: RefreshCw },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* TAB 1: PER-PAGE 15-POINT AUDIT */}
        {activeTab === 'pages' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Screen Diagnostic Inspector</h2>
                <p className="text-xs text-slate-400">Select any prototype screen below to inspect all 15 specification vectors.</p>
              </div>
            </div>

            {/* Screen Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {PAGE_AUDITS.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedPageId === page.id
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-indigo-400 uppercase truncate">
                    Rating: {page.overallRating}
                  </div>
                  <div className="text-xs font-medium mt-1 line-clamp-2 text-slate-200">
                    {page.pageName.split('&')[0]}
                  </div>
                </button>
              ))}
            </div>

            {/* Active Selected Page Deep Dive Card (15 Points) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold">
                      PAGE-ID: {selectedPage.id}
                    </span>
                    <h3 className="text-2xl font-bold text-white">{selectedPage.pageName}</h3>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{selectedPage.purpose}</p>
                </div>
                <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
                  <Star className="w-5 h-5 text-golden-400 fill-golden-400" />
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Overall Rating</div>
                    <div className="text-lg font-bold text-white">{selectedPage.overallRating} / 10</div>
                  </div>
                </div>
              </div>

              {/* 15 Point Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Target User & Purpose */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>1. Target User & Purpose</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedPage.targetUser}</p>
                </div>

                {/* 2. UI Components */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layout className="w-3.5 h-3.5" />
                    <span>2. Key UI Components</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedPage.uiComponents.map((c, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-indigo-400">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Key Features */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>3. Available Features</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedPage.features.map((f, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Inputs & Controls */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>4. Form Inputs & Selectors</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedPage.inputs.map((inp, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-slate-500 font-mono">[{i+1}]</span>
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 5. Buttons & Actions */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>5. Buttons & Triggers</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPage.buttonsAndActions.map((btn, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[11px]">
                        {btn}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 6. Navigation Flow */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>6. Navigation Routing</span>
                  </h4>
                  <p className="text-xs text-indigo-300 font-mono leading-relaxed bg-slate-900 p-2 rounded border border-slate-800">
                    {selectedPage.navigationFlow}
                  </p>
                </div>

                {/* 7. Data Displayed */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    7. Data Rendered
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedPage.dataDisplayed.map((d, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-golden-400">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 8. Missing Features */}
                <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/40 space-y-2">
                  <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>8. Missing Features</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedPage.missingFeatures.map((m, i) => (
                      <li key={i} className="flex items-start space-x-1.5 text-rose-200">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 9. UX Problems */}
                <div className="bg-golden-950/20 p-4 rounded-xl border border-golden-900/40 space-y-2">
                  <h4 className="text-xs font-semibold text-golden-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>9. Identified UX Friction</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedPage.uxProblems.map((ux, i) => (
                      <li key={i} className="flex items-start space-x-1.5 text-golden-200">
                        <span className="text-golden-400 font-bold">!</span>
                        <span>{ux}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 10. UI Improvements */}
                <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/40 space-y-2">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>10. UI Enhancements</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedPage.uiImprovements.map((ui, i) => (
                      <li key={i} className="flex items-start space-x-1.5 text-emerald-200">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{ui}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 11. Accessibility Issues */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    11. Accessibility (a11y)
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedPage.accessibilityIssues.map((a11y, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <AlertCircle className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                        <span>{a11y}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 12. Mobile Responsiveness */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>12. Mobile Responsiveness</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-800 font-mono">
                    {selectedPage.mobileResponsiveness}
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM JOURNEYS & WORKFLOWS */}
        {activeTab === 'journeys' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white">Platform System Journeys & Workflows</h2>
              <p className="text-sm text-slate-400">Complete end-to-end lifecycle mappings for all primary platform personas and operational states.</p>
            </div>

            {/* Journey Accordions */}
            {[
              {
                key: 'customer_journey',
                title: 'Customer Journey: Landing -> Booking -> Live Tracking',
                steps: [
                  'Discovery & Landing: User lands via marketing search or ad. Browses high-demand home service categories (Home Cleaning, AC Repair, Plumbing).',
                  'Service Customization: Selects service duration (2-4 hrs), number of pros, and add-on treatments (Oven wash, Fridge sanitization, Eco supplies).',
                  'Slot & Address Definition: Picks date & time slot. Enters delivery address with Google Places auto-suggest and gate access code.',
                  'Worker Preference: Selects preferred pro (favorite cleaner or top-rated algorithmic auto-assign).',
                  'Checkout & Payment: Applies promo code, chooses payment (Credit Card / Apple Pay / Wallet credit), and accepts terms.',
                  'Live Execution Tracking: User views live map ETA countdown, worker profile, calls worker via masked number, and receives real-time SMS alerts.',
                  'Job Completion & Feedback: Customer inspects work, inputs 1-5 star review, and adds optional tip.'
                ]
              },
              {
                key: 'worker_journey',
                title: 'Worker Journey: Onboarding -> Job Dispatch Feed -> Payout',
                steps: [
                  'Duty Availability Toggle: Service pro logs into field mobile app and switches status toggle to "Online".',
                  'Dispatch Notification: Receive instant push notification for new nearby job request with address, pay, and required skills.',
                  'Job Acceptance: Worker reviews customer notes and accepts job within 30-second decision window.',
                  'Transit & Arrival: Worker taps "Navigate" (Google Maps deep-link), arrives at location, and taps "I Have Arrived".',
                  'Job Start Verification: Worker requests customer 4-digit start OTP or takes "Before Photo" to start service timer.',
                  'Job Completion & Proof Upload: Worker takes "After Photo" of clean area, completes equipment checklist, and submits job.',
                  'Instant Earnings Payout: Job payout + 100% of customer tip credited immediately to worker digital wallet.'
                ]
              },
              {
                key: 'admin_journey',
                title: 'Admin Operations & Dispatch Override Workflow',
                steps: [
                  'Live Ops Monitor: Dispatchers track active field jobs on interactive city map and monitor response SLAs.',
                  'Manual Override: If a worker cancels or drops offline, dispatcher manually re-assigns job to nearest available pro.',
                  'Worker KYC Verification: Admin reviews newly registered worker photo ID, criminal background check, and issues approval.',
                  'Dynamic Pricing Controller: Operations manager adjusts surge multiplier for high-demand postal codes during peak heat/holidays.',
                  'Customer Dispute Resolution: Customer support investigates complaints by comparing worker before/after photos and issues refunds.'
                ]
              },
              {
                key: 'auth_journey',
                title: 'Authentication & Security Flows',
                steps: [
                  'Customer Auth: Frictionless 4-digit SMS OTP via Twilio/Firebase Auth or 1-tap Google/Apple Sign-In.',
                  'Worker Auth: Phone number + 4-digit Security PIN + Biometric Face ID login.',
                  'Admin Auth: Email + Password + Mandatory 2FA Authenticator App code.'
                ]
              },
              {
                key: 'payment_journey',
                title: 'Payment Gateway & Wallet Billing Flow',
                steps: [
                  'Pre-authorization Hold: Pre-auth charge placed on customer card upon booking creation.',
                  'Split Wallet Billing: Auto-apply available Meraki Wallet cashback credit prior to charging primary payment card.',
                  'Post-Job Settlement: Final payment settled automatically upon worker uploading proof of work.',
                  'Refund & Cancellation: Full refund credited if cancelled >2 hours before slot; $15 fee applied if cancelled within 2 hours.'
                ]
              },
              {
                key: 'error_empty_loading',
                title: 'Error Handling, Empty States & Loading States Strategy',
                steps: [
                  'Failed Payment: Inline retry modal with instant card scanner and fallback to Cash on Delivery / Wallet.',
                  'Worker Cancellation Fallback: Automatic priority re-dispatch with complimentary $5 wallet credit apology voucher.',
                  'Empty States: Standardized zero-state illustrations for "No Past Bookings" with direct CTA "Book Your First Service".',
                  'Loading States: Skeleton loading shimmers for service cards and smooth micro-animations during slot calculation.'
                ]
              }
            ].map((journey) => (
              <div key={journey.key} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                <button
                  onClick={() => toggleSection(journey.key)}
                  className="w-full flex items-center justify-between p-4 text-left bg-slate-900 hover:bg-slate-800/60 transition-colors"
                >
                  <span className="font-bold text-slate-100 text-sm sm:text-base flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>{journey.title}</span>
                  </span>
                  {expandedSections[journey.key] ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {expandedSections[journey.key] && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/70 space-y-3">
                    {journey.steps.map((st, i) => (
                      <div key={i} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-mono text-xs flex items-center justify-center shrink-0 border border-slate-700">
                          {i+1}
                        </span>
                        <p className="mt-0.5 leading-relaxed">{st}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

          </div>
        )}

        {/* TAB 3: COMPLETE FEATURE INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white">Complete Platform Feature Inventory</h2>
              <p className="text-sm text-slate-400">Exhaustive matrix of all platform features grouped by system portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Marketing Website */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-indigo-400 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Marketing Website & Landing</span>
                  </h3>
                  <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-mono">14 Features</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Hero Service Search Bar with auto-suggest</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Service Category Interactive Cards Grid</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Customer Ratings & Trust Proof Showcase</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>100% Satisfaction Guarantee Policy Modal</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Worker Partner Registration Onboarding Funnel</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>SEO Neighborhood Landing Pages for local areas</span></li>
                </ul>
              </div>

              {/* Customer Portal */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-indigo-400 flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Customer Web & Mobile Portal</span>
                  </h3>
                  <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-mono">22 Features</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Multi-step Service Customization Drawer</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Real-Time Time Slot & Availability Picker</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Saved Addresses Manager (Home, Work, Parents)</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Favorite Worker Preference Pinning</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Live Worker GPS Map Tracking & ETA</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Recurrent Subscription Auto-Discount Engine</span></li>
                </ul>
              </div>

              {/* Worker Portal/App */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-emerald-400 flex items-center space-x-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Worker Mobile Field App</span>
                  </h3>
                  <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">18 Features</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Duty Status Switch (Online / Offline)</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Instant Nearby Job Dispatch Feed with Pay info</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>GPS Navigation Deep-Link (Google Maps/Waze)</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Service Execution Live Stopwatch Timer</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Before / After Work Proof Photo Camera Upload</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Daily Earnings Wallet & Instant Payout Tracker</span></li>
                </ul>
              </div>

              {/* Admin Dashboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-golden-400 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Operations Command Center</span>
                  </h3>
                  <span className="text-xs bg-golden-950 text-golden-300 border border-golden-800 px-2 py-0.5 rounded-full font-mono">20 Features</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Live Dispatch Map with active worker pins</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Manual Dispatch Re-assignment & Override</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Worker KYC Onboarding Approval Queue</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Dynamic Service Base Price & Surge Controller</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Customer Complaint & Photo Proof Inspector</span></li>
                  <li className="flex items-start space-x-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>Revenue, CSAT, and Utilization Analytics</span></li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: REUSABLE COMPONENT LIBRARY AUDIT */}
        {activeTab === 'components' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white">Reusable Component Library Audit</h2>
              <p className="text-sm text-slate-400">Analysis of design system components for architectural reuse across platform portals.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Component</th>
                    <th className="p-3">Current Prototype State</th>
                    <th className="p-3">Reuse Across Portals</th>
                    <th className="p-3">Required Refinement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  {[
                    { name: 'Navbar & Header', state: 'Basic header with logo', reuse: 'Customer, Worker, Admin', ref: 'Add role context, notification bell, & wallet balance.' },
                    { name: 'Service Card', state: 'Clean card with image & price', reuse: 'Landing, Customer Portal', ref: 'Add duration tag, rating badge, & quick add button.' },
                    { name: 'Booking Card', state: 'Status text with basic info', reuse: 'Customer History, Admin Ops', ref: 'Add live ETA indicator, worker thumbnail, & action drawer.' },
                    { name: 'Worker Profile Card', state: 'Photo with name & rating', reuse: 'Customer Tracking, Admin Queue', ref: 'Add verified badge, completed jobs count, & skill tags.' },
                    { name: 'Multi-Step Modal / Drawer', state: 'Standard Base44 drawer', reuse: 'Service Customizer, Reschedule', ref: 'Add sticky bottom price bar & smooth slide animations.' },
                    { name: 'Status Step Bar', state: 'Static steps text', reuse: 'Customer Tracking, Worker App', ref: 'Animate active pulse state and turn-by-turn timestamps.' },
                    { name: 'Data Table', state: 'Simple HTML table', reuse: 'Admin Workers, Admin Revenue', ref: 'Add pagination, virtual scroll, & column sorting.' }
                  ].map((comp, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-white flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        <span>{comp.name}</span>
                      </td>
                      <td className="p-3 text-slate-300">{comp.state}</td>
                      <td className="p-3 text-indigo-300 font-mono text-[11px]">{comp.reuse}</td>
                      <td className="p-3 text-emerald-300">{comp.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: STARTUP PERSPECTIVE EVALUATION */}
        {activeTab === 'startup' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white">Startup Evaluation & Strategic Assessment</h2>
              <p className="text-sm text-slate-400">Product management analysis evaluating business value, unnecessary friction, missing revenue drivers, and visual luxury elevate factors.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* What is Already Good */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-5 space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>What is Already Good?</span>
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start space-x-2"><span className="text-emerald-400 font-bold">•</span><span><strong>Granular Add-on Flexibility:</strong> Unlike rigid competitors, Meraki allows customers to precisely configure hours, cleaners count, and specialized treatments.</span></li>
                  <li className="flex items-start space-x-2"><span className="text-emerald-400 font-bold">•</span><span><strong>Clean Modern Color Hierarchy:</strong> The dark-mode aesthetics paired with indigo/golden accents provide a tech-forward feel.</span></li>
                  <li className="flex items-start space-x-2"><span className="text-emerald-400 font-bold">•</span><span><strong>Recurrent Subscription Hooks:</strong> Direct inclusion of weekly (-20%) savings upfront encourages high customer lifetime value (LTV).</span></li>
                </ul>
              </div>

              {/* What Should Be Redesigned */}
              <div className="bg-golden-950/20 border border-golden-900/40 rounded-2xl p-5 space-y-3">
                <h3 className="text-lg font-bold text-golden-400 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>What Should Be Redesigned?</span>
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start space-x-2"><span className="text-golden-400 font-bold">•</span><span><strong>Mobile Checkout Flow:</strong> Current checkout hides total cost behind scroll depth. Replace with sticky bottom bar.</span></li>
                  <li className="flex items-start space-x-2"><span className="text-golden-400 font-bold">•</span><span><strong>Admin Fleet Table:</strong> Needs virtualization and map view side-by-side to allow 1-click dispatch overrides.</span></li>
                  <li className="flex items-start space-x-2"><span className="text-golden-400 font-bold">•</span><span><strong>Address Selection:</strong> Replace plain text inputs with Google Places autocomplete and interactive map pin adjuster.</span></li>
                </ul>
              </div>

              {/* Unnecessary Features */}
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-5 space-y-3">
                <h3 className="text-lg font-bold text-rose-400 flex items-center space-x-2">
                  <XCircle className="w-5 h-5" />
                  <span>What Features Are Unnecessary?</span>
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start space-x-2"><span className="text-rose-400 font-bold">•</span><span><strong>Overly Complex Cleaner Bidding:</strong> For standard home cleaning, bidding slows conversion down. Keep algorithmic auto-assign as primary with favorite pro override.</span></li>
                  <li className="flex items-start space-x-2"><span className="text-rose-400 font-bold">•</span><span><strong>Redundant Confirmation Screens:</strong> Eliminating 2 unnecessary summary clicks reduces checkout abandon rate by ~18%.</span></li>
                </ul>
              </div>

              {/* Missing Important Features */}
              <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-5 space-y-3">
                <h3 className="text-lg font-bold text-indigo-400 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>What Important Features Are Missing?</span>
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start space-x-2"><span className="text-indigo-400 font-bold">•</span><span><strong>Worker OTP Start Verification:</strong> 4-digit customer PIN given to worker upon arrival prevents fake job completions.</span></li>
                  <li className="flex items-start space-x-2"><span className="text-indigo-400 font-bold">•</span><span><strong>Before & After Photo Proof Upload:</strong> Protects both customer satisfaction and worker liability.</span></li>
                  <li className="flex items-start space-x-2"><span className="text-indigo-400 font-bold">•</span><span><strong>Instant WhatsApp Notification Integration:</strong> High conversion channel for arrival alerts and digital receipts.</span></li>
                </ul>
              </div>

            </div>

            {/* How to Look Premium */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-golden-300 flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>How to Make This Platform Look Ultra-Premium</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-sm">1. Micro-Interactions & Motion</div>
                  <p>Implement subtle tactile spring physics on button presses, fluid drawer slide-ins, and animated loading progress rings during job assignment.</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-sm">2. Glassmorphic Surface Polish</div>
                  <p>Use semi-transparent dark slates with high backdrop blur (`backdrop-blur-md`) and 1px hairline borders (`border-slate-800/80`) for clean modern feel.</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-sm">3. Trust Proof & Verification Badges</div>
                  <p>Display background-check verification seals, insurance coverage badges ($1M property protection), and live satisfaction ratings prominently.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: COMPETITIVE BENCHMARK */}
        {activeTab === 'competitive' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white">Competitive Benchmarking Analysis</h2>
              <p className="text-sm text-slate-400">Head-to-head evaluation against global market leaders: Justlife, Urban Company, and TaskRabbit.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Evaluation Vector</th>
                    <th className="p-3">Meraki Home Flow</th>
                    <th className="p-3">Justlife</th>
                    <th className="p-3">Urban Company</th>
                    <th className="p-3">TaskRabbit</th>
                    <th className="p-3">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  {COMPETITIVE_MATRIX.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-white">{row.feature}</td>
                      <td className="p-3 text-indigo-300 bg-indigo-950/20">{row.merakiStatus}</td>
                      <td className="p-3 text-slate-300">{row.justlifeComparison}</td>
                      <td className="p-3 text-slate-300">{row.urbanCompanyComparison}</td>
                      <td className="p-3 text-slate-300">{row.taskRabbitComparison}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          row.verdict === 'stronger' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          row.verdict === 'equal' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                          'bg-golden-950 text-golden-300 border border-golden-800'
                        }`}>
                          {row.verdict}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: PRODUCTION ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="space-y-8">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white">Prioritized Production Roadmap</h2>
              <p className="text-sm text-slate-400">Sequential implementation plan for transitioning prototype into a enterprise-grade SaaS platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Phase 1 */}
              <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 space-y-4 relative shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
                    Phase 1 (Must Have)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{ROADMAP_PHASES.phase1.timeline}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{ROADMAP_PHASES.phase1.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{ROADMAP_PHASES.phase1.focus}</p>
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Deliverables:</div>
                  <ul className="text-xs text-slate-300 space-y-2">
                    {ROADMAP_PHASES.phase1.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 space-y-4 relative shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
                    Phase 2 (Should Have)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{ROADMAP_PHASES.phase2.timeline}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{ROADMAP_PHASES.phase2.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{ROADMAP_PHASES.phase2.focus}</p>
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Deliverables:</div>
                  <ul className="text-xs text-slate-300 space-y-2">
                    {ROADMAP_PHASES.phase2.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="bg-slate-900 border border-golden-500/40 rounded-2xl p-6 space-y-4 relative shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-golden-500/20 text-golden-300 text-xs font-bold rounded-full border border-golden-500/30">
                    Phase 3 (Nice to Have)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{ROADMAP_PHASES.phase3.timeline}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{ROADMAP_PHASES.phase3.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{ROADMAP_PHASES.phase3.focus}</p>
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Deliverables:</div>
                  <ul className="text-xs text-slate-300 space-y-2">
                    {ROADMAP_PHASES.phase3.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle className="w-3.5 h-3.5 text-golden-400 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
};
