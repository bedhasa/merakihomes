import React,{useEffect,useMemo,useRef,useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {ArrowLeft,ArrowRight,BadgeCheck,CalendarDays,Check,CircleDollarSign,Clock3,LoaderCircle,MapPin,Package,ShieldCheck} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {ADDIS_NEIGHBORHOODS} from '@shared/data/mockServices';
import {Booking,Currency,ServiceCategory,ServicePackage} from '@shared/types';
import {isValidContact} from './request';
import {ApiError,BookingRequestPayload,EligibleWorker,getEligibleWorkers,getPublicConfig,getServiceDetails} from '@shared/api';
import {LocationPicker,LocationValue} from './LocationPicker';
import {ServicePackageSelector} from './ServicePackageSelector';
import {getDemoEstimate} from '@shared/demoPricing';
import {DemoPaymentStep,DemoReceipt} from './DemoPaymentStep';
import {DemoPaymentReceipt} from '@shared/api';
import {BookingProgressBar} from './BookingProgressBar';
import {useApiErrorMessage} from './useApiErrorMessage';
import {translateDynamic} from './translateDynamic';
import {useFormatters} from '../i18n/useFormatters';
import {useRouter} from '../i18n/navigation';

type Props={currency:Currency;services:ServiceCategory[];servicesState:'loading'|'ready'|'error';presetServiceId?:string|null;presetPackageId?:string|null;onSubmit:(payload:BookingRequestPayload,key:string)=>Promise<Booking>;onViewBookings:()=>void};
// `value` is the English text submitted to the API; `key` selects the translated label under booking.options.
type Option={value:string;key:string};
// `label` / `placeholder` are keys under booking.fields.
type Field={key:string;label:string;placeholder?:string;options?:Option[]};
const o=(value:string,key:string):Option=>({value,key});
const fields:Record<string,Field[]>={
 premium_home_cleaning:[{key:'propertySize',label:'propertySize',options:[o('Studio or 1 bedroom','studio'),o('2 bedrooms','bed2'),o('3 bedrooms','bed3'),o('4 or more bedrooms','bed4')]},{key:'rooms',label:'roomsPriority',placeholder:'roomsPriorityHint'},{key:'frequency',label:'cleaningFrequency',options:[o('One visit','oneVisit'),o('Weekly','weekly'),o('Every two weeks','biweekly'),o('Monthly','monthly')]}],
 gardening_outdoor:[{key:'outdoorSpace',label:'outdoorSpace',options:[o('Garden','garden'),o('Yard','yard'),o('Balcony or terrace','balcony'),o('Shared grounds','sharedGrounds')]},{key:'tasks',label:'workRequested',placeholder:'workRequestedHint'},{key:'size',label:'approxSize',placeholder:'approxSizeHint'}],
 office_cleaning:[{key:'premises',label:'premisesType',options:[o('Office','office'),o('Shop','shop'),o('Clinic','clinic'),o('Other commercial space','otherCommercial')]},{key:'size',label:'approxSize',placeholder:'premisesSizeHint'},{key:'schedule',label:'preferredSchedule',placeholder:'scheduleHint'}],
 elder_companion:[{key:'support',label:'companionshipKind',options:[o('Conversation and company','conversation'),o('Reading or activities','readingActivities'),o('Light daily support','dailySupport'),o('Accompaniment','accompaniment')]},{key:'schedule',label:'preferredSchedule',placeholder:'scheduleHint'},{key:'accessibility',label:'anythingToKnow',placeholder:'optionalHint'}],
 handyman_plumbing:[{key:'repairType',label:'repairType',options:[o('Plumbing','plumbing'),o('Electrical','electrical'),o('Installation','installation'),o('Carpentry','carpentry'),o('Other','other')]},{key:'urgency',label:'helpWhen',options:[o('As soon as possible','asap'),o('Within a week','withinWeek'),o('Flexible','flexible')]},{key:'issue',label:'issue',placeholder:'issueHint'}],
 childcare_nanny:[{key:'children',label:'childCount',placeholder:'childCountHint'},{key:'ageRanges',label:'ageRanges',placeholder:'ageRangesHint'},{key:'schedule',label:'scheduleRequested',placeholder:'scheduleHint'}],
 cooking_service:[{key:'mealQuantity',label:'mealQuantity',placeholder:'mealQuantityHint'},{key:'dietaryNeeds',label:'dietary',placeholder:'optionalHint'},{key:'ingredients',label:'ingredients',options:[o('I will provide ingredients','ownIngredients'),o('Please discuss sourcing','discussSourcing'),o('Not sure yet','notSureYet')]}],
 maid_laundry:[{key:'loadSize',label:'loadSize',options:[o('Small','small'),o('Medium','medium'),o('Large','large'),o('Not sure','notSure')]},{key:'tasks',label:'servicesRequested',options:[o('Wash and fold','washFold'),o('Ironing','ironing'),o('Wash and iron','washIron'),o('Laundry and organization','laundryOrganize')]},{key:'turnaround',label:'turnaround',options:[o('Same day if possible','sameDay'),o('Within 2 days','within2Days'),o('Flexible','flexible')]}],
};
// Area names are submitted in English; this maps them to translated labels under booking.areas.
const areaKeys:Record<string,string>={'Bole Atlas':'boleAtlas','Kazanchis':'kazanchis','Old Airport':'oldAirport','Sarbet / Bisrate Gabriel':'sarbet','CMC / Summit':'cmcSummit','Gerji / Imperial':'gerjiImperial','Nifas Silk':'nifasSilk','Mexico / Lideta':'mexicoLideta'};

export const RequestFlow:React.FC<Props>=({currency,services,servicesState,presetServiceId,presetPackageId,onSubmit,onViewBookings})=>{
 const t=useTranslations('booking'),errorMessage=useApiErrorMessage();
 const router=useRouter();
 const {formatCurrency,formatDemoEstimate,formatMoney,formatDate,formatDateTime,formatNumber}=useFormatters();
 const areaLabel=(area:string)=>translateDynamic(t,`areas.${areaKeys[area]}`,area);
 const fieldText=(group:'fields'|'options',key:string)=>translateDynamic(t,`${group}.${key}`,key);
 const [step,setStep]=useState(1),[serviceId,setServiceId]=useState(presetServiceId??''),[packageId,setPackageId]=useState(presetPackageId??''),[packageOptions,setPackageOptions]=useState<ServicePackage[]>([]),[packageState,setPackageState]=useState<'idle'|'loading'|'ready'|'error'>('idle'),[packageRetry,setPackageRetry]=useState(0),[packageError,setPackageError]=useState(''),[details,setDetails]=useState(''),[answers,setAnswers]=useState<Record<string,string>>({}),[area,setArea]=useState(''),[address,setAddress]=useState(''),[landmark,setLandmark]=useState(''),[location,setLocation]=useState<LocationValue>({latitude:null,longitude:null,method:'manual',confirmed:false}),[visitAt,setVisitAt]=useState(''),[name,setName]=useState(''),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[error,setError]=useState(''),[submitted,setSubmitted]=useState<Booking|null>(null),[submitting,setSubmitting]=useState(false),[workers,setWorkers]=useState<EligibleWorker[]>([]),[workerLoading,setWorkerLoading]=useState(false),[workerError,setWorkerError]=useState(''),[workerSelectionMode,setWorkerSelectionMode]=useState<'customer_selected'|'meraki_matched'|'operations_review'>('meraki_matched'),[preferredWorkerId,setPreferredWorkerId]=useState(''),[paymentReceipt,setPaymentReceipt]=useState<DemoPaymentReceipt|null>(null),[paymentSkipped,setPaymentSkipped]=useState(false);
 // Demo (simulated) payments are switched off on the live site; default to hidden until the API says otherwise.
 const [demoPayments,setDemoPayments]=useState(false);
 useEffect(()=>{let live=true;getPublicConfig().then(config=>{if(live)setDemoPayments(config.demoPayments===true);}).catch(()=>{});return()=>{live=false;};},[]);
 const submissionKey=useRef(crypto.randomUUID()),service=useMemo(()=>services.find(s=>s.id===serviceId),[services,serviceId]),contactValid=isValidContact(name,phone);
 const selectedPackage=packageOptions.find(p=>p.id===packageId),demoEstimate=getDemoEstimate(serviceId);
 useEffect(()=>{if(!serviceId){setPackageOptions([]);setPackageState('idle');setPackageError('');return;}if(servicesState==='loading')return;let live=true;const selectedService=services.find(s=>s.id===serviceId);setPackageError('');setPackageOptions([]);if(!selectedService){setPackageState('error');setPackageError(t('errors.serviceUnavailable'));setPackageId('');return;}setPackageState('loading');getServiceDetails(serviceId).then(data=>{if(!live)return;if(data.service.id!==serviceId)throw new Error(t('errors.serviceNotVerified'));setPackageOptions(data.packages);setPackageState('ready');if(presetPackageId&&!data.packages.some(p=>p.id===presetPackageId)&&packageId===presetPackageId){setPackageId('');setPackageError(t('errors.packageRemoved'))}}).catch(e=>{if(live){setPackageOptions([]);setPackageState('error');setPackageError(errorMessage(e,t('errors.verifyFailed')))}});return()=>{live=false}},[serviceId,servicesState,services,packageRetry]);
 useEffect(()=>{if(step!==4||!service||!visitAt)return;let live=true;setWorkerLoading(true);setWorkerError('');getEligibleWorkers({serviceId:service.id,requestedStart:new Date(visitAt).toISOString(),durationMinutes:selectedPackage?.durationMinutes||service.durationMinutes,latitude:location.latitude,longitude:location.longitude}).then(result=>{if(live){setWorkers(result.workers);if(!result.workers.some(worker=>worker.availability==='available'))setWorkerSelectionMode('operations_review');else if(workerSelectionMode==='operations_review')setWorkerSelectionMode('meraki_matched');}}).catch(error=>{if(live){setWorkers([]);setWorkerError(errorMessage(error,t('errors.workersFailed')));setWorkerSelectionMode('operations_review');}}).finally(()=>{if(live)setWorkerLoading(false)});return()=>{live=false}},[step,service,visitAt,selectedPackage?.durationMinutes,location.latitude,location.longitude]);
 const next=()=>{setError('');if(step===1&&!service)return setError(t('errors.chooseService'));if(step===1&&(packageState==='idle'||packageState==='loading'))return setError(t('errors.verifying'));if(step===1&&packageOptions.length>0&&!packageId)return setError(t('errors.choosePackage'));if(step===1&&packageId&&!selectedPackage)return setError(t('errors.packageUnavailable'));if(step===3&&(!area||!address.trim()||!visitAt))return setError(t('errors.locationRequired'));if(step===4&&workerLoading)return setError(t('errors.workerChecking'));if(step===4&&workerSelectionMode==='customer_selected'&&!workers.some(worker=>worker.id===preferredWorkerId&&worker.availability==='available'))return setError(t('errors.workerRequired'));if(step===5&&!contactValid)return setError(t('errors.contactRequired'));setStep(v=>Math.min(5,v+1));};
 const submit=async()=>{if(!service||!name.trim()||!contactValid||!area||!address.trim()||!visitAt){setError(t('errors.incomplete'));return;}if(packageId&&!selectedPackage){setStep(1);setError(t('errors.packageChecking'));return;}setSubmitting(true);setError('');const payload:BookingRequestPayload={serviceId:service.id,packageId:selectedPackage?.id,expectedPackagePrice:selectedPackage?.basePrice,expectedPackageCurrency:selectedPackage?.currency,expectedPackageDuration:selectedPackage?.durationMinutes,details,serviceAnswers:answers,neighborhood:area,address:address.trim(),nearbyLandmark:landmark.trim()||undefined,latitude:location.latitude,longitude:location.longitude,locationMethod:location.method,locationConfirmed:location.confirmed,requestedStart:new Date(visitAt).toISOString(),name:name.trim(),phone:phone.trim(),email:email.trim()||undefined,workerSelectionMode,preferredWorkerId:workerSelectionMode==='customer_selected'?preferredWorkerId:undefined};try{setSubmitted(await onSubmit(payload,submissionKey.current));}catch(e){if(e instanceof ApiError&&e.status===409&&payload.packageId){setStep(1);setPackageId('');setPackageState('loading');setPackageError(errorMessage(e,e.message));getServiceDetails(service.id).then(data=>{setPackageOptions(data.packages);setPackageState('ready')}).catch(()=>{setPackageOptions([]);setPackageState('error')});setError('')}else setError(errorMessage(e instanceof ApiError?e:null,t('errors.sendFailed')))}finally{setSubmitting(false)}};
 if(submitted&&paymentReceipt)return <DemoReceipt receipt={paymentReceipt} onTrack={onViewBookings} onBookAnother={()=>router.push('/booking')}/>;
 if(submitted&&!paymentSkipped&&demoPayments)return <DemoPaymentStep booking={submitted} total={selectedPackage?.basePrice||submitted.totalPrice} currency={selectedPackage?.currency||'ETB'} phone={phone} onReceipt={setPaymentReceipt} onSkip={()=>setPaymentSkipped(true)}/>;
 if(submitted&&(paymentSkipped||!demoPayments))return <section className="mx-auto max-w-2xl px-5 py-14"><div className="rounded-lg border border-slate-200 bg-white p-7 text-center sm:p-10"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#D4A853]/20 text-[#102A43]"><Check size={26}/></div><p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-[#102A43]">{t('received.eyebrow')}</p><h1 className="mt-2 text-2xl font-semibold text-[#102A43]">{t('received.title')}</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">{[t('received.body'),location.latitude===null?t('received.manualAddress'):'',demoPayments?t('received.noPayment'):t('received.paymentByTeam')].filter(Boolean).join(' ')}</p><p className="mt-5 rounded-md bg-[#F7F8FA] p-3 font-mono text-sm">{t('received.reference',{id:submitted.id})}</p><button onClick={onViewBookings} className="mt-6 min-h-12 rounded-md bg-[#102A43] px-5 font-semibold text-white">{t('received.track')}</button></div></section>;
 const fieldDefs=fields[serviceId]||[];
 const answerLines=Object.entries(answers).filter(([,v])=>v).map(([k,v])=>{const f=fieldDefs.find(x=>x.key===k),opt=f?.options?.find(x=>x.value===v);return `${f?fieldText('fields',f.label):k}: ${opt?fieldText('options',opt.key):v}`});
 const workerAvailability=(availability:EligibleWorker['availability'])=>availability==='available'?t('worker.available'):availability==='busy'?t('worker.busy'):t('worker.needsConfirmation');
 return (
  <main id="customer-request" className="min-h-[calc(100vh-5rem)] bg-[#F7F8FA] px-4 pb-14 pt-6 sm:px-6 lg:pt-8">
   <div className="mx-auto max-w-7xl">
    <button onClick={onViewBookings} className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition-colors hover:text-[#102A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]">
     <ArrowLeft size={16} aria-hidden="true"/>{t('backToStatus')}
    </button>

    <section aria-labelledby="booking-hero-title" className="mb-5 rounded-2xl bg-white px-5 py-5 sm:px-8 sm:py-6">
     <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div>
       <h1 id="booking-hero-title" className="text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">{t('heroTitle')}</h1>
       <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-base">{t('heroSubtitle')}</p>
      </div>
     </div>
    </section>

    <div className="mb-5">
     <BookingProgressBar currentStep={step}/>
    </div>

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:gap-8">
     <section aria-label={t('stepAria',{step,total:5})} className="min-w-0 rounded-2xl bg-white p-5 sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
       <motion.div key={step} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.24,ease:'easeOut'}} aria-live="polite">
        {step===1&&<div>
         <div className="mb-7">
          <h2 className="text-2xl font-bold text-[#102A43] sm:text-3xl">{t('steps.chooseService')}</h2>
         </div>
         <ServicePackageSelector services={services} servicesState={servicesState} serviceId={serviceId} onServiceChange={nextServiceId=>{if(nextServiceId!==serviceId){setAnswers({});setPackageId('');setPackageOptions([]);setPackageState('idle');setPackageError('')}setServiceId(nextServiceId);setError('')}} packages={packageOptions} packagesState={packageState} packageId={packageId} onPackageChange={nextPackageId=>{setPackageId(nextPackageId);setPackageError('');setError('')}} packageMessage={packageError} onRetry={()=>setPackageRetry(v=>v+1)} currency={currency} details={details} onDetailsChange={setDetails}/>
        </div>}

        {step===2&&<div className="space-y-6">
         <div>
          <h2 className="text-2xl font-bold text-[#102A43] sm:text-3xl">{t('steps.workDetails')}</h2>
         </div>
         <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2">
          {fieldDefs.map(f=><label key={f.key} className="block text-sm font-semibold text-[#102A43]">{fieldText('fields',f.label)}{f.options?<select value={answers[f.key]||''} onChange={e=>setAnswers(a=>({...a,[f.key]:e.target.value}))} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"><option value="">{t('form.chooseIfKnown')}</option>{f.options.map(opt=><option key={opt.value} value={opt.value}>{fieldText('options',opt.key)}</option>)}</select>:<input value={answers[f.key]||''} onChange={e=>setAnswers(a=>({...a,[f.key]:e.target.value}))} placeholder={f.placeholder?fieldText('fields',f.placeholder):''} maxLength={300} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"/>}</label>)}
         </div>
         {!(packageState==='ready'&&packageOptions.length===0)&&<label className="block text-sm font-semibold text-[#102A43]">{t('form.additionalNotes')} <span className="font-normal text-slate-500">{t('form.optional')}</span><textarea value={details} onChange={e=>setDetails(e.target.value)} rows={3} maxLength={1000} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15" placeholder={t('form.notesPlaceholder')}/></label>}
        </div>}

        {step===3&&<div className="space-y-6">
         <div>
          <h2 className="text-2xl font-bold text-[#102A43] sm:text-3xl">{t('steps.locationTime')}</h2>
         </div>
         <label className="block text-sm font-semibold text-[#102A43]">{t('form.serviceArea')}<select value={area} onChange={e=>setArea(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"><option value="">{t('form.chooseArea')}</option>{ADDIS_NEIGHBORHOODS.map(a=><option key={a} value={a}>{areaLabel(a)}</option>)}</select></label>
         <div className="rounded-2xl bg-[#F7F8FA] p-4 sm:p-5"><LocationPicker value={location} address={address} landmark={landmark} onAddress={setAddress} onLandmark={setLandmark} onChange={p=>setLocation({...p,confirmed:p.confirmed??false})}/></div>
         <label className="block text-sm font-semibold text-[#102A43]">{t('form.dateTime')}<input type="datetime-local" min={new Date().toISOString().slice(0,16)} value={visitAt} onChange={e=>setVisitAt(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"/></label>
         <p className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={15} className="shrink-0 text-[#8C6A2F]" aria-hidden="true"/>{t('form.timeNote')}</p>
        </div>}

        {step===4&&<div className="space-y-6">
         <div>
          <h2 className="text-2xl font-bold text-[#102A43] sm:text-3xl">{t('steps.chooseWorker')}</h2>
         </div>
         <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" aria-pressed={workerSelectionMode==='meraki_matched'} onClick={()=>{setWorkerSelectionMode('meraki_matched');setPreferredWorkerId('')}} className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 ${workerSelectionMode==='meraki_matched'?'border-[#102A43] bg-[#102A43]/[.035] ring-1 ring-[#102A43]/10':'border-slate-200 hover:border-[#D4A853]'}`}><strong className="text-sm text-[#102A43]">{t('worker.matchTitle')}</strong></button>
          <button type="button" aria-pressed={workerSelectionMode==='operations_review'} onClick={()=>{setWorkerSelectionMode('operations_review');setPreferredWorkerId('')}} className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 ${workerSelectionMode==='operations_review'?'border-[#102A43] bg-[#102A43]/[.035] ring-1 ring-[#102A43]/10':'border-slate-200 hover:border-[#D4A853]'}`}><strong className="text-sm text-[#102A43]">{t('worker.opsTitle')}</strong></button>
         </div>
         {workerLoading?<p role="status" className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{t('worker.checking')}</p>:workerError?<p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{t('worker.loadError')}</p>:<>
          <div className="space-y-3">{workers.map(worker=><div key={worker.id} className={`rounded-2xl border transition hover:shadow-sm ${workerSelectionMode==='customer_selected'&&preferredWorkerId===worker.id?'border-[#D4A853] bg-[#D4A853]/10':'border-slate-200 bg-white'}`}><button type="button" disabled={worker.availability!=='available'} aria-pressed={workerSelectionMode==='customer_selected'&&preferredWorkerId===worker.id} onClick={()=>{setWorkerSelectionMode('customer_selected');setPreferredWorkerId(worker.id)}} className="w-full rounded-2xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"><span className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-[#102A43]">{worker.name}{worker.isDemo?` · ${t('worker.demo')}`:''}</strong><span className={`text-xs font-semibold ${worker.availability==='available'?'text-emerald-800':worker.availability==='busy'?'text-red-700':'text-amber-800'}`}>{workerAvailability(worker.availability)}</span></span></button><details className="px-4 pb-3 text-xs text-slate-500"><summary className="cursor-pointer font-medium text-[#8C6A2F]">{t('worker.details')}</summary><span className="mt-2 block leading-5">{[worker.skills.join(', '),worker.serviceArea,worker.distanceKm===null?t('worker.distanceUnavailable'):t('worker.distanceKm',{km:formatNumber(worker.distanceKm,{maximumFractionDigits:1})}),worker.baseRate===null?t('worker.rateNotConfigured'):t('worker.rate',{amount:formatNumber(worker.baseRate),currency:worker.rateCurrency}),worker.rating===null?t('worker.noReviews'):t('worker.rating',{rating:worker.rating,count:formatNumber(worker.reviewCount)})].join(' · ')}</span></details></div>)}{workers.length===0&&<p className="text-sm text-slate-500">{t('worker.none')}</p>}</div>
         </>}
        </div>}

        {step===5&&<div className="space-y-6">
         <div>
          <h2 className="text-2xl font-bold text-[#102A43] sm:text-3xl">{t('steps.contactDetails')}</h2>
         </div>
         <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#102A43]">{t('form.name')} <span className="text-red-700">*</span><input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"/></label>
          <label className="block text-sm font-semibold text-[#102A43]">{t('form.phone')} <span className="text-red-700">*</span><input type="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t('form.phonePlaceholder')} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"/></label>
         </div>
         <label className="block text-sm font-semibold text-[#102A43]">{t('form.email')} <span className="font-normal text-slate-500">{t('form.optional')}</span><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-[#D4A853] focus:ring-4 focus:ring-[#D4A853]/15"/></label>
         <dl className="divide-y divide-slate-100 rounded-2xl bg-[#F7F8FA] px-4">
          {[[t('summary.reviewService'),service?.name],[t('summary.reviewPackage'),selectedPackage?.name||t('summary.quoteBased')],[t('summary.reviewPrice'),selectedPackage?formatMoney(selectedPackage.basePrice,selectedPackage.currency):demoEstimate?t('summary.demoEstimate',{amount:formatDemoEstimate(serviceId)}):service?.pricingType==='fixed'?formatCurrency(service.basePrice,currency):t('summary.confirmedAfterScope')],[t('summary.reviewWork'),[...answerLines,details].filter(Boolean).join(' · ')||t('summary.noDetails')],[t('summary.reviewAddress'),[address,landmark,area?areaLabel(area):''].filter(Boolean).join(', ')],[t('summary.reviewTime'),visitAt?formatDateTime(visitAt):'']].map(([k,v])=><div key={k} className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]"><dt className="text-xs font-medium text-slate-500">{k}</dt><dd className="break-words text-sm text-[#102A43]">{v}</dd></div>)}
         </dl>
         <p className="text-xs text-slate-500">{t('summary.requestOnly')}</p>
        </div>}
       </motion.div>
      </AnimatePresence>

      {error&&<p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" aria-live="assertive">{error}</p>}
      <div className="sticky bottom-2 z-20 -mx-2 mt-8 flex gap-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:mx-0 sm:rounded-none sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-6 sm:shadow-none sm:backdrop-blur-none">
       {step>1&&<button onClick={()=>{setError('');setStep(s=>s-1)}} className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 font-medium text-slate-500 transition hover:bg-slate-50 hover:text-[#102A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]"><ArrowLeft size={16} aria-hidden="true"/>{t('back')}</button>}
       {step<5?<button onClick={next} disabled={servicesState!=='ready'} className="group ml-auto inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#102A43] px-6 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#173A58] hover:shadow-md active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">{t('continue')} <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true"/></button>:<button onClick={()=>void submit()} disabled={submitting} className="group ml-auto inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#102A43] px-6 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#173A58] hover:shadow-md active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none">{submitting?<><LoaderCircle size={17} className="animate-spin" aria-hidden="true"/>{t('sending')}</>:<>{t('sendRequest')} <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true"/></>}</button>}
      </div>
     </section>

     <aside aria-label={t('summary.ariaLabel')} className="space-y-5 lg:sticky lg:top-28">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
       <h2 className="text-lg font-bold text-[#102A43]">{t('summary.title')}</h2>
       <div className="mt-4 divide-y divide-slate-100">
        <div className="flex gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4A853]/15 text-[#8C6A2F]"><BadgeCheck size={17} aria-hidden="true"/></span><div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t('summary.selectedService')}</p><p className="mt-0.5 break-words text-sm font-semibold text-[#102A43]">{service?.name||t('summary.notSelected')}</p></div></div>
        <div className="flex gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4A853]/15 text-[#8C6A2F]"><Package size={17} aria-hidden="true"/></span><div><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t('summary.selectedPackage')}</p><p className="mt-0.5 text-sm font-medium text-[#102A43]">{selectedPackage?.name||t('summary.notSelected')}</p></div></div>
        <div className="flex gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4A853]/15 text-[#8C6A2F]"><CalendarDays size={17} aria-hidden="true"/></span><div><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t('summary.preferredDate')}</p><p className="mt-0.5 text-sm font-medium text-[#102A43]">{visitAt?formatDate(visitAt,{dateStyle:'medium'}):t('summary.notSelected')}</p></div></div>
        <div className="flex gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4A853]/15 text-[#8C6A2F]"><Clock3 size={17} aria-hidden="true"/></span><div><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t('summary.preferredTime')}</p><p className="mt-0.5 text-sm font-medium text-[#102A43]">{visitAt?formatDate(visitAt,{hour:'numeric',minute:'2-digit'}):t('summary.notSelected')}</p></div></div>
        <div className="flex gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D4A853]/15 text-[#8C6A2F]"><MapPin size={17} aria-hidden="true"/></span><div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t('summary.location')}</p><p className="mt-0.5 break-words text-sm font-medium text-[#102A43]">{[area?areaLabel(area):'',address,landmark].filter(Boolean).join(' · ')||t('summary.notSelected')}</p></div></div>
       </div>
       <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#D4A853]/10 p-4"><CircleDollarSign size={22} className="shrink-0 text-[#8C6A2F]" aria-hidden="true"/><div><p className="text-[11px] font-semibold uppercase tracking-wide text-[#8C6A2F]">{t('summary.estimatedPrice')}</p><p className="mt-0.5 text-xl font-bold tracking-tight text-[#102A43]">{selectedPackage?formatMoney(selectedPackage.basePrice,selectedPackage.currency):service?.pricingType==='fixed'?formatCurrency(service.basePrice,currency):service?t('summary.toBeConfirmed'):t('summary.notSelected')}</p></div></div>
       <div className="mt-5 rounded-xl bg-[#F7F8FA] p-4">
        <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-[#102A43]">{t('progressLabel')}</span><span className="text-slate-500">{t('stepCounter',{step,total:5})}</span></div>
        <div role="progressbar" aria-label={t('progressAria')} aria-valuemin={1} aria-valuemax={5} aria-valuenow={step} className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#D4A853] transition-all duration-[250ms] ease-out" style={{width:`${step/5*100}%`}}/></div>
       </div>
      </section>
     </aside>
    </div>

    <ul aria-label={t('assurances.ariaLabel')} className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-2 text-xs font-medium text-slate-500">
     <li className="inline-flex items-center gap-2"><BadgeCheck size={15} className="text-[#8C6A2F]" aria-hidden="true"/>{t('assurances.verified')}</li>
     <li className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#8C6A2F]" aria-hidden="true"/>{t('assurances.background')}</li>
     <li className="inline-flex items-center gap-2"><Check size={15} className="text-[#8C6A2F]" aria-hidden="true"/>{t('assurances.guarantee')}</li>
    </ul>
   </div>
  </main>
 );
};
