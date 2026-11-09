import React, { useEffect, useState } from 'react';
import { Alert, AppState, Image, ScrollView, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { Button, C, Card, Empty, Field, Loading, Page, Title } from '../src/components/ui';
import { loginProfessional, logoutProfessional, professionalApi } from '../src/lib/professionalApi';

type Professional = { id: string; name: string; workerCode: string; photoUrl: string | null; locationSharingEnabled: boolean; locationUpdatedAt: string | null };
type AssignedBooking = { bookingId: string; reference: string; status: string; customerName: string; requestedStart: string; itemId: string; serviceName: string; assignmentStatus: string };

export default function ProfessionalScreen() {
  const client = useQueryClient();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [checking, setChecking] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    professionalApi<{ professional: Professional }>('/professionals/me').then(result => setProfessional(result.professional)).catch(() => setProfessional(null)).finally(() => setChecking(false));
    return () => subscription.remove();
  }, []);

  const bookings = useQuery({
    queryKey: ['professional-bookings', professional?.id],
    queryFn: async () => (await professionalApi<{ bookings: AssignedBooking[] }>('/professionals/me/bookings')).bookings,
    enabled: !!professional,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!professional?.locationSharingEnabled || appState !== 'active') return;
    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;
    void Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: 60000, distanceInterval: 100 }, position => {
      void professionalApi('/professionals/me/location', { method: 'POST', body: JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracyMeters: position.coords.accuracy }) }).catch(() => undefined);
    }).then(value => { if (cancelled) value.remove(); else subscription = value; }).catch(() => undefined);
    return () => { cancelled = true; subscription?.remove(); };
  }, [professional?.locationSharingEnabled, appState]);

  const signIn = async () => {
    setBusy(true); setError('');
    try {
      await loginProfessional(phone, password);
      const result = await professionalApi<{ professional: Professional }>('/professionals/me');
      setProfessional(result.professional); setPassword('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Professional sign-in failed.'); }
    finally { setBusy(false); }
  };

  const toggleDiscoveryLocation = async () => {
    if (!professional) return;
    setError('');
    if (!professional.locationSharingEnabled) {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) { Alert.alert('Location permission needed', 'Allow location access before making your approximate work location visible in nearby results.'); return; }
      try {
        await professionalApi('/professionals/me/location-settings', { method: 'PATCH', body: JSON.stringify({ shareLocation: true }) });
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await professionalApi('/professionals/me/location', { method: 'POST', body: JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracyMeters: position.coords.accuracy }) });
        setProfessional({ ...professional, locationSharingEnabled: true, locationUpdatedAt: new Date().toISOString() });
      } catch (e) { await professionalApi('/professionals/me/location-settings', { method: 'PATCH', body: JSON.stringify({ shareLocation: false }) }).catch(() => undefined); setError(e instanceof Error ? e.message : 'Could not enable nearby location.'); }
    } else {
      try {
        await professionalApi('/professionals/me/location-settings', { method: 'PATCH', body: JSON.stringify({ shareLocation: false }) });
        setProfessional({ ...professional, locationSharingEnabled: false });
      } catch (e) { setError(e instanceof Error ? e.message : 'Could not turn off nearby location.'); }
    }
  };

  if (checking) return <Loading/>;
  if (!professional) return <Page><Title subtitle="For Meraki Homes service professionals">Professional sign in</Title><Card style={{ gap: 12 }}><Text style={{ color: C.slate, fontSize: 12, lineHeight: 18 }}>Sign in with your Meraki Homes professional account to share your work location and manage booking-specific location consent.</Text><Field label="Registered phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad"/><Field label="Password" value={password} onChangeText={setPassword} secureTextEntry/>{error ? <Text style={{ color: C.red, fontSize: 12 }}>{error}</Text> : null}<Button title="Sign in" loading={busy} onPress={() => void signIn()}/></Card></Page>;

  return <Page style={{ gap: 14 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
      {professional.photoUrl ? <Image source={{ uri: professional.photoUrl }} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: C.canvas }}/> : <View style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF2DB' }}><Feather name="user" size={21} color="#8B5E00"/></View>}
      <View style={{ flex: 1 }}><Title>Welcome, {professional.name.split(' ')[0]}</Title><Text style={{ color: C.muted, fontSize: 11 }}>{professional.workerCode || 'Meraki professional account'}</Text></View>
      <Button title="Sign out" variant="outline" style={{ minHeight: 38, paddingHorizontal: 10 }} onPress={async () => { await logoutProfessional(); setProfessional(null); await client.invalidateQueries({ queryKey: ['professional-bookings'] }); }}/>
    </View>
    {error ? <Text style={{ color: C.red, fontSize: 12 }}>{error}</Text> : null}
    <Card style={{ gap: 10 }}><Text style={{ color: C.navy, fontWeight: '900', fontSize: 14 }}>Nearby discovery</Text><Text style={{ color: C.slate, fontSize: 12, lineHeight: 18 }}>When enabled, customers searching nearby can see your recent work location and distance. This setting is separate from booking tracking.</Text><Button title={professional.locationSharingEnabled ? 'Turn off nearby location' : 'Share my work location'} variant={professional.locationSharingEnabled ? 'outline' : 'gold'} onPress={() => void toggleDiscoveryLocation()}/><Text style={{ color: C.muted, fontSize: 10 }}>Updates run only while this screen is open in the foreground. Background tracking is not enabled.</Text></Card>
    <Title subtitle="Only assigned, confirmed bookings can start location sharing.">Bookings and live location</Title>
    {bookings.isLoading ? <Loading/> : bookings.isError ? <Empty title="Bookings could not load" body={bookings.error instanceof Error ? bookings.error.message : 'Check your connection.'} action={<Button title="Retry" variant="outline" onPress={() => void bookings.refetch()}/>}/> : !bookings.data?.length ? <Empty title="No trackable bookings" body="Confirmed bookings assigned to you will appear here."/> : bookings.data.map(booking => <ProfessionalBookingCard key={`${booking.bookingId}-${booking.itemId}`} booking={booking}/>) }
  </Page>;
}

