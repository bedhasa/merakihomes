import React, { useEffect, useState } from 'react';
import { ApiError, createManagementWorker, getManagementServices, getManagementWorker, getManagementWorkers, ManagementService, ManagementWorker, saveManagementWorker, setManagementProfessionalAccount } from '@shared/api';
import { ConfirmDialog } from './ConfirmDialog';
import { ImageUploadField } from './ImageUploadField';

const errorText = (e: unknown) => e instanceof ApiError ? e.message : 'The API could not be reached.';
const blank = { name: '', serviceArea: '', photoUrl: '', baseRate: '', currency: 'ETB' as const, status: 'unavailable', eligibility: 'pending_review', serviceIds: [] as string[] };

export const WorkersWorkspace: React.FC = () => {
  const [rows, setRows] = useState<ManagementWorker[]>([]);
  const [services, setServices] = useState<ManagementService[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [skill, setSkill] = useState('all');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getManagementWorker>> | null>(null);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmInactive, setConfirmInactive] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => { setBusy(true); Promise.all([getManagementWorkers(), getManagementServices()]).then(([workers, catalogue]) => { setRows(workers); setServices(catalogue); }).catch(e => setError(errorText(e))).finally(() => setBusy(false)); };
  useEffect(load, []);
  const shown = rows.filter(w => (status === 'all' || w.status === status) && (skill === 'all' || w.skills.includes(skill)) && (!query || `${w.name} ${w.phone || ''} ${w.workerCode || ''} ${w.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase())));

  const open = async (id: string) => {
    setError('');
    const data = await getManagementWorker(id);
    setDetail(data);
    setEditing(id);
    setForm({ name: data.worker.name, serviceArea: data.worker.serviceArea || '', photoUrl: data.worker.photoUrl || '', baseRate: data.worker.baseRate == null ? '' : String(data.worker.baseRate), currency: (data.worker.currency as 'ETB') || 'ETB', status: data.worker.status, eligibility: data.worker.eligibility, serviceIds: data.services.map(s => s.id) });
  };

  const payload = () => ({ ...form, baseRate: form.baseRate === '' ? null : Number(form.baseRate) });
  const save = async () => {
    setSaving(true); setError('');
    try {
      if (editing) await saveManagementWorker(editing, payload());
      else await createManagementWorker(payload());
      setNotice(editing ? 'Professional profile saved.' : 'Professional added.');
      setForm(blank); setEditing(null); setDetail(null); load();
    } catch (e) { setError(errorText(e)); }
    finally { setSaving(false); }
  };

  const deactivate = async () => {
    if (!editing) return;
    setSaving(true);
    try { await saveManagementWorker(editing, { ...payload(), status: 'inactive' }); setNotice('Professional deactivated. Assignment history was kept.'); setConfirmInactive(false); setEditing(null); setDetail(null); load(); }
    catch (e) { setError(errorText(e)); }
    finally { setSaving(false); }
  };

  return <>
    <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8C6A2F]">Operations</p><h1 className="mt-1 text-[26px] font-bold text-[#142B4A]">Professionals</h1><p className="mt-1.5 text-sm text-slate-500">Add, update, and deactivate field professionals. History is never deleted.</p></div>
    {error && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
    <form className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={e => { e.preventDefault(); void save(); }}>
      <h2 className="text-sm font-bold text-[#142B4A] sm:col-span-2 lg:col-span-3">{editing ? 'Edit professional' : 'Add a professional'}</h2>
      <label className="text-xs font-medium">Full name *<input required value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} className="mt-1 h-10 w-full rounded border px-3 text-sm" /></label>
      <label className="text-xs font-medium">Service area<input value={form.serviceArea} onChange={e => setForm(v => ({ ...v, serviceArea: e.target.value }))} className="mt-1 h-10 w-full rounded border px-3 text-sm" /></label>
      <label className="text-xs font-medium">Starting rate<input type="number" min="0" value={form.baseRate} onChange={e => setForm(v => ({ ...v, baseRate: e.target.value }))} className="mt-1 h-10 w-full rounded border px-3 text-sm" /></label>
      <label className="text-xs font-medium">Status<select value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value }))} className="mt-1 h-10 w-full rounded border px-3 text-sm"><option value="active">Active</option><option value="unavailable">Unavailable</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></label>
      <label className="text-xs font-medium">Eligibility<select value={form.eligibility} onChange={e => setForm(v => ({ ...v, eligibility: e.target.value }))} className="mt-1 h-10 w-full rounded border px-3 text-sm"><option value="pending_review">Pending review</option><option value="eligible">Eligible</option><option value="restricted">Restricted</option><option value="suspended">Suspended</option></select></label>
      <div className="sm:col-span-2"><ImageUploadField label="Profile photo" value={form.photoUrl} onChange={photoUrl => setForm(v => ({ ...v, photoUrl }))} /></div>
      <fieldset className="sm:col-span-2 lg:col-span-3"><legend className="text-xs font-medium">Assigned services</legend><div className="mt-2 flex flex-wrap gap-2">{services.map(s => <label key={s.id} className="flex items-center gap-2 rounded border px-2 py-1 text-xs"><input type="checkbox" checked={form.serviceIds.includes(s.id)} onChange={e => setForm(v => ({ ...v, serviceIds: e.target.checked ? [...v.serviceIds, s.id] : v.serviceIds.filter(id => id !== s.id) }))} />{s.name}</label>)}</div></fieldset>
      <div className="flex gap-2 sm:col-span-2"><button disabled={saving} className="min-h-10 rounded-lg bg-[#142B4A] px-4 text-sm font-semibold text-white">{saving ? 'Saving…' : editing ? 'Save professional' : 'Create professional'}</button>{editing ? <button type="button" onClick={() => { setEditing(null); setDetail(null); setForm(blank); }} className="min-h-10 rounded-lg border px-4 text-sm">Cancel</button> : null}{editing ? <button type="button" onClick={() => setConfirmInactive(true)} className="min-h-10 rounded-lg border border-red-200 px-4 text-sm text-red-800">Deactivate</button> : null}</div>
    </form>
    <div className="mb-4 grid gap-3 sm:grid-cols-3"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, phone, or code" className="h-11 rounded-md border bg-white px-3 text-sm" /><select value={status} onChange={e => setStatus(e.target.value)} className="h-11 rounded-md border bg-white px-3 text-sm"><option value="all">All statuses</option><option value="active">Active</option><option value="unavailable">Unavailable</option><option value="inactive">Inactive</option></select><select value={skill} onChange={e => setSkill(e.target.value)} className="h-11 rounded-md border bg-white px-3 text-sm"><option value="all">All services</option>{services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#F8F9FB] text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr>{['Professional','Phone','Services','Workload','Status',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{shown.map(w => <tr key={w.id}><td className="px-4 py-3"><div className="flex items-center gap-3">{w.photoUrl ? <img src={w.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E9EFF5] text-xs font-bold">{w.name.slice(0,1)}</span>}<div><strong>{w.name}</strong><p className="font-mono text-[10px] text-slate-400">{w.workerCode}</p></div></div></td><td className="px-4 py-3 text-xs">{w.phone || '—'}</td><td className="px-4 py-3 text-xs">{w.skills.join(', ') || 'None'}</td><td className="px-4 py-3 text-xs">{w.activeAssignments ?? 0} active</td><td className="px-4 py-3 text-xs capitalize">{w.status} · {w.eligibility}</td><td className="px-4 py-3 text-right"><button onClick={() => void open(w.id)} className="text-xs font-semibold text-[#8C6A2F]">Edit</button></td></tr>)}{!busy && !shown.length && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No professionals match.</td></tr>}</tbody></table></div>
    {detail && editing ? <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4"><h3 className="text-sm font-bold text-[#142B4A]">Recent assignments</h3>{detail.history.length ? detail.history.map(h => <p key={h.reference + h.serviceName} className="mt-2 text-xs">{h.reference} · {h.serviceName} · {h.status}</p>) : <p className="mt-2 text-xs text-slate-500">No assignment history yet.</p>}
      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={e => { e.preventDefault(); void setManagementProfessionalAccount(editing, { phone, password }).then(() => { setNotice('Professional sign-in saved.'); setPhone(''); setPassword(''); load(); }).catch(err => setError(errorText(err))); }}><label className="text-xs">Mobile sign-in phone<input required value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 h-10 w-full rounded border px-3 text-sm" /></label><label className="text-xs">Temporary password<input required minLength={10} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 h-10 w-full rounded border px-3 text-sm" /></label><button className="min-h-10 self-end rounded-lg border px-4 text-xs font-semibold">Save sign-in</button></form>
    </section> : null}
    <ConfirmDialog open={confirmInactive} title="Deactivate this professional?" body="They will no longer appear as available for new assignments. Existing booking history stays in the system." confirmLabel="Deactivate" danger busy={saving} onCancel={() => setConfirmInactive(false)} onConfirm={() => void deactivate()} />
  </>;
};
