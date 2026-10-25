import { Currency } from '../types';
import { ETB_EXCHANGE_RATE } from '../data/mockServices';

export function formatCurrency(amountInUSD: number, currency: Currency): string {
  if (currency === 'ETB') {
    const etb = Math.round(amountInUSD * ETB_EXCHANGE_RATE);
    return `${etb.toLocaleString()} ETB`;
  } else {
    return `$${amountInUSD.toFixed(2)}`;
  }
}

export function formatETBOnly(etbAmount: number): string {
  return `${etbAmount.toLocaleString()} ETB`;
}
