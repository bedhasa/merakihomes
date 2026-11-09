import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C } from '../../src/components/ui';

type Position = { latitude: number; longitude: number; updatedAt: string; freshness: string };

export default function BookingTrackingMap({ position, title }: { position: Position; title: string; showCustomerLocation: boolean }) {
  return <View style={styles.container}><Text style={styles.pin}>●</Text><Text style={styles.title}>{title}</Text><Text style={styles.coordinates}>{position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}</Text><Text style={styles.updated}>Last updated {new Date(position.updatedAt).toLocaleTimeString()} · Expo Go shows the live map.</Text></View>;
}

const styles=StyleSheet.create({container:{...StyleSheet.absoluteFill,alignItems:'center',justifyContent:'center',gap:6,backgroundColor:'#E9EEF2',padding:12},pin:{fontSize:32,color:'#8B5E00'},title:{fontSize:12,fontWeight:'800',color:C.navy,textAlign:'center'},coordinates:{fontSize:10,color:C.slate},updated:{fontSize:9,color:C.muted,textAlign:'center'}});
