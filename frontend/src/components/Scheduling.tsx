import React, { useState } from 'react';
import { useRepair } from '../context/RepairContext';
import { useToast } from '../hooks/useToast';

export const Scheduling: React.FC = ({
  scheduledDate,
  setScheduledDate,
  scheduledTimeSlot,
  setScheduledTimeSlot,
  errors,
  setErrors,
  currentStep,
  onNext,
}) => {
  const timeSlots = [
    { slot: '09:00 AM - 11:00 AM', status: 'available' },
    { slot: '11:00 AM - 01:00 PM', status: 'available', fast: true },
    { slot: '02:00 PM - 04:00 PM', status: 'available' },
    { slot: '04:00 PM - 06:00 PM', status: 'filling_fast' },
    { slot: '06:00 PM - 08:00 PM', status: 'available' },
  ];

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Select Preferred Date
        </h4>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            key="today"
            type="button"
            onClick={() => setScheduledDate(today.toISOString().split('T')[0])}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              scheduledDate === today.toISOString().split('T')[0]
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Today ({today.toISOString().split('T')[0]})
          </button>
          <button
            key="tomorrow"
            type="button"
            onClick={() => setScheduledDate(tomorrow.toISOString().split('T')[0])}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              scheduledDate === tomorrow.toISOString().split('T')[0]
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tomorrow ({tomorrow.toISOString().split('T')[0]})
          </button>
          <button
            key="day-after"
            type="button"
            onClick={() => setScheduledDate(dayAfter.toISOString().split('T')[0])}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              scheduledDate === dayAfter.toISOString().split('T')[0]
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            In 2 Days ({dayAfter.toISOString().split('T')[0]})
          </button>
        </div>
        <input
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900"
        />
        {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Choose Available Technician Arrival Slot
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {timeSlots.map((ts) => {
            const isSelected = scheduledTimeSlot === ts.slot;
            return (
              <button
                key={ts.slot}
                type="button"
                onClick={() => setScheduledTimeSlot(ts.slot)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {ts.slot}
                  </span>
                </div>
                {ts.fast && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Express Slot
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.time && <p className="text-xs text-rose-500 mt-1">{errors.time}</p>}
      </div>
    </div>
  );
};