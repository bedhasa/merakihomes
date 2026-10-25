import { Booking, ServiceCategory, ServicePackage } from './types';

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status: number, fields?: Record<string, string>) { super(message); this.name = 'ApiError'; this.status = status; this.fields = fields; }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(path, { credentials:'include', ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } }); }
  catch { throw new ApiError('Could not reach Meraki Homes. Check that the API server is running and try again.', 0); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data?.error?.message || 'The request could not be completed.', response.status, data?.error?.fields);
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
export type BookingRequestPayload = { serviceId:string; packageId?:string; expectedPackagePrice?:number; expectedPackageCurrency?:'ETB'|'USD'; expectedPackageDuration?:number; name:string; phone:string; email?:string; neighborhood:string; address:string; nearbyLandmark?:string; latitude?:number|null; longitude?:number|null; locationMethod?:'manual'|'search'|'map'; locationConfirmed?:boolean; requestedStart:string; details:string; serviceAnswers?:Record<string,string>; workerPreference?:string;workerSelectionMode?:WorkerSelectionMode;preferredWorkerId?:string };
export async function postBooking(payload: BookingRequestPayload, idempotencyKey:string): Promise<Booking> {
  const { booking } = await request<{booking:{id:string;reference:string;status:string;createdAt:string;serviceName?:string;packageName?:string|null;startingEstimate?:number|null;currency?:string;durationMinutes?:number}}>('/api/bookings', { method:'POST', headers:{'Idempotency-Key':idempotencyKey}, body:JSON.stringify(payload) });
  const service = (await getServices().catch(()=>[])).find(item => item.id === payload.serviceId);
  const at = new Date(payload.requestedStart);
  const estimate = booking.startingEstimate ?? (service?.pricingType === 'fixed' ? service.basePrice : 0);
  return {
    id: booking.reference, serviceId:payload.serviceId, packageId:payload.packageId, packageName:booking.packageName||undefined, serviceName:booking.serviceName || service?.name || 'Home service',
    customerName:payload.name, customerPhone:payload.phone, customerEmail:payload.email,
    address:payload.address, neighborhood:payload.neighborhood, date:at.toLocaleDateString(),
    timeSlot:at.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}), durationHours:(booking.durationMinutes ?? service?.durationMinutes ?? 60)/60,
    cleanersCount:1, addonsSelected:[], totalPrice:estimate, totalPriceETB:estimate*120,
    status:'requested', paymentMethod:'not_selected', paymentStatus:'pending', workerPreference:payload.workerPreference,
    notes:payload.details, createdAt:booking.createdAt,
  };
}

export type DemoPaymentReceipt={receiptNumber:string;bookingReference:string;customerName:string;customerPhone:string;serviceName:string;packageName:string;bookingTotal:number;currency:'ETB'|'USD';paymentMethod:'telebirr'|'cbe';transactionReference:string;amountPaid:number;totalPaid:number;remainingBalance:number;paymentStatus:string;paidAt:string;simulated:true};
export async function simulateDemoPayment(input:{reference:string;phone:string;provider:'telebirr'|'cbe';amount:number;outcome:'success'|'failed'|'cancelled';paymentType:'full'|'partial';idempotencyKey:string}):Promise<{receipt:DemoPaymentReceipt|null;paymentStatus:string;message:string}>{return request(`/api/bookings/${encodeURIComponent(input.reference)}/demo-payment`,{method:'POST',headers:{'Idempotency-Key':input.idempotencyKey},body:JSON.stringify(input)});}
export async function lookupDemoReceipt(reference:string,phone:string):Promise<DemoPaymentReceipt>{return(await request<{receipt:DemoPaymentReceipt}>('/api/payments/receipt-lookup',{method:'POST',body:JSON.stringify({reference,phone})})).receipt;}

