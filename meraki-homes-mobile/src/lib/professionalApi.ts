import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from './api';

const TOKEN_KEY = 'meraki.professional.token.v1';

async function getToken() {
  if (Platform.OS === 'web') return typeof window === 'undefined' ? null : window.sessionStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function setToken(token: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function professionalApi<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  if (!API_BASE_URL) throw new Error('The mobile API URL is not configured.');
  const token = authenticated ? await getToken() : null;
  const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    ...(Platform.OS === 'web' ? { credentials: 'include' as const } : {}),
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || `Request failed (${response.status}).`);
  return body as T;
}

export async function loginProfessional(phone: string, password: string) {
  const result = await professionalApi<{ accessToken: string; professional: { id: string; name: string; workerCode: string | null } }>(
    '/professionals/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) }, false,
  );
  await setToken(result.accessToken);
  return result.professional;
}

export async function logoutProfessional() {
  try { await professionalApi('/professionals/auth/logout', { method: 'POST' }); } finally {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(TOKEN_KEY);
    } else await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
