import React from 'react';
import { SkeletonLoader, SkeletonTitle, SkeletonParagraph } from './SkeletonLoader/Loader';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  Clock,
  Home,
  Star,
  ArrowRight,
  Shield,
  Zap,
  MapPin,
  Lock,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';

export const Hero: React.FC = () => {
  const { openBookingModal, setActiveView } = useRepair();

  const scrollToSelector = () => {
    const el = document.getElementById('device-selector');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200">
      {/* Subtle geometric pattern backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c70a_1px,transparent_1px),linear-gradient(to_bottom,#0284c70a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Value Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <span>Moon Mobile Repair • Certified Device Specialists</span>
            </div>

            {/* Main Headline with skeleton loader */}
            <SkeletonTitle size="large" className="mb-4 animate-opacity" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Professional Device Repair by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 underline decoration-blue-300 decoration-wavy decoration-2">
                Moon Mobile
              </span>
            </h1>

            {/* Subheadline with skeleton loader */}
            <SkeletonParagraph lines={3} className="mb-6 animate-opacity" />
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Book a trusted technician and get your smartphone, tablet, laptop, or electronic device expertly serviced with upfront pricing and genuine parts.
            </p>

            {/* Action Buttons */}

            {/* Action Buttons */}
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

            {/* 5 Core Trust Pillars with skeleton loaders */}
            <SkeletonLoader width="100%" height={20} className="animate-opacity" />
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              <SkeletonLoader width="80%" height={14} className="rounded-xl animate-opacity" />
              <div className="hidden sm:block text-[11px] font-semibold text-slate-900">Fast Service</div>
              <SkeletonLoader height={11} className="mt-1 text-[11px] text-slate-500 animate-opacity" />
              <SkeletonLoader width="60%" height={11} className="mt-1 text-[11px] text-slate-500 rounded-auto animate-opacity" />

              <SkeletonLoader width="70%" height={14} className="rounded-xl animate-opacity" />
              <div className="hidden sm:block text-[11px] font-semibold text-slate-900">Transparent Pricing</div>
              <SkeletonLoader height={11} className="mt-1 text-[11px] text-slate-500 animate-opacity" />
              <SkeletonLoader width="40%" height={11} className="mt-1 text-[11px] text-slate-500 rounded-auto animate-opacity" />

              <SkeletonLoader width="80%" height={14} className="rounded-xl animate-opacity" />
              <div className="hidden sm:block text-[11px] font-semibold text-slate-900">Experienced Techs</div>
              <SkeletonLoader height={11} className="mt-1 text-[11px] text-slate-500 animate-opacity" />
              <SkeletonLoader width="50%" height={11} className="mt-1 text-[11px] text-slate-500 rounded-auto animate-opacity" />

              <SkeletonLoader width="75%" height={14} className="rounded-xl animate-opacity" />
              <div className="hidden sm:block text-[11px] font-semibold text-slate-900">Convenient Home Visits</div>
              <SkeletonLoader height={11} className="mt-1 text-[11px] text-slate-500 animate-opacity" />
              <SkeletonLoader width="65%" height={11} className="mt-1 text-[11px] text-slate-500 rounded-auto animate-opacity" />

              <SkeletonLoader width="100%" height={14} className="rounded-xl animate-opacity" />
              <div className="hidden sm:block text-[11px] font-semibold text-slate-900">Warranty on Eligible Repairs</div>
              <SkeletonLoader height={11} className="mt-1 text-[11px] text-slate-500 animate-opacity" />
              <SkeletonLoader width="70%" height={11} className="mt-1 text-[11px] text-slate-500 rounded-auto animate-opacity" />
            </div>
          </div>

          {/* Right Column: Interactive Experience Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-5 sm:p-6 relative">
              {/* Top Banner inside card */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Live Mobile Dispatch
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.92 / 5.0</span>
                  <span className="text-slate-400 font-normal">(2,400+ reviews)</span>
                </div>
              </div>

              {/* Technician In-Transit Skeleton */}
              <SkeletonLoader width="130" height={130} className="rounded-xl mb-4 animate-opacity" />
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <SkeletonLoader width="75%" height={14} className="mb-2 text-sm font-bold text-slate-900 rounded-xl animate-opacity" />
                <SkeletonLoader height={11} className="text-[10px] text-slate-500 animate-opacity" />
                <SkeletonLoader width="100%" height={14} className="text-xs text-slate-500 animate-opacity" />
                <SkeletonLoader width="100%" height={11} className="text-[11px] text-slate-600 mt-1 animate-opacity" />

                {/* Micro Progress Bar */}
                <div className="mt-3 pt-3 border-t border-slate-200/60">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1 text-blue-600 font-bold">
                      <Zap className="w-3 h-3" /> Traveling to Customer Address
                    </span>
                    <span className="text-slate-700">75% Complete</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full w-3/4 rounded-full transition-all"></div>
                  </div>
                </div>
              </div>

              {/* Data Safety & Privacy Callout */}
              <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">100% Data Privacy Guaranteed</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Never leave your phone with strangers. Your personal photos, WhatsApp, and banking apps never leave your sight.
                  </p>
                </div>
              </div>

              {/* Instant Action Row */}
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
                  <span>Track #REP-2026-00125</span>
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
