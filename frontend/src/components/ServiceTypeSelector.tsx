import React from 'react';
import { Home, Briefcase, Truck, Building, CheckCircle2 } from 'lucide-react';
import type { ServiceType } from '../types';

interface ServiceTypeSelectorProps {
  serviceType: ServiceType;
  setServiceType: (value: ServiceType) => void;
  currentStep: number;
  onNext: () => void;
}

const OPTIONS = [
  {
    type: 'home' as const,
    title: 'Home Service',
    desc: 'A certified technician visits your house or apartment with all parts and tools.',
    icon: Home,
    badge: 'Most popular',
  },
  {
    type: 'office' as const,
    title: 'Office / Workplace',
    desc: 'Repaired discreetly at your desk or a meeting room without disrupting work.',
    icon: Briefcase,
    badge: 'Quiet & professional',
  },
  {
    type: 'pickup' as const,
    title: 'Pickup & Delivery',
    desc: 'A courier safely collects your device with tracking and returns it repaired.',
    icon: Truck,
    badge: '+$25 transit insured',
  },
  {
    type: 'workshop' as const,
    title: 'Central Workshop',
    desc: 'Drop off at our hub for complex motherboard micro-soldering in a clean lab.',
    icon: Building,
    badge: 'Clean-room lab',
  },
];

export const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  serviceType,
  setServiceType,
  currentStep,
  onNext,
}) => {
  void currentStep;
  void onNext;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
        Choose where you want the repair done
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = serviceType === option.type;
          return (
            <button
              key={option.type}
              type="button"
              onClick={() => setServiceType(option.type)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {option.badge}
                  </span>
                </div>
                <h5 className="font-bold text-sm text-slate-900">{option.title}</h5>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{option.desc}</p>
              </div>
              {isSelected && (
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
