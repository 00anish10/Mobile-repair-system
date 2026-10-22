import React from 'react';
import {
  CalendarCheck,
  MapPin,
  Car,
  Wrench,
  Award,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';

export const HowItWorks: React.FC = () => {
  const { openBookingModal } = useRepair();

  const steps = [
    {
      num: '01',
      title: 'Book Online',
      desc: 'Tell us what device needs repair, select your issue, and view an instant price quote in seconds.',
      icon: CalendarCheck,
      color: 'bg-blue-600',
    },
    {
      num: '02',
      title: 'Choose Your Location',
      desc: 'Select your home, office, or preferred landmark along with your preferred date and time slot.',
      icon: MapPin,
      color: 'bg-indigo-600',
    },
    {
      num: '03',
      title: 'Technician Arrives',
      desc: 'A qualified, certified technician equipped with specialized mobile repair tooling arrives at your doorstep on time.',
      icon: Car,
      color: 'bg-emerald-600',
    },
    {
      num: '04',
      title: 'Diagnose & Repair',
      desc: 'The technician inspects the device, confirms the issue, and performs the repair right in front of you in 30-45 minutes.',
      icon: Wrench,
      color: 'bg-amber-600',
    },
    {
      num: '05',
      title: 'Pay & Get Warranty',
      desc: 'Test your revived device thoroughly. Pay via Cash or Digital Wallets and receive your official digital warranty certificate.',
      icon: Award,
      color: 'bg-violet-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Seamless 5-Step Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Doorstep Device Repair Works
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Forget battling traffic, finding parking, or leaving your private data behind for days. We bring the repair lab directly to you.
          </p>
        </div>

        {/* 5 Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200/90 relative flex flex-col justify-between hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                <div>
                  {/* Step Number Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-slate-300 group-hover:text-blue-600 transition-colors">
                      {step.num}
                    </span>
                    <div className={`w-10 h-10 rounded-xl ${step.color} text-white flex items-center justify-center shadow-md shadow-slate-400/20`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200/70 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Step {idx + 1} of 5</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Callout: Moon Mobile Repair vs Regular Repair Shop */}
        <div className="mt-14 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                The Modern Repair Standard
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Why customers choose Moon Mobile Repair over physical repair shops:
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Physical shops usually require leaving your phone for 2-4 days, exposing your private photos, passwords, and work chats. With Moon Mobile Repair, your device never leaves your sight.
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-xs">
                <div className="text-blue-400 font-bold text-sm mb-1">Traditional Repair Shop</div>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li className="flex items-center gap-1.5">❌ Fight city traffic twice</li>
                  <li className="flex items-center gap-1.5">❌ Wait 2-5 days for turnaround</li>
                  <li className="flex items-center gap-1.5">❌ Must share phone passcodes</li>
                  <li className="flex items-center gap-1.5">❌ Uncertain part authenticity</li>
                </ul>
              </div>

              <div className="bg-blue-600/30 rounded-xl p-4 border border-blue-400/30 backdrop-blur-xs">
                <div className="text-emerald-400 font-bold text-sm mb-1">Moon Mobile Service</div>
                <ul className="text-xs text-white space-y-1.5">
                  <li className="flex items-center gap-1.5">✅ 0 travel; we come to you</li>
                  <li className="flex items-center gap-1.5">✅ Repaired in 30-45 minutes</li>
                  <li className="flex items-center gap-1.5">✅ No password handover needed</li>
                  <li className="flex items-center gap-1.5">✅ Up to 12 months guarantee</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Certified technicians carry anti-static mats, micro-heat tools, and genuine parts.</span>
            </div>
            <button
              type="button"
              onClick={() => openBookingModal()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
            >
              Experience Home Repair
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
