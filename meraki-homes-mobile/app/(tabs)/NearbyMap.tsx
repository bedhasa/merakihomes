import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C } from '../../src/components/ui';

type Coordinate = { latitude: number; longitude: number };
type Region = Coordinate & { latitudeDelta: number; longitudeDelta: number };
type MapProfessional = { id: string; name: string; photoUrl: string | null; rating: number | null; latitude: number | null; longitude: number | null; distanceLabel: string | null; availability: string; locationVisible: boolean };

export default function NearbyMap({ center, professionals }: {
  center: Coordinate | null;
  region: Region;
  professionals: MapProfessional[];
  selectedId: string | null;
  showUserLocation: boolean;
  onRegionChange(region: Region): void;
  onSelect(coordinate: Coordinate): void;
  onSelectProfessional(id: string): void;
}) {
  return <View style={styles.fallback}>
    <Text style={styles.title}>Map preview is available in the Android app</Text>
    <Text style={styles.copy}>{center ? `${professionals.filter(person => person.locationVisible && person.latitude !== null && person.longitude !== null).length} professionals have shared a recent map location.` : 'Search for a neighborhood or use your current location.'}</Text>
    <Text style={styles.copy}>Open the professional list below to review the same filtered results. Map pins are available in Expo Go.</Text>
  </View>;
}

const styles = StyleSheet.create({
  fallback: { ...StyleSheet.absoluteFill, backgroundColor: '#EEF1F4', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  title: { color: C.navy, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  copy: { color: C.slate, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
