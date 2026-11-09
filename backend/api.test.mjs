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
  await migrate(pool,{skipBtreeGist:true});
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
  const payment=await post(base,`/api/bookings/${created.booking.reference}/demo-payment`,{phone:payload.phone,provider:'telebirr',amount:1800,outcome:'success',paymentType:'full'},{'Idempotency-Key':'package-payment-test'});assert.equal(payment.status,201);
  const allocation=(await db.query('SELECT booking_id,booking_item_id,allocated_amount,currency FROM payment_allocations WHERE payment_id=(SELECT id FROM payments WHERE idempotency_key=$1)',['package-payment-test'])).rows[0];assert.equal(Number(allocation.allocated_amount),1800);assert.equal(allocation.booking_id,created.booking.id);assert.equal(allocation.currency,'ETB');
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

test('multi-service items keep answers, scoped assignments, customer-approved replacement, and item history aligned',async t=>{
  const{base,db,password}=await fixture(t);
  const customer=await post(base,'/api/customers/register',{name:'Multi Service Customer',email:'multi@example.test',phone:'+251 911 222 333',password:'CustomerPassword1'});assert.equal(customer.status,201);
  const customerCookie=customer.headers.get('set-cookie').split(';')[0];
  const requestedStart='2027-01-04T12:00:00.000Z';
  const createdResponse=await post(base,'/api/bookings',{name:'Multi Service Customer',phone:'+251 911 222 333',email:'multi@example.test',neighborhood:'Bole',address:'Bole near the main road',latitude:9.03,longitude:38.74,locationConfirmed:true,requestedStart,items:[{serviceId:'premium_home_cleaning',details:'Clean two bedrooms',answers:{rooms:'2 bedrooms'}},{serviceId:'cooking_service',details:'Prepare dinner',answers:{servings:'4'}}]},{'Idempotency-Key':'multi-item-test',Cookie:customerCookie});
  const created=await createdResponse.json();assert.equal(createdResponse.status,201,JSON.stringify(created));assert.equal(created.booking.items.length,2);
  assert.ok((await db.query('SELECT customer_id FROM bookings WHERE id=$1',[created.booking.id])).rows[0].customer_id);
  const items=(await db.query('SELECT id,item_number,answers_snapshot FROM booking_items WHERE booking_id=$1 ORDER BY item_number',[created.booking.id])).rows;assert.equal(items[0].answers_snapshot.rooms,'2 bedrooms');assert.equal(items[1].answers_snapshot.servings,'4');
  const login=await post(base,'/api/management/auth/login',{email:'admin@example.test',password});const staffCookie=login.headers.get('set-cookie').split(';')[0],staffHeaders={Cookie:staffCookie,'Content-Type':'application/json'};
  const customerItems=await fetch(base+'/api/customers/me/bookings',{headers:{Cookie:customerCookie}}).then(r=>r.json());assert.equal(customerItems.bookings[0]?.items.length,2,JSON.stringify(customerItems));
  const detail=await fetch(`${base}/api/management/bookings/${created.booking.id}`,{headers:staffHeaders}).then(r=>r.json());assert.equal(detail.items.length,2);
  await fetch(`${base}/api/management/bookings/${created.booking.id}/location`,{method:'PATCH',headers:staffHeaders,body:JSON.stringify({address:'Bole near the main road',neighborhood:'Bole',nearbyLandmark:'Main road',latitude:9.03,longitude:38.74,reason:'Verified with customer'})});
  const workers=[];for(const workerName of ['Original Worker','Replacement Worker']){workers.push((await db.query("INSERT INTO workers(full_name,operational_status,eligibility_status) VALUES($1,'active','eligible') RETURNING id",[workerName])).rows[0].id);}
  for(const workerId of workers){await db.query("INSERT INTO worker_services(worker_id,service_id,qualification_status,qualification_name) VALUES($1,'premium_home_cleaning','verified','Home cleaning')",[workerId]);await db.query("INSERT INTO worker_skills(worker_id,skill_id,verification_status,verified_at) SELECT $1,skill_id,'verified',now() FROM service_skill_requirements WHERE service_id='premium_home_cleaning'",[workerId]);await db.query("INSERT INTO worker_availability(worker_id,specific_date,start_time,end_time,timezone) VALUES($1,'2027-01-04','09:00','18:00','Africa/Addis_Ababa')",[workerId]);}
  const assignment=(await db.query("INSERT INTO booking_assignments(booking_id,booking_item_id,worker_id,assignment_status,assigned_by,assignment_start,assignment_end) VALUES($1,$2,$3,'assigned','test',$4::timestamptz,$4::timestamptz+interval '150 minutes') RETURNING id",[created.booking.id,items[0].id,workers[0],requestedStart])).rows[0];
  const proposalResponse=await fetch(`${base}/api/management/bookings/${created.booking.id}/items/${items[0].id}/worker-proposals`,{method:'POST',headers:staffHeaders,body:JSON.stringify({workerId:workers[1],replaceWorkerId:workers[0],reason:'Original worker is unavailable; proposed replacement is qualified'})});assert.equal(proposalResponse.status,201);const proposal=(await proposalResponse.json()).proposal;
  const customerProposals=await fetch(base+'/api/customers/me/booking-proposals',{headers:{Cookie:customerCookie}}).then(r=>r.json());assert.equal(customerProposals.proposals[0].id,proposal.id);
  const decision=await fetch(`${base}/api/customers/me/booking-proposals/${proposal.id}`,{method:'PATCH',headers:{Cookie:customerCookie,'Content-Type':'application/json'},body:JSON.stringify({decision:'accepted'})});assert.equal(decision.status,200);
  const assignmentResponse=await fetch(`${base}/api/management/bookings/${created.booking.id}/assignments`,{method:'POST',headers:staffHeaders,body:JSON.stringify({itemId:items[0].id,workerId:workers[1],replaceWorkerId:workers[0],approvalProposalId:proposal.id,reason:'Customer-approved replacement'})});assert.equal(assignmentResponse.status,201,await assignmentResponse.text());
  assert.equal((await db.query('SELECT assignment_status FROM booking_assignments WHERE id=$1',[assignment.id])).rows[0].assignment_status,'replaced');
  assert.equal((await db.query('SELECT count(*)::int AS count FROM worker_reservations WHERE booking_item_id=$1 AND reservation_status=\'active\'',[items[0].id])).rows[0].count,1);
  const confirm=await fetch(`${base}/api/management/bookings/${created.booking.id}/items/${items[0].id}/status`,{method:'PATCH',headers:staffHeaders,body:JSON.stringify({status:'confirmed',reason:'Schedule and worker confirmed'})});assert.equal(confirm.status,200);
  const finalDetail=await fetch(`${base}/api/management/bookings/${created.booking.id}`,{headers:staffHeaders}).then(r=>r.json());assert.equal(finalDetail.items[0].status,'confirmed');assert.equal(finalDetail.items[0].assignments.filter(a=>a.status==='confirmed').length,1);assert.ok(finalDetail.items[0].assignments.find(a=>a.workerId===workers[1]).customerApprovedAt);assert.equal(finalDetail.items[0].history.at(-1).toStatus,'confirmed');
  for(const status of ['in_progress','completed']){const response=await fetch(`${base}/api/management/bookings/${created.booking.id}/items/${items[0].id}/status`,{method:'PATCH',headers:staffHeaders,body:JSON.stringify({status,reason:`Service item ${status}`})});assert.equal(response.status,200);}
  const performance=await fetch(`${base}/api/management/bookings/${created.booking.id}/items/${items[0].id}/performance`,{method:'POST',headers:staffHeaders,body:JSON.stringify({workerId:workers[1],category:'quality',score:5,notes:'Completed the agreed work'})});assert.equal(performance.status,201);
  const review=await fetch(base+'/api/customers/me/reviews',{method:'POST',headers:{Cookie:customerCookie,'Content-Type':'application/json'},body:JSON.stringify({bookingReference:created.booking.reference,itemId:items[0].id,workerId:workers[1],rating:4,comment:'Good service'})});assert.equal(review.status,201);
  const reviews=await fetch(base+'/api/management/reviews',{headers:staffHeaders}).then(r=>r.json());assert.equal(reviews.reviews[0].status,'pending');
  const moderated=await fetch(`${base}/api/management/reviews/${reviews.reviews[0].id}`,{method:'PATCH',headers:staffHeaders,body:JSON.stringify({status:'approved',reason:'Review follows moderation policy'})});assert.equal(moderated.status,200);
  const workerStats=(await db.query('SELECT rating,review_count FROM workers WHERE id=$1',[workers[1]])).rows[0];assert.equal(Number(workerStats.rating),4);assert.equal(workerStats.review_count,1);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM worker_performance_records WHERE booking_item_id=$1',[items[0].id])).rows[0].count,1);
});

