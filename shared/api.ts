import { Booking, ServiceCategory, ServicePackage } from './types';

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status: number, fields?: Record<string, string>) { super(message); this.name = 'ApiError'; this.status = status; this.fields = fields; }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const headers = new Headers(init?.headers);
  if (typeof init?.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  try { response = await fetch(path, { credentials:'include', ...init, headers }); }
  catch { throw new ApiError('Could not reach Meraki Homes. Check that the API server is running and try again.', 0); }
  const text = await response.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
  if (!response.ok) {
    const fallback = response.status === 413 ? 'The image or request is too large. Use a smaller photo.'
      : response.status === 404 ? 'This action is missing on the API. Restart the API server and try again.'
      : response.status === 401 ? 'Staff sign-in is required.'
      : `The request could not be completed (${response.status}).`;
    throw new ApiError(data?.error?.message || fallback, response.status, data?.error?.fields);
  }
  return data as T;
}

export async function getServices(): Promise<ServiceCategory[]> {
  const data = await request<{services: Array<Record<string, unknown> & {id:string; name:string; description:string; basePrice:number; unit:string; durationMinutes:number; image:string; pricing_type?:'fixed'|'quotation'}>}>('/api/services');
  return data.services.map(s => ({ ...s, pricingType:s.pricing_type || 'quotation', iconName: 'Sparkles', rating: 0, reviewsCount: 0, addons: [] })) as ServiceCategory[];
}

export async function getServiceDetails(serviceId:string):Promise<{service:ServiceCategory;packages:ServicePackage[]}> {
  const data=await request<{service:Record<string,unknown>&{id:string;name:string;description:string;basePrice:number;unit:string;durationMinutes:number;image:string;pricing_type?:'fixed'|'quotation'};packages:Array<{id:string;name:string;description:string;basePrice:number;currency:'ETB'|'USD';durationMinutes:number}>}>(`/api/services/${encodeURIComponent(serviceId)}`);
  return {service:{...data.service,pricingType:data.service.pricing_type||'quotation',iconName:'Sparkles',rating:0,reviewsCount:0,addons:[]} as ServiceCategory,packages:data.packages};
}

