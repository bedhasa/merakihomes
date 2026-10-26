'use client';

import React,{useEffect,useState} from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogIn, Moon, Sun } from 'lucide-react';
import { Currency, Booking } from '@shared/types';
import { getServices, postBooking, BookingRequestPayload } from '@shared/api';
import { MarketingView } from './website/MarketingView';
import { CustomerAuthPage, CustomerAccountPage } from './booking/CustomerAccountPage';
import { RequestStatusLookup } from './booking/RequestStatusLookup';
import { useTheme } from './contexts/ThemeContext';

const CustomerView = dynamic(() => import('./booking/CustomerView').then(module => module.CustomerView), {
  ssr: false,
  loading: () => <div role="status" className="mx-auto max-w-5xl px-5 py-12 text-sm text-slate-600">Loading booking experience…</div>,
});

const pageByPath:Record<string,string>={'/':'home','/about':'about','/services':'services','/team':'team','/trust':'trust','/contact':'contact','/faq':'faq','/blog':'blog'};
const pathByPage:Record<string,string>={home:'/',about:'/about',services:'/services',team:'/team',trust:'/trust',contact:'/contact',faq:'/faq',blog:'/blog'};

export default function App({initialPath='/',initialQuery=''}:{initialPath?:string;initialQuery?:string}){
 const router=useRouter();const[currency]=useState<Currency>('ETB');const[services,setServices]=useState<Awaited<ReturnType<typeof getServices>>>([]);const[servicesState,setServicesState]=useState<'loading'|'ready'|'error'>('loading');const[bookings,setBookings]=useState<Booking[]>([]);const[bookingSelection,setBookingSelection]=useState(()=>{const query=new URLSearchParams(initialQuery);return{serviceId:query.get('service'),packageId:query.get('package')}});const[path,setPath]=useState(initialPath);const{isDarkMode,toggleTheme}=useTheme();
 useEffect(()=>{let live=true;getServices().then(s=>{if(live){setServices(s);setServicesState('ready')}}).catch(()=>{if(live)setServicesState('error')});return()=>{live=false}},[]);
 useEffect(()=>{setPath(initialPath);const query=new URLSearchParams(initialQuery);setBookingSelection({serviceId:query.get('service'),packageId:query.get('package')});},[initialPath,initialQuery]);
 const navigate=(next:string)=>{const target=new URL(next,window.location.origin);const route=`${target.pathname}${target.search}${target.hash}`;router.push(route);setPath(target.pathname);setBookingSelection({serviceId:target.searchParams.get('service'),packageId:target.searchParams.get('package')});window.scrollTo({top:0,behavior:'smooth'});};
 const submitBooking=async(payload:BookingRequestPayload,key:string)=>{const created=await postBooking(payload,key);setBookings(prev=>[created,...prev.filter(x=>x.id!==created.id)]);return created;};
 const serviceRoute=path.match(/^\/services\/([^/]+)$/);const bookingRoute=path.match(/^\/booking\/([^/]+)$/);const marketingPage=serviceRoute?'service-detail':pageByPath[path];
 const nonMarketing=Boolean(marketingPage===undefined);
 const Header=nonMarketing?<header id="app-nav" className="sticky top-0 z-30 border-b border-white/10 bg-[#102A43] text-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3"><button onClick={()=>navigate('/')} className="flex items-center gap-2 text-left"><ArrowLeft size={16}/><span><strong className="block text-sm tracking-[.08em]">MERAKI <i className="not-italic text-[#D4A853]">HOMES</i></strong><small className="text-[10px] text-white/65">Customer portal</small></span></button><nav className="flex items-center gap-2"><a href="/services" className="hidden px-3 py-2 text-sm text-white/80 hover:text-white sm:inline">Services</a><a href="/track-booking" className="hidden px-3 py-2 text-sm text-white/80 hover:text-white sm:inline">Track request</a><a href="/login" aria-label="Customer sign in" className="inline-flex min-h-10 items-center gap-2 rounded-sm px-3 text-sm text-white/80 hover:bg-white/10"><LogIn size={16}/><span className="hidden sm:inline">Sign in</span></a><button onClick={toggleTheme} aria-label={isDarkMode?'Use light theme':'Use dark theme'} className="rounded-sm p-2 text-white/80 hover:bg-white/10">{isDarkMode?<Sun size={18}/>:<Moon size={18}/>}</button></nav></div></header>:null;
 if(marketingPage)return <MarketingView currency={currency} services={services} servicesState={servicesState} selectedServiceId={serviceRoute?decodeURIComponent(serviceRoute[1]):undefined} onServiceDetails={id=>navigate(`/services/${encodeURIComponent(id)}`)} onBookService={(id,packageId)=>navigate(id?`/booking?service=${encodeURIComponent(id)}${packageId?`&package=${encodeURIComponent(packageId)}`:''}`:'/booking')} initialSubPage={marketingPage} onSubPageChange={page=>navigate(pathByPage[page]||'/')}/>;
 let content:React.ReactNode;
 if(path==='/booking')content=<CustomerView bookings={bookings} currency={currency} services={services} servicesState={servicesState} onSubmitRequest={submitBooking} onCreateBooking={()=>{}} onUpdateBookingStatus={()=>{}} presetServiceId={bookingSelection.serviceId} presetPackageId={bookingSelection.packageId} initialTab="book" onViewBookings={()=>navigate('/track-booking')}/>;
 else if(path==='/track-booking'||bookingRoute)content=<RequestStatusLookup initialReference={bookingRoute?decodeURIComponent(bookingRoute[1]):''}/>;
 else if(path==='/login'||path==='/register')content=<CustomerAuthPage mode={path==='/register'?'register':'login'} onSignedIn={()=>navigate('/my-account')}/>;
 else if(path==='/my-account'||path==='/my-account/bookings')content=<CustomerAccountPage bookings={path.endsWith('/bookings')} onSignOut={()=>navigate('/login')}/>;
 else content=<main className="mx-auto max-w-2xl px-5 py-16"><h1 className="text-2xl font-semibold text-[#102A43]">Page not found</h1><a className="mt-4 inline-block underline" href="/">Return home</a></main>;
 return <div className="min-h-screen bg-[#F7F8FA] text-[#334155]">{Header}<main>{content}</main><footer className="mt-10 border-t border-slate-200 bg-white px-5 py-5 text-center text-xs text-slate-500"><a href="http://localhost:3004/login" className="text-[#102A43] underline">Staff sign in</a><span className="mx-3" aria-hidden="true">·</span><a href="/" className="text-[#102A43] underline">Meraki Homes</a></footer></div>;
}
