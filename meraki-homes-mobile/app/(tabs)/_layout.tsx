import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { BrandHeader } from '../../src/components/BrandHeader';
import { C, Loading } from '../../src/components/ui';

export default function TabLayout() {
  const { loading, canBrowse } = useAuth();
  const insets = useSafeAreaInsets();
  if (loading) return <Loading />;
  if (!canBrowse) return <Redirect href="/welcome" />;
  const tabBarHeight = 56 + Math.max(insets.bottom, 8);
  return <Tabs screenOptions={({ route }) => ({ header: () => <BrandHeader />, tabBarActiveTintColor: C.gold, tabBarInactiveTintColor: C.muted, tabBarStyle: { height: tabBarHeight, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 8), borderTopColor: C.border, backgroundColor: C.white }, tabBarLabelStyle: { fontSize: 10, fontWeight: '700' }, tabBarIcon: ({ color }) => { const icons = { index: 'home', services: 'grid', nearby: 'navigation', bookings: 'calendar', profile: 'user' } as const; const icon = icons[route.name as keyof typeof icons] ?? 'circle'; return <Feather name={icon} color={String(color ?? C.navy)} size={20} />; } })}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} />
    <Tabs.Screen name="services" options={{ title: 'Services' }} />
    <Tabs.Screen name="nearby" options={{ title: 'Nearby', tabBarIcon: ({ color }) => <Feather name="map-pin" color={String(color ?? C.navy)} size={20} /> }} />
    <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
  </Tabs>;
}
