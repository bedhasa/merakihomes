import React from 'react';

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}> = ({ open, title, body, confirmLabel, danger, busy, confirmDisabled, onCancel, onConfirm, children }) => {
  if (!open) return null;
  return <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-[60] grid place-items-center bg-[#142B4A]/50 p-4" onClick={e => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
    <section className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
      <h2 id="confirm-title" className="text-lg font-bold text-[#142B4A]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
      {children}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" disabled={busy} onClick={onCancel} className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Cancel</button>
        <button type="button" disabled={busy || confirmDisabled} onClick={onConfirm} className={`min-h-10 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50 ${danger ? 'bg-[#B42318]' : 'bg-[#142B4A]'}`}>{busy ? 'Working…' : confirmLabel}</button>
      </div>
    </section>
  </div>;
};
