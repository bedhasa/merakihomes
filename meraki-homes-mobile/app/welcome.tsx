import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Button, C, ErrorBanner, Loading, Page } from '../src/components/ui';

const merakiLogo = require('../assets/meraki-skyline-logo.png');

export default function WelcomeScreen() {
  const { canBrowse, loading, enterAsGuest } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [guestBusy, setGuestBusy] = useState(false);

  if (loading) return <Loading />;
  if (canBrowse) return <Redirect href="/(tabs)" />;

  const continueAsGuest = async () => {
    setError(''); setGuestBusy(true);
    try {
      await enterAsGuest();
      router.replace('/(tabs)');
    } catch {
      setError('Could not start guest browsing. Please try again.');
    } finally { setGuestBusy(false); }
  };

  return <Page>
    <View style={{ flexGrow: 1, justifyContent: 'center', gap: 22, paddingTop: 24 }}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Image source={merakiLogo} style={{ width: 92, height: 86 }} resizeMode="contain" accessibilityLabel="Meraki Homes logo" />
        <Text style={{ color: C.navy, fontSize: 13, fontWeight: '900', letterSpacing: 2 }}>MERAKI HOMES</Text>
        <Text style={{ color: C.navy, fontSize: 28, lineHeight: 34, fontWeight: '900', textAlign: 'center' }}>Your home, in good hands.</Text>
        <Text style={{ color: C.slate, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>Reliable home services, made simple.</Text>
      </View>
      <ErrorBanner message={error} />
      <View style={{ gap: 10 }}>
        <Button title="Log in" variant="navy" onPress={() => router.push('/(auth)/login')} />
        <Button title="Create account" onPress={() => router.push('/(auth)/register')} />
        <Button title="Continue as guest" variant="outline" loading={guestBusy} onPress={() => void continueAsGuest()} />
      </View>
      <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' }}>Guests can browse services and start a request. Sign in to manage bookings, approvals, and saved addresses.</Text>
    </View>
  </Page>;
}
