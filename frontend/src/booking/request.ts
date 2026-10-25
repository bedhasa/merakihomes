import { Booking, ServiceCategory } from '@shared/types';

export type BookingRequestInput = {
  service: ServiceCategory;
  details: string;
  area: string;
  address: string;
  visitAt: string;
  name: string;
  phone: string;
  email?: string;
  workerPreference?: string;
};

export function isValidContact(name: string, phone: string): boolean {
  return Boolean(name.trim()) && /^\+?[\d\s()-]{7,}$/.test(phone.trim());
}

export function createBookingRequest(input: BookingRequestInput, now = new Date()): Booking {
  const requestedAt = new Date(input.visitAt);
  return {
    id: `MRK-${now.getTime().toString().slice(-8)}`,
    serviceId: input.service.id,
    serviceName: input.service.name,
    customerName: input.name.trim(),
    customerPhone: input.phone.trim(),
    customerEmail: input.email?.trim() || undefined,
    address: [input.address.trim(), input.area].filter(Boolean).join(', '),
    neighborhood: input.area,
    date: Number.isNaN(requestedAt.getTime()) ? input.visitAt : requestedAt.toLocaleDateString(),
    timeSlot: Number.isNaN(requestedAt.getTime()) ? 'Time requested' : requestedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    durationHours: input.service.durationMinutes / 60,
    cleanersCount: 1,
    addonsSelected: [],
    totalPrice: input.service.basePrice,
    totalPriceETB: input.service.basePrice * 120,
    status: 'requested',
    paymentMethod: 'not_selected',
    paymentStatus: 'pending',
    workerPreference: input.workerPreference?.trim() || undefined,
    notes: input.details.trim() || undefined,
    createdAt: now.toISOString(),
  };
}
