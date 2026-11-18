import React from 'react';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  Clock,
  Home,
  Star,
  ArrowRight,
  Zap,
  MapPin,
  Lock,
  Wrench,
  BadgeCheck,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';

export const Hero: React.FC = () => {
  const { openBookingModal, setActiveView } = useRepair();

  const scrollToSelector = () => {
    document.getElementById('device-selector')?.scrollIntoView({ behavior: 'smooth' });
  };

  const pillars = [
    { icon: Zap, label: 'Fast Service', detail: '60-min express dispatch' },
    { icon: BadgeCheck, label: 'Transparent Pricing', detail: 'No hidden fees' },
    { icon: Wrench, label: 'Certified Technicians', detail: 'Micro-soldering experts' },
    { icon: Home, label: 'Doorstep Repairs', detail: 'We come to you' },
    { icon: ShieldCheck, label: 'Repair Warranty', detail: 'Up to 12 months' },
    { icon: Lock, label: 'Data Privacy', detail: 'Device never leaves your sight' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c70a_1px,transparent_1px),linear-gradient(to_bottom,#0284c70a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <span>Moon Mobile Repair • Certified Device Specialists</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Professional Device Repair by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 underline decoration-blue-300 decoration-wavy decoration-2">
                Moon Mobile
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Book a trusted technician and get your smartphone, tablet, laptop, or electronic
              device expertly serviced with upfront pricing and genuine parts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => openBookingModal()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all cursor-pointer group"
                id="hero-book-repair-btn"
              >
                <Calendar className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" />
                <span>Book a Repair</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={scrollToSelector}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-base shadow-xs hover:border-slate-400 transition-all cursor-pointer"
                id="hero-get-quote-btn"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Get a Free Quote</span>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.label} className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs font-bold text-slate-900">
                        {pillar.label}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500">{pillar.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-5 sm:p-6 relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Live Mobile Dispatch
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.92 / 5.0</span>
                  <span className="text-slate-400 font-normal hidden sm:inline">(2,400+)</span>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop"
                      alt="Certified technician"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/30"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Ramesh Sharma</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.90 •
                      Screen specialist • 5 yrs
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    On the way
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1.5">
                  <span className="flex items-center gap-1 text-blue-600 font-bold">
                    <Zap className="w-3 h-3" /> Travelling to Surry Hills, Sydney
                  </span>
                  <span className="text-slate-700 font-semibold">ETA 18 min</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full w-3/4 rounded-full transition-all" />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Arrives 11:00–01:00
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Sydney, NSW
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">100% Data Privacy Guaranteed</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Never leave your phone with strangers. Your personal photos, WhatsApp, and
                    banking apps never leave your sight.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => openBookingModal()}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Technician</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('track')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <span>Track a Repair</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
