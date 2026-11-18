import React, { useMemo, useState } from 'react';
import { Smartphone, Tablet, Laptop } from 'lucide-react';
import { POPULAR_BRANDS } from '../data/mockData';
import type { DeviceType } from '../types';

interface DeviceBrandSelectorProps {
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
  deviceCategory: DeviceType;
  setDeviceCategory: (value: DeviceType) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  currentStep: number;
  onNext: () => void;
}

const CATEGORY_TABS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'phones', label: 'Smartphones', icon: Smartphone },
  { id: 'tablets', label: 'Tablets', icon: Tablet },
  { id: 'laptops', label: 'Laptops', icon: Laptop },
];

const categoryGroup = (category: DeviceType): string => {
  if (category === 'tablet') return 'tablets';
  if (category === 'laptop') return 'laptops';
  return 'phones';
};

export const DeviceBrandSelector: React.FC<DeviceBrandSelectorProps> = ({
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
  void currentStep;
  void onNext;
  const [group, setGroup] = useState<string>(() => categoryGroup(deviceCategory));

  const brands = useMemo(
    () => POPULAR_BRANDS.filter((brand) => categoryGroup(brand.category) === group),
    [group]
  );

  const currentBrand =
    POPULAR_BRANDS.find((b) => b.name === selectedBrand) || brands[0] || POPULAR_BRANDS[0];

  const handleGroupChange = (nextGroup: string) => {
    setGroup(nextGroup);
    const firstBrand = POPULAR_BRANDS.find((brand) => categoryGroup(brand.category) === nextGroup);
    if (firstBrand) {
      setSelectedBrand(firstBrand.name);
      setSelectedModel(firstBrand.models[0]);
      setDeviceCategory(firstBrand.category);
      setErrors((prev) => ({ ...prev, brand: '', model: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = group === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleGroupChange(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Select Device Brand
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => {
                setSelectedBrand(brand.name);
                setDeviceCategory(brand.category);
                setSelectedModel(brand.models[0]);
                setErrors((prev) => ({ ...prev, brand: '', model: '' }));
              }}
              className={`p-3 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                selectedBrand === brand.name
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {brand.name}
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
          {currentBrand.models.map((model) => (
            <button
              key={model}
              type="button"
              onClick={() => {
                setSelectedModel(model);
                setErrors((prev) => ({ ...prev, model: '' }));
              }}
              className={`p-2.5 rounded-xl border text-left text-xs font-semibold truncate transition-all cursor-pointer ${
                selectedModel === model
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
              title={model}
            >
              {model}
            </button>
          ))}
        </div>
        {errors.model && <p className="text-xs text-rose-500 mt-1">{errors.model}</p>}
      </div>

      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-900">
        <strong>Tip:</strong> Not seeing your exact model? Choose the closest match — our
        technician will confirm compatibility during the free on-site diagnosis.
      </div>
    </div>
  );
};
