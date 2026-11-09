import React, { useState } from 'react';
import { Link, Redirect, useRouter } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Button, C, ErrorBanner, Field, Page, Title } from '../../src/components/ui';
import { ApiError } from '../../src/lib/api';

const schema = z.object({ name: z.string().trim().min(2).max(120), email: z.email(), phone: z.string().trim().min(7).max(20), password: z.string().min(10, 'Use at least 10 characters.').max(200) });
type Values = z.infer<typeof schema>;
export default function RegisterScreen() {
  const { customer, register } = useAuth(); const router = useRouter(); const [error, setError] = useState('');
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', phone: '', password: '' } });
  if (customer) return <Redirect href="/(tabs)" />;
  const submit = handleSubmit(async value => { setError(''); try { await register(value); router.replace('/(tabs)'); } catch (e) { setError(e instanceof ApiError ? e.message : 'Unable to create your account.'); } });
  return <Page><View style={{ paddingTop: 12, gap: 14 }}><Title subtitle="Create a secure customer account to manage bookings and approvals.">Join Meraki Homes</Title><ErrorBanner message={error} />{([['name','Full name'],['email','Email'],['phone','Phone number'],['password','Password']] as const).map(([name,label])=><Controller key={name} control={control} name={name} render={({ field: f })=><Field label={label} value={f.value} onChangeText={f.onChange} onBlur={f.onBlur} autoCapitalize={name==='email'?'none':'words'} keyboardType={name==='email'?'email-address':name==='phone'?'phone-pad':'default'} secureTextEntry={name==='password'} error={errors[name]?.message} />} />)}<Button title="Create account" onPress={submit} loading={isSubmitting} /><Text style={{ color: C.slate, textAlign: 'center' }}>Already registered? <Link href="/(auth)/login" style={{ color: C.navy, fontWeight: '800' }}>Sign in</Link></Text></View></Page>;
}
