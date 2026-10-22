import React, { useState } from 'react';
import { useRepair } from '../context/RepairContext';
import { useToast } from '../hooks/useToast';

export const ServiceLocation: React.FC = ({
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
  const cities = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Biratnagar', 'Butwal', 'Dharan'];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
        Service Address & Location
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="booking-city" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            City *
          </label>
          <select
            id="booking-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
          >
            <option value="Kathmandu">Kathmandu</option>
            <option value="Lalitpur">Lalitpur</option>
            <option value="Bhaktapur">Bhaktapur</option>
            <option value="Pokhara">Pokhara</option>
            <option value="Chitwan">Chitwan</option>
            <option value="Biratnagar">Biratnagar</option>
            <option value="Butwal">Butwal</option>
            <option value="Dharan">Dharan</option>
          </select>
          {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="booking-area" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Area / Neighborhood *
          </label>
          <input
            id="booking-area"
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Sanepa / Jhamsikhel"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
          />
          {errors.area && <p className="text-xs text-rose-500 mt-1">{errors.area}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="booking-address" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Street Address / House / Flat No. *
          </label>
          <input
            id="booking-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House number, apartment name, street..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
          />
          {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="booking-landmark" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nearby Landmark / Instructions for Technician
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