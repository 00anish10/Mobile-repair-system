import React, { useState } from 'react';
import {
  User,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Bell,
  Wrench,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';

export const CustomerDashboard: React.FC = () => {
  const {
    bookings,
    setActiveTrackingId,
    setActiveView,
    openBookingModal,
    userEmail,
    setUserEmail,
  } = useRepair();

  const [activeTab, setActiveTab] = useState<
    'bookings' | 'upcoming' | 'history' | 'warranties' | 'addresses' | 'profile' | 'notifications'
  >('bookings');

  // Customer Profile state
  const [name, setName] = useState('Anish Shrestha');
  const [phone, setPhone] = useState('+977 9841556677');
  const [email, setEmail] = useState(userEmail || 'anishshrestha2007@gmail.com');
  const [profileSaved, setProfileSaved] = useState(false);

  // Saved addresses
  const [savedAddresses] = useState([
    {
      id: 'addr-1',
      title: 'Home (Sanepa)',
      address: 'House 42, Sanepa Heights, Ward 2',
      area: 'Sanepa / Jhamsikhel',
      city: 'Lalitpur',
      landmark: 'Near British School Gate',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'Workplace (Tech Hub)',
      address: 'Floor 3, Trade Tower, Thapathali',
      area: 'Thapathali',
      city: 'Kathmandu',
      landmark: 'Opposite Norvic Hospital',
      isDefault: false,
    },
  ]);

  // Notifications
  const notifications = [
    {
      id: 'notif-1',
      title: 'Technician En Route',
      message: 'Technician Bikram Shrestha is traveling to your Sanepa address. Estimated arrival: 18 mins.',
      time: '10 minutes ago',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'Booking Confirmed (#REP-2026-00125)',
      message: 'Your iPhone 15 Pro screen replacement appointment has been scheduled.',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 'notif-3',
      title: 'Warranty Activated (#REP-2026-00118)',
      message: '6-Month doorstep battery warranty active until March 2027.',
      time: '2 days ago',
      unread: false,
    },
  ];

  const upcomingRepairs = bookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  );

  const completedRepairs = bookings.filter((b) => b.status === 'completed');

  const handleTrackBooking = (bookingId: string) => {
    setActiveTrackingId(bookingId);
    setActiveView('track');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserEmail(email);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-blue-500/20">
              {name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Welcome back, {name}!
                </h1>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {email} • {phone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openBookingModal()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Doorstep Repair</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Nav (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
            {[
              { id: 'bookings', label: 'All Bookings', icon: Calendar, badge: bookings.length },
              { id: 'upcoming', label: 'Upcoming Repairs', icon: Clock, badge: upcomingRepairs.length },
              { id: 'history', label: 'Repair History', icon: CheckCircle2, badge: completedRepairs.length },
              { id: 'warranties', label: 'Warranty Vault', icon: ShieldCheck, badge: bookings.length },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin, badge: savedAddresses.length },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: 2 },
              { id: 'profile', label: 'Profile Settings', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as 'bookings' | 'upcoming' | 'history' | 'warranties' | 'addresses' | 'profile' | 'notifications')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Main Content (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* TAB: ALL BOOKINGS / UPCOMING */}
            {(activeTab === 'bookings' || activeTab === 'upcoming') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    {activeTab === 'upcoming' ? 'Active & Upcoming Repairs' : 'My Bookings'}
                  </h2>
                  <span className="text-xs text-slate-500">
                    Showing {(activeTab === 'upcoming' ? upcomingRepairs : bookings).length} records
                  </span>
                </div>

                {(activeTab === 'upcoming' ? upcomingRepairs : bookings).length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="font-bold text-slate-800 text-sm">No bookings in this tab</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Book your first doorstep technician appointment today.</p>
                    <button
                      type="button"
                      onClick={() => openBookingModal()}
                      className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                    >
                      Book Repair Now
                    </button>
                  </div>
                ) : (
                  (activeTab === 'upcoming' ? upcomingRepairs : bookings).map((b) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-slate-900">
                            {b.id}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            b.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900">
                          {b.brand} {b.model} • <span className="text-blue-600">{b.problemTitle}</span>
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span>📅 {b.scheduledDate} ({b.scheduledTimeSlot})</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" /> {b.area}, {b.city}
                          </span>
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span className="text-base font-extrabold text-slate-900">
                          Rs. {b.estimatedCostRs.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTrackBooking(b.id)}
                          className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Track Technician</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: REPAIR HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Completed Repair History</h2>
                {completedRepairs.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-500">{b.id}</span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        ✓ Repair Completed & Tested
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {b.brand} {b.model} - {b.problemTitle}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {b.technicianNotes || 'Replaced with genuine OEM component.'}
                        </p>
                      </div>
                      <span className="font-extrabold text-slate-900">
                        Rs. {b.estimatedCostRs.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        Warranty valid until {b.warrantyValidUntil}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTrackBooking(b.id)}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        View Digital Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: WARRANTY VAULT */}
            {activeTab === 'warranties' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Digital Warranty Vault</h2>
                    <p className="text-xs text-slate-500">
                      Official doorstep replacement guarantees linked to your devices.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <span className="text-xs font-bold text-emerald-400">
                          {b.warrantyDuration}
                        </span>
                        <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded">
                          {b.id}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-base">{b.brand} {b.model}</h4>
                        <p className="text-xs text-slate-300 mt-0.5">{b.problemTitle}</p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Guaranteed until:</span>
                        <span className="font-bold text-emerald-400">
                          {b.warrantyValidUntil || '2027-09-13'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Saved Doorstep Locations</h2>
                  <button
                    type="button"
                    onClick={() => alert('New address modal opens here!')}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg transition-colors"
                  >
                    + Add Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{addr.title}</h4>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">
                        {addr.address}, {addr.area}, {addr.city}
                      </p>
                      <p className="text-[11px] text-slate-400">Landmark: {addr.landmark}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">Notifications & Alerts</h2>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      n.unread
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                      <span className="text-[11px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600">{n.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Profile & Contact Preferences</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="profile-name" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-phone" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      id="profile-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-email" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>

                  {profileSaved && (
                    <p className="text-xs font-bold text-emerald-600">
                      Profile updated successfully!
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
