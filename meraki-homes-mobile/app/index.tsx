import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Loading } from '../src/components/ui';

export default function EntryIndex() {
  const { loading, canBrowse } = useAuth();
  if (loading) return <Loading />;
  return <Redirect href={canBrowse ? '/(tabs)' : '/welcome'} />;
}
