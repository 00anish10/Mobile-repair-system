import React from 'react';
import { Star, CheckCircle2, Quote, MapPin } from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Verified Customer Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by Over 2,400+ Device Owners
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Read real experiences from everyday customers, executives, and students who booked our doorstep repair technicians.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all relative group"
            >
              <Quote className="w-8 h-8 text-blue-200 absolute top-5 right-5 pointer-events-none" />

              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1.5">5.0</span>
                </div>

                {/* Device & Repair Badge */}
                <div className="mb-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  <span>{review.device}</span>
                  <span>•</span>
                  <span>{review.repairType}</span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              {/* Customer Avatar & Name */}
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatarUrl}
                    alt={review.customerName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      {review.customerName}
                      {review.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {review.location}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {review.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-around gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400">2,400+</div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">Repairs Completed</div>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">4.92 / 5</div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">Average Satisfaction</div>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">98.4%</div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">Same-Day First-Visit Fix Rate</div>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-400">0%</div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">Data Privacy Breaches</div>
          </div>
        </div>
      </div>
    </section>
  );
};
