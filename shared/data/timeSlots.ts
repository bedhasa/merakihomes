import { TimeSlot, AvailableDate } from '../types';

const BASE_SLOTS: Omit<TimeSlot, 'status'>[] = [
  { id: 's_0800', label: '8:00 AM', startTime: '08:00', endTime: '10:00', period: 'morning' },
  { id: 's_0900', label: '9:00 AM', startTime: '09:00', endTime: '11:00', period: 'morning' },
  { id: 's_1000', label: '10:00 AM', startTime: '10:00', endTime: '12:00', period: 'morning' },
  { id: 's_1100', label: '11:00 AM', startTime: '11:00', endTime: '13:00', period: 'morning' },
  { id: 's_1200', label: '12:00 PM', startTime: '12:00', endTime: '14:00', period: 'afternoon' },
  { id: 's_1300', label: '1:00 PM', startTime: '13:00', endTime: '15:00', period: 'afternoon' },
  { id: 's_1400', label: '2:00 PM', startTime: '14:00', endTime: '16:00', period: 'afternoon' },
  { id: 's_1500', label: '3:00 PM', startTime: '15:00', endTime: '17:00', period: 'afternoon' },
  { id: 's_1600', label: '4:00 PM', startTime: '16:00', endTime: '18:00', period: 'afternoon' },
  { id: 's_1700', label: '5:00 PM', startTime: '17:00', endTime: '19:00', period: 'evening' },
  { id: 's_1800', label: '6:00 PM', startTime: '18:00', endTime: '20:00', period: 'evening' },
];

type SlotStatus = TimeSlot['status'];

// Realistic availability patterns per day offset (0 = today)
const SLOT_PATTERNS: Record<number, Record<string, SlotStatus>> = {
  0: { s_0800: 'full', s_0900: 'full', s_1000: 'full', s_1100: 'available', s_1200: 'full', s_1300: 'available', s_1400: 'available', s_1500: 'unavailable', s_1600: 'available', s_1700: 'available', s_1800: 'available' },
  1: { s_0800: 'available', s_0900: 'available', s_1000: 'available', s_1100: 'full', s_1200: 'available', s_1300: 'full', s_1400: 'available', s_1500: 'available', s_1600: 'available', s_1700: 'unavailable', s_1800: 'available' },
  2: { s_0800: 'full', s_0900: 'available', s_1000: 'full', s_1100: 'available', s_1200: 'available', s_1300: 'available', s_1400: 'full', s_1500: 'available', s_1600: 'available', s_1700: 'available', s_1800: 'unavailable' },
  3: { s_0800: 'available', s_0900: 'full', s_1000: 'available', s_1100: 'available', s_1200: 'full', s_1300: 'available', s_1400: 'available', s_1500: 'full', s_1600: 'available', s_1700: 'available', s_1800: 'available' },
  4: { s_0800: 'available', s_0900: 'available', s_1000: 'available', s_1100: 'available', s_1200: 'available', s_1300: 'available', s_1400: 'available', s_1500: 'available', s_1600: 'available', s_1700: 'available', s_1800: 'available' },
  5: { s_0800: 'full', s_0900: 'full', s_1000: 'full', s_1100: 'available', s_1200: 'available', s_1300: 'available', s_1400: 'full', s_1500: 'full', s_1600: 'available', s_1700: 'available', s_1800: 'available' },
  6: { s_0800: 'available', s_0900: 'available', s_1000: 'available', s_1100: 'full', s_1200: 'available', s_1300: 'available', s_1400: 'available', s_1500: 'available', s_1600: 'full', s_1700: 'unavailable', s_1800: 'available' },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getAvailableDates(): AvailableDate[] {
  const dates: AvailableDate[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const pattern = SLOT_PATTERNS[i] ?? SLOT_PATTERNS[0];

    const slots: TimeSlot[] = BASE_SLOTS.map(slot => ({
      ...slot,
      status: (pattern[slot.id] ?? 'available') as SlotStatus,
    }));

    dates.push({
      date: d,
      dateStr: d.toISOString().split('T')[0],
      label: `${FULL_DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`,
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      slots,
    });
  }

  return dates;
}
