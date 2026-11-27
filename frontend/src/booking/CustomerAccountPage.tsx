import React,{useEffect,useRef,useState} from 'react';
import { ArrowRight, RefreshCw, UserRound } from 'lucide-react';
import { ApiError, CustomerAccount, CustomerPriceProposal, decideCustomerApproval, getCustomerAccount, getCustomerBookings, getCustomerPriceProposals, initializeChapaPayment, loginCustomer, logoutCustomer, registerCustomer, updateCustomerName } from '@shared/api';
import { customerPaymentLabel, customerPaymentStatus, getChapaCallbackUrl, getChapaReturnUrl, isChapaPaymentEligible, redirectToChapaCheckout } from './chapaPayment';

const input='mt-2 h-12 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#D4A853]/30';
export const CustomerAuthPage:React.FC<{mode:'login'|'register';onSignedIn:()=>void}>=({mode,onSignedIn})=>{
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[phone,setPhone]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{if(mode==='register')await registerCustomer({name,email,phone,password});else await loginCustomer(email,password);onSignedIn();}catch(err){setError(err instanceof ApiError?err.message:'Could not connect. Please try again.');}finally{setBusy(false);}};
 return <main className="min-h-[calc(100vh-4rem)] bg-[#F7F8FA] px-5 py-12"><section className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#D4A853]/20 text-[#102A43]"><UserRound size={19}/></span><div><p className="text-xs font-semibold uppercase tracking-wider text-[#8C6A2F]">Meraki Homes account</p><h1 className="mt-1 text-2xl font-semibold text-[#102A43]">{mode==='login'?'Welcome back':'Create an account'}</h1></div></div><p className="mt-4 text-sm leading-6 text-slate-600">Guest booking is always available. An account lets you see requests linked to this sign-in.</p>
 {error&&<p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}
 <form onSubmit={submit} className="mt-6 space-y-4">{mode==='register'&&<><label className="block text-sm font-medium">Full name<input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} className={input}/></label><label className="block text-sm font-medium">Phone number<input required type="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} className={input}/></label></>}<label className="block text-sm font-medium">Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className={input}/></label><label className="block text-sm font-medium">Password<input required type="password" minLength={10} maxLength={200} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} className={input}/>{mode==='register'&&<span className="mt-1 block text-xs text-slate-500">Use at least 10 characters.</span>}</label><button disabled={busy} className="meraki-button w-full">{busy?'Please wait…':mode==='login'?'Sign in':'Create account'} <ArrowRight size={16}/></button></form><p className="mt-5 text-center text-sm text-slate-600">{mode==='login'?<>New here? <a className="font-semibold text-[#102A43] underline" href="/register">Create an account</a></>:<>Already have an account? <a className="font-semibold text-[#102A43] underline" href="/login">Sign in</a></>}</p></section></main>;
};

