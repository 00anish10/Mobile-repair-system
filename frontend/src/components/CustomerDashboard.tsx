import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Bell,
  Wrench,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

interface SavedAddress {
  id: string;
  title: string;
  address: string;
  area: string;
  city: string;
  landmark: string;
  isDefault: boolean;
}

function relativeTime(iso: string): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return 'Just now';
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export const CustomerDashboard: React.FC = () => {
  const {
    bookings,
    setActiveTrackingId,
    setActiveView,
    openBookingModal,
    userEmail,
    setUserEmail,
  } = useRepair();
  const { user, updateProfile } = useAuth();
  const { success, info } = useToast();

  const [activeTab, setActiveTab] = useState<
    'bookings' | 'upcoming' | 'history' | 'warranties' | 'addresses' | 'profile' | 'notifications' | 'referrals'
  >('bookings');

  // Customer Profile state
  const [name, setName] = useState(user?.name || 'Customer');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(userEmail || user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    address: '',
    area: '',
    city: '',
    landmark: '',
  });
  const [referralsEarned, setReferralsEarned] = useState(0);
  const [shareMessage, setShareMessage] = useState('');

  const accountKey = (user?.email || email).trim().toLowerCase();
  const addressStorageKey = accountKey ? `moon_saved_addresses_${accountKey}` : '';
  const referralStorageKey = accountKey ? `moon_referrals_${accountKey}` : '';

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone);
    setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (!addressStorageKey) {
      setSavedAddresses([]);
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem(addressStorageKey) || '[]');
      setSavedAddresses(Array.isArray(stored) ? (stored as SavedAddress[]) : []);
    } catch {
      setSavedAddresses([]);
    }
  }, [addressStorageKey]);

  useEffect(() => {
    if (!referralStorageKey) {
      setReferralsEarned(0);
      return;
    }
    const stored = Number(localStorage.getItem(referralStorageKey) || '0');
    setReferralsEarned(Number.isFinite(stored) ? stored : 0);
  }, [referralStorageKey]);

  const persistAddresses = (next: SavedAddress[]) => {
    setSavedAddresses(next);
    if (addressStorageKey) {
      localStorage.setItem(addressStorageKey, JSON.stringify(next));
    }
  };

  const handleAddAddress = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newAddress.title.trim() || !newAddress.address.trim() || !newAddress.city.trim()) {
      info('Address details needed', {
        description: 'Add a label, street address, and city before saving.',
      });
      return;
    }
    const address: SavedAddress = {
      id: `addr-${Date.now()}`,
      title: newAddress.title.trim(),
      address: newAddress.address.trim(),
      area: newAddress.area.trim(),
      city: newAddress.city.trim(),
      landmark: newAddress.landmark.trim(),
      isDefault: savedAddresses.length === 0,
    };
    persistAddresses([...savedAddresses, address]);
    setNewAddress({ title: '', address: '', area: '', city: '', landmark: '' });
    setAddressFormOpen(false);
    success('Address saved', { description: `${address.title} is ready for your next booking.` });
  };

  const handleRemoveAddress = (id: string) => {
    const next = savedAddresses.filter((address) => address.id !== id);
    if (next.length > 0 && !next.some((address) => address.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    persistAddresses(next);
    info('Address removed', { description: 'The saved location was deleted.' });
  };

  const handleSetDefaultAddress = (id: string) => {
    persistAddresses(
      savedAddresses.map((address) => ({ ...address, isDefault: address.id === id }))
    );
  };

  const notifications = useMemo(() => {
    const content: Record<string, { title: string; message: string }> = {
      confirmed: {
        title: 'Booking confirmed',
        message: 'Your repair has been booked. A technician will be assigned shortly.',
      },
      technician_assigned: {
        title: 'Technician assigned',
        message: 'A technician has been matched to your repair and will contact you before arrival.',
      },
      technician_en_route: {
        title: 'Technician on the way',
        message: 'Your technician is travelling to your address now.',
      },
      technician_arrived: {
        title: 'Technician arrived',
        message: 'Your technician has arrived and is ready to start the repair.',
      },
      in_progress: {
        title: 'Repair in progress',
        message: 'Your device is currently being repaired.',
      },
      completed: {
        title: 'Repair completed',
        message: 'Your repair is complete. Your warranty has been activated.',
      },
      cancelled: {
        title: 'Booking cancelled',
        message: 'This repair booking has been cancelled.',
      },
    };

    return bookings
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((booking) => {
        const detail = content[booking.status] || {
          title: 'Booking updated',
          message: 'Your booking status has changed.',
        };
        return {
          id: booking.id,
          title: `${detail.title} (${booking.id})`,
          message: `${booking.brand} ${booking.model} - ${booking.problemTitle}. ${detail.message}`,
          time: relativeTime(booking.createdAt),
          unread: booking.status !== 'completed' && booking.status !== 'cancelled',
        };
      });
  }, [bookings]);

  const unreadNotifications = notifications.filter((notification) => notification.unread).length;

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
    if (name.trim().length < 2) return;
    updateProfile({ name: name.trim(), phone: phone.trim() });
    setUserEmail(email.trim());
    setProfileSaved(true);
    success('Profile updated', { description: 'Your contact details have been saved.' });
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const referralCode = useMemo(() => {
    const base = (user?.id || user?.email || 'friend')
      .replace(/[^a-z0-9]/gi, '')
      .slice(-6)
      .toUpperCase();
    return `MOON-${base || 'FRIEND'}`;
  }, [user?.email, user?.id]);

  useEffect(() => {
    setShareMessage(
      `Get $50 off your first mobile repair with Moon Mobile Repair. Use my code ${referralCode}.`
    );
  }, [referralCode]);

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      success('Referral code copied', { description: referralCode });
    } catch {
      success('Your referral code', { description: referralCode });
    }
  };

  const handleShareReferral = async () => {
    const text = shareMessage.trim() || `Use my Moon Mobile Repair code ${referralCode}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Moon Mobile Repair', text });
      } else {
        await navigator.clipboard.writeText(text);
        success('Share message copied', { description: 'Paste it into your favourite app.' });
      }
    } catch {
      info('Share cancelled', { description: 'Your referral details are still available.' });
    }
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
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
              { id: 'profile', label: 'Profile Settings', icon: User },
              { id: 'referrals', label: 'Referral Program', icon: Sparkles, badge: referralsEarned > 0 ? referralsEarned : undefined },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
                          ${b.estimatedCostRs.toLocaleString()}
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
                        ${b.estimatedCostRs.toLocaleString()}
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
                    onClick={() => setAddressFormOpen((open) => !open)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg transition-colors"
                  >
                    {addressFormOpen ? 'Cancel' : '+ Add Address'}
                  </button>
                </div>

                {addressFormOpen && (
                  <form
                    onSubmit={handleAddAddress}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'title', label: 'Label', placeholder: 'Home, Work, etc.' },
                        { key: 'address', label: 'Street address', placeholder: 'Unit 1, 12 Example St' },
                        { key: 'area', label: 'Suburb / area', placeholder: 'Surry Hills' },
                        { key: 'city', label: 'City', placeholder: 'Sydney' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label
                            htmlFor={`address-${field.key}`}
                            className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500"
                          >
                            {field.label}
                          </label>
                          <input
                            id={`address-${field.key}`}
                            type="text"
                            value={newAddress[field.key as keyof typeof newAddress]}
                            onChange={(event) =>
                              setNewAddress({ ...newAddress, [field.key]: event.target.value })
                            }
                            placeholder={field.placeholder}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900"
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="address-landmark"
                          className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500"
                        >
                          Landmark (optional)
                        </label>
                        <input
                          id="address-landmark"
                          type="text"
                          value={newAddress.landmark}
                          onChange={(event) =>
                            setNewAddress({ ...newAddress, landmark: event.target.value })
                          }
                          placeholder="Near the train station"
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      Save Address
                    </button>
                  </form>
                )}

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
                      <p className="text-[11px] text-slate-400">
                        Landmark: {addr.landmark || 'Not provided'}
                      </p>
                      <div className="flex items-center gap-3 border-t border-slate-100 pt-2 text-[11px] font-bold">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-blue-700 hover:underline"
                          >
                            Set default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAddress(addr.id)}
                          className="text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {savedAddresses.length === 0 && (
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                      <MapPin className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm font-bold text-slate-700">No saved addresses</p>
                      <p className="text-[11px] text-slate-400">
                        Add your home or workplace to speed up your next booking.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">Notifications & Alerts</h2>
                <p className="text-xs text-slate-500">
                  Generated from your live booking statuses.
                </p>
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
                {notifications.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                    <Bell className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm font-bold text-slate-700">No notifications yet</p>
                    <p className="text-[11px] text-slate-400">
                      Booking updates will appear here automatically.
                    </p>
                  </div>
                )}
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
                      readOnly
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Email is used for invoices and warranty and cannot be changed here.
                    </p>
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

            {/* TAB: REFERRALS */}
            {activeTab === 'referrals' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Referral Program</h2>
                <p className="text-slate-600 mb-6">
                  Share your unique referral code with friends and family. When they book their first repair using your code, you both earn rewards!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-2">{referralCode}</div>
                    <div className="text-sm text-slate-500">Your unique referral code</div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-2">{referralsEarned}</div>
                    <div className="text-sm text-slate-500">Friends referred</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-600">
                    Share your code {referralCode} with anyone who needs mobile repair. Both you and your friend get $50 off their first repair!
                  </p>

                  <div>
                    <textarea
                      rows={2}
                      value={shareMessage}
                      onChange={(event) => setShareMessage(event.target.value)}
                      placeholder="Message to share..."
                      className="w-full pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCopyReferral}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-blue-500/25 hover:shadow-xl">
                      Copy Code
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleShareReferral()}
                      className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-emerald-500/25 hover:shadow-xl">
                      Share
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-3">Your Rewards</h4>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">$50</div>
                        <div className="text-xs text-slate-500">Per successful referral</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">${referralsEarned * 50}</div>
                        <div className="text-xs text-slate-500">Total earnings</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Redeem earnings for discounts on future repairs.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
