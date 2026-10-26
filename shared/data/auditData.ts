import { PageAudit, CompetitiveFactor } from '../types';

export const PAGE_AUDITS: PageAudit[] = [
  {
    id: 'landing_page',
    pageName: 'Marketing Landing & Service Discovery',
    purpose: 'Hook prospective homeowners/tenants, build immediate platform trust, and direct users into booking core home services.',
    targetUser: 'Urban homeowners, busy professionals, expatriates, and property managers seeking reliable home care.',
    uiComponents: ['Hero Banner with Quick Booking Bar', 'Service Category Grid', 'Trust Badges (Verified Pros, 100% Guarantee)', 'Customer Review Carousel', 'How It Works Timeline', 'Floating CTA Sticky Bar'],
    features: ['Instant category search', 'Geo-location auto-detect', 'Service price estimation preview', 'Promotional promo banner toggles', 'Customer ratings display'],
    inputs: ['Search service input field', 'Location selector dropdown / auto-detect', 'Postal code / area query'],
    buttonsAndActions: ['"Book Now" Primary CTAs', '"Explore All Services"', '"Become a Service Partner" link', 'Category filter chips', 'App Store / Play Store links'],
    navigationFlow: 'Landing Page -> Category Click -> Service Customizer Modal -> Step-by-Step Booking Drawer -> Checkout',
    dataDisplayed: ['Top rated services', 'Starting prices (e.g. $29/hr)', 'Verified worker count (500+ pros)', 'Customer satisfaction rating (4.8/5 from 12k reviews)', 'Special discount codes'],
    missingFeatures: ['Dynamic search auto-complete with fuzzy matching', 'Neighborhood availability checker', 'Saved address quick-select for returning users', 'Instant chat widget / AI Concierge'],
    uxProblems: ['Hero background image overwhelms text readability', 'Search input lacks instant zero-state recommendations', 'Category grid cards lack hover state feedback on touch devices'],
    uiImprovements: ['Add subtle glassmorphic backdrop filter behind search bar', 'Elevate service cards with 1.05 scale hover transitions and clear duration tags', 'Introduce sticky bottom bar on mobile with quick service selection'],
    accessibilityIssues: ['Contrast ratio on light gray subtext (3.2:1) fails WCAG AA standard', 'Missing aria-labels on icon-only category buttons', 'Keyboard focus ring invisible on hero CTAs'],
    mobileResponsiveness: '7/10 - Layout stacks correctly, but category chips wrap awkwardly on screen widths <375px.',
    overallRating: 6.8
  },
  {
    id: 'service_customizer',
    pageName: 'Service Customizer & Add-on Selection',
    purpose: 'Allow users to configure specific cleaning or maintenance options, select duration, number of professionals, and add-on treatments.',
    targetUser: 'Customers with specific service requirements (e.g. deep cleaning, oven wash, extra hours).',
    uiComponents: ['Step Indicator Header', 'Option Quantity Counter', 'Add-on Selection Cards', 'Dynamic Pricing Summary Drawer', 'Cleaner Preference Toggle'],
    features: ['Real-time price recalculation', 'Custom instruction text box', 'Add-on item selection (Oven cleaning, Interior windows, Balcony, Pet hair removal)', 'Gender/Language worker preference selector'],
    inputs: ['Quantity +/- incrementers', 'Custom instructions text area', 'Add-on checkbox cards', 'Cleaning materials inclusion toggle'],
    buttonsAndActions: ['"Add Extra Hour"', '"Include Eco-Friendly Detergents"', '"Save & Continue to Schedule"', '"Back to Services"'],
    navigationFlow: 'Service Selection -> Customizer -> Date & Time Slot Drawer -> Address & Contact Info -> Checkout',
    dataDisplayed: ['Service breakdown price', 'Estimated completion duration', 'Included checklist vs excluded tasks', 'Selected add-ons total'],
    missingFeatures: ['Visual illustration of what each add-on entails (e.g. before/after photo preview)', 'Clear notification of materials provided vs needed from customer', 'Package bundle savings calculator'],
    uxProblems: ['Total price isn’t fixed to screen bottom on mobile, requiring excessive scrolling', 'No explanation of why certain add-ons add extra time to slot calculation', 'Ambiguous material inclusion charges'],
    uiImprovements: ['Implement sticky bottom price summary with collapsible breakdown', 'Use iconography for included vs excluded tasks', 'Add tooltip explanations for professional equipment needs'],
    accessibilityIssues: ['+/- buttons lack tactile touch-target size (only 28px vs 44px min)', 'Color contrast on selected state border is too low (blue-500 on white)'],
    mobileResponsiveness: '6.5/10 - Add-on cards become vertically long, creating scroll fatigue.',
    overallRating: 7.2
  },
  {
    id: 'booking_drawer',
    pageName: 'Date, Time Slot & Address Booking Drawer',
    purpose: 'Guide the user through scheduling slot selection, delivery address definition, recurrent frequency, and worker assignment preference.',
    targetUser: 'Customers completing a booking flow.',
    uiComponents: ['Interactive Date Picker Carousel', 'Time Slot Grid (Morning, Afternoon, Evening)', 'Saved Address Card List', 'Frequency Selector (One-time, Weekly -20%, Bi-weekly -10%)', 'Worker Preference Dropdown'],
    features: ['Peak pricing indicator on high-demand slots', 'Auto-fill saved home/work address', 'Recurrent subscription frequency selection', 'Preferred worker assignment (favorite pros)'],
    inputs: ['Date selector', 'Time slot radio selection', 'New address form (Street, Building, Apartment, Gate code)', 'Delivery instructions note'],
    buttonsAndActions: ['"Add New Address"', '"Select Slot"', '"Apply Subscription Discount"', '"Proceed to Checkout"'],
    navigationFlow: 'Service Customizer -> Booking Drawer -> Auth Modal (if unauthenticated) -> Checkout & Payment',
    dataDisplayed: ['Available dates (next 14 days)', 'Slot availability badges ("Only 2 pros left")', 'Recurrent savings percentage', 'Address validation status'],
    missingFeatures: ['Interactive Google Maps address pin dropper', 'Real-time worker availability overlay by neighborhood', 'Slot reservation countdown timer to prevent double booking'],
    uxProblems: ['Disabled time slots do not explain why they are unavailable (fully booked vs out of hours)', 'Address input lacks auto-complete via Google Places API', 'Frequency savings discount isn’t visually highlighted until final checkout'],
    uiImprovements: ['Add Google Maps Places API auto-suggest', 'Show badge on slots indicating "Fastest Arrival"', 'Highlight recurring subscription savings prominently in green callout'],
    accessibilityIssues: ['Date picker carousel is impossible to navigate with keyboard arrow keys', 'Screen readers fail to announce when slot selection updates total price'],
    mobileResponsiveness: '8/10 - Good drawer gesture design, but key buttons get hidden behind sticky safari bottom bar.',
    overallRating: 7.0
  },
  {
    id: 'checkout_payment',
    pageName: 'Order Checkout & Payment Gateway',
    purpose: 'Securely collect payment details, apply promo codes, review final invoice breakdown, and issue order confirmation.',
    targetUser: 'Customers finalizing purchase.',
    uiComponents: ['Order Summary Card', 'Promo Code Input Group', 'Payment Method Tabs (Credit Card, Apple Pay, Wallet, Cash on Delivery)', 'Gratuity/Tip Selector', 'Cancellation Policy Accordion'],
    features: ['Promo code validation engine', 'Split payment with Meraki Wallet credit', 'Custom tip addition ($3, $5, $10, custom)', 'Instant order creation'],
    inputs: ['Promo code input', 'Credit card number, expiry, CVV', 'Tip amount radio buttons', 'Terms and conditions consent checkbox'],
    buttonsAndActions: ['"Apply Promo"', '"Pay $XX.XX & Confirm Booking"', '"Change Payment Method"', '"View Refund Policy"'],
    navigationFlow: 'Booking Drawer -> Checkout -> Order Processing -> Order Confirmation & Live Tracking Screen',
    dataDisplayed: ['Itemized invoice breakdown (Base fee + Add-ons + Materials + VAT - Discount)', 'Estimated arrival time', 'Saved card badges', 'Refund policy highlights'],
    missingFeatures: ['Apple Pay / Google Pay one-touch checkout integration', 'Saved wallet balance top-up within checkout screen', 'Split bill option for roommates'],
    uxProblems: ['Promo code input fails gracefully on invalid code but gives generic error without hint', 'No explicit lock icon / security certification badge near card inputs', 'CVV input lacks masking control'],
    uiImprovements: ['Add trust seals (PCI-DSS compliant, 256-bit encryption)', 'Auto-apply best promo code on click', 'Show breakdown modal for taxes and VAT'],
    accessibilityIssues: ['Form validation errors rely solely on red border color without descriptive text', 'Payment tab controls lack ARIA role="tab" and tabpanel associations'],
    mobileResponsiveness: '8.5/10 - Clean single-column checkout flow.',
    overallRating: 7.5
  },
  {
    id: 'live_tracking',
    pageName: 'Customer My Bookings & Live Tracking',
    purpose: 'Provide real-time transparency of active service jobs, worker arrival status, live GPS map, and order history.',
    targetUser: 'Customers waiting for service arrival or checking past invoices.',
    uiComponents: ['Status Timeline Tracker (Confirmed -> En Route -> Arrived -> In Progress -> Completed)', 'Live Worker Profile Card', 'Direct Call / WhatsApp Button', 'Interactive Live Map View', 'Job Review & Rating Modal Trigger'],
    features: ['Worker live location tracking on map', 'Real-time status updates via WebSockets', 'Direct call masking to protect customer phone number', 'Job cancellation / reschedule drawer', 'PDF Receipt download'],
    inputs: ['Rating stars (1-5)', 'Written review text', 'Tip amount selection post-job'],
    buttonsAndActions: ['"Track Worker"', '"Call Worker"', '"Message Support"', '"Reschedule Job"', '"Cancel Booking"', '"Submit Review"'],
    navigationFlow: 'Order Checkout -> Live Tracking -> Job Completion -> Review Modal -> Receipt',
    dataDisplayed: ['Worker photo, name, rating, and vehicle/badge details', 'Estimated ETA countdown (e.g. 14 mins away)', 'Job duration timer when active', 'Service checklist progress'],
    missingFeatures: ['Live chat interface between customer and worker', 'Photo proof upload notification when worker arrives/finishes', 'Emergency panic button / safety report option'],
    uxProblems: ['Map refresh lags when worker changes route', 'Reschedule policy penalty fees are hidden until 2nd click', 'Review modal opens automatically over active map obstructing view'],
    uiImprovements: ['Integrate WhatsApp API direct deep-link', 'Add live audio wave indicator when calling pro', 'Display live photo log of completed service work'],
    accessibilityIssues: ['Status timeline progress bar uses color alone to convey status', 'Map pin lacks textual description for screen readers'],
    mobileResponsiveness: '9/10 - Great full-screen mobile app feel for live job monitoring.',
    overallRating: 8.1
  },
  {
    id: 'worker_app',
    pageName: 'Worker Mobile Portal & Job Execution',
    purpose: 'Empower field service professionals to toggle availability, view assigned job feeds, navigate to customer locations, track job execution, and review earnings.',
    targetUser: 'Meraki Home Service Professionals (Cleaners, Electricians, Plumbers, Technicians).',
    uiComponents: ['Online/Offline Availability Switch', 'Job Dispatch Card Feed', 'Navigation Map Integration Button', 'Service Checklist & Proof Photo Uploader', 'Daily & Weekly Earnings Widget'],
    features: ['Instant job acceptance/decline', 'GPS turn-by-turn navigation link', 'Job execution timer with pause/resume', 'Before/After photo verification upload', 'Payout withdrawal tracker'],
    inputs: ['Online status toggle switch', 'Job decline reason selector', 'Camera capture for proof of work', 'Completion notes input'],
    buttonsAndActions: ['"Accept Job ($45.00)"', '"I Have Arrived"', '"Start Service Timer"', '"Upload Completion Photo"', '"Complete Job"'],
    navigationFlow: 'Worker Login -> Duty Toggle -> Job Feed -> Job Detail -> En Route -> Active Timer -> Proof Upload -> Earnings',
    dataDisplayed: ['Job address, customer notes, gate code', 'Job payout & tips', 'Required equipment checklist', 'Distance & travel time to customer'],
    missingFeatures: ['In-app offline mode for low-connectivity basements/elevators', 'Instant emergency SOS safety button for workers', 'Translate customer notes button for multi-lingual workers'],
    uxProblems: ['Decline job button is placed right next to Accept job button causing accidental miss-clicks', 'Photo upload fails silently on high-res camera photos without compress step'],
    uiImprovements: ['Implement swipe-to-accept slider to prevent accidental job touches', 'Auto-compress image uploads on client-side', 'Add multi-language switch (English, Arabic, Hindi, Tagalog)'],
    accessibilityIssues: ['Small font size on customer gate code text (11px)', 'Timer status relies on green text on dark gray background (low contrast)'],
    mobileResponsiveness: '8.5/10 - Tailored for one-handed mobile use.',
    overallRating: 7.8
  },
  {
    id: 'admin_dashboard',
    pageName: 'Admin Operations Command Center',
    purpose: 'Give platform administrators full oversight of live service dispatches, worker KYC verification, dynamic pricing control, customer disputes, and revenue analytics.',
    targetUser: 'Operations managers, dispatchers, customer support leads, business analysts.',
    uiComponents: ['KPI Metric Cards (Revenue, Active Dispatches, Completion Rate, CSAT)', 'Live Dispatch Fleet Map', 'Worker Verification Table', 'Dynamic Service Pricing Matrix', 'Customer Dispute Queue'],
    features: ['Manual worker override & re-assignment', 'Worker KYC document approval/rejection', 'Dynamic surge pricing multiplier control', 'Refund issuing & dispute resolution', 'Export revenue CSV reports'],
    inputs: ['Search worker/customer input', 'Base price modification inputs', 'KYC approval check/reject notes', 'Date range filter selector'],
    buttonsAndActions: ['"Reassign Dispatch"', '"Approve Worker KYC"', '"Update Pricing Tier"', '"Issue Full Refund"', '"Export Report"'],
    navigationFlow: 'Admin Overview -> Live Fleet -> Dispatch Override -> Worker Management -> Pricing Config -> Disputes',
    dataDisplayed: ['Real-time active jobs on city map', 'Worker utilization rate (%)', 'Average dispatch delay (mins)', 'Revenue breakdown by service category'],
    missingFeatures: ['Automated AI surge pricing based on weather/demand', 'Audit log of admin actions (who changed pricing/refunded)', 'Worker performance heatmaps'],
    uxProblems: ['Tables lack pagination and virtualization causing performance lag on >500 records', 'Dispute drawer doesn’t allow inline viewing of worker proof photos', 'Bulk operations missing on worker table'],
    uiImprovements: ['Add data-table virtualization and quick filter presets', 'Integrate side-by-side photo comparison for customer complaint vs worker proof photo', 'Add visual chart for peak demand hours'],
    accessibilityIssues: ['Chart tooltips lack screen reader focus', 'Table action buttons rely on low-contrast icons without text labels'],
    mobileResponsiveness: '5/10 - Desktop-optimized dashboard; overflows horizontally on tablet/mobile screens.',
    overallRating: 7.4
  },
  {
    id: 'auth_verification',
    pageName: 'Authentication & Verification Flow',
    purpose: 'Handle secure friction-free sign-in for Customers (Phone OTP / Social), Workers (Mobile PIN / ID), and Admins (2FA).',
    targetUser: 'All platform users across Customer, Worker, and Admin roles.',
    uiComponents: ['Phone Number Input with Country Flag Dropdown', '6-Digit OTP Pin Input', 'Social Login Buttons (Google, Apple)', 'Role Switcher Tab', 'KYC Document Drag & Drop Zone'],
    features: ['Auto SMS OTP fill', 'Country code selector (+1, +971, +44, +91)', 'Resend OTP countdown timer (60s)', 'Remember device toggle'],
    inputs: ['Phone number field', 'OTP digit inputs (1-6)', 'National ID / Driving License file upload for workers'],
    buttonsAndActions: ['"Send Verification Code"', '"Verify & Continue"', '"Continue with Google"', '"Resend Code in 45s"'],
    navigationFlow: 'Trigger Action -> Auth Modal -> Enter Phone -> Enter OTP -> Profile Complete -> Return to Trigger Action',
    dataDisplayed: ['Masked phone number verification target', 'Error messages for expired/wrong OTP'],
    missingFeatures: ['Passkey / Biometric authentication support', 'Instant WhatsApp OTP delivery option', 'Automatic account recovery flow'],
    uxProblems: ['OTP input doesn’t auto-advance focus to next digit on mobile keyboard paste', 'Country code list lacks search filter', 'Worker registration lacks clear onboarding progress bar'],
    uiImprovements: ['Implement unified auto-focusing 6-digit pin component', 'Add WhatsApp OTP fallback option', 'Show onboarding progress tracker for worker document submission'],
    accessibilityIssues: ['OTP inputs lack proper aria-labels for each digit', 'Error toast dismisses too quickly (3 seconds) for slow readers'],
    mobileResponsiveness: '9/10 - Clean modal dialog centered on mobile viewports.',
    overallRating: 8.0
  }
];

