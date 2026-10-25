import React, { useState, useEffect } from 'react';
import { MOCK_WORKERS } from '@shared/data/mockServices';
import { Booking, Currency, WorkerSubPage } from '@shared/types';
import { formatCurrency } from '@shared/utils/formatters';
import { 
  Power, DollarSign, MapPin, Navigation, Camera, Upload, CheckCircle2, 
  Calendar, User, Smartphone
} from 'lucide-react';

interface WorkerViewProps {
  bookings: Booking[];
  currency: Currency;
  onUpdateBookingStatus: (id: string, status: Booking['status']) => void;
}

export const WorkerView: React.FC<WorkerViewProps> = ({
  bookings,
  currency,
  onUpdateBookingStatus,
}) => {
  const [worker] = useState(MOCK_WORKERS[0]); // Bethlehem Tesfaye
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<WorkerSubPage>('jobs');
  
  // Active job lifecycle phase
  const [jobPhase, setJobPhase] = useState<'en_route' | 'arrived' | 'in_progress' | 'proof_upload' | 'completed'>('en_route');
  const [timerSeconds, setTimerSeconds] = useState<number>(142); // simulated stopwatch
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [proofPhotoUploaded, setProofPhotoUploaded] = useState<boolean>(false);

  const activeJob = bookings.find(b => b.status === 'in_progress' || b.status === 'assigned') || bookings[0];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobPhase === 'in_progress') {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [jobPhase]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOtp = () => {
    if (otpInput === '8492' || otpInput.length === 4) {
      setJobPhase('in_progress');
      setOtpError('');
    } else {
      setOtpError('Invalid OTP code. Please ask customer for code (Default: 8492)');
    }
  };

  const handleNextPhase = () => {
    if (jobPhase === 'en_route') {
      setJobPhase('arrived');
    } else if (jobPhase === 'in_progress') {
      setJobPhase('proof_upload');
    } else if (jobPhase === 'proof_upload') {
      setJobPhase('completed');
      if (activeJob) onUpdateBookingStatus(activeJob.id, 'completed');
    }
  };

  return (
    <div id="worker-portal" className="min-h-screen bg-[#F7F8FA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-24 pt-6">
      <div className="mx-auto mb-4 max-w-5xl rounded-lg border border-[#D4A853]/60 bg-[#D4A853]/10 px-4 py-3 text-xs leading-5 text-[#102A43]">Worker app preview: this sample profile, job, location, and status are not live operational records.</div>
      
        {/* Mobile Device Container Frame */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden min-h-[650px] flex flex-col justify-between relative">
        
        {/* Mobile App Header */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <img src={worker.avatar} alt={worker.name} className="w-9 h-9 rounded-full border border-golden-400 dark:border-golden-500 object-cover" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                <span>{worker.name}</span>
                <span className="text-golden-700 dark:text-golden-400 font-bold">★ {worker.rating}</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Sample profile � verification not available here</span>
            </div>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              isOnline ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* Mobile App Body Content */}
        <div className="p-5 flex-1 space-y-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">

          {/* Offline State Warning */}
          {!isOnline && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center space-y-3 shadow-xs">
              <Power className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">You Are Offline</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">Toggle your duty switch above to "ONLINE" to receive dispatches in Bole Atlas, Kazanchis & Old Airport.</p>
            </div>
          )}

          {/* ONLINE & JOBS TAB */}
          {isOnline && activeTab === 'jobs' && (
            <div className="space-y-4">
              
              {/* Daily Earnings Summary Widget */}
              <div className="bg-[#102A43] rounded-lg p-4 text-white flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Today's Earnings ({currency})</span>
                  <div className="text-2xl font-black">{formatCurrency(worker.earningsToday, currency)}</div>
                  <span className="text-[10px] font-semibold opacity-90">3 Jobs Completed Today</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-950/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-slate-950" />
                </div>
              </div>

              {/* Active Dispatch Card */}
              {activeJob && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 shadow-xs">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono font-bold">
                      ACTIVE DISPATCH #{activeJob.id}
                    </span>
                    <span className="text-xs font-bold text-golden-700">+80% Payout Share</span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 text-xs">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{activeJob.serviceName}</h3>
                    <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-200">
                      <MapPin className="w-4 h-4 text-golden-600 dark:text-golden-400 shrink-0 mt-0.5" />
                      <span>{activeJob.address} ({activeJob.neighborhood || 'Bole Atlas'})</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-[11px] text-slate-700 dark:text-slate-200">
                      <strong>Customer Note:</strong> "{activeJob.notes || 'Please ring gate code #402.'}"
                    </div>
                  </div>

                  {/* Phase 1: En Route */}
                  {jobPhase === 'en_route' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-300">Distance to Customer:</span>
                        <span className="font-bold text-golden-700 dark:text-golden-400">1.2 km (~8 mins)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 border border-slate-200 dark:border-slate-600">
                          <Navigation className="w-3.5 h-3.5 text-golden-600 dark:text-golden-400" />
                          <span>Google Maps</span>
                        </button>
                        <button onClick={handleNextPhase} className="py-2.5 bg-[#102A43] hover:bg-[#173A58] text-white text-xs font-bold rounded-lg shadow-xs">
                          I Have Arrived
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Phase 2: Arrived & OTP Verification */}
                  {jobPhase === 'arrived' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-golden-300 dark:border-golden-600 text-xs space-y-2">
                        <span className="font-bold text-slate-900 dark:text-white">Ask Customer for 4-Digit OTP Code:</span>
                        <input
                          type="text"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="Enter OTP (Default: 8492)"
                          className="w-full p-2.5 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-center text-slate-900 dark:text-white font-mono tracking-widest font-black text-lg"
                        />
                        {otpError && <span className="text-red-600 dark:text-red-400 text-[10px] block font-bold">{otpError}</span>}
                      </div>
                      <button onClick={handleVerifyOtp} className="w-full py-2.5 bg-[#102A43] hover:bg-[#173A58] text-white text-xs font-bold rounded-lg shadow-xs">
                        Verify OTP & Start Timer
                      </button>
                    </div>
                  )}

                  {/* Phase 3: Service In Progress */}
                  {jobPhase === 'in_progress' && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 text-center space-y-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Service Stopwatch</span>
                        <div className="text-3xl font-mono font-black text-slate-900 dark:text-white">
                          {formatTimer(timerSeconds)}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Target Duration: {activeJob.durationHours} Hours</span>
                      </div>

                      <button onClick={handleNextPhase} className="w-full py-3 bg-[#102A43] hover:bg-[#173A58] text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-2 shadow-xs">
                        <Camera className="w-4 h-4" />
                        <span>Finish Service & Upload Proof</span>
                      </button>
                    </div>
                  )}

                  {/* Phase 4: Proof Photo Upload */}
                  {jobPhase === 'proof_upload' && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-golden-400 dark:border-golden-500 rounded-lg p-6 text-center space-y-2 bg-slate-50 dark:bg-slate-700">
                        <Camera className="w-8 h-8 text-golden-600 dark:text-golden-400 mx-auto" />
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Upload Cleaned Area Proof Photo</div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Required by Meraki quality guarantee before Telebirr payout release.</p>
                        
                        <button
                          onClick={() => setProofPhotoUploaded(true)}
                          className="mt-2 px-3 py-1.5 bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs rounded-lg font-bold inline-flex items-center space-x-1 border border-slate-200 dark:border-slate-500"
                        >
                          <Upload className="w-3.5 h-3.5 text-golden-600 dark:text-golden-400" />
                          <span>{proofPhotoUploaded ? '✓ Photo Captured' : 'Simulate Camera Upload'}</span>
                        </button>
                      </div>

                      <button
                        onClick={handleNextPhase}
                        disabled={!proofPhotoUploaded}
                        className={`w-full py-3 rounded-lg text-xs font-bold transition-all ${
                          proofPhotoUploaded ? 'bg-[#102A43] hover:bg-[#173A58] text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Submit Job & Claim Payout
                      </button>
                    </div>
                  )}

                  {/* Phase 5: Job Completed */}
                  {jobPhase === 'completed' && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                      <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300">Job Completed!</h3>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">Payout of {formatCurrency(activeJob.totalPrice * 0.8, currency)} credited to your Telebirr wallet.</p>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* SCHEDULE TAB */}
          {isOnline && activeTab === 'schedule' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Shift Schedule</h3>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white"><span>Today (Shift A)</span><span>08:00 AM - 05:00 PM</span></div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Assigned Zone: Bole Atlas & Kazanchis</p>
              </div>
            </div>
          )}

          {/* EARNINGS TAB */}
          {isOnline && activeTab === 'earnings' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Telebirr Wallet Payouts</h3>
              <div className="p-4 bg-golden-50 dark:bg-golden-950/30 border border-golden-200 dark:border-golden-700 rounded-lg space-y-2 text-center shadow-xs">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-bold">Available Cashout</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(145, currency)}</div>
                <button className="px-4 py-2 bg-[#102A43] hover:bg-[#173A58] text-white font-bold rounded-lg text-xs">Instant Telebirr Cashout</button>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {isOnline && activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              <div className="text-center space-y-2 bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                <img src={worker.avatar} alt={worker.name} className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-golden-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{worker.name}</h3>
              <span className="text-[10px] text-slate-500 block">Sample profile � verification not available here</span>
              </div>
            </div>
          )}

        </div>

        {/* Mobile App Bottom Navigation Bar */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 grid grid-cols-4 gap-1 text-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`p-2 rounded-lg flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'jobs' ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 font-bold' : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Jobs</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`p-2 rounded-lg flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'schedule' ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 font-bold' : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`p-2 rounded-lg flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'earnings' ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 font-bold' : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Earnings</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-2 rounded-lg flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'profile' ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 font-bold' : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>

      </div>

    </div>
  );
};






