import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import NearbyMap from './NearbyMap';
import { api } from '../../src/lib/api';
import type { Service } from '../../src/lib/types';
import { CustomerLocationPicker, type ConfirmedCustomerLocation } from '../../src/components/CustomerLocationPicker';
import { locationToParams } from '../../src/lib/serviceLocation';
import { Button, C, Card, Chip, Empty, Loading, Page, Title } from '../../src/components/ui';
import { DateTimeField } from '../../src/components/DateTimeField';

type Professional = { id: string; name: string; photoUrl: string | null; serviceArea: string; services: string[]; serviceIds: string[]; skills: string[]; baseRate: number | null; rateCurrency: string | null; rating: number | null; reviewCount: number; availability: 'available' | 'busy' | 'needs_confirmation'; latitude: number | null; longitude: number | null; locationVisible: boolean; locationFreshness: 'live' | 'recent' | 'stale' | 'unknown'; locationUpdatedAt: string | null; distanceKm: number | null; distanceMeters: number | null; distanceLabel: string | null; distanceKind: 'straight_line'; verified: boolean; description?: string | null };
type Result = { professionals: Professional[]; total: number; returned: number; availabilitySource: string; demoData?: boolean };
type NearbyWorker = { worker: Professional; service: Service };
type Coordinate = { latitude: number; longitude: number };
type MapRegion = Coordinate & { latitudeDelta: number; longitudeDelta: number };
const initialDate = () => { const d = new Date(Date.now() + 48 * 3600000); d.setHours(9, 0, 0, 0); return d; };
const DEFAULT_REGION: MapRegion = { latitude: 8.9806, longitude: 38.7578, latitudeDelta: 0.09, longitudeDelta: 0.09 };

