import React from 'react';
import { Calendar, CheckCircle2, MapPin } from 'lucide-react';
import { Booking } from '@shared/types';

interface Step6Props { booking: Booking | null; onBookAnother: () => void; onViewBookings: () => void; }

export const Step6_Confirmation: React.FC<Step6Props> = ({ booking, onBookAnother, onViewBookings }) => <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-7 text-center sm:p-10">
  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#D4A853]/15 text-[#102A43]"><CheckCircle2 size={28}/></div>
  <p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-[#102A43]">Request received</p>
  <h2 className="mt-2 text-2xl font-semibold text-[#102A43]">We’ll review the details with you.</h2>
  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Your requested date is not reserved and no professional has been assigned. Operations will confirm availability and final pricing with you. No payment has been recorded.</p>
  {booking&&<div className="mx-auto mt-6 max-w-sm rounded-lg bg-[#F7F8FA] p-4 text-left text-sm"><p className="font-mono font-semibold">Reference {booking.id}</p><p className="mt-3 flex items-center gap-2"><Calendar size={15}/>{booking.date} · {booking.timeSlot}</p><p className="mt-2 flex items-center gap-2"><MapPin size={15}/>{booking.neighborhood}, Addis Ababa</p></div>}
  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={onViewBookings} className="min-h-12 rounded-lg bg-[#102A43] px-5 font-semibold text-white">View request status</button><button onClick={onBookAnother} className="min-h-12 rounded-lg border border-slate-300 px-5 font-semibold text-[#102A43]">Start another request</button></div>
</section>;
