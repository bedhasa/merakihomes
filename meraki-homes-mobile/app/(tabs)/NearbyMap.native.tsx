import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

type Coordinate = { latitude: number; longitude: number };
type Region = Coordinate & { latitudeDelta: number; longitudeDelta: number };
type MapProfessional = { id: string; name: string; photoUrl: string | null; rating: number | null; latitude: number | null; longitude: number | null; distanceLabel: string | null; availability: string; locationVisible: boolean };

export default function NearbyMap({ center, region, professionals, selectedId, showUserLocation, onRegionChange, onSelect, onSelectProfessional }: {
  center: Coordinate | null;
  region: Region;
  professionals: MapProfessional[];
  selectedId: string | null;
  showUserLocation: boolean;
  onRegionChange(region: Region): void;
  onSelect(coordinate: Coordinate): void;
  onSelectProfessional(id: string): void;
}) {
  return <MapView
    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
    style={StyleSheet.absoluteFill}
    region={region}
    onRegionChangeComplete={onRegionChange}
    onPress={event => onSelect(event.nativeEvent.coordinate)}
    showsUserLocation={showUserLocation}
    showsMyLocationButton={false}
  >
    {professionals.filter(person => person.locationVisible && person.latitude !== null && person.longitude !== null).map(person => <Marker
      key={person.id}
      coordinate={{ latitude: person.latitude!, longitude: person.longitude! }}
      title={person.name}
      description={`${person.rating == null ? 'Verified professional' : `★ ${person.rating.toFixed(1)} rating`}${person.distanceLabel ? ` · ${person.distanceLabel} straight-line` : ''}`}
      onPress={() => onSelectProfessional(person.id)}
      tracksViewChanges
    >
      <View style={[styles.pin, person.id === selectedId && styles.selectedPin]}>
        {person.photoUrl ? <Image source={{ uri: person.photoUrl }} style={styles.avatar}/> : <Text style={styles.initial}>{person.name.trim().charAt(0).toUpperCase() || 'M'}</Text>}
        {person.rating != null ? <View style={styles.rating}><Text style={styles.ratingText}>★ {person.rating.toFixed(1)}</Text></View> : null}
      </View>
    </Marker>)}
    {center ? <Marker coordinate={center} title={showUserLocation ? 'Your location' : 'Search area'} description={showUserLocation ? 'Your current location. Tap the map to adjust your search area.' : 'Tap anywhere on the map to move your search area.'} anchor={{ x: 0.5, y: 0.5 }}>
      <View style={styles.userPin}><View style={styles.userDot}/></View>
    </Marker> : null}
  </MapView>;
}

const styles = StyleSheet.create({
  pin: { width: 54, height: 54, borderRadius: 27, borderWidth: 3, borderColor: '#FFFFFF', backgroundColor: '#D4A853', alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#102A43', shadowOpacity: 0.25, shadowRadius: 5, shadowOffset: { width: 0, height: 3 } },
  selectedPin: { borderColor: '#D4A853', transform: [{ scale: 1.12 }] },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8EDF2' },
  initial: { color: '#102A43', fontWeight: '900', fontSize: 22 },
  rating: { position: 'absolute', bottom: -8, alignSelf: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, backgroundColor: '#102A43', borderWidth: 1, borderColor: '#FFFFFF' },
  ratingText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  userPin: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(16,42,67,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(16,42,67,0.35)' },
  userDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#1677E8', borderWidth: 3, borderColor: '#FFFFFF', elevation: 4 },
});
