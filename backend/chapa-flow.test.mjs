import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { createHmac, randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createApp, migrate } from './index.mjs';

const syntheticSecret='CHASECK_TEST_ONLY_SYNTHETIC';
const webhookSecret='synthetic-webhook-secret-only';
const goodCheckout='https://checkout.chapa.co/checkout/payment/synthetic';
const payloadFor=(bookingReference,transactionReference='client-reference')=>({
  amount:'1250.00',customerName:'Synthetic Customer',customerEmail:'synthetic@example.test',
  transactionReference,callbackUrl:'https://example.test/chapa/callback',
  returnUrl:'https://example.test/payment/complete',currency:'ETB',bookingReference,
});

async function fixture(t){
  const originalFetch=globalThis.fetch,originalSecret=process.env.CHAPA_SECRET_KEY,
    originalWebhookSecret=process.env.CHAPA_WEBHOOK_SECRET,originalInfo=console.info,
    originalError=console.error;
  const db=new PGlite();
  const pool={query:(...args)=>db.query(...args),connect:async()=>({query:(...args)=>db.query(...args),release(){}})};
  process.env.CHAPA_SECRET_KEY=syntheticSecret;
  process.env.CHAPA_WEBHOOK_SECRET=webhookSecret;
  process.env.SESSION_SECRET='test-session-secret-for-chapa-flow-suite-32-bytes-minimum';
  const server=createServer(createApp({pool}));
  try{
    await migrate(pool,{skipBtreeGist:true});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  }catch(error){await db.close();throw error;}
  const base=`http://127.0.0.1:${server.address().port}`;
  const providerCalls=[],safeLogs=[];
  console.info=(...args)=>safeLogs.push(args);
  console.error=(...args)=>safeLogs.push(args);
  globalThis.fetch=async(input,options)=>{
    const url=String(input);
    if(!url.startsWith('https://api.chapa.co/'))return originalFetch(input,options);
    providerCalls.push({url,options});
    const body=JSON.parse(options.body||'{}');
    if(options.method==='POST'&&fixture.initFetchError)throw fixture.initFetchError;
    const ref=options.method==='GET'?decodeURIComponent(url.split('/').at(-1)):body.tx_ref;
    const result=options.method==='POST'
      ?(fixture.initResult??{status:'success',message:'Hosted Link',data:{checkout_url:goodCheckout,reference:`provider-${ref}`}})
      :fixture.verifications.get(ref)??{status:'success',data:{tx_ref:ref,status:'success',amount:'1250.00',currency:'ETB',reference:`provider-${ref}`}};
    const status=options.method==='POST'?(fixture.initHttpStatus??200):(fixture.verifyHttpStatus??200);
    return{ok:status>=200&&status<300,status,headers:new Headers({'content-type':fixture.initInvalidJson?'text/html':'application/json'}),json:async()=>{if(options.method==='POST'&&fixture.initInvalidJson)throw new SyntaxError('synthetic invalid JSON');return result;}};
  };
  fixture.initResult=null;fixture.initHttpStatus=200;fixture.verifyHttpStatus=200;fixture.initFetchError=null;fixture.initInvalidJson=false;fixture.verifications=new Map();
  t.after(async()=>{
    globalThis.fetch=originalFetch;console.info=originalInfo;console.error=originalError;
    if(originalSecret===undefined)delete process.env.CHAPA_SECRET_KEY;else process.env.CHAPA_SECRET_KEY=originalSecret;
    if(originalWebhookSecret===undefined)delete process.env.CHAPA_WEBHOOK_SECRET;else process.env.CHAPA_WEBHOOK_SECRET=originalWebhookSecret;
    server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve));await db.close();
  });
  return{base,db,providerCalls,safeLogs};
}

const post=(base,path,body,headers={})=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});

async function registerCustomer(base){
  const suffix=randomBytes(6).toString('hex');
  const response=await post(base,'/api/mobile/auth/register',{
    name:'Synthetic Customer',email:`synthetic-${suffix}@example.test`,phone:'+251 911 222 333',password:'SyntheticPassword123!',
  });
  assert.equal(response.status,201);
  return(await response.json()).accessToken;
}