export type ManagementBooking = {id:string;reference:string;serviceId:string;serviceName:string;packageName:string|null;status:string;source:string;customerName:string;customerPhone:string;customerEmail:string|null;address:string;neighborhood:string;requestedStart:string;durationMinutes:number;notes:string;serviceAnswers:Record<string,string>;nearbyLandmark:string;latitude:number|null;longitude:number|null;locationMethod:string;locationConfirmed:boolean;locationReviewStatus:string;locationReviewNote:string;internalNotes:string;startingEstimate:number|null;agreedAmount:number|null;currency:string;createdAt:string;preferredWorkerId?:string|null;workerSelectionMode?:WorkerSelectionMode};
export async function getManagementBookings(_legacyToken?:string):Promise<ManagementBooking[]> { return (await request<{bookings:ManagementBooking[]}>('/api/management/bookings')).bookings; }
export async function cancelManagementBooking(id:string,reason:string,_legacyToken?:string):Promise<void> { await request(`/api/management/bookings/${encodeURIComponent(id)}/status`,{method:'PATCH',body:JSON.stringify({status:'cancelled',reason})}); }
export async function updateManagementBookingStatus(id:string,status:string,reason:string):Promise<void>{await request(`/api/management/bookings/${encodeURIComponent(id)}/status`,{method:'PATCH',body:JSON.stringify({status,reason})});}
export async function searchLocations(query:string):Promise<Array<{label:string;latitude:number;longitude:number}>> { return (await request<{results:Array<{label:string;latitude:number;longitude:number}>}>(`/api/location/search?q=${encodeURIComponent(query)}`)).results; }
export async function getManagementBooking(id:string):Promise<{booking:ManagementBooking;history:Array<{oldStatus:string|null;newStatus:string;actor:string;reason:string;createdAt:string}>;proposals:Array<{id:string;previousStart:string;proposedStart:string;reason:string;status:string;proposedBy:string;createdAt:string}>;activity:Array<{actor:string;action:string;reason:string;createdAt:string}>}>{return request(`/api/management/bookings/${encodeURIComponent(id)}`);}
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
export type ManagementWorker={id:string;workerCode:string|null;name:string;photoUrl:string|null;serviceArea:string|null;status:string;eligibility:string;baseRate:number|null;currency:string|null;rating:number|null;reviewCount:number;isDemo:boolean;skills:string[]};
export async function getManagementWorkers():Promise<ManagementWorker[]>{return(await request<{workers:ManagementWorker[]}>('/api/management/workers')).workers;}
export type ManagementPayment={id:string;transactionReference:string|null;method:string;status:string;simulated:boolean;amount:number;currency:string;createdAt:string;bookingReference:string;serviceName:string;customerName:string;totalPaid:number|null;remainingBalance:number|null};
export async function getManagementPayments():Promise<ManagementPayment[]>{return(await request<{payments:ManagementPayment[]}>('/api/management/payments')).payments;}
export async function assignManagementBooking(id:string,input:{workerId:string;reason:string;customerApprovedReplacement:boolean}):Promise<void>{await request(`/api/management/bookings/${encodeURIComponent(id)}/assignments`,{method:'POST',body:JSON.stringify(input)});}
export type CustomerAccount={id:string;name:string;email:string};
export async function loginCustomer(email:string,password:string):Promise<CustomerAccount>{return (await request<{customer:CustomerAccount}>('/api/customers/login',{method:'POST',body:JSON.stringify({email,password})})).customer;}
export async function registerCustomer(input:{name:string;email:string;phone:string;password:string}):Promise<CustomerAccount>{return (await request<{customer:CustomerAccount}>('/api/customers/register',{method:'POST',body:JSON.stringify(input)})).customer;}
export async function getCustomerAccount():Promise<CustomerAccount>{return (await request<{customer:CustomerAccount}>('/api/customers/me')).customer;}
export async function getCustomerBookings():Promise<Array<{reference:string;service_name:string;status:string;requested_start:string;created_at:string}>>{return (await request<{bookings:Array<{reference:string;service_name:string;status:string;requested_start:string;created_at:string}>}>('/api/customers/me/bookings')).bookings;}
export async function logoutCustomer():Promise<void>{await request('/api/customers/logout',{method:'POST'});}
export async function loginStaff(email:string,password:string):Promise<{id:string;name:string;email:string;role:string}>{return (await request<{staff:{id:string;name:string;email:string;role:string}}>('/api/management/auth/login',{method:'POST',body:JSON.stringify({email,password})})).staff;}
export async function getStaffAccount():Promise<{id:string;name:string;email:string;role:string}>{return (await request<{staff:{id:string;name:string;email:string;role:string}}>('/api/management/auth/me')).staff;}
export async function logoutStaff():Promise<void>{await request('/api/management/auth/logout',{method:'POST'});}
export type ManagementCustomer={id:string;name:string;email:string|null;status:string;createdAt:string;bookings:number};
export async function getManagementCustomers():Promise<ManagementCustomer[]>{return (await request<{customers:ManagementCustomer[]}>('/api/management/customers')).customers;}
export type ManagementService={id:string;name:string;description:string;pricing_type:'fixed'|'quotation';base_price:string|number;currency:string;unit:string;is_active:boolean;image?:string;estimated_duration_minutes?:number};
export type ManagementServicePackage={id:string;name:string;description:string;base_price:string|number;currency:'ETB'|'USD';estimated_duration_minutes:number;is_active:boolean};
export async function getManagementServices():Promise<ManagementService[]>{return (await request<{services:ManagementService[]}>('/api/management/services')).services;}
export async function createManagementService(input:{id:string;name:string;description:string;pricingType:'fixed'|'quotation';basePrice:number;currency:'ETB'|'USD';unit:string;durationMinutes:number;image:string;active:boolean}):Promise<void>{await request('/api/management/services',{method:'POST',body:JSON.stringify(input)});}
export async function saveManagementService(service:ManagementService):Promise<void>{await request(`/api/management/services/${encodeURIComponent(service.id)}`,{method:'PATCH',body:JSON.stringify({name:service.name,description:service.description,pricingType:service.pricing_type,basePrice:Number(service.base_price),active:service.is_active})});}
export async function getManagementServicePackages(serviceId:string):Promise<ManagementServicePackage[]>{return (await request<{packages:ManagementServicePackage[]}>(`/api/management/services/${encodeURIComponent(serviceId)}/packages`)).packages;}
export async function createManagementServicePackage(serviceId:string,pkg:Omit<ManagementServicePackage,'id'|'base_price'>&{base_price:number}):Promise<void>{await request(`/api/management/services/${encodeURIComponent(serviceId)}/packages`,{method:'POST',body:JSON.stringify({name:pkg.name,description:pkg.description,basePrice:pkg.base_price,currency:pkg.currency,durationMinutes:pkg.estimated_duration_minutes,active:pkg.is_active})});}
export async function saveManagementServicePackage(serviceId:string,pkg:ManagementServicePackage):Promise<void>{await request(`/api/management/services/${encodeURIComponent(serviceId)}/packages/${encodeURIComponent(pkg.id)}`,{method:'PATCH',body:JSON.stringify({name:pkg.name,description:pkg.description,basePrice:Number(pkg.base_price),currency:pkg.currency,durationMinutes:pkg.estimated_duration_minutes,active:pkg.is_active})});}