test('customer account can approve service item price and schedule proposals',async t=>{
  const{base,db,password}=await fixture(t);
  const customer=await post(base,'/api/customers/register',{name:'Approval Customer',email:'approvals@example.test',phone:'+251 911 222 333',password:'CustomerPassword1'}),customerCookie=customer.headers.get('set-cookie').split(';')[0];
  const start='2027-01-04T12:00:00.000Z',createdResponse=await post(base,'/api/bookings',{serviceId:'handyman_plumbing',name:'Approval Customer',phone:'+251 911 222 333',neighborhood:'Bole',address:'House 8 by the clinic',requestedStart:start,details:'Repair a leaking tap'}, {Cookie:customerCookie});const created=await createdResponse.json();assert.equal(createdResponse.status,201,JSON.stringify(created));
  const item=(await db.query('SELECT id,currency FROM booking_items WHERE booking_id=$1',[created.booking.id])).rows[0];
  const staff=await post(base,'/api/management/auth/login',{email:'admin@example.test',password}),staffCookie=staff.headers.get('set-cookie').split(';')[0],headers={Cookie:staffCookie,'Content-Type':'application/json'};
  const price=await fetch(`${base}/api/management/bookings/${created.booking.id}/items/${item.id}/price-proposals`,{method:'POST',headers,body:JSON.stringify({amount:725,currency:item.currency.trim(),reason:'Reviewed scope and materials'})});assert.equal(price.status,201);const priceProposal=(await price.json()).proposal;
  const schedule=await fetch(`${base}/api/management/bookings/${created.booking.id}/reschedule-proposals`,{method:'POST',headers,body:JSON.stringify({requestedStart:'2027-01-06T12:00:00.000Z',reason:'Customer requested a later date'})});assert.equal(schedule.status,201);const scheduleProposal=(await schedule.json()).proposal;
  const approvals=await fetch(base+'/api/customers/me/approvals',{headers:{Cookie:customerCookie}}).then(r=>r.json());assert.deepEqual(new Set(approvals.approvals.map(a=>a.kind)),new Set(['price','schedule']));
  for(const [kind,id] of [['price',priceProposal.id],['schedule',scheduleProposal.id]]){const response=await fetch(`${base}/api/customers/me/approvals/${kind}/${id}`,{method:'PATCH',headers:{Cookie:customerCookie,'Content-Type':'application/json'},body:JSON.stringify({decision:'accepted'})});assert.equal(response.status,200);}
  const current=(await db.query('SELECT b.agreed_amount,b.requested_start,i.approved_amount,i.preferred_start_at FROM bookings b JOIN booking_items i ON i.booking_id=b.id WHERE b.id=$1',[created.booking.id])).rows[0];assert.equal(Number(current.agreed_amount),725);assert.equal(Number(current.approved_amount),725);assert.equal(new Date(current.requested_start).toISOString(),'2027-01-06T12:00:00.000Z');assert.equal(new Date(current.preferred_start_at).toISOString(),'2027-01-06T12:00:00.000Z');
});

