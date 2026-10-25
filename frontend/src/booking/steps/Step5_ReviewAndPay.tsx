import React from 'react';
import { MapPin, Clock, Calendar, Edit2, Landmark } from 'lucide-react';
import { BookingFormData, Currency } from '@shared/types';
import { MOCK_SERVICES } from '@shared/data/mockServices';
import { formatCurrency } from '@shared/utils/formatters';

interface Step5Props {
  formData: BookingFormData;
  currency: Currency;
  onEdit: (step: number) => void;
  onChange: (field: keyof BookingFormData, value: string) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const SummarySection: React.FC<{
  title: string;
  icon: React.ReactNode;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}> = ({ title, icon, step, onEdit, children }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
        <span className="text-golden-600 dark:text-golden-400">{icon}</span>
        {title}
      </div>
      <button
        onClick={() => onEdit(step)}
        className="flex items-center gap-1 text-[11px] font-bold text-golden-700 dark:text-golden-400 hover:text-golden-800 dark:hover:text-golden-300 transition-colors"
      >
        <Edit2 className="w-3 h-3" /> Edit
      </button>
    </div>
    <div className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 space-y-1">
      {children}
    </div>
  </div>
);

function buildDetailsSummary(serviceId: string, details: BookingFormData['details']): string[] {
  const lines: string[] = [];
  switch (serviceId) {
    case 'home_cleaning':
      if (details.propertyType) lines.push(`${String(details.propertyType).charAt(0).toUpperCase() + String(details.propertyType).slice(1)}`);
      if (details.bedrooms !== undefined) lines.push(`${details.bedrooms} bedroom(s), ${details.bathrooms ?? 1} bathroom(s)`);
      if (details.cleaningType) lines.push(`${details.cleaningType === 'deep' ? 'Deep clean' : 'Standard clean'}`);
      if (details.materialsNeeded) lines.push('Cleaning materials provided by Meraki');
      break;
    case 'childcare_nanny':
      if (details.numberOfChildren) lines.push(`${details.numberOfChildren} child(ren)`);
      if (details.ageRange) lines.push(`Age group: ${String(details.ageRange).replace('_', ' ')}`);
      if (details.hoursNeeded) lines.push(`${details.hoursNeeded} hour(s) needed`);
      break;
    case 'cooking_service':
      if (details.numberOfPeople) lines.push(`${details.numberOfPeople} person(s)`);
      if (details.mealType) lines.push(`Meal preference: ${details.mealType}`);
      if (details.occasion) lines.push(`Occasion: ${String(details.occasion).replace('_', ' ')}`);
      break;
    case 'handyman_plumbing':
      if (details.jobType) lines.push(`Job type: ${details.jobType}`);
      if (details.estimatedHours) lines.push(`Estimated: ${details.estimatedHours}h`);
      if (details.description) lines.push(`${String(details.description).slice(0, 60)}${String(details.description).length > 60 ? '...' : ''}`);
      break;
  }
  return lines.length > 0 ? lines : ['No details added'];
}

export const Step5_ReviewAndPay: React.FC<Step5Props> = ({
  formData,
  currency,
  onEdit,
  onChange,
  onConfirm,
  isSubmitting,
}) => {
  const service = MOCK_SERVICES.find(s => s.id === formData.serviceId);
  const detailLines = service ? buildDetailsSummary(service.id, formData.details) : [];

  const isValid =
    formData.serviceId &&
    formData.customerName &&
    formData.phone &&
    formData.subcity &&
    formData.area &&
    formData.selectedDateStr &&
    formData.selectedTimeSlotId;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Review your booking</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Confirm everything looks right before submitting.
        </p>
      </div>

      {/* Summary sections */}
      <SummarySection title="Service" icon={<span>✨</span>} step={1} onEdit={onEdit}>
        <p className="font-bold text-slate-900 dark:text-white">{service?.name}</p>
        <p className="text-xs text-golden-700 dark:text-golden-400 font-bold">
          Starting from {service ? formatCurrency(service.basePrice, currency) : '—'} / {service?.unit}
        </p>
      </SummarySection>

      <SummarySection title="Service Details" icon={<span>📋</span>} step={2} onEdit={onEdit}>
        {detailLines.map((line, i) => (
          <p key={i} className="text-xs text-slate-600 dark:text-slate-400">{line}</p>
        ))}
      </SummarySection>

      <SummarySection title="Location" icon={<MapPin className="w-4 h-4" />} step={3} onEdit={onEdit}>
        <p className="font-bold text-slate-900 dark:text-white">{formData.customerName}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">{formData.phone}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
          {[formData.area, formData.subcity, 'Addis Ababa'].filter(Boolean).join(', ')}
        </p>
        {formData.landmark && (
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Near {formData.landmark}</p>
        )}
      </SummarySection>

      <SummarySection title="Date & Time" icon={<Calendar className="w-4 h-4" />} step={4} onEdit={onEdit}>
        <p className="font-bold text-slate-900 dark:text-white">{formData.selectedDate || '—'}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {formData.selectedTimeSlotLabel || '—'}
        </p>
      </SummarySection>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        Payment is not collected at this step. A supported payment method and verified provider response are required before any payment can be recorded.
      </div>
      {/* Price estimate note */}
      <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl">
        <Landmark className="w-4 h-4 text-golden-600 dark:text-golden-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Starting estimate</strong> only; Meraki will discuss the final scope and price with you before confirmation. Starting from{' '}
          <strong className="text-golden-700 dark:text-golden-400">{service ? formatCurrency(service.basePrice, currency) : '—'}</strong>.
          No payment charged until you approve.
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={onConfirm}
        disabled={!isValid || isSubmitting}
        className="w-full py-4 bg-golden-500 hover:bg-golden-400 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-black text-base rounded-2xl shadow-md transition-all active:scale-[0.98]"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          'Request Booking →'
        )}
      </button>

      {!isValid && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Please complete all required steps before confirming.
        </p>
      )}

      <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
        By submitting, you agree to Meraki Homes terms and conditions.
      </p>
    </div>
  );
};


