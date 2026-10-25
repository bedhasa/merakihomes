import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

type CaseRecord = { id: number; type: string; summary: string; createdAt: string };
export const TrustSafetyWorkspace: React.FC = () => {
  const [type, setType] = useState('service_quality');
  const [summary, setSummary] = useState('');
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [error, setError] = useState('');
  const submit = () => { if (summary.trim().length < 10) { setError('Add at least 10 characters so the concern can be understood.'); return; } setError(''); setCases(prev=>[{id:Date.now(),type,summary:summary.trim(),createdAt:new Date().toLocaleString()},...prev]);setSummary(''); };
  return <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.75fr)]">
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"><div className="flex items-start gap-3"><AlertTriangle className="mt-1 text-amber-700" size={20}/><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#102A43]">Trust &amp; safety</p><h2 className="mt-2 text-xl font-semibold text-[#102A43]">Record a concern</h2><p className="mt-2 text-sm leading-6 text-slate-600">Capture a report for review. This local prototype does not investigate, restrict accounts, or notify anyone.</p></div></div>
      <label className="mt-6 block text-sm font-medium">Concern type<select value={type} onChange={e=>setType(e.target.value)} className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-3"><option value="service_quality">Service quality</option><option value="property_damage">Property damage</option><option value="safety">Safety concern</option><option value="billing">Billing concern</option><option value="other">Other</option></select></label>
      <label className="mt-4 block text-sm font-medium">What was reported?<textarea value={summary} onChange={e=>{setSummary(e.target.value);setError('')}} rows={5} maxLength={2000} placeholder="Record relevant facts and customer decision…" className="mt-2 w-full rounded-lg border border-slate-300 p-3"/></label>{error&&<p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      <button onClick={submit} className="mt-5 min-h-12 rounded-lg bg-[#102A43] px-5 text-sm font-semibold text-white">Save report for review</button>
    </div>
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"><h3 className="font-semibold text-[#102A43]">Session reports</h3>{cases.length===0?<p className="mt-3 text-sm leading-6 text-slate-500">No reports in this session.</p>:<ul className="mt-4 space-y-3">{cases.map(item=><li key={item.id} className="rounded-lg border border-slate-200 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.type.replace('_',' ')} · {item.createdAt}</p><p className="mt-2 text-sm leading-5">{item.summary}</p></li>)}</ul>}</div>
  </section>;
};

