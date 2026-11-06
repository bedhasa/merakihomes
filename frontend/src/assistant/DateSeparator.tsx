import React from 'react';

interface DateSeparatorProps {
  label?: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ label = 'Today' }) => (
  <div role="separator" aria-label={label} className="flex items-center gap-3 py-1">
    <span aria-hidden="true" className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{label}</span>
    <span aria-hidden="true" className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
  </div>
);
