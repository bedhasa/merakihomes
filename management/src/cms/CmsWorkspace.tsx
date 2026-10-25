import React, { useState } from 'react';
import { Save } from 'lucide-react';

export const CmsWorkspace: React.FC = () => {
  const [title, setTitle] = useState('Home page introduction');
  const [content, setContent] = useState('A calmer way to care for home. Find household cleaning, repairs, and everyday help in Addis Ababa.');
  const [saved, setSaved] = useState(false);
  return <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#102A43]">Website content · Draft</p>
    <h2 className="mt-2 text-xl font-semibold text-[#102A43]">Edit public copy</h2>
    <p className="mt-2 text-sm text-slate-600">Create a local draft for review. Publishing is unavailable until a CMS backend and staff permissions are connected.</p>
    <label className="mt-6 block text-sm font-medium">Section title<input value={title} onChange={e=>{setTitle(e.target.value);setSaved(false)}} maxLength={120} className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-3"/></label>
    <label className="mt-4 block text-sm font-medium">Copy<textarea value={content} onChange={e=>{setContent(e.target.value);setSaved(false)}} rows={5} maxLength={2000} className="mt-2 w-full rounded-lg border border-slate-300 p-3"/></label>
    <div className="mt-5 flex flex-wrap items-center gap-3"><button onClick={()=>setSaved(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#102A43] px-5 text-sm font-semibold text-white"><Save size={16}/> Save draft</button><button disabled className="min-h-11 cursor-not-allowed rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-400" title="Publishing requires an authorized backend">Publish unavailable</button>{saved&&<span role="status" className="text-sm text-emerald-700">Draft saved in this session</span>}</div>
  </section>;
};

