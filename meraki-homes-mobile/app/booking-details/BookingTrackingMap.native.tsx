import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

type Position = { latitude: number; longitude: number; updatedAt: string; freshness: string };

export default function BookingTrackingMap({ position, title, showCustomerLocation }: { position: Position; title: string; showCustomerLocation: boolean }) {
  return <MapView
    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
    style={StyleSheet.absoluteFill}
    region={{ latitude: position.latitude, longitude: position.longitude, latitudeDelta: 0.015, longitudeDelta: 0.015 }}
    showsUserLocation={showCustomerLocation}
    showsMyLocationButton={false}
    scrollEnabled={false}
    zoomEnabled={false}
    rotateEnabled={false}
    pitchEnabled={false}
  >
    <Marker coordinate={{ latitude: position.latitude, longitude: position.longitude }} title={title} description={`Last updated ${new Date(position.updatedAt).toLocaleTimeString()}`} pinColor="#D4A853"/>
  </MapView>;
}
