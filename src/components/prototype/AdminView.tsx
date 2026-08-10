import React, { useState } from 'react';
import { Booking, Worker, Customer, Currency, AdminSubPage } from '../../types';
import { MOCK_WORKERS, MOCK_CUSTOMERS, MOCK_SERVICES, ADDIS_NEIGHBORHOODS, ETB_EXCHANGE_RATE } from '../../data/mockServices';
import { formatCurrency } from '../../utils/formatters';
import { 
  Shield, Users, Briefcase, Calendar, DollarSign, BarChart3, Settings, CheckCircle2, 
  XCircle, AlertTriangle, RefreshCw, Filter, Search, ChevronRight, Phone, MapPin, Sliders
} from 'lucide-react';

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
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(1.0);
  const [services, setServices] = useState(MOCK_SERVICES);

  const handleApproveKYC = (workerId: string) => {
    setWorkersList(prev => prev.map(w => w.id === workerId ? { ...w, kycStatus: 'verified', policeRecordVerified: true } : w));
  };

  const handleUpdatePrice = (serviceId: string, newPriceUSD: number) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, basePrice: newPriceUSD } : s));
  };

  return (
    <div id="admin-portal" className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-24">
      
      {/* Top Header */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-golden-600 dark:text-golden-400" />
            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Admin Operations Command Center</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Addis Ababa Hub</span>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'bookings' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Bookings Matrix
            </button>
            <button
              onClick={() => setActiveTab('workers')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'workers' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Worker Approvals & KYC
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'customers' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Customer Directory
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'payments' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Telebirr & Financials
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'reports' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Reports & Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'settings' ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Settings & Surge
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* KPI Metrics Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Gross Booking Value</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(35740, currency)}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">↑ +18.4% this month</span>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Active Dispatches</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{bookings.length + 14} Active</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Avg dispatch: 3.8 mins</span>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Verified Pros Online</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">42 Pros</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">92% Utilization Rate</span>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Telebirr Reconciliation</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">100% Matched</div>
            <span className="text-[10px] text-golden-700 dark:text-golden-400 font-bold">0 pending disputes</span>
          </div>
        </div>

        {/* ==================== BOOKINGS MATRIX ==================== */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-xs">
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
                    <th className="p-3">Amount ({currency})</th>
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
                        <img src={b.workerAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'} alt="Worker" className="w-6 h-6 rounded-full object-cover border border-golden-400" />
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
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold shadow-xs"
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
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Worker Onboarding & Ethiopian KYC Queue</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">Verify Ethiopian National ID documents and police record status.</p>
              </div>
            </div>

            <div className="space-y-4">
              {workersList.map((w) => (
                <div key={w.id} className="bg-slate-50 dark:bg-slate-700 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                        onClick={() => handleApproveKYC(w.id)}
                        className="px-4 py-2 bg-golden-500 hover:bg-golden-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs"
                      >
                        Approve ID & Police Check
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
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Registered Customer Directory</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_CUSTOMERS.map(c => (
                <div key={c.id} className="bg-slate-50 dark:bg-slate-700 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-4">
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
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Payment Gateway Reconciliation & Payouts</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Telebirr Total Processed</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(24500, currency)}</div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">99.9% Instant settlement</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">CBE Birr Processed</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(8200, currency)}</div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Direct bank transfer</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Worker Dispatched Payouts</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(28500, currency)}</div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Worker Commission Share 80%</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== REPORTS & ANALYTICS ==================== */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Demand Heatmaps & Performance Analytics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Top Demand Neighborhoods in Addis</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>1. Bole Atlas</span><strong className="text-golden-700 dark:text-golden-400">42% of volume</strong></div>
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>2. Old Airport</span><strong className="text-golden-700 dark:text-golden-400">28% of volume</strong></div>
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>3. Kazanchis</span><strong className="text-golden-700 dark:text-golden-400">18% of volume</strong></div>
                  <div className="flex justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"><span>4. CMC / Summit</span><strong className="text-golden-700 dark:text-golden-400">12% of volume</strong></div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3">
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

        {/* ==================== SETTINGS & SURGE ==================== */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Dynamic Base Price & Surge Controller</h3>

            <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">City-wide Peak Hour Surge Multiplier</span>
                <span className="text-base font-mono font-bold text-golden-700 dark:text-golden-400">{surgeMultiplier.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={surgeMultiplier}
                onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                className="w-full accent-golden-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {services.map((s) => (
                <div key={s.id} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</div>
                    <div className="text-slate-500 dark:text-slate-400">Base Rate: {formatCurrency(s.basePrice, currency)}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={s.basePrice}
                      onChange={(e) => handleUpdatePrice(s.id, parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-xs text-slate-900 dark:text-white text-center font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
