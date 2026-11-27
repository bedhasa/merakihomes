import { reconcileChapaPayment, type ChapaReconciliationResult, type CustomerBooking, type CustomerPaymentStatus } from '@shared/api';

export function isChapaPaymentEligible(booking:Pick<CustomerBooking,'agreedAmount'|'remainingBalance'|'status'>):boolean{
  const approvedAmount=booking.agreedAmount===null?0:Number(booking.agreedAmount);
  const remainingBalance=Number(booking.remainingBalance);
  return Number.isFinite(approvedAmount)&&approvedAmount>0&&Number.isFinite(remainingBalance)&&remainingBalance>0&&!['cancelled','rejected'].includes(booking.status.toLowerCase());
}

export function getChapaCallbackUrl(origin:string):string{
  const configured=process.env.NEXT_PUBLIC_CHAPA_CALLBACK_URL?.trim();
  const callbackUrl=new URL(configured||'/api/payments/chapa/callback',origin);
  if(!['http:','https:'].includes(callbackUrl.protocol)||callbackUrl.username||callbackUrl.password)throw new Error('The Chapa callback URL must be a valid HTTP or HTTPS URL.');
  return callbackUrl.href;
}

export function getChapaReturnUrl(origin:string):string{
  return new URL('/payment/return',origin).href;
}

export function readChapaTransactionReference(search:string):string|null{
  const query=new URLSearchParams(search.startsWith('?')?search.slice(1):search);
  const value=query.get('trx_ref')||query.get('tx_ref')||query.get('transactionReference');
  return value?.trim()||null;
}

const mobileTransactionReferencePattern=/^[A-Za-z0-9_-]{1,100}$/;

export function buildMobileChapaDeepLink(transactionReference:string):string{
  if(!mobileTransactionReferencePattern.test(transactionReference))throw new Error('The Chapa transaction reference is invalid.');
  return `merakihomes://payment/return?tx_ref=${encodeURIComponent(transactionReference)}`;
}

export type MobileChapaBridgeResult=
  | {kind:'missing-reference'}
  | {kind:'invalid-reference'}
  | {kind:'ready';transactionReference:string;deepLink:string};

export function getMobileChapaBridge(search:string):MobileChapaBridgeResult|null{
  const query=new URLSearchParams(search.startsWith('?')?search.slice(1):search);
  if(query.get('platform')!=='mobile')return null;
  const transactionReference=query.get('tx_ref')??query.get('trx_ref')??query.get('transactionReference');
  if(transactionReference===null||transactionReference==='')return{kind:'missing-reference'};
  if(!mobileTransactionReferencePattern.test(transactionReference))return{kind:'invalid-reference'};
  return{kind:'ready',transactionReference,deepLink:buildMobileChapaDeepLink(transactionReference)};
}

export async function reconcileChapaReturn(search:string):Promise<{transactionReference:string;reconciliation:ChapaReconciliationResult}|null>{
  const transactionReference=readChapaTransactionReference(search);
  if(!transactionReference)return null;
  const reconciliation=await reconcileChapaPayment(transactionReference);
  return{transactionReference,reconciliation};
}

export function validatedChapaCheckoutUrl(value:string):string{
  const url=new URL(value);
  if(url.protocol!=='https:'||url.hostname!=='checkout.chapa.co'||url.username||url.password)throw new Error('Chapa returned an invalid checkout URL.');
  return url.href;
}

export function redirectToChapaCheckout(checkoutUrl:string):void{
  window.location.assign(validatedChapaCheckoutUrl(checkoutUrl));
}

export function paymentResultState(status:string):'verified'|'failed'|'pending'{
  if(status==='verified')return'verified';
  if(status==='failed')return'failed';
  return'pending';
}

export function customerPaymentLabel(status:CustomerPaymentStatus):string{
  if(status==='paid')return'Paid';
  if(status==='partial')return'Partially paid';
  return'Unpaid';
}

export function customerPaymentStatus(booking:Pick<CustomerBooking,'agreedAmount'|'startingEstimate'|'amountPaid'>):CustomerPaymentStatus{
  const approvedAmount=Number(booking.agreedAmount??booking.startingEstimate??0);
  const verifiedPaid=Number(booking.amountPaid);
  if(Number.isFinite(approvedAmount)&&approvedAmount>0&&Number.isFinite(verifiedPaid)&&verifiedPaid>=approvedAmount)return'paid';
  if(Number.isFinite(verifiedPaid)&&verifiedPaid>0)return'partial';
  return'unpaid';
}
