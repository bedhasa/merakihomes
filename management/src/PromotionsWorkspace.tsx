import React, { useEffect, useState } from 'react';
import { ApiError, createManagementHomePromotion, getManagementHomePromotions, HomePromotion, saveManagementHomePromotion } from '@shared/api';
import { ImageUploadField } from './ImageUploadField';

const errorText = (e: unknown) => e instanceof ApiError ? e.message : 'The API could not be reached.';
const blank: Omit<HomePromotion, 'id' | 'updatedAt'> = { title: '', body: '', code: '', imageUrl: '', mobileImageUrl: '', isActive: true, displayOrder: 0 };

const MobileCardPreview: React.FC<{ title: string; body: string; code: string; imageUrl: string; mobileImageUrl?: string }> = ({ title, body, code, imageUrl, mobileImageUrl }) => {
  const src = mobileImageUrl || imageUrl;
  return <div className="mx-auto w-[320px] rounded-[32px] border-[8px] border-[#142B4A] bg-[#142B4A] p-2 shadow-xl">
    <div className="relative h-[190px] overflow-hidden rounded-[22px] bg-[#142B4A]">
      {src ? <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
      <div className="absolute inset-0 bg-[#04182B]/70" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-[#FFE0A0] px-2.5 py-1 text-[10px] font-black tracking-wide text-[#5B4000]">{code || 'PROMOTION'}</span>
          <p className="mt-2 line-clamp-2 text-[18px] font-black leading-6 text-white">{title || 'Card title'}</p>
          <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-[#E0E8EF]">{body || 'Short promotional message'}</p>
        </div>
        <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#FFE0A0]">{code || 'MERAKI HOMES'}</span><span className="rounded-xl bg-[#FFE0A0] px-3 py-1.5 text-[11px] font-extrabold text-[#142B4A]">Browse</span></div>
      </div>
    </div>
  </div>;
};

export const PromotionsWorkspace: React.FC = () => {
  const [rows, setRows] = useState<HomePromotion[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState(blank);
  const [uploading, setUploading] = useState(false);
  const load = () => { setBusy(true); getManagementHomePromotions().then(setRows).catch(e => setError(errorText(e))).finally(() => setBusy(false)); };
  useEffect(load, []);
  const change = (id: string, patch: Partial<HomePromotion>) => setRows(current => current.map(row => row.id === id ? { ...row, ...patch } : row));
  const save = async (row: HomePromotion) => {
    setSaving(row.id); setError('');
    try { await saveManagementHomePromotion(row); setNotice(row.isActive ? `${row.title} is now on the mobile home carousel.` : `${row.title} was saved but hidden from the mobile home screen.`); }
    catch (e) { setError(errorText(e)); }
    finally { setSaving(''); }
  };
  const create = async () => {
    setSaving('new'); setError('');
    try { await createManagementHomePromotion(draft); setDraft(blank); setNotice('Carousel card added to the mobile home screen.'); load(); }
    catch (e) { setError(errorText(e)); }
    finally { setSaving(''); }
  };
  const shown = rows.filter(row => `${row.title} ${row.body} ${row.code}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8C6A2F]">Mobile app</p><h1 className="mt-1 text-[26px] font-bold text-[#142B4A]">Home carousel cards</h1><p className="mt-1.5 max-w-2xl text-sm text-slate-500">These cards appear in the promotional banner carousel on the mobile home screen. Add a new card or edit an existing one. Unpublished cards stay off the phone.</p></div>
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
    <form className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-[320px_1fr]" onSubmit={e => { e.preventDefault(); void create(); }}>
      <MobileCardPreview title={draft.title} body={draft.body} code={draft.code} imageUrl={draft.imageUrl} mobileImageUrl={draft.mobileImageUrl} />
      <div className="grid gap-3 sm:grid-cols-2">
        <h2 className="text-sm font-bold text-[#142B4A] sm:col-span-2">Add a mobile carousel card</h2>
        <label className="text-xs font-medium">Title *<input required value={draft.title} onChange={e => setDraft(v => ({ ...v, title: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
        <label className="text-xs font-medium">Badge<input value={draft.code} onChange={e => setDraft(v => ({ ...v, code: e.target.value }))} placeholder="SEASONAL CARE" className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
        <label className="text-xs font-medium sm:col-span-2">Description<textarea value={draft.body} onChange={e => setDraft(v => ({ ...v, body: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border p-3 text-sm" /></label>
        <ImageUploadField label="Carousel image" value={draft.mobileImageUrl || draft.imageUrl} onChange={url => setDraft(v => ({ ...v, imageUrl: url, mobileImageUrl: url }))} onBusyChange={setUploading} />
        <label className="text-xs font-medium">Display order<input type="number" min="0" value={draft.displayOrder} onChange={e => setDraft(v => ({ ...v, displayOrder: Number(e.target.value) }))} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={draft.isActive} onChange={e => setDraft(v => ({ ...v, isActive: e.target.checked }))} />Show on mobile home</label>
        <button disabled={saving === 'new' || uploading} className="min-h-11 rounded-lg bg-[#142B4A] text-sm font-semibold text-white sm:col-span-2">{uploading ? 'Uploading image…' : saving === 'new' ? 'Saving…' : 'Add carousel card'}</button>
      </div>
    </form>
    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search carousel cards" className="mb-4 h-11 w-full max-w-md rounded-lg border bg-white px-3 text-sm" />
    <div className="grid gap-5 xl:grid-cols-2">{shown.map(row => <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-5">
      <MobileCardPreview title={row.title} body={row.body} code={row.code} imageUrl={row.imageUrl} mobileImageUrl={row.mobileImageUrl} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium sm:col-span-2">Title<input value={row.title} onChange={e => change(row.id, { title: e.target.value })} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
        <label className="text-xs font-medium">Badge<input value={row.code} onChange={e => change(row.id, { code: e.target.value })} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
        <label className="text-xs font-medium">Order<input type="number" min="0" value={row.displayOrder} onChange={e => change(row.id, { displayOrder: Number(e.target.value) })} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
        <label className="text-xs font-medium sm:col-span-2">Description<textarea value={row.body} rows={2} onChange={e => change(row.id, { body: e.target.value })} className="mt-1 w-full rounded-lg border p-3 text-sm" /></label>
        <div className="sm:col-span-2"><ImageUploadField label="Carousel image" value={row.mobileImageUrl || row.imageUrl} onChange={url => change(row.id, { imageUrl: url, mobileImageUrl: url })} /></div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={row.isActive} onChange={e => change(row.id, { isActive: e.target.checked })} />Show on mobile home carousel</label>
        <button disabled={saving === row.id} onClick={() => void save(row)} className="min-h-11 rounded-lg bg-[#142B4A] text-sm font-semibold text-white sm:col-span-2">{saving === row.id ? 'Saving…' : 'Save carousel card'}</button>
      </div>
    </article>)}{!busy && !shown.length && <p className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500 xl:col-span-2">No carousel cards yet.</p>}</div>
  </>;
};
