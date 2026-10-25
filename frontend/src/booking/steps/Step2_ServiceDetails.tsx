import React from 'react';
import { BookingFormData } from '@shared/types';

interface Step2Props {
  serviceId: string;
  details: BookingFormData['details'];
  onChange: (key: string, value: string | number | boolean) => void;
}

// ── Shared UI atoms ──────────────────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
    {children}
  </label>
);

const Select: React.FC<{
  value: string | number;
  onChange: (v: string) => void;
  children: React.ReactNode;
}> = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500 transition"
  >
    {children}
  </select>
);

const Textarea: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => (
  <textarea
    rows={3}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-golden-500 focus:ring-1 focus:ring-golden-500 transition resize-none"
  />
);

// Stepper: increment/decrement number
const NumberStepper: React.FC<{
  label: string;
  fieldKey: string;
  value: number;
  min?: number;
  max?: number;
  suffix?: string;
  onChange: (key: string, val: number) => void;
}> = ({ label, fieldKey, value, min = 1, max = 10, suffix = '', onChange }) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => onChange(fieldKey, Math.max(min, value - 1))}
        className="w-10 h-10 rounded-l-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-black text-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition"
      >
        −
      </button>
      <div className="flex-1 h-10 bg-white dark:bg-slate-800 border-t border-b border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-slate-900 dark:text-white text-sm">
        {value}{suffix}
      </div>
      <button
        type="button"
        onClick={() => onChange(fieldKey, Math.min(max, value + 1))}
        className="w-10 h-10 rounded-r-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-black text-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition"
      >
        +
      </button>
    </div>
  </div>
);

