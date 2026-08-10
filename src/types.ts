export type ViewMode = 'marketing' | 'customer' | 'admin' | 'worker' | 'audit_report';

export type MarketingSubPage = 'home' | 'about' | 'services' | 'pricing' | 'faq' | 'contact';
export type CustomerSubPage = 'dashboard' | 'book' | 'history' | 'payments' | 'reviews' | 'tracker';
export type AdminSubPage = 'customers' | 'workers' | 'bookings' | 'payments' | 'reports' | 'settings';
export type WorkerSubPage = 'jobs' | 'schedule' | 'earnings' | 'profile';

export type Currency = 'ETB' | 'USD';

export type PaymentMethodType = 'telebirr' | 'cbe_birr' | 'chapa' | 'card' | 'cash';

export interface PageAudit {
  id: string;
  pageName: string;
  purpose: string;
  targetUser: string;
  uiComponents: string[];
  features: string[];
  inputs: string[];
  buttonsAndActions: string[];
  navigationFlow: string;
  dataDisplayed: string[];
  missingFeatures: string[];
  uxProblems: string[];
  uiImprovements: string[];
  accessibilityIssues: string[];
  mobileResponsiveness: string;
  overallRating: number;
}

export interface JourneyStep {
  stepNumber: number;
  title: string;
  description: string;
  keyActors: string;
  touchpoints: string[];
  frictionPoints: string[];
  optimization: string;
}

export interface CompetitiveFactor {
  feature: string;
  merakiStatus: string;
  justlifeComparison: string;
  urbanCompanyComparison: string;
  taskRabbitComparison: string;
  verdict: 'stronger' | 'equal' | 'weaker';
}

export interface ServiceAddon {
  id: string;
  name: string;
  price: number; // in USD base, dynamically converted to ETB
  icon: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  popularBadge?: string;
  basePrice: number; // in USD, converted to ETB
  unit: string;
  rating: number;
  reviewsCount: number;
  durationMinutes: number;
  image: string;
  addons: ServiceAddon[];
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  address: string;
  neighborhood: string; // e.g., Bole, Kazanchis, Old Airport, Sarbet, CMC
  date: string;
  timeSlot: string;
  durationHours: number;
  cleanersCount: number;
  addonsSelected: string[];
  totalPrice: number; // in USD
  totalPriceETB: number; // in ETB
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  paymentMethod: PaymentMethodType;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  workerId?: string;
  workerName?: string;
  workerAvatar?: string;
  workerRating?: number;
  etaMinutes?: number;
  proofPhoto?: string;
  notes?: string;
  createdAt: string;
}

export interface Worker {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  rating: number;
  jobsCompleted: number;
  skills: string[];
  isAvailable: boolean;
  status: 'offline' | 'idle' | 'en_route' | 'working';
  kycStatus: 'verified' | 'pending' | 'rejected';
  idNumber?: string;
  policeRecordVerified?: boolean;
  earningsToday: number;
  earningsTodayETB: number;
  neighborhood: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  neighborhood: string;
  joinedDate: string;
  totalBookings: number;
  totalSpentUSD: number;
  totalSpentETB: number;
  preferredPayment: PaymentMethodType;
}

export interface Review {
  id: string;
  customerName: string;
  customerAvatar: string;
  neighborhood: string;
  serviceName: string;
  workerName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedBooking: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  priceUSD: number;
  priceETB: number;
  billingFrequency: 'per visit' | 'monthly' | 'quarterly';
  description: string;
  features: string[];
  recommended?: boolean;
}

