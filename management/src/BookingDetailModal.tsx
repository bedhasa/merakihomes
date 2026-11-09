import React, { useEffect, useState } from 'react';
import { MapPin, Phone, User, X } from 'lucide-react';
import { ApiError, addBookingNote, assignManagementBooking, cancelManagementBooking, getManagementWorkers, ManagementBooking, ManagementBookingItem, ManagementWorker, ManagementWorkerProposal, proposeBookingReschedule, proposeManagementPriceChange, proposeManagementWorkerChange, reviewBookingLocation, updateManagementBookingItemStatus, updateManagementBookingStatus } from '@shared/api';
import { ConfirmDialog } from './ConfirmDialog';

const errorText = (e: unknown) => e instanceof ApiError ? e.message : 'The API could not be reached.';
const pill: Record<string, string> = { pending: 'bg-[#FFF5DC] text-[#8C6A2F]', pending_confirmation: 'bg-[#FFF5DC] text-[#8C6A2F]', pending_worker_assignment: 'bg-[#E9EFF5] text-[#142B4A]', confirmed: 'bg-[#E8F4EE] text-[#347454]', in_progress: 'bg-[#E9EFF5] text-[#142B4A]', completed: 'bg-[#E8F4EE] text-[#347454]', cancelled: 'bg-[#FDECEC] text-[#A43B3B]', rejected: 'bg-[#FDECEC] text-[#A43B3B]' };
const StatusPill: React.FC<{ status: string }> = ({ status }) => <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${pill[status] || 'bg-slate-100 text-slate-600'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status.replaceAll('_', ' ')}</span>;
const money = (amount: number | null | undefined, currency: string, empty: string) => amount == null ? empty : `${Number(amount).toLocaleString()} ${currency}`;
const itemNext: Record<string, string[]> = { pending: ['pending_worker_assignment', 'cancelled', 'rejected'], pending_location_review: ['pending_worker_assignment', 'cancelled', 'rejected'], pending_worker_assignment: ['pending_confirmation', 'cancelled', 'rejected'], pending_confirmation: ['confirmed', 'cancelled', 'rejected'], confirmed: ['in_progress', 'cancelled'], in_progress: ['completed', 'cancelled'] };
const bookingNext: Record<string, string[]> = { pending: ['pending_worker_assignment', 'pending_confirmation', 'cancelled', 'rejected'], pending_location_review: ['pending_worker_assignment', 'cancelled', 'rejected'], pending_worker_assignment: ['pending_confirmation', 'cancelled', 'rejected'], pending_confirmation: ['confirmed', 'cancelled', 'rejected'], confirmed: ['in_progress', 'cancelled'], rescheduling_requested: ['confirmed', 'cancelled'], in_progress: ['completed'] };

type Detail = {
  booking: ManagementBooking;
  items: ManagementBookingItem[];
  workerProposals: ManagementWorkerProposal[];
  history: Array<{ oldStatus: string | null; newStatus: string; actor: string; reason: string; createdAt: string }>;
  proposals: Array<{ id: string; proposedStart: string; reason: string; status: string }>;
  activity: Array<{ actor: string; action: string; reason: string; createdAt: string }>;
};

