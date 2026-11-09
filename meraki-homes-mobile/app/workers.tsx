import React, { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '../src/lib/api';
import type { Service } from '../src/lib/types';
import { loadWorkerDirectory } from '../src/lib/workerDirectory';
import { Button, C, Card, Chip, Empty, Loading, Page, Title } from '../src/components/ui';

export default function WorkersScreen() {
  const router = useRouter();
  const [serviceId, setServiceId] = useState('all');
  const services = useQuery({ queryKey: ['services'], queryFn: () => api<{ services: Service[] }>('/services', {}, false) });
  const workers = useQuery({
    queryKey: ['workers-directory', serviceId],
    enabled: !services.isLoading && !services.isError,
    queryFn: () => loadWorkerDirectory(services.data?.services ?? [], serviceId),
  });
  const service = services.data?.services.find(item => item.id === serviceId);

  return <Page style={{ width: '100%', maxWidth: 640, alignSelf: 'center' }}>
    <Title subtitle="Browse top-rated professionals by service.">Specialists</Title>
    {services.isLoading ? <Loading /> : services.isError ? <Empty title="Services could not load" body="We could not load service filters." action={<Button title="Retry" variant="outline" onPress={() => void services.refetch()} />} /> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
      <Chip title="All" active={serviceId === 'all'} onPress={() => setServiceId('all')} />
      {(services.data?.services ?? []).map(item => <Chip key={item.id} title={item.name} active={serviceId === item.id} onPress={() => setServiceId(item.id)} />)}
    </ScrollView>}
    {workers.isLoading ? <Loading /> : workers.isError ? <Empty title="Specialists could not load" body={workers.error instanceof Error ? workers.error.message : 'Check your connection and retry.'} action={<Button title="Retry" variant="outline" onPress={() => void workers.refetch()} />} /> : workers.data?.workers.length ? <View style={{ gap: 10 }}>
      {workers.data.demoData ? <Text style={{ color: '#785601', backgroundColor: '#FFF2DB', borderRadius: 12, padding: 10, fontSize: 11, lineHeight: 16 }}>Profiles marked Demo are sample data for the prototype.</Text> : null}
      <Text style={{ color: C.muted, fontSize: 11 }}>{workers.data.workers.length} specialists, sorted by rating</Text>
      {workers.data.workers.map(worker => <Card key={worker.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 }}>
        {worker.photoUrl ? <Image source={{ uri: worker.photoUrl }} style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: C.canvas }} /> : <View style={{ width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF2DB' }}><Text style={{ color: '#8B5E00', fontSize: 21, fontWeight: '800' }}>{worker.name.slice(0, 1).toUpperCase()}</Text></View>}
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text numberOfLines={1} style={{ color: C.navy, fontWeight: '900', fontSize: 14 }}>{worker.name}</Text>
          <Text numberOfLines={2} style={{ color: C.slate, fontSize: 11 }}>{worker.skills.join(', ') || worker.serviceArea || 'Meraki specialist'}</Text>
          <Text style={{ color: '#7B5804', fontSize: 11, fontWeight: '800' }}>{worker.rating != null ? `★ ${worker.rating.toFixed(1)} (${worker.reviewCount} reviews)` : 'New specialist'}{worker.isDemo ? ' · Demo' : ''}</Text>
          <Text style={{ color: C.muted, fontSize: 10 }}>{worker.serviceArea || 'Addis Ababa'}</Text>
        </View>
        {service ? <Button title="Request" variant="navy" style={{ minHeight: 38, paddingHorizontal: 10 }} onPress={() => router.push({ pathname: '/booking', params: { serviceId: service.id, source: 'professional' } })} /> : null}
      </Card>)}
    </View> : <Empty title="No specialists yet" body={service ? `No specialists are listed for ${service.name} yet.` : 'Specialist profiles will appear here when available.'} />}
  </Page>;
}
