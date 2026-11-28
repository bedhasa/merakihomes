import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeChapaPayment, preparePaymentInitializationPayload, verifyChapaPayment } from './chapa.mjs';

test('sends the validated email unchanged and logs only safe metadata', async()=>{
  const originalFetch=globalThis.fetch;
  const originalConsoleInfo=console.info;
  const originalSecret=process.env.CHAPA_SECRET_KEY;
  const syntheticSecret='CHASECK_TEST_SYNTHETIC_ONLY';
  const logs=[];
  let serializedBody;
  process.env.CHAPA_SECRET_KEY=syntheticSecret;
  console.info=(...args)=>logs.push(args);
  globalThis.fetch=async(url,options)=>{
    assert.equal(url,'https://api.chapa.co/v1/transaction/initialize');
    serializedBody=options.body;
    return {
      ok:true,
      status:200,
      json:async()=>({status:'success',message:'Hosted Link',data:{checkout_url:'https://checkout.example.test/synthetic'}}),
    };
  };

  try{
    const validatedPayload=preparePaymentInitializationPayload({
      amount:'10',
      customerName:'Synthetic Customer',
      customerEmail:'  synthetic.person@example.test  ',
      transactionReference:'synthetic-reference',
      callbackUrl:'https://example.test/callback',
    });
    const validatedEmail=validatedPayload.email;
    await initializeChapaPayment(validatedPayload);

    const sentPayload=JSON.parse(serializedBody);
    assert.equal(sentPayload.email,validatedEmail);
    assert.deepEqual(sentPayload,validatedPayload);
    assert.equal(logs.length,1);
    assert.equal(logs[0][0],'Chapa initialization email diagnostics:');
    assert.deepEqual(logs[0][1],{
      emailIsString:true,
      emailCharacterLength:validatedEmail.length,
      emailContainsAt:true,
      emailDomainContainsDot:true,
      emailContainsWhitespace:false,
      emailContainsControl:false,
      emailContainsUnicodeFormat:false,
      emailIsEmpty:false,
    });
    assert.equal(JSON.stringify(logs).includes(validatedEmail),false);
    assert.equal(JSON.stringify(logs).includes(syntheticSecret),false);
  }finally{
    globalThis.fetch=originalFetch;
    console.info=originalConsoleInfo;
    if(originalSecret===undefined)delete process.env.CHAPA_SECRET_KEY;
    else process.env.CHAPA_SECRET_KEY=originalSecret;
  }
});

test('classifies Chapa network, timeout, HTTP, and invalid JSON failures without logging sensitive data',async()=>{
  const originalFetch=globalThis.fetch,originalInfo=console.info,originalSecret=process.env.CHAPA_SECRET_KEY;
  const secret='CHASECK_TEST_SYNTHETIC_FAILURE_CASES',logs=[];
  process.env.CHAPA_SECRET_KEY=secret;console.info=(...args)=>logs.push(args);
  const payload={amount:'100.00',currency:'ETB',email:'customer@example.test',first_name:'Synthetic',last_name:'Customer',tx_ref:'synthetic-reference',callback_url:'https://example.test/callback'};
  const failure=async(fetchImpl,expectedReason)=>{
    globalThis.fetch=fetchImpl;
    await assert.rejects(initializeChapaPayment(payload),error=>{
      assert.equal(error.code,'CHAPA_INITIALIZATION_FAILED');
      assert.equal(error.details.reason,expectedReason);
      return true;
    });
  };
  try{
    await failure(async()=>{const cause=Object.assign(new Error('socket error'),{code:'ECONNRESET'});throw new TypeError('fetch failed',{cause});},'network_error');
    await failure(async()=>{throw new DOMException('timed out','TimeoutError');},'timeout');
    await failure(async()=>({ok:false,status:400,json:async()=>({status:'failed',message:'invalid synthetic request'})}),'provider_rejected_response');
    await failure(async()=>({ok:true,status:200,headers:new Headers({'content-type':'text/html'}),json:async()=>{throw new SyntaxError('Unexpected token');}}),'invalid_json_response');
    assert.equal(JSON.stringify(logs).includes(secret),false);
    assert.equal(JSON.stringify(logs).includes(payload.email),false);
  }finally{
    globalThis.fetch=originalFetch;console.info=originalInfo;
    if(originalSecret===undefined)delete process.env.CHAPA_SECRET_KEY;else process.env.CHAPA_SECRET_KEY=originalSecret;
  }
});

