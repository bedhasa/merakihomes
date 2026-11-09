import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { api, ApiError, patchJson, postJson } from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import type { Address, Customer } from '../../src/lib/types';
import { Button, C, Card, Empty, ErrorBanner, Field, Loading, Page, Title } from '../../src/components/ui';

type AddressForm = { label: string; city: string; subCity: string; area: string; streetBuilding: string; landmark: string; directions: string };
type ProfileForm = { name: string; phone: string; email: string };
const blankAddress: AddressForm = { label: '', city: 'Addis Ababa', subCity: '', area: '', streetBuilding: '', landmark: '', directions: '' };
const blankProfile: ProfileForm = { name: '', phone: '', email: '' };

export default function ProfileScreen() {
  const { customer, updateCustomer, signOut, guestAccess } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [profileForm, setProfileForm] = useState(blankProfile);
  const [addressForm, setAddressForm] = useState(blankAddress);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const profile = useQuery({ queryKey: ['profile'], queryFn: () => api<{ customer: Customer }>('/customers/me'), enabled: !!customer });
  const addresses = useQuery({ queryKey: ['addresses'], queryFn: () => api<{ addresses: Address[] }>('/customers/me/addresses'), enabled: !!customer });

  useEffect(() => {
    if (profile.data?.customer) setProfileForm({ name: profile.data.customer.name, phone: profile.data.customer.phone || '', email: profile.data.customer.email || '' });
  }, [profile.data]);

  const saveProfile = async () => {
    setError(''); setMessage(''); setSavingProfile(true);
    try {
      const result = await api<{ customer: Customer }>('/customers/me', patchJson({ name: profileForm.name.trim(), phone: profileForm.phone.trim(), email: profileForm.email.trim() }));
      updateCustomer(result.customer);
      await qc.invalidateQueries({ queryKey: ['profile'] });
      setMessage('Your profile was updated.');
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not save your profile.'); }
    finally { setSavingProfile(false); }
  };

  const saveAddress = async () => {
    setError(''); setMessage(''); setSavingAddress(true);
    try {
      if (editingAddress) await api(`/customers/me/addresses/${editingAddress}`, patchJson({ ...addressForm, isDefault: addresses.data?.addresses.find(a => a.id === editingAddress)?.isDefault || false }));
      else await api('/customers/me/addresses', postJson({ ...addressForm, isDefault: !addresses.data?.addresses.length }));
      setAddressForm(blankAddress); setEditingAddress(null);
      await qc.invalidateQueries({ queryKey: ['addresses'] });
      setMessage(editingAddress ? 'Saved address updated.' : 'Address saved.');
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not save the address.'); }
    finally { setSavingAddress(false); }
  };

  const editAddress = (address: Address) => {
    setEditingAddress(address.id);
    setAddressForm({ label: address.label, city: address.city, subCity: address.subCity, area: address.area, streetBuilding: address.streetBuilding, landmark: address.landmark, directions: address.directions });
    setMessage(''); setError('');
  };
  const setDefault = async (a: Address) => {
    setError('');
    try { await api(`/customers/me/addresses/${a.id}`, patchJson({ ...a, isDefault: true })); await qc.invalidateQueries({ queryKey: ['addresses'] }); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not update the default address.'); }
  };
  const removeAddress = (a: Address) => Alert.alert('Delete saved address?', a.label, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await api(`/customers/me/addresses/${a.id}`, { method: 'DELETE' }); await qc.invalidateQueries({ queryKey: ['addresses'] }); if (editingAddress === a.id) { setEditingAddress(null); setAddressForm(blankAddress); } }
      catch (e) { setError(e instanceof ApiError ? e.message : 'Could not delete the address.'); }
    } },
  ]);
  const logout = () => Alert.alert('Sign out', 'Sign out of Meraki Homes on this device?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/welcome'); } },
  ]);

  if (!customer) return <Page><Title subtitle="Sign in to edit your information and manage saved service locations.">Your profile</Title><Empty title="Sign in to your account" body={guestAccess ? 'You are browsing as a guest. Sign in to manage bookings, approvals, and saved addresses.' : 'Your profile details, approvals, and saved locations are available after you sign in.'} action={<><Button title="Sign in" onPress={() => router.push('/(auth)/login')} /><Button title="Create account" variant="outline" onPress={() => router.push('/(auth)/register')} /><Button title="Track a guest request" variant="outline" onPress={() => router.push('/guest-booking')} /><Button title="Professional sign in" variant="outline" onPress={() => router.push('/professional')} />{guestAccess ? <Button title="End guest session" variant="outline" onPress={async () => { await signOut(); router.replace('/welcome'); }} /> : null}</>} /></Page>;
  if (profile.isLoading) return <Loading />;
  if (profile.isError) return <Page><Title>Your profile</Title><Empty title="Profile unavailable" body="Sign in again or check your connection." action={<Button title="Retry" variant="outline" onPress={() => void profile.refetch()} />} /></Page>;

  return <Page>
    <Title subtitle="Manage your account details and the service locations you use with Meraki Homes.">Your profile</Title>
    <ErrorBanner message={error} />
    {message ? <Text style={{ color: C.green, fontSize: 12, fontWeight: '700' }}>{message}</Text> : null}
    <Card>
      <Text style={{ fontSize: 15, color: C.navy, fontWeight: '900' }}>Personal information</Text>
      <Field label="Full name" value={profileForm.name} onChangeText={v => setProfileForm(x => ({ ...x, name: v }))} autoCapitalize="words" />
      <Field label="Phone number" value={profileForm.phone} onChangeText={v => setProfileForm(x => ({ ...x, phone: v }))} keyboardType="phone-pad" />
      <Field label="Email (optional)" value={profileForm.email} onChangeText={v => setProfileForm(x => ({ ...x, email: v }))} keyboardType="email-address" autoCapitalize="none" />
      <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17 }}>Your email is used to sign in. Leave it unchanged if you do not want to update it.</Text>
      <Button title="Save profile" onPress={() => void saveProfile()} loading={savingProfile} />
    </Card>

    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontSize: 15, color: C.navy, fontWeight: '900' }}>Saved service locations</Text><Feather name="map-pin" size={18} color={C.gold} /></View>
      <Text style={{ color: C.slate, fontSize: 12, lineHeight: 18 }}>Save multiple addresses and choose one as your default when booking.</Text>
      {addresses.isLoading ? <Loading /> : addresses.isError ? <Empty title="Locations unavailable" body="Check your connection and try again." action={<Button title="Retry" variant="outline" onPress={() => void addresses.refetch()} />} /> : addresses.data?.addresses.length ? addresses.data.addresses.map(a => <View key={a.id} style={{ borderTopWidth: 1, borderColor: C.border, paddingTop: 12, gap: 7 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}><Text style={{ fontWeight: '800', color: C.navy, flex: 1 }}>{a.label}{a.isDefault ? ' · DEFAULT' : ''}</Text><Button title="Edit" variant="outline" onPress={() => editAddress(a)} style={{ minHeight: 36, paddingHorizontal: 10 }} /><Button title="Delete" variant="danger" onPress={() => removeAddress(a)} style={{ minHeight: 36, paddingHorizontal: 10 }} /></View>
        <Text style={{ fontSize: 12, color: C.slate }}>{[a.streetBuilding, a.area, a.subCity, a.city, a.landmark].filter(Boolean).join(', ')}</Text>
        {a.directions ? <Text style={{ fontSize: 11, color: C.muted }}>Directions: {a.directions}</Text> : null}
        {!a.isDefault ? <Button title="Make default" variant="outline" onPress={() => void setDefault(a)} style={{ minHeight: 40 }} /> : null}
      </View>) : <Empty title="No saved locations" body="Add a home or another service address to reuse it when booking." />}

      <Text style={{ fontWeight: '800', color: C.navy, marginTop: 5 }}>{editingAddress ? 'Edit service location' : 'Add a service location'}</Text>
      {(['label', 'city', 'subCity', 'area', 'streetBuilding', 'landmark', 'directions'] as const).map(k => <Field key={k} label={{ label: 'Location label', city: 'City', subCity: 'Sub-city', area: 'Area / neighborhood', streetBuilding: 'Street / building', landmark: 'Nearby landmark', directions: 'Entry directions' }[k]} value={addressForm[k]} onChangeText={v => setAddressForm(x => ({ ...x, [k]: v }))} multiline={k === 'directions'} placeholder={k === 'city' ? 'Addis Ababa' : undefined} />)}
      <Button title={editingAddress ? 'Save location changes' : 'Save location'} onPress={() => void saveAddress()} loading={savingAddress} icon={<Feather name="plus" size={16} color={C.navy} />} />
      {editingAddress ? <Button title="Cancel editing" variant="outline" onPress={() => { setEditingAddress(null); setAddressForm(blankAddress); }} /> : null}
    </Card>

    <Card><Text style={{ fontWeight: '900', color: C.navy }}>Account settings</Text><Button title="Your approvals" variant="outline" onPress={() => router.push('/approvals')} /><Button title="Notifications" variant="outline" onPress={() => router.push('/notifications')} /><Button title="Contact & support" variant="outline" onPress={() => router.push('/contact')} /><Button title="About Meraki Homes" variant="outline" onPress={() => router.push('/about')} /><Button title="Professional sign in" variant="outline" onPress={() => router.push('/professional')} /><Button title="Sign out" variant="danger" icon={<Feather name="log-out" size={16} color={C.red} />} onPress={logout} /></Card>
    <Card style={{ backgroundColor: '#FAF6EC', borderColor: '#E7D6AC' }}><Text style={{ fontSize: 12, color: C.slate, lineHeight: 18 }}>No saved card numbers or payment secrets are stored in this app.</Text></Card>
  </Page>;
}
