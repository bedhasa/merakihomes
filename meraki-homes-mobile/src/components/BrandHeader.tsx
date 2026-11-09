import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { C } from './ui';

const merakiLogo = require('../../assets/meraki-skyline-logo.png');

export function BrandHeader({ showBack = false }: { showBack?: boolean }) {
  const router = useRouter();
  const { customer } = useAuth();
  return <View style={s.wrap}>
    {showBack ? <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={s.back} onPress={() => router.back()}><Feather name="arrow-left" color={C.navy} size={19} /></Pressable> : null}
    <View style={s.brand}>
      <Image source={merakiLogo} style={s.logo} resizeMode="contain" accessibilityLabel="Meraki Homes logo" />
      <View style={s.copy}>
        <View style={s.nameRow}><Text style={s.name}>MERAKI</Text><Text style={s.homes}>HOMES</Text><View style={s.goldDot} /></View>
        <Text style={s.tag}>Home Services, Made Easy.</Text>
      </View>
    </View>
    <View style={s.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={s.bell} onPress={() => router.push('/notifications')}><Feather name="bell" color={C.navy} size={20} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={customer ? 'Your profile' : 'Profile and sign in'} style={s.profileRing} onPress={() => router.push('/(tabs)/profile')}><View style={s.avatar}><Feather name="user" color={C.navy} size={18} /></View></Pressable>
    </View>
  </View>;
}

const s = StyleSheet.create({
  wrap: { height: 72, backgroundColor: C.white, paddingHorizontal: 14, borderBottomWidth: 1, borderColor: '#EEF0F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7 },
  back: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#F1F3F5' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  logo: { width: 52, height: 49 },
  copy: { gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: C.navy, fontSize: 14, fontWeight: '900', letterSpacing: 0.1 },
  homes: { color: '#B27A13', fontSize: 14, fontWeight: '900', letterSpacing: 0.1 },
  goldDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#8B5E00' },
  tag: { color: C.slate, fontSize: 9 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bell: { width: 39, height: 39, borderRadius: 20, backgroundColor: '#F1F3F5', alignItems: 'center', justifyContent: 'center' },
  profileRing: { width: 43, height: 43, borderRadius: 22, borderWidth: 2, borderColor: '#D9C9A2', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#F4F1E9', alignItems: 'center', justifyContent: 'center' },
});