export type WorkerSelectionMode='customer_selected'|'meraki_matched'|'operations_review';
export type EligibleWorker={id:string;workerId:string|null;name:string;photoUrl:string;serviceArea:string;skills:string[];baseRate:number|null;rateCurrency:string|null;rating:number|null;reviewCount:number;isDemo:boolean;distanceKm:number|null;availability:'available'|'busy'|'needs_confirmation'};
export async function getEligibleWorkers(input:{serviceId:string;requestedStart:string;durationMinutes:number;latitude?:number|null;longitude?:number|null}):Promise<{workers:EligibleWorker[];availabilitySource:string;demoData:boolean}>{const query=new URLSearchParams({serviceId:input.serviceId,requestedStart:input.requestedStart,durationMinutes:String(input.durationMinutes)});if(input.latitude!=null&&input.longitude!=null){query.set('latitude',String(input.latitude));query.set('longitude',String(input.longitude));}return request(`/api/workers/eligible?${query.toString()}`);}
export type BookingServiceItemPayload={serviceId:string;packageId?:string;expectedPackagePrice?:number;expectedPackageCurrency?:'ETB'|'USD';expectedPackageDuration?:number;details?:string;answers?:Record<string,string>;requestedStart?:string;workerPreference?:string;workerSelectionMode?:WorkerSelectionMode;preferredWorkerId?:string};
export type BookingRequestPayload = { serviceId:string; packageId?:string; expectedPackagePrice?:number; expectedPackageCurrency?:'ETB'|'USD'; expectedPackageDuration?:number; items?:BookingServiceItemPayload[]; name:string; phone:string; email?:string; neighborhood:string; address:string; nearbyLandmark?:string; latitude?:number|null; longitude?:number|null; locationMethod?:'manual'|'search'|'map'; locationConfirmed?:boolean; requestedStart:string; details:string; serviceAnswers?:Record<string,string>; workerPreference?:string;workerSelectionMode?:WorkerSelectionMode;preferredWorkerId?:string };
export async function postBooking(payload: BookingRequestPayload, idempotencyKey:string): Promise<Booking> {
  const { booking } = await request<{booking:{id:string;reference:string;status:string;createdAt?:string;created_at?:string;serviceName?:string;packageName?:string|null;startingEstimate?:number|null;totalEstimate?:number|null;currency?:string;durationMinutes?:number;items?:Array<{serviceName:string;packageName?:string|null;estimate:number|null;durationMinutes:number}>}}>('/api/bookings', { method:'POST', headers:{'Idempotency-Key':idempotencyKey}, body:JSON.stringify(payload) });
  const service = (await getServices().catch(()=>[])).find(item => item.id === payload.serviceId);
  const at = new Date(payload.requestedStart);
  const estimate = booking.startingEstimate ?? booking.totalEstimate ?? (booking.items?.length?booking.items.reduce((sum,item)=>sum+(item.estimate??0),0):service?.pricingType === 'fixed' ? service.basePrice : 0);
  const itemNames=booking.items?.map(item=>item.serviceName).filter(Boolean);
  return {
    id: booking.reference, serviceId:payload.serviceId, packageId:payload.packageId, packageName:booking.packageName||undefined, serviceName:booking.serviceName || itemNames?.join(', ') || service?.name || 'Home service',
    customerName:payload.name, customerPhone:payload.phone, customerEmail:payload.email,
    address:payload.address, neighborhood:payload.neighborhood, date:at.toLocaleDateString(),
    timeSlot:at.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}), durationHours:(booking.durationMinutes ?? booking.items?.reduce((sum,item)=>sum+item.durationMinutes,0) ?? service?.durationMinutes ?? 60)/60,
    cleanersCount:1, addonsSelected:[], totalPrice:estimate, totalPriceETB:estimate*120,
    status:'requested', paymentMethod:'not_selected', paymentStatus:'pending', workerPreference:payload.workerPreference,
    notes:payload.details, createdAt:booking.createdAt||booking.created_at||new Date().toISOString(),
  };
}

export type DemoPaymentReceipt={receiptNumber:string;bookingReference:string;customerName:string;customerPhone:string;serviceName:string;packageName:string;bookingTotal:number;currency:'ETB'|'USD';paymentMethod:'telebirr'|'cbe';transactionReference:string;amountPaid:number;totalPaid:number;remainingBalance:number;paymentStatus:string;paidAt:string;simulated:true};
export async function simulateDemoPayment(input:{reference:string;phone:string;provider:'telebirr'|'cbe';amount:number;outcome:'success'|'failed'|'cancelled';paymentType:'full'|'partial';idempotencyKey:string}):Promise<{receipt:DemoPaymentReceipt|null;paymentStatus:string;message:string}>{return request(`/api/bookings/${encodeURIComponent(input.reference)}/demo-payment`,{method:'POST',headers:{'Idempotency-Key':input.idempotencyKey},body:JSON.stringify(input)});}
export async function lookupDemoReceipt(reference:string,phone:string):Promise<DemoPaymentReceipt>{return(await request<{receipt:DemoPaymentReceipt}>('/api/payments/receipt-lookup',{method:'POST',body:JSON.stringify({reference,phone})})).receipt;}

