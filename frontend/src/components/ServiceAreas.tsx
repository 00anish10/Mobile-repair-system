import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  Search,
  Clock,
  Users,
  Building2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { SERVICE_AREAS } from '../data/mockData';
import { useRepair } from '../context/RepairContext';

export const ServiceAreas: React.FC = () => {
  const { openBookingModal } = useRepair();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{
    matched: boolean;
    city?: string;
    area?: string;
    responseTime?: number;
    message: string;
  } | null>(null);

  const handleCheckLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();

    // Look for match in cities or hubs
    let matchedArea = SERVICE_AREAS.find((area) =>
      area.city.toLowerCase().includes(query) ||
      area.hubs.some((hub) => hub.toLowerCase().includes(query))
    );

    // Also match popular generic Australian suburbs
    const kathmanduKeywords = ['thamel', 'baneshwor', 'koteshwor', 'boudha', 'jawlakhel', 'patan dhoka', 'kalanki', 'balaju', 'maharajgunj', 'chabahil', 'cbd', 'newroad', 'putalisadak', 'kamladi'];
    const lalitpurKeywords = ['sanepa', 'jhamsikhel', 'pulchowk', 'kupondole', 'lagankhel', 'satdobato', 'imadol', 'harishiddhi', 'balkumari', 'godawari', 'patan', 'cbd'];
    const bhaktapurKeywords = ['suryabinayak', 'thimi', 'kaushaltar', 'gatthaghar', 'changunarayan', 'madhyapur', 'cbd'];
    const pokharaKeywords = ['lakeside', 'mahendrapool', 'prithvi chowk', 'new road', 'chipledhunga', 'baidam', 'damside', 'cbd'];
    const chitwanKeywords = ['narayangarh', 'bharatpur', 'ratnanagar', 'tandi', 'madi', 'khairahani', 'cbd'];
    const biratnagarKeywords = ['main road', 'traffic chowk', 'koshi', 'rani', 'jhorahat', 'dadarbairiya', 'cbd'];
    const butwalKeywords = ['traffic chowk', 'ramnagar', 'deepnagar', 'motipur', 'shankarnagar', 'cbd'];
    const dharanKeywords = ['bhanu chowk', 'putali bazar', 'mahendra chowk', 'chatara', 'vijayapur', 'cbd'];

    if (!matchedArea) {
      if (kathmanduKeywords.some(k => query.includes(k))) {
        matchedArea = SERVICE_AREAS.find(a => a.city === 'Kathmandu');
      } else if (lalitpurKeywords.some(k => query.includes(k))) {
        matchedArea = SERVICE_AREAS.find(a => a.city === 'Lalitpur');
      } else if (bhaktapurKeywords.some(k => query.includes(k))) {
        matchedArea = SERVICE_AREAS.find(a => a.city === 'Bhaktapur');
      } else if (pokharaKeywords.some(k => query.includes(k))) {
        matchedArea = SERVICE_AREAS.find(a => a.city === 'Pokhara');
      } else if (chitwanKeywords.some(k => query.includes(k))) {
        matchedArea = SERVICE_AREAS.find(a => a.city === 'Chitwan');
      } else if (biratnagarKeywords.some(k => query.includes(k))) {
        matchedArea = SERVICE_AREAS.find(a => a.city === 'Biratnagar');
      } else if (butwalKeywords.some(k => query.includes(k))) {
        matchedArea = SERVICE_AREAS.find(a => a.city === 'Butwal');
      } else if (dharanKeywords.some(k => query.includes(k))) {
        matchedArea = SERVICE_AREAS.find(a => a.city === 'Dharan');
      }
    }

    if (matchedArea) {
      setSearchResult({
        matched: true,
        city: matchedArea.city,
        area: searchQuery,
        responseTime: matchedArea.responseTimeMinutes,
        message: `Great news! Doorstep repair service is actively available in '${searchQuery}' with an estimated technician arrival time of ~${matchedArea.responseTimeMinutes} minutes.`,
      });
    } else {
      setSearchResult({
        matched: false,
        message: `We currently serve Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan, Biratnagar, Butwal, and Dharan. While '${searchQuery}' is outside our instant dispatch zone, pickup & delivery service can be scheduled!`,
      });
    }
  };

  return (
    <section id="service-areas" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Expanding Across Major Hubs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Doorstep Service Coverage Areas
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Our mobile repair stations are actively deployed across the following cities with fast turnaround times.
          </p>

          {/* Quick City Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {SERVICE_AREAS.map((a) => (
              <span
                key={a.city}
                className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 shadow-xs flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {a.city}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive Location Availability Checker */}
        <div className="max-w-2xl mx-auto mb-14">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-md">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Check Home Service Availability in Your Area</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your neighborhood, suburb, or landmark (e.g., Sanepa, Thamel, Lakeside, Narayangarh)
            </p>

            <form onSubmit={handleCheckLocation} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your street, neighborhood, or area..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Check Availability
              </button>
            </form>

            {/* Result Box */}
            {searchResult && (
              <div
                className={`mt-4 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 ${
                  searchResult.matched
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                {searchResult.matched ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{searchResult.message}</p>
                  {searchResult.matched && (
                    <button
                      type="button"
                      onClick={() => openBookingModal()}
                      className="mt-2.5 inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-800 text-xs uppercase tracking-wider"
                    >
                      <span>Book technician for this location</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* City Coverage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICE_AREAS.map((area) => (
            <div
              key={area.city}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{area.city}</h4>
                    <p className="text-[11px] text-slate-500">{area.state}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active Hub
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 my-4 bg-slate-50 p-3 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>~{area.responseTimeMinutes}m avg arrival</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>{area.techniciansCount} mobile techs</span>
                </div>
              </div>

              {/* Popular Neighborhoods Served */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key neighborhoods served:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {area.hubs.map((hub) => (
                    <span
                      key={hub}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                    >
                      {hub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fast book in this city */}
              <button
                type="button"
                onClick={() => openBookingModal()}
                className="mt-5 w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white font-bold text-xs border border-slate-200 hover:border-blue-600 transition-colors cursor-pointer text-center"
              >
                Book Doorstep Visit in {area.city}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};