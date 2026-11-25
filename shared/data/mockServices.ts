// Despite the file name, these two values are used in production: ADDIS_NEIGHBORHOODS by the booking
// flow (frontend/src/booking/RequestFlow.tsx) and ETB_EXCHANGE_RATE by shared/utils/formatters.ts.
// The prototype mock data that used to live here was removed with the dead prototype screens.
// Planned: move these to shared/reference/ and stop converting prices client-side
// (refactoring roadmap 2.7 and 4.10, technical-debt register TD-030 and TD-038).

export const ETB_EXCHANGE_RATE = 120; // 1 USD = 120 ETB

export const ADDIS_NEIGHBORHOODS = [
  'Bole Atlas',
  'Kazanchis',
  'Old Airport',
  'Sarbet / Bisrate Gabriel',
  'CMC / Summit',
  'Gerji / Imperial',
  'Nifas Silk',
  'Mexico / Lideta'
];