export const CustomerAccountPage:React.FC<{bookings:boolean;onSignOut:()=>void}>=({bookings,onSignOut})=>{
 const [customer,setCustomer]=useState<CustomerAccount|null>(null);
 const [rows,setRows]=useState<Awaited<ReturnType<typeof getCustomerBookings>>>([]);
 const [proposals,setProposals]=useState<CustomerPriceProposal[]>([]);
 const [loading,setLoading]=useState(true);
 const [refreshing,setRefreshing]=useState(false);
 const [error,setError]=useState('');
 const [paymentError,setPaymentError]=useState('');
 const [proposalError,setProposalError]=useState('');
 const [proposalNotice,setProposalNotice]=useState('');
 const [decidingProposalId,setDecidingProposalId]=useState<string|null>(null);
 const [initializingReference,setInitializingReference]=useState<string|null>(null);
 const [editingProfile,setEditingProfile]=useState(false);
 const [profileFirstName,setProfileFirstName]=useState('');
 const [profileLastName,setProfileLastName]=useState('');
 const [savingProfile,setSavingProfile]=useState(false);
 const [profileError,setProfileError]=useState('');
 const [profileNotice,setProfileNotice]=useState('');
 const initializationInProgress=useRef(false);
 const proposalDecisionInProgress=useRef(false);

 const refreshAccount=async()=>{
  setRefreshing(true);
  setPaymentError('');
  setProposalError('');
  try{
   const [bookings,priceProposals]=await Promise.all([getCustomerBookings(),getCustomerPriceProposals()]);
   setRows(bookings);
   setProposals(priceProposals);
  }catch(e){
   setPaymentError(e instanceof ApiError?e.message:'Could not refresh your booking and payment status.');
  }finally{setRefreshing(false);}
 };

 useEffect(()=>{
  let active=true;
  Promise.all([getCustomerAccount(),getCustomerBookings(),getCustomerPriceProposals()])
   .then(([account,bookings,priceProposals])=>{if(active){setCustomer(account);setRows(bookings);setProposals(priceProposals);}})
   .catch(e=>{if(active)setError(e instanceof ApiError?e.message:'Could not load account details.');})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[]);

 useEffect(()=>{
  const refreshWhenRestored=(event:PageTransitionEvent)=>{
   if(!event.persisted)return;
   void getCustomerBookings().then(setRows).catch(e=>setPaymentError(e instanceof ApiError?e.message:'Could not refresh your booking and payment status.'));
  };
  window.addEventListener('pageshow',refreshWhenRestored);
  return()=>window.removeEventListener('pageshow',refreshWhenRestored);
 },[]);

 const decidePrice=async(proposal:CustomerPriceProposal,decision:'accepted'|'rejected')=>{
  if(proposalDecisionInProgress.current||proposal.status!=='sent')return;
  proposalDecisionInProgress.current=true;
  setDecidingProposalId(proposal.id);
  setProposalError('');
  setProposalNotice('');
  try{
   await decideCustomerApproval('price',proposal.id,decision);
   setProposals(current=>current.map(row=>row.id===proposal.id?{...row,status:decision,decidedAt:new Date().toISOString()}:row));
   setProposalNotice(decision==='accepted'?'Price accepted. Your booking amount has been updated.':'Price rejected. The proposed amount was not approved.');
   try{
    const [bookings,priceProposals]=await Promise.all([getCustomerBookings(),getCustomerPriceProposals()]);
    setRows(bookings);
    setProposals(priceProposals);
   }catch{
    setProposalError('Your decision was saved, but the account could not refresh. Use Refresh status to reload your booking.');
   }
  }catch(e){
   setProposalError(e instanceof ApiError?e.message:'Could not save your decision. Refresh proposals and try again.');
  }finally{proposalDecisionInProgress.current=false;setDecidingProposalId(null);}
 };

 const payNow=async(bookingReference:string)=>{
  if(initializationInProgress.current||!customer)return;
  if(!customer.firstName.trim()||!customer.lastName.trim()){setPaymentError('Add both your first and last name in Edit Profile before starting checkout.');return;}
  initializationInProgress.current=true;setInitializingReference(bookingReference);setPaymentError('');
  try{
   const result=await initializeChapaPayment({bookingReference,callbackUrl:getChapaCallbackUrl(window.location.origin),returnUrl:getChapaReturnUrl(window.location.origin)});
   redirectToChapaCheckout(result.checkoutUrl);
  }catch(e){
   if(e instanceof ApiError&&e.status===409)setPaymentError(e.message);
   else if(e instanceof ApiError&&e.status===0)setPaymentError('We could not confirm whether payment initialization reached the server. Refresh booking status before trying again.');
   else setPaymentError(e instanceof ApiError?e.message:'Could not start Chapa sandbox checkout. Please try again.');
  }finally{initializationInProgress.current=false;setInitializingReference(null);}
 };

 const openProfileEditor=()=>{setProfileFirstName(customer?.firstName||'');setProfileLastName(customer?.lastName||'');setProfileError('');setProfileNotice('');setEditingProfile(true);};
 const saveProfile=async(e:React.FormEvent)=>{e.preventDefault();if(savingProfile)return;setSavingProfile(true);setProfileError('');setProfileNotice('');try{const updated=await updateCustomerName({firstName:profileFirstName.trim(),lastName:profileLastName.trim()});setCustomer(updated);setProfileFirstName(updated.firstName);setProfileLastName(updated.lastName);setEditingProfile(false);setProfileNotice('Your profile name was updated.');}catch(err){setProfileError(err instanceof ApiError?err.message:'Could not save your profile. Please try again.');}finally{setSavingProfile(false);}};

 const signOut=async()=>{await logoutCustomer();onSignOut();};
 if(loading)return <main className="mx-auto max-w-4xl px-5 py-12" role="status">Loading your account…</main>;
 if(error)return <main className="mx-auto max-w-2xl px-5 py-12"><div role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error} <a className="underline" href="/login">Sign in</a></div></main>;

 return <main className="mx-auto max-w-5xl px-5 py-10">
  <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#8C6A2F]">My account</p><h1 className="mt-2 text-3xl font-semibold text-[#102A43]">Hello, {customer?.name}</h1><p className="mt-2 text-sm text-slate-600">{customer?.email}</p></div><button onClick={()=>void signOut()} className="min-h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold">Sign out</button></div>
  <div className="mt-8 flex gap-4 border-b border-slate-200"><a href="/my-account" className={`pb-3 text-sm ${!bookings?'border-b-2 border-[#D4A853] font-semibold':''}`}>Overview</a><a href="/my-account/bookings" className={`pb-3 text-sm ${bookings?'border-b-2 border-[#D4A853] font-semibold':''}`}>My bookings ({rows.length})</a></div>

  {!bookings&&<section className="mt-6 rounded-lg border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-[#102A43]">Profile</h2><p className="mt-1 text-sm text-slate-600">{customer?.firstName} {customer?.lastName}</p></div>{!editingProfile&&<button type="button" onClick={openProfileEditor} className="min-h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold">Edit Profile</button>}</div>{profileNotice&&<p role="status" className="mt-3 text-sm text-emerald-800">{profileNotice}</p>}{profileError&&<p role="alert" className="mt-3 text-sm text-red-800">{profileError}</p>}{editingProfile&&<form onSubmit={saveProfile} className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">First name<input required maxLength={60} autoComplete="given-name" value={profileFirstName} onChange={e=>setProfileFirstName(e.target.value)} className={input}/></label><label className="text-sm font-medium">Last name<input required maxLength={60} autoComplete="family-name" value={profileLastName} onChange={e=>setProfileLastName(e.target.value)} className={input}/></label><div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={savingProfile} className="min-h-10 rounded-md bg-[#102A43] px-4 text-sm font-semibold text-white disabled:opacity-60">{savingProfile?'Saving…':'Save Profile'}</button><button type="button" disabled={savingProfile} onClick={()=>setEditingProfile(false)} className="min-h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold">Cancel</button></div></form>}</section>}

  <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
   <h2 className="font-semibold text-[#102A43]">Price proposals</h2>
   <p className="mt-1 text-sm text-slate-600">Review proposed prices from Meraki Homes Operations.</p>
   {proposalNotice&&<p role="status" className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{proposalNotice}</p>}
   {proposalError&&<p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{proposalError}</p>}
   {proposals.length===0?<p className="py-5 text-sm text-slate-500">You have no price proposals yet.</p>:<div className="mt-3 divide-y divide-slate-200">{proposals.map(proposal=>{
    const pending=proposal.status==='sent',busy=decidingProposalId===proposal.id;
    return <article key={proposal.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
     <div className="min-w-0"><p className="font-mono text-xs text-slate-500">Booking {proposal.bookingReference}</p><h3 className="mt-1 font-semibold text-[#102A43]">{proposal.serviceName}</h3><p className="mt-1 text-lg font-semibold">{Number(proposal.amount).toLocaleString()} {proposal.currency}</p><p className="mt-2 text-sm leading-6 text-slate-600">{proposal.reason}</p><p className="mt-2 text-xs text-slate-500">Proposal status: <span className="font-semibold capitalize">{proposal.status}</span></p></div>
     {pending&&<div className="flex shrink-0 gap-2"><button type="button" disabled={decidingProposalId!==null} onClick={()=>void decidePrice(proposal,'accepted')} className="min-h-10 rounded-md bg-[#102A43] px-3 text-sm font-semibold text-white disabled:opacity-60">{busy?'Saving…':'Accept Price'}</button><button type="button" disabled={decidingProposalId!==null} onClick={()=>void decidePrice(proposal,'rejected')} className="min-h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 disabled:opacity-60">Reject Price</button></div>}
    </article>;
   })}</div>}
  </section>

  {!bookings?<section className="mt-6 rounded-lg border border-slate-200 bg-white p-6"><h2 className="font-semibold text-[#102A43]">Your bookings</h2><p className="mt-2 text-sm text-slate-600">Requests submitted while signed in appear here. Guest requests can be tracked with the reference and phone used at booking.</p><a href="/booking" className="meraki-button mt-5">Request a service <ArrowRight size={16}/></a></section>:<>
   <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">Chapa sandbox checkout is available for bookings with an approved price and an unpaid balance.</p><button type="button" onClick={()=>void refreshAccount()} disabled={refreshing} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium disabled:opacity-60"><RefreshCw size={15} className={refreshing?'animate-spin':''}/>Refresh status</button></div>
   {paymentError&&<p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{paymentError}</p>}
   <section className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white px-5">{rows.length===0?<p className="py-8 text-sm text-slate-600">No account bookings yet. Guest requests are not automatically linked to an account.</p>:rows.map(b=>{
    const eligible=isChapaPaymentEligible(b),approved=b.agreedAmount!==null,paymentStatus=customerPaymentStatus(b),paid=Number(b.amountPaid)||0,balance=Number(b.remainingBalance)||0;
    return <article key={b.reference} className="flex flex-wrap items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="font-mono text-xs text-slate-500">{b.reference}</p><h2 className="mt-1 font-semibold">{b.service_name}</h2><p className="mt-1 text-sm text-slate-600">Preferred {new Date(b.requested_start).toLocaleString()}</p><dl className="mt-3 grid gap-x-6 gap-y-1 text-xs text-slate-600 sm:grid-cols-3"><div><dt className="inline">Approved amount: </dt><dd className="inline">{approved?`${Number(b.agreedAmount).toLocaleString()} ${b.currency}`:'Awaiting approved price'}</dd></div><div><dt className="inline">Paid: </dt><dd className="inline">{`${paid.toLocaleString()} ${b.currency}`}</dd></div><div><dt className="inline">Remaining: </dt><dd className="inline">{approved?`${balance.toLocaleString()} ${b.currency}`:'Not payable yet'}</dd></div></dl></div><div className="flex items-center gap-2"><p className="h-fit rounded-sm bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">Booking: {b.status}</p><p aria-label={`Payment: ${customerPaymentLabel(paymentStatus)}`} className={`h-fit rounded-sm px-2 py-1 text-xs font-semibold ${paymentStatus==='paid'?'bg-emerald-100 text-emerald-800':paymentStatus==='partial'?'bg-amber-100 text-amber-900':'bg-slate-100 text-slate-700'}`}>Payment: {customerPaymentLabel(paymentStatus)}</p>{eligible&&<button type="button" onClick={()=>void payNow(b.reference)} disabled={initializingReference!==null} className="min-h-11 rounded-md bg-[#102A43] px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{initializingReference===b.reference?'Starting checkout…':'Pay Now · Chapa Test Mode'}</button>}</div></article>;
   })}</section>
  </>}
 </main>;
};
