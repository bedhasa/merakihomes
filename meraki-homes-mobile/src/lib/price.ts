import type { Service } from './types';

/** "From 1,200 ETB" from the API's cheapest bookable package, or `fallback` when the price is set after review. */
export function fromPriceLabel(service: Pick<Service, 'fromPrice'>, fallback: string): string {
  return service.fromPrice ? `From ${service.fromPrice.amount.toLocaleString()} ${service.fromPrice.currency}` : fallback;
}
