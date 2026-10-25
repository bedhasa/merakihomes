import React from 'react';
import { MapPin, Phone, User, Navigation } from 'lucide-react';
import { BookingFormData } from '@shared/types';

interface Step3Props {
  formData: Pick<BookingFormData, 'customerName' | 'phone' | 'subcity' | 'area' | 'landmark' | 'additionalDirections'>;
  onChange: (field: keyof BookingFormData, value: string) => void;
}

const ADDIS_SUBCITIES = [
  'Bole',
  'Kirkos',
  'Nifas Silk-Lafto',
  'Yeka',
  'Kolfe Keranio',
  'Akaki Kaliti',
  'Lideta',
  'Gulele',
  'Addis Ketema',
  'Lemi Kura',
];

const Field: React.FC<{
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, required, icon, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
      {icon && <span className="text-golden-600 dark:text-golden-400">{icon}</span>}
      {label}
      {required && <span className="text-golden-600">*</span>}
    </label>
    {children}
  </div>
);

const inputClass =
  'w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500 transition';

export const Step3_Location: React.FC<Step3Props> = ({ formData, onChange }) => {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Where should we come?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your address stays private and is only shared with your assigned professional.
        </p>
      </div>

      {/* Contact info */}
      <div className="p-4 bg-golden-50 dark:bg-golden-950/20 border border-golden-200 dark:border-golden-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-golden-800 dark:text-golden-300 uppercase tracking-wider">
          Your Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" required icon={<User className="w-3.5 h-3.5" />}>
            <input
              type="text"
              value={formData.customerName}
              onChange={e => onChange('customerName', e.target.value)}
              placeholder="e.g. Dr. Kebede Tadesse"
              className={inputClass}
            />
          </Field>
          <Field label="Phone Number" required icon={<Phone className="w-3.5 h-3.5" />}>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => onChange('phone', e.target.value)}
              placeholder="+251 91 123 4567"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Address */}
      <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-golden-600 dark:text-golden-400" />
          Service Location — Addis Ababa
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Sub-city / Kifle Ketema" required>
            <select
              value={formData.subcity}
              onChange={e => onChange('subcity', e.target.value)}
              className={inputClass}
            >
              {ADDIS_SUBCITIES.map(sc => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </Field>

          <Field label="Area / Neighborhood" required>
            <input
              type="text"
              value={formData.area}
              onChange={e => onChange('area', e.target.value)}
              placeholder="e.g. Around Atlas, Gerji, Sarbet..."
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Landmark / Nearby Place" required icon={<Navigation className="w-3.5 h-3.5" />}>
          <input
            type="text"
            value={formData.landmark}
            onChange={e => onChange('landmark', e.target.value)}
            placeholder="e.g. Near Edna Mall, behind Total petrol station..."
            className={inputClass}
          />
        </Field>

        <Field label="Additional Directions (Optional)">
          <textarea
            rows={3}
            value={formData.additionalDirections}
            onChange={e => onChange('additionalDirections', e.target.value)}
            placeholder="e.g. 3rd floor, gate code is 402, blue door. Call when nearby..."
            className={`${inputClass} resize-none`}
          />
        </Field>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
        🔒 Your address is only shared with your assigned Meraki professional.
      </p>
    </div>
  );
};

