import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes,scryptSync } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createApp,migrate } from './index.mjs';

async function fixture(t){
  process.env.SESSION_SECRET='test-session-secret-for-pglite-api-suite-32-bytes-minimum';
  const db=new PGlite();
  const pool={query:(...args)=>db.query(...args),connect:async()=>({query:(...args)=>db.query(...args),release(){}})};
  await migrate(pool);
  const salt=randomBytes(16),password='StaffPassword123!';
  const hash=`scrypt$${salt.toString('hex')}$${scryptSync(password,salt,64).toString('hex')}`;
  await db.query('INSERT INTO staff_users(full_name,email,password_hash,role_id) VALUES($1,$2,$3,$4)',['Demo Admin','admin@example.test',hash,'admin']);
  const server=createServer(createApp({pool}));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  t.after(async()=>{server.close();await db.close();});
  return{base,db,password};
}
const post=(base,path,body,headers={})=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});

test('migrations seed catalogue and guest requests persist as pending without agreement or account link',async t=>{
  const{base,db}=await fixture(t);const services=await fetch(base+'/api/services').then(r=>r.json());assert.deepEqual(services.services.map(s=>s.name),['Minor Home Repairs','Gardening & Outdoor','Office & Commercial Cleaning','Elder Companion Care','Childcare & Babysitting','Personal Cooking','Laundry & Ironing','Premium Home Cleaning']);assert.ok(services.services.every(s=>s.image.startsWith('https://images.unsplash.com/')));
  const retired=await db.query("SELECT is_active FROM services WHERE id='home_cleaning'");if(retired.rowCount)assert.equal(retired.rows[0].is_active,false);
  const payload={serviceId:'premium_home_cleaning',name:'Guest Customer',phone:'+251 911 222 333',neighborhood:'Bole Atlas',address:'Bole near the main road',requestedStart:new Date(Date.now()+86400000).toISOString(),details:'Two rooms'};
  const response=await post(base,'/api/bookings',payload,{'Idempotency-Key':'test-request-1'}),data=await response.json();assert.equal(response.status,201);assert.equal(data.booking.status,'pending');assert.match(data.booking.reference,/^MRK-[A-F0-9]{12}$/);
  const stored=(await db.query('SELECT status,customer_id,agreed_amount,starting_estimate FROM bookings WHERE id=$1',[data.booking.id])).rows[0];assert.equal(stored.status,'pending');assert.equal(stored.customer_id,null);assert.equal(stored.agreed_amount,null);assert.equal(stored.starting_estimate,null);
  const lookup=await post(base,'/api/bookings/lookup',{reference:data.booking.reference,phone:payload.phone}).then(r=>r.json());assert.equal(lookup.booking.status,'pending');
  assert.equal((await post(base,'/api/bookings/lookup',{reference:data.booking.reference,phone:'+251 911 000 111'})).status,404);
});

test('public service details list only real packages and booking stores server package price and name',async t=>{
  const{base,db}=await fixture(t);
  const detail=await fetch(base+'/api/services/premium_home_cleaning').then(r=>r.json());assert.equal(detail.service.id,'premium_home_cleaning');assert.deepEqual(detail.packages,[]);
  const login=await post(base,'/api/management/auth/login',{email:'admin@example.test',password:'StaffPassword123!'});const cookie=login.headers.get('set-cookie').split(';')[0];
  const createPackage=await fetch(base+'/api/management/services/gardening_outdoor/packages',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({name:'Garden Visit',description:'Configured garden package',basePrice:950,currency:'ETB',durationMinutes:90,active:true})});assert.equal(createPackage.status,201);const createdPackage=(await createPackage.json()).package;
  const gardenDetail=await fetch(base+'/api/services/gardening_outdoor').then(r=>r.json());assert.equal(gardenDetail.packages[0].name,'Garden Visit');assert.equal(gardenDetail.packages[0].basePrice,950);
  const disabledPackage=await fetch(`${base}/api/management/services/gardening_outdoor/packages/${createdPackage.id}`,{method:'PATCH',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({name:'Garden Visit',description:'Configured garden package',basePrice:950,currency:'ETB',durationMinutes:90,active:false})});assert.equal(disabledPackage.status,200);assert.deepEqual((await fetch(base+'/api/services/gardening_outdoor').then(r=>r.json())).packages,[]);
  const pack=(await db.query("INSERT INTO service_packages(service_id,name,description,base_price,currency,estimated_duration_minutes) VALUES('premium_home_cleaning','Configured Visit','Configured package data',1800,'ETB',150) RETURNING id",[])).rows[0];
  const refreshed=await fetch(base+'/api/services/premium_home_cleaning').then(r=>r.json());assert.equal(refreshed.packages.length,1);assert.equal(refreshed.packages[0].basePrice,1800);
  const payload={serviceId:'premium_home_cleaning',packageId:pack.id,expectedPackagePrice:1800,expectedPackageCurrency:'ETB',expectedPackageDuration:150,packagePrice:1,name:'Package Guest',phone:'+251 911 222 333',neighborhood:'Bole',address:'House 2 near road',requestedStart:new Date(Date.now()+86400000).toISOString(),details:''};
  const response=await post(base,'/api/bookings',payload),created=await response.json();assert.equal(response.status,201);assert.equal(created.booking.packageName,'Configured Visit');assert.equal(created.booking.startingEstimate,1800);assert.equal(created.booking.currency,'ETB');
  const stored=(await db.query('SELECT package_id,package_name_snapshot,starting_estimate,estimated_duration_minutes FROM bookings WHERE id=$1',[created.booking.id])).rows[0];assert.equal(stored.package_id,pack.id);assert.equal(stored.package_name_snapshot,'Configured Visit');assert.equal(Number(stored.starting_estimate),1800);assert.equal(stored.estimated_duration_minutes,150);
  const management=await fetch(base+'/api/management/bookings',{headers:{Cookie:cookie}}).then(r=>r.json());assert.equal(management.bookings[0].packageName,'Configured Visit');
  assert.equal((await post(base,'/api/bookings',{...payload,expectedPackagePrice:1799})).status,409);
  assert.equal((await post(base,'/api/bookings',{...payload,packageId:'11111111-1111-4111-8111-111111111111'})).status,409);
});