async function makeApprovedBooking(base,db,token){
  const response=await post(base,'/api/bookings',{
    serviceId:'premium_home_cleaning',name:'Synthetic Customer',phone:'+251 911 222 333',
    neighborhood:'Bole',address:'Synthetic test address',
    requestedStart:new Date(Date.now()+86400000).toISOString(),details:'Offline payment test',
  },{Authorization:`Bearer ${token}`});
  assert.equal(response.status,201);
  const {booking}=await response.json();
  await db.query('UPDATE bookings SET agreed_amount=1250,currency=\'ETB\' WHERE id=$1',[booking.id]);
  await db.query('UPDATE booking_items SET approved_amount=1250 WHERE booking_id=$1',[booking.id]);
  return booking;
}

async function initialize(base,booking,token,clientReference='client-reference',overrides={}){
  return post(base,'/api/payments/chapa/initialize',{
    ...payloadFor(booking.reference,clientReference),...overrides,
  },token?{Authorization:`Bearer ${token}`}:{ });
}

async function storedPaymentForBooking(db,bookingId){
  return(await db.query('SELECT id,transaction_reference,status,amount::numeric,currency FROM payments WHERE booking_id=$1',[bookingId])).rows[0];
}

test('Chapa initialization requires an authenticated owner and a booking reference',async t=>{
  const{base,db,providerCalls}=await fixture(t);
  const owner=await registerCustomer(base),otherCustomer=await registerCustomer(base);
  const booking=await makeApprovedBooking(base,db,owner);

  const noReferencePayload=payloadFor(booking.reference);
  delete noReferencePayload.bookingReference;
  const missingReference=await post(base,'/api/payments/chapa/initialize',noReferencePayload,{Authorization:`Bearer ${owner}`});
  assert.equal(missingReference.status,400);

  const unauthenticated=await initialize(base,booking,null);
  assert.equal(unauthenticated.status,401);

  const notOwner=await initialize(base,booking,otherCustomer);
  assert.equal(notOwner.status,404);

  const invalidInitialization=await initialize(base,booking,owner,'invalid-input',{callbackUrl:'javascript:alert(1)'});
  assert.equal(invalidInitialization.status,400);
  assert.match((await invalidInitialization.json()).error.message,/callbackUrl must be a valid HTTP or HTTPS URL/i);
  assert.equal(providerCalls.length,0);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM payments')).rows[0].n,0);
});

