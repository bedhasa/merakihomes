export type DemoEstimate = { amount: number; currency: 'ETB'; unit: string };

// Illustrative values for the prototype UI only; never used to authorize or charge a booking.
const demoEstimates: Record<string, DemoEstimate> = {
  handyman_plumbing: { amount: 1200, currency: 'ETB', unit: 'per request' },
  gardening_outdoor: { amount: 1000, currency: 'ETB', unit: 'per visit' },
  office_cleaning: { amount: 2500, currency: 'ETB', unit: 'per visit' },
  elder_companion: { amount: 800, currency: 'ETB', unit: 'per hour' },
  childcare_nanny: { amount: 1200, currency: 'ETB', unit: 'per hour' },
  cooking_service: { amount: 1000, currency: 'ETB', unit: 'per session' },
  maid_laundry: { amount: 800, currency: 'ETB', unit: 'per visit' },
  premium_home_cleaning: { amount: 1500, currency: 'ETB', unit: 'per visit' },
};

export function getDemoEstimate(serviceId?: string): DemoEstimate | undefined {
  return serviceId ? demoEstimates[serviceId] : undefined;
}

export function formatDemoEstimate(serviceId?: string): string {
  const estimate = getDemoEstimate(serviceId);
  return estimate ? `${estimate.amount.toLocaleString('en-US')} ${estimate.currency}` : 'Estimate after scope review';
}
