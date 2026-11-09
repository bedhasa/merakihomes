import React,{useEffect,useMemo,useRef,useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {ArrowLeft,ArrowRight,BadgeCheck,CalendarDays,Check,CircleDollarSign,Clock3,LoaderCircle,MapPin,Package,ShieldCheck} from 'lucide-react';
import {ADDIS_NEIGHBORHOODS} from '@shared/data/mockServices';
import {Booking,Currency,ServiceCategory,ServicePackage} from '@shared/types';
import {formatCurrency} from '@shared/utils/formatters';
import {isValidContact} from './request';
import {ApiError,BookingRequestPayload,EligibleWorker,getEligibleWorkers,getServiceDetails} from '@shared/api';
import {LocationPicker,LocationValue} from './LocationPicker';
import {ServicePackageSelector} from './ServicePackageSelector';
import {formatDemoEstimate, getDemoEstimate} from '@shared/demoPricing';
import {DemoPaymentStep,DemoReceipt} from './DemoPaymentStep';
import {DemoPaymentReceipt} from '@shared/api';
import {BookingProgressBar} from './BookingProgressBar';

type Props={currency:Currency;services:ServiceCategory[];servicesState:'loading'|'ready'|'error';presetServiceId?:string|null;presetPackageId?:string|null;onSubmit:(payload:BookingRequestPayload,key:string)=>Promise<Booking>;onViewBookings:()=>void};
type Field={key:string;label:string;placeholder?:string;options?:string[]};
const fields:Record<string,Field[]>={
 premium_home_cleaning:[{key:'propertySize',label:'Property size',options:['Studio or 1 bedroom','2 bedrooms','3 bedrooms','4 or more bedrooms']},{key:'rooms',label:'Rooms to prioritize',placeholder:'For example: kitchen and bathrooms'},{key:'frequency',label:'Cleaning frequency',options:['One visit','Weekly','Every two weeks','Monthly']}],
 gardening_outdoor:[{key:'outdoorSpace',label:'Outdoor space',options:['Garden','Yard','Balcony or terrace','Shared grounds']},{key:'tasks',label:'Work requested',placeholder:'For example: pruning, planting, or general upkeep'},{key:'size',label:'Approximate size',placeholder:'If known'}],
 office_cleaning:[{key:'premises',label:'Type of premises',options:['Office','Shop','Clinic','Other commercial space']},{key:'size',label:'Approximate size',placeholder:'Rooms, floors, or square metres'},{key:'schedule',label:'Preferred schedule',placeholder:'Days and approximate hours'}],
 elder_companion:[{key:'support',label:'Kind of companionship',options:['Conversation and company','Reading or activities','Light daily support','Accompaniment']},{key:'schedule',label:'Preferred schedule',placeholder:'Days and approximate hours'},{key:'accessibility',label:'Anything we should know?',placeholder:'Optional'}],
 handyman_plumbing:[{key:'repairType',label:'Repair type',options:['Plumbing','Electrical','Installation','Carpentry','Other']},{key:'urgency',label:'When is help needed?',options:['As soon as possible','Within a week','Flexible']},{key:'issue',label:'What is happening?',placeholder:'Briefly describe the repair'}],
 childcare_nanny:[{key:'children',label:'Number of children',placeholder:'For example: 2'},{key:'ageRanges',label:'Age ranges',placeholder:'For example: 2 and 5 years'},{key:'schedule',label:'Schedule requested',placeholder:'Days and approximate hours'}],
 cooking_service:[{key:'mealQuantity',label:'Meals or servings',placeholder:'For example: dinner for 4'},{key:'dietaryNeeds',label:'Dietary requirements',placeholder:'Optional'},{key:'ingredients',label:'Ingredient arrangement',options:['I will provide ingredients','Please discuss sourcing','Not sure yet']}],
 maid_laundry:[{key:'loadSize',label:'Approximate laundry load',options:['Small','Medium','Large','Not sure']},{key:'tasks',label:'Services requested',options:['Wash and fold','Ironing','Wash and iron','Laundry and organization']},{key:'turnaround',label:'Preferred turnaround',options:['Same day if possible','Within 2 days','Flexible']}],
};

export const RequestFlow:React.FC<Props>=({currency,services,servicesState,presetServiceId,presetPackageId,onSubmit,onViewBookings})=>{
 const [step,setStep]=useState(1),[serviceId,setServiceId]=useState(presetServiceId??''),[packageId,setPackageId]=useState(presetPackageId??''),[packageOptions,setPackageOptions]=useState<ServicePackage[]>([]),[packageState,setPackageState]=useState<'idle'|'loading'|'ready'|'error'>('idle'),[packageRetry,setPackageRetry]=useState(0),[packageError,setPackageError]=useState(''),[details,setDetails]=useState(''),[answers,setAnswers]=useState<Record<string,string>>({}),[area,setArea]=useState(''),[address,setAddress]=useState(''),[landmark,setLandmark]=useState(''),[location,setLocation]=useState<LocationValue>({latitude:null,longitude:null,method:'manual',confirmed:false}),[visitAt,setVisitAt]=useState(''),[name,setName]=useState(''),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[error,setError]=useState(''),[submitted,setSubmitted]=useState<Booking|null>(null),[submitting,setSubmitting]=useState(false),[workers,setWorkers]=useState<EligibleWorker[]>([]),[workerLoading,setWorkerLoading]=useState(false),[workerError,setWorkerError]=useState(''),[workerSelectionMode,setWorkerSelectionMode]=useState<'customer_selected'|'meraki_matched'|'operations_review'>('meraki_matched'),[preferredWorkerId,setPreferredWorkerId]=useState(''),[paymentReceipt,setPaymentReceipt]=useState<DemoPaymentReceipt|null>(null),[paymentSkipped,setPaymentSkipped]=useState(false);
 const submissionKey=useRef(crypto.randomUUID()),service=useMemo(()=>services.find(s=>s.id===serviceId),[services,serviceId]),contactValid=isValidContact(name,phone);
 const selectedPackage=packageOptions.find(p=>p.id===packageId),demoEstimate=getDemoEstimate(serviceId);
 useEffect(()=>{if(!serviceId){setPackageOptions([]);setPackageState('idle');setPackageError('');return;}if(servicesState==='loading')return;let live=true;const selectedService=services.find(s=>s.id===serviceId);setPackageError('');setPackageOptions([]);if(!selectedService){setPackageState('error');setPackageError('This service is not currently available. Please select a published service from the list.');setPackageId('');return;}setPackageState('loading');getServiceDetails(serviceId).then(data=>{if(!live)return;if(data.service.id!==serviceId)throw new Error('The selected service could not be verified.');setPackageOptions(data.packages);setPackageState('ready');if(presetPackageId&&!data.packages.some(p=>p.id===presetPackageId)&&packageId===presetPackageId){setPackageId('');setPackageError('The selected package is no longer available. Choose a current package below.')}}).catch(e=>{if(live){setPackageOptions([]);setPackageState('error');setPackageError(e instanceof Error?e.message:'Could not verify current service options. Retry before continuing.')}});return()=>{live=false}},[serviceId,servicesState,services,packageRetry]);
 useEffect(()=>{if(step!==4||!service||!visitAt)return;let live=true;setWorkerLoading(true);setWorkerError('');getEligibleWorkers({serviceId:service.id,requestedStart:new Date(visitAt).toISOString(),durationMinutes:selectedPackage?.durationMinutes||service.durationMinutes,latitude:location.latitude,longitude:location.longitude}).then(result=>{if(live){setWorkers(result.workers);if(!result.workers.some(worker=>worker.availability==='available'))setWorkerSelectionMode('operations_review');else if(workerSelectionMode==='operations_review')setWorkerSelectionMode('meraki_matched');}}).catch(error=>{if(live){setWorkers([]);setWorkerError(error instanceof Error?error.message:'Worker options could not be loaded.');setWorkerSelectionMode('operations_review');}}).finally(()=>{if(live)setWorkerLoading(false)});return()=>{live=false}},[step,service,visitAt,selectedPackage?.durationMinutes,location.latitude,location.longitude]);
 const next=()=>{setError('');if(step===1&&!service)return setError('Choose a service to continue.');if(step===1&&(packageState==='idle'||packageState==='loading'))return setError('Please wait while we verify this serviceâ€™s current options.');if(step===1&&packageOptions.length>0&&!packageId)return setError('Choose one of the current packages to continue.');if(step===1&&packageId&&!selectedPackage)return setError('Choose a currently available package to continue.');if(step===3&&(!area||!address.trim()||!visitAt))return setError('Add your area, address, and preferred time.');if(step===4&&workerLoading)return setError('Wait while we check the worker schedule.');if(step===4&&workerSelectionMode==='customer_selected'&&!workers.some(worker=>worker.id===preferredWorkerId&&worker.availability==='available'))return setError('Choose a worker available for this time or let Meraki Homes match.');if(step===5&&!contactValid)return setError('Enter your name and a valid phone number.');setStep(v=>Math.min(5,v+1));};
 const submit=async()=>{if(!service||!name.trim()||!contactValid||!area||!address.trim()||!visitAt){setError('Complete the required details before sending your request.');return;}if(packageId&&!selectedPackage){setStep(1);setError('We are checking the selected package. Please wait a moment and try again.');return;}setSubmitting(true);setError('');const payload:BookingRequestPayload={serviceId:service.id,packageId:selectedPackage?.id,expectedPackagePrice:selectedPackage?.basePrice,expectedPackageCurrency:selectedPackage?.currency,expectedPackageDuration:selectedPackage?.durationMinutes,details,serviceAnswers:answers,neighborhood:area,address:address.trim(),nearbyLandmark:landmark.trim()||undefined,latitude:location.latitude,longitude:location.longitude,locationMethod:location.method,locationConfirmed:location.confirmed,requestedStart:new Date(visitAt).toISOString(),name:name.trim(),phone:phone.trim(),email:email.trim()||undefined,workerSelectionMode,preferredWorkerId:workerSelectionMode==='customer_selected'?preferredWorkerId:undefined};try{setSubmitted(await onSubmit(payload,submissionKey.current));}catch(e){if(e instanceof ApiError&&e.status===409&&payload.packageId){setStep(1);setPackageId('');setPackageState('loading');setPackageError(e.message);getServiceDetails(service.id).then(data=>{setPackageOptions(data.packages);setPackageState('ready')}).catch(()=>{setPackageOptions([]);setPackageState('error')});setError('')}else setError(e instanceof ApiError?e.message:'We could not send your request. Please try again.')}finally{setSubmitting(false)}};
 if(submitted&&paymentReceipt)return <DemoReceipt receipt={paymentReceipt} onTrack={onViewBookings} onBookAnother={()=>window.location.assign('/booking')}/>;
 if(submitted&&!paymentSkipped)return <DemoPaymentStep booking={submitted} total={selectedPackage?.basePrice||submitted.totalPrice} currency={selectedPackage?.currency||'ETB'} phone={phone} onReceipt={setPaymentReceipt} onSkip={()=>setPaymentSkipped(true)}/>;
 if(submitted&&paymentSkipped)return <section className="mx-auto max-w-2xl px-5 py-14"><div className="rounded-lg border border-slate-200 bg-white p-7 text-center sm:p-10"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#D4A853]/20 text-[#102A43]"><Check size={26}/></div><p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-[#102A43]">Request received</p><h1 className="mt-2 text-2xl font-semibold text-[#102A43]">Weâ€™ll review the details with you.</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">This is not a confirmed appointment. Operations will check availability, service coverage, and the final price before contacting you. {location.latitude===null?'Your manual address will receive an Operations review.':''} No payment or worker assignment has been recorded.</p><p className="mt-5 rounded-md bg-[#F7F8FA] p-3 font-mono text-sm">Reference {submitted.id} Â· Status: requested</p><button onClick={onViewBookings} className="mt-6 min-h-12 rounded-md bg-[#102A43] px-5 font-semibold text-white">Track request</button></div></section>;
 return (
  <main id="customer-request" className="min-h-[calc(100vh-5rem)] bg-[#F7F8FA] px-4 pb-14 pt-6 sm:px-6 lg:pt-8">
   <div className="mx-auto max-w-7xl">
    <button onClick={onViewBookings} className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition-colors hover:text-[#102A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]">
     <ArrowLeft size={16} aria-hidden="true"/>Back to request status
    </button>

    <section aria-labelledby="booking-hero-title" className="mb-5 rounded-2xl bg-white px-5 py-5 sm:px-8 sm:py-6">
     <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div>
       <h1 id="booking-hero-title" className="text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">Request a Service</h1>
       <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-base">Book trusted professionals in minutes.</p>
      </div>
     </div>
    </section>

    <div className="mb-5">
     <BookingProgressBar currentStep={step}/>
    </div>

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:gap-8">
     <section aria-label={`Booking step ${step} of 5`} className="min-w-0 rounded-2xl bg-white p-5 sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
       <motion.div key={step} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.24,ease:'easeOut'}} aria-live="polite">
        {step===1&&<div>
         <div className="mb-7">
          <h2 className="text-2xl font-bold text-[#102A43] sm:text-3xl">Choose a service</h2>
         </div>
         <ServicePackageSelector services={services} servicesState={servicesState} serviceId={serviceId} onServiceChange={nextServiceId=>{if(nextServiceId!==serviceId){setAnswers({});setPackageId('');setPackageOptions([]);setPackageState('idle');setPackageError('')}setServiceId(nextServiceId);setError('')}} packages={packageOptions} packagesState={packageState} packageId={packageId} onPackageChange={nextPackageId=>{setPackageId(nextPackageId);setPackageError('');setError('')}} packageMessage={packageError} onRetry={()=>setPackageRetry(v=>v+1)} currency={currency} details={details} onDetailsChange={setDetails}/>
        </div>}

        {step===2&&<div className="space-y-6">
         <div>
          <h2 className="text-2xl font-bold text-[#102A43] sm:text-3xl">Work details</h2>
         </div>
         <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2">
          {(fields[serviceId]||[]).map(f=><label key={f.key} className="block text-sm font-semibold text-[#102A43]">{f.label}{f.options?<select value={answers[f.key]||''} onChange={e=>setAnswers(a=>({...a,[f.key]:e.target.value}))} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"><option value="">Choose if known</option>{f.options.map(o=><option key={o}>{o}</option>)}</select>:<input value={answers[f.key]||''} onChange={e=>setAnswers(a=>({...a,[f.key]:e.target.value}))} placeholder={f.placeholder||''} maxLength={300} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"/>}</label>)}
         </div>
         {!(packageState==='ready'&&packageOptions.length===0)&&<label className="block text-sm font-semibold text-[#102A43]">Additional notes <span className="font-normal text-slate-500">(optional)</span><textarea value={details} onChange={e=>setDetails(e.target.value)} rows={3} maxLength={1000} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15" placeholder="Anything else the team should know?"/></label>}
        </div>}

        {step===3&&<div className="space-y-6">
         <div>
          <h2 className="text-2xl font-bold text-[#102A43] sm:text-3xl">Location & time</h2>
         </div>
         <label className="block text-sm font-semibold text-[#102A43]">Service area<select value={area} onChange={e=>setArea(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"><option value="">Choose an area</option>{ADDIS_NEIGHBORHOODS.map(a=><option key={a}>{a}</option>)}</select></label>
         <div className="rounded-2xl bg-[#F7F8FA] p-4 sm:p-5"><LocationPicker value={location} address={address} landmark={landmark} onAddress={setAddress} onLandmark={setLandmark} onChange={p=>setLocation({...p,confirmed:p.confirmed??false})}/></div>
         <label className="block text-sm font-semibold text-[#102A43]">Preferred date and time<input type="datetime-local" min={new Date().toISOString().slice(0,16)} value={visitAt} onChange={e=>setVisitAt(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"/></label>
         <p className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={15} className="shrink-0 text-[#8C6A2F]" aria-hidden="true"/>Preferred time is a request.</p>
        </div>}

        {step===4&&<div className="space-y-6">
         <div>
          <h2 className="text-2xl font-bold text-[#102A43] sm:text-3xl">Choose a worker</h2>
         </div>
         <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" aria-pressed={workerSelectionMode==='meraki_matched'} onClick={()=>{setWorkerSelectionMode('meraki_matched');setPreferredWorkerId('')}} className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 ${workerSelectionMode==='meraki_matched'?'border-[#102A43] bg-[#102A43]/[.035] ring-1 ring-[#102A43]/10':'border-slate-200 hover:border-[#D4A853]'}`}><strong className="text-sm text-[#102A43]">Let Meraki Homes choose</strong></button>
          <button type="button" aria-pressed={workerSelectionMode==='operations_review'} onClick={()=>{setWorkerSelectionMode('operations_review');setPreferredWorkerId('')}} className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 ${workerSelectionMode==='operations_review'?'border-[#102A43] bg-[#102A43]/[.035] ring-1 ring-[#102A43]/10':'border-slate-200 hover:border-[#D4A853]'}`}><strong className="text-sm text-[#102A43]">Leave it for Operations</strong></button>
         </div>
         {workerLoading?<p role="status" className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Checking worker schedules and current assignmentsâ€¦</p>:workerError?<p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Worker options couldnâ€™t be loaded. You can continue with Operations review.</p>:<>
          <div className="space-y-3">{workers.map(worker=><div key={worker.id} className={`rounded-2xl border transition hover:shadow-sm ${workerSelectionMode==='customer_selected'&&preferredWorkerId===worker.id?'border-[#D4A853] bg-[#D4A853]/10':'border-slate-200 bg-white'}`}><button type="button" disabled={worker.availability!=='available'} aria-pressed={workerSelectionMode==='customer_selected'&&preferredWorkerId===worker.id} onClick={()=>{setWorkerSelectionMode('customer_selected');setPreferredWorkerId(worker.id)}} className="w-full rounded-2xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"><span className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-[#102A43]">{worker.name}{worker.isDemo?' Â· demo':''}</strong><span className={`text-xs font-semibold ${worker.availability==='available'?'text-emerald-800':worker.availability==='busy'?'text-red-700':'text-amber-800'}`}>{worker.availability==='available'?'Available':worker.availability==='busy'?'Busy':'Needs confirmation'}</span></span></button><details className="px-4 pb-3 text-xs text-slate-500"><summary className="cursor-pointer font-medium text-[#8C6A2F]">Worker details</summary><span className="mt-2 block leading-5">{worker.skills.join(', ')} Â· {worker.serviceArea}{worker.distanceKm===null?' Â· distance unavailable':` Â· ${worker.distanceKm} km`}{worker.baseRate===null?' Â· rate not configured':` Â· ${worker.baseRate.toLocaleString()} ${worker.rateCurrency}`}{worker.rating===null?' Â· no verified reviews':` Â· ${worker.rating} (${worker.reviewCount} reviews)`}</span></details></div>)}{workers.length===0&&<p className="text-sm text-slate-500">No eligible worker available.</p>}</div>
         </>}
        </div>}

        {step===5&&<div className="space-y-6">
         <div>
          <h2 className="text-2xl font-bold text-[#102A43] sm:text-3xl">Contact details</h2>
         </div>
         <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#102A43]">Your name <span className="text-red-700">*</span><input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"/></label>
          <label className="block text-sm font-semibold text-[#102A43]">Phone number <span className="text-red-700">*</span><input type="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+251 9â€¦" className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"/></label>
         </div>
         <label className="block text-sm font-semibold text-[#102A43]">Email <span className="font-normal text-slate-500">(optional)</span><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"/></label>
         <dl className="divide-y divide-slate-100 rounded-2xl bg-[#F7F8FA] px-4">
          {[["Service",service?.name],["Package",selectedPackage?.name||'Quote-based service'],["Price",selectedPackage?`${selectedPackage.basePrice.toLocaleString()} ${selectedPackage.currency}`:demoEstimate?`${formatDemoEstimate(serviceId)} (demo estimate)`:service?.pricingType==='fixed'?formatCurrency(service.basePrice,currency):'To be confirmed after scope review'],["Work details",[...Object.entries(answers).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`),details].filter(Boolean).join(' Â· ')||'No additional details'],["Address",[address,landmark,area].filter(Boolean).join(', ')],["Preferred time",visitAt?new Date(visitAt).toLocaleString():'']].map(([k,v])=><div key={k} className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]"><dt className="text-xs font-medium text-slate-500">{k}</dt><dd className="break-words text-sm text-[#102A43]">{v}</dd></div>)}
         </dl>
         <p className="text-xs text-slate-500">Request only Â· Availability and price will be confirmed.</p>
        </div>}
       </motion.div>
      </AnimatePresence>

      {error&&<p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" aria-live="assertive">{error}</p>}
      <div className="sticky bottom-2 z-20 -mx-2 mt-8 flex gap-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:mx-0 sm:rounded-none sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-6 sm:shadow-none sm:backdrop-blur-none">
       {step>1&&<button onClick={()=>{setError('');setStep(s=>s-1)}} className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 font-medium text-slate-500 transition hover:bg-slate-50 hover:text-[#102A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]"><ArrowLeft size={16} aria-hidden="true"/>Back</button>}
       {step<5?<button onClick={next} disabled={servicesState!=='ready'} className="group ml-auto inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#102A43] px-6 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#173A58] hover:shadow-md active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">Continue <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true"/></button>:<button onClick={()=>void submit()} disabled={submitting} className="group ml-auto inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#102A43] px-6 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#173A58] hover:shadow-md active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none">{submitting?<><LoaderCircle size={17} className="animate-spin" aria-hidden="true"/>Sending request…</>:<>Send request <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true"/></>}</button>}
      </div>
     </section>

     <aside aria-label="Booking summary" className="space-y-5 lg:sticky lg:top-28">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
       <h2 className="text-lg font-bold text-[#102A43]">Your booking</h2>
       <div className="mt-4 divide-y divide-slate-100">
        <div className="flex gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4A853]/15 text-[#8C6A2F]"><BadgeCheck size={17} aria-hidden="true"/></span><div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Selected Service</p><p className="mt-0.5 break-words text-sm font-semibold text-[#102A43]">{service?.name||'Not selected'}</p></div></div>
        <div className="flex gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4A853]/15 text-[#8C6A2F]"><Package size={17} aria-hidden="true"/></span><div><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Selected Package</p><p className="mt-0.5 text-sm font-medium text-[#102A43]">{selectedPackage?.name||'Not selected'}</p></div></div>
        <div className="flex gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4A853]/15 text-[#8C6A2F]"><CalendarDays size={17} aria-hidden="true"/></span><div><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Preferred Date</p><p className="mt-0.5 text-sm font-medium text-[#102A43]">{visitAt?new Date(visitAt).toLocaleDateString():'Not selected'}</p></div></div>
        <div className="flex gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4A853]/15 text-[#8C6A2F]"><Clock3 size={17} aria-hidden="true"/></span><div><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Preferred Time</p><p className="mt-0.5 text-sm font-medium text-[#102A43]">{visitAt?new Date(visitAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):'Not selected'}</p></div></div>
        <div className="flex gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4A853]/15 text-[#8C6A2F]"><MapPin size={17} aria-hidden="true"/></span><div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Location</p><p className="mt-0.5 break-words text-sm font-medium text-[#102A43]">{[area,address,landmark].filter(Boolean).join(' · ')||'Not selected'}</p></div></div>
       </div>
       <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#D4A853]/10 p-4"><CircleDollarSign size={22} className="shrink-0 text-[#8C6A2F]" aria-hidden="true"/><div><p className="text-[11px] font-semibold uppercase tracking-wide text-[#8C6A2F]">Estimated Price</p><p className="mt-0.5 text-xl font-bold tracking-tight text-[#102A43]">{selectedPackage?`${selectedPackage.basePrice.toLocaleString()} ${selectedPackage.currency}`:service?.pricingType==='fixed'?formatCurrency(service.basePrice,currency):service?'To be confirmed':'Not selected'}</p></div></div>
       <div className="mt-5 rounded-xl bg-[#F7F8FA] p-4">
        <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-[#102A43]">Progress</span><span className="text-slate-500">Step {step} of 5</span></div>
        <div role="progressbar" aria-label="Booking progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step} className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#D4A853] transition-all duration-[250ms] ease-out" style={{width:`${step/5*100}%`}}/></div>
       </div>
      </section>
     </aside>
    </div>

    <ul aria-label="Meraki Homes service assurances" className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-2 text-xs font-medium text-slate-500">
     <li className="inline-flex items-center gap-2"><BadgeCheck size={15} className="text-[#8C6A2F]" aria-hidden="true"/>Verified Professionals</li>
     <li className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#8C6A2F]" aria-hidden="true"/>Background Checked</li>
     <li className="inline-flex items-center gap-2"><Check size={15} className="text-[#8C6A2F]" aria-hidden="true"/>Satisfaction Guarantee</li>
    </ul>
   </div>
  </main>
 );
};