test('authorized initialization derives amount and currency from the booking and validates checkout URLs',async t=>{
  const{base,db,providerCalls,safeLogs}=await fixture(t);
  const customer=await registerCustomer(base);
  const booking=await makeApprovedBooking(base,db,customer);
  const ok=await initialize(base,booking,customer,'client-supplied-reference',{amount:'1.00',currency:'USD',customerName:'Spoofed Browser Name',customerEmail:'spoof@example.test',returnUrl:'https://example.test/payment/complete?tx_ref=client-supplied-reference&source=account'});
  const okBody=await ok.json();
  assert.equal(ok.status,200);
  assert.equal(okBody.checkoutUrl,goodCheckout);
  assert.equal(okBody.data.checkout_url,goodCheckout);
  assert.match(okBody.transactionReference,/^meraki-[0-9a-f-]{36}$/i);
  assert.notEqual(okBody.transactionReference,'client-supplied-reference');
  assert.deepEqual((()=>{const p=JSON.parse(providerCalls[0].options.body);return{amount:p.amount,currency:p.currency,tx_ref:p.tx_ref};})(),{
    amount:'1250.00',currency:'ETB',tx_ref:okBody.transactionReference,
  });
  const sentPayload=JSON.parse(providerCalls[0].options.body);
  assert.equal(sentPayload.first_name,'Synthetic');assert.equal(sentPayload.last_name,'Customer');
  assert.match(sentPayload.email,/^synthetic-[a-f0-9]+@example\.test$/);
  assert.notEqual(sentPayload.email,'synthetic@example.test');
  const returnUrl=new URL(sentPayload.return_url);
  assert.equal(returnUrl.origin,'https://example.test');
  assert.equal(returnUrl.pathname,'/payment/complete');
  assert.equal(returnUrl.searchParams.get('source'),'account');
  assert.equal(returnUrl.searchParams.get('tx_ref'),okBody.transactionReference);
  assert.notEqual(returnUrl.searchParams.get('tx_ref'),'client-supplied-reference');
  const stored=await storedPaymentForBooking(db,booking.id);
  assert.equal(stored.transaction_reference,okBody.transactionReference);
  assert.equal(stored.status,'initiated');
  assert.equal(stored.amount,'1250.00');
  assert.equal(stored.currency,'ETB');
  assert.equal((await db.query('SELECT a.checkout_url FROM payment_attempts a WHERE a.payment_id=$1',[stored.id])).rows[0].checkout_url,goodCheckout);
  assert.equal(providerCalls[0].url,'https://api.chapa.co/v1/transaction/initialize');
  assert.equal(providerCalls[0].options.method,'POST');
  assert.match(providerCalls[0].options.headers.Authorization,/^Bearer /);

  const secondBooking=await makeApprovedBooking(base,db,customer);
  fixture.initResult={status:'success',data:{checkout_url:'https://attacker.example/'} };
  const invalidCheckout=await initialize(base,secondBooking,customer);
  assert.equal(invalidCheckout.status,502);
  assert.equal((await storedPaymentForBooking(db,secondBooking.id)).status,'pending_verification');

  fixture.initResult={status:'success',data:{}};
  const thirdBooking=await makeApprovedBooking(base,db,customer);
  const missingCheckout=await initialize(base,thirdBooking,customer);
  assert.equal(missingCheckout.status,502);
  assert.equal((await storedPaymentForBooking(db,thirdBooking.id)).status,'pending_verification');

  fixture.initResult={status:'failed',message:'synthetic provider rejection'};fixture.initHttpStatus=400;
  const fourthBooking=await makeApprovedBooking(base,db,customer);
  const failed=await initialize(base,fourthBooking,customer);
  assert.equal(failed.status,502);
  assert.equal((await storedPaymentForBooking(db,fourthBooking.id)).status,'failed');
  assert.equal(safeLogs.some(args=>JSON.stringify(args).includes('synthetic@example.test')),false);
  assert.equal(safeLogs.some(args=>JSON.stringify(args).includes(syntheticSecret)),false);
});

test('initialization reports sanitized network and malformed-response failures to the customer',async t=>{
  const{base,db,safeLogs}=await fixture(t);
  const customer=await registerCustomer(base);
  for(const [mode,reason] of [['network','network_error'],['invalid-json','invalid_json_response']]){
    const booking=await makeApprovedBooking(base,db,customer);
    if(mode==='network')fixture.initFetchError=Object.assign(new TypeError('fetch failed'),{cause:Object.assign(new Error('blocked'),{code:'ECONNRESET'})});
    else fixture.initInvalidJson=true;
    const response=await initialize(base,booking,customer);
    const body=await response.json();
    assert.equal(response.status,502);
    assert.equal(body.error.code,'CHAPA_INITIALIZATION_FAILED');
    assert.match(body.error.message,/could not confirm whether Chapa started checkout/i);
    assert.equal((await storedPaymentForBooking(db,booking.id)).status,'pending_verification');
    assert.ok(safeLogs.some(args=>args[0]==='Chapa payment initialization rejected:'&&args[1]?.reason===reason));
    fixture.initFetchError=null;fixture.initInvalidJson=false;
  }
  assert.equal(JSON.stringify(safeLogs).includes(syntheticSecret),false);
});

