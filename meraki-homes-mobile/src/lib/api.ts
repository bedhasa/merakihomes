import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
function normalizeApiBase(value?: string) {
  if (!value?.trim()) return '';
  try {
    const url = new URL(value.trim());
    url.search = '';
    url.hash = '';
    const path = url.pathname.replace(/\/+$/, '');
    url.pathname = path.endsWith('/api') ? path : `${path}/api`;
    return url.toString().replace(/\/+$/, '');
  } catch {
    return value.trim().replace(/\/+$/, '');
  }
}
// A physical Expo Go device cannot use localhost or the Android emulator alias.
// Require a device-reachable URL instead of silently falling back to a bad host.
export const API_BASE_URL = normalizeApiBase(configuredUrl);
export function resolveMediaUrl(url?: string | null) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('file:')) return url;
  if (url.startsWith('/api/') && API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}${url}`;
  }
  return url;
}
const TOKEN_KEY = 'meraki.customer.token.v1';
let onExpired: (() => void) | undefined;

function apiHost() {
  try { return new URL(API_BASE_URL).host; } catch { return 'the configured API'; }
}
function safeRoute(path: string) {
  return path.split('?')[0].replace(/\/[a-f\d-]{8,}(?=\/|$)/gi, '/:id');
}

export function setAuthExpiredHandler(handler?: () => void) { onExpired = handler; }
const isWeb = Platform.OS === 'web';
export const tokenStore = {
  // The API may be hosted on another origin (for example, through the temporary
  // HTTPS development tunnel), where browsers do not reliably send its cookies.
  // Keep web bearer tokens only for the current tab; native tokens stay in SecureStore.
  get: () => isWeb
    ? Promise.resolve(typeof window === 'undefined' ? null : window.sessionStorage.getItem(TOKEN_KEY))
    : SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) => {
    if (isWeb) {
      if (typeof window !== 'undefined') window.sessionStorage.setItem(TOKEN_KEY, token);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  clear: () => {
    if (isWeb) {
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(TOKEN_KEY);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly fields?: Record<string, string>, readonly code?: string) { super(message); }
}

export async function api<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const route = safeRoute(path);
  if (!API_BASE_URL) {
    const error = new ApiError('The mobile API URL is not configured. Set EXPO_PUBLIC_API_URL to the computer’s LAN address and backend port.', 0, undefined, 'config');
    if (__DEV__) console.warn(`[Meraki API] ${method} ${route}: EXPO_PUBLIC_API_URL is missing.`);
    throw error;
  }
  const controller = new AbortController();
  const callerSignal = options.signal;
  const abortFromCaller = () => controller.abort(callerSignal?.reason);
  if (callerSignal?.aborted) controller.abort(callerSignal.reason);
  else callerSignal?.addEventListener('abort', abortFromCaller, { once: true });
  const timer = setTimeout(() => controller.abort(), path.startsWith('/agaz/chat') ? 32_000 : 15_000);
  const startedAt = Date.now();
  try {
    const token = auth ? await tokenStore.get() : null;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      ...options,
      ...(Platform.OS === 'web' ? { credentials: 'include' as const } : {}),
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    if (response.status === 204) {
      // A 204 has no body. Every GET in this API returns JSON, so an empty GET is a contract
      // violation: surface it as an error rather than resolving `undefined`, which React Query
      // rejects with "Query data cannot be undefined". POST/PATCH/DELETE calls that legitimately
      // answer 204 only need the request itself to have succeeded.
      if (method === 'GET') throw new ApiError('The server returned no data for this request.', 204);
      return null as T;
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (__DEV__) console.warn(`[Meraki API] ${method} ${route} returned HTTP ${response.status} (${Date.now() - startedAt}ms).`);
      if (response.status === 401 && auth) {
        await tokenStore.clear().catch(() => undefined);
        onExpired?.();
      }
      throw new ApiError(payload?.error?.message || `Request failed (${response.status}).`, response.status, payload?.error?.fields, payload?.error?.code);
    }
    if (__DEV__) console.debug(`[Meraki API] ${method} ${route} -> ${response.status} (${Date.now() - startedAt}ms).`);
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      if (__DEV__) console.warn(`[Meraki API] ${method} ${route} timed out at ${apiHost()}.`);
      throw new ApiError(`The request to ${apiHost()} timed out. Check the phone’s network and try again.`, 408, undefined, 'timeout');
    }
    if (__DEV__) console.warn(`[Meraki API] ${method} ${route} could not reach ${apiHost()} (${error instanceof Error ? `${error.name}: ${error.message}` : 'network error'}).${Platform.OS === 'web' ? ` Page origin: ${globalThis.location?.origin || 'unknown'}. Check that the API allows this origin and that the page uses HTTP/HTTPS consistently with the API.` : ''}`);
    throw new ApiError(`Cannot reach Meraki Homes at ${apiHost()}. Put the phone and computer on the same network and confirm the backend port is reachable.`, 0, undefined, 'network');
  } finally { clearTimeout(timer); callerSignal?.removeEventListener('abort', abortFromCaller); }
}

export const postJson = (body: unknown, headers?: Record<string, string>): RequestInit => ({ method: 'POST', body: JSON.stringify(body), headers });
export const patchJson = (body: unknown): RequestInit => ({ method: 'PATCH', body: JSON.stringify(body) });
