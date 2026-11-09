import React, { useEffect, useState } from 'react';
import { ApiError, getManagementServiceQuestions, ManagementQuestion, saveManagementServiceQuestions } from '@shared/api';

const errorText = (e: unknown) => e instanceof ApiError ? e.message : 'Could not reach the API.';
const blank = (): ManagementQuestion => ({ key: `q_${Math.random().toString(36).slice(2, 10)}`, label: '', answerType: 'short_text', required: false, displayOrder: 0, options: [] });

export const ServiceQuestionsEditor: React.FC<{ serviceId: string }> = ({ serviceId }) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ManagementQuestion[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const load = () => { getManagementServiceQuestions(serviceId).then(setRows).catch(e => setError(errorText(e))); };
  useEffect(() => { if (open) load(); }, [open, serviceId]);
  const save = async () => {
    setSaving(true); setError('');
    try { await saveManagementServiceQuestions(serviceId, rows); setNotice('Questions published. Website and mobile booking forms will use this version.'); }
    catch (e) { setError(errorText(e)); }
    finally { setSaving(false); }
  };
  return <div className="border-t border-slate-100 pt-3">
    <button type="button" onClick={() => setOpen(v => !v)} className="text-sm font-semibold text-[#142B4A]">{open ? 'Hide questions' : 'Manage booking questions'}</button>
    {open && <section className="mt-3 rounded-md border bg-[#F7F8FA] p-4">
      <p className="text-xs text-slate-600">Published questions appear on the website and mobile booking forms. Saving creates a new published version.</p>
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-2 text-xs text-emerald-800">{notice}</p>}
      <div className="mt-3 space-y-3">{rows.map((row, index) => <article key={row.key} className="grid gap-2 rounded border bg-white p-3 sm:grid-cols-2">
        <label className="text-xs">Label<input value={row.label} onChange={e => setRows(current => current.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} className="mt-1 h-9 w-full rounded border px-2 text-sm" /></label>
        <label className="text-xs">Type<select value={row.answerType} onChange={e => setRows(current => current.map((item, i) => i === index ? { ...item, answerType: e.target.value as ManagementQuestion['answerType'] } : item))} className="mt-1 h-9 w-full rounded border px-2 text-sm"><option value="short_text">Short text</option><option value="number">Number</option><option value="select">Choice list</option><option value="yes_no">Yes / no</option></select></label>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={row.required} onChange={e => setRows(current => current.map((item, i) => i === index ? { ...item, required: e.target.checked } : item))} />Required</label>
        {row.answerType === 'select' ? <label className="text-xs sm:col-span-2">Choices (comma separated)<input value={row.options.map(o => o.label).join(', ')} onChange={e => setRows(current => current.map((item, i) => i === index ? { ...item, options: e.target.value.split(',').map(label => ({ value: label.trim().toLowerCase().replace(/\s+/g, '_'), label: label.trim() })).filter(o => o.label) } : item))} className="mt-1 h-9 w-full rounded border px-2 text-sm" /></label> : null}
        <button type="button" onClick={() => setRows(current => current.filter((_, i) => i !== index))} className="text-xs text-red-700">Remove</button>
      </article>)}</div>
      <div className="mt-3 flex gap-2"><button type="button" onClick={() => setRows(current => [...current, blank()])} className="min-h-9 rounded border px-3 text-xs font-semibold">Add question</button><button type="button" disabled={saving} onClick={() => void save()} className="min-h-9 rounded bg-[#142B4A] px-3 text-xs font-semibold text-white">Publish questions</button></div>
    </section>}
  </div>;
};