test('a saved pending checkout is resumed without initializing another Chapa payment',async t=>{
  const{base,db,providerCalls}=await fixture(t);
  const customer=await registerCustomer(base),booking=await makeApprovedBooking(base,db,customer);
  const first=await initialize(base,booking,customer);
  const firstBody=await first.json();
  assert.equal(first.status,200);
  const resumed=await initialize(base,booking,customer,'resume-reference');
  const resumedBody=await resumed.json();
  assert.equal(resumed.status,200);
  assert.equal(resumedBody.checkoutUrl,firstBody.checkoutUrl);
  assert.equal(resumedBody.transactionReference,firstBody.transactionReference);
  assert.equal(providerCalls.filter(call=>call.options.method==='POST').length,1);
});

test('a pending initialization is retried only after Chapa confirms the transaction was not found',async t=>{
  const{base,db,providerCalls}=await fixture(t);
  const customer=await registerCustomer(base),booking=await makeApprovedBooking(base,db,customer);
  fixture.initFetchError=Object.assign(new TypeError('fetch failed'),{cause:Object.assign(new Error('network reset'),{code:'ECONNRESET'})});
  const first=await initialize(base,booking,customer);
  assert.equal(first.status,502);
  const oldReference=JSON.parse(providerCalls.find(call=>call.options.method==='POST').options.body).tx_ref;
  const oldPayment=(await db.query('SELECT id FROM payments WHERE transaction_reference=$1',[oldReference])).rows[0];
  fixture.initFetchError=null;
  // Chapa's test endpoint can report this definitive outcome as HTTP 400 as well as 404.
  fixture.verifyHttpStatus=400;
  fixture.verifications.set(oldReference,{status:'failed',message:'Invalid transaction or Transaction not found',data:null});

  const retried=await initialize(base,booking,customer,'retry-after-confirmed-not-found');
  const retriedBody=await retried.json();
  assert.equal(retried.status,200);
  assert.notEqual(retriedBody.transactionReference,oldReference);
  assert.equal((await db.query('SELECT status FROM payments WHERE id=$1',[oldPayment.id])).rows[0].status,'failed');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM payments WHERE booking_id=$1 AND status IN (\'initiated\',\'pending_verification\')',[booking.id])).rows[0].n,1);
  assert.equal(providerCalls.filter(call=>call.options.method==='POST').length,2);
  assert.equal(providerCalls.filter(call=>call.options.method==='GET').length,1);
});

test('an unverified existing Chapa attempt stays pending and is not duplicated',async t=>{
  const{base,db,providerCalls}=await fixture(t);
  const customer=await registerCustomer(base),booking=await makeApprovedBooking(base,db,customer);
  fixture.initFetchError=Object.assign(new TypeError('fetch failed'),{cause:Object.assign(new Error('network reset'),{code:'ECONNRESET'})});
  const first=await initialize(base,booking,customer);
  assert.equal(first.status,502);
  const oldReference=JSON.parse(providerCalls.find(call=>call.options.method==='POST').options.body).tx_ref;
  fixture.initFetchError=null;
  fixture.verifications.set(oldReference,{status:'success',data:{tx_ref:oldReference,status:'pending',amount:'1250.00',currency:'ETB'}});

  const retry=await initialize(base,booking,customer,'retry-while-provider-pending');
  const body=await retry.json();
  assert.equal(retry.status,409);
  assert.match(body.error.message,/checkout is still pending/i);
  assert.equal((await db.query('SELECT status FROM payments WHERE transaction_reference=$1',[oldReference])).rows[0].status,'pending_verification');
  assert.equal(providerCalls.filter(call=>call.options.method==='POST').length,1);
  assert.equal(providerCalls.filter(call=>call.options.method==='GET').length,1);
});