test('classifies Chapa verification recovery outcomes from provider messages across HTTP 400 and 404',async()=>{
  const originalFetch=globalThis.fetch,originalSecret=process.env.CHAPA_SECRET_KEY;
  const secret='CHASECK_TEST_SYNTHETIC_VERIFICATION';
  process.env.CHAPA_SECRET_KEY=secret;
  const reference='meraki-synthetic-verification-reference';
  const failure=async(status,message,expectedReason)=>{
    globalThis.fetch=async(url,options)=>{
      assert.equal(url,`https://api.chapa.co/v1/transaction/verify/${reference}`);
      assert.equal(options.method,'GET');
      assert.match(options.headers.Authorization,/^Bearer /);
      assert.ok(options.signal);
      return{ok:false,status,headers:new Headers({'content-type':'application/json'}),json:async()=>({status:'failed',message})};
    };
    await assert.rejects(verifyChapaPayment(reference),error=>{
      assert.equal(error.code,'CHAPA_VERIFICATION_FAILED');
      assert.equal(error.details.httpStatus,status);
      assert.equal(error.details.reason,expectedReason);
      assert.equal(JSON.stringify(error.details).includes(reference),false);
      assert.equal(JSON.stringify(error.details).includes(secret),false);
      return true;
    });
  };
  try{
    await failure(400,'Invalid transaction or Transaction not found','transaction_not_found');
    await failure(404,'Invalid transaction or Transaction not found','transaction_not_found');
    await failure(400,'Payment not paid yet','payment_not_complete');
    await failure(404,'Payment not paid yet','payment_not_complete');
    await failure(500,'Transaction not found due to temporary provider error','provider_rejected_response');
    await failure(400,'Invalid API Key or User doesn’t exist','provider_rejected_response');
  }finally{
    globalThis.fetch=originalFetch;
    if(originalSecret===undefined)delete process.env.CHAPA_SECRET_KEY;else process.env.CHAPA_SECRET_KEY=originalSecret;
  }
});

test('classifies verification network, timeout, and malformed JSON failures safely',async()=>{
  const originalFetch=globalThis.fetch,originalSecret=process.env.CHAPA_SECRET_KEY;
  process.env.CHAPA_SECRET_KEY='CHASECK_TEST_SYNTHETIC_VERIFICATION_FAILURES';
  const failure=async(fetchImpl,expectedReason)=>{
    globalThis.fetch=fetchImpl;
    await assert.rejects(verifyChapaPayment('synthetic-reference'),error=>{
      assert.equal(error.code,'CHAPA_VERIFICATION_FAILED');
      assert.equal(error.details.reason,expectedReason);
      return true;
    });
  };
  try{
    await failure(async()=>{const cause=Object.assign(new Error('socket error'),{code:'ECONNRESET'});throw new TypeError('fetch failed',{cause});},'network_error');
    await failure(async()=>{throw new DOMException('timed out','TimeoutError');},'timeout');
    await failure(async()=>({ok:false,status:400,headers:new Headers({'content-type':'text/html'}),json:async()=>{throw new SyntaxError('Unexpected token');}}),'invalid_json_response');
  }finally{
    globalThis.fetch=originalFetch;
    if(originalSecret===undefined)delete process.env.CHAPA_SECRET_KEY;else process.env.CHAPA_SECRET_KEY=originalSecret;
  }
});
