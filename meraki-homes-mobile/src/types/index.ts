export type Language = 'en' | 'am';

export type ServiceCategory =
  | 'all'
  | 'cleaning'
  | 'buna'
  | 'electrical'
  | 'plumbing'
  | 'caregiving'
  | 'appliance'
  | 'gardening';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  title: string;
  amharicTitle: string;
  description: string;
  amharicDescription: string;
  priceETB: number;
  priceUnit: string;
  amharicPriceUnit: string;
  duration: string;
  amharicDuration: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  popular?: boolean;
  included: string[];
  amharicIncluded: string[];
}

export interface ProviderItem {
  id: string;
  name: string;
  amharicName: string;
  specialty: string;
  amharicSpecialty: string;
  category: ServiceCategory;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  hourlyRateETB: number;
  distanceKm: number;
  neighborhood: string;
  amharicNeighborhood: string;
  landmark: string;
  amharicLandmark: string;
  avatarUrl: string;
  badgeText: string;
  amharicBadgeText: string;
  bio: string;
  amharicBio: string;
  languages: string[];
  responseTime: string;
  coordinates: { x: number; y: number }; // Percentage position on map
}

export type BookingStatus = 'confirmed' | 'dispatched' | 'arrived' | 'in_progress' | 'completed';

export type PaymentMethod = 'telebirr' | 'cbe' | 'cash';

export interface BookingOrder {
  id: string;
  serviceId: string;
  serviceTitle: string;
  amharicServiceTitle: string;
  providerId: string;
  providerName: string;
  amharicProviderName: string;
  providerAvatar: string;
  providerPhone: string;
  status: BookingStatus;
  date: string;
  timeSlot: string;
  address: string;
  neighborhood: string;
  amharicNeighborhood: string;
  compoundNotes?: string;
  paymentMethod: PaymentMethod;
  paymentPhone?: string;
  totalPriceETB: number;
  serviceFeeETB: number;
  transportFeeETB: number;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  neighborhood: string;
  rating: number;
  comment: string;
  amharicComment: string;
  date: string;
}