test('an HTTP 400 payment-not-complete verification stays pending without noisy recovery errors',async t=>{
  const{base,db,providerCalls,safeLogs}=await fixture(t);
  const customer=await registerCustomer(base),booking=await makeApprovedBooking(base,db,customer);
  fixture.initFetchError=Object.assign(new TypeError('fetch failed'),{cause:Object.assign(new Error('network reset'),{code:'ECONNRESET'})});
  const first=await initialize(base,booking,customer);
  assert.equal(first.status,502);
  const oldReference=JSON.parse(providerCalls.find(call=>call.options.method==='POST').options.body).tx_ref;
  fixture.initFetchError=null;
  fixture.verifyHttpStatus=400;
  fixture.verifications.set(oldReference,{status:'failed',message:'Payment not paid yet',data:null});

  const retry=await initialize(base,booking,customer,'retry-while-provider-not-paid');
  const body=await retry.json();
  assert.equal(retry.status,409);
  assert.match(body.error.message,/checkout is still pending/i);
  assert.equal((await db.query('SELECT status FROM payments WHERE transaction_reference=$1',[oldReference])).rows[0].status,'pending_verification');
  assert.equal(providerCalls.filter(call=>call.options.method==='POST').length,1);
  assert.equal(providerCalls.filter(call=>call.options.method==='GET').length,1);
  assert.equal(safeLogs.some(args=>args[0]==='Chapa pending payment recovery failed:'),false);
});

test('Chapa initialization requires both saved customer name parts before creating a payment attempt',async t=>{
  const{base,db,providerCalls}=await fixture(t);
  const customer=await registerCustomer(base),booking=await makeApprovedBooking(base,db,customer);
  await db.query("UPDATE customers SET full_name='Single' WHERE id=(SELECT customer_id FROM customer_auth WHERE email LIKE 'synthetic-%@example.test' ORDER BY created_at DESC LIMIT 1)");
  const response=await initialize(base,booking,customer);
  assert.equal(response.status,409);
  assert.equal((await response.json()).error.message,'Add both your first and last name in your profile before starting checkout.');
  assert.equal(providerCalls.length,0);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM payments')).rows[0].n,0);
});

test('client-supplied duplicate references cannot collide; the database still enforces reference uniqueness',async t=>{
  const{base,db}=await fixture(t);
  const customer=await registerCustomer(base);
  const firstBooking=await makeApprovedBooking(base,db,customer);
  const secondBooking=await makeApprovedBooking(base,db,customer);
  const first=await initialize(base,firstBooking,customer,'reused-client-reference');
  const second=await initialize(base,secondBooking,customer,'reused-client-reference');
  const firstRef=(await first.json()).transactionReference,secondRef=(await second.json()).transactionReference;
  assert.equal(first.status,200);assert.equal(second.status,200);
  assert.notEqual(firstRef,secondRef);
  await assert.rejects(db.query(`INSERT INTO payments(booking_id,amount,currency,payment_stage,status,provider,idempotency_key,is_simulated,transaction_reference)
    VALUES($1,10,'ETB','partial','initiated','chapa','synthetic-duplicate-index-check',FALSE,$2)`,[secondBooking.id,firstRef]),error=>error.code==='23505');
});

test('concurrent initialization of one booking creates one provider payment and shares its checkout',async t=>{
  const{base,db,providerCalls}=await fixture(t);
  const customer=await registerCustomer(base);
  const booking=await makeApprovedBooking(base,db,customer);
  const outcomes=await Promise.all([
    initialize(base,booking,customer,'same-client-reference'),
    initialize(base,booking,customer,'same-client-reference'),
  ]);
  assert.deepEqual(outcomes.map(response=>response.status).sort(),[200,200]);
  const bodies=await Promise.all(outcomes.map(response=>response.json()));
  assert.equal(bodies[0].transactionReference,bodies[1].transactionReference);
  assert.equal(bodies[0].checkoutUrl,bodies[1].checkoutUrl);
  assert.equal(providerCalls.filter(call=>call.options.method==='POST').length,1);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM payments WHERE booking_id=$1',[booking.id])).rows[0].n,1);
});

