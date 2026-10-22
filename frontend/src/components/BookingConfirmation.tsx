import React from 'react';
import { MapPin } from 'lucide-react';
import { useRepair } from '../context/RepairContext';
import { useToast } from '../hooks/useToast';

export const BookingConfirmation: React.FC = ({
  completedBookingId,
  setCompletedBookingId,
  setCurrentStep,
  closeBookingModal,
  setActiveView,
  deviceCategory,
  selectedBrand,
  selectedModel,
  currentProblemObj,
  scheduledDate,
  scheduledTimeSlot,
  calculatedCost,
}) => {
  const { bookings } = useRepair();

  const activeBookingsCount = bookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  ).length;

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
          Technician Booking Successful!
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
          A certified mobile repair technician has been assigned to visit your location.
        </p>
      </div>

      {/* Generated Booking ID Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 max-w-md mx-auto text-left shadow-lg space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <span className="text-xs text-slate-400 font-medium">Your Booking ID</span>
          <span className="text-base font-mono font-extrabold text-blue-400">
            {completedBookingId || '#REP-2026-00125'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Device</span>
            <span className="font-bold">{selectedBrand} {selectedModel}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Repair</span>
            <span className="font-bold">{currentProblemObj?.name || '---'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Time</span>
            <span className="font-bold">{scheduledDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Est. Cost</span>
            <span className="font-bold text-emerald-400">$ {calculatedCost.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Includes {currentProblemObj?.warrantyMonths || 3} Months Doorstep Warranty Guarantee</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setActiveTrackingId(completedBookingId);
            closeBookingModal();
            setActiveView('track');
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          <span>Track Technician Live</span>
        </button>

        <button
          type="button"
          onClick={() => {
            closeBookingModal();
            setActiveView('customer_dashboard');
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
        >
          <span>Go to My Repairs</span>
        </button>
      </div>
    </div>
  );
};