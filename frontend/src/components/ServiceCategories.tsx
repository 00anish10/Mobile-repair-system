import React from 'react';
import {
  Smartphone,
  Apple,
  Cpu,
  Tablet,
  Laptop,
  BatteryCharging,
  Monitor,
  PlugZap,
  Droplets,
  Sliders,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../data/mockData';
import { useRepair } from '../context/RepairContext';

// Map icon string to Lucide component
const renderIcon = (iconName: string) => {
  switch (iconName) {
    case 'Smartphone':
      return <Smartphone className="w-6 h-6 text-blue-600" />;
    case 'Apple':
      return <Apple className="w-6 h-6 text-slate-900" />;
    case 'Cpu':
      return <Cpu className="w-6 h-6 text-emerald-600" />;
    case 'Tablet':
      return <Tablet className="w-6 h-6 text-indigo-600" />;
    case 'Laptop':
      return <Laptop className="w-6 h-6 text-cyan-600" />;
    case 'BatteryCharging':
      return <BatteryCharging className="w-6 h-6 text-amber-500" />;
    case 'Monitor':
      return <Monitor className="w-6 h-6 text-blue-500" />;
    case 'PlugZap':
      return <PlugZap className="w-6 h-6 text-violet-600" />;
    case 'Droplets':
      return <Droplets className="w-6 h-6 text-sky-500" />;
    case 'Sliders':
      return <Sliders className="w-6 h-6 text-teal-600" />;
    default:
      return <Smartphone className="w-6 h-6 text-blue-600" />;
  }
};

export const ServiceCategories: React.FC = () => {
  const { openBookingModal } = useRepair();

  const handleBookCategory = (catId: string) => {
    let problemId = 'screen_replacement';
    let brand = 'Apple';
    if (catId.includes('battery')) problemId = 'battery_replacement';
    if (catId.includes('charging')) problemId = 'charging_port';
    if (catId.includes('water')) problemId = 'water_damage';
    if (catId.includes('software')) problemId = 'software_repair';
    if (catId.includes('laptop')) brand = 'Apple MacBook';
    if (catId.includes('android')) brand = 'Samsung';

    openBookingModal({ problemId, brand });
  };

  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
              <span>Comprehensive Doorstep Solutions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Professional Repair Services
            </h2>
            <p className="mt-2 text-slate-600 text-base max-w-2xl">
              From flagship OLED screens to intricate micro-soldering, our mobile lab technicians carry genuine parts directly to your living room or workspace.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All repairs backed by up to 12 months guarantee</span>
          </div>
        </div>

        {/* 10 Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {SERVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Icon & Starting Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {renderIcon(cat.icon)}
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    From Rs. {cat.startingPriceRs.toLocaleString()}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {cat.description}
                </p>

                {/* Warranty Badge */}
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 mb-4 bg-emerald-50/70 px-2 py-1 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{cat.warrantyText}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleBookCategory(cat.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white font-bold text-xs border border-slate-200 hover:border-blue-600 transition-all cursor-pointer group-hover:bg-blue-600 group-hover:text-white"
                id={`book-service-${cat.id}`}
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