test('an existing pending Chapa payment prevents another initialization even when the approved balance increases',async t=>{
  const{base,db,providerCalls}=await fixture(t);
  const customer=await registerCustomer(base),booking=await makeApprovedBooking(base,db,customer);
  const first=await initialize(base,booking,customer);
  assert.equal(first.status,200);
  await db.query('UPDATE bookings SET agreed_amount=2000 WHERE id=$1',[booking.id]);
  const duplicate=await initialize(base,booking,customer,'another-client-reference');
  const body=await duplicate.json();
  assert.equal(duplicate.status,409);
  assert.match(body.error.message,/approved amount changed while a Chapa payment was pending/i);
  assert.equal(providerCalls.filter(call=>call.options.method==='POST').length,1);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM payments WHERE booking_id=$1',[booking.id])).rows[0].n,1);
});

test('callbacks and authenticated webhooks verify server-side and reconcile orders idempotently',async t=>{
  const{base,db,providerCalls}=await fixture(t);
  const customer=await registerCustomer(base);
  const booking=await makeApprovedBooking(base,db,customer);
  const initialized=await initialize(base,booking,customer);
  const initializedBody=await initialized.json(),transactionReference=initializedBody.transactionReference;
  assert.equal(initialized.status,200);
  const before=(await db.query('SELECT status,agreed_amount,reference FROM bookings WHERE id=$1',[booking.id])).rows[0];
  const apiBookings=()=>fetch(`${base}/api/customers/me/bookings`,{headers:{Authorization:`Bearer ${customer}`}});
  const unpaidResponse=await apiBookings();
  const unpaidBooking=(await unpaidResponse.json()).bookings.find(row=>row.reference===booking.reference);
  assert.equal(unpaidBooking.status,'pending');
  assert.equal(unpaidBooking.paymentStatus,'unpaid');
  assert.equal(Number(unpaidBooking.amountPaid),0);

  const badSignature=await post(base,'/api/payments/chapa/webhook',{tx_ref:transactionReference,status:'success'});
  assert.equal(badSignature.status,401);
  assert.equal((await db.query('SELECT status FROM payments WHERE transaction_reference=$1',[transactionReference])).rows[0].status,'initiated');
  const invalidPayload=await post(base,'/api/payments/chapa/webhook',[]);
  assert.equal(invalidPayload.status,400);
  const noReference=await fetch(base+'/api/payments/chapa/callback');
  assert.equal(noReference.status,400);
  const unknown=await fetch(base+'/api/payments/chapa/callback?trx_ref=synthetic-unknown');
  assert.equal(unknown.status,404);
  assert.equal(providerCalls.filter(call=>call.options.method==='GET').length,0);

  const callback=await fetch(`${base}/api/payments/chapa/callback?trx_ref=${encodeURIComponent(transactionReference)}`);
  const callbackBody=await callback.json();
  assert.equal(callback.status,200);
  assert.equal(callbackBody.paymentStatus,'verified');
  assert.equal(callbackBody.bookingReference,before.reference);
  assert.equal(callbackBody.duplicate,false);
  const verificationRequest=providerCalls.find(call=>call.options.method==='GET');
  assert.equal(verificationRequest.url,`https://api.chapa.co/v1/transaction/verify/${transactionReference}`);
  assert.match(verificationRequest.options.headers.Authorization,/^Bearer /);
  const duplicate=await post(base,'/api/payments/chapa/webhook',{tx_ref:transactionReference,status:'success'});
  assert.equal(duplicate.status,401);
  const webhookPayload={tx_ref:transactionReference,status:'success'};
  const signature=createHmac('sha256',webhookSecret).update(JSON.stringify(webhookPayload)).digest('hex');
  const signedWebhook=await post(base,'/api/payments/chapa/webhook',webhookPayload,{'x-chapa-signature':signature});
  assert.equal(signedWebhook.status,200);
  assert.equal((await signedWebhook.json()).duplicate,true);
  const secretSignature=createHmac('sha256',webhookSecret).update(webhookSecret).digest('hex');
  const alternateSignedWebhook=await post(base,'/api/payments/chapa/webhook',webhookPayload,{'chapa-signature':secretSignature});
  assert.equal(alternateSignedWebhook.status,200);
  assert.equal((await alternateSignedWebhook.json()).duplicate,true);
  assert.equal(providerCalls.filter(call=>call.options.method==='GET').length,3);
  const paidPayment=(await db.query('SELECT status,amount,currency,is_simulated,total_paid_after::text,remaining_balance::text,verified_at FROM payments WHERE transaction_reference=$1',[transactionReference])).rows[0];
  assert.deepEqual({status:paidPayment.status,amount:paidPayment.amount,currency:paidPayment.currency,is_simulated:paidPayment.is_simulated,total_paid_after:paidPayment.total_paid_after,remaining_balance:paidPayment.remaining_balance},{
    status:'verified',amount:'1250.00',currency:'ETB',is_simulated:false,total_paid_after:'1250.00',remaining_balance:'0.00',
  });
  assert.ok(paidPayment.verified_at);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM payment_transactions WHERE provider_event_id=$1',[`chapa:${transactionReference}:success`])).rows[0].n,1);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM payment_allocations WHERE payment_id=(SELECT id FROM payments WHERE transaction_reference=$1)',[transactionReference])).rows[0].n,1);
  for(let refresh=0;refresh<2;refresh++){
    const response=await apiBookings();
    assert.match(response.headers.get('cache-control')||'',/private, no-store/i);
    const displayedBooking=(await response.json()).bookings.find(row=>row.reference===booking.reference);
    assert.equal(displayedBooking.status,'pending');
    assert.equal(displayedBooking.paymentStatus,'paid');
    assert.equal(Number(displayedBooking.amountPaid),1250);
    assert.equal(Number(displayedBooking.remainingBalance),0);
  }
  const after=(await db.query('SELECT status,agreed_amount,reference FROM bookings WHERE id=$1',[booking.id])).rows[0];
  assert.deepEqual(after,before);
  await db.query('UPDATE bookings SET agreed_amount=2500 WHERE id=$1',[booking.id]);
  const partialResponse=await apiBookings();
  const partialBooking=(await partialResponse.json()).bookings.find(row=>row.reference===booking.reference);
  assert.equal(partialBooking.paymentStatus,'partial');
  assert.equal(Number(partialBooking.amountPaid),1250);
  assert.equal(Number(partialBooking.remainingBalance),1250);
});

