import React from 'react';
import { Check } from 'lucide-react';

interface BookingProgressBarProps {
  currentStep: number; // 1-5 (step 6 is confirmation, shown as step 5 completed)
}

const STEPS = [
  { num: 1, label: 'Service' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'Location' },
  { num: 4, label: 'Schedule' },
  { num: 5, label: 'Confirm' },
];

export const BookingProgressBar: React.FC<BookingProgressBarProps> = ({ currentStep }) => {
  const displayStep = Math.min(currentStep, 5);

  return (
    <div className="px-4 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center max-w-lg mx-auto">
        {STEPS.map((step, idx) => {
          const isCompleted = displayStep > step.num;
          const isActive = displayStep === step.num;
          const isLast = idx === STEPS.length - 1;

          return (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-200 ${
                    isCompleted
                      ? 'bg-golden-500 text-slate-950'
                      : isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-golden-500 ring-offset-1'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span
                  className={`text-[9px] font-bold hidden sm:block tracking-wide ${
                    isActive
                      ? 'text-slate-900 dark:text-white'
                      : isCompleted
                      ? 'text-golden-600 dark:text-golden-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-1.5 rounded-full transition-all duration-300 ${
                    displayStep > step.num
                      ? 'bg-golden-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
