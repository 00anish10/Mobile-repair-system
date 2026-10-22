import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Home,
  Briefcase,
  Truck,
  Sparkles,
} from 'lucide-react';
import { POPULAR_BRANDS, REPAIR_ISSUES } from '../data/mockData';
import { useRepair } from '../context/RepairContext';
import type { ServiceType } from '../types';

export const DeviceSelector: React.FC = () => {
  const { openBookingModal } = useRepair();

  const [selectedBrandName, setSelectedBrandName] = useState('Apple');
  const [selectedModel, setSelectedModel] = useState('iPhone 15 Pro');
  const [selectedProblemId, setSelectedProblemId] = useState('screen_replacement');
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('home');
  const [selectedCity, setSelectedCity] = useState('Sydney');

  // Find brand object
  const currentBrand = useMemo(() => {
    return POPULAR_BRANDS.find((b) => b.name === selectedBrandName) || POPULAR_BRANDS[0];
  }, [selectedBrandName]);

  // Handle brand change
  const handleBrandChange = (brandName: string) => {
    setSelectedBrandName(brandName);
    const newBrand = POPULAR_BRANDS.find((b) => b.name === brandName);
    if (newBrand && newBrand.models.length > 0) {
      setSelectedModel(newBrand.models[0]);
    }
  };

  // Find problem object
  const currentProblem = useMemo(() => {
    return REPAIR_ISSUES.find((p) => p.id === selectedProblemId) || REPAIR_ISSUES[0];
  }, [selectedProblemId]);

  // Calculate dynamic price based on model tier and service
  const calculatedPrice = useMemo(() => {
    let price = currentProblem.basePriceRs;
    // Premium model multiplier
    if (selectedModel.includes('Pro Max') || selectedModel.includes('Ultra') || selectedModel.includes('Fold') || selectedModel.includes('MacBook Pro')) {
      price = Math.round(price * 1.6);
    } else if (selectedModel.includes('Pro') || selectedModel.includes('XPS') || selectedModel.includes('Air')) {
      price = Math.round(price * 1.3);
    }

    if (selectedServiceType === 'pickup') {
      price += 25; // nominal courier insurance
    }

    return price;
  }, [currentProblem, selectedModel, selectedServiceType]);

  const handleContinueBooking = () => {
    openBookingModal({
      brand: selectedBrandName,
      model: selectedModel,
      problemId: selectedProblemId,
      serviceType: selectedServiceType,
    });
  };

  return (
    <section id="device-selector" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Repair Selector</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Calculate Your Instant Repair Estimate
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Choose your device brand, model, issue, and service location to view guaranteed transparent pricing before booking.
          </p>
        </div>

        {/* The Interactive Selector Matrix */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Steps / Inputs Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Brand Selection */}
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Step 1: Select Brand
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {POPULAR_BRANDS.slice(0, 8).map((brand) => {
                    const isSelected = brand.name === selectedBrandName;
                    return (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => handleBrandChange(brand.name)}
                        className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {brand.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Model Selection */}
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Step 2: Select Model ({selectedBrandName})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {currentBrand.models.map((model) => {
                    const isSelected = model === selectedModel;
                    return (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setSelectedModel(model)}
                        className={`p-2.5 rounded-xl text-left text-xs font-semibold transition-all border truncate cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                        title={model}
                      >
                        {model}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Problem Selection */}
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Step 3: Select Problem / Repair Needed
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {REPAIR_ISSUES.map((issue) => {
                    const isSelected = issue.id === selectedProblemId;
                    return (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() => setSelectedProblemId(issue.id)}
                        className={`p-3 rounded-xl text-left transition-all border flex items-start justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900">
                            {issue.name}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {issue.description}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-blue-700 shrink-0">
                          $ {issue.basePriceRs.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Service Location & Delivery Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Service Location
                  </span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="Kathmandu">Kathmandu (40m Express Dispatch)</option>
                    <option value="Lalitpur">Lalitpur (35m Express Dispatch)</option>
                    <option value="Bhaktapur">Bhaktapur (45m Express Dispatch)</option>
                    <option value="Pokhara">Pokhara (50m Express Dispatch)</option>
                    <option value="Chitwan">Chitwan (55m Express Dispatch)</option>
                    <option value="Biratnagar">Biratnagar (60m Express Dispatch)</option>
                    <option value="Butwal">Butwal (50m Express Dispatch)</option>
                    <option value="Dharan">Dharan (55m Express Dispatch)</option>
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Repair Service Mode
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedServiceType('home')}
                      className={`p-2 rounded-xl text-center text-xs font-bold border transition-colors flex flex-col items-center gap-1 ${
                        selectedServiceType === 'home'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Home</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedServiceType('office')}
                      className={`p-2 rounded-xl text-center text-xs font-bold border transition-colors flex flex-col items-center gap-1 ${
                        selectedServiceType === 'office'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Office</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedServiceType('pickup')}
                      className={`p-2 rounded-xl text-center text-xs font-bold border transition-colors flex flex-col items-center gap-1 ${
                        selectedServiceType === 'pickup'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Pickup</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Quote Summary Column (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Live Price Estimate
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Fixed Rate Quote
                </span>
              </div>

              {/* Selected Config Breadcrumb */}
              <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Device:</span>
                  <span className="font-bold text-slate-900">{selectedBrandName} {selectedModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Issue:</span>
                  <span className="font-bold text-slate-900">{currentProblem.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-bold text-blue-700 capitalize">{selectedServiceType} Service</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-bold text-slate-900">{selectedCity}</span>
                </div>
              </div>

              {/* Big Price Display */}
              <div className="text-center py-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Estimated Repair Cost
                </p>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                  $ {calculatedPrice.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Includes doorstep visit, genuine part & labor
                </p>
              </div>

              {/* Inclusions checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{currentProblem.warrantyMonths}-Month Replacement Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Certified Mobile Technician Arrives at Door</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Est. repair duration: ~{currentProblem.estimatedMinutes} mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pay after testing device to satisfaction</span>
                </div>
              </div>

              {/* Continue Booking Button */}
              <button
                type="button"
                onClick={handleContinueBooking}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                id="device-selector-continue-btn"
              >
                <span>Continue Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Final price may vary slightly depending on exact model and physical board condition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