export default function NearbyScreen() {
  const router = useRouter();
  const [serviceLocation, setServiceLocation] = useState<ConfirmedCustomerLocation | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [center, setCenter] = useState<Coordinate | null>(null);
  const [region, setRegion] = useState<MapRegion>(DEFAULT_REGION);
  const [serviceId, setServiceId] = useState('');
  const [radius, setRadius] = useState(5);
  const [date, setDate] = useState(initialDate);
  const [listView, setListView] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const services = useQuery({ queryKey: ['services'], queryFn: () => api<{ services: Service[] }>('/services', {}, false) });
  const serviceList = services.data?.services ?? [];
  const lat = center?.latitude;
  const lon = center?.longitude;
  const nearbyQuery = useQuery({
    queryKey: ['nearby-professionals', serviceId, date.toISOString(), lat, lon, radius],
    enabled: lat !== undefined && lon !== undefined,
    staleTime: 15000,
    queryFn: ({ signal }) => api<Result>(`/professionals/nearby?latitude=${lat}&longitude=${lon}&radiusKm=${radius}&sort=distance&requestedStart=${encodeURIComponent(date.toISOString())}${serviceId ? `&serviceId=${encodeURIComponent(serviceId)}` : ''}`, { signal }, false),
  });
  const workers = useMemo(() => (nearbyQuery.data?.professionals ?? []).map(worker => ({
    worker,
    service: serviceList.find(service => worker.serviceIds.includes(service.id)) ?? serviceList[0],
  })).filter(item => !!item.service), [nearbyQuery.data?.professionals, serviceList]);
  const selected = workers.find(item => item.worker.id === selectedId);
  const loading = services.isLoading || nearbyQuery.isFetching;
  const error = services.error ?? nearbyQuery.error;

  const confirmLocation = (value: ConfirmedCustomerLocation) => {
    setServiceLocation(value);
    setCenter({ latitude: value.latitude, longitude: value.longitude });
    setRegion({ latitude: value.latitude, longitude: value.longitude, latitudeDelta: 0.045, longitudeDelta: 0.045 });
    setSelectedId(null);
    setPickerOpen(false);
  };
  const book = (item: NearbyWorker) => router.push({
    pathname: '/booking',
    params: {
      serviceId: item.service.id,
      workerId: item.worker.id,
      requestedStart: date.toISOString(),
      source: 'professional',
      ...(serviceLocation ? locationToParams(serviceLocation) : {}),
    },
  });
  const locationLabel = serviceLocation?.formattedAddress || (serviceLocation ? `${serviceLocation.latitude.toFixed(4)}, ${serviceLocation.longitude.toFixed(4)}` : 'Choose location');
  const shareLocation = () => Alert.alert(
    'Location sharing isn’t active yet',
    `Your location can be shared with ${selected?.worker.name || 'a professional'} only after an Operations accepted booking assigns them and both of you explicitly consent. This screen has not started sharing your location.`,
    [{ text: 'OK' }],
  );
  const serviceLabel = (name: string) => /electric/i.test(name) ? 'Electrician' : /plumb/i.test(name) ? 'Plumber' : /clean/i.test(name) ? 'Cleaner' : /garden|outdoor/i.test(name) ? 'Gardener' : name;

  return <View style={{ flex: 1 }}><Page style={{ gap: 12, paddingHorizontal: 14, paddingTop: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}><Title>Nearby</Title></View>
      <Pressable onPress={() => setPickerOpen(true)} accessibilityRole="button" accessibilityLabel="Choose service location" style={{ backgroundColor: '#F1F3F5', borderRadius: 22, paddingHorizontal: 13, minHeight: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}><Feather name="map-pin" color="#8B5E00" size={16}/><Text numberOfLines={1} style={{ maxWidth: 125, color: C.ink, fontWeight: '700', fontSize: 12 }}>{locationLabel}</Text></Pressable>
    </View>
    <Pressable onPress={() => setPickerOpen(true)} accessibilityRole="button" accessibilityLabel="Search for an address or landmark" style={{ minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 }}>
      <Feather name="search" size={18} color={C.muted}/>
      <Text style={{ flex: 1, color: serviceLocation ? C.ink : '#7B8490', fontSize: 13 }}>{serviceLocation ? 'Adjust the pin or search another place' : 'Search for an address or landmark'}</Text>
    </Pressable>
    {serviceLocation ? <Text style={{ color: C.slate, fontSize: 11, lineHeight: 16 }}>Confirmed pin: {locationLabel}. This is the location sent with a booking request. Adjust it if GPS is not the exact service entrance.</Text> : <Text style={{ color: C.muted, fontSize: 11, lineHeight: 16 }}>Choose GPS or search a place, then confirm the pin. Nearby results stay empty until a location is confirmed.</Text>}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 14 }}>
      <Chip title="●  All Pros" active={!serviceId} onPress={() => setServiceId('')}/>
      {serviceList.map(service => <Chip key={service.id} title={serviceLabel(service.name)} active={serviceId === service.id} onPress={() => setServiceId(service.id)}/>)}
    </ScrollView>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: C.navy, fontWeight: '900', fontSize: 13 }}>● {center ? workers.length : '—'} eligible nearby</Text>
      <View style={{ flexDirection: 'row', gap: 5 }}>{[2, 5, 10].map(km => <Chip key={km} title={`${km} km`} active={radius === km} onPress={() => setRadius(km)}/>)}</View>
    </View>
    <Pressable onPress={() => setShowSchedule(value => !value)} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 }}><Feather name="calendar" size={14} color={C.slate}/><Text style={{ color: C.slate, fontSize: 11, fontWeight: '700' }}>{showSchedule ? 'Hide visit time' : `Search for ${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</Text><Feather name={showSchedule ? 'chevron-up' : 'chevron-down'} size={14} color={C.slate}/></Pressable>
    {showSchedule ? <DateTimeField value={date} onChange={setDate}/> : null}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: C.muted, fontSize: 11 }}>View results</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}><Chip title="Map" active={!listView} onPress={() => setListView(false)}/><Chip title="Worker list" active={listView} onPress={() => setListView(true)}/></View>
    </View>

    {!listView ? <View style={{ height: 400, overflow: 'hidden', borderRadius: 23, borderWidth: 1, borderColor: C.border }}>
      <NearbyMap center={center} region={region} professionals={workers.map(x => x.worker)} selectedId={selectedId} showUserLocation={serviceLocation?.locationSource === 'gps'} onRegionChange={setRegion} onSelect={() => {}} onSelectProfessional={setSelectedId}/>
      <Pressable onPress={() => setPickerOpen(true)} accessibilityLabel="Choose or adjust service location" style={{ position: 'absolute', right: 12, top: 12, width: 46, height: 46, borderRadius: 15, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', elevation: 3 }}><Feather name="crosshair" size={20} color={C.navy}/></Pressable>
      <View style={{ position: 'absolute', left: 12, top: 12, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 20, backgroundColor: C.white }}><Text style={{ color: C.navy, fontWeight: '800', fontSize: 11 }}>{center ? `${workers.length} ELIGIBLE NEARBY` : 'CONFIRM A SERVICE LOCATION'}</Text></View>
      {center && workers.length > 0 && !selected ? <Pressable onPress={() => setListView(true)} style={{ position: 'absolute', left: 12, bottom: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18, backgroundColor: C.navy }}><Text style={{ color: C.white, fontSize: 12, fontWeight: '800' }}>Browse professionals</Text></Pressable> : null}
    </View> : null}

    {!center ? null : loading ? <Loading/> : error ? <Empty title="Nearby professionals could not load" body={error instanceof Error ? error.message : 'Try again when the network is available.'} action={<Button title="Retry" variant="outline" onPress={() => { void services.refetch(); void nearbyQuery.refetch(); }}/>} /> : !workers.length ? <Empty title="No eligible specialists found" body="Try a larger radius, another service, or another time. Availability is checked against verified skills, current schedules, and recent shared locations."/> : <View style={{ gap: 10 }}>
      {listView ? workers.map(({ worker, service }) => <Pressable key={worker.id} onPress={() => { setSelectedId(worker.id); setListView(false); }}>
        <Card style={{ borderColor: selected?.worker.id === worker.id ? C.gold : C.border, flexDirection: 'row', alignItems: 'center', padding: 13 }}>
          {worker.photoUrl ? <Image source={{ uri: worker.photoUrl }} style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: C.canvas }}/> : <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFF2DB', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#8B5E00', fontWeight: '900', fontSize: 20 }}>{worker.name.slice(0,1).toUpperCase()}</Text></View>}
          <View style={{ flex: 1, paddingHorizontal: 11, gap: 3 }}>
            <Text numberOfLines={1} style={{ color: C.navy, fontWeight: '900', fontSize: 14 }}>{worker.name}</Text>
            <Text numberOfLines={1} style={{ color: C.slate, fontSize: 11 }}>{service.name} · {worker.serviceArea || 'Addis Ababa'}</Text>
            <Text style={{ color: worker.availability === 'available' ? C.green : C.muted, fontSize: 11, fontWeight: '800' }}>{worker.availability.replaceAll('_',' ')}{worker.distanceLabel ? ` · ${worker.distanceLabel} straight-line` : ''}{worker.rating != null && worker.reviewCount ? ` · ★ ${worker.rating.toFixed(1)} (${worker.reviewCount})` : ''}</Text>
            <Text style={{ color: C.muted, fontSize: 10 }}>Location {worker.locationFreshness}; updated {worker.locationUpdatedAt ? new Date(worker.locationUpdatedAt).toLocaleTimeString() : 'unknown'}</Text>
            {worker.baseRate != null ? <Text style={{ color: '#7B5804', fontSize: 11, fontWeight: '800' }}>{worker.baseRate.toLocaleString()} {worker.rateCurrency}{worker.rateCurrency ? '/hr' : ''}</Text> : null}
          </View>
          <Feather name="chevron-right" size={18} color={C.muted}/>
        </Card>
      </Pressable>) : null}
      {selected ? <Card style={{ borderColor: '#E7D6AC' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {selected.worker.photoUrl ? <Image source={{ uri: selected.worker.photoUrl }} style={{ width: 55, height: 55, borderRadius: 28, backgroundColor: C.canvas }}/> : null}
          <View style={{ flex: 1, gap: 3 }}><Text style={{ color: C.navy, fontSize: 16, fontWeight: '900' }}>{selected.worker.name}</Text><Text style={{ color: C.slate, fontSize: 12 }}>{selected.service.name} specialist</Text>{selected.worker.rating != null && selected.worker.reviewCount > 0 ? <Text style={{ color: '#8B5E00', fontSize: 12, fontWeight: '800' }}>★ {selected.worker.rating.toFixed(1)} · {selected.worker.reviewCount} reviews</Text> : null}</View>
          <Pressable onPress={() => Alert.alert(selected.worker.name, `${selected.worker.skills.join(', ')}\n${selected.worker.serviceArea || 'Addis Ababa'}`)}><Text style={{ color: '#8B5E00', fontWeight: '800' }}>Profile</Text></Pressable>
        </View>
        <Text style={{ color: C.slate, fontSize: 12, lineHeight: 18 }}>Verified service qualification · {selected.worker.availability.replaceAll('_',' ')}{selected.worker.distanceLabel ? ` · ${selected.worker.distanceLabel} straight-line away` : ''}{selected.worker.locationUpdatedAt ? `\nLocation updated ${new Date(selected.worker.locationUpdatedAt).toLocaleString()} (${selected.worker.locationFreshness})` : ''}{selected.worker.services.length ? `\nServices: ${selected.worker.services.join(' · ')}` : ''}{selected.worker.skills.length ? `\nSkills: ${selected.worker.skills.join(' · ')}` : ''}{selected.worker.baseRate != null ? `\nRate: ${selected.worker.baseRate.toLocaleString()} ${selected.worker.rateCurrency || 'ETB'}` : ''}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}><Button title="Request" onPress={() => book(selected)} style={{ flex: 1 }}/><Button title="Share location" variant="outline" icon={<Feather name="navigation" color={C.navy} size={16}/>} onPress={shareLocation} style={{ flex: 1 }}/></View>
        <Text style={{ color: C.muted, fontSize: 10, lineHeight: 15 }}>Your request goes to Meraki Operations for review. Seeing a professional here does not confirm an appointment.</Text>
      </Card> : null}
    </View>}
    {services.data?.services.length ? <Text style={{ color: C.muted, fontSize: 10, lineHeight: 15 }}>Worker GPS is kept private until an assigned booking has mutual location-sharing consent.</Text> : null}
  </Page>
    <CustomerLocationPicker visible={pickerOpen} initial={serviceLocation || undefined} onClose={() => setPickerOpen(false)} onConfirm={confirmLocation}/>
    <Pressable accessibilityRole="button" accessibilityLabel="Open Agaz assistant" onPress={() => router.push('/assistant')} style={{ position: 'absolute', right: 16, bottom: 14, width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#253B4D', backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', elevation: 7, shadowColor: '#00152A', shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}><Feather name="star" size={21} color="#FFE0A0" /><View style={{ position: 'absolute', right: -1, top: -1, minWidth: 19, height: 19, paddingHorizontal: 3, borderRadius: 10, borderWidth: 1, borderColor: C.white, backgroundColor: '#D4A853', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.navy, fontSize: 9, fontWeight: '900' }}>AI</Text></View></Pressable></View>;
}
