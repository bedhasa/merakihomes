import React, { useEffect, useState } from 'react';
import { ApiError, getManagementCustomer, getManagementCustomers, ManagementCustomer, saveManagementCustomer } from '@shared/api';
import { ConfirmDialog } from './ConfirmDialog';

const errorText = (e: unknown) => e instanceof ApiError ? e.message : 'The API could not be reached.';

export const CustomersWorkspace: React.FC<{ selectedId?: string | null; onOpenBooking?: (id: string) => void }> = ({ selectedId, onOpenBooking }) => {
  const [rows, setRows] = useState<ManagementCustomer[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState<string | null>(selectedId || null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getManagementCustomer>> | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => { setBusy(true); getManagementCustomers(query).then(setRows).catch(e => setError(errorText(e))).finally(() => setBusy(false)); };
  useEffect(load, []);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [query]);
  useEffect(() => { if (selectedId) void openCustomer(selectedId); }, [selectedId]);

  const shown = rows.filter(c => status === 'all' || c.status === status);
  const openCustomer = async (id: string) => {
    setOpen(id); setError('');
    try {
      const data = await getManagementCustomer(id);
      setDetail(data);
      setName(data.customer.name);
      setPhone(data.customer.phone || '');
    } catch (e) { setError(errorText(e)); }
  };

  const save = async () => {
    if (!detail) return;
    setSaving(true); setError('');
    try {
      await saveManagementCustomer(detail.customer.id, { name, phone });
      setNotice('Customer details saved.');
      await openCustomer(detail.customer.id);
      load();
    } catch (e) { setError(errorText(e)); }
    finally { setSaving(false); }
  };

  const changeStatus = async () => {
    if (!detail || !nextStatus) return;
    setSaving(true); setError('');
    try {
      await saveManagementCustomer(detail.customer.id, { status: nextStatus });
      setNotice(`Account marked ${nextStatus}. Booking history was kept.`);
      setConfirm(false);
      await openCustomer(detail.customer.id);
      load();
    } catch (e) { setError(errorText(e)); }
    finally { setSaving(false); }
  };

  return <>
    <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8C6A2F]">Operations</p><h1 className="mt-1 text-[26px] font-bold text-[#142B4A]">Customers</h1><p className="mt-1.5 text-sm text-slate-500">Search registered accounts. Deactivation keeps booking history.</p></div>
    {error && <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
    <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px]"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, phone, or email" className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm" /><select value={status} onChange={e => setStatus(e.target.value)} className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="all">All accounts</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="restricted">Restricted</option><option value="guest">Guest</option></select></div>
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#F8F9FB] text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr>{['Customer','Contact','Type','Bookings','Joined',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{shown.map(c => <tr key={c.id} className="hover:bg-slate-50/70"><td className="px-4 py-3 font-medium text-[#142B4A]">{c.name}<p className="text-[10px] capitalize text-slate-400">{c.status}</p></td><td className="px-4 py-3 text-xs">{c.phone || '—'}<p className="text-slate-500">{c.email || 'No email'}</p></td><td className="px-4 py-3 text-xs capitalize">{c.email ? 'Registered' : 'Guest record'}</td><td className="px-4 py-3">{c.bookings}</td><td className="px-4 py-3 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td><td className="px-4 py-3 text-right"><button onClick={() => void openCustomer(c.id)} className="text-xs font-semibold text-[#8C6A2F]">Open</button></td></tr>)}{!busy && !shown.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No customers match.</td></tr>}</tbody></table></div>
    {detail && <div className="fixed inset-0 z-50 overflow-y-auto bg-[#142B4A]/50 p-3 sm:p-8" onClick={e => { if (e.target === e.currentTarget) setDetail(null); }}><section className="ml-auto min-h-full w-full max-w-2xl rounded-xl bg-white p-6"><div className="flex justify-between gap-3"><div><h2 className="text-xl font-bold text-[#142B4A]">{detail.customer.name}</h2><p className="text-sm capitalize text-slate-500">{detail.customer.status} · {detail.customer.accountType || 'account'}</p></div><button onClick={() => setDetail(null)} className="min-h-10 rounded-lg border px-3">Close</button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium">Full name<input value={name} onChange={e => setName(e.target.value)} className="mt-1 h-10 w-full rounded border px-3 text-sm" /></label><label className="text-xs font-medium">Phone<input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 h-10 w-full rounded border px-3 text-sm" /></label></div>
      <p className="mt-2 text-xs text-slate-500">Email: {detail.customer.email || 'Not registered'} · Joined {new Date(detail.customer.createdAt).toLocaleDateString()}</p>
      <div className="mt-3 flex flex-wrap gap-2"><button disabled={saving} onClick={() => void save()} className="min-h-10 rounded-lg bg-[#142B4A] px-4 text-sm font-semibold text-white">Save details</button>{detail.customer.status === 'active' ? <button onClick={() => { setNextStatus('inactive'); setConfirm(true); }} className="min-h-10 rounded-lg border border-red-200 px-4 text-sm text-red-800">Deactivate</button> : <button onClick={() => { setNextStatus('active'); setConfirm(true); }} className="min-h-10 rounded-lg border px-4 text-sm">Restore account</button>}</div>
      {detail.addresses.length ? <section className="mt-5"><h3 className="text-sm font-semibold text-[#142B4A]">Saved addresses</h3>{detail.addresses.map(a => <p key={a.id} className="mt-2 text-xs text-slate-600">{a.label}: {[a.streetBuilding, a.area, a.subCity, a.city].filter(Boolean).join(', ')}</p>)}</section> : null}
      <section className="mt-5"><h3 className="text-sm font-semibold text-[#142B4A]">Booking history</h3>{detail.bookings.length ? detail.bookings.map(b => <button key={b.id} onClick={() => onOpenBooking?.(b.id)} className="mt-2 block w-full rounded border border-slate-200 p-3 text-left text-xs"><span className="font-mono font-bold">{b.reference}</span> · {b.serviceName} · {b.status.replaceAll('_', ' ')}</button>) : <p className="mt-2 text-xs text-slate-500">No bookings on this account.</p>}</section>
    </section></div>}
    <ConfirmDialog open={confirm} title={nextStatus === 'inactive' ? 'Deactivate this account?' : 'Restore this account?'} body={nextStatus === 'inactive' ? 'The customer will not be able to sign in. Existing bookings stay in the operations history.' : 'The customer will be able to sign in again.'} confirmLabel={nextStatus === 'inactive' ? 'Deactivate account' : 'Restore account'} danger={nextStatus === 'inactive'} busy={saving} onCancel={() => setConfirm(false)} onConfirm={() => void changeStatus()} />
  </>;
};
