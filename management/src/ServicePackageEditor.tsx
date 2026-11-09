import React, { useEffect, useState } from 'react';
import { ApiError, createManagementServicePackage, getManagementServicePackages, ManagementServicePackage, saveManagementServicePackage } from '@shared/api';

const message = (error: unknown) => error instanceof ApiError ? error.message : 'Could not reach the API. Try again.';

export const ServicePackageEditor: React.FC<{ serviceId: string; serviceName: string }> = ({ serviceId, serviceName }) => {
  const [rows, setRows] = useState<ManagementServicePackage[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState({ name: '', description: '', base_price: '', currency: 'ETB' as 'ETB' | 'USD', estimated_duration_minutes: '60' });
  const load = () => { setBusy(true); setError(''); getManagementServicePackages(serviceId).then(setRows).catch(e => setError(message(e))).finally(() => setBusy(false)); };
  useEffect(load, [serviceId]);
  const update = (id: string, patch: Partial<ManagementServicePackage>) => setRows(current => current.map(row => row.id === id ? { ...row, ...patch } : row));
  const save = async (row: ManagementServicePackage) => {
    setSaving(row.id); setError('');
    try {
      await saveManagementServicePackage(serviceId, { ...row, base_price: Number(row.base_price), estimated_duration_minutes: Number(row.estimated_duration_minutes) || 60 });
      setNotice(`${row.name} price and details saved for ${serviceName}.`);
      load();
    } catch (e) { setError(message(e)); }
    finally { setSaving(''); }
  };
  const create = async () => {
    setSaving('new'); setError('');
    try {
      await createManagementServicePackage(serviceId, { name: draft.name.trim(), description: draft.description.trim(), base_price: Number(draft.base_price), currency: draft.currency, estimated_duration_minutes: Number(draft.estimated_duration_minutes) || 60, is_active: true });
      setDraft({ name: '', description: '', base_price: '', currency: 'ETB', estimated_duration_minutes: '60' });
      setNotice('Package added. It now appears on website and mobile booking.');
      load();
    } catch (e) { setError(message(e)); }
    finally { setSaving(''); }
  };
  return <section className="mt-6 rounded-xl border border-slate-200 bg-[#F7F8FA] p-4">
    <h3 className="text-sm font-bold text-[#142B4A]">Packages for {serviceName}</h3>
    <p className="mt-1 text-xs text-slate-500">Edit the live package price here. Customers always receive the saved backend price.</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mt-2 text-sm text-emerald-800">{notice}</p>}
    {busy ? <p className="mt-3 text-sm text-slate-500">Loading packages…</p> : <div className="mt-3 space-y-3">{rows.map(row => <article key={row.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-6">
      <label className="text-xs lg:col-span-2">Package name<input value={row.name} onChange={e => update(row.id, { name: e.target.value })} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label>
      <label className="text-xs lg:col-span-2">Description<input value={row.description} onChange={e => update(row.id, { description: e.target.value })} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label>
      <label className="text-xs">Price<input type="number" min="0" value={row.base_price} onChange={e => update(row.id, { base_price: e.target.value })} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label>
      <label className="text-xs">Minutes<input type="number" min="1" value={row.estimated_duration_minutes} onChange={e => update(row.id, { estimated_duration_minutes: Number(e.target.value) })} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label>
      <label className="flex items-center gap-2 text-xs lg:col-span-3"><input type="checkbox" checked={row.is_active} onChange={e => update(row.id, { is_active: e.target.checked })} />Show on booking screens</label>
      <button type="button" disabled={saving === row.id} onClick={() => void save(row)} className="min-h-10 rounded-lg bg-[#142B4A] px-3 text-sm font-semibold text-white disabled:opacity-50 lg:col-span-3">{saving === row.id ? 'Saving…' : 'Save package'}</button>
    </article>)}{!rows.length && <p className="text-sm text-slate-500">No packages yet. Add one below so customers can pick a priced option.</p>}</div>}
    <div className="mt-4 border-t border-slate-200 pt-4">
      <h4 className="text-sm font-semibold text-[#142B4A]">Add a package</h4>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="text-xs lg:col-span-2">Name<input value={draft.name} onChange={e => setDraft(v => ({ ...v, name: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label>
        <label className="text-xs lg:col-span-2">Description<input value={draft.description} onChange={e => setDraft(v => ({ ...v, description: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label>
        <label className="text-xs">Price<input type="number" min="0" value={draft.base_price} onChange={e => setDraft(v => ({ ...v, base_price: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label>
        <label className="text-xs">Minutes<input type="number" min="1" value={draft.estimated_duration_minutes} onChange={e => setDraft(v => ({ ...v, estimated_duration_minutes: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label>
        <button type="button" disabled={saving === 'new' || !draft.name.trim() || draft.base_price === ''} onClick={() => void create()} className="min-h-10 rounded-lg border border-[#D6A94F] bg-white px-3 text-sm font-semibold text-[#142B4A] disabled:opacity-50 lg:col-span-6">{saving === 'new' ? 'Saving…' : 'Add package'}</button>
      </div>
    </div>
  </section>;
};