test('API validation and idempotency prevent duplicate PostgreSQL rows',async t=>{
  const{base,db}=await fixture(t);assert.equal((await post(base,'/api/bookings',{})).status,400);
  const p={serviceId:'premium_home_cleaning',name:'A Guest',phone:'+251 911 222 333',neighborhood:'Bole',address:'House 2 near road',requestedStart:new Date(Date.now()+86400000).toISOString(),details:''};
  const first=await post(base,'/api/bookings',p,{'Idempotency-Key':'same-request'});assert.equal(first.status,201);
  const second=await post(base,'/api/bookings',p,{'Idempotency-Key':'same-request'});assert.equal(second.status,200);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM bookings')).rows[0].count,1);
});

test('customer registration/login uses separate own-booking auth and no staff privilege',async t=>{
  const{base}=await fixture(t);const response=await post(base,'/api/customers/register',{name:'Customer One',email:'one@example.test',phone:'+251 911 222 333',password:'CustomerPassword1'});assert.equal(response.status,201);const cookie=response.headers.get('set-cookie').split(';')[0];
  assert.equal((await fetch(base+'/api/customers/me',{headers:{Cookie:cookie}})).status,200);
  assert.equal((await fetch(base+'/api/management/bookings',{headers:{Cookie:cookie}})).status,401);
  const login=await post(base,'/api/customers/login',{email:'one@example.test',password:'CustomerPassword1'});assert.equal(login.status,200);
});

