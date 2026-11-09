import React, { useState } from 'react';
import { ApiError, uploadManagementImage } from '@shared/api';

export const ImageUploadField: React.FC<{ label: string; value: string; onChange: (url: string) => void; onBusyChange?: (busy: boolean) => void }> = ({ label, value, onChange, onBusyChange }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pick = async (input: HTMLInputElement, file?: File) => {
    if (!file) return;
    if (file.type && !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) { setError('Use a JPEG, PNG, or WebP image.'); input.value = ''; return; }
    if (file.size > 12 * 1024 * 1024) { setError('Choose an image under 12 MB. It will be compressed before upload.'); input.value = ''; return; }
    const previous = value;
    setBusy(true); onBusyChange?.(true); setError('');
    try { onChange(await uploadManagementImage(file)); }
    catch (e) { onChange(previous); setError(e instanceof ApiError ? e.message : 'The image could not be uploaded.'); }
    finally { setBusy(false); onBusyChange?.(false); input.value = ''; }
  };
  return <label className="block text-xs font-medium text-slate-600">{label}
    <input type="text" inputMode="url" value={value} onChange={e => onChange(e.target.value)} placeholder="Upload a photo or paste an https image URL" className="mt-1 h-10 w-full rounded border border-slate-300 px-3 text-sm" />
    <input type="file" accept="image/jpeg,image/png,image/webp,image/*" className="mt-2 block text-xs" disabled={busy} onChange={e => void pick(e.currentTarget, e.currentTarget.files?.[0])} />
    {busy ? <p className="mt-1 text-xs text-slate-500">Compressing and uploading…</p> : null}
    {error ? <p role="alert" className="mt-1 text-xs text-red-700">{error}</p> : null}
    {value ? <img src={value} alt="" className="mt-2 h-28 w-full rounded object-cover" onError={e => { e.currentTarget.style.opacity = '0.3'; }} /> : null}
  </label>;
};
