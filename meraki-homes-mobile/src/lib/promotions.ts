import type { HomePromotion } from '@shared/api';
import { api, resolveMediaUrl } from './api';

export type PromotionSummary = Pick<HomePromotion, 'id' | 'title' | 'body' | 'code' | 'imageUrl' | 'mobileImageUrl'>;

export const HOME_PROMOTIONS_QUERY_KEY = ['home-promotions'] as const;

const NO_PROMOTIONS: PromotionSummary[] = [];

function isPromotion(value: unknown): value is PromotionSummary {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && typeof candidate.title === 'string' && typeof candidate.body === 'string';
}

/**
 * Keeps only usable promotions. The CMS is optional, so anything the endpoint sends that is
 * missing content is dropped rather than rendered as an empty card.
 */
export function normalizePromotions(payload: unknown): PromotionSummary[] {
  const list = (payload as { promotions?: unknown } | null | undefined)?.promotions;
  if (!Array.isArray(list)) return NO_PROMOTIONS;
  const usable = list.filter(isPromotion).map(item => ({
    id: item.id,
    title: item.title,
    body: item.body,
    code: typeof item.code === 'string' ? item.code : 'MERAKI HOMES',
    imageUrl: resolveMediaUrl(typeof item.imageUrl === 'string' ? item.imageUrl : ''),
    mobileImageUrl: resolveMediaUrl(typeof item.mobileImageUrl === 'string' ? item.mobileImageUrl : ''),
  }));
  return usable.length ? usable : NO_PROMOTIONS;
}

/**
 * Loads the published home promotions. The endpoint is optional (it may be missing, unreachable or
 * return an empty body), so this always resolves to an array and never to `undefined` — React Query
 * rejects undefined query data.
 */
export async function fetchHomePromotions(): Promise<PromotionSummary[]> {
  try {
    const payload = await api<{ promotions?: PromotionSummary[] }>('/home-promotions', {}, false);
    return normalizePromotions(payload);
  } catch {
    // The bundled campaign cards remain available when the CMS is unavailable.
    return NO_PROMOTIONS;
  }
}
