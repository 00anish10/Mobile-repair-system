import React from 'react';
import {
  Check,
  ShieldCheck,
  Clock,
  Info,
  ArrowRight,
  Monitor,
  BatteryCharging,
  PlugZap,
  Droplets,
  Sliders,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';

interface PricingTier {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  startingPriceRs: number;
  avgDurationMins: number;
  warranty: string;
  features: string[];
  popularDevices: string;
  highlighted?: boolean;
}

export const PricingSection: React.FC = () => {
  const { openBookingModal } = useRepair();

  const pricingTiers: PricingTier[] = [
    {
      id: 'screen',
      name: 'Screen Replacement',
      icon: Monitor,
      startingPriceRs: 3499,
      avgDurationMins: 35,
      warranty: '12 Months Warranty',
      highlighted: true,
      features: [
        'OEM Grade OLED & Super AMOLED options',
        'TrueTone & ambient light sensor restored',
        'Precision optical lamination',
        'Complimentary 9H tempered glass protector',
      ],
      popularDevices: 'iPhone 11-16, Galaxy S20-S24, Redmi Note',
    },
    {
      id: 'battery',
      name: 'Battery Replacement',
      icon: BatteryCharging,
      startingPriceRs: 1899,
      avgDurationMins: 25,
      warranty: '6 Months Warranty',
      features: [
        'High-capacity safety-tested cells',
        'Full 100% battery health restored',
        'New anti-heat waterproof gasket seals',
        'Safe eco-friendly battery disposal',
      ],
      popularDevices: 'iPhones, Galaxy S/A Series, MacBooks',
    },
    {
      id: 'charging_port',
      name: 'Charging Port Repair',
      icon: PlugZap,
      startingPriceRs: 1299,
      avgDurationMins: 30,
      warranty: '6 Months Warranty',
      features: [
        'Type-C, Lightning & MagSafe repair',
        'Micro-soldering controller IC inspection',
        'Lint & lint-burn debris deep clearing',
        'Fast-charge protocol amp testing',
      ],
      popularDevices: 'All phones, tablets & laptops',
    },
    {
      id: 'water_damage',
      name: 'Water Damage Repair',
      icon: Droplets,
      startingPriceRs: 2499,
      avgDurationMins: 60,
      warranty: '3 Months Warranty',
      features: [
        'Ultrasonic chemical corrosion bath',
        'Motherboard short-circuit diagnosing',
        'Power IC & capacitor replacement',
        'Emergency data preservation priority',
      ],
      popularDevices: 'Accidental submersion & beverage spills',
    },
    {
      id: 'software',
      name: 'Software & Performance',
      icon: Sliders,
      startingPriceRs: 999,
      avgDurationMins: 45,
      warranty: '30 Days Support',
      features: [
        'Boot loop & stuck logo recovery',
        'OS fresh flashing & backup transfer',
        'Malware & suspicious app eradication',
        'Thermal paste & internal fan clearing',
      ],
      popularDevices: 'iOS, Android, Windows & macOS',
    },
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Upfront & 100% Transparent</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Clear Doorstep Repair Pricing
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            No surprise travel fees, no diagnostic charges if we perform the repair. You only pay after you test and approve the repair.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between p-5 sm:p-6 relative ${
                  tier.highlighted
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                    : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                    Most Requested
                  </span>
                )}

                <div>
                  <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-blue-600">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mb-1">
                    {tier.name}
                  </h3>

                  <div className="my-3">
                    <span className="text-xs text-slate-500 font-medium">Starting from</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      Rs. {tier.startingPriceRs.toLocaleString()}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="space-y-1.5 mb-4">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{tier.warranty}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>~{tier.avgDurationMins} mins on-site</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      openBookingModal({
                        problemId:
                          tier.id === 'screen'
                            ? 'screen_replacement'
                            : tier.id === 'battery'
                            ? 'battery_replacement'
                            : tier.id === 'charging_port'
                            ? 'charging_port'
                            : tier.id === 'water_damage'
                            ? 'water_damage'
                            : 'software_repair',
                      })
                    }
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tier.highlighted
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800'
                    }`}
                  >
                    <span>Book Repair</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Required Mandatory Disclaimer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm font-medium">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>“Final price may vary depending on device model and repair condition.”</span>
          </div>
        </div>
      </div>
    </section>
  );
};
