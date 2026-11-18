import React from 'react';
import { Clock, CalendarDays, Sun } from 'lucide-react';

interface SchedulingProps {
  scheduledDate: string;
  setScheduledDate: (value: string) => void;
  scheduledTimeSlot: string;
  setScheduledTimeSlot: (value: string) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  currentStep: number;
  onNext: () => void;
}

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const TIME_SLOTS = [
  { slot: '09:00 AM - 11:00 AM', tag: '' },
  { slot: '11:00 AM - 01:00 PM', tag: 'Express' },
  { slot: '02:00 PM - 04:00 PM', tag: '' },
  { slot: '04:00 PM - 06:00 PM', tag: 'Filling fast' },
  { slot: '06:00 PM - 08:00 PM', tag: '' },
];

export const Scheduling: React.FC<SchedulingProps> = ({
  scheduledDate,
  setScheduledDate,
  scheduledTimeSlot,
  setScheduledTimeSlot,
  errors,
  setErrors,
  currentStep,
  onNext,
}) => {
  void currentStep;
  void onNext;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const quickDates = [
    { key: 'today', label: 'Today', date: localDateString(today) },
    { key: 'tomorrow', label: 'Tomorrow', date: localDateString(tomorrow) },
    { key: 'day-after', label: 'In 2 days', date: localDateString(dayAfter) },
  ];
  const minDate = localDateString(today);

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Select preferred date
        </h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {quickDates.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setScheduledDate(option.date);
                setErrors((prev) => ({ ...prev, date: '' }));
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                scheduledDate === option.date
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {option.label} ({option.date})
            </button>
          ))}
        </div>
        <div className="relative max-w-xs">
          <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="date"
            min={minDate}
            value={scheduledDate}
            onChange={(e) => {
              setScheduledDate(e.target.value);
              setErrors((prev) => ({ ...prev, date: '' }));
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
          />
        </div>
        {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Choose an arrival window
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TIME_SLOTS.map((slot) => {
            const isSelected = scheduledTimeSlot === slot.slot;
            return (
              <button
                key={slot.slot}
                type="button"
                onClick={() => {
                  setScheduledTimeSlot(slot.slot);
                  setErrors((prev) => ({ ...prev, time: '' }));
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{slot.slot}</span>
                </div>
                {slot.tag && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      slot.tag === 'Filling fast'
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-emerald-700 bg-emerald-50'
                    }`}
                  >
                    {slot.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.time && <p className="text-xs text-rose-500 mt-1">{errors.time}</p>}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
        <Sun className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          Your technician will call 15–30 minutes before arrival. Rescheduling is free up to
          2 hours before your slot.
        </span>
      </div>
    </div>
  );
};
