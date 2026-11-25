export type Currency = 'ETB' | 'USD';

export type PaymentMethodType = 'telebirr' | 'cbe_birr' | 'chapa' | 'card' | 'cash' | 'not_selected';

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
