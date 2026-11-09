import React, { useState } from 'react';
import { Link, Redirect, useRouter } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Button, C, ErrorBanner, Field, Page, Title } from '../../src/components/ui';
import { ApiError } from '../../src/lib/api';

const schema = z.object({ email: z.email('Enter a valid email address.'), password: z.string().min(1, 'Enter your password.') });
type Values = z.infer<typeof schema>;
export default function LoginScreen() {
  const { customer, signIn } = useAuth(); const router = useRouter(); const [error, setError] = useState('');
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
  if (customer) return <Redirect href="/(tabs)" />;
  const submit = handleSubmit(async value => { setError(''); try { await signIn(value.email.trim(), value.password); router.replace('/(tabs)'); } catch (e) { setError(e instanceof ApiError ? e.message : 'Unable to sign in.'); } });
  return <Page><View style={{ paddingTop: 20, gap: 16 }}><Title subtitle="Sign in to see your real bookings, approvals, and saved service addresses.">Welcome back</Title><ErrorBanner message={error} /><Controller control={control} name="email" render={({ field: f }) => <Field label="Email" value={f.value} onChangeText={f.onChange} onBlur={f.onBlur} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />} /><Controller control={control} name="password" render={({ field: f }) => <Field label="Password" value={f.value} onChangeText={f.onChange} onBlur={f.onBlur} secureTextEntry error={errors.password?.message} />} /><Button title="Sign in" onPress={submit} loading={isSubmitting} /><Text style={{ color: C.slate, textAlign: 'center' }}>New to Meraki Homes? <Link href="/(auth)/register" style={{ color: C.navy, fontWeight: '800' }}>Create an account</Link></Text></View></Page>;
}
