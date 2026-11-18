import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Copy,
  Check,
  Download,
  CalendarDays,
  Wrench,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';
import type { RepairIssue } from '../types';

interface BookingConfirmationProps {
  completedBookingId: string | null;
  closeBookingModal: () => void;
  selectedBrand: string;
  selectedModel: string;
  currentProblemObj: RepairIssue;
  scheduledDate: string;
  scheduledTimeSlot: string;
  calculatedCost: number;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  completedBookingId,
  closeBookingModal,
  selectedBrand,
  selectedModel,
  currentProblemObj,
  scheduledDate,
  scheduledTimeSlot,
  calculatedCost,
}) => {
  const { setActiveTrackingId, setActiveView } = useRepair();
  const [copied, setCopied] = useState(false);

  const bookingReference = completedBookingId || '#REP-2026-00125';

  const handleTrack = () => {
    setActiveTrackingId(bookingReference);
    closeBookingModal();
    setActiveView('track');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const receipt = [
      'MOON MOBILE REPAIR - BOOKING RECEIPT',
      '====================================',
      `Booking ID: ${bookingReference}`,
      `Device:     ${selectedBrand} ${selectedModel}`,
      `Repair:     ${currentProblemObj.name}`,
      `Date:       ${scheduledDate}`,
      `Time slot:  ${scheduledTimeSlot}`,
      `Estimate:   $${calculatedCost.toLocaleString()}`,
      `Warranty:   ${currentProblemObj.warrantyMonths} months`,
      '',
      'Pay after your repair is tested and approved.',
      'Track live: /track',
    ].join('\n');

    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bookingReference.replace('#', '')}-receipt.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-center py-4 space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Appointment Confirmed
        </span>
        <h4 className="text-2xl font-extrabold text-slate-900 mt-2">
          Technician booking successful!
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
          A certified mobile repair technician has been assigned to visit your location.
        </p>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-5 max-w-md mx-auto text-left shadow-lg space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <span className="text-xs text-slate-400 font-medium">Your booking ID</span>
          <div className="flex items-center gap-2">
            <span className="text-base font-mono font-extrabold text-blue-400">
              {bookingReference}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Copy booking ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Device</span>
            <span className="font-bold">
              {selectedBrand} {selectedModel}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Repair</span>
            <span className="font-bold">{currentProblemObj.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Date</span>
            <span className="font-bold">{scheduledDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Est. cost</span>
            <span className="font-bold text-emerald-400">
              ${calculatedCost.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>
            Includes {currentProblemObj.warrantyMonths} months doorstep warranty guarantee
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5" /> {scheduledTimeSlot}
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          <Wrench className="w-3.5 h-3.5" /> ~{currentProblemObj.estimatedMinutes} min on-site
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleTrack}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          <span>Track technician live</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download receipt</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          closeBookingModal();
          setActiveView('customer_dashboard');
        }}
        className="text-xs font-bold text-slate-500 hover:text-blue-600"
      >
        Go to My Repairs →
      </button>
    </div>
  );
};
