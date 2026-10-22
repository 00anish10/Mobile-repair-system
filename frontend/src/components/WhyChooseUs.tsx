import React from 'react';
import {
  Home,
  Zap,
  BadgePercent,
  Wrench,
  Lock,
  ShieldCheck,
  MapPin,
  Star,
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: Home,
      title: 'Repair at Your Door',
      description: 'Skip traffic jams and crowded repair malls. Our technician comes directly to your home, office, or university.',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      icon: Zap,
      title: 'Fast Response',
      description: 'Same-day appointments and 60-minute emergency dispatches available across major city hubs.',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      icon: BadgePercent,
      title: 'Transparent Pricing',
      description: 'Fixed upfront quotes with zero hidden inspection fees, parking charges, or travel surcharges.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      icon: Wrench,
      title: 'Skilled Technicians',
      description: 'Master technicians certified in micro-soldering, OLED laminations, and logic board troubleshooting.',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      icon: Lock,
      title: 'Safe & Reliable Service',
      description: '100% data privacy. No need to share your phone pin or hand over devices containing personal photos & banking.',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      icon: ShieldCheck,
      title: 'Repair Warranty',
      description: 'Up to 12 months comprehensive doorstep replacement warranty on all replaced screens and genuine components.',
      color: 'text-violet-600 bg-violet-50 border-violet-200',
    },
    {
      icon: MapPin,
      title: 'Local Service',
      description: 'Locally rooted mobile stations across Kathmandu, Lalitpur, Bhaktapur, Pokhara, and Chitwan.',
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      icon: Star,
      title: 'Trusted Professionals',
      description: 'Over 2,400+ satisfied customers with an average 4.92 out of 5 stars verified rating.',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span>The Moon Mobile Advantage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Customers Trust Us for Mobile Repairs
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Built from the ground up for convenience, transparency, and bulletproof device data privacy.
          </p>
        </div>

        {/* 8 Modern Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-6 hover:shadow-md hover:border-blue-300 hover:bg-white transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 group-hover:scale-105 transition-transform ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