function ProfessionalBookingCard({ booking }: { booking: AssignedBooking }) {
  const client = useQueryClient();
  const [appActive,setAppActive]=useState(AppState.currentState==='active');
  useEffect(()=>{const listener=AppState.addEventListener('change',state=>setAppActive(state==='active'));return()=>listener.remove();},[]);
  const sharing = useQuery({
    queryKey: ['professional-location-sharing', booking.bookingId],
    queryFn: () => professionalApi<{ sessions: Array<{ id: string; workerId: string; status: string; customerConsented: boolean; professionalConsented: boolean; counterpart: { latitude: number; longitude: number; updatedAt: string; freshness: string } | null; expiresAt: string; stopReason: string | null }> }>(`/bookings/${booking.bookingId}/location-sharing`),
    refetchInterval: 5000,
  });
  const session = sharing.data?.sessions[0];
  const [sending, setSending] = useState(false);

  const consent = async (decision: 'grant' | 'withdraw') => {
    setSending(true);
    try {
      if (decision === 'grant' && session?.status !== 'active') {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) throw new Error('Allow foreground location access before consenting to booking location sharing.');
      }
      await professionalApi(`/bookings/${booking.bookingId}/location-sharing/consent`, { method: 'POST', body: JSON.stringify({ decision }) });
      await client.invalidateQueries({ queryKey: ['professional-location-sharing', booking.bookingId] });
    } catch (e) { Alert.alert('Location sharing', e instanceof Error ? e.message : 'Could not update consent.'); }
    finally { setSending(false); }
  };

  useEffect(() => {
    if (session?.status !== 'active' || !appActive) return;
    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;
    void Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 25 }, position => {
      void professionalApi(`/bookings/${booking.bookingId}/location-sharing/update`, { method: 'POST', body: JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracyMeters: position.coords.accuracy }) }).then(() => client.invalidateQueries({ queryKey: ['professional-location-sharing', booking.bookingId] })).catch(() => undefined);
    }).then(value => { if (cancelled) value.remove(); else subscription = value; }).catch(() => undefined);
    return () => { cancelled = true; subscription?.remove(); };
  }, [booking.bookingId, session?.status, appActive]);

  const statusText = session?.status === 'active' ? 'Live sharing is active. The customer may see your current location until it expires or either person stops sharing.' : session?.status === 'pending_customer_consent' ? 'You agreed. Waiting for the customer to consent.' : session?.status === 'pending_professional_consent' ? 'The customer agreed. Review and consent to start sharing.' : session?.status === 'stopped' ? 'Sharing stopped. A new session needs fresh consent from both people.' : 'Location is private until both you and the customer consent.';
  return <Card style={{ gap: 9 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><Text style={{ color: C.navy, fontSize: 13, fontWeight: '900', flex: 1 }}>{booking.serviceName}</Text><Text style={{ color: C.gold, fontSize: 11, fontWeight: '900' }}>{booking.reference}</Text></View><Text style={{ color: C.slate, fontSize: 11 }}>{booking.customerName} · {new Date(booking.requestedStart).toLocaleString()}</Text><Text style={{ color: C.slate, fontSize: 11, lineHeight: 17 }}>{statusText}</Text>{session?.counterpart ? <Text style={{ color: C.green, fontSize: 11 }}>Customer shared location at {new Date(session.counterpart.updatedAt).toLocaleTimeString()} ({session.counterpart.freshness}).</Text> : null}{session?.status === 'active' ? <Button title="Stop sharing now" variant="outline" loading={sending} onPress={() => void consent('withdraw')}/> : <Button title="I agree to share for this booking" loading={sending} disabled={session?.status === 'stopped' || session?.status === 'expired'} onPress={() => void consent('grant')}/> }</Card>;
}
