import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { api, ApiError, postJson } from '../../src/lib/api';
import type { Booking } from '../../src/lib/types';
import { Button, C, Card, Chip, Empty, ErrorBanner, Field, Loading, Page, Title } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';

type BookingTab = 'new' | 'track';
type LookupBooking = { reference: string; status: string; serviceName: string; requestedStart: string; createdAt: string; totalAmount: number | string | null; currency: string; amountPaid: number | string; remainingBalance: number | string };
type LookupResponse = { booking?: LookupBooking; bookings?: LookupBooking[]; demoVerificationNotice?: string };

export default function BookingsScreen() {
  const { customer } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<BookingTab>('new');
  const [lookupMode, setLookupMode] = useState<'reference' | 'phone'>('reference');
  const [reference, setReference] = useState('');
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState<LookupBooking[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [looking, setLooking] = useState(false);
  const q = useQuery({ queryKey: ['bookings'], queryFn: () => api<{ bookings: Booking[] }>('/customers/me/bookings'), enabled: !!customer && tab === 'track' });

  const lookup = async () => {
    setError(''); setNotice(''); setResults([]); setSelected(null); setLooking(true);
    try {
      const data = await api<LookupResponse>('/bookings/lookup', postJson(lookupMode === 'reference'
        ? { mode: 'reference', reference: reference.trim().toUpperCase() }
        : { mode: 'phone', phone: phone.trim() }), false);
      const found = data.bookings || (data.booking ? [data.booking] : []);
      setResults(found); setNotice(data.demoVerificationNotice || '');
      if (!found.length) setError(lookupMode === 'phone' ? 'No bookings were found for that phone number.' : 'No booking matches that reference.');
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not look up bookings. Check the number or reference and try again.'); }
    finally { setLooking(false); }
  };

  return <Page>
    <Title subtitle="Book a service or check a request you already sent.">Bookings</Title>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Chip title="New booking" active={tab === 'new'} onPress={() => setTab('new')} />
      <Chip title="Track booking" active={tab === 'track'} onPress={() => setTab('track')} />
    </View>
    {tab === 'new' ? <>
      <Card>
        <Text style={{ color: C.navy, fontSize: 17, fontWeight: '900' }}>Book a home service</Text>
        <Text style={{ color: C.slate, fontSize: 13, lineHeight: 20 }}>Choose a service, tell us what you need, pick a preferred specialist, and send your request. You can choose a full or partial demo payment after submission.</Text>
        <Button title="Start a new booking" onPress={() => router.push({ pathname: '/booking', params: { source: 'bookings' } })} />
      </Card>
      {customer ? <Button title="View my booking history" variant="outline" onPress={() => setTab('track')} /> : <><Text style={{ color: C.muted, fontSize: 12, lineHeight: 18 }}>Already submitted a request? Open Track booking to find it by reference or phone number.</Text><Button title="Guest lookup screen" variant="outline" onPress={() => router.push('/guest-booking')} /></>}
    </> : <>
      <Card>
        <Text style={{ color: C.navy, fontWeight: '900', fontSize: 15 }}>Find your booking</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip title="Reference number" active={lookupMode === 'reference'} onPress={() => { setLookupMode('reference'); setResults([]); setError(''); }} />
          <Chip title="Phone number" active={lookupMode === 'phone'} onPress={() => { setLookupMode('phone'); setResults([]); setError(''); }} />
        </View>
        {lookupMode === 'reference'
          ? <Field label="Booking reference" value={reference} onChangeText={v => setReference(v.toUpperCase())} autoCapitalize="characters" placeholder="MRK-XXXXXXXXXXXX" />
          : <Field label="Phone number used when booking" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+251…" />}
        <Button title={lookupMode === 'phone' ? 'Show bookings' : 'Track booking'} onPress={() => void lookup()} loading={looking} />
        {error ? <ErrorBanner message={error} /> : null}
      </Card>
      {notice ? <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17 }}>{notice}</Text> : null}
      {customer ? <>
        <Text style={{ color: C.navy, fontWeight: '900', fontSize: 16 }}>My bookings</Text>
        {q.isLoading ? <Loading /> : q.isError ? <Empty title="Bookings could not load" body="Sign in again or check your connection." action={<Button title="Retry" variant="outline" onPress={() => void q.refetch()} />} /> : null}
        {q.data?.bookings.map(b => {
          const estimates = b.items.map(item => item.estimate);
          const total = b.agreedAmount ?? b.startingEstimate ?? (estimates.length && estimates.every(amount => amount !== null) ? estimates.reduce<number>((sum, amount) => sum + Number(amount), 0) : null);
          const paid = Number(b.amountPaid || 0);
          const balance = Number(b.remainingBalance ?? (total === null ? 0 : Math.max(0, Number(total) - paid)));
          return <BookingReceiptCard key={b.reference} reference={b.reference} serviceName={b.service_name} status={b.status} requestedAt={b.requested_start} total={total} currency={b.currency || b.items[0]?.currency || 'ETB'} paid={paid} balance={balance} onPress={() => router.push({ pathname: '/booking-details/[reference]', params: { reference: b.reference } })} />;
        })}
      </> : null}
      {results.map(b => <BookingReceiptCard key={b.reference} reference={b.reference} serviceName={b.serviceName} status={b.status} requestedAt={b.requestedStart} total={b.totalAmount} currency={b.currency || 'ETB'} paid={Number(b.amountPaid)} balance={Number(b.remainingBalance)} expanded={selected === b.reference} onPress={() => setSelected(selected === b.reference ? null : b.reference)}>{selected === b.reference ? <Text style={{ color: C.muted, fontSize: 11 }}>Appointment time and price remain subject to Meraki Homes confirmation.</Text> : null}</BookingReceiptCard>)}
    </>}
  </Page>;
}

function BookingReceiptCard({reference,serviceName,status,requestedAt,total,currency,paid,balance,onPress,expanded,children}:{reference:string;serviceName:string;status:string;requestedAt:string;total:number|string|null|undefined;currency:string;paid:number;balance:number;onPress:()=>void;expanded?:boolean;children?:React.ReactNode}){
  return <Pressable accessibilityRole="button" onPress={onPress}><View style={{borderRadius:14,borderWidth:1,borderColor:C.border,backgroundColor:C.white,overflow:'hidden'}}><View style={{backgroundColor:C.navy,padding:14,gap:3}}><Text style={{fontSize:9,color:'#F4D28B',fontWeight:'900',letterSpacing:1.4}}>MERAKI HOMES · BOOKING RECEIPT</Text><Text style={{fontSize:13,color:C.white,fontWeight:'900'}}>{reference}</Text></View><View style={{padding:14,gap:8}}><ReceiptLine label="Service" value={serviceName}/><ReceiptLine label="Preferred visit" value={new Date(requestedAt).toLocaleString()}/><ReceiptLine label="Request status" value={status.replaceAll('_',' ')}/><View style={{borderTopWidth:1,borderStyle:'dashed',borderColor:C.border,marginVertical:2}}/><ReceiptLine label="Estimate" value={total==null?'Quote after review':`${Number(total).toLocaleString()} ${currency}`}/><ReceiptLine label="Paid" value={`${paid.toLocaleString()} ${currency}`} valueColor={paid>0?C.green:C.muted}/><ReceiptLine label="Outstanding" value={total==null?'Pending quote':`${balance.toLocaleString()} ${currency}`} valueColor={balance>0?C.red:C.green}/>{children}{expanded?<Text style={{fontSize:10,color:C.muted}}>Status and visit time are pending Operations review.</Text>:null}</View></View></Pressable>;
}
function ReceiptLine({label,value,valueColor=C.navy}:{label:string;value:string;valueColor?:string}){return <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:12}}><Text style={{flex:1,color:C.slate,fontSize:11,fontWeight:'700'}}>{label}</Text><Text style={{flex:1,color:valueColor,fontSize:11,fontWeight:'900',textAlign:'right'}}>{value}</Text></View>;}
