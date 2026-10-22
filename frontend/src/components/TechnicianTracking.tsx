import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Star,
  Car,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Navigation,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';
import type { BookingStatus } from '../types';

export const TechnicianTracking: React.FC = () => {
  const {
    bookings,
    activeTrackingId,
    setActiveTrackingId,
    getBookingById,
    getTechnicianById,
    updateBookingStatus,
    setActiveView,
  } = useRepair();

  const [searchQuery, setSearchQuery] = useState(() => activeTrackingId || '#REP-2026-00125');

  const currentBooking = useMemo(() => {
    if (activeTrackingId) {
      return getBookingById(activeTrackingId) || bookings[0];
    }
    return bookings[0];
  }, [activeTrackingId, bookings, getBookingById]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = getBookingById(searchQuery);
    if (found) {
      setActiveTrackingId(found.id);
    } else {
      alert(`No booking found with ID "${searchQuery}". Try #REP-2026-00125 or create a new booking!`);
    }
  };

  const technician = getTechnicianById(currentBooking?.technicianId);

  // Status timeline steps
  const timelineSteps: { key: BookingStatus; label: string; desc: string }[] = [
    { key: 'confirmed', label: 'Booking Confirmed', desc: 'Order received & registered in dispatch' },
    { key: 'technician_assigned', label: 'Technician Assigned', desc: 'Certified mobile tech assigned' },
    { key: 'technician_en_route', label: 'Technician On the Way', desc: 'Mobile repair station in transit' },
    { key: 'technician_arrived', label: 'Technician Arrived', desc: 'Technician at your doorstep' },
    { key: 'in_progress', label: 'Repair in Progress', desc: 'Diagnostic & repair underway on-site' },
    { key: 'completed', label: 'Repair Completed', desc: 'Tested, paid & warranty activated' },
  ];

  const getStepIndex = (status: BookingStatus) => {
    return timelineSteps.findIndex((s) => s.key === status);
  };

  const currentStepIdx = currentBooking ? getStepIndex(currentBooking.status) : 0;

  // Simulate timeline advance for interactive demo testing
  const advanceStatus = () => {
    if (!currentBooking) return;
    const nextIdx = (currentStepIdx + 1) % timelineSteps.length;
    const nextStatus = timelineSteps[nextIdx].key;
    updateBookingStatus(currentBooking.id, nextStatus);
  };

  if (!currentBooking) {
    return (
      <div className="py-20 text-center max-w-xl mx-auto px-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900">No Booking Selected</h3>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Enter your Booking ID (e.g. #REP-2026-00125) to track your doorstep repair technician.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="#REP-2026-XXXXX"
            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl"
          >
            Track
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Main Page</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Technician Live Tracking</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live status, estimated arrival, technician credentials, and warranty overview.
            </p>
          </div>

          {/* Quick Lookup Input */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Booking ID..."
                className="pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 w-48 sm:w-60"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Demo Advance Helper Bar */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-blue-900">
            <span className="font-bold">Interactive Demo Control:</span>
            <span>Advance live technician status to test customer experience.</span>
          </div>
          <button
            type="button"
            onClick={advanceStatus}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Advance to Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status Timeline Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Booking Reference
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {currentBooking.id}
                </h2>
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {timelineSteps[currentStepIdx]?.label || currentBooking.status}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400">Scheduled Time</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {currentBooking.scheduledDate} • {currentBooking.scheduledTimeSlot}
              </p>
            </div>
          </div>

          {/* Timeline Visual Progress */}
          <div className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
              {timelineSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step.key} className="flex flex-col items-start md:items-center text-left md:text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all mb-2 ${
                        isPassed
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    <h4
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-blue-600'
                          : isPassed
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 hidden md:block">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Map Radar & Technician Profile */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Map / Navigation Preview Mock */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Navigation className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>Doorstep Dispatch Navigation Radar</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  GPS Live Feed
                </span>
              </div>

              {/* Simulated Map View with Street Grid styling */}
              <div className="relative h-64 sm:h-72 bg-slate-100 overflow-hidden flex items-center justify-center">
                {/* Street Grid SVG pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>

                {/* Simulated route line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d="M 120 180 Q 240 100, 380 140 T 520 80"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="4"
                    strokeDasharray="6 6"
                    className="animate-pulse"
                  />
                </svg>

                {/* Customer Location Pin */}
                <div className="absolute top-16 right-16 sm:right-28 text-center">
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg mx-auto">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="mt-1 inline-block text-[11px] font-extrabold bg-white text-slate-900 px-2 py-0.5 rounded shadow-sm border border-slate-200">
                    Your Doorstep ({currentBooking.city})
                  </span>
                </div>

                {/* Technician Van Pin */}
                <div className="absolute bottom-16 left-16 sm:left-24 text-center">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl ring-4 ring-blue-300/60 mx-auto animate-bounce">
                    <Car className="w-6 h-6" />
                  </div>
                  <span className="mt-1 inline-block text-[11px] font-extrabold bg-blue-900 text-white px-2 py-0.5 rounded shadow-sm">
                    Technician Van (~18m away)
                  </span>
                </div>

                {/* Overlay status tag */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-800">Estimated Doorstep Arrival:</span>
                    <span className="text-blue-700 font-extrabold">18 Minutes</span>
                  </div>
                  <span className="text-slate-500 hidden sm:inline text-[11px]">
                    Vehicle: {technician?.vehicle || 'Mobile Repair Lab #04'}
                  </span>
                </div>
              </div>
            </div>

            {/* Technician Profile Card */}
            {technician && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={technician.photoUrl}
                      alt={technician.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900">
                          {technician.name}
                        </h3>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Certified Specialist
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {technician.rating} ({technician.reviewsCount} reviews)
                        </span>
                        <span>•</span>
                        <span>{technician.experienceYears} Yrs Exp</span>
                        <span>•</span>
                        <span>{technician.completedJobs}+ Repairs</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Vehicle: {technician.vehicle} ({technician.licensePlate})
                      </p>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={`tel:${technician.phone}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Tech</span>
                    </a>
                    <a
                      href={`https://wa.me/${technician.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-3 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Technician Qualifications & Gear:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {technician.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Order Details & Digital Warranty */}
          <div className="lg:col-span-5 space-y-6">
            {/* Appointment & Location Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Repair Summary & Address
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Device Details</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {currentBooking.brand} {currentBooking.model}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Service Requested</span>
                  <span className="font-bold text-blue-700">
                    {currentBooking.problemTitle}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {currentBooking.problemDescription}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Doorstep Service Address</span>
                  <span className="font-bold text-slate-900 block">
                    {currentBooking.address}
                  </span>
                  <span className="text-slate-600">
                    {currentBooking.area}, {currentBooking.city}
                  </span>
                  {currentBooking.landmark && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Landmark: {currentBooking.landmark}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Payment Status</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {currentBooking.paymentMethod.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    currentBooking.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentBooking.paymentStatus === 'paid' ? 'Paid' : 'Pay After Testing'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-blue-600 text-lg">
                    Rs. {currentBooking.estimatedCostRs.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Digital Warranty Vault Certificate */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                    Digital Warranty Certificate
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300">
                  VERIFIED
                </span>
              </div>

              <div className="my-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Coverage:</span>
                  <span className="font-bold">{currentBooking.warrantyDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valid Until:</span>
                  <span className="font-bold text-emerald-400">
                    {currentBooking.warrantyValidUntil || '2027-09-13'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Terms:</span>
                  <span className="text-slate-300">100% Free Doorstep Replacement</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed pt-2 border-t border-white/10">
                If the replaced component fails or suffers manufacturer defect, a technician will arrive at your address and replace it at zero cost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
