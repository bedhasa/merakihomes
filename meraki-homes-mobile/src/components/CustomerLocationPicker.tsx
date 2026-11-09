import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { api, ApiError } from '../lib/api';
import { Button, C } from './ui';

export type ConfirmedCustomerLocation = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string | null;
  area: string;
  landmark: string;
  locationSource: 'gps' | 'manual_search' | 'map';
  accuracy: number | null;
};
type PlaceResult = { label: string; latitude: number; longitude: number; placeId?: string | null; area?: string; landmark?: string };
type Props = { visible: boolean; initial?: Partial<ConfirmedCustomerLocation>; onClose(): void; onConfirm(value: ConfirmedCustomerLocation): void };

/** Web fallback: search/GPS work, while pin adjustment is available in the native app. */
export function CustomerLocationPicker({ visible, initial, onClose, onConfirm }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selected, setSelected] = useState<ConfirmedCustomerLocation | null>(null);
  const [searching, setSearching] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!visible) return;
    setQuery('');
    setResults([]);
    setError('');
    setSelected(initial?.latitude != null && initial.longitude != null ? {
      latitude: initial.latitude, longitude: initial.longitude, formattedAddress: initial.formattedAddress || '', placeId: initial.placeId || null,
      area: initial.area || '', landmark: initial.landmark || '', locationSource: initial.locationSource || 'map', accuracy: initial.accuracy ?? null,
    } : null);
  }, [visible, initial]);
  useEffect(() => {
    if (!visible || query.trim().length < 3) { setResults([]); setSearching(false); return; }
    let cancelled = false;
    const timeout = setTimeout(() => {
      setSearching(true);
      api<{ results: PlaceResult[] }>(`/location/search?q=${encodeURIComponent(query.trim())}`, {}, false)
        .then(data => {
          if (cancelled) return;
          setResults(data.results || []);
          setError(data.results?.length ? '' : 'We couldn\'t find this location. Try another search.');
        })
        .catch(reason => {
          if (cancelled) return;
          setResults([]);
          setError(reason instanceof ApiError && (reason.status === 0 || reason.code === 'network' || reason.status === 408)
            ? 'Please check your internet connection and try again.'
            : reason instanceof ApiError && reason.status === 503
              ? 'Address search is not configured yet. You can still enter the address on the booking form.'
              : 'We couldn\'t find this location. Try another search.');
        })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 400);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [query, visible]);
  const choose = (place: PlaceResult) => {
    setSelected({ latitude: place.latitude, longitude: place.longitude, formattedAddress: place.label, placeId: place.placeId || null, area: place.area || '', landmark: place.landmark || '', locationSource: 'manual_search', accuracy: null });
    setQuery(place.label); setResults([]); setError('');
  };
  const locate = async () => {
    setGpsBusy(true); setError('');
    try {
      const existing = await Location.getForegroundPermissionsAsync();
      if (!existing.granted) {
        if (!existing.canAskAgain) {
          setError('Location permission is required to use your current location. Enable it in browser settings, or search for an address instead.');
          return;
        }
        const requested = await Location.requestForegroundPermissionsAsync();
        if (!requested.granted) {
          setError('Location permission is required to use your current location. Search for an address instead.');
          return;
        }
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        setError('Device location is turned off. Turn it on or search for an address instead.');
        return;
      }
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
      ]);
      const address = await api<{ location: { formattedAddress: string | null; placeId: string | null; area: string; landmark: string } }>(`/location/reverse?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`, {}, false).catch(() => ({ location: { formattedAddress: '', placeId: null, area: '', landmark: '' } }));
      setSelected({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        formattedAddress: address.location.formattedAddress || '',
        placeId: address.location.placeId,
        area: address.location.area,
        landmark: address.location.landmark,
        locationSource: 'gps',
        accuracy: position.coords.accuracy,
      });
      setError(position.coords.accuracy !== null && position.coords.accuracy > 100
        ? `GPS accuracy is about ${Math.round(position.coords.accuracy)} m. Check the address before confirming.`
        : 'Check that this is the exact service entrance before confirming. Open the Android app to move the map pin.');
    } catch (reason) {
      setError(reason instanceof Error && reason.message === 'timeout'
        ? 'Location is taking too long. Try again or search for an address instead.'
        : 'Current location is unavailable. Search for an address instead.');
    } finally { setGpsBusy(false); }
  };
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 48 : 12, padding: 16, backgroundColor: '#F3F5F7', gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontSize: 19, color: '#142B4A', fontWeight: '900' }}>Service location</Text><Pressable onPress={onClose}><Text style={{ color: C.navy, fontWeight: '800' }}>Close</Text></Pressable></View>
      <Text style={{ color: C.slate, fontSize: 12 }}>Search for an address or landmark. Map pin adjustment is available in the native app.</Text>
      <TextInput value={query} onChangeText={value => { setQuery(value); setError(''); }} placeholder="Search for an address or landmark" placeholderTextColor="#7B8490" style={{ minHeight: 50, borderRadius: 13, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 13, color: C.ink }}/>
      {searching || gpsBusy ? <ActivityIndicator color={C.navy}/> : null}
      {gpsBusy ? <Text style={{ color: C.slate, fontSize: 12 }}>Finding your current location...</Text> : null}
      <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 250, backgroundColor: C.white, borderRadius: 12 }}>{results.map((item, index) => <Pressable key={`${item.placeId || item.label}-${index}`} onPress={() => choose(item)} style={{ padding: 13, borderBottomWidth: 1, borderColor: C.border }}><Text style={{ color: C.ink, fontSize: 13 }}>{item.label}</Text></Pressable>)}</ScrollView>
      <Button title="Use my current location" variant="outline" onPress={() => void locate()} loading={gpsBusy}/>
      {selected ? <View style={{ padding: 13, borderRadius: 13, backgroundColor: C.white, gap: 4 }}><Text style={{ color: '#142B4A', fontWeight: '900', fontSize: 10 }}>SELECTED SERVICE LOCATION</Text><Text style={{ color: C.ink, fontWeight: '700', fontSize: 13 }}>{selected.formattedAddress || `${selected.latitude.toFixed(5)}, ${selected.longitude.toFixed(5)}`}</Text><Text style={{ color: C.muted, fontSize: 10 }}>Move the pin to the exact service location in the native app, then confirm this location.</Text></View> : null}
      {error ? <Text style={{ color: C.red, fontSize: 12 }}>{error}</Text> : null}
      <View style={{ marginTop: 'auto' }}><Button title="Confirm this location" disabled={!selected} onPress={() => selected && onConfirm(selected)}/></View>
    </View>
  </Modal>;
}
