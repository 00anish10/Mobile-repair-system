import React from 'react';
import { Home, Briefcase, Truck, Building } from 'lucide-react';
import { useRepair } from '../context/RepairContext';
import { useToast } from '../hooks/useToast';

export const ServiceTypeSelector: React.FC = ({
  serviceType,
  setServiceType,
  currentStep,
  onNext,
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
        Choose Where You Want the Repair Done
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {[{
          type: 'home' as const,
          title: 'Home Service (Most Popular)',
          desc: 'A certified technician visits your house or apartment with all parts & tools.',
          icon: Home,
          badge: 'Zero Travel Needed',
        }, {
          type: 'office' as const,
          title: 'Office / Workplace Service',
          desc: 'Repaired discreetly in a meeting room or your desk without disrupting your workday.',
          icon: Briefcase,
          badge: 'Quiet & Professional',
        }, {
          type: 'pickup' as const,
          title: 'Pickup & Delivery',
          desc: 'Courier safely collects your device with tracking and delivers back repaired.',
          icon: Truck,
          badge: '+$2.50 Transit Insured',
        }, {
          type: 'workshop' as const,
          title: 'Store / Central Workshop',
          desc: 'Drop off directly at our central hub for complex motherboard micro-soldering.',
          icon: Building,
          badge: 'Clean Room Lab',
        }].map((s) => {
          const Icon = s.icon;
          const isSelected = serviceType === s.type;
          return (
            <button
              key={s.type}
              type="button"
              onClick={() => {
                setServiceType(s.type);
                onNext();
              }}
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
                    {s.badge}
                  </span>
                </div>
                <h5 className="font-bold text-sm text-slate-900">{s.title}</h5>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};