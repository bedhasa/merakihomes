import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const VISITOR_KEY = 'meraki.agaz.visitor.v1';

function uuid() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, value => {
    const random = Math.floor(Math.random() * 16);
    return (value === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export async function getAgazVisitorId() {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return uuid();
    let id = window.sessionStorage.getItem(VISITOR_KEY);
    if (!id) { id = uuid(); window.sessionStorage.setItem(VISITOR_KEY, id); }
    return id;
  }
  let id = await SecureStore.getItemAsync(VISITOR_KEY);
  if (!id) { id = uuid(); await SecureStore.setItemAsync(VISITOR_KEY, id); }
  return id;
}