// Toggle chip group
const ChipGroup: React.FC<{
  label: string;
  fieldKey: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (key: string, val: string) => void;
}> = ({ label, fieldKey, value, options, onChange }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(fieldKey, o.value)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
            value === o.value
              ? 'bg-golden-500 border-golden-500 text-slate-950'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-golden-400 dark:hover:border-golden-600'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

// ── Service-specific forms ────────────────────────────────────────────────────

const CleaningForm: React.FC<{ details: BookingFormData['details']; onChange: Step2Props['onChange'] }> = ({ details, onChange }) => (
  <div className="space-y-5">
    <ChipGroup
      label="Property Type"
      fieldKey="propertyType"
      value={(details.propertyType as string) || 'apartment'}
      options={[
        { value: 'apartment', label: 'Apartment' },
        { value: 'villa', label: 'Villa' },
        { value: 'condominium', label: 'Condominium' },
        { value: 'office', label: 'Office / Studio' },
      ]}
      onChange={onChange}
    />
    <div className="grid grid-cols-2 gap-4">
      <NumberStepper label="Bedrooms" fieldKey="bedrooms" value={(details.bedrooms as number) || 1} min={0} max={8} onChange={onChange} />
      <NumberStepper label="Bathrooms" fieldKey="bathrooms" value={(details.bathrooms as number) || 1} min={0} max={5} onChange={onChange} />
    </div>
    <ChipGroup
      label="Cleaning Type"
      fieldKey="cleaningType"
      value={(details.cleaningType as string) || 'standard'}
      options={[
        { value: 'standard', label: 'Standard Clean' },
        { value: 'deep', label: 'Deep Clean (+extra)' },
      ]}
      onChange={onChange}
    />
    <div className="space-y-1.5">
      <Label>Cleaning Materials</Label>
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
        <span className="text-sm text-slate-700 dark:text-slate-300">Meraki provides cleaning supplies</span>
        <button
          type="button"
          onClick={() => onChange('materialsNeeded', !details.materialsNeeded)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            details.materialsNeeded ? 'bg-golden-500' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            details.materialsNeeded ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </div>
    </div>
    <div className="space-y-1">
      <Label>Special Instructions (Optional)</Label>
      <Textarea
        value={(details.specialInstructions as string) || ''}
        onChange={v => onChange('specialInstructions', v)}
        placeholder="e.g. Focus on kitchen and bathrooms, avoid the study room..."
      />
    </div>
  </div>
);

const ChildcareForm: React.FC<{ details: BookingFormData['details']; onChange: Step2Props['onChange'] }> = ({ details, onChange }) => (
  <div className="space-y-5">
    <NumberStepper label="Number of Children" fieldKey="numberOfChildren" value={(details.numberOfChildren as number) || 1} min={1} max={5} onChange={onChange} />
    <ChipGroup
      label="Child Age Range"
      fieldKey="ageRange"
      value={(details.ageRange as string) || 'toddler'}
      options={[
        { value: 'infant', label: 'Infant (0–1)' },
        { value: 'toddler', label: 'Toddler (1–3)' },
        { value: 'preschool', label: 'Preschool (3–6)' },
        { value: 'school_age', label: 'School Age (6–12)' },
      ]}
      onChange={onChange}
    />
    <NumberStepper label="Hours Needed" fieldKey="hoursNeeded" value={(details.hoursNeeded as number) || 3} min={1} max={12} suffix="h" onChange={onChange} />
    <div className="space-y-1">
      <Label>Special Needs / Notes (Optional)</Label>
      <Textarea
        value={(details.specialNeeds as string) || ''}
        onChange={v => onChange('specialNeeds', v)}
        placeholder="e.g. Allergies, medical conditions, bedtime routines..."
      />
    </div>
  </div>
);

const CookingForm: React.FC<{ details: BookingFormData['details']; onChange: Step2Props['onChange'] }> = ({ details, onChange }) => (
  <div className="space-y-5">
    <NumberStepper label="Number of People" fieldKey="numberOfPeople" value={(details.numberOfPeople as number) || 2} min={1} max={20} onChange={onChange} />
    <ChipGroup
      label="Meal Preference"
      fieldKey="mealType"
      value={(details.mealType as string) || 'ethiopian'}
      options={[
        { value: 'ethiopian', label: '🇪🇹 Ethiopian' },
        { value: 'international', label: '🌍 International' },
        { value: 'both', label: '🍽️ Both' },
      ]}
      onChange={onChange}
    />
    <ChipGroup
      label="Occasion"
      fieldKey="occasion"
      value={(details.occasion as string) || 'daily'}
      options={[
        { value: 'daily', label: 'Daily Meals' },
        { value: 'meal_prep', label: 'Weekly Meal Prep' },
        { value: 'event', label: 'Special Event' },
        { value: 'guests', label: 'Guests / Hosting' },
      ]}
      onChange={onChange}
    />
    <div className="space-y-1">
      <Label>Dietary Restrictions / Preferences (Optional)</Label>
      <Textarea
        value={(details.dietaryNeeds as string) || ''}
        onChange={v => onChange('dietaryNeeds', v)}
        placeholder="e.g. Vegetarian, no pork, gluten-free, spice level..."
      />
    </div>
  </div>
);

const HandymanForm: React.FC<{ details: BookingFormData['details']; onChange: Step2Props['onChange'] }> = ({ details, onChange }) => (
  <div className="space-y-5">
    <ChipGroup
      label="Type of Job"
      fieldKey="jobType"
      value={(details.jobType as string) || 'general'}
      options={[
        { value: 'plumbing', label: '🔧 Plumbing' },
        { value: 'electrical', label: '⚡ Electrical' },
        { value: 'general', label: '🔨 General Repair' },
        { value: 'painting', label: '🎨 Painting' },
        { value: 'mounting', label: '📺 Mounting / Drilling' },
      ]}
      onChange={onChange}
    />
    <NumberStepper label="Estimated Hours" fieldKey="estimatedHours" value={(details.estimatedHours as number) || 2} min={1} max={8} suffix="h" onChange={onChange} />
    <div className="space-y-1">
      <Label>Describe the Problem *</Label>
      <Textarea
        value={(details.description as string) || ''}
        onChange={v => onChange('description', v)}
        placeholder="e.g. Leaking kitchen pipe under the sink, needs urgent fix. Have not tried DIY."
      />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const SERVICE_TITLES: Record<string, string> = {
  home_cleaning: 'Cleaning Details',
  childcare_nanny: 'Childcare Details',
  cooking_service: 'Cooking Details',
  handyman_plumbing: 'Job Details',
};

const SERVICE_SUBTITLES: Record<string, string> = {
  home_cleaning: 'Help us prepare the right team for your space',
  childcare_nanny: 'Tell us about who needs care',
  cooking_service: 'Help our chef plan the perfect meal',
  handyman_plumbing: 'Describe what needs to be fixed',
};

export const Step2_ServiceDetails: React.FC<Step2Props> = ({ serviceId, details, onChange }) => {
  const title = SERVICE_TITLES[serviceId] ?? 'Service Details';
  const subtitle = SERVICE_SUBTITLES[serviceId] ?? 'Provide details for your booking';

  const renderForm = () => {
    switch (serviceId) {
      case 'home_cleaning':
        return <CleaningForm details={details} onChange={onChange} />;
      case 'childcare_nanny':
        return <ChildcareForm details={details} onChange={onChange} />;
      case 'cooking_service':
        return <CookingForm details={details} onChange={onChange} />;
      case 'handyman_plumbing':
        return <HandymanForm details={details} onChange={onChange} />;
      default:
        return (
          <div className="space-y-1">
            <Label>Additional Notes</Label>
            <Textarea
              value={(details.notes as string) || ''}
              onChange={v => onChange('notes', v)}
              placeholder="Describe what you need..."
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {renderForm()}
    </div>
  );
};