export type ManagementBooking = {id:string;reference:string;serviceId:string;serviceName:string;packageName:string|null;status:string;source:string;customerId?:string|null;customerName:string;customerPhone:string;customerEmail:string|null;address:string;neighborhood:string;requestedStart:string;durationMinutes:number;notes:string;serviceAnswers:Record<string,string>;nearbyLandmark:string;latitude:number|null;longitude:number|null;locationMethod:string;locationConfirmed:boolean;locationReviewStatus:string;locationReviewNote:string;internalNotes:string;startingEstimate:number|null;agreedAmount:number|null;currency:string;createdAt:string;assignedWorker?:string|null;amountPaid?:number|null;preferredWorkerId?:string|null;workerSelectionMode?:WorkerSelectionMode;payments?:Array<{id:string;amount:number;provider:string|null;status:string;paymentStage:string;transactionReference:string|null;simulated:boolean;createdAt:string}>};
export type ManagementBookingItem={id:string;itemNumber:number;serviceId:string;serviceName:string;packageId:string|null;packageName:string|null;status:string;requestedStart:string|null;confirmedStart:string|null;durationMinutes:number;estimate:number|null;approvedAmount:number|null;currency:string;pricingModel:string;notes:string;answers:Record<string,unknown>;workerSelectionMode:WorkerSelectionMode;preferredWorkerId:string|null;suggestedWorkerId:string|null;assignments:Array<{id:string;workerId:string;workerName:string;status:string;startsAt:string|null;endsAt:string|null;customerApprovedAt:string|null}>;history:Array<{fromStatus:string|null;toStatus:string;reason:string;actor:string;createdAt:string}>};
export type ManagementWorkerProposal={id:string;itemId:string;status:string;proposedValues:{workerId?:string;replaceWorkerId?:string|null};customerDecidedAt:string|null;reason:string;createdAt:string};
export async function getManagementBookings(_legacyToken?:string):Promise<ManagementBooking[]> { return (await request<{bookings:ManagementBooking[]}>('/api/management/bookings')).bookings; }
export async function cancelManagementBooking(id:string,reason:string,_legacyToken?:string):Promise<void> { await request(`/api/management/bookings/${encodeURIComponent(id)}/status`,{method:'PATCH',body:JSON.stringify({status:'cancelled',reason})}); }
export async function updateManagementBookingStatus(id:string,status:string,reason:string):Promise<void>{await request(`/api/management/bookings/${encodeURIComponent(id)}/status`,{method:'PATCH',body:JSON.stringify({status,reason})});}
export async function searchLocations(query:string):Promise<Array<{label:string;latitude:number;longitude:number}>> { return (await request<{results:Array<{label:string;latitude:number;longitude:number}>}>(`/api/location/search?q=${encodeURIComponent(query)}`)).results; }
export async function getManagementBooking(id:string):Promise<{booking:ManagementBooking;items:ManagementBookingItem[];workerProposals:ManagementWorkerProposal[];history:Array<{oldStatus:string|null;newStatus:string;actor:string;reason:string;createdAt:string}>;proposals:Array<{id:string;previousStart:string;proposedStart:string;reason:string;status:string;proposedBy:string;createdAt:string}>;activity:Array<{actor:string;action:string;reason:string;createdAt:string}>}>{return request(`/api/management/bookings/${encodeURIComponent(id)}`);}
export async function updateManagementBookingItemStatus(id:string,itemId:string,status:string,reason:string):Promise<void>{await request(`/api/management/bookings/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/status`,{method:'PATCH',body:JSON.stringify({status,reason})});}
export async function proposeManagementWorkerChange(id:string,itemId:string,input:{workerId:string;replaceWorkerId?:string;reason:string}):Promise<void>{await request(`/api/management/bookings/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/worker-proposals`,{method:'POST',body:JSON.stringify(input)});}
export async function proposeManagementPriceChange(id:string,itemId:string,input:{amount:number;currency:'ETB'|'USD';reason:string;lineBreakdown?:Array<{description:string;quantity:number;unitPrice:number}>}):Promise<void>{await request(`/api/management/bookings/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/price-proposals`,{method:'POST',body:JSON.stringify(input)});}
export async function reviewBookingLocation(id:string,input:{address:string;neighborhood:string;nearbyLandmark:string;latitude:number|null;longitude:number|null;reason:string}):Promise<void>{await request(`/api/management/bookings/${encodeURIComponent(id)}/location`,{method:'PATCH',body:JSON.stringify(input)});}
export async function addBookingNote(id:string,note:string):Promise<void>{await request(`/api/management/bookings/${encodeURIComponent(id)}/notes`,{method:'POST',body:JSON.stringify({note})});}
export async function proposeBookingReschedule(id:string,requestedStart:string,reason:string):Promise<void>{await request(`/api/management/bookings/${encodeURIComponent(id)}/reschedule-proposals`,{method:'POST',body:JSON.stringify({requestedStart,reason})});}
export async function postContact(payload:{name:string;phone:string;email?:string;message:string}):Promise<void>{ await request('/api/contact',{method:'POST',body:JSON.stringify(payload)}); }
export type PublicBookingStatus={reference:string;status:string;serviceName:string;requestedStart:string;createdAt:string;paymentStatus?:string;amountPaid?:number;remainingBalance?:number};
export type PublicBookingLookup={mode:'reference';booking:PublicBookingStatus}|{mode:'phone';bookings:PublicBookingStatus[];demoVerificationNotice:string};
export async function lookupBooking(input:{mode:'reference';reference:string}|{mode:'phone';phone:string}):Promise<PublicBookingLookup>{return request('/api/bookings/lookup',{method:'POST',body:JSON.stringify(input)});}
export type ContactSubmission={id:string;name:string;phone:string;email:string|null;message:string;status:string;createdAt:string};
export async function getContactSubmissions(_legacyToken?:string):Promise<ContactSubmission[]>{return (await request<{submissions:ContactSubmission[]}>('/api/management/contact-submissions')).submissions;}
export async function updateContactSubmission(id:string,input:{status:'new'|'in_progress'|'responded'|'closed';note?:string}):Promise<void>{await request(`/api/management/contact-submissions/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(input)});}
export type AuditRecord={id:string;actor:string;action:string;entityType:string;entityId:string;reason:string;metadata:Record<string,unknown>;createdAt:string};
export async function getAuditRecords(query=''):Promise<AuditRecord[]>{return(await request<{events:AuditRecord[]}>(`/api/management/audit?search=${encodeURIComponent(query)}`)).events;}
export type StaffAccount={id:string;name:string;email:string;role:string;isActive:boolean;createdAt:string};
export async function getStaffAccounts():Promise<StaffAccount[]>{return(await request<{staff:StaffAccount[]}>('/api/management/staff')).staff;}
export async function createStaffAccount(input:{name:string;email:string;password:string;roleId:'admin'|'operations'}):Promise<void>{await request('/api/management/staff',{method:'POST',body:JSON.stringify(input)});}
export async function setStaffAccountActive(id:string,active:boolean):Promise<void>{await request(`/api/management/staff/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({active})});}
export type ManagementWorker={id:string;workerCode:string|null;name:string;photoUrl:string|null;serviceArea:string|null;status:string;eligibility:string;baseRate:number|null;currency:string|null;rating:number|null;reviewCount:number;isDemo:boolean;hasProfessionalAccount?:boolean;phone?:string|null;activeAssignments?:number;skills:string[]};
export async function getManagementWorkers():Promise<ManagementWorker[]>{return(await request<{workers:ManagementWorker[]}>('/api/management/workers')).workers;}
export async function getManagementWorker(id:string):Promise<{worker:ManagementWorker;services:Array<{id:string;name:string;status:string}>;history:Array<{reference:string;serviceName:string;status:string;startsAt:string|null}>}>{return request(`/api/management/workers/${encodeURIComponent(id)}`);}
export async function createManagementWorker(input:{name:string;serviceArea:string;photoUrl:string;baseRate:number|null;currency:'ETB'|'USD';status:string;eligibility:string;serviceIds:string[]}):Promise<void>{await request('/api/management/workers',{method:'POST',body:JSON.stringify(input)});}
export async function saveManagementWorker(id:string,input:{name:string;serviceArea:string;photoUrl:string;baseRate:number|null;currency:'ETB'|'USD';status:string;eligibility:string;serviceIds:string[]}):Promise<void>{await request(`/api/management/workers/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(input)});}
export async function setManagementProfessionalAccount(id:string,input:{phone:string;password:string}):Promise<void>{await request(`/api/management/workers/${encodeURIComponent(id)}/professional-account`,{method:'PUT',body:JSON.stringify(input)});}
export type ManagementPayment={id:string;transactionReference:string|null;method:string;status:string;simulated:boolean;amount:number;currency:string;createdAt:string;bookingReference:string;serviceName:string;customerName:string;totalPaid:number|null;remainingBalance:number|null};
export async function getManagementPayments():Promise<ManagementPayment[]>{return(await request<{payments:ManagementPayment[]}>('/api/management/payments')).payments;}
export async function assignManagementBooking(id:string,input:{workerId:string;reason:string;itemId?:string;replaceWorkerId?:string;approvalProposalId?:string}):Promise<void>{await request(`/api/management/bookings/${encodeURIComponent(id)}/assignments`,{method:'POST',body:JSON.stringify(input)});}
export type CustomerAccount={id:string;name:string;email:string};
export async function loginCustomer(email:string,password:string):Promise<CustomerAccount>{return (await request<{customer:CustomerAccount}>('/api/customers/login',{method:'POST',body:JSON.stringify({email,password})})).customer;}
export async function registerCustomer(input:{name:string;email:string;phone:string;password:string}):Promise<CustomerAccount>{return (await request<{customer:CustomerAccount}>('/api/customers/register',{method:'POST',body:JSON.stringify(input)})).customer;}
export async function getCustomerAccount():Promise<CustomerAccount>{return (await request<{customer:CustomerAccount}>('/api/customers/me')).customer;}
export type CustomerBookingItem={id:string;serviceName:string;packageName:string|null;status:string;requestedStart:string|null;estimate:number|null;currency:string;reviewSubmitted:boolean};
export async function getCustomerBookings():Promise<Array<{reference:string;service_name:string;status:string;requested_start:string;created_at:string;items:CustomerBookingItem[]}>>{return (await request<{bookings:Array<{reference:string;service_name:string;status:string;requested_start:string;created_at:string;items:CustomerBookingItem[]}>}>('/api/customers/me/bookings')).bookings;}
export async function submitCustomerReview(input:{bookingReference:string;itemId:string;rating:number;comment:string}):Promise<void>{await request('/api/customers/me/reviews',{method:'POST',body:JSON.stringify(input)});}
export type CustomerBookingProposal={id:string;itemId:string;bookingReference:string;serviceName:string;proposedWorkerName:string|null;type:string;oldValues:Record<string,unknown>;proposedValues:Record<string,unknown>;reason:string;createdAt:string};
export async function getCustomerBookingProposals():Promise<CustomerBookingProposal[]>{return(await request<{proposals:CustomerBookingProposal[]}>('/api/customers/me/booking-proposals')).proposals;}
export async function decideCustomerBookingProposal(id:string,decision:'accepted'|'rejected'):Promise<void>{await request(`/api/customers/me/booking-proposals/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({decision})});}
export type CustomerApproval={id:string;kind:'worker'|'schedule'|'price';bookingReference:string;serviceName:string;workerName:string|null;reason:string;createdAt:string;proposedStart:string|null;proposedAmount:number|null;currency:string|null};
export async function getCustomerApprovals():Promise<CustomerApproval[]>{return(await request<{approvals:CustomerApproval[]}>('/api/customers/me/approvals')).approvals;}
export async function decideCustomerApproval(kind:CustomerApproval['kind'],id:string,decision:'accepted'|'rejected'):Promise<void>{await request(`/api/customers/me/approvals/${kind}/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({decision})});}
export async function logoutCustomer():Promise<void>{await request('/api/customers/logout',{method:'POST'});}
export async function loginStaff(email:string,password:string):Promise<{id:string;name:string;email:string;role:string}>{return (await request<{staff:{id:string;name:string;email:string;role:string}}>('/api/management/auth/login',{method:'POST',body:JSON.stringify({email,password})})).staff;}
export async function getStaffAccount():Promise<{id:string;name:string;email:string;role:string}>{return (await request<{staff:{id:string;name:string;email:string;role:string}}>('/api/management/auth/me')).staff;}
export async function logoutStaff():Promise<void>{await request('/api/management/auth/logout',{method:'POST'});}
export type ManagementCustomer={id:string;name:string;email:string|null;phone?:string|null;status:string;createdAt:string;bookings:number;accountType?:string};
export async function getManagementCustomers(query=''):Promise<ManagementCustomer[]>{return (await request<{customers:ManagementCustomer[]}>(`/api/management/customers?search=${encodeURIComponent(query)}`)).customers;}
export async function getManagementCustomer(id:string):Promise<{customer:ManagementCustomer;addresses:Array<{id:string;label:string;city:string;subCity:string;area:string;streetBuilding:string;landmark:string;isDefault:boolean}>;bookings:Array<{id:string;reference:string;status:string;serviceName:string;requestedStart:string;createdAt:string}>}>{return request(`/api/management/customers/${encodeURIComponent(id)}`);}
export async function saveManagementCustomer(id:string,input:{name?:string;phone?:string;status?:string}):Promise<void>{await request(`/api/management/customers/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(input)});}
export type ManagementService={id:string;name:string;description:string;pricing_type:'fixed'|'quotation';base_price:string|number;currency:string;unit:string;is_active:boolean;image?:string;estimated_duration_minutes?:number};
export type ManagementServicePackage={id:string;name:string;description:string;base_price:string|number;currency:'ETB'|'USD';estimated_duration_minutes:number;is_active:boolean};
export type HomePromotion={id:string;title:string;body:string;code:string;imageUrl:string;mobileImageUrl:string;isActive:boolean;displayOrder:number;updatedAt?:string};
export async function getHomePromotions():Promise<Array<Pick<HomePromotion,'id'|'title'|'body'|'code'|'imageUrl'|'mobileImageUrl'>>>{return(await request<{promotions:Array<Pick<HomePromotion,'id'|'title'|'body'|'code'|'imageUrl'|'mobileImageUrl'>>}>('/api/home-promotions')).promotions;}
export async function getManagementHomePromotions():Promise<HomePromotion[]>{return(await request<{promotions:HomePromotion[]}>('/api/management/home-promotions')).promotions;}
function promotionImageUrl(url:string):string{
  const value=String(url||'').trim();
  if(!value||value.startsWith('data:')||value.startsWith('blob:'))return '';
  return value.slice(0,1000);
}
function homePromotionPayload(input:Omit<HomePromotion,'id'|'updatedAt'>):Omit<HomePromotion,'id'|'updatedAt'>{
  return {
    title:String(input.title||'').trim(),
    body:String(input.body||'').slice(0,300),
    code:String(input.code||'').slice(0,40),
    imageUrl:promotionImageUrl(input.imageUrl),
    mobileImageUrl:promotionImageUrl(input.mobileImageUrl||input.imageUrl),
    isActive:Boolean(input.isActive),
    displayOrder:Number.isFinite(Number(input.displayOrder))?Math.max(0,Math.round(Number(input.displayOrder))):0,
  };
}
export async function saveManagementHomePromotion(promotion:HomePromotion):Promise<void>{await request(`/api/management/home-promotions/${encodeURIComponent(promotion.id)}`,{method:'PATCH',body:JSON.stringify(homePromotionPayload(promotion))});}
export async function createManagementHomePromotion(input:Omit<HomePromotion,'id'|'updatedAt'>):Promise<HomePromotion>{return(await request<{promotion:HomePromotion}>('/api/management/home-promotions',{method:'POST',body:JSON.stringify(homePromotionPayload(input))})).promotion;}
async function compressManagementImage(file:File):Promise<File>{
  if(typeof createImageBitmap!=='function'||file.size<=350_000&&file.type==='image/jpeg')return file;
  try{
    const bitmap=await createImageBitmap(file);
    const max=1600;
    const scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
    const width=Math.max(1,Math.round(bitmap.width*scale));
    const height=Math.max(1,Math.round(bitmap.height*scale));
    const canvas=document.createElement('canvas');
    canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d');
    if(!context)return file;
    context.drawImage(bitmap,0,0,width,height);
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',0.82));
    bitmap.close?.();
    if(!blob||blob.size>file.size&&file.size<=2*1024*1024)return file;
    return new File([blob],file.name.replace(/\.[a-z0-9]+$/i,'.jpg'),{type:'image/jpeg'});
  }catch{return file;}
}
export async function uploadManagementImage(file:File):Promise<string>{
  const prepared=await compressManagementImage(file);
  if(prepared.size>6*1024*1024)throw new ApiError('Use a smaller photo, or crop it before uploading.',413);
  const mime=prepared.type==='image/jpg'?'image/jpeg':(prepared.type||'image/jpeg');
  if(!['image/jpeg','image/png','image/webp'].includes(mime))throw new ApiError('Upload a JPEG, PNG, or WebP image.',400);
  return(await request<{url:string}>('/api/management/uploads',{method:'POST',headers:{'Content-Type':mime,'X-Filename':encodeURIComponent(prepared.name||'upload.jpg')},body:prepared})).url;
}
export type ManagementQuestion={id?:string;key:string;label:string;answerType:'short_text'|'number'|'select'|'yes_no'|'photo';required:boolean;displayOrder:number;options:Array<{value:string;label:string}>};
export async function getManagementServiceQuestions(serviceId:string):Promise<ManagementQuestion[]>{return(await request<{questions:ManagementQuestion[]}>(`/api/management/services/${encodeURIComponent(serviceId)}/questions`)).questions;}
export async function saveManagementServiceQuestions(serviceId:string,questions:ManagementQuestion[]):Promise<void>{await request(`/api/management/services/${encodeURIComponent(serviceId)}/questions`,{method:'PUT',body:JSON.stringify({questions})});}
export async function getManagementServices():Promise<ManagementService[]>{return (await request<{services:ManagementService[]}>('/api/management/services')).services;}
export async function createManagementService(input:{id:string;name:string;description:string;pricingType:'fixed'|'quotation';basePrice:number;currency:'ETB'|'USD';unit:string;durationMinutes:number;image:string;active:boolean}):Promise<void>{await request('/api/management/services',{method:'POST',body:JSON.stringify(input)});}
export async function saveManagementService(service:ManagementService):Promise<void>{await request(`/api/management/services/${encodeURIComponent(service.id)}`,{method:'PATCH',body:JSON.stringify({name:service.name,description:service.description,pricingType:service.pricing_type,basePrice:Number(service.base_price),currency:service.currency,unit:service.unit,durationMinutes:service.estimated_duration_minutes,image:service.image||'',active:service.is_active})});}
export async function getManagementServicePackages(serviceId:string):Promise<ManagementServicePackage[]>{return (await request<{packages:ManagementServicePackage[]}>(`/api/management/services/${encodeURIComponent(serviceId)}/packages`)).packages;}
export async function createManagementServicePackage(serviceId:string,pkg:Omit<ManagementServicePackage,'id'|'base_price'>&{base_price:number}):Promise<void>{await request(`/api/management/services/${encodeURIComponent(serviceId)}/packages`,{method:'POST',body:JSON.stringify({name:pkg.name,description:pkg.description,basePrice:pkg.base_price,currency:pkg.currency,durationMinutes:pkg.estimated_duration_minutes,active:pkg.is_active})});}
export async function saveManagementServicePackage(serviceId:string,pkg:ManagementServicePackage):Promise<void>{await request(`/api/management/services/${encodeURIComponent(serviceId)}/packages/${encodeURIComponent(pkg.id)}`,{method:'PATCH',body:JSON.stringify({name:pkg.name,description:pkg.description,basePrice:Number(pkg.base_price),currency:pkg.currency,durationMinutes:pkg.estimated_duration_minutes,active:pkg.is_active})});}
