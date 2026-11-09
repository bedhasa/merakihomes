import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { Button, C, Card } from './ui';

const pad = (value: number) => String(value).padStart(2, '0');
const dateValue = (value: Date) => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
const timeValue = (value: Date) => `${pad(value.getHours())}:${pad(value.getMinutes())}`;
const todayStart = () => { const today = new Date(); today.setHours(0, 0, 0, 0); return today; };
const inputStyle: React.CSSProperties = { width: '100%', height: 48, boxSizing: 'border-box', border: `1px solid ${C.border}`, borderRadius: 14, backgroundColor: C.white, padding: '0 12px', color: C.navy, fontSize: 14, fontFamily: 'inherit' };

export function DateTimeField({ value, onChange }: { value: Date; onChange: (date: Date) => void }) {
  const [iosMode, setIosMode] = useState<'date' | 'time' | null>(null);

  const openPicker = (mode: 'date' | 'time') => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode,
        ...(mode === 'date' ? { minimumDate: todayStart() } : {}),
        onChange: (event, selected) => { if (event.type === 'set' && selected) onChange(selected); },
      });
      return;
    }
    setIosMode(mode);
  };

  const changeDate = (raw: string) => {
    const [year, month, day] = raw.split('-').map(Number);
    if (!year || !month || !day) return;
    const pickedDay = new Date(year, month - 1, day);
    if (pickedDay < todayStart()) return;
    const next = new Date(value);
    next.setFullYear(year, month - 1, day);
    if (next <= new Date()) next.setHours(Math.max(value.getHours(), new Date().getHours() + 1), value.getMinutes(), 0, 0);
    onChange(next);
  };

  const changeTime = (raw: string) => {
    const [hours, minutes] = raw.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return;
    const next = new Date(value);
    next.setHours(hours, minutes, 0, 0);
    onChange(next);
  };

  return <View style={{ gap: 9 }}>
    <Text style={{ color: C.navy, fontSize: 12, fontWeight: '800' }}>Preferred date and arrival time</Text>
    {Platform.OS === 'web' ? <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={{ flex: 1, gap: 5 }}><Text style={{ color: C.muted, fontSize: 11 }}>Date</Text>{React.createElement('input', { type: 'date', value: dateValue(value), min: dateValue(new Date()), 'aria-label': 'Preferred date', onChange: (event: React.ChangeEvent<HTMLInputElement>) => changeDate(event.currentTarget.value), style: inputStyle })}</View>
      <View style={{ flex: 1, gap: 5 }}><Text style={{ color: C.muted, fontSize: 11 }}>Time</Text>{React.createElement('input', { type: 'time', value: timeValue(value), 'aria-label': 'Preferred arrival time', onChange: (event: React.ChangeEvent<HTMLInputElement>) => changeTime(event.currentTarget.value), style: inputStyle })}</View>
    </View> : <View style={{ flexDirection: 'row', gap: 8 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Choose preferred date" onPress={() => openPicker('date')} style={{ flex: 1 }}><Card style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}><Feather name="calendar" size={17} color={C.gold} /><Text style={{ color: C.navy, fontSize: 12, fontWeight: '700' }}>{value.toLocaleDateString()}</Text></Card></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Choose arrival time" onPress={() => openPicker('time')} style={{ flex: 1 }}><Card style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}><Feather name="clock" size={17} color={C.gold} /><Text style={{ color: C.navy, fontSize: 12, fontWeight: '700' }}>{value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></Card></Pressable>
    </View>}
    {Platform.OS === 'ios' && iosMode ? <View style={{ gap: 8 }}><DateTimePicker value={value} mode={iosMode} minimumDate={iosMode === 'date' ? todayStart() : undefined} onChange={(event, selected) => { if (event.type === 'set' && selected) onChange(selected); }} display="spinner"/><Button title="Done" variant="outline" onPress={() => setIosMode(null)} /></View> : null}
  </View>;
}
