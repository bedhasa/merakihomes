export type ViewMode = 'marketing' | 'customer' | 'admin' | 'worker' | 'audit_report';

export type MarketingSubPage = 'home' | 'about' | 'services' | 'pricing' | 'faq' | 'contact';
export type CustomerSubPage = 'dashboard' | 'book' | 'history' | 'payments' | 'reviews' | 'tracker';
export type AdminSubPage = 'customers' | 'workers' | 'bookings' | 'payments' | 'reports' | 'settings' | 'cms' | 'safety';
export type WorkerSubPage = 'jobs' | 'schedule' | 'earnings' | 'profile';

export type Currency = 'ETB' | 'USD';

export type PaymentMethodType = 'telebirr' | 'cbe_birr' | 'chapa' | 'card' | 'cash' | 'not_selected';

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
  pricingType?: 'fixed' | 'quotation';
  unit: string;
  rating: number;
  reviewsCount: number;
  durationMinutes: number;
  image: string;
  addons: ServiceAddon[];
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: Currency;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  packageId?: string;
  packageName?: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  neighborhood: string; // e.g., Bole, Kazanchis, Old Airport, Sarbet, CMC
  date: string;
  timeSlot: string;
  durationHours: number;
  cleanersCount: number;
  addonsSelected: string[];
  totalPrice: number; // in USD
  totalPriceETB: number; // in ETB
  status: 'draft' | 'requested' | 'awaiting_assignment' | 'assigned' | 'confirmed' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'payment_pending' | 'payment_failed' | 'disputed';
  paymentMethod: PaymentMethodType;
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'requires_verification';
  workerId?: string;
  workerPreference?: string;
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

// =============================================
// Booking Wizard Types
// =============================================

export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'unavailable' | 'full';
  period: 'morning' | 'afternoon' | 'evening';
}

export interface AvailableDate {
  date: Date;
  dateStr: string;
  label: string;
  dayName: string;
  dayNum: number;
  slots: TimeSlot[];
}

export interface BookingFormData {
  serviceId: string | null;
  details: Record<string, string | number | boolean>;
  customerName: string;
  phone: string;
  subcity: string;
  area: string;
  landmark: string;
  additionalDirections: string;
  selectedDate: string;
  selectedDateStr: string;
  selectedTimeSlotId: string | null;
  selectedTimeSlotLabel: string;
  paymentMethod: PaymentMethodType;
}