test('verified amount, currency, reference, failed and pending states never produce false paid status',async t=>{
  const{base,db}=await fixture(t);
  const customer=await registerCustomer(base);
  const scenarios=['pending','failed','amount-mismatch','currency-mismatch','ref-mismatch'];
  const references=[];
  for(const scenario of scenarios){
    const booking=await makeApprovedBooking(base,db,customer);
    const initialized=await initialize(base,booking,customer,`client-${scenario}`);
    assert.equal(initialized.status,200);
    references.push((await initialized.json()).transactionReference);
  }
  const[ pendingRef,failedRef,amountRef,currencyRef,mismatchRef ]=references;
  const response=ref=>fetch(`${base}/api/payments/chapa/callback?trx_ref=${encodeURIComponent(ref)}`);

  fixture.verifications.set(pendingRef,{status:'success',data:{tx_ref:pendingRef,status:'pending',amount:'1250.00',currency:'ETB'}});
  assert.equal((await response(pendingRef)).status,200);
  assert.equal((await db.query('SELECT status FROM payments WHERE transaction_reference=$1',[pendingRef])).rows[0].status,'pending_verification');
  fixture.verifications.set(failedRef,{status:'success',data:{tx_ref:failedRef,status:'failed',amount:'1250.00',currency:'ETB'}});
  assert.equal((await response(failedRef)).status,200);
  assert.equal((await db.query('SELECT status FROM payments WHERE transaction_reference=$1',[failedRef])).rows[0].status,'failed');
  fixture.verifications.set(amountRef,{status:'success',data:{tx_ref:amountRef,status:'success',amount:'1250.01',currency:'ETB'}});
  assert.equal((await response(amountRef)).status,409);
  fixture.verifications.set(currencyRef,{status:'success',data:{tx_ref:currencyRef,status:'success',amount:'1250.00',currency:'USD'}});
  assert.equal((await response(currencyRef)).status,409);
  fixture.verifications.set(mismatchRef,{status:'success',data:{tx_ref:'some-other-ref',status:'success',amount:'1250.00',currency:'ETB'}});
  assert.equal((await response(mismatchRef)).status,409);
  for(const ref of references.slice(1))assert.notEqual((await db.query('SELECT status FROM payments WHERE transaction_reference=$1',[ref])).rows[0].status,'verified');
});

