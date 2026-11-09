import React, { useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/lib/api';
import type { Service, ServicePackage, Worker } from '../../src/lib/types';
import { FALLBACK_QUESTIONS, type ServiceQuestion } from '../../src/lib/questions';
import { Button, C, Card, Empty, Loading, Page } from '../../src/components/ui';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Detail = { service: Service; packages: ServicePackage[]; questions: ServiceQuestion[] };
const initialVisit = () => {
  const date = new Date(Date.now() + 48 * 60 * 60 * 1000);
  date.setHours(9, 0, 0, 0);
  return date;
};

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [requestedStart] = useState(initialVisit);
  const query = useQuery({ queryKey: ['service', id], queryFn: () => api<Detail>(`/services/${encodeURIComponent(id)}`, {}, false), enabled: !!id });
  const detail = query.data;
  const service = detail?.service;
  const packages = detail?.packages ?? [];
  const selectedPackage = packages.find(item => item.id === selectedPackageId) ?? packages[0];
  const duration = selectedPackage?.durationMinutes ?? service?.durationMinutes ?? 60;
  const workerQuery = useQuery({
    queryKey: ['service-detail-workers', id, requestedStart.toISOString(), duration],
    enabled: !!service,
    queryFn: () => api<{ workers: Worker[]; demoData?: boolean }>(`/workers/eligible?serviceId=${encodeURIComponent(id)}&requestedStart=${encodeURIComponent(requestedStart.toISOString())}&durationMinutes=${duration}`, {}, false),
  });
  const worker = useMemo(() => workerQuery.data?.workers.find(item => item.availability === 'available') ?? workerQuery.data?.workers[0], [workerQuery.data]);

  useEffect(() => {
    if (packages.length && !packages.some(item => item.id === selectedPackageId)) setSelectedPackageId(packages[0].id);
  }, [packages, selectedPackageId]);

  const continueToBooking = () => router.push({ pathname: '/booking', params: { serviceId: id, source: selectedPackage ? 'package' : 'service', ...(selectedPackage ? { packageId: selectedPackage.id } : {}) } });

  if (query.isLoading) return <Page><Loading /></Page>;
  if (query.isError || !service) return <Page><Empty title="Service details unavailable" body="This service could not be loaded from the live catalogue." action={<Button title="Try again" variant="outline" onPress={() => void query.refetch()} />} /></Page>;

  const questions = detail!.questions.length ? detail!.questions : FALLBACK_QUESTIONS[id] ?? [];
  const hasRating = (service.reviewsCount ?? 0) > 0 && service.rating != null;

  return <View style={{ flex:  1, backgroundColor: C.canvas }}>
    <Page style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 164, gap: 16 }}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={{ alignSelf: 'flex-start', minHeight: 36, paddingHorizontal: 12, borderRadius: 18, backgroundColor: C.white, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        <Feather name="chevron-left" size={17} color={C.navy} /><Text style={{ color: C.navy, fontSize: 12, fontWeight: '800' }}>All services</Text>
      </Pressable>

      <Card style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
        <ImageBackground source={service.image ? { uri: service.image } : undefined} style={{ height: 205, justifyContent: 'space-between', backgroundColor: C.navy }} resizeMode="cover">
          <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(4,24,43,0.20)' }} />
          <View style={{ padding: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, backgroundColor: C.white, flexDirection: 'row', alignItems: 'center', gap: 5 }}><Feather name={hasRating ? 'star' : 'message-circle'} size={13} color="#8B5E00" /><Text style={{ color: C.navy, fontSize: 11, fontWeight: '800' }}>{hasRating ? `${service.rating!.toFixed(1)} (${service.reviewsCount} reviews)` : 'New · No reviews yet'}</Text></View>
            <View style={{ paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, backgroundColor: 'rgba(20,43,74,0.88)', flexDirection: 'row', alignItems: 'center', gap: 5 }}><Feather name="clock" size={13} color="#FFE0A0" /><Text style={{ color: C.white, fontSize: 11, fontWeight: '800' }}>{duration < 60 ? `${duration} min` : `${(duration / 60).toFixed(duration % 60 ? 1 : 0)} hr`} est.</Text></View>
          </View>
          <View style={{ padding: 13, alignItems: 'flex-end' }}><View style={{ paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, backgroundColor: '#8B5E00', flexDirection: 'row', alignItems: 'center', gap: 5 }}><Feather name="shield" size={13} color="#FFE0A0" /><Text style={{ color: C.white, fontSize: 11, fontWeight: '800' }}>Meraki reviewed</Text></View></View>
        </ImageBackground>
        <View style={{ padding: 16, gap: 11 }}>
          <Text style={{ color: C.navy, fontSize: 22, lineHeight: 28, fontWeight: '900' }}>{service.name}</Text>
          <Text style={{ color: C.slate, fontSize: 14, lineHeight: 21 }}>{service.description}</Text>
          <View style={{ flexDirection: 'row', gap: 7 }}>
            {[{ icon: 'check-circle', text: 'Scope confirmed first' }, { icon: 'shield', text: 'Request reviewed' }, { icon: 'credit-card', text: 'No upfront charge' }].map(item => <View key={item.text} style={{ flex: 1, minHeight: 48, paddingHorizontal: 5, borderRadius: 14, backgroundColor: '#F1F3F5', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 }}><Feather name={item.icon as 'shield'} size={14} color="#8B5E00" /><Text numberOfLines={2} style={{ flexShrink: 1, color: C.navy, fontSize: 9, fontWeight: '700' }}>{item.text}</Text></View>)}
          </View>
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingBottom: 10, borderBottomWidth: 1, borderColor: C.border }}><Feather name="list" size={19} color="#8B5E00" /><Text style={{ flex: 1, color: C.navy, fontSize: 18, fontWeight: '900' }}>Before we confirm</Text><View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: '#FFF2DB' }}><Text style={{ color: '#785601', fontSize: 10, fontWeight: '800' }}>Clear process</Text></View></View>
        {[
          ['Scope and timing', 'Share the work details and preferred time; Operations checks availability.'],
          ['Price approval', 'Any final quote or proposed change is shared with you before confirmation.'],
          ['Your choice', 'Review the request details and approve changes before the booking is confirmed.'],
        ].map(([title, body]) => <View key={title} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}><View style={{ width: 23, height: 23, borderRadius: 12, backgroundColor: '#F2EBDD', alignItems: 'center', justifyContent: 'center' }}><Feather name="check" size={14} color="#8B5E00" /></View><View style={{ flex: 1, gap: 3 }}><Text style={{ color: C.navy, fontSize: 13, fontWeight: '800' }}>{title}</Text><Text style={{ color: C.slate, fontSize: 12, lineHeight: 18 }}>{body}</Text></View></View>)}
        <View style={{ padding: 12, borderRadius: 15, backgroundColor: '#F1F3F5', flexDirection: 'row', alignItems: 'center', gap: 9 }}><Feather name="info" size={18} color="#8B5E00" /><Text style={{ flex: 1, color: C.slate, fontSize: 11, lineHeight: 17 }}>Submitting a request does not create a confirmed appointment or initiate payment.</Text></View>
      </Card>

      {packages.length > 0 ? <View style={{ gap: 10 }}>
        <View style={{ paddingHorizontal: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: C.navy, fontSize: 19, fontWeight: '900' }}>Select a package</Text><Text style={{ color: C.muted, fontSize: 11 }}>Live catalogue</Text></View>
        {packages.map(item => {
          const active = (selectedPackage?.id ?? selectedPackageId) === item.id;
          return <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => setSelectedPackageId(item.id)}><Card style={{ padding: 14, borderWidth: active ? 2 : 1, borderColor: active ? C.gold : C.border, flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <Feather name={active ? 'check-circle' : 'circle'} size={21} color={active ? C.gold : '#B9BEC4'} />
            <View style={{ flex: 1, minWidth: 0, gap: 4 }}><Text style={{ color: C.navy, fontSize: 15, fontWeight: '900' }}>{item.name}</Text><Text numberOfLines={2} style={{ color: C.slate, fontSize: 11, lineHeight: 16 }}>{item.description}</Text><Text style={{ color: C.muted, fontSize: 10 }}>{item.durationMinutes} min estimated</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={{ color: active ? C.navy : C.navy, fontSize: 18, fontWeight: '900' }}>{item.basePrice.toLocaleString()}</Text><Text style={{ color: C.muted, fontSize: 10 }}>{item.currency}</Text></View>
          </Card></Pressable>;
        })}
      </View> : <Card><Text style={{ color: C.navy, fontSize: 15, fontWeight: '800' }}>Price after scope review</Text><Text style={{ color: C.slate, fontSize: 12, lineHeight: 18 }}>This service is quoted after the work details are reviewed with you.</Text></Card>}

      {questions.length ? <Card><Text style={{ color: C.navy, fontSize: 15, fontWeight: '900' }}>Details we’ll ask for</Text>{questions.map(question => <View key={question.id ?? question.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Feather name="check" size={15} color="#8B5E00" /><Text style={{ flex: 1, color: C.slate, fontSize: 12 }}>{question.label}{question.required ? ' · required' : ''}</Text></View>)}</Card> : null}

      {worker ? <Card style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {worker.photoUrl ? <Image source={{ uri: worker.photoUrl }} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.canvas }} /> : <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF2DB', alignItems: 'center', justifyContent: 'center' }}><Feather name="user" size={20} color="#8B5E00" /></View>}
        <View style={{ flex: 1, gap: 3 }}><Text style={{ color: C.navy, fontSize: 13, fontWeight: '900' }}>{worker.name}</Text><Text numberOfLines={1} style={{ color: C.slate, fontSize: 10 }}>{worker.skills.slice(0, 2).join(' · ') || worker.serviceArea}</Text><Text style={{ color: C.muted, fontSize: 10 }}>{worker.rating != null && worker.reviewCount > 0 ? `★ ${worker.rating.toFixed(1)} · ${worker.reviewCount} reviews` : 'No reviews yet'}{workerQuery.data?.demoData ? ' · Sample profile' : ''}</Text></View>
        <Feather name="check-circle" size={18} color="#8B5E00" />
      </Card> : workerQuery.isError ? <Card style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Feather name="info" size={17} color={C.muted} /><Text style={{ flex: 1, color: C.muted, fontSize: 11 }}>Specialist availability is checked when you request a service.</Text></Card> : null}
    </Page>

    <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.white, borderTopWidth: 1, borderColor: '#EEF0F2' }}>
      <View style={{ minHeight: 82, paddingHorizontal: 18, paddingTop: 11, paddingBottom: Math.max(insets.bottom ? 0 : 8, 8), flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}><Text style={{ color: C.muted, fontSize: 11, fontWeight: '700' }}>{selectedPackage ? 'PACKAGE PRICE' : 'PRICE'}</Text><Text numberOfLines={1} style={{ color: C.navy, fontSize: 20, fontWeight: '900' }}>{selectedPackage ? `${selectedPackage.basePrice.toLocaleString()} ${selectedPackage.currency}` : 'Quote after review'}</Text>{selectedPackage ? <Text numberOfLines={1} style={{ color: '#785601', fontSize: 10 }}>{selectedPackage.name}</Text> : null}</View>
        <Button title={selectedPackage ? `Book ${selectedPackage.name}` : 'Request service'} onPress={continueToBooking} style={{ flex: 1, minHeight: 54 }} />
      </View>
    </SafeAreaView>
  </View>;
}