export const BookingDetailModal: React.FC<{
  booking: ManagementBooking;
  detail: Detail | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onOpenCustomers: () => void;
}> = ({ booking, detail, loading, error, onClose, onRefresh, onOpenCustomers }) => {
  const [tab, setTab] = useState<'overview' | 'work' | 'assign' | 'actions'>('overview');
  const selected = detail?.booking || booking;
  const items = detail?.items || [];
  const tabs = [['overview', 'Overview'], ['work', 'Service & price'], ['assign', 'Assignment'], ['actions', 'Actions']] as const;

  return <div role="dialog" aria-modal="true" aria-labelledby="booking-detail-title" className="fixed inset-0 z-50 flex items-end justify-center bg-[#142B4A]/55 p-0 sm:items-center sm:p-6" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-[#142B4A] px-5 py-4 text-white sm:px-6">
        <div className="min-w-0">
          <p className="font-mono text-[11px] tracking-wide text-[#D6A94F]">{selected.reference}</p>
          <h2 id="booking-detail-title" className="mt-1 truncate text-xl font-bold">{selected.serviceName}</h2>
          <p className="mt-1 text-xs text-white/70">{selected.packageName ? `Package: ${selected.packageName}` : 'No package selected'} · Submitted {new Date(selected.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={selected.status} />
          <button type="button" onClick={onClose} aria-label="Close request" className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 hover:bg-white/20"><X size={18} /></button>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-2 border-b border-slate-100 bg-[#F8F9FB] px-3 py-2 sm:grid-cols-4">
        {[['Estimate', money(selected.startingEstimate, selected.currency, 'Pending')], ['Approved', money(selected.agreedAmount, selected.currency, 'Not set')], ['Paid', money(selected.amountPaid, selected.currency, 'None')], ['When', new Date(selected.requestedStart).toLocaleString()]].map(([label, value]) => <div key={label} className="rounded-lg bg-white px-3 py-2 shadow-sm"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 truncate text-sm font-semibold text-[#142B4A]">{value}</p></div>)}
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3">{tabs.map(([id, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={`min-h-10 shrink-0 rounded-t-lg px-4 text-sm font-semibold ${tab === id ? 'bg-white text-[#142B4A] shadow-[inset_0_-2px_#D6A94F]' : 'text-slate-500'}`}>{label}</button>)}</nav>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#F3F5F7] p-4 sm:p-5">
        {error ? <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        {loading && !detail ? <p className="p-6 text-sm text-slate-500">Loading request details…</p> : null}
        {tab === 'overview' ? <OverviewTab booking={selected} onOpenCustomers={onOpenCustomers} /> : null}
        {tab === 'work' ? <WorkTab booking={selected} items={items} onUpdated={onRefresh} /> : null}
        {tab === 'assign' ? <AssignTab booking={selected} items={items} proposals={detail?.workerProposals || []} onUpdated={onRefresh} /> : null}
        {tab === 'actions' ? <ActionsTab booking={selected} history={detail?.history || []} activity={detail?.activity || []} proposals={detail?.proposals || []} onUpdated={onRefresh} /> : null}
      </div>
    </section>
  </div>;
};

const OverviewTab: React.FC<{ booking: ManagementBooking; onOpenCustomers: () => void }> = ({ booking, onOpenCustomers }) => {
  const answers = Object.entries(booking.serviceAnswers || {});
  return <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-[#142B4A]"><User size={15} /> Customer</h3>
      <p className="mt-2 text-base font-semibold text-[#142B4A]">{booking.customerName}</p>
      <p className="mt-1 text-xs text-slate-500">{booking.customerId ? 'Registered account' : 'Guest request'}{booking.source ? ` · ${booking.source}` : ''}</p>
      <a href={`tel:${booking.customerPhone}`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#142B4A]"><Phone size={14} /> {booking.customerPhone}</a>
      {booking.customerEmail ? <p className="mt-1 text-sm text-slate-600">{booking.customerEmail}</p> : null}
      {booking.customerId ? <button type="button" onClick={onOpenCustomers} className="mt-3 text-xs font-semibold text-[#8C6A2F] underline">Open customer record</button> : null}
      {booking.notes ? <><h3 className="mt-5 text-sm font-bold text-[#142B4A]">Customer notes</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{booking.notes}</p></> : null}
      {answers.length ? <><h3 className="mt-5 text-sm font-bold text-[#142B4A]">Service answers</h3><dl className="mt-2 space-y-2">{answers.map(([key, value]) => <div key={key} className="rounded-lg bg-[#F8F9FB] px-3 py-2 text-sm"><dt className="text-[11px] uppercase tracking-wide text-slate-400">{key}</dt><dd className="mt-0.5 font-medium text-[#142B4A]">{value || '—'}</dd></div>)}</dl></> : null}
    </article>
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-[#142B4A]"><MapPin size={15} /> Service location</h3>
      <p className="mt-2 text-sm font-medium text-[#142B4A]">{booking.address}</p>
      <p className="mt-1 text-xs text-slate-500">{booking.neighborhood}{booking.nearbyLandmark ? ` · ${booking.nearbyLandmark}` : ''}</p>
      {booking.latitude != null && booking.longitude != null ? <div className="mt-3 h-44 overflow-hidden rounded-xl border"><iframe title="Request location" className="h-full w-full" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${booking.longitude - 0.005}%2C${booking.latitude - 0.003}%2C${booking.longitude + 0.005}%2C${booking.latitude + 0.003}&layer=mapnik&marker=${booking.latitude}%2C${booking.longitude}`} /></div> : <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Coordinates are not set. Review the address on the Actions tab before confirming.</p>}
      <p className="mt-3 text-xs text-slate-500">Location method: {booking.locationMethod} · review {booking.locationReviewStatus.replaceAll('_', ' ')}</p>
    </article>
  </div>;
};

const WorkTab: React.FC<{ booking: ManagementBooking; items: ManagementBookingItem[]; onUpdated: () => Promise<void> }> = ({ booking, items, onUpdated }) => (
  <div className="space-y-3">{items.map(item => <ItemCard key={item.id} booking={booking} item={item} onUpdated={onUpdated} />)}{!items.length && <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">No service items on this request.</p>}</div>
);

const ItemCard: React.FC<{ booking: ManagementBooking; item: ManagementBookingItem; onUpdated: () => Promise<void> }> = ({ booking, item, onUpdated }) => {
  const next = itemNext[item.status] || [];
  const [status, setStatus] = useState(next[0] || '');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState(String(item.approvedAmount ?? item.estimate ?? 0));
  const [priceReason, setPriceReason] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  useEffect(() => setStatus(next[0] || ''), [item.status]);
  const run = async (key: string, work: () => Promise<void>) => { setBusy(key); setError(''); try { await work(); await onUpdated(); } catch (e) { setError(errorText(e)); } finally { setBusy(''); } };
  return <article className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-bold text-[#142B4A]">{item.itemNumber}. {item.serviceName}{item.packageName ? ` · ${item.packageName}` : ''}</p><p className="mt-1 text-xs text-slate-500">{money(item.estimate, item.currency, 'Estimate pending')} · approved {money(item.approvedAmount, item.currency, 'not set')}</p></div><StatusPill status={item.status} /></div>
    {error ? <p role="alert" className="mt-2 text-xs text-red-700">{error}</p> : null}
    {item.assignments.length ? <p className="mt-2 text-xs text-slate-600">Assigned: {item.assignments.map(a => `${a.workerName} (${a.status})`).join(', ')}</p> : <p className="mt-2 text-xs text-amber-800">No professional assigned yet.</p>}
    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
      {next.length ? <><select value={status} onChange={e => setStatus(e.target.value)} className="h-10 rounded-lg border px-2 text-sm">{next.map(s => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}</select><input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for status change" className="h-10 rounded-lg border px-3 text-sm" /><button disabled={busy !== '' || reason.trim().length < 3} onClick={() => void run('status', () => updateManagementBookingItemStatus(booking.id, item.id, status, reason.trim()))} className="min-h-10 rounded-lg bg-[#142B4A] px-3 text-xs font-semibold text-white disabled:opacity-50">{busy === 'status' ? 'Saving…' : 'Update status'}</button></> : null}
    </div>
    <div className="mt-2 grid gap-2 sm:grid-cols-[140px_1fr_auto]"><input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="h-10 rounded-lg border px-3 text-sm" /><input value={priceReason} onChange={e => setPriceReason(e.target.value)} placeholder="Reason for proposed price" className="h-10 rounded-lg border px-3 text-sm" /><button disabled={busy !== '' || priceReason.trim().length < 3} onClick={() => void run('price', () => proposeManagementPriceChange(booking.id, item.id, { amount: Number(amount), currency: item.currency as 'ETB' | 'USD', reason: priceReason.trim() }))} className="min-h-10 rounded-lg border border-[#D6A94F] px-3 text-xs font-semibold text-[#8C6A2F] disabled:opacity-50">{busy === 'price' ? 'Saving…' : 'Propose price'}</button></div>
  </article>;
};

const AssignTab: React.FC<{ booking: ManagementBooking; items: ManagementBookingItem[]; proposals: ManagementWorkerProposal[]; onUpdated: () => Promise<void> }> = ({ booking, items, proposals, onUpdated }) => {
  const [workers, setWorkers] = useState<ManagementWorker[]>([]);
  const [itemId, setItemId] = useState(items[0]?.id || '');
  const [workerId, setWorkerId] = useState('');
  const [replaceWorkerId, setReplaceWorkerId] = useState('');
  const [approvalProposalId, setApprovalProposalId] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { if (!itemId && items.length) setItemId(items[0].id); }, [items, itemId]);
  useEffect(() => { getManagementWorkers().then(setWorkers).catch(e => setError(errorText(e))); }, []);
  const item = items.find(i => i.id === itemId);
  const approved = proposals.filter(p => p.itemId === itemId && p.status === 'accepted' && p.proposedValues.replaceWorkerId);
  const proposal = approved.find(p => p.id === approvalProposalId);
  return <section className="rounded-xl border border-slate-200 bg-white p-4">
    <h3 className="text-sm font-bold text-[#142B4A]">Assign a professional</h3>
    <p className="mt-1 text-xs text-slate-500">Choose a qualified worker for this service item. Replacement needs customer approval.</p>
    {error ? <p role="alert" className="mt-2 text-xs text-red-700">{error}</p> : null}
    {notice ? <p role="status" className="mt-2 text-xs text-emerald-800">{notice}</p> : null}
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-medium">Service item<select value={itemId} onChange={e => { setItemId(e.target.value); setWorkerId(''); setReplaceWorkerId(''); }} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm">{items.map(i => <option key={i.id} value={i.id}>{i.itemNumber}. {i.serviceName}</option>)}</select></label>
      <label className="text-xs font-medium">Professional<select value={workerId} onChange={e => setWorkerId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm"><option value="">Choose</option>{workers.filter(w => !item || w.skills.includes(item.serviceName)).map(w => <option key={w.id} value={w.id}>{w.name} · {w.serviceArea || 'area not set'}</option>)}</select></label>
      <label className="text-xs font-medium sm:col-span-2">Reason<input value={reason} onChange={e => setReason(e.target.value)} placeholder="Why this professional fits the request" className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
    </div>
    {item?.assignments.some(a => ['assigned', 'confirmed'].includes(a.status)) ? <label className="mt-3 block text-xs font-medium">Replace existing worker<select value={replaceWorkerId} onChange={e => setReplaceWorkerId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm"><option value="">Add without replacing</option>{item.assignments.filter(a => ['assigned', 'confirmed'].includes(a.status)).map(a => <option key={a.id} value={a.workerId}>{a.workerName}</option>)}</select></label> : null}
    {replaceWorkerId ? <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Replacing a worker needs the customer’s approval first.
      {approved.length ? <select value={approvalProposalId} onChange={e => setApprovalProposalId(e.target.value)} className="mt-2 h-10 w-full rounded border px-2"><option value="">Choose accepted proposal</option>{approved.map(p => <option key={p.id} value={p.id}>{p.reason}</option>)}</select> : null}
      <button type="button" disabled={busy || !workerId || reason.trim().length < 3} onClick={async () => { setBusy(true); setError(''); try { await proposeManagementWorkerChange(booking.id, itemId, { workerId, replaceWorkerId, reason: reason.trim() }); setNotice('Replacement sent to the customer.'); await onUpdated(); } catch (e) { setError(errorText(e)); } finally { setBusy(false); } }} className="mt-2 min-h-9 rounded-lg border px-3 font-semibold">Request customer approval</button>
    </div> : null}
    <button disabled={busy || !itemId || !workerId || reason.trim().length < 3 || Boolean(replaceWorkerId && !proposal)} onClick={async () => { setBusy(true); setError(''); try { await assignManagementBooking(booking.id, { workerId, itemId, reason: reason.trim(), ...(proposal ? { replaceWorkerId, approvalProposalId } : {}) }); setNotice('Assignment saved.'); setWorkerId(''); setReason(''); await onUpdated(); } catch (e) { setError(errorText(e)); } finally { setBusy(false); } }} className="mt-4 min-h-11 w-full rounded-lg bg-[#142B4A] text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Assign professional'}</button>
  </section>;
};

const ActionsTab: React.FC<{ booking: ManagementBooking; history: Array<{ oldStatus: string | null; newStatus: string; actor: string; reason: string; createdAt: string }>; activity: Array<{ actor: string; action: string; reason: string; createdAt: string }>; proposals: Array<{ id: string; proposedStart: string; reason: string; status: string }>; onUpdated: () => Promise<void> }> = ({ booking, history, activity, proposals, onUpdated }) => {
  const options = bookingNext[booking.status] || [];
  const [status, setStatus] = useState(options[0] || '');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [when, setWhen] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [locationReason, setLocationReason] = useState('');
  const [address, setAddress] = useState(booking.address);
  const [neighborhood, setNeighborhood] = useState(booking.neighborhood);
  const [landmark, setLandmark] = useState(booking.nearbyLandmark || '');
  const [lat, setLat] = useState(booking.latitude == null ? '' : String(booking.latitude));
  const [lon, setLon] = useState(booking.longitude == null ? '' : String(booking.longitude));
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  useEffect(() => setStatus(options[0] || ''), [booking.status]);
  const run = async (key: string, work: () => Promise<void>) => { setBusy(key); setError(''); try { await work(); await onUpdated(); } catch (e) { setError(errorText(e)); } finally { setBusy(''); } };
  return <div className="grid gap-4 lg:grid-cols-2">
    {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 lg:col-span-2">{error}</p> : null}
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-[#142B4A]">Update request status</h3>
      <p className="mt-1 text-xs text-slate-500">Confirmation is blocked until location, assignment, and price checks pass.</p>
      {options.length ? <div className="mt-3 grid gap-2"><select value={status} onChange={e => setStatus(e.target.value)} className="h-10 rounded-lg border px-2 text-sm">{options.map(s => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}</select><input value={reason} onChange={e => setReason(e.target.value)} placeholder="Internal reason" className="h-10 rounded-lg border px-3 text-sm" /><button disabled={busy !== '' || reason.trim().length < 3} onClick={() => void run('status', () => updateManagementBookingStatus(booking.id, status, reason.trim()))} className="min-h-10 rounded-lg bg-[#142B4A] text-sm font-semibold text-white disabled:opacity-50">{busy === 'status' ? 'Saving…' : 'Save status'}</button></div> : <p className="mt-2 text-xs text-slate-500">No further status changes are available.</p>}
      {['pending', 'pending_confirmation', 'confirmed'].includes(booking.status) ? <button type="button" onClick={() => setCancelOpen(true)} className="mt-3 min-h-10 w-full rounded-lg border border-red-200 text-sm font-semibold text-red-800">Cancel request</button> : null}
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-[#142B4A]">Verify location</h3>
      <label className="mt-2 block text-xs">Address<input value={address} onChange={e => setAddress(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
      <label className="mt-2 block text-xs">Area<input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
      <label className="mt-2 block text-xs">Landmark<input value={landmark} onChange={e => setLandmark(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
      <div className="mt-2 grid grid-cols-2 gap-2"><input value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude" className="h-10 rounded-lg border px-3 text-sm" /><input value={lon} onChange={e => setLon(e.target.value)} placeholder="Longitude" className="h-10 rounded-lg border px-3 text-sm" /></div>
      <input value={locationReason} onChange={e => setLocationReason(e.target.value)} placeholder="How this location was verified" className="mt-2 h-10 w-full rounded-lg border px-3 text-sm" />
      <button disabled={busy !== '' || locationReason.trim().length < 3} onClick={() => void run('location', () => reviewBookingLocation(booking.id, { address, neighborhood, nearbyLandmark: landmark, latitude: lat === '' ? null : Number(lat), longitude: lon === '' ? null : Number(lon), reason: locationReason.trim() }))} className="mt-3 min-h-10 w-full rounded-lg bg-[#142B4A] text-sm font-semibold text-white disabled:opacity-50">{busy === 'location' ? 'Saving…' : booking.locationReviewStatus === 'pending' ? 'Record verified location' : 'Update verified location'}</button>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-[#142B4A]">Internal note</h3>
      <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border p-3 text-sm" />
      <button disabled={busy !== '' || note.trim().length < 3} onClick={() => void run('note', async () => { await addBookingNote(booking.id, note.trim()); setNote(''); })} className="mt-2 min-h-10 rounded-lg border px-4 text-sm font-semibold disabled:opacity-50">{busy === 'note' ? 'Saving…' : 'Save note'}</button>
      {booking.internalNotes ? <p className="mt-3 whitespace-pre-wrap text-xs text-slate-600">{booking.internalNotes}</p> : null}
    </section>
    {['pending', 'confirmed'].includes(booking.status) ? <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-[#142B4A]">Propose a new time</h3>
      <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} className="mt-2 h-10 w-full rounded-lg border px-3 text-sm" />
      <input value={rescheduleReason} onChange={e => setRescheduleReason(e.target.value)} placeholder="Reason" className="mt-2 h-10 w-full rounded-lg border px-3 text-sm" />
      <button disabled={busy !== '' || !when || rescheduleReason.trim().length < 3} onClick={() => void run('reschedule', () => proposeBookingReschedule(booking.id, new Date(when).toISOString(), rescheduleReason.trim()))} className="mt-2 min-h-10 rounded-lg border px-4 text-sm font-semibold disabled:opacity-50">{busy === 'reschedule' ? 'Saving…' : 'Send proposal'}</button>
      {proposals.map(p => <p key={p.id} className="mt-2 text-xs">{new Date(p.proposedStart).toLocaleString()} · {p.status.replaceAll('_', ' ')}</p>)}
    </section> : null}
    <section className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
      <h3 className="text-sm font-bold text-[#142B4A]">History</h3>
      <ol className="mt-2 divide-y">{history.map((h, i) => <li key={`${h.createdAt}-${i}`} className="py-2 text-xs"><span className="font-semibold capitalize">{h.newStatus.replaceAll('_', ' ')}</span> · {h.actor} · {new Date(h.createdAt).toLocaleString()}{h.reason ? <p className="mt-1 text-slate-500">{h.reason}</p> : null}</li>)}{activity.map((a, i) => <li key={`${a.createdAt}-a${i}`} className="py-2 text-xs">{a.action.replaceAll('.', ' ')} · {a.actor} · {new Date(a.createdAt).toLocaleString()}</li>)}</ol>
    </section>
    <ConfirmDialog open={cancelOpen} title={`Cancel ${booking.reference}?`} body="This records a cancellation. It does not refund a payment." confirmLabel="Cancel request" danger busy={busy === 'cancel'} confirmDisabled={cancelReason.trim().length < 3} onCancel={() => { setCancelOpen(false); setCancelReason(''); }} onConfirm={() => void run('cancel', async () => { await cancelManagementBooking(booking.id, cancelReason.trim()); setCancelOpen(false); })}>
      <label className="mt-3 block text-xs font-medium">Cancellation reason<input value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="mt-1 h-10 w-full rounded border px-3 text-sm" /></label>
    </ConfirmDialog>
  </div>;
};
