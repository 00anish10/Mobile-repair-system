import React from 'react';
import {
  Phone,
  Mail,
  Clock,
  ArrowUp,
  Sparkles,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';
import { MoonLogo } from './MoonLogo';

export const Footer: React.FC = () => {
  const { openBookingModal, setActiveView } = useRepair();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      {/* Top CTA Banner */}
      <div className="border-b border-slate-800 py-12 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>60-Minute Rapid Mobile Dispatch</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Broken Smartphone or Device? We Fix It Fast.
              </h2>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Book our certified mobile technician today. 100% upfront pricing, full data privacy, and up to 12 months warranty on all replacement parts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => openBookingModal()}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                Book Mobile Repair
              </button>
              <a
                href="tel:+9779801234567"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-blue-700/60 hover:bg-blue-700 border border-white/20 text-white font-bold text-sm sm:text-base transition-colors"
              >
                Call Hotline: +977-980-123-4567
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl group cursor-pointer"
              title="Go to Home"
              aria-label="MoonMobile Home"
            >
              <MoonLogo size="lg" variant="dark" subtitle="Premier Mobile Phone & Tech Repair in Nepal" />
            </button>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier on-demand mobile phone, smartphone, iPad, and laptop repair service. Fast, certified diagnosis and component replacement with warranty.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <a href="tel:+97714500900" className="hover:text-white font-semibold">
                  +977-1-4500900 (Emergency Hotline)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <a href="tel:+9779801234567" className="hover:text-white font-semibold">
                  +977-980-123-4567 (Mobile Hotline)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:support@moonmobilerepair.com" className="hover:text-white">
                  support@moonmobilerepair.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Operating Hours: 7:00 AM – 10:00 PM (7 Days a Week)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Repair Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#services" className="hover:text-white transition-colors">Screen Replacement</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Battery Replacement</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">iPhone & iPad Repairs</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">MacBook & Laptop Servicing</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Water Damage Ultrasonic Fix</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Charging Port & Micro-soldering</a></li>
            </ul>
          </div>

          {/* Service Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Service Areas
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="text-slate-300">Kathmandu</span> (45-min dispatch)</li>
              <li><span className="text-slate-300">Lalitpur</span> (Sanepa / Jhamsikhel)</li>
              <li><span className="text-slate-300">Bhaktapur</span> (Thimi & Suryabinayak)</li>
              <li><span className="text-slate-300">Pokhara</span> (Lakeside & Central)</li>
              <li><span className="text-slate-300">Chitwan</span> (Narayangarh & Bharatpur)</li>
            </ul>
          </div>

          {/* Customer & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Customer Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('track')}
                  className="hover:text-white transition-colors text-left"
                >
                  Track Live Technician
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('customer_dashboard')}
                  className="hover:text-white transition-colors text-left"
                >
                  My Repairs & Invoices
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveView('admin_dashboard')}
                  className="hover:text-white transition-colors text-left"
                >
                  Technician Admin Portal
                </button>
              </li>
              <li><a href="#faq" className="hover:text-white transition-colors">Warranty Terms & Claim</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Data Privacy Guarantee</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Moon Mobile Repair Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
