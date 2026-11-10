import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { queryClient } from '../src/lib/query';
import { C } from '../src/components/ui';
import { BrandHeader } from '../src/components/BrandHeader';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

const openRoots = new Set(['index', 'welcome', '(auth)', 'professional']);

function EntryGate({ children }: { children: React.ReactNode }) {
  const { loading, canBrowse } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigation = useRootNavigationState();

  useEffect(() => {
    if (loading || !navigation?.key) return;
    const root = String(segments[0] || 'index');
    if (!canBrowse && !openRoots.has(root)) router.replace('/welcome');
    else if (canBrowse && (root === 'welcome' || root === 'index')) router.replace('/(tabs)');
  }, [loading, canBrowse, segments, router, navigation?.key]);

  return children;
}

function AppStack() {
  const insets = useSafeAreaInsets();
  return <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: C.white }}><StatusBar barStyle="dark-content" /><Stack screenOptions={{ header: () => <BrandHeader showBack />, headerTintColor: C.navy, headerTitleStyle: { color: C.navy, fontWeight: '800' }, headerStyle: { backgroundColor: C.white }, contentStyle: { backgroundColor: C.canvas } }}>
    <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
    <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'none', gestureEnabled: false }} />
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="(auth)/login" options={{ title: 'Sign in', presentation: 'modal' }} />
    <Stack.Screen name="(auth)/register" options={{ title: 'Create account', presentation: 'modal' }} />
    <Stack.Screen name="service/[id]" options={{ title: 'Services' }} />
    <Stack.Screen name="booking" options={{ title: 'Request a service' }} />
    <Stack.Screen name="booking-details/[reference]" options={{ title: 'Booking details' }} />
    <Stack.Screen name="professional" options={{ title: 'Professional workspace' }} />
    <Stack.Screen name="approvals" options={{ title: 'Your approvals' }} />
    <Stack.Screen name="guest-booking" options={{ title: 'Guest booking lookup' }} />
    <Stack.Screen name="assistant" options={{ title: 'Merk Assistant' }} />
    <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
    <Stack.Screen name="contact" options={{ title: 'Contact & support' }} />
    <Stack.Screen name="about" options={{ title: 'About Meraki Homes' }} />
    <Stack.Screen name="workers" options={{ title: 'Specialists' }} />
  </Stack></View>;
}

export default function RootLayout() {
  return <SafeAreaProvider><QueryClientProvider client={queryClient}><AuthProvider><ErrorBoundary><EntryGate><AppStack /></EntryGate></ErrorBoundary></AuthProvider></QueryClientProvider></SafeAreaProvider>;
}