export const COMPETITIVE_MATRIX: CompetitiveFactor[] = [
  {
    feature: 'Booking UX & Customization Depth',
    merakiStatus: 'High - Offers granular add-ons, cleaner count, material inclusion, and duration fine-tuning.',
    justlifeComparison: 'Industry standard, polished 3-step booking flow with fixed service presets.',
    urbanCompanyComparison: 'Best-in-class multi-category customizer with interactive visual add-on selection.',
    taskRabbitComparison: 'Hourly task-based selection with heavy reliance on worker negotiation.',
    verdict: 'stronger'
  },
  {
    feature: 'Worker Assignment Model',
    merakiStatus: 'Hybrid - Auto-matching algorithm based on proximity + optional favorite worker preference.',
    justlifeComparison: 'Pure auto-dispatch algorithm with high reliability.',
    urbanCompanyComparison: 'Algorithmic instant dispatch with tiered professional badges.',
    taskRabbitComparison: 'Browse-and-pick directory model (slower booking turnaround).',
    verdict: 'stronger'
  },
  {
    feature: 'Pricing Transparency & Invoice Breakdown',
    merakiStatus: 'Good - Itemizes base rate, add-ons, and promo codes, but VAT and equipment fees are buried.',
    justlifeComparison: 'Crystal clear upfront total with instant promo application and wallet credit auto-apply.',
    urbanCompanyComparison: 'Detailed itemized invoice showing labor vs spare parts upfront.',
    taskRabbitComparison: 'Hourly rate + task platform fee (can lead to unexpected final cost).',
    verdict: 'equal'
  },
  {
    feature: 'Real-Time Job Tracking & Safety',
    merakiStatus: 'Moderate - Status timeline exists; live map GPS tracking is simulated.',
    justlifeComparison: 'Live worker map tracking with ETA countdown and masked calling.',
    urbanCompanyComparison: 'SOS button, real-time OTP job start confirmation, live GPS tracking, safety insurance.',
    taskRabbitComparison: 'In-app chat and map update upon worker arrival.',
    verdict: 'weaker'
  },
  {
    feature: 'Worker Proof of Work & Quality Guarantee',
    merakiStatus: 'Basic - Simple review modal post-job.',
    justlifeComparison: '100% free re-clean guarantee if dissatisfied within 24 hours.',
    urbanCompanyComparison: 'Before/after photo requirement, standardized service kit check, 30-day warranty.',
    taskRabbitComparison: 'Happiness guarantee insurance up to $1M.',
    verdict: 'weaker'
  },
  {
    feature: 'Recurrent Subscription Engine',
    merakiStatus: 'Promising - Weekly (-20%) and Bi-weekly (-10%) toggles integrated in drawer.',
    justlifeComparison: 'Dominant recurring maid service subscription with auto-billing and flexible swaps.',
    urbanCompanyComparison: 'Annual membership pass (UC Plus) granting discount on every service.',
    taskRabbitComparison: 'No built-in recurring subscription engine; requires manual re-booking.',
    verdict: 'stronger'
  }
];