test('an incomplete Chapa verification stays unverified and can later confirm success',async t=>{
  const{base,db}=await fixture(t);
  const customer=await registerCustomer(base);
  const booking=await makeApprovedBooking(base,db,customer);
  const initialized=await initialize(base,booking,customer);
  const transactionReference=(await initialized.json()).transactionReference;
  fixture.verifyHttpStatus=404;
  fixture.verifications.set(transactionReference,{status:null,message:'Payment not paid yet',data:null});

  const incomplete=await fetch(`${base}/api/payments/chapa/callback?trx_ref=${encodeURIComponent(transactionReference)}`);
  assert.equal(incomplete.status,502);
  assert.equal((await db.query('SELECT status,verified_at FROM payments WHERE transaction_reference=$1',[transactionReference])).rows[0].status,'initiated');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM payment_transactions')).rows[0].n,0);

  fixture.verifyHttpStatus=200;
  fixture.verifications.set(transactionReference,{status:'success',data:{tx_ref:transactionReference,status:'success',amount:'1250.00',currency:'ETB',reference:'provider-success-after-incomplete'}});
  const completed=await fetch(`${base}/api/payments/chapa/callback?trx_ref=${encodeURIComponent(transactionReference)}`);
  assert.equal(completed.status,200);
  assert.equal((await completed.json()).paymentStatus,'verified');
});

test('a failed Chapa attempt can become verified after a successful provider retry',async t=>{
  const{base,db}=await fixture(t);
  const customer=await registerCustomer(base);
  const booking=await makeApprovedBooking(base,db,customer);
  const initialized=await initialize(base,booking,customer);
  const transactionReference=(await initialized.json()).transactionReference;
  const response=()=>fetch(`${base}/api/payments/chapa/callback?trx_ref=${encodeURIComponent(transactionReference)}`);

  fixture.verifications.set(transactionReference,{status:'success',data:{tx_ref:transactionReference,status:'failed',amount:'1250.00',currency:'ETB',reference:'provider-first-failed'}});
  assert.equal((await response()).status,200);
  assert.equal((await db.query('SELECT status FROM payments WHERE transaction_reference=$1',[transactionReference])).rows[0].status,'failed');

  fixture.verifications.set(transactionReference,{status:'success',data:{tx_ref:transactionReference,status:'success',amount:'1250.00',currency:'ETB',reference:'provider-retry-success'}});
  const retried=await response();
  assert.equal(retried.status,200);
  assert.equal((await retried.json()).paymentStatus,'verified');
  assert.equal((await db.query('SELECT status FROM payments WHERE transaction_reference=$1',[transactionReference])).rows[0].status,'verified');
});

test('a Chapa verification HTTP failure leaves the local payment unverified',async t=>{
  const{base,db,providerCalls}=await fixture(t);
  const customer=await registerCustomer(base);
  const booking=await makeApprovedBooking(base,db,customer);
  const initialized=await initialize(base,booking,customer);
  const transactionReference=(await initialized.json()).transactionReference;
  assert.equal(initialized.status,200);
  fixture.verifyHttpStatus=400;
  const response=await fetch(`${base}/api/payments/chapa/callback?trx_ref=${encodeURIComponent(transactionReference)}`);
  assert.equal(response.status,502);
  assert.equal((await db.query('SELECT status,verified_at FROM payments WHERE transaction_reference=$1',[transactionReference])).rows[0].status,'initiated');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM payment_transactions')).rows[0].n,0);
  const verification=providerCalls.find(call=>call.options.method==='GET');
  assert.equal(verification.url,`https://api.chapa.co/v1/transaction/verify/${transactionReference}`);
});
