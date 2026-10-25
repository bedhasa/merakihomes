import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { AvailableDate, TimeSlot } from '@shared/types';
import { getAvailableDates } from '@shared/data/timeSlots';

interface Step4Props {
  selectedDateStr: string;
  selectedDate: string;
  selectedTimeSlotId: string | null;
  onDateSelect: (dateStr: string, dateLabel: string) => void;
  onTimeSelect: (slotId: string, slotLabel: string) => void;
}

const PERIOD_LABELS: Record<TimeSlot['period'], string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌆 Evening',
};

const AVAILABLE_DATES: AvailableDate[] = getAvailableDates();

export const Step4_DateTime: React.FC<Step4Props> = ({
  selectedDateStr,
  selectedDate,
  selectedTimeSlotId,
  onDateSelect,
  onTimeSelect,
}) => {
  const selectedDayData = AVAILABLE_DATES.find(d => d.dateStr === selectedDateStr);

  const slotsByPeriod = selectedDayData
    ? (['morning', 'afternoon', 'evening'] as TimeSlot['period'][]).map(period => ({
        period,
        slots: selectedDayData.slots.filter(s => s.period === period),
      }))
    : [];

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">When should we arrive?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Choose a date and time that works for you.
        </p>
      </div>

      {/* Date strip */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Select Date
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {AVAILABLE_DATES.map(d => {
            const isSelected = selectedDateStr === d.dateStr;
            const hasAvailability = d.slots.some(s => s.status === 'available');
            return (
              <button
                key={d.dateStr}
                onClick={() => onDateSelect(d.dateStr, d.label)}
                className={`flex flex-col items-center shrink-0 w-16 py-3 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-golden-500 bg-golden-500 text-slate-950'
                    : hasAvailability
                    ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-golden-300 dark:hover:border-golden-600 text-slate-700 dark:text-slate-300'
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                }`}
                disabled={!hasAvailability}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-slate-950' : ''}`}>
                  {d.dayName}
                </span>
                <span className={`text-xl font-black mt-0.5 ${isSelected ? 'text-slate-950' : ''}`}>
                  {d.dayNum}
                </span>
                {!hasAvailability && (
                  <span className="text-[9px] mt-0.5 text-slate-300 dark:text-slate-600">Full</span>
                )}
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <p className="text-xs text-golden-700 dark:text-golden-400 font-bold">{selectedDate}</p>
        )}
      </div>

      {/* Time slots */}
      {selectedDayData ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Select Time
          </h3>

          {slotsByPeriod.map(({ period, slots }) => (
            <div key={period} className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {PERIOD_LABELS[period]}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map(slot => {
                  const isSelected = selectedTimeSlotId === slot.id;
                  const isAvailable = slot.status === 'available';
                  const isFull = slot.status === 'full';

                  return (
                    <button
                      key={slot.id}
                      onClick={() => isAvailable && onTimeSelect(slot.id, slot.label)}
                      disabled={!isAvailable}
                      className={`py-2.5 px-1 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-golden-500 border-golden-500 text-slate-950 shadow-sm'
                          : isAvailable
                          ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-golden-400 dark:hover:border-golden-500'
                          : isFull
                          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 line-through cursor-not-allowed'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {slot.label}
                      {isFull && (
                        <span className="block text-[8px] font-normal mt-0.5">Full</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-golden-50 dark:bg-golden-950/20 border border-golden-200 dark:border-golden-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-golden-600 dark:text-golden-400 shrink-0" />
          <p className="text-sm text-golden-800 dark:text-golden-300">
            Please select a date above to see available time slots.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white border border-slate-300" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
          Fully Booked
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-golden-500" />
          Selected
        </div>
      </div>
    </div>
  );
};