export const ROADMAP_PHASES = {
  phase1: {
    title: 'Phase 1: Production MVP (Must Have)',
    timeline: 'Weeks 1 - 6',
    focus: 'Core booking conversion, reliable worker dispatch, secure payment processing, and basic trust features.',
    deliverables: [
      'Google Places Address Autocomplete & Pin Dropper in Booking Drawer',
      'Stripe & Apple Pay / Google Pay Native Gateway Integration',
      'Worker Proof-of-Work Camera Upload (Before/After photos required for payout)',
      'Worker OTP Job Start Verification (Customer provides 4-digit code to worker to start timer)',
      'Unified Phone OTP Authentication with WhatsApp fallback',
      'Mobile-optimized responsive view for Admin Dispatch Table',
      'Automated email/SMS receipt generation and booking reminders'
    ]
  },
  phase2: {
    title: 'Phase 2: Growth & Retention (Should Have)',
    timeline: 'Weeks 7 - 14',
    focus: 'Recurrent subscriptions, customer retention, worker efficiency, and live tracking.',
    deliverables: [
      'Full Recurrent Subscription Management Engine (Auto-renew, swap date, preferred pro locking)',
      'Live WebSockets Worker GPS Tracking & Masked VoIP / WhatsApp Chat',
      'Meraki Wallet & Referral Reward Points System ($10 for inviter/invitee)',
      'Worker Performance Tiering (Silver, Gold, Platinum badges with priority dispatch)',
      'Dynamic Surge Pricing Engine (Peak hour pricing based on postal code slot saturation)',
      'Customer Care Ticketing & In-App Support Chatbot'
    ]
  },
  phase3: {
    title: 'Phase 3: Scale, AI & Enterprise (Nice to Have)',
    timeline: 'Weeks 15 - 24',
    focus: 'AI-driven operations, B2B property manager portal, and smart home service bundles.',
    deliverables: [
      'AI Home Inspection Scanner (Upload room photo -> auto-estimate cleaning hours and add-ons needed)',
      'B2B Enterprise Portal for Property Managers / Airbnb Hosts (Bulk booking, aggregated invoices)',
      'Smart IoT Locker Integration for keyless entry cleaning',
      'Worker Fleet Analytics & Machine Learning Route Optimization to reduce worker transit time by 30%',
      'Predictive Maintenance Alerts (e.g. "Your AC was last serviced 6 months ago — Book now for 15% off")'
    ]
  }
};
