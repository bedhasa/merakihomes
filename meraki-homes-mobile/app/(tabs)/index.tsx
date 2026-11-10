import React, { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { API_BASE_URL, api, ApiError } from '../../src/lib/api';
import type { Address, Booking, Service } from '../../src/lib/types';
import { Button, C, Card, Empty, Loading, Page } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { loadWorkerDirectory } from '../../src/lib/workerDirectory';
import { HOME_PROMOTIONS_QUERY_KEY, fetchHomePromotions, type PromotionSummary } from '../../src/lib/promotions';

function serviceIcon(name: string): ComponentProps<typeof Feather>['name'] {
  const value = name.toLowerCase();
  if (/clean|maid|laundry/.test(value)) return 'wind';
  if (/plumb|water/.test(value)) return 'tool';
  if (/electric|solar/.test(value)) return 'zap';
  if (/cook|food/.test(value)) return 'coffee';
  if (/garden|outdoor/.test(value)) return 'feather';
  if (/child|nanny/.test(value)) return 'smile';
  return 'home';
}

function servicePrice(service: Service) {
  if (service.pricing_type === 'quotation') return 'Quote';
  return `${service.basePrice.toLocaleString()} ${service.currency}`;
}

const teamPromo = require('../../assets/meraki-team-promo.jpg');
type PromoOffer = { id: string; title: string; body: string; code: string; imageUrl?: string; mobileImageUrl?: string; image?: number; service?: Service };

const fallbackOffers: PromoOffer[] = [
  { id: 'seasonal', title: 'A fresh season, a fresher home', body: 'Ask our team about current home-care offers and available service packages.', image: teamPromo, code: 'SEASONAL CARE' },
  { id: 'clean-home', title: 'Make room for a little more calm', body: 'Explore home cleaning options, with scope and pricing confirmed before booking.', image: require('../../assets/promo-cleaning.jpg'), code: 'HOME REFRESH' },
  { id: 'garden', title: 'Give your garden a good day', body: 'Discover outdoor care options sized around your space and priorities.', image: require('../../assets/promo-garden.jpg'), code: 'GARDEN CARE' },
];

function PromoCarousel({ services, width, onBrowse, onService, promotions }: { services: Service[]; width: number; onBrowse: () => void; onService: (service: Service) => void; promotions: PromotionSummary[] }) {
  const scroll = useRef<ScrollViewInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useMemo(() => [
    ...((promotions.length ? promotions : fallbackOffers) as PromoOffer[]).map(offer => ({ ...offer, image: offer.mobileImageUrl ? { uri: offer.mobileImageUrl } : offer.imageUrl ? { uri: offer.imageUrl } : (offer.image ?? teamPromo) })),
    ...services.slice(0, 2).map(service => ({ id: service.id, title: service.name, body: service.description, image: service.image ? { uri: service.image } : teamPromo, code: 'SERVICE SPOTLIGHT', service })),
  ], [services, promotions]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setActiveIndex(current => {
      const next = (current + 1) % slides.length;
      scroll.current?.scrollTo({ x: next * width, animated: true });
      return next;
    }), 5200);
    return () => clearInterval(timer);
  }, [slides.length, width]);

  return <View style={{ gap: 10 }}>
    <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false} decelerationRate="fast" onMomentumScrollEnd={event => setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width))}>
      {slides.map(slide => <Pressable key={slide.id} onPress={() => slide.service ? onService(slide.service) : onBrowse()} style={{ width, height: 190, borderRadius: 22, overflow: 'hidden', backgroundColor: C.navy }}>
        <ImageBackground source={slide.image} resizeMode="cover" style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4, 24, 43, 0.62)' }} />
          <View style={{ padding: 17, gap: 9 }}>
            <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,224,160,0.95)', flexDirection: 'row', alignItems: 'center', gap: 6 }}><Feather name="star" size={12} color="#785601" /><Text style={{ color: '#5B4000', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 }}>{slide.service ? 'SERVICE SPOTLIGHT' : slide.code}</Text></View>
            <Text numberOfLines={2} style={{ color: C.white, fontSize: 20, lineHeight: 25, fontWeight: '900', maxWidth: '88%' }}>{slide.title}</Text>
            <Text numberOfLines={2} style={{ color: '#E0E8EF', fontSize: 12, lineHeight: 17, maxWidth: '88%' }}>{slide.body}</Text>
          </View>
          <View style={{ paddingHorizontal: 17, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text numberOfLines={1} style={{ color: '#FFE0A0', fontSize: 10, fontWeight: '700', flex: 1 }}>{slide.service ? 'See details & pricing' : slide.code}</Text>
            <View style={{ minHeight: 35, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#FFE0A0', flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={{ color: C.navy, fontSize: 11, fontWeight: '800' }}>{slide.service ? 'Explore' : 'Browse'}</Text><Feather name="arrow-right" size={14} color={C.navy} /></View>
          </View>
        </ImageBackground>
      </Pressable>)}
    </ScrollView>
    <View accessibilityLabel={`Promotion ${activeIndex + 1} of ${slides.length}`} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
      {slides.map((slide, index) => <View key={slide.id} style={{ width: index === activeIndex ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: index === activeIndex ? C.navy : '#C5CBD2' }} />)}
    </View>
  </View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const { customer } = useAuth();
  const { width } = useWindowDimensions();
  const services = useQuery({ queryKey: ['services'], queryFn: () => api<{ services: Service[] }>('/services', {}, false) });
  const bookings = useQuery({ queryKey: ['bookings'], queryFn: () => api<{ bookings: Booking[] }>('/customers/me/bookings'), enabled: !!customer });
  const addresses = useQuery({ queryKey: ['addresses'], queryFn: () => api<{ addresses: Address[] }>('/customers/me/addresses'), enabled: !!customer });
  const catalog = services.data?.services ?? [];
  const promotionQuery = useQuery({ queryKey: HOME_PROMOTIONS_QUERY_KEY, queryFn: fetchHomePromotions });
  const matchingWorkers = useQuery({
    queryKey: ['home-top-workers'],
    queryFn: () => loadWorkerDirectory(catalog),
    enabled: !services.isLoading && !services.isError,
  });
  const active = bookings.data?.bookings.find(item => !['completed', 'cancelled', 'rejected'].includes(item.status));
  const defaultAddress = addresses.data?.addresses.find(item => item.isDefault) ?? addresses.data?.addresses[0];
  const topWorkers = matchingWorkers.data?.workers.slice(0, 4) ?? [];
  const firstName = customer?.name?.trim().split(/\s+/)[0];
  const carouselWidth = Math.min(width, 640) - 40;

  const openService = (service: Service) => router.push({ pathname: '/service/[id]', params: { id: service.id } });

  return <View style={{ flex: 1, backgroundColor: C.canvas }}><Page style={{ width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 100, gap: 23 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.muted, fontSize: 14 }}>{customer ? 'Welcome back,' : 'Welcome to Meraki,'}</Text>
        <Text style={{ color: C.navy, fontSize: 25, lineHeight: 31, fontWeight: '800' }}>{customer ? firstName : 'Find home care'}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Choose a service location" onPress={() => router.push(customer && defaultAddress ? '/(tabs)/profile' : '/(tabs)/nearby')} style={{ minHeight: 42, maxWidth: '60%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, borderRadius: 24, backgroundColor: C.white, borderColor: C.border, borderWidth: 1 }}>
        <Feather name="map-pin" size={15} color="#8B5E00" />
        <Text numberOfLines={1} style={{ flexShrink: 1, color: C.ink, fontSize: 12, fontWeight: '600' }}>{defaultAddress ? `${defaultAddress.area || defaultAddress.subCity}, ${defaultAddress.city}` : 'Choose location'}</Text>
        <Feather name="chevron-down" size={15} color={C.muted} />
      </Pressable>
    </View>

    {!API_BASE_URL ? <Empty title="API URL is not configured" body="Set EXPO_PUBLIC_API_URL in meraki-homes-mobile/.env.local to your computer’s LAN address, for example http://192.168.x.x:5002/api, then restart Expo." /> : null}
    {active ? <Pressable onPress={() => router.push({ pathname: '/booking-details/[reference]', params: { reference: active.reference } })}>
      <Card style={{ padding: 12, borderColor: '#ECEFF2', flexDirection: 'row', alignItems: 'center', gap: 11 }}>
        <View style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F4F6' }}><Feather name="clipboard" size={19} color={C.navy} /></View>
        <View style={{ flex: 1, gap: 3 }}><Text style={{ color: C.navy, fontSize: 13, fontWeight: '800' }}>Your service request</Text><Text numberOfLines={1} style={{ color: C.muted, fontSize: 11 }}>{active.service_name} · {active.status.replaceAll('_', ' ')}</Text></View>
        <View style={{ minHeight: 40, paddingHorizontal: 12, borderRadius: 14, backgroundColor: C.navy, justifyContent: 'center' }}><Text style={{ color: C.white, fontWeight: '700', fontSize: 12 }}>Track</Text></View>
      </Card>
    </Pressable> : null}

    <PromoCarousel services={catalog} width={carouselWidth} onBrowse={() => router.push('/(tabs)/services')} onService={openService} promotions={promotionQuery.data||[]} />

    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: C.ink, fontSize: 18, fontWeight: '800' }}>Services</Text><Pressable onPress={() => router.push('/(tabs)/services')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}><Text style={{ color: '#7B5804', fontSize: 12, fontWeight: '700' }}>View all</Text><Feather name="chevron-right" size={15} color="#7B5804" /></Pressable></View>
      {services.isLoading ? <Loading /> : services.isError ? <Empty title="Services could not load" body={services.error instanceof ApiError ? services.error.message : 'Check the connection and try again.'} action={<Button title="Retry" variant="outline" onPress={() => void services.refetch()} />} /> : catalog.length === 0 ? <Empty title="No services available" body="The catalogue will appear here when available." /> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
        {catalog.slice(0, 4).map(service => <Pressable key={service.id} onPress={() => openService(service)} style={{ width: '48%', minHeight: 86, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, borderColor: '#ECEFF2', borderWidth: 1 }}>
          <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF2DB' }}><Feather name={serviceIcon(service.name)} size={20} color="#8B5E00" /></View>
          <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
            <Text numberOfLines={2} style={{ color: C.ink, fontSize: 11, lineHeight: 14, fontWeight: '700' }}>{service.name}</Text>
            <Text numberOfLines={1} style={{ color: C.muted, fontSize: 10 }}>{servicePrice(service)}</Text>
          </View>
        </Pressable>)}
      </View>}
    </View>

    <Pressable accessibilityRole="button" accessibilityLabel="Chat with Merk, your Meraki Homes assistant" onPress={() => router.push('/assistant')}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: C.navy, borderColor: C.gold }}>
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#F7D37E', alignItems: 'center', justifyContent: 'center' }}><Feather name="star" size={20} color={C.navy} /></View>
        <View style={{ flex: 1, gap: 3 }}><Text style={{ color: '#F7D37E', fontSize: 14, fontWeight: '900' }}>Ask Merk</Text><Text style={{ color: C.white, fontSize: 11 }}>Your Meraki Homes Assistant</Text></View>
        <Feather name="arrow-right" size={18} color="#F7D37E" />
      </Card>
    </Pressable>

    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: C.ink, fontSize: 18, fontWeight: '800' }}>Top specialists</Text><Pressable accessibilityRole="button" onPress={() => router.push('/workers')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}><Text style={{ color: '#7B5804', fontSize: 12, fontWeight: '700' }}>View all</Text><Feather name="chevron-right" size={15} color="#7B5804" /></Pressable></View>
      {matchingWorkers.isLoading ? <Loading /> : matchingWorkers.isError ? <Text style={{ color: C.slate, fontSize: 12 }}>Specialists could not load right now.</Text> : <View style={{ gap: 9 }}>
        {topWorkers.map(worker => <Card key={worker.id} style={{ minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderColor: '#ECEFF2' }}>
          {worker.photoUrl ? <Image source={{ uri: worker.photoUrl }} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F3F5' }} /> : <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF2DB' }}><Feather name="user" size={21} color="#8B5E00" /></View>}
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}><Text numberOfLines={1} style={{ color: C.ink, fontSize: 13, fontWeight: '800' }}>{worker.name}</Text><Text numberOfLines={1} style={{ color: C.muted, fontSize: 10 }}>{worker.skills.slice(0, 2).join(' · ') || worker.serviceArea || 'Meraki specialist'}</Text><Text style={{ color: '#7B5804', fontSize: 11, fontWeight: '700' }}>{worker.rating != null ? `★ ${worker.rating.toFixed(1)} (${worker.reviewCount})` : 'New specialist'}{worker.isDemo ? ' · Demo' : ''}</Text></View>
        </Card>)}
        {!topWorkers.length ? <Text style={{ color: C.muted, fontSize: 12 }}>Specialists will appear here as profiles are added.</Text> : null}
      </View>}
    </View>

    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: C.ink, fontSize: 13, fontWeight: '800' }}>THE MERAKI PROMISE</Text><Text style={{ color: '#7B5804', fontSize: 11, fontWeight: '700' }}>Care you can trust</Text></View>
      <View style={{ flexDirection: 'row', gap: 9 }}>
        {([{ icon: 'user-check', label: 'Verified worker skills' }, { icon: 'shield', label: 'Thoughtful matching' }, { icon: 'check-circle', label: 'Price agreed first' }] satisfies Array<{ icon: ComponentProps<typeof Feather>['name']; label: string }>).map(({ icon, label }) => <View key={label} style={{ flex: 1, minHeight: 69, paddingHorizontal: 4, borderRadius: 17, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.white }}><Feather name={icon} size={17} color="#8B5E00" /><Text numberOfLines={2} style={{ color: C.ink, textAlign: 'center', fontSize: 9, fontWeight: '600' }}>{label}</Text></View>)}
      </View>
    </View>

  </Page><Pressable accessibilityRole="button" accessibilityLabel="Open Merk assistant" onPress={() => router.push('/assistant')} style={{ position: 'absolute', right: 16, bottom: 14, minWidth: 118, height: 50, paddingHorizontal: 14, borderRadius: 25, borderWidth: 1, borderColor: '#253B4D', backgroundColor: C.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 7, shadowColor: '#00152A', shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}><Feather name="star" size={19} color="#FFE0A0" /><Text style={{ color: C.white, fontSize: 12, fontWeight: '800' }}>Merk AI</Text></Pressable></View>;
}
