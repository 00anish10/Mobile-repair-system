import React from 'react';
import { MapPin, Clock, Navigation } from 'lucide-react';
import { SERVICE_AREAS } from '../data/mockData';

interface ServiceLocationProps {
  address: string;
  setAddress: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  area: string;
  setArea: (value: string) => void;
  landmark: string;
  setLandmark: (value: string) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  currentStep: number;
  onNext: () => void;
}

export const ServiceLocation: React.FC<ServiceLocationProps> = ({
  address,
  setAddress,
  city,
  setCity,
  area,
  setArea,
  landmark,
  setLandmark,
  errors,
  setErrors,
  currentStep,
  onNext,
}) => {
  void currentStep;
  void onNext;

  const selectedArea = SERVICE_AREAS.find((item) => item.city === city);
  const clear = (key: string) => setErrors((prev) => ({ ...prev, [key]: '' }));

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
        Service address & location
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="booking-city"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            City *
          </label>
          <select
            id="booking-city"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              clear('city');
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
          >
            {SERVICE_AREAS.map((item) => (
              <option key={item.city} value={item.city}>
                {item.city}
              </option>
            ))}
            <option value="Other Australian location">
              Other Australian location (pickup & delivery)
            </option>
          </select>
          {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label
            htmlFor="booking-area"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Suburb / Area *
          </label>
          <input
            id="booking-area"
            type="text"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              clear('area');
            }}
            placeholder="e.g. Surry Hills / Bondi"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
          />
          {errors.area && <p className="text-xs text-rose-500 mt-1">{errors.area}</p>}
        </div>
      </div>

      {selectedArea && (
        <div className="flex flex-wrap items-center gap-3 bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-900">
          <span className="flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5" /> ~{selectedArea.responseTimeMinutes} min arrival
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <MapPin className="w-3.5 h-3.5" /> {selectedArea.techniciansCount} technicians nearby
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <Navigation className="w-3.5 h-3.5" /> {selectedArea.hubs.slice(0, 3).join(', ')}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label
            htmlFor="booking-address"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Full street address / house / flat no. *
          </label>
          <input
            id="booking-address"
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              clear('address');
            }}
            placeholder="Unit, street number and street name..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
          />
          {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="booking-landmark"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Nearby landmark / instructions for technician
          </label>
          <input
            id="booking-landmark"
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Opposite Big Mart, gate code #42"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
    </div>
  );
};
