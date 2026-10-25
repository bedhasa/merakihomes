import 'dotenv/config';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import { createPool } from './index.mjs';

const pool=createPool();
const staffId=randomUUID();
const suffix=randomUUID().replaceAll('-','').slice(0,12);
const password=randomBytes(24).toString('hex');
const salt=randomBytes(16);
const passwordHash=`scrypt$${salt.toString('hex')}$${scryptSync(password,salt,64).toString('hex')}`;
const email=`live-smoke-${suffix}@example.test`;
let api;
let createdBookingId;
let createdBookingReference;
let simulatedTransactionReference;

async function freePort(){
  const server=createServer();
  await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
  const {port}=server.address();
  await new Promise(resolve=>server.close(resolve));
  return port;
}
async function startApi(port){
  const child=spawn(process.execPath,['backend/index.mjs'],{cwd:process.cwd(),env:{...process.env,API_PORT:String(port)},stdio:['ignore','ignore','inherit']});
  const base=`http://127.0.0.1:${port}`;
  for(let i=0;i<100;i++){
    if(child.exitCode!==null)throw new Error(`API exited during startup (${child.exitCode}).`);
    try{const response=await fetch(`${base}/api/health`);if(response.ok)return{child,base};}catch{}
    await new Promise(resolve=>setTimeout(resolve,150));
  }
  child.kill();throw new Error('API did not become healthy within 15 seconds.');
}
async function stopApi(child){
  if(!child||child.exitCode!==null)return;
  const closed=new Promise(resolve=>child.once('exit',resolve));
  child.kill('SIGTERM');
  await Promise.race([closed,new Promise(resolve=>setTimeout(resolve,5000))]);
  if(child.exitCode===null&&child.signalCode===null)throw new Error('API process did not stop.');
}
async function managementCookie(base){
  const response=await fetch(`${base}/api/management/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  if(!response.ok)throw new Error(`Staff login failed with HTTP ${response.status}.`);
  const cookie=response.headers.get('set-cookie')?.split(';',1)[0];
  if(!cookie)throw new Error('Staff login did not set a session cookie.');
  return cookie;
}
async function managementHasBooking(base,cookie){
  const response=await fetch(`${base}/api/management/bookings`,{headers:{Cookie:cookie}});
  if(!response.ok)throw new Error(`Management booking read failed with HTTP ${response.status}.`);
  const {bookings}=await response.json();
  return bookings.some(booking=>booking.id===createdBookingId&&booking.reference===createdBookingReference&&booking.status==='pending');
}
async function managementHasPayment(base,cookie){
  const response=await fetch(`${base}/api/management/payments`,{headers:{Cookie:cookie}});
  if(!response.ok)throw new Error(`Management payment read failed with HTTP ${response.status}.`);
  const {payments}=await response.json();
  return payments.some(payment=>payment.bookingReference===createdBookingReference&&payment.simulated===true&&payment.status==='verified');
}

try {
  await pool.query('INSERT INTO staff_users(id,full_name,email,password_hash,role_id) VALUES($1,$2,$3,$4,$5)',[staffId,'Temporary live smoke check',email,passwordHash,'operations']);
  const port=await freePort();
  const started=await startApi(port);api=started.child;
  const base=started.base;
  const services=await fetch(`${base}/api/services`).then(r=>r.json());
  const service=services.services[0];
  if(!service)throw new Error('Service catalogue is empty.');
  const serviceDetails=await fetch(`${base}/api/services/${encodeURIComponent(service.id)}`).then(r=>r.json());
  const demoPackage=serviceDetails.packages?.[0];
  if(!demoPackage)throw new Error(`No published package is available for ${service.id}.`);
  const requestedStart=new Date(Date.now()+86_400_000).toISOString();
  const created=await fetch(`${base}/api/bookings`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':`smoke-${suffix}`},body:JSON.stringify({serviceId:service.id,packageId:demoPackage.id,expectedPackagePrice:demoPackage.basePrice,expectedPackageCurrency:demoPackage.currency,expectedPackageDuration:demoPackage.durationMinutes,name:'Live Smoke Guest',phone:'+251911222333',neighborhood:'Bole',address:'Smoke test address near Bole',requestedStart,details:'Temporary PostgreSQL API smoke test.'})});
  const createdData=await created.json();
  if(created.status!==201||createdData.booking?.status!=='pending')throw new Error(`Guest booking request failed with HTTP ${created.status}: ${createdData?.error?.message||JSON.stringify(createdData)}`);
  const booking=createdData.booking;
  createdBookingId=booking.id;
  createdBookingReference=booking.reference;
  const stored=(await pool.query('SELECT id,reference,status FROM bookings WHERE id=$1',[createdBookingId])).rows[0];
  if(!stored||stored.reference!==booking.reference||stored.status!=='pending')throw new Error('Guest booking was not persisted to PostgreSQL.');
  const simulated=await fetch(`${base}/api/bookings/${encodeURIComponent(booking.reference)}/demo-payment`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':`smoke-payment-${suffix}`},body:JSON.stringify({phone:'+251911222333',provider:'telebirr',amount:demoPackage.basePrice,outcome:'success',paymentType:'full'})});
  const simulatedData=await simulated.json();
  if(simulated.status!==201||simulatedData.receipt?.simulated!==true||simulatedData.receipt?.remainingBalance!==0)throw new Error(`Full demo payment failed with HTTP ${simulated.status}: ${simulatedData?.error?.message||JSON.stringify(simulatedData)}`);
  simulatedTransactionReference=simulatedData.receipt.transactionReference;
  const receipt=await fetch(`${base}/api/payments/receipt-lookup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference:booking.reference,phone:'+251911222333'})});
  const receiptData=await receipt.json();
  if(!receipt.ok||receiptData.receipt?.transactionReference!==simulatedTransactionReference)throw new Error('Demo receipt lookup did not retrieve its simulated record.');
  const cookie=await managementCookie(base);
  if(!await managementHasBooking(base,cookie))throw new Error('Management API did not return the guest booking.');
  if(!await managementHasPayment(base,cookie))throw new Error('Management API did not return the demo payment record.');
  await stopApi(api);api=null;
  const restarted=await startApi(port);api=restarted.child;
  const afterRestart=(await pool.query('SELECT reference,status FROM bookings WHERE id=$1',[createdBookingId])).rows[0];
  if(!afterRestart||afterRestart.reference!==createdBookingReference||afterRestart.status!=='pending')throw new Error('Booking did not persist across API restart.');
  if(!await managementHasBooking(restarted.base,cookie))throw new Error('Management API could not retrieve the booking after API restart.');
  if(!await managementHasPayment(restarted.base,cookie))throw new Error('Management API could not retrieve the simulated payment after API restart.');
  console.log(JSON.stringify({database:'live PostgreSQL',apiPort:port,serviceId:service.id,guestRequestStatus:booking.status,bookingPersisted:true,persistedAcrossApiRestart:true,managementRetrievedBeforeRestart:true,managementRetrievedAfterRestart:true,simulatedFullPayment:true,receiptRetrieved:true,simulatedPaymentVisibleToManagement:true},null,2));
} catch(error) {
  console.error(`Live PostgreSQL smoke check failed: ${error.message}`);
  process.exitCode=1;
} finally {
  try{await stopApi(api);}catch(error){console.error(error.message);process.exitCode=1;}
  try{
    await pool.query('BEGIN');
    if(createdBookingId){
      await pool.query('DELETE FROM payments WHERE booking_id=$1',[createdBookingId]);
      await pool.query("DELETE FROM audit_logs WHERE entity_type='booking' AND entity_id=$1",[createdBookingId]);
      await pool.query('DELETE FROM booking_status_history WHERE booking_id=$1',[createdBookingId]);
      await pool.query('DELETE FROM bookings WHERE id=$1',[createdBookingId]);
    }
    await pool.query('DELETE FROM staff_users WHERE id=$1',[staffId]);
    await pool.query('COMMIT');
  }catch(error){await pool.query('ROLLBACK').catch(()=>{});console.error(`Smoke-test cleanup failed: ${error.message}`);process.exitCode=1;}
  await pool.end();
}
