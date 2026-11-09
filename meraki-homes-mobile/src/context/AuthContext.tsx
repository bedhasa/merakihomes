import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api, postJson, setAuthExpiredHandler, tokenStore } from '../lib/api';
import { queryClient } from '../lib/query';
import type { Customer } from '../lib/types';

const GUEST_KEY = 'meraki.guest.access.v1';

const guestStore = {
  get: async () => {
    if (Platform.OS === 'web') return typeof window === 'undefined' ? null : window.localStorage.getItem(GUEST_KEY);
    return SecureStore.getItemAsync(GUEST_KEY);
  },
  set: async (value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(GUEST_KEY, value);
      return;
    }
    await SecureStore.setItemAsync(GUEST_KEY, value);
  },
  clear: async () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.removeItem(GUEST_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(GUEST_KEY);
  },
};

type AuthValue = {
  customer: Customer | null;
  loading: boolean;
  guestAccess: boolean;
  canBrowse: boolean;
  updateCustomer(customer: Customer): void;
  signIn(email: string, password: string): Promise<void>;
  register(input: { name: string; email: string; phone: string; password: string }): Promise<void>;
  enterAsGuest(): Promise<void>;
  signOut(): Promise<void>;
};
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: React.PropsWithChildren) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [guestAccess, setGuestAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const updateCustomer = useCallback((value: Customer) => setCustomer(value), []);
  const refresh = useCallback(async () => {
    const guest = (await guestStore.get().catch(() => null)) === '1';
    setGuestAccess(guest);
    if (Platform.OS === 'web') {
      try { const result = await api<{ customer: Customer }>('/customers/me'); setCustomer(result.customer); }
      catch { setCustomer(null); }
      finally { setLoading(false); }
      return;
    }
    const token = await tokenStore.get();
    if (!token) { setCustomer(null); setLoading(false); return; }
    try { const result = await api<{ customer: Customer }>('/customers/me'); setCustomer(result.customer); }
    catch { setCustomer(null); await tokenStore.clear().catch(() => undefined); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { setAuthExpiredHandler(() => setCustomer(null)); void refresh(); return () => setAuthExpiredHandler(undefined); }, [refresh]);
  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api<{ customer: Customer; accessToken: string }>('/mobile/auth/login', postJson({ email, password }), false);
    await tokenStore.set(result.accessToken); setCustomer(result.customer); await queryClient.invalidateQueries();
  }, []);
  const register = useCallback(async (input: { name: string; email: string; phone: string; password: string }) => {
    const result = await api<{ customer: Customer; accessToken: string }>('/mobile/auth/register', postJson(input), false);
    await tokenStore.set(result.accessToken); setCustomer(result.customer); await queryClient.invalidateQueries();
  }, []);
  const enterAsGuest = useCallback(async () => {
    await guestStore.set('1');
    setGuestAccess(true);
  }, []);
  const signOut = useCallback(async () => {
    try { await api('/mobile/auth/logout', { method: 'POST' }); } catch { /* Clear local credentials even when offline. */ }
    finally { await tokenStore.clear(); await guestStore.clear(); setCustomer(null); setGuestAccess(false); queryClient.clear(); }
  }, []);
  const canBrowse = Boolean(customer) || guestAccess;
  const value = useMemo(() => ({ customer, loading, guestAccess, canBrowse, updateCustomer, signIn, register, enterAsGuest, signOut }), [customer, loading, guestAccess, canBrowse, updateCustomer, signIn, register, enterAsGuest, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be inside AuthProvider'); return value; }
