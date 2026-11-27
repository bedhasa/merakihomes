import validator from 'validator';
import { createHmac, timingSafeEqual } from 'node:crypto';

// Shared access to the Chapa secret; keep provider operations in this backend service.
export function getChapaSecretKey(){
  const secretKey=process.env.CHAPA_SECRET_KEY?.trim();
  if(!secretKey)throw new Error('CHAPA_SECRET_KEY is required to use Chapa services.');
  return secretKey;
}

const CHAPA_INITIALIZE_URL='https://api.chapa.co/v1/transaction/initialize';
const CHAPA_VERIFY_URL='https://api.chapa.co/v1/transaction/verify/';
const CHAPA_REQUEST_TIMEOUT_MS=15000;
function initializationError(message,cause,details){
  const error=new Error(message,cause?{cause}:undefined);
  error.code='CHAPA_INITIALIZATION_FAILED';
  if(details)error.details=details;
  return error;
}

function safeProviderDiagnostic(result,payload,secretKey){
  const emailErrorMessage=value=>{
    if(typeof value==='string')return value;
    if(Array.isArray(value)&&value.every(message=>typeof message==='string'))return value.join('; ');
    return undefined;
  };
  const providerEmailMessage=emailErrorMessage(result?.message?.email)
    ??emailErrorMessage(result?.errors?.email);
  const messageCandidates=[providerEmailMessage,result?.message,result?.error?.message,result?.error];
  let providerMessage=messageCandidates.find(value=>typeof value==='string');
  if(providerMessage){
    providerMessage=providerMessage.slice(0,500);
    const sensitiveValues=[secretKey];
    const collectSensitiveValues=value=>{
      if(typeof value==='string'||typeof value==='number')sensitiveValues.push(String(value));
      else if(value&&typeof value==='object')for(const nested of Object.values(value))collectSensitiveValues(nested);
    };
    collectSensitiveValues(payload);
    const uniqueSensitiveValues=[...new Set(sensitiveValues)]
      .filter(value=>value.length>1)
      .sort((a,b)=>b.length-a.length);
    for(const value of uniqueSensitiveValues){
      const escaped=value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      providerMessage=providerMessage.replace(new RegExp(escaped,'gi'),'[redacted]');
    }
    providerMessage=providerMessage
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[redacted email]')
      .replace(/\bBearer\s+\S+/gi,'Bearer [redacted]')
      .replace(/\bCHASECK-[A-Z0-9_-]+\b/gi,'[redacted API key]')
      .replace(/\b\+?\d[\d\s().-]{6,}\d\b/g,'[redacted phone]');
  }
  const knownFields=new Set(['amount','currency','email','first_name','last_name','phone_number','tx_ref','callback_url','return_url','customization','meta']);
  const errorFields=result?.errors&&typeof result.errors==='object'&&!Array.isArray(result.errors)?Object.keys(result.errors).filter(key=>knownFields.has(key)).slice(0,20):undefined;
  const messageFields=result?.message&&typeof result.message==='object'&&!Array.isArray(result.message)?Object.keys(result.message).filter(key=>knownFields.has(key)).slice(0,20):undefined;
  return {
    ...(typeof result?.status==='string'&&['success','failed','pending'].includes(result.status.toLowerCase())?{providerStatus:result.status.toLowerCase()}:{}),
    ...(providerMessage?{providerMessage}:{}),
    ...(errorFields?.length?{errorFields}:{}),
    ...(messageFields?.length?{messageFields}:{}),
  };
}

