import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { api, ApiError } from '../lib/api';
import { C } from './ui';
import type { ConfirmedCustomerLocation } from './CustomerLocationPicker';

type PlaceResult = { label: string; latitude: number; longitude: number; placeId?: string | null; area?: string; landmark?: string };
type ReverseResult = { formattedAddress: string | null; placeId: string | null; area: string; landmark: string };
type Position = { latitude: number; longitude: number };
type Props = { visible: boolean; initial?: Partial<ConfirmedCustomerLocation>; onClose(): void; onConfirm(value: ConfirmedCustomerLocation): void };
const DEFAULT_REGION: Region = { latitude: 9.03, longitude: 38.74, latitudeDelta: 0.045, longitudeDelta: 0.045 };
const GOOGLE_IOS_CONFIGURED = Boolean(Constants.expoConfig?.extra?.googleMapsIosConfigured);

export function CustomerLocationPicker({ visible, initial, onClose, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selected, setSelected] = useState<Position | null>(null);
  const [current, setCurrent] = useState<Position | null>(null);
  const [source, setSource] = useState<ConfirmedCustomerLocation['locationSource']>('map');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [error, setError] = useState('');
  const [gpsPermission, setGpsPermission] = useState(false);
  const initialized = useRef(false);
  const mapGesture = useRef(false);
  const mapProvider = Platform.OS === 'android' || GOOGLE_IOS_CONFIGURED ? PROVIDER_GOOGLE : undefined;

  useEffect(() => {
    if (!visible) { initialized.current = false; return; }
    if (initialized.current) return;
    initialized.current = true;
    const latitude = Number(initial?.latitude);
    const longitude = Number(initial?.longitude);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      const point = { latitude, longitude };
      setSelected(point);
      setRegion({ ...point, latitudeDelta: 0.012, longitudeDelta: 0.012 });
      setFormattedAddress(initial?.formattedAddress || '');
      setPlaceId(initial?.placeId || null);
      setArea(initial?.area || '');
      setLandmark(initial?.landmark || '');
      setAccuracy(initial?.accuracy ?? null);
      setSource(initial?.locationSource || 'map');
    } else {
      setSelected(null);
      setRegion(DEFAULT_REGION);
      setFormattedAddress('');
      setPlaceId(null);
      setArea('');
      setLandmark('');
      setAccuracy(null);
      setSource('map');
    }
    setCurrent(null);
    setSearch('');
    setSuggestions([]);
    setError('');
  }, [visible, initial]);

  useEffect(() => {
    const query = search.trim();
    if (!visible || query.length < 3) { setSuggestions([]); setSearching(false); return; }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      api<{ results: PlaceResult[] }>(`/location/search?q=${encodeURIComponent(query)}`, { signal: controller.signal }, false)
        .then(result => { setSuggestions(result.results || []); setError(result.results?.length ? '' : 'We couldn\'t find this location. Try another search.'); })
        .catch(reason => {
          if (controller.signal.aborted) return;
          setSuggestions([]);
          setError(reason instanceof ApiError && (reason.status === 0 || reason.code === 'network' || reason.status === 408)
            ? 'Please check your internet connection and try again.'
            : reason instanceof ApiError && reason.status === 503
              ? 'Address search is not configured yet. You can still choose a point on the map or enter the address on the booking form.'
              : 'We couldn\'t find this location. Try another search.');
        })
        .finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, visible]);

  useEffect(() => {
    if (!visible || !selected || source === 'manual_search') return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setResolving(true);
      api<{ location: ReverseResult }>(`/location/reverse?latitude=${selected.latitude}&longitude=${selected.longitude}`, { signal: controller.signal }, false)
        .then(result => {
          const location = result.location;
          if (location.formattedAddress) setFormattedAddress(location.formattedAddress);
          setPlaceId(location.placeId);
          if (location.area) setArea(location.area);
          if (location.landmark) setLandmark(location.landmark);
          setError(value => value.startsWith('GPS accuracy') ? value : '');
        })
        .catch(reason => {
          if (controller.signal.aborted) return;
          if (reason instanceof ApiError && reason.status === 503) setError('Address lookup is not configured. You can still use the selected map pin and enter the address on the booking form.');
        })
        .finally(() => { if (!controller.signal.aborted) setResolving(false); });
    }, 500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [selected?.latitude, selected?.longitude, source, visible]);

  const choosePlace = (place: PlaceResult) => {
    const point = { latitude: place.latitude, longitude: place.longitude };
    setSelected(point);
    setRegion({ ...point, latitudeDelta: 0.012, longitudeDelta: 0.012 });
    setFormattedAddress(place.label);
    setPlaceId(place.placeId || null);
    setArea(place.area || '');
    setLandmark(place.landmark || '');
    setSource('manual_search');
    setAccuracy(null);
    setSearch(place.label);
    setSuggestions([]);
    setError('');
  };

  const selectMapPoint = (point: Position) => {
    setSelected(point);
    setRegion(value => ({ ...value, ...point }));
    setFormattedAddress('');
    setPlaceId(null);
    setSource('map');
    setAccuracy(null);
    setError('');
  };

  const requestGps = () => {
    Alert.alert('Use your current location?', 'Meraki Homes will use your location to place the service pin. You can move the pin before confirming. We only send the confirmed address and coordinates with your booking request.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', onPress: () => void locateMe() },
    ]);
  };

  const locateMe = async () => {
    setError('');
    setGpsBusy(true);
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert('Location permission is off', 'Enable location permission in Settings to use GPS. You can still search for an address or move the pin manually.', [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open settings', onPress: () => void Linking.openSettings() },
          ]);
          return;
        }
        const requested = await Location.requestForegroundPermissionsAsync();
        if (!requested.granted) {
          setGpsPermission(false);
          setError('Location permission is required to use your current location. Search for a place or move the map pin instead.');
          return;
        }
      }
      setGpsPermission(true);
      if (!(await Location.hasServicesEnabledAsync())) {
        setError('Device location is turned off. Turn it on or search for an address instead.');
        return;
      }
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High, mayShowUserSettingsDialog: true }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
      ]);
      const point = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCurrent(point);
      setSelected(point);
      setRegion({ ...point, latitudeDelta: 0.008, longitudeDelta: 0.008 });
      setSource('gps');
      setAccuracy(position.coords.accuracy);
      setPlaceId(null);
      setFormattedAddress('');
      setError(position.coords.accuracy !== null && position.coords.accuracy > 100
        ? `GPS accuracy is about ${Math.round(position.coords.accuracy)} m. Check the address and adjust the pin before confirming.`
        : 'Check that the pin marks the exact service entrance before confirming.');
    } catch (reason) {
      setError(reason instanceof Error && reason.message === 'timeout'
        ? 'Location is taking too long. Try again or search for an address manually.'
        : 'Current location is unavailable. Check GPS or search for an address instead.');
    } finally { setGpsBusy(false); }
  };

  const confirm = () => {
    if (!selected) { setError('Search for a place, use GPS, or move the map to choose a service location.'); return; }
    onConfirm({ ...selected, formattedAddress, placeId, area, landmark, locationSource: source, accuracy });
  };

  const displayedAddress = useMemo(() => formattedAddress || (selected ? `${selected.latitude.toFixed(5)}, ${selected.longitude.toFixed(5)}` : 'Move the map to choose the service location'), [formattedAddress, selected]);

  return <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
    <KeyboardAvoidingView style={[styles.root, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 8 : 48), paddingBottom: insets.bottom }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top}>
      <View style={styles.header}>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close location picker" style={styles.close}><Feather name="arrow-left" size={21} color={C.navy}/></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.title}>Service location</Text><Text style={styles.subtitle}>Choose where the professional should arrive</Text></View>
      </View>
      <View style={styles.searchWrap}>
        <Feather name="search" size={18} color={C.muted}/>
        <TextInput value={search} onChangeText={value => { setSearch(value); setError(''); }} placeholder="Search for an address or landmark" placeholderTextColor="#7B8490" returnKeyType="search" onSubmitEditing={() => { if (suggestions[0]) choosePlace(suggestions[0]); }} style={styles.searchInput} accessibilityLabel="Search for an address or landmark"/>
        {searching ? <ActivityIndicator size="small" color={C.navy}/> : search ? <Pressable onPress={() => { setSearch(''); setSuggestions([]); }}><Feather name="x-circle" size={18} color={C.muted}/></Pressable> : null}
      </View>
      {suggestions.length > 0 ? <ScrollView keyboardShouldPersistTaps="handled" style={[styles.suggestions, { top: Math.max(insets.top, 8) + 110 }]} nestedScrollEnabled>{suggestions.map((item, index) => <Pressable key={`${item.placeId || item.label}-${index}`} onPress={() => choosePlace(item)} style={styles.suggestion}>
        <View style={styles.suggestionIcon}><Feather name="map-pin" size={16} color={C.navy}/></View><Text style={styles.suggestionText}>{item.label}</Text>
      </Pressable>)}</ScrollView> : null}
      <View style={styles.mapWrap}>
        <MapView
          style={StyleSheet.absoluteFill}
          provider={mapProvider}
          initialRegion={region}
          region={region}
          onPanDrag={() => { mapGesture.current = true; }}
          onRegionChangeComplete={next => { setRegion(next); if (mapGesture.current) { mapGesture.current = false; setSelected({ latitude: next.latitude, longitude: next.longitude }); setSource('map'); setFormattedAddress(''); setPlaceId(null); setAccuracy(null); } }}
          onPress={event => selectMapPoint(event.nativeEvent.coordinate)}
          showsUserLocation={gpsPermission && !!current}
          showsMyLocationButton={false}
          loadingEnabled
          moveOnMarkerPress={false}
        >
          {current && source !== 'gps' ? <Marker coordinate={current} title="Your current location" description="GPS location" pinColor="#1677E8"/> : null}
        </MapView>
        {selected ? <View pointerEvents="none" style={styles.selectedPin}><View style={styles.pinHead}><Feather name="map-pin" size={23} color={C.white}/></View><View style={styles.pinTail}/></View> : null}
        <View pointerEvents="none" style={styles.mapHint}><Text style={styles.mapHintText}>{gpsBusy ? 'Finding your current location...' : selected ? 'Move the pin to the exact service location.' : 'Move the map or tap a point to place the pin'}</Text></View>
        <Pressable onPress={requestGps} style={styles.gpsButton} accessibilityRole="button"><Feather name="crosshair" size={19} color={C.navy}/></Pressable>
      </View>
      <View style={styles.footer}>
        <View style={styles.addressRow}><View style={styles.addressIcon}><Feather name="map-pin" size={17} color={C.navy}/></View><View style={{ flex: 1 }}><Text style={styles.addressLabel}>PIN LOCATION</Text><Text numberOfLines={2} style={styles.addressValue}>{displayedAddress}</Text>{resolving ? <Text style={styles.lookup}>Updating address…</Text> : null}</View></View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}>
          <Pressable onPress={requestGps} disabled={gpsBusy} style={styles.gpsTextButton}>{gpsBusy ? <ActivityIndicator color={C.navy}/> : <Feather name="navigation" size={16} color={C.navy}/>}<Text style={styles.gpsText}>{gpsBusy ? 'Finding your current location...' : 'Use my current location'}</Text></Pressable>
          <Pressable onPress={confirm} disabled={!selected} accessibilityRole="button" style={[styles.confirm, !selected && styles.disabled]}><Text style={styles.confirmText}>Confirm this location</Text><Feather name="arrow-right" size={17} color={C.white}/></Pressable>
        </View>
        <Text style={styles.privacy}>Confirm only when this pin marks the actual service entrance. You can still correct the address on the booking form.</Text>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F5F7' },
  header: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  close: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#142B4A', fontSize: 18, fontWeight: '900' }, subtitle: { color: C.slate, fontSize: 11, marginTop: 2 },
  searchWrap: { minHeight: 50, marginHorizontal: 14, paddingHorizontal: 13, backgroundColor: C.white, borderRadius: 15, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 9, zIndex: 3 },
  searchInput: { flex: 1, minHeight: 48, color: C.ink, fontSize: 13 },
  suggestions: { position: 'absolute', left: 14, right: 14, maxHeight: 235, zIndex: 10, backgroundColor: C.white, borderRadius: 14, borderColor: C.border, borderWidth: 1, elevation: 7 },
  suggestion: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: C.border },
  suggestionIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#F3F5F7', alignItems: 'center', justifyContent: 'center' }, suggestionText: { flex: 1, color: C.ink, fontSize: 12, lineHeight: 17 },
  mapWrap: { flex: 1, marginTop: 10, overflow: 'hidden', backgroundColor: '#E4E9EF' },
  mapHint: { position: 'absolute', top: 12, alignSelf: 'center', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 15, backgroundColor: 'rgba(20,43,74,0.92)' }, mapHintText: { color: C.white, fontSize: 11, fontWeight: '800' },
  selectedPin: { position: 'absolute', top: '50%', left: '50%', marginLeft: -18, marginTop: -38, alignItems: 'center' }, pinHead: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#D6A94F', borderWidth: 3, borderColor: C.white, alignItems: 'center', justifyContent: 'center', elevation: 5 }, pinTail: { width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 9, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#D6A94F', marginTop: -1 },
  gpsButton: { position: 'absolute', right: 13, top: 62, width: 44, height: 44, borderRadius: 14, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'android' ? 16 : 24, backgroundColor: C.white, borderTopWidth: 1, borderColor: C.border, gap: 9 },
  addressRow: { flexDirection: 'row', gap: 10, alignItems: 'center' }, addressIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#F3F5F7', alignItems: 'center', justifyContent: 'center' }, addressLabel: { color: '#142B4A', fontWeight: '900', fontSize: 9, letterSpacing: 1 }, addressValue: { color: C.ink, fontSize: 12, fontWeight: '700', marginTop: 2 }, lookup: { color: C.muted, fontSize: 10, marginTop: 2 },
  error: { color: '#B42318', fontSize: 11, lineHeight: 16 }, actions: { gap: 8 }, gpsTextButton: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, gpsText: { color: '#142B4A', fontSize: 12, fontWeight: '800' },
  confirm: { minHeight: 49, backgroundColor: '#142B4A', borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, disabled: { opacity: 0.45 }, confirmText: { color: C.white, fontWeight: '900', fontSize: 13 },
  privacy: { color: C.muted, fontSize: 9, lineHeight: 13, textAlign: 'center' },
});