test('staff login is provisioned separately and protected cancellation writes audit history',async t=>{
  const{base,db,password}=await fixture(t);assert.equal((await fetch(base+'/api/management/bookings')).status,401);
  const login=await post(base,'/api/management/auth/login',{email:'admin@example.test',password});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
  const payload={serviceId:'premium_home_cleaning',name:'Guest',phone:'+251 911 222 333',neighborhood:'Bole Atlas',address:'Bole home',requestedStart:new Date(Date.now()+86400000).toISOString(),details:''};const created=await post(base,'/api/bookings',payload).then(r=>r.json());
  const listed=await fetch(base+'/api/management/bookings',{headers:{Cookie:cookie}}).then(r=>r.json());assert.equal(listed.bookings[0].reference,created.booking.reference);
  const changed=await fetch(`${base}/api/management/bookings/${created.booking.id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({status:'cancelled',reason:'Customer requested cancellation'})});assert.equal(changed.status,200);
  const history=await db.query('SELECT new_status FROM booking_status_history WHERE booking_id=$1 ORDER BY created_at DESC LIMIT 1',[created.booking.id]);assert.equal(history.rows[0].new_status,'cancelled');assert.equal((await db.query("SELECT count(*)::int AS count FROM audit_logs WHERE action='booking.cancelled'")).rows[0].count,1);
});

test('service creation is staff-authorized, validated, and recorded in the public catalogue',async t=>{
  const{base}=await fixture(t);
  const payload={id:'window_care',name:'Window Care',description:'Interior and exterior window cleaning.',pricingType:'quotation',basePrice:0,currency:'ETB',unit:'visit',durationMinutes:90,image:'https://example.test/window.jpg',active:true};
  assert.equal((await post(base,'/api/management/services',payload)).status,401);
  const login=await post(base,'/api/management/auth/login',{email:'admin@example.test',password:'StaffPassword123!'});const cookie=login.headers.get('set-cookie').split(';')[0];
  const created=await fetch(`${base}/api/management/services`,{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(payload)});assert.equal(created.status,201);assert.equal((await created.json()).service.id,'window_care');
  assert.equal((await fetch(`${base}/api/services/window_care`).then(r=>r.json())).service.name,'Window Care');
  assert.equal((await fetch(`${base}/api/management/services`,{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(payload)})).status,409);
});

test('location review, booking detail, staff notes and reschedule proposals persist with authorization',async t=>{
  const{base,db,password}=await fixture(t);const payload={serviceId:'handyman_plumbing',name:'Guest Customer',phone:'+251 911 222 333',neighborhood:'Bole',address:'House 4 near the clinic',nearbyLandmark:'Blue clinic',locationMethod:'manual',serviceAnswers:{repairType:'Plumbing',urgency:'Flexible'},requestedStart:new Date(Date.now()+86400000).toISOString(),details:'Leaking kitchen tap'};
  const response=await post(base,'/api/bookings',payload),{booking}=await response.json();assert.equal(response.status,201);
  const stored=(await db.query('SELECT location_review_status,latitude,longitude,service_answers,nearby_landmark FROM bookings WHERE id=$1',[booking.id])).rows[0];assert.equal(stored.location_review_status,'pending');assert.equal(stored.latitude,null);assert.equal(stored.service_answers.repairType,'Plumbing');assert.equal(stored.nearby_landmark,'Blue clinic');
  assert.equal((await fetch(`${base}/api/management/bookings/${booking.id}`)).status,401);
  const login=await post(base,'/api/management/auth/login',{email:'admin@example.test',password}),cookie=login.headers.get('set-cookie').split(';')[0],headers={Cookie:cookie,'Content-Type':'application/json'};
  const detail=await fetch(`${base}/api/management/bookings/${booking.id}`,{headers}).then(r=>r.json());assert.equal(detail.booking.serviceAnswers.repairType,'Plumbing');assert.equal(detail.booking.locationMethod,'manual');assert.equal(detail.history[0].newStatus,'pending');
  const notes=await fetch(`${base}/api/management/bookings/${booking.id}/notes`,{method:'POST',headers,body:JSON.stringify({note:'Call after 3pm'})});assert.equal(notes.status,201);
  const proposal=await fetch(`${base}/api/management/bookings/${booking.id}/reschedule-proposals`,{method:'POST',headers,body:JSON.stringify({requestedStart:new Date(Date.now()+3*86400000).toISOString(),reason:'Customer requested a later visit'})});assert.equal(proposal.status,201);
  assert.equal((await db.query('SELECT status FROM bookings WHERE id=$1',[booking.id])).rows[0].status,'pending');assert.equal((await db.query('SELECT status FROM booking_reschedule_proposals WHERE booking_id=$1',[booking.id])).rows[0].status,'pending_customer_approval');
  const resolved=await fetch(`${base}/api/management/bookings/${booking.id}/location`,{method:'PATCH',headers,body:JSON.stringify({address:payload.address,neighborhood:'Bole',nearbyLandmark:'Blue clinic',latitude:9.03,longitude:38.74,reason:'Confirmed coordinates with customer by phone'})});assert.equal(resolved.status,200);
  const after=(await db.query('SELECT location_review_status,latitude,longitude,internal_notes FROM bookings WHERE id=$1',[booking.id])).rows[0];assert.equal(after.location_review_status,'resolved');assert.equal(after.latitude,9.03);assert.match(after.internal_notes,/Call after 3pm/);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM audit_logs WHERE entity_id=$1 AND action='booking.location_reviewed'",[booking.id])).rows[0].count,1);
  const confirmation=await fetch(`${base}/api/management/bookings/${booking.id}/status`,{method:'PATCH',headers,body:JSON.stringify({status:'confirmed',reason:'Looks good'})});assert.equal(confirmation.status,409);
});

test('contact form stores messages and only staff can read the inbox',async t=>{
  const{base,password}=await fixture(t);const sent=await post(base,'/api/contact',{name:'Demo Guest',phone:'+251 911 222 333',message:'Please call me about cleaning.'});assert.equal(sent.status,201);
  assert.equal((await fetch(base+'/api/management/contact-submissions')).status,401);
  const login=await post(base,'/api/management/auth/login',{email:'admin@example.test',password}),cookie=login.headers.get('set-cookie').split(';')[0];
  const inbox=await fetch(base+'/api/management/contact-submissions',{headers:{Cookie:cookie}}).then(r=>r.json());assert.equal(inbox.submissions[0].name,'Demo Guest');
});