// Send a prepared initialization payload and return Chapa's parsed response.
export async function initializeChapaPayment(payload){
  if(!payload||typeof payload!=='object'||Array.isArray(payload))
    throw new Error('A prepared payment initialization payload is required.');
  const secretKey=getChapaSecretKey();
  let response;
  try{
    const outgoingEmail=payload.email;
    const emailIsString=typeof outgoingEmail==='string';
    const emailAtIndex=emailIsString?outgoingEmail.lastIndexOf('@'):-1;
    console.info('Chapa initialization email diagnostics:',{
      emailIsString,
      emailCharacterLength:emailIsString?Array.from(outgoingEmail).length:null,
      emailContainsAt:emailIsString&&outgoingEmail.includes('@'),
      emailDomainContainsDot:emailAtIndex>=0&&outgoingEmail.slice(emailAtIndex+1).includes('.'),
      emailContainsWhitespace:emailIsString&&/\s/u.test(outgoingEmail),
      emailContainsControl:emailIsString&&/\p{Cc}/u.test(outgoingEmail),
      emailContainsUnicodeFormat:emailIsString&&/\p{Cf}/u.test(outgoingEmail),
      emailIsEmpty:!emailIsString||outgoingEmail.length===0,
    });
    response=await fetch(CHAPA_INITIALIZE_URL,{
      method:'POST',
      headers:{Authorization:`Bearer ${secretKey}`,'Content-Type':'application/json'},
      body:JSON.stringify(payload),
      signal:AbortSignal.timeout(CHAPA_REQUEST_TIMEOUT_MS),
    });
  }catch(error){
    const timedOut=error?.name==='TimeoutError'||error?.cause?.name==='TimeoutError'||error?.cause?.code==='ETIMEDOUT';
    const networkErrorCode=typeof error?.cause?.code==='string'?error.cause.code:undefined;
    throw initializationError(
      timedOut?'Chapa did not respond before the payment initialization timed out.':'Unable to reach Chapa while initializing the payment.',
      error,
      {reason:timedOut?'timeout':'network_error',...(error?.name?{errorName:error.name}:{}),...(networkErrorCode?{networkErrorCode}:{})},
    );
  }

  let result;
  try{
    result=await response.json();
  }catch(error){
    throw initializationError(`Chapa returned an invalid JSON response (HTTP ${response.status}).`,error,{
      reason:'invalid_json_response',httpStatus:response.status,
      ...(typeof response.headers?.get==='function'&&response.headers.get('content-type')?{contentType:response.headers.get('content-type').slice(0,100)}:{}),
    });
  }
  if(!response.ok||result?.status!=='success'){
    throw initializationError(`Chapa payment initialization failed (HTTP ${response.status}).`,undefined,{
      reason:'provider_rejected_response',
      httpStatus:response.status,
      ...safeProviderDiagnostic(result,payload,secretKey),
    });
  }
  return result;
}

// Verify a transaction reference directly with Chapa before changing local payment state.
export async function verifyChapaPayment(transactionReference){
  if(typeof transactionReference!=='string'||!/^[-A-Za-z0-9_]{1,100}$/.test(transactionReference))
    throw new Error('A valid transaction reference is required for verification.');
  const secretKey=getChapaSecretKey();
  let response;
  try{
    response=await fetch(`${CHAPA_VERIFY_URL}${encodeURIComponent(transactionReference)}`,{
      method:'GET',
      headers:{Authorization:`Bearer ${secretKey}`},
      signal:AbortSignal.timeout(CHAPA_REQUEST_TIMEOUT_MS),
    });
  }catch(error){
    const timedOut=error?.name==='TimeoutError'||error?.cause?.name==='TimeoutError'||error?.cause?.code==='ETIMEDOUT';
    const networkErrorCode=typeof error?.cause?.code==='string'?error.cause.code:undefined;
    const failure=initializationError(
      timedOut?'Chapa did not respond before payment verification timed out.':'Unable to reach Chapa while verifying the payment.',
      error,
      {reason:timedOut?'timeout':'network_error',...(error?.name?{errorName:error.name}:{}),...(networkErrorCode?{networkErrorCode}:{})},
    );
    failure.code='CHAPA_VERIFICATION_FAILED';
    throw failure;
  }
  let result;
  try{result=await response.json();}
  catch(error){
    const failure=initializationError(`Chapa returned an invalid verification response (HTTP ${response.status}).`,error,{
      reason:'invalid_json_response',httpStatus:response.status,
      ...(typeof response.headers?.get==='function'&&response.headers.get('content-type')?{contentType:response.headers.get('content-type').slice(0,100)}:{}),
    });
    failure.code='CHAPA_VERIFICATION_FAILED';
    throw failure;
  }
  if(!response.ok||result?.status!=='success'){
    const providerMessage=typeof result?.message==='string'?result.message:'';
    // Chapa has returned both 400 and 404 for these documented verification outcomes.
    // Classify only their explicit messages so recovery never retires an ambiguous attempt.
    const isClientError=response.status>=400&&response.status<500;
    const reason=isClientError&&/invalid transaction|transaction not found/i.test(providerMessage)
      ?'transaction_not_found'
      :isClientError&&/payment not paid yet/i.test(providerMessage)
        ?'payment_not_complete'
        :'provider_rejected_response';
    const failure=initializationError(`Chapa transaction verification failed (HTTP ${response.status}).`,undefined,{
      httpStatus:response.status,reason,...safeProviderDiagnostic(result,{tx_ref:transactionReference},secretKey),
    });
    failure.code='CHAPA_VERIFICATION_FAILED';
    throw failure;
  }
  return result;
}

