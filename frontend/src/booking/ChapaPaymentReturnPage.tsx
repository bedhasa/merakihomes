import React,{useCallback,useEffect,useRef,useState} from 'react';
import { ArrowLeft, CheckCircle2, CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react';
import { ApiError, CustomerBooking, getCustomerBookings } from '@shared/api';
import { getMobileChapaBridge, paymentResultState, reconcileChapaReturn, type MobileChapaBridgeResult } from './chapaPayment';

type ReturnState='loading'|'verified'|'failed'|'pending'|'error'|'missing-reference'|'booking-not-in-account';

export const ChapaPaymentReturnPage:React.FC=()=>{
  const [transactionReference,setTransactionReference]=useState('');
  const [state,setState]=useState<ReturnState>('loading');
  const [booking,setBooking]=useState<CustomerBooking|null>(null);
  const [errorMessage,setErrorMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [mobileBridge,setMobileBridge]=useState<MobileChapaBridgeResult|null>(null);
  const autoOpenedDeepLink=useRef('');

  const refresh=useCallback(async(search:string)=>{
    setBusy(true);
    setErrorMessage('');
    setState('loading');
    try{
      // The callback endpoint verifies with Chapa; browser query status is never trusted.
      const result=await reconcileChapaReturn(search);
      if(!result){setTransactionReference('');setBooking(null);setState('missing-reference');return;}
      setTransactionReference(result.transactionReference);
      const reconciliation=result.reconciliation;
      const accountBookings=await getCustomerBookings();
      const ownedBooking=accountBookings.find(item=>item.reference===reconciliation.bookingReference);
      if(!ownedBooking){setBooking(null);setState('booking-not-in-account');return;}
      setBooking(ownedBooking);
      setState(paymentResultState(reconciliation.paymentStatus));
    }catch(error){
      setState('error');
      setErrorMessage(error instanceof ApiError?error.message:'We could not confirm the payment status. Please try again.');
    }finally{setBusy(false);}
  },[]);

  useEffect(()=>{
    const search=window.location.search;
    const bridge=getMobileChapaBridge(search);
    if(bridge){setMobileBridge(bridge);return;}
    void refresh(search);
  },[refresh]);

  useEffect(()=>{
    if(mobileBridge?.kind!=='ready'||autoOpenedDeepLink.current===mobileBridge.deepLink)return;
    const isMobile=/android|iphone|ipad|ipod/i.test(window.navigator.userAgent)||
      (window.navigator.platform==='MacIntel'&&window.navigator.maxTouchPoints>1);
    if(!isMobile)return;
    autoOpenedDeepLink.current=mobileBridge.deepLink;
    // Some mobile browsers block automatic custom-scheme navigation; the visible link below remains available.
    window.location.assign(mobileBridge.deepLink);
  },[mobileBridge]);

  const retry=()=>{if(transactionReference)void refresh(`?tx_ref=${encodeURIComponent(transactionReference)}`);};
  const statusText=state==='verified'?'Payment verified':state==='failed'?'Payment was not completed':state==='pending'?'Payment is still processing':state==='booking-not-in-account'?'Sign in to the account that owns this booking':state==='missing-reference'?'No transaction reference was returned':state==='error'?'Payment status could not be confirmed':'Checking your payment with Chapa…';
  const isVerified=state==='verified';
  const isFailed=state==='failed';
  const showRetry=Boolean(transactionReference)&&['pending','error'].includes(state);

  if(mobileBridge){
    const bridgeMessage=mobileBridge.kind==='missing-reference'
      ?'The return link did not include a transaction reference. Open Meraki Homes and check your booking there.'
      :mobileBridge.kind==='invalid-reference'
        ?'The transaction reference is invalid, so Meraki Homes was not opened. Return to your booking and check its payment status.'
        :'Continue in the Meraki Homes app to check this payment with our backend. This page does not confirm payment.';
    return <section className="mx-auto max-w-2xl px-5 py-14"><article className="rounded-lg border border-slate-200 bg-white p-7 text-center sm:p-10"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#D4A853]/20 text-[#102A43]"><ArrowLeft size={25}/></div><p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-[#8C6A2F]">Meraki Homes</p><h1 className="mt-2 text-2xl font-semibold text-[#102A43]">Return to the mobile app</h1><p role="status" className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">{bridgeMessage}</p>{mobileBridge.kind==='ready'&&<a href={mobileBridge.deepLink} aria-label="Open Meraki Homes mobile app" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-[#102A43] px-5 text-sm font-semibold text-white">Open Meraki Homes</a>}<div className="mt-7"><a href="/" className="text-sm font-semibold text-[#102A43] underline">Continue to Meraki Homes website</a></div></article></section>;
  }

  return <section className="mx-auto max-w-2xl px-5 py-14"><article className="rounded-lg border border-slate-200 bg-white p-7 text-center sm:p-10"><div className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${isVerified?'bg-emerald-100 text-emerald-700':isFailed?'bg-red-100 text-red-700':'bg-[#D4A853]/20 text-[#102A43]'}`}>{busy?<LoaderCircle size={25} className="animate-spin"/>:isVerified?<CheckCircle2 size={26}/>:<CircleAlert size={25}/>}</div><p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-[#8C6A2F]">Chapa Test Mode</p><h1 className="mt-2 text-2xl font-semibold text-[#102A43]">{statusText}</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">{isVerified?'Meraki Homes verified this transaction with Chapa. The account totals below come from the authenticated bookings API.':isFailed?'Chapa verification reports that this payment failed. Your booking remains unpaid for this transaction.':state==='pending'?'The backend has not verified a successful payment yet. You can safely ask it to check again.':state==='booking-not-in-account'?'The payment response could not be matched to a booking in this signed-in account. Sign in to the correct customer account to see its status.':state==='missing-reference'?'The return URL did not contain a transaction reference, so no payment status can be confirmed.':state==='error'?errorMessage:'Checking the transaction with the backend. A browser redirect alone does not confirm payment.'}</p>{booking&&<dl className="mx-auto mt-6 max-w-md divide-y divide-slate-100 border-y border-slate-100 text-left"><div className="grid grid-cols-[150px_1fr] gap-3 py-3 text-sm"><dt className="text-slate-500">Booking</dt><dd className="font-mono text-[#102A43]">{booking.reference}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3 py-3 text-sm"><dt className="text-slate-500">Approved amount</dt><dd className="text-[#102A43]">{booking.agreedAmount===null?'Awaiting approval':`${Number(booking.agreedAmount).toLocaleString()} ${booking.currency}`}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3 py-3 text-sm"><dt className="text-slate-500">Paid</dt><dd className="text-[#102A43]">{Number(booking.amountPaid).toLocaleString()} {booking.currency}</dd></div><div className="grid grid-cols-[150px_1fr] gap-3 py-3 text-sm"><dt className="text-slate-500">Remaining</dt><dd className="text-[#102A43]">{Number(booking.remainingBalance).toLocaleString()} {booking.currency}</dd></div></dl>}{showRetry&&<button type="button" disabled={busy} onClick={retry} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-[#102A43] disabled:opacity-60"><RefreshCw size={15} className={busy?'animate-spin':''}/>Check payment again</button>}{state==='error'&&errorMessage&&<p role="alert" className="mt-4 text-xs text-slate-500">If you are signed out, sign in to the customer account that owns this booking and refresh its status.</p>}<div className="mt-7 flex flex-wrap justify-center gap-3"><a href="/my-account/bookings" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#102A43] px-4 text-sm font-semibold text-white"><ArrowLeft size={15}/>My bookings</a><a href="/login" className="inline-flex min-h-11 items-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-[#102A43]">Sign in</a></div></article></section>;
};
