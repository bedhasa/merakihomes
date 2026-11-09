import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api, ApiError, patchJson } from '../src/lib/api';
import type { Approval } from '../src/lib/types';
import { useAuth } from '../src/context/AuthContext';
import { Button, C, Card, Empty, ErrorBanner, Loading, Page, Title } from '../src/components/ui';

export default function ApprovalsScreen() {
  const { customer } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const q = useQuery({ queryKey: ['approvals'], queryFn: () => api<{ approvals: Approval[] }>('/customers/me/approvals'), enabled: !!customer });
  const decide = async (item: Approval, decision: 'accepted' | 'rejected') => {
    setError('');
    try {
      await api(`/customers/me/approvals/${item.kind}/${item.id}`, patchJson({ decision }));
      await qc.invalidateQueries({ queryKey: ['approvals'] });
      await qc.invalidateQueries({ queryKey: ['bookings'] });
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not record your decision.'); }
  };

  if (!customer) return <Page><Title subtitle="Approvals are private to your account.">Your approvals</Title><Empty title="Sign in to review approvals" body="Worker, schedule, and price proposals from Operations appear here after you sign in." action={<Button title="Sign in" onPress={() => router.push('/(auth)/login')} />} /></Page>;

  return <Page>
    <Title subtitle="Only approve changes after reviewing the details with Meraki Operations.">Your approvals</Title>
    <ErrorBanner message={error} />
    {q.isLoading ? <Loading /> : q.isError ? <Empty title="Approvals unavailable" body="Sign in again or retry your connection." action={<Button title="Retry" variant="outline" onPress={() => void q.refetch()} />} /> : !q.data?.approvals.length ? <Empty title="Nothing needs approval" body="Schedule, worker, and price proposals from Operations will appear here." /> : <View style={{ gap: 12 }}>{q.data.approvals.map(a => <Card key={`${a.kind}-${a.id}`}>
      <Text style={{ fontSize: 10, color: '#7B5804', fontWeight: '900', textTransform: 'uppercase' }}>{a.kind} change · {a.bookingReference}</Text>
      <Text style={{ fontSize: 15, color: C.navy, fontWeight: '900' }}>{a.serviceName}</Text>
      {a.workerName ? <Text style={{ fontSize: 12, color: C.slate }}>Proposed specialist · {a.workerName}</Text> : null}
      {a.proposedStart ? <Text style={{ fontSize: 12, color: C.slate }}>Proposed time · {new Date(a.proposedStart).toLocaleString()}</Text> : null}
      {a.proposedAmount !== undefined && a.proposedAmount !== null ? <Text style={{ fontSize: 12, color: C.slate }}>Proposed price · {a.proposedAmount.toLocaleString()} {a.currency}</Text> : null}
      <Text style={{ fontSize: 12, color: C.slate, lineHeight: 18 }}>Reason · {a.reason}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}><Button title="Approve" onPress={() => void decide(a, 'accepted')} style={{ flex: 1 }} /><Button title="Decline" variant="outline" onPress={() => void decide(a, 'rejected')} style={{ flex: 1 }} /></View>
    </Card>)}</View>}
  </Page>;
}