function matchesHexSignature(actual,expected){
  if(typeof actual!=='string'||! /^[a-f0-9]{64}$/i.test(actual))return false;
  const actualBytes=Buffer.from(actual,'hex'),expectedBytes=Buffer.from(expected,'hex');
  return actualBytes.length===expectedBytes.length&&timingSafeEqual(actualBytes,expectedBytes);
}

// Verify the documented Chapa webhook signatures; callbacks remain untrusted and use API verification.
export function verifyChapaWebhookSignature(payload,headers,webhookSecret){
  if(!webhookSecret||!payload||typeof payload!=='object'||Array.isArray(payload)||!headers||typeof headers!=='object')return false;
  let serializedPayload;
  try{serializedPayload=JSON.stringify(payload);}catch{return false;}
  if(typeof serializedPayload!=='string')return false;
  const expectedPayloadSignature=createHmac('sha256',webhookSecret).update(serializedPayload).digest('hex');
  const expectedSecretSignature=createHmac('sha256',webhookSecret).update(webhookSecret).digest('hex');
  return matchesHexSignature(headers['x-chapa-signature'],expectedPayloadSignature)
    ||matchesHexSignature(headers['chapa-signature'],expectedSecretSignature);
}

function requiredText(value,field){
  if(typeof value!=='string'||!value.trim())throw new Error(`${field} is required.`);
  return value.trim();
}

function validWebUrl(value,field){
  const text=requiredText(value,field);
  let url;
  try{url=new URL(text);}catch{throw new Error(`${field} must be a valid HTTP or HTTPS URL.`);}
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)
    throw new Error(`${field} must be a valid HTTP or HTTPS URL.`);
  return text;
}

function optionalObject(value,field){
  if(value===undefined)return undefined;
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(`${field} must be an object.`);
  return value;
}

// Validate optional Chapa presentation fields and keep only documented keys.
function prepareCustomization(value){
  const customization=optionalObject(value,'customization');
  if(!customization)return undefined;
  const result={};
  for(const key of ['title','description']){
    if(customization[key]!==undefined)result[key]=requiredText(customization[key],`customization.${key}`);
  }
  if(customization.logo!==undefined)result.logo=validWebUrl(customization.logo,'customization.logo');
  return Object.keys(result).length?result:undefined;
}

// Prepare and validate the JSON body for Chapa's transaction initialization endpoint.
export function preparePaymentInitializationPayload({
  amount,
  customerName,
  customerEmail,
  transactionReference,
  callbackUrl,
  returnUrl,
  currency='ETB',
  phoneNumber,
  customization,
  meta,
}={}){
  const numericAmount=Number(amount);
  if((typeof amount!=='number'&&typeof amount!=='string')||!String(amount).trim()||!Number.isFinite(numericAmount)||numericAmount<=0)
    throw new Error('amount must be a positive number.');
  const amountText=String(amount).trim();
  if(!/^\d+(?:\.\d+)?$/.test(amountText))throw new Error('amount must be a positive decimal number.');

  const nameParts=requiredText(customerName,'customerName').split(/\s+/);
  if(nameParts.length<2)throw new Error('customerName must include a first and last name.');
  const email=requiredText(customerEmail,'customerEmail');
  if(email.length>50||/[\p{Cf}\p{Cc}]/u.test(email)||!validator.isEmail(email))throw new Error('customerEmail must be a valid email address of 50 characters or fewer.');

  const txRef=requiredText(transactionReference,'transactionReference');
  const callback=validWebUrl(callbackUrl,'callbackUrl');
  const normalizedCurrency=requiredText(currency,'currency').toUpperCase();
  if(!['ETB','USD'].includes(normalizedCurrency))throw new Error('currency must be ETB or USD.');

  const payload={
    amount:amountText,
    currency:normalizedCurrency,
    email,
    first_name:nameParts[0],
    last_name:nameParts.slice(1).join(' '),
    tx_ref:txRef,
    callback_url:callback,
  };
  if(returnUrl!==undefined)payload.return_url=validWebUrl(returnUrl,'returnUrl');
  if(phoneNumber!==undefined){
    const phone=requiredText(phoneNumber,'phoneNumber');
    if(!/^(09|07)\d{8}$/.test(phone))throw new Error('phoneNumber must be a 10-digit Ethiopian mobile number beginning with 09 or 07.');
    payload.phone_number=phone;
  }
  const custom=prepareCustomization(customization);
  if(custom)payload.customization=custom;
  const paymentMeta=optionalObject(meta,'meta');
  if(paymentMeta)payload.meta=paymentMeta;
  return payload;
}