test('mobile bearer auth can access account, save addresses, submit booking and view private details',async t=>{
  const{base,db}=await fixture(t);
  const registered=await post(base,'/api/mobile/auth/register',{name:'Mobile Customer',email:'mobile@example.test',phone:'+251 911 333 444',password:'MobilePassword123'});
  assert.equal(registered.status,201);const {customer,accessToken}=await registered.json();assert.ok(accessToken);
  const auth={Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'};
  const me=await fetch(base+'/api/customers/me',{headers:auth}).then(r=>r.json());assert.equal(me.customer.id,customer.id);assert.equal(me.customer.phone,'+251 911 333 444');
  const saved=await post(base,'/api/customers/me/addresses',{label:'Home',city:'Addis Ababa',subCity:'Bole',area:'Bole Atlas',streetBuilding:'Building 4B, Apt 402',landmark:'Edna Mall',directions:'Call at the gate',isDefault:true},{Authorization:`Bearer ${accessToken}`});assert.equal(saved.status,201);assert.equal((await saved.json()).address.isDefault,true);
  const listed=await fetch(base+'/api/customers/me/addresses',{headers:auth}).then(r=>r.json());assert.equal(listed.addresses.length,1);assert.equal(listed.addresses[0].area,'Bole Atlas');
  const time=new Date(Date.now()+3*86400000).toISOString();
  const request=await post(base,'/api/bookings',{name:customer.name,phone:me.customer.phone,email:customer.email,neighborhood:'Bole',address:'Building 4B, Apt 402, Bole Atlas',requestedStart:time,items:[{serviceId:'premium_home_cleaning',details:'Two bedrooms',answers:{rooms:'2'},requestedStart:time,workerSelectionMode:'meraki_matched'}]},{Authorization:`Bearer ${accessToken}`,'Idempotency-Key':'mobile-customer-request'});
  assert.equal(request.status,201);const created=(await request.json()).booking;assert.equal(created.status,'pending');
  const mine=await fetch(base+'/api/customers/me/bookings',{headers:auth}).then(r=>r.json());assert.equal(mine.bookings.length,1);assert.equal(mine.bookings[0].reference,created.reference);
  const detail=await fetch(`${base}/api/customers/me/bookings/${created.reference}`,{headers:auth}).then(r=>r.json());assert.equal(detail.items[0].serviceName,'Premium Home Cleaning');assert.equal(detail.payment.status,'unpaid');
  assert.equal((await fetch(`${base}/api/customers/me/bookings/${created.reference}`,{headers:{Authorization:'Bearer invalid'}})).status,401);
  await db.query("INSERT INTO service_questionnaire_versions(service_id,version_number,status,effective_from) VALUES('premium_home_cleaning',1,'published',now())");
  await db.query("INSERT INTO service_questions(questionnaire_version_id,question_key,label,answer_type,is_required) SELECT id,'propertySize','Property size','select',true FROM service_questionnaire_versions WHERE service_id='premium_home_cleaning'");
  const questionnaire=await fetch(base+'/api/services/premium_home_cleaning').then(r=>r.json());assert.equal(questionnaire.questions[0].key,'propertySize');assert.equal(questionnaire.questions[0].required,true);
});
