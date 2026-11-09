import React from 'react';
import { Check } from 'lucide-react';

interface BookingProgressBarProps {
  currentStep: number;
}

const STEPS = [
  { num: 1, label: 'Service' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'Location' },
  { num: 4, label: 'Worker' },
  { num: 5, label: 'Review' },
];

export const BookingProgressBar: React.FC<BookingProgressBarProps> = ({ currentStep }) => {
  const displayStep = Math.max(1, Math.min(currentStep, STEPS.length));

  return (
    <nav aria-label="Booking progress" className="rounded-2xl border border-slate-200/80 bg-white px-3 py-5 shadow-sm sm:px-8 sm:py-6">
      <ol className="mx-auto flex max-w-4xl items-start">
        {STEPS.map((step, index) => {
          const completed = displayStep > step.num;
          const active = displayStep === step.num;
          const last = index === STEPS.length - 1;
          return (
            <li key={step.num} aria-current={active ? 'step' : undefined} className={`flex min-w-0 items-start ${last ? '' : 'flex-1'}`}>
              <div className="flex min-w-0 flex-col items-center text-center">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border text-sm font-bold transition-all duration-[250ms] ease-out sm:h-14 sm:w-14 ${completed ? 'border-[#102A43] bg-[#102A43] text-white' : active ? 'scale-105 border-[#102A43] bg-[#102A43] text-white shadow-[0_0_0_4px_rgba(212,168,83,.2)]' : 'border-slate-300 bg-white text-slate-500'}`}>
                  {completed ? <Check size={19} aria-label="Completed" /> : step.num}
                </span>
                <span className={`mt-3 max-w-16 text-[10px] font-semibold leading-tight sm:max-w-none sm:text-xs ${active ? 'text-[#102A43]' : completed ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</span>
              </div>
              {!last && <span aria-hidden="true" className={`mx-1 mt-[21px] h-0.5 min-w-1 flex-1 rounded-full transition-colors duration-[250ms] ease-out sm:mx-6 sm:mt-7 ${completed ? 'bg-[#102A43]' : 'bg-slate-200'}`} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
