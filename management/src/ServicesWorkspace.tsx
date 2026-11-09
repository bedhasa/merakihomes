import React, { useEffect, useState } from 'react';
import { ApiError, createManagementService, getManagementServices, ManagementService, saveManagementService } from '@shared/api';
import { ImageUploadField } from './ImageUploadField';
import { ServicePackageEditor } from './ServicePackageEditor';
import { ServiceQuestionsEditor } from './ServiceQuestionsEditor';

const errorText = (e: unknown) => e instanceof ApiError ? e.message : 'The API could not be reached.';

export const ServicesWorkspace: React.FC = () => {
  const [rows, setRows] = useState<ManagementService[]>([]);
  const [busy, setBusy] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const load = () => { setBusy(true); setError(''); getManagementServices().then(setRows).catch(e => setError(errorText(e))).finally(() => setBusy(false)); };
  useEffect(load, []);
  const update = (id: string, patch: Partial<ManagementService>) => setRows(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  const save = async (s: ManagementService) => {
    setSavingId(s.id); setError('');
    try { await saveManagementService(s); setNotice(`${s.name} saved. Website and mobile catalogue now use this price and copy.`); }
    catch (e) { setError(errorText(e)); }
    finally { setSavingId(''); }
  };
  const shown = rows.filter(s => `${s.name} ${s.description} ${s.id}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8C6A2F]">Catalogue</p><h1 className="mt-1 text-[26px] font-bold text-[#142B4A]">Services & packages</h1><p className="mt-1.5 text-sm text-slate-500">Change service copy, prices, images, and packages here. Saved values are what customers see on the website and mobile booking screens.</p></div>
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
    <CreateServiceForm onCreated={load} />
    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search services" className="mb-4 h-11 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 text-sm" />
    <div className="space-y-4">{shown.map(s => <article key={s.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button type="button" onClick={() => setOpenId(openId === s.id ? null : s.id)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
        <div className="flex min-w-0 items-center gap-3">{s.image ? <img src={s.image} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E9EFF5] text-xs font-bold text-[#142B4A]">{s.name.slice(0, 1)}</span>}<div className="min-w-0"><h2 className="truncate font-bold text-[#142B4A]">{s.name}</h2><p className="text-xs text-slate-500">{s.pricing_type === 'fixed' ? `${s.base_price} ${s.currency}` : 'Quoted after review'} · {s.is_active ? 'Published' : 'Hidden'}</p></div></div>
        <span className="text-xs font-semibold text-[#8C6A2F]">{openId === s.id ? 'Hide' : 'Edit'}</span>
      </button>
      {openId === s.id ? <div className="border-t border-slate-100 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium">Service name<input value={s.name} onChange={e => update(s.id, { name: e.target.value })} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
          <label className="text-xs font-medium">Pricing type<select value={s.pricing_type} onChange={e => update(s.id, { pricing_type: e.target.value as ManagementService['pricing_type'] })} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm"><option value="quotation">Quote after review</option><option value="fixed">Fixed starting price</option></select></label>
          <label className="text-xs font-medium sm:col-span-2">Description<textarea rows={2} value={s.description} onChange={e => update(s.id, { description: e.target.value })} className="mt-1 w-full rounded-lg border p-3 text-sm" /></label>
          <label className="text-xs font-medium">Starting price<input type="number" min="0" step="0.01" value={s.base_price} onChange={e => update(s.id, { base_price: e.target.value })} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
          <label className="text-xs font-medium">Currency<select value={s.currency} onChange={e => update(s.id, { currency: e.target.value })} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm"><option>ETB</option><option>USD</option></select></label>
          <label className="text-xs font-medium">Unit<input value={s.unit} onChange={e => update(s.id, { unit: e.target.value })} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
          <label className="text-xs font-medium">Duration (minutes)<input type="number" min="1" max="1440" value={s.estimated_duration_minutes || 60} onChange={e => update(s.id, { estimated_duration_minutes: Number(e.target.value) })} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
          <div className="sm:col-span-2"><ImageUploadField label="Service image" value={s.image || ''} onChange={image => update(s.id, { image })} /></div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={s.is_active} onChange={e => update(s.id, { is_active: e.target.checked })} />Published on website and mobile</label>
          <button type="button" disabled={savingId === s.id} onClick={() => void save(s)} className="min-h-11 rounded-lg bg-[#142B4A] px-4 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">{savingId === s.id ? 'Saving…' : 'Save service'}</button>
        </div>
        <ServicePackageEditor serviceId={s.id} serviceName={s.name} />
        <ServiceQuestionsEditor serviceId={s.id} />
      </div> : null}
    </article>)}{!busy && !shown.length && <p className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">No services match.</p>}</div>
  </>;
};

const CreateServiceForm: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [id, setId] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('0');
  const [duration, setDuration] = useState('60');
  const [unit, setUnit] = useState('visit');
  const [pricingType, setPricingType] = useState<'fixed' | 'quotation'>('quotation');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <div className="mb-5 rounded-2xl border border-slate-200 bg-white">
    <button type="button" onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between px-5 py-4 text-left"><span className="font-bold text-[#142B4A]">Add a service</span><span className="text-xs font-semibold text-[#8C6A2F]">{open ? 'Hide' : 'Open'}</span></button>
    {open ? <form className="border-t border-slate-100 p-5" onSubmit={async e => { e.preventDefault(); setBusy(true); setError(''); try { await createManagementService({ id, name, description, pricingType, basePrice: Number(price), currency: 'ETB', unit, durationMinutes: Number(duration), image, active: true }); setName(''); setId(''); setDescription(''); setImage(''); setPrice('0'); setOpen(false); onCreated(); } catch (err) { setError(errorText(err)); } finally { setBusy(false); } }}>
      {error && <p role="alert" className="mb-3 text-xs text-red-800">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-medium">Service name<input required value={name} onChange={e => { setName(e.target.value); setId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')); }} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
        <label className="text-xs font-medium">Service ID<input required pattern="[a-z][a-z0-9_]{2,79}" value={id} onChange={e => setId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
        <label className="text-xs font-medium md:col-span-2">Description<textarea required value={description} onChange={e => setDescription(e.target.value)} className="mt-1 min-h-20 w-full rounded-lg border p-3 text-sm" /></label>
        <div className="md:col-span-2"><ImageUploadField label="Service image" value={image} onChange={setImage} /></div>
        <label className="text-xs font-medium">Pricing model<select value={pricingType} onChange={e => setPricingType(e.target.value as 'fixed' | 'quotation')} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm"><option value="quotation">Quote after review</option><option value="fixed">Fixed starting price</option></select></label>
        <div className="grid grid-cols-3 gap-2"><label className="text-xs font-medium">Starting ETB<input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label><label className="text-xs font-medium">Minutes<input type="number" min="1" max="1440" value={duration} onChange={e => setDuration(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label><label className="text-xs font-medium">Unit<input required value={unit} onChange={e => setUnit(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label></div>
        <button disabled={busy} className="min-h-11 rounded-lg bg-[#142B4A] text-sm font-semibold text-white md:col-span-2">{busy ? 'Saving…' : 'Create service'}</button>
      </div>
    </form> : null}
  </div>;
};
