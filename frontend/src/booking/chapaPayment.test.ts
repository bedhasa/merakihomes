import test from 'node:test';
import assert from 'node:assert/strict';
import { getCustomerBookings, initializeChapaPayment } from '@shared/api';
import { buildMobileChapaDeepLink, customerPaymentLabel, customerPaymentStatus, getChapaCallbackUrl, getChapaReturnUrl, getMobileChapaBridge, isChapaPaymentEligible, paymentResultState, readChapaTransactionReference, reconcileChapaReturn, redirectToChapaCheckout, validatedChapaCheckoutUrl } from './chapaPayment';

const eligibleBooking={agreedAmount:'1250.00',remainingBalance:'1250.00',status:'pending_confirmation'};

test('only approved bookings with a positive balance are eligible for Chapa checkout',()=>{
  assert.equal(isChapaPaymentEligible(eligibleBooking),true);
  assert.equal(isChapaPaymentEligible({...eligibleBooking,agreedAmount:null}),false);
  assert.equal(isChapaPaymentEligible({...eligibleBooking,remainingBalance:'0'}),false);
  assert.equal(isChapaPaymentEligible({...eligibleBooking,status:'cancelled'}),false);
});

test('return handling reads transaction references and ignores browser success claims',()=>{
  assert.equal(readChapaTransactionReference('?status=success&trx_ref=server-ref-123'),'server-ref-123');
  assert.equal(readChapaTransactionReference('?status=success'),null);
  assert.equal(getMobileChapaBridge('?tx_ref=server-ref-123'),null);
  assert.equal(paymentResultState('verified'),'verified');
  assert.equal(paymentResultState('failed'),'failed');
  assert.equal(paymentResultState('pending_verification'),'pending');
});

test('customer bookings show payment status separately from booking status',()=>{
  assert.equal(customerPaymentLabel('paid'),'Paid');
  assert.equal(customerPaymentLabel('partial'),'Partially paid');
  assert.equal(customerPaymentLabel('unpaid'),'Unpaid');
});

test('customer payment status is derived from approved total and verified paid amount',()=>{
  assert.equal(customerPaymentStatus({agreedAmount:'10000.00',startingEstimate:null,amountPaid:'10000.00'}),'paid');
  assert.equal(customerPaymentStatus({agreedAmount:'10000.00',startingEstimate:null,amountPaid:'3000.00'}),'partial');
  assert.equal(customerPaymentStatus({agreedAmount:'10000.00',startingEstimate:null,amountPaid:'0.00'}),'unpaid');
  assert.equal(customerPaymentStatus({agreedAmount:null,startingEstimate:null,amountPaid:'0.00'}),'unpaid');
});

