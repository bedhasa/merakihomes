import React, { useState } from 'react';
import { Booking, Worker, Customer, Currency, AdminSubPage } from '@shared/types';
import { MOCK_WORKERS, MOCK_CUSTOMERS, MOCK_SERVICES, ADDIS_NEIGHBORHOODS, ETB_EXCHANGE_RATE } from '@shared/data/mockServices';
import { formatCurrency } from '@shared/utils/formatters';
import { 
  Shield, Users, Briefcase, Calendar, DollarSign, BarChart3, Settings, CheckCircle2, 
  XCircle, AlertTriangle, RefreshCw, Filter, Search, ChevronRight, Phone, MapPin
} from 'lucide-react';
import { CmsWorkspace } from './cms/CmsWorkspace';
import { TrustSafetyWorkspace } from './safety/TrustSafetyWorkspace';
import { LiveOperationsPanel } from './LiveOperationsPanel';

interface AdminViewProps {
  bookings: Booking[];
  currency: Currency;
  onUpdateBookingStatus: (id: string, status: Booking['status']) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  bookings,
  currency,
  onUpdateBookingStatus,
}) => {
  const [activeTab, setActiveTab] = useState<AdminSubPage>('bookings');
  const [workersList, setWorkersList] = useState<Worker[]>(MOCK_WORKERS);
  const [services, setServices] = useState(MOCK_SERVICES);

  const handleUpdatePrice = (serviceId: string, newPriceUSD: number) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, basePrice: newPriceUSD } : s));
  };

  return (
    <div id="admin-portal" className="min-h-screen bg-[#F7F8FA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-24">
      
      {/* Top Header */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-golden-600 dark:text-golden-400" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">Operations</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Addis Ababa</span>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'bookings' ? 'bg-[#102A43] dark:bg-[#102A43] text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Bookings
            </button>
            <button onClick={() => setActiveTab('cms')} className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${activeTab === 'cms' ? 'bg-[#102A43] text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Website CMS</button>
            <button onClick={() => setActiveTab('safety')} className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${activeTab === 'safety' ? 'bg-[#102A43] text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Trust &amp; Safety</button>
            <button
              onClick={() => setActiveTab('workers')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'workers' ? 'bg-[#102A43] dark:bg-[#102A43] text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Workers
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'customers' ? 'bg-[#102A43] dark:bg-[#102A43] text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Customer Directory
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'payments' ? 'bg-[#102A43] dark:bg-[#102A43] text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'reports' ? 'bg-[#102A43] dark:bg-[#102A43] text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Reports & Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'settings' ? 'bg-[#102A43] dark:bg-[#102A43] text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Service pricing
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <LiveOperationsPanel />
        <div role="note" className="rounded-lg border border-[#D4A853]/60 bg-[#D4A853]/15 px-4 py-3 text-sm leading-5 text-[#102A43]">Demo workspace: records shown here are sample data held in browser memory. No identity checks, assignments, payments, or edits are sent to a backend.</div>
        
        {/* Current request overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sample records</p><p className="mt-2 text-2xl font-semibold">{bookings.length}</p><p className="mt-1 text-xs text-slate-500">Not live business data</p></article>
          <article className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Awaiting review</p><p className="mt-2 text-2xl font-semibold">{bookings.filter(b => b.status === 'requested' || b.status === 'awaiting_assignment').length}</p><p className="mt-1 text-xs text-slate-500">Booking requests</p></article>
          <article className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned sample jobs</p><p className="mt-2 text-2xl font-semibold">{bookings.filter(b => ['assigned','confirmed','en_route','arrived','in_progress'].includes(b.status)).length}</p><p className="mt-1 text-xs text-slate-500">No availability check</p></article>
          <article className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payments</p><p className="mt-2 text-lg font-semibold">Not connected</p><p className="mt-1 text-xs text-slate-500">No reconciliation available</p></article>
        </div>
        {/* ==================== BOOKINGS MATRIX ==================== */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Live Operations Dispatch Matrix</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">Manage real-time dispatches across Bole, Kazanchis, Old Airport, and Sarbet.</p>
              </div>
              <span className="text-xs text-golden-700 dark:text-golden-400 font-mono font-bold">{bookings.length} Orders Loaded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
                <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase font-mono border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Neighborhood</th>
                    <th className="p-3">Assigned Worker</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Starting estimate ({currency})</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="p-3 font-mono text-golden-700 dark:text-golden-400 font-bold">{b.id}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{b.customerName}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-200">{b.serviceName}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-200">{b.neighborhood || 'Bole Atlas'}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-200 font-medium flex items-center space-x-2">
                        {b.workerAvatar&&<img src={b.workerAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-300" />}
                        <span>{b.workerName || 'Unassigned'}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-golden-50 dark:bg-golden-950/30 text-golden-900 dark:text-golden-300 border border-golden-200 dark:border-golden-700">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{formatCurrency(b.totalPrice, currency)}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'completed')}
                          disabled={b.status !== 'in_progress'}
                          title={b.status !== 'in_progress' ? 'A request cannot be completed before confirmed work is in progress.' : 'Mark this sample job completed'}
                          className="px-2.5 py-1 bg-emerald-700 enabled:hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-500 text-white rounded text-[11px] font-semibold disabled:cursor-not-allowed"
                        >
                          Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== WORKER KYC QUEUE ==================== */}
        {activeTab === 'workers' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Worker Onboarding & Ethiopian KYC Queue</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">Verify Ethiopian National ID documents and police record status.</p>
              </div>
            </div>

            <div className="space-y-4">
              {workersList.map((w) => (
                <div key={w.id} className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg border border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <img src={w.avatar} alt={w.name} className="w-12 h-12 rounded-full object-cover border-2 border-golden-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-slate-900 dark:text-white">{w.name}</span>
                        <span className="text-xs font-mono text-golden-700 dark:text-golden-400 font-bold">ID: {w.idNumber || 'ETH-ID-882910'}</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{w.phone} • Skills: {w.skills.join(', ')} • Base: {w.neighborhood}</div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                        {w.policeRecordVerified ? '✓ Ethiopian Federal Police Clearance Verified' : '⚠️ Pending Clearance Check'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      w.kycStatus === 'verified' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 'bg-golden-100 dark:bg-golden-900/30 text-golden-900 dark:text-golden-300 border border-golden-200 dark:border-golden-700'
                    }`}>
                      {w.kycStatus}
                    </span>

                    {w.kycStatus === 'pending' && (
                      <button
                        disabled
                        title="Identity verification requires an approved external verification process."
                        className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg cursor-not-allowed"
                      >
                        Verification unavailable
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CUSTOMERS DIRECTORY ==================== */}
        {activeTab === 'customers' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Registered Customer Directory</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_CUSTOMERS.map(c => (
                <div key={c.id} className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg border border-slate-200 dark:border-slate-600 space-y-4">
                  <div className="flex items-center space-x-3">
                    <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover border border-golden-400" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{c.neighborhood}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-slate-700 dark:text-slate-200 pt-2 border-t border-slate-200 dark:border-slate-600">
                    <div>Email: <strong className="text-slate-900 dark:text-white">{c.email}</strong></div>
                    <div>Phone: <strong className="text-slate-900 dark:text-white">{c.phone}</strong></div>
                    <div>Total Spend: <strong className="text-golden-700 dark:text-golden-400">{formatCurrency(c.totalSpentUSD, currency)}</strong></div>
                    <div>Preferred Pay: <strong className="text-emerald-700 dark:text-emerald-400 uppercase">{c.preferredPayment}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== FINANCIALS & TELEBIRR ==================== */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Payment Gateway Reconciliation & Payouts</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg border border-slate-200 dark:border-slate-600 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Telebirr Total Processed</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(24500, currency)}</div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">99.9% Instant settlement</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg border border-slate-200 dark:border-slate-600 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">CBE Birr Processed</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(8200, currency)}</div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Direct bank transfer</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg border border-slate-200 dark:border-slate-600 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Worker Dispatched Payouts</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(28500, currency)}</div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Worker Commission Share 80%</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== REPORTS & ANALYTICS ==================== */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Demand Heatmaps & Performance Analytics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg border border-slate-200 dark:border-slate-600 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Top Demand Neighborhoods in Addis</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>1. Bole Atlas</span><strong className="text-golden-700 dark:text-golden-400">42% of volume</strong></div>
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>2. Old Airport</span><strong className="text-golden-700 dark:text-golden-400">28% of volume</strong></div>
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>3. Kazanchis</span><strong className="text-golden-700 dark:text-golden-400">18% of volume</strong></div>
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>4. CMC / Summit</span><strong className="text-golden-700 dark:text-golden-400">12% of volume</strong></div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg border border-slate-200 dark:border-slate-600 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Customer Rating Distribution</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>5 Stars</span><strong className="text-emerald-700 dark:text-emerald-400">92.4%</strong></div>
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>4 Stars</span><strong className="text-golden-700 dark:text-golden-400">6.1%</strong></div>
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>3 Stars or lower</span><strong className="text-slate-500 dark:text-slate-400">1.5%</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6A2F]">Catalogue � Local draft</p>
            <h2 className="mt-2 text-xl font-semibold text-[#102A43]">Service price estimates</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Sample catalogue values only. Changes stay in this browser session and are not published or used to quote customers.</p>
            <div className="mt-5 divide-y divide-slate-200">
              {services.map((s) => <label key={s.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><span><span className="block text-sm font-medium text-[#102A43]">{s.name}</span><span className="mt-1 block text-xs text-slate-500">Starting estimate � {s.unit}</span></span><span className="flex items-center gap-2"><input aria-label={`${s.name} sample starting estimate`} type="number" min="0" value={s.basePrice} onChange={(e) => handleUpdatePrice(s.id, Math.max(0, parseFloat(e.target.value) || 0))} className="h-11 w-32 rounded-md border border-slate-300 bg-white px-3 text-sm"/><span className="text-sm text-slate-500">USD base</span></span></label>)}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};







