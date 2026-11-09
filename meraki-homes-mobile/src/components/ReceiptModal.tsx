import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceiptModal, closeReceiptModal, language, t } = useApp();
  const booking = activeReceiptModal;

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-level-3 border border-[#D9E0E7]">
        {/* Receipt Header */}
        <div className="px-5 py-3.5 border-b border-[#D9E0E7] flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#D4A853]" />
            <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              {language === 'am' ? 'የክፍያ ደረሰኝ' : 'Official ETB Receipt'}
            </span>
          </div>
          <button
            onClick={closeReceiptModal}
            className="w-8 h-8 rounded-full bg-white border border-[#D9E0E7] flex items-center justify-center text-slate-500 hover:text-[#102A43]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Printable/Scannable Voucher Body */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-4 flex-1">
          {/* Brand & TIN */}
          <div className="text-center pb-3 border-b border-dashed border-[#D9E0E7]">
            <div className="w-10 h-10 rounded-xl bg-[#102A43] text-[#D4A853] flex items-center justify-center font-bold text-lg mx-auto mb-1">
              ቤ
            </div>
            <h3 className="text-base font-bold text-[#102A43]">
              Bete Home Services PLC
            </h3>
            <p className="text-[11px] text-[#74777E]">
              Bole Sub-City, Woreda 03, Addis Ababa, Ethiopia
            </p>
            <p className="text-[10px] text-[#74777E] font-mono mt-0.5">
              TIN: 0092837162 • VAT Reg: AA-82910
            </p>
          </div>

          {/* Booking Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs py-1">
            <div>
              <span className="text-[10px] text-[#74777E] block uppercase">Voucher No</span>
              <span className="font-mono font-bold text-[#102A43]">{booking.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#74777E] block uppercase">Date</span>
              <span className="font-medium text-[#102A43]">{booking.date}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-[#74777E] block uppercase">Residence</span>
              <span className="font-medium text-[#102A43]">{booking.address}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="border-t border-b border-[#D9E0E7] py-3 space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-[#102A43]">
              <span>{language === 'am' ? booking.amharicServiceTitle : booking.serviceTitle}</span>
              <span>{booking.serviceFeeETB.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between text-[#74777E] text-[11px]">
              <span>Specialist Travel & Material Transport</span>
              <span>{booking.transportFeeETB} ETB</span>
            </div>
            <div className="flex justify-between text-[#74777E] text-[11px]">
              <span>Ethiopian VAT (15% inclusive)</span>
              <span>Included</span>
            </div>
          </div>

          {/* Total Amount in ETB */}
          <div className="pt-1 flex items-center justify-between text-sm font-bold text-[#102A43]">
            <span>{language === 'am' ? 'አጠቃላይ የተከፈለ' : 'Total Paid'}</span>
            <span className="text-lg text-[#102A43]">{booking.totalPriceETB.toLocaleString()} ETB</span>
          </div>

          {/* Payment Method Badge */}
          <div className="p-3 bg-[#F7F8FA] rounded-2xl border border-[#D9E0E7] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#102A43]">
                {booking.paymentMethod === 'telebirr' ? 'Telebirr Mobile Pay' : booking.paymentMethod === 'cbe' ? 'CBE Birr' : 'Cash Voucher'}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full">
                PAID & VERIFIED
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              Ref: {booking.id.replace('BETE-AA-', 'TX-')}
            </span>
          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] text-[#74777E] block">
              {language === 'am' ? 'ስለመረጡን እናመሰግናለን!' : 'Thank you for choosing Bete Highland Hospitality!'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#D9E0E7] bg-white flex gap-2">
          <button
            onClick={() => {
              window.print();
            }}
            className="flex-1 bg-white border border-[#D9E0E7] text-[#102A43] text-xs font-bold py-2.5 rounded-2xl hover:bg-[#F2F4F6] transition-colors flex items-center justify-center gap-1.5"
          >
            <Printer size={14} />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={closeReceiptModal}
            className="flex-1 bg-[#102A43] text-white text-xs font-bold py-2.5 rounded-2xl hover:bg-[#1b3a5b] transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