test('customer booking refresh bypasses caches and returns the current paid status',async()=>{
  const originalFetch=globalThis.fetch;
  let requestInit:RequestInit|undefined;
  globalThis.fetch=async(_input,init)=>{
    requestInit=init;
    return new Response(JSON.stringify({bookings:[{reference:'MRK-AB12CD34EF56',status:'pending',agreedAmount:'1250.00',amountPaid:'1250.00',remainingBalance:'0.00'}]}),{status:200,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store'}});
  };
  try{
    const [booking]=await getCustomerBookings();
    assert.equal(requestInit?.cache,'no-store');
    assert.equal(booking.status,'pending');
    assert.equal(booking.paymentStatus,undefined);
    assert.equal(customerPaymentLabel(customerPaymentStatus(booking)),'Paid');
    assert.equal(Number(booking.remainingBalance),0);
  }finally{globalThis.fetch=originalFetch;}
});

test('mobile return bridge validates tx_ref and supported Chapa aliases',()=>{
  assert.deepEqual(getMobileChapaBridge('?platform=mobile&tx_ref=meraki-test_008'),{
    kind:'ready',transactionReference:'meraki-test_008',deepLink:'merakihomes://payment/return?tx_ref=meraki-test_008',
  });
  assert.deepEqual(getMobileChapaBridge('?platform=mobile&trx_ref=provider-ref-1'),{
    kind:'ready',transactionReference:'provider-ref-1',deepLink:'merakihomes://payment/return?tx_ref=provider-ref-1',
  });
  assert.deepEqual(getMobileChapaBridge('?platform=mobile&transactionReference=provider_ref_2'),{
    kind:'ready',transactionReference:'provider_ref_2',deepLink:'merakihomes://payment/return?tx_ref=provider_ref_2',
  });
  assert.deepEqual(getMobileChapaBridge('?platform=mobile'),{kind:'missing-reference'});
  assert.deepEqual(getMobileChapaBridge('?platform=mobile&tx_ref=bad%20ref'),{kind:'invalid-reference'});
  assert.deepEqual(getMobileChapaBridge(`?platform=mobile&tx_ref=${'a'.repeat(101)}`),{kind:'invalid-reference'});
});

test('mobile deep link uses a fixed destination and safely encodes its validated reference',()=>{
  assert.equal(buildMobileChapaDeepLink('ref-123_test'),'merakihomes://payment/return?tx_ref=ref-123_test');
  assert.throws(()=>buildMobileChapaDeepLink('ref-123&status=success'),/invalid/i);
  assert.equal(getMobileChapaBridge('?platform=website&status=success&tx_ref=server-ref-123'),null);
});

test('return-page reconciliation sends only tx_ref to the backend and uses its verified status',async()=>{
  const originalFetch=globalThis.fetch;
  const calls:Array<{url:string;init?:RequestInit}>=[];
  globalThis.fetch=async(input,init)=>{
    calls.push({url:String(input),init});
    return new Response(JSON.stringify({transactionReference:'server-ref-123',bookingReference:'MRK-AB12CD34EF56',paymentStatus:'verified',duplicate:false}),{status:200,headers:{'Content-Type':'application/json'}});
  };
  try{
    const result=await reconcileChapaReturn('?status=failed&tx_ref=server-ref-123');
    assert.equal(calls.length,1);
    assert.equal(calls[0].url,'/api/payments/chapa/callback?tx_ref=server-ref-123');
    assert.equal(calls[0].init?.credentials,'include');
    assert.equal(result?.transactionReference,'server-ref-123');
    assert.equal(result?.reconciliation.paymentStatus,'verified');
    assert.equal(await reconcileChapaReturn('?status=success'),null);
    assert.equal(calls.length,1);
  }finally{globalThis.fetch=originalFetch;}
});

test('callback and return URLs use the public site origin unless a callback override is configured',()=>{
  const prior=process.env.NEXT_PUBLIC_CHAPA_CALLBACK_URL;
  delete process.env.NEXT_PUBLIC_CHAPA_CALLBACK_URL;
  assert.equal(getChapaCallbackUrl('https://meraki.example'),'https://meraki.example/api/payments/chapa/callback');
  assert.equal(getChapaReturnUrl('https://meraki.example'),'https://meraki.example/payment/return');
  process.env.NEXT_PUBLIC_CHAPA_CALLBACK_URL='https://public-api.example/api/payments/chapa/callback';
  assert.equal(getChapaCallbackUrl('http://localhost:3000'),'https://public-api.example/api/payments/chapa/callback');
  if(prior===undefined)delete process.env.NEXT_PUBLIC_CHAPA_CALLBACK_URL;else process.env.NEXT_PUBLIC_CHAPA_CALLBACK_URL=prior;
});

test('checkout redirect accepts only the Chapa hosted checkout origin',()=>{
  const originalWindow=(globalThis as typeof globalThis&{window?:unknown}).window;
  let assigned='';
  Object.defineProperty(globalThis,'window',{configurable:true,value:{location:{assign:(url:string)=>{assigned=url;}}}});
  try{
    redirectToChapaCheckout('https://checkout.chapa.co/checkout/payment/synthetic-test');
    assert.equal(assigned,'https://checkout.chapa.co/checkout/payment/synthetic-test');
    assert.throws(()=>validatedChapaCheckoutUrl('https://attacker.example/fake-checkout'),/invalid checkout URL/i);
    assert.throws(()=>redirectToChapaCheckout('javascript:alert(1)'));
  }finally{
    if(originalWindow===undefined)delete (globalThis as typeof globalThis&{window?:unknown}).window;
    else Object.defineProperty(globalThis,'window',{configurable:true,value:originalWindow});
  }
});

test('initialization sends the authenticated minimal payload through the same-origin API proxy',async()=>{
  const originalFetch=globalThis.fetch;
  const input={bookingReference:'MRK-AB12CD34EF56',customerName:'Synthetic Customer',customerEmail:'customer@example.test',callbackUrl:'https://meraki.example/api/payments/chapa/callback',returnUrl:'https://meraki.example/payment/return'};
  let captured:{url:string;init?:RequestInit}|undefined;
  globalThis.fetch=async(inputUrl,init)=>{
    captured={url:String(inputUrl),init};
    return new Response(JSON.stringify({checkoutUrl:'https://checkout.chapa.co/checkout/payment/synthetic',transactionReference:'server-generated-ref',message:'Hosted Link',status:'success',data:{checkout_url:'https://checkout.chapa.co/checkout/payment/synthetic'}}),{status:200,headers:{'Content-Type':'application/json'}});
  };
  try{
    const result=await initializeChapaPayment(input);
    assert.equal(captured?.url,'/api/payments/chapa/initialize');
    assert.equal(captured?.init?.method,'POST');
    assert.equal(captured?.init?.credentials,'include');
    assert.deepEqual(JSON.parse(String(captured?.init?.body)),input);
    assert.equal('amount' in JSON.parse(String(captured?.init?.body)),false);
    assert.equal('currency' in JSON.parse(String(captured?.init?.body)),false);
    assert.equal('transactionReference' in JSON.parse(String(captured?.init?.body)),false);
    assert.equal(result.checkoutUrl,'https://checkout.chapa.co/checkout/payment/synthetic');
  }finally{globalThis.fetch=originalFetch;}
});
