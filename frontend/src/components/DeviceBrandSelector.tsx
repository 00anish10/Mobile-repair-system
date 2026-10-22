import React, { useState } from 'react';
import { POPULAR_BRANDS } from '../data/mockData';
import type { DeviceType } from '../types';
import { useRepair } from '../context/RepairContext';
import { useToast } from '../hooks/useToast';

export const DeviceBrandSelector: React.FC = ({
  selectedBrand,
  setSelectedBrand,
  selectedModel,
  setSelectedModel,
  deviceCategory,
  setDeviceCategory,
  errors,
  setErrors,
  currentStep,
  onNext,
}) => {
  const currentBrandObj = POPULAR_BRANDS.find((b) => b.name === selectedBrand) || POPULAR_BRANDS[0];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Select Device Brand
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {POPULAR_BRANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedBrand(b.name);
                setDeviceCategory(b.category);
                setSelectedModel(b.models[0]);
                onNext();
              }}
              className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                selectedBrand === b.name
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
        {errors.brand && <p className="text-xs text-rose-500 mt-1">{errors.brand}</p>}
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Select Model ({selectedBrand})
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
          {currentBrandObj.models.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedModel(m)}
              className={`p-2.5 rounded-xl border text-left text-xs font-semibold truncate transition-all cursor-pointer ${
                selectedModel === m
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        {errors.model && <p className="text-xs text-rose-500 mt-1">{errors.model}</p>}
      </div>
    </div>
  );
};