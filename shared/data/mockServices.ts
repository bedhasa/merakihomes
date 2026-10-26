import { ServiceCategory, Booking, Worker, Customer, Review, PricingPlan } from '../types';

export const ETB_EXCHANGE_RATE = 120; // 1 USD = 120 ETB

export const ADDIS_NEIGHBORHOODS = [
  'Bole Atlas',
  'Kazanchis',
  'Old Airport',
  'Sarbet / Bisrate Gabriel',
  'CMC / Summit',
  'Gerji / Imperial',
  'Nifas Silk',
  'Mexico / Lideta'
];

export const MOCK_SERVICES: ServiceCategory[] = [
  { id: "handyman_plumbing", name: "Minor Home Repairs", iconName: "Wrench", pricingType: "quotation", description: "Small household repairs, fittings, and maintenance. Share the issue and our team will review the work and price with you.", basePrice: 150, unit: "after scope review", rating: 0, reviewsCount: 0, durationMinutes: 60, image: "https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=800&q=80", addons: [] },
  { id: "gardening_outdoor", name: "Gardening & Outdoor", iconName: "Flower2", pricingType: "quotation", description: "Garden care and outdoor upkeep for homes. Tell us about the space and the work you have in mind.", basePrice: 0, unit: "after scope review", rating: 0, reviewsCount: 0, durationMinutes: 60, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80", addons: [] },
  { id: "office_cleaning", name: "Office & Commercial Cleaning", iconName: "Building2", pricingType: "quotation", description: "Cleaning requests for offices and commercial spaces. Scope and schedule are reviewed before confirmation.", basePrice: 0, unit: "after scope review", rating: 0, reviewsCount: 0, durationMinutes: 60, image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80", addons: [] },
  { id: "elder_companion", name: "Elder Companion Care", iconName: "HeartHandshake", pricingType: "quotation", description: "Companion support requests for older adults. Share the kind of support and preferred schedule for a careful review.", basePrice: 0, unit: "after scope review", rating: 0, reviewsCount: 0, durationMinutes: 60, image: "https://images.unsplash.com/photo-1576765608866-5b51046452b6?auto=format&fit=crop&w=800&q=80", addons: [] },
  { id: "childcare_nanny", name: "Childcare & Babysitting", iconName: "Baby", pricingType: "quotation", description: "Childcare support for infants, toddlers, and school-age children. Share care requirements for review.", basePrice: 150, unit: "after scope review", rating: 0, reviewsCount: 0, durationMinutes: 60, image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80", addons: [] },
  { id: "cooking_service", name: "Personal Cooking", iconName: "ChefHat", pricingType: "quotation", description: "In-home meal preparation. Tell us about the menu, dietary needs, and occasion.", basePrice: 250, unit: "after scope review", rating: 0, reviewsCount: 0, durationMinutes: 90, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80", addons: [] },
  { id: "maid_laundry", name: "Laundry & Ironing", iconName: "Shirt", pricingType: "quotation", description: "Laundry, ironing, and garment care requests for your household. Final scope is reviewed with you.", basePrice: 35, unit: "after scope review", rating: 0, reviewsCount: 0, durationMinutes: 180, image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80", addons: [] },
  { id: "premium_home_cleaning", name: "Premium Home Cleaning", iconName: "Sparkles", pricingType: "quotation", description: "Thoughtful home cleaning for apartments and villas, with the requested rooms and priorities agreed before a visit.", basePrice: 25, unit: "after scope review", rating: 0, reviewsCount: 0, durationMinutes: 120, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80", addons: [] }
];

export const MOCK_WORKERS: Worker[] = [
  {
    id: 'w_101',
    name: 'Bethlehem Tesfaye',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    phone: '+251 91 123 4567',
    rating: 4.96,
    jobsCompleted: 540,
    skills: ['Home Cleaning', 'Deep Cleaning', 'Eco Sanitization'],
    isAvailable: true,
    status: 'en_route',
    kycStatus: 'verified',
    idNumber: 'ETH-ID-882910',
    policeRecordVerified: true,
    earningsToday: 45.00,
    earningsTodayETB: 5400,
    neighborhood: 'Bole Atlas'
  },
  {
    id: 'w_102',
    name: 'Solomon Assefa',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    phone: '+251 92 876 5432',
    rating: 4.92,
    jobsCompleted: 710,
    skills: ['AC Servicing', 'Plumbing', 'Electrical'],
    isAvailable: true,
    status: 'idle',
    kycStatus: 'verified',
    idNumber: 'ETH-ID-910244',
    policeRecordVerified: true,
    earningsToday: 80.00,
    earningsTodayETB: 9600,
    neighborhood: 'Kazanchis'
  },
  {
    id: 'w_103',
    name: 'Hiwot Tadesse',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    phone: '+251 94 455 6677',
    rating: 4.98,
    jobsCompleted: 420,
    skills: ['Maid & Laundry', 'Deep Sanitization'],
    isAvailable: true,
    status: 'working',
    kycStatus: 'verified',
    idNumber: 'ETH-ID-749201',
    policeRecordVerified: true,
    earningsToday: 60.00,
    earningsTodayETB: 7200,
    neighborhood: 'Old Airport'
  },
  {
    id: 'w_104',
    name: 'Tewodros Alemu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+251 91 999 8877',
    rating: 4.84,
    jobsCompleted: 140,
    skills: ['Eco Pest Protection', 'Handyman'],
    isAvailable: false,
    status: 'offline',
    kycStatus: 'pending',
    idNumber: 'ETH-ID-109284',
    policeRecordVerified: false,
    earningsToday: 0.00,
    earningsTodayETB: 0,
    neighborhood: 'CMC / Summit'
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c_201',
    name: 'Dr. Kebede Tadesse',
    email: 'kebede.tadesse@example.et',
    phone: '+251 91 222 3344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Bole Atlas',
    joinedDate: 'Jan 2025',
    totalBookings: 18,
    totalSpentUSD: 680,
    totalSpentETB: 81600,
    preferredPayment: 'telebirr'
  },
  {
    id: 'c_202',
    name: 'Frehiwot Bekele',
    email: 'frehiwot.b@example.com',
    phone: '+251 93 444 5566',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Old Airport',
    joinedDate: 'Mar 2025',
    totalBookings: 12,
    totalSpentUSD: 520,
    totalSpentETB: 62400,
    preferredPayment: 'chapa'
  },
  {
    id: 'c_203',
    name: 'Dawit Mengistu',
    email: 'dawit.m@example.org',
    phone: '+251 91 555 6677',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Kazanchis',
    joinedDate: 'Nov 2024',
    totalBookings: 25,
    totalSpentUSD: 1100,
    totalSpentETB: 132000,
    preferredPayment: 'cbe_birr'
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    customerName: 'Alemayehu Tekle',
    customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Bole Atlas, Addis Ababa',
    serviceName: 'Standard Home Cleaning',
    workerName: 'Bethlehem Tesfaye',
    rating: 5,
    comment: 'Bethlehem arrived right on time with all her specialized eco cleaning materials. My living room and kitchen look spotless! Best home service app in Addis.',
    date: '2 days ago',
    verifiedBooking: true
  },
  {
    id: 'rev_2',
    customerName: 'Martha Yohannes',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Old Airport, Addis Ababa',
    serviceName: 'Deep Villa Sanitization',
    workerName: 'Hiwot Tadesse',
    rating: 5,
    comment: 'We booked Meraki Homes before moving into our new villa. The team steam-cleaned all sofa sets and polished the marble floors. Paid instantly via Telebirr!',
    date: '1 week ago',
    verifiedBooking: true
  },
  {
    id: 'rev_3',
    customerName: 'Yonas Berhanu',
    customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    neighborhood: 'Kazanchis, Addis Ababa',
    serviceName: 'AC & Climate Control Repair',
    workerName: 'Solomon Assefa',
    rating: 5,
    comment: 'Solomon diagnosed our AC unit vibration noise in less than 20 minutes and recharged the refrigerant gas. Highly professional and polite.',
    date: '2 weeks ago',
    verifiedBooking: true
  }
];

export const MOCK_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan_single',
    name: 'One-Time Sparkle',
    priceUSD: 25,
    priceETB: 3000,
    billingFrequency: 'per visit',
    description: 'Perfect for quick spruce-ups, hosting guests, or trial visits.',
    features: [
      '2 Hours of Standard Cleaning',
      '1 Vetted Professional',
      'Basic Eco Materials Included',
      'Real-time GPS Dispatch Tracking',
      'Pay via Telebirr, CBE, or Card'
    ],
    recommended: false
  },
  {
    id: 'plan_weekly',
    name: 'Weekly Meraki Subscription',
    badge: 'Best Value • Save 20%',
    priceUSD: 80,
    priceETB: 9600,
    billingFrequency: 'monthly',
    description: '4 Scheduled visits per month with your favorite dedicated cleaner.',
    features: [
      '4 Scheduled Visits per Month',
      'Dedicated Favorite Pro Choice',
      'Free Oven & Fridge Interior Clean',
      'Priority Booking & Zero Surge',
      'Free Cancellation & Rescheduling',
      '100% Satisfaction Money-Back Guarantee'
    ],
    recommended: true
  },
  {
    id: 'plan_villa',
    name: 'Deep Villa & Luxury Care',
    badge: 'VIP Package',
    priceUSD: 180,
    priceETB: 21600,
    billingFrequency: 'per visit',
    description: 'Complete 360° deep sanitization for large multi-story residences.',
    features: [
      'Up to 6 Hours Full Team (3 Pros)',
      'Steam Sofa & Carpet Extraction',
      'Balcony & Veranda Pressure Scrub',
      'Window Glass & Frame Polish',
      'Post-Service Quality Manager Audit'
    ],
    recommended: false
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'MRK-849201',
    serviceId: 'home_cleaning',
    serviceName: 'Standard Home Cleaning (2 Hours)',
    customerName: 'Dr. Kebede Tadesse',
    customerPhone: '+251 91 123 4567',
    address: 'Bole Atlas, House #402, near Edna Mall',
    neighborhood: 'Bole Atlas',
    date: 'Today, 2:30 PM',
    timeSlot: '02:30 PM - 04:30 PM',
    durationHours: 2,
    cleanersCount: 1,
    addonsSelected: ['Eco Cleaning Kit', 'Oven Wash'],
    totalPrice: 35.00,
    totalPriceETB: 4200,
    status: 'in_progress',
    paymentMethod: 'telebirr',
    paymentStatus: 'paid',
    workerId: 'w_101',
    workerName: 'Bethlehem Tesfaye',
    workerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    workerRating: 4.96,
    etaMinutes: 8,
    notes: 'Gate code #402. Please bring eco materials.',
    createdAt: '2026-08-02 10:15 AM'
  },
  {
    id: 'MRK-849195',
    serviceId: 'ac_servicing',
    serviceName: 'AC Filter Cleaning & Gas Top-Up',
    customerName: 'Frehiwot Bekele',
    customerPhone: '+251 93 444 5566',
    address: 'Old Airport, Villa #12, near ICS School',
    neighborhood: 'Old Airport',
    date: 'Tomorrow, 10:00 AM',
    timeSlot: '10:00 AM - 11:30 AM',
    durationHours: 1.5,
    cleanersCount: 1,
    addonsSelected: ['Refrigerant Gas Top-Up'],
    totalPrice: 60.00,
    totalPriceETB: 7200,
    status: 'assigned',
    paymentMethod: 'cbe_birr',
    paymentStatus: 'paid',
    workerId: 'w_102',
    workerName: 'Solomon Assefa',
    workerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    workerRating: 4.92,
    notes: 'AC unit in upstairs bedroom needs coil wash.',
    createdAt: '2026-08-01 04:20 PM'
  }
];
