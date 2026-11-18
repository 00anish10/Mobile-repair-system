import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wrench,
  DollarSign,
  TrendingUp,
  Search,
  BarChart3,
  X,
  Plus,
  PencilLine,
  ClipboardList,
  Trash2,
  PhoneCall,
  LogOut,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';
import { useAuth } from '../context/AuthContext';
import type { BookingStatus, ServiceCategory, Technician } from '../types';
import { useToast } from '../hooks/useToast';
import { TechnicianModal } from './admin/TechnicianModal';
import { ServiceModal } from './admin/ServiceModal';

export const AdminDashboard: React.FC = () => {
  const {
    bookings,
    technicians,
    services,
    updateBookingStatus,
    assignTechnician,
    cancelBooking,
    deleteTechnician,
    deleteService,
    setActiveTrackingId,
    setActiveView,
    setCurrentRole,
  } = useRepair();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'technicians' | 'services' | 'customers' | 'reports'>('overview');
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [technicianModalOpen, setTechnicianModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCategory | null>(null);
  const { info, success, error: toastError } = useToast();
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const handleAdminLogout = () => {
    logout();
    setCurrentRole('customer');
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTechnician = async (tech: Technician) => {
    const key = `technician:${tech.id}`;
    if (confirmDeleteKey !== key) {
      setConfirmDeleteKey(key);
      return;
    }
    setDeletingKey(key);
    try {
      await deleteTechnician(tech.id);
      success('Technician removed', { description: `${tech.name} was deleted from the fleet.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete the technician.';
      toastError('Delete failed', { description: message });
    } finally {
      setDeletingKey(null);
      setConfirmDeleteKey(null);
    }
  };

  const handleDeleteService = async (service: ServiceCategory) => {
    const key = `service:${service.id}`;
    if (confirmDeleteKey !== key) {
      setConfirmDeleteKey(key);
      return;
    }
    setDeletingKey(key);
    try {
      await deleteService(service.id);
      success('Service removed', { description: `${service.title} was deleted.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete the service.';
      toastError('Delete failed', { description: message });
    } finally {
      setDeletingKey(null);
      setConfirmDeleteKey(null);
    }
  };

  // Computed metrics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').length;
  const completedRepairs = bookings.filter((b) => b.status === 'completed').length;
  const totalRevenueRs = bookings.reduce((sum, b) => (b.paymentStatus === 'paid' || b.status === 'completed' ? sum + b.estimatedCostRs : sum), 0);
  const activeTechsCount = technicians.filter((t) => t.status !== 'offline').length;
  const completionRate = totalBookings > 0 ? Math.round((completedRepairs / totalBookings) * 100) : 0;

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedBooking = bookings.find((b) => b.id === selectedBookingForModal);

  const customers = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        email: string;
        phone: string;
        city: string;
        repairs: number;
        spent: number;
      }
    >();

    for (const booking of bookings) {
      const key = booking.customerEmail.toLowerCase();
      const existing = map.get(key);
      const spent = booking.status === 'completed' ? booking.estimatedCostRs : 0;
      if (existing) {
        existing.repairs += 1;
        existing.spent += spent;
      } else {
        map.set(key, {
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          city: `${booking.city} (${booking.area})`,
          repairs: 1,
          spent,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.repairs - a.repairs);
  }, [bookings]);

  const deviceStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const booking of bookings) {
      const label = `${booking.brand} ${booking.model}`.trim();
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    const total = bookings.length;
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([device, count]) => ({
        device,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
  }, [bookings]);

  const issueStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const booking of bookings) {
      counts.set(booking.problemTitle, (counts.get(booking.problemTitle) || 0) + 1);
    }
    const total = bookings.length;
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({
        issue,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
  }, [bookings]);

  // Status badge helper
  const renderStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">Confirmed</span>;
      case 'technician_assigned':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Tech Assigned</span>;
      case 'technician_en_route':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">En Route</span>;
      case 'technician_arrived':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">Tech Arrived</span>;
      case 'in_progress':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">In Progress</span>;
      case 'completed':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Completed</span>;
      case 'cancelled':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen border-b border-slate-200">
      <div className="sticky top-0 z-40 bg-slate-900 text-slate-300 border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live On-Demand
            </span>
            <span className="hidden md:inline truncate text-xs text-slate-300">
              60-minute express mobile phone &amp; device repair dispatch active across Sydney,
              Melbourne, Brisbane &amp; more
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="tel:+61400123456"
              className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors text-xs font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">+61 400 123 456</span>
            </a>
            <div className="hidden sm:block h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-bold text-white">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'admin'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Admin Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'bookings', label: 'All Bookings', icon: Calendar, badge: totalBookings },
            { id: 'technicians', label: 'Technician Fleet', icon: Wrench, badge: technicians.length },
            { id: 'services', label: 'Services & Pricing', icon: DollarSign },
            { id: 'customers', label: 'Customers Directory', icon: Users },
            { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'overview' | 'bookings' | 'technicians' | 'services' | 'customers' | 'reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 6 Key Performance Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{totalBookings}</div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                  <TrendingUp className="w-3 h-3" /> {completionRate}% completion rate
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Orders</span>
                <div className="text-2xl font-black text-amber-600 mt-1">{pendingBookings}</div>
                <div className="text-[11px] text-slate-400 mt-1">Active in field</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Completed</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">{completedRepairs}</div>
                <div className="text-[11px] text-slate-400 mt-1">100% verified</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Total Revenue</span>
                <div className="text-xl font-black text-slate-900 mt-1">
                  ${totalRevenueRs.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">Paid / Completed</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Active Techs</span>
                <div className="text-2xl font-black text-indigo-600 mt-1">{activeTechsCount}</div>
                <div className="text-[11px] text-slate-400 mt-1">On duty vans</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Customers</span>
                <div className="text-2xl font-black text-purple-600 mt-1">{customers.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">From booking history</div>
              </div>
            </div>

            {/* Quick dispatch table preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900">Recent On-Site Repair Dispatches</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Device & Issue</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Cost</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.slice(0, 4).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-blue-700">{b.id}</td>
                        <td className="p-3 font-semibold text-slate-900">{b.customerName}</td>
                        <td className="p-3">
                          <span className="font-bold">{b.brand} {b.model}</span>
                          <span className="text-slate-400 block text-[11px]">{b.problemTitle}</span>
                        </td>
                        <td className="p-3 text-slate-600">{b.area}, {b.city}</td>
                        <td className="p-3 text-slate-500">{b.scheduledDate}</td>
                        <td className="p-3">{renderStatusBadge(b.status)}</td>
                        <td className="p-3 font-bold text-slate-900">${b.estimatedCostRs.toLocaleString()}</td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => setSelectedBookingForModal(b.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center">
                          <ClipboardList className="mx-auto h-7 w-7 text-slate-300" />
                          <p className="mt-2 font-bold text-slate-700">No dispatches yet</p>
                          <p className="text-[11px] text-slate-400">
                            Customer bookings will show up here in real time.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS MANAGER */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by ID, name, model..."
                    className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 w-52 sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="technician_assigned">Tech Assigned</option>
                  <option value="technician_en_route">En Route</option>
                  <option value="technician_arrived">Tech Arrived</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <span className="text-xs text-slate-500 font-semibold">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone & Address</th>
                    <th className="p-3">Device & Problem</th>
                    <th className="p-3">Scheduled</th>
                    <th className="p-3">Assigned Tech</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => {
                    const assignedTech = technicians.find((t) => t.id === b.technicianId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-blue-700">{b.id}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{b.customerName}</div>
                          <div className="text-slate-400 text-[11px]">{b.customerEmail}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{b.customerPhone}</div>
                          <div className="text-slate-500 text-[11px]">{b.address}, {b.city}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{b.brand} {b.model}</div>
                          <div className="text-blue-600 text-[11px] font-medium">{b.problemTitle}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{b.scheduledDate}</div>
                          <div className="text-slate-400 text-[11px]">{b.scheduledTimeSlot}</div>
                        </td>
                        <td className="p-3">
                          {assignedTech ? (
                            <span className="font-semibold text-slate-800">{assignedTech.name}</span>
                          ) : (
                            <span className="text-rose-500 font-bold">Unassigned</span>
                          )}
                        </td>
                        <td className="p-3">{renderStatusBadge(b.status)}</td>
                        <td className="p-3 font-bold text-slate-900">${b.estimatedCostRs.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBookingForModal(b.id)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-2 font-bold text-slate-700">No bookings found</p>
                        <p className="text-[11px] text-slate-400">
                          {bookings.length === 0
                            ? 'New customer bookings will appear here.'
                            : 'Try a different search term or status filter.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TECHNICIANS FLEET */}
        {activeTab === 'technicians' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">Certified Technician Fleet</h3>
                <p className="text-xs text-slate-500">Manage mobile van units, availability, and active city coverage.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingTechnician(null);
                  setTechnicianModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Technician
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {technicians.map((tech) => (
                <div key={tech.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={tech.photoUrl}
                      alt={tech.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{tech.name}</h4>
                      <p className="text-[11px] text-slate-500">{tech.vehicle}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-bold capitalize ${
                        tech.status === 'available'
                          ? 'text-emerald-600'
                          : tech.status === 'on_job'
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}>
                        {tech.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="font-bold text-slate-900">⭐ {tech.rating} ({tech.reviewsCount})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Jobs:</span>
                      <span className="font-bold text-slate-900">{tech.completedJobs} repairs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Areas:</span>
                      <span className="font-bold text-slate-900">{tech.activeAreas.join(', ')}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-slate-400">{tech.phone}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void handleDeleteTechnician(tech)}
                        disabled={deletingKey === `technician:${tech.id}`}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition disabled:cursor-wait disabled:opacity-60 ${
                          confirmDeleteKey === `technician:${tech.id}`
                            ? 'border-rose-200 bg-rose-600 text-white hover:bg-rose-700'
                            : 'border-slate-200 bg-white text-rose-600 hover:border-rose-200 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="h-3 w-3" />
                        {deletingKey === `technician:${tech.id}`
                          ? 'Deleting'
                          : confirmDeleteKey === `technician:${tech.id}`
                          ? 'Confirm'
                          : 'Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTechnician(tech);
                          setTechnicianModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <PencilLine className="h-3 w-3" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {technicians.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                  <Wrench className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 font-bold text-slate-700">No technicians yet</p>
                  <p className="text-[11px] text-slate-400">
                    Add your first technician to start dispatching jobs.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES & PRICING */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Service Categories & Base Pricing</h3>
                <p className="text-xs text-slate-500">Configure standard catalog rates and guaranteed warranty durations.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingService(null);
                  setServiceModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> New Service
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Service Name</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Base Price</th>
                    <th className="p-3">Warranty</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900">{s.title}</span>
                        {s.isActive === false && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{s.description}</td>
                      <td className="p-3 font-bold text-blue-700">From ${s.startingPriceRs.toLocaleString()}</td>
                      <td className="p-3 text-emerald-700 font-semibold">{s.warrantyText}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void handleDeleteService(s)}
                            disabled={deletingKey === `service:${s.id}`}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition disabled:cursor-wait disabled:opacity-60 ${
                              confirmDeleteKey === `service:${s.id}`
                                ? 'border-rose-200 bg-rose-600 text-white hover:bg-rose-700'
                                : 'border-slate-200 bg-white text-rose-600 hover:border-rose-200 hover:bg-rose-50'
                            }`}
                          >
                            <Trash2 className="h-3 w-3" />
                            {deletingKey === `service:${s.id}`
                              ? 'Deleting'
                              : confirmDeleteKey === `service:${s.id}`
                              ? 'Confirm'
                              : 'Delete'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingService(s);
                              setServiceModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <PencilLine className="h-3 w-3" /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <DollarSign className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-2 font-bold text-slate-700">No services in the catalog</p>
                        <p className="text-[11px] text-slate-400">
                          Add a service so customers can book it.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOMERS DIRECTORY */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Customers & Repair Histories</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">City / Area</th>
                    <th className="p-3">Total Repairs</th>
                    <th className="p-3">Total Spent</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((cust) => (
                    <tr key={cust.email} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{cust.name}</div>
                        <div className="text-slate-400 text-[11px]">{cust.email}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{cust.phone}</td>
                      <td className="p-3 text-slate-600">{cust.city}</td>
                      <td className="p-3 font-bold text-slate-900">{cust.repairs}</td>
                      <td className="p-3 font-bold text-emerald-700">${cust.spent.toLocaleString()}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => info(cust.name, { description: `${cust.email} • ${cust.phone} • ${cust.repairs} repair(s)` })}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <Users className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-2 font-bold text-slate-700">No customers yet</p>
                        <p className="text-[11px] text-slate-400">
                          Customers appear automatically after their first booking.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Most requested devices */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Most Requested Devices for Home Repair</h4>
                <div className="space-y-2 text-xs">
                  {deviceStats.map((item) => (
                    <div key={item.device} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-800">{item.device}</span>
                        <span className="text-slate-500">
                          {item.count} request{item.count === 1 ? '' : 's'} ({item.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {deviceStats.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-slate-400">
                      Device trends appear after the first booking.
                    </p>
                  )}
                </div>
              </div>

              {/* Most common problems */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Most Common Repair Issues</h4>
                <div className="space-y-2 text-xs">
                  {issueStats.map((item) => (
                    <div key={item.issue} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-800">{item.issue}</span>
                        <span className="text-slate-500">
                          {item.count} request{item.count === 1 ? '' : 's'} ({item.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {issueStats.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-slate-400">
                      Repair issue trends appear after the first booking.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: MANAGE SPECIFIC BOOKING */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Manage Booking: {selectedBooking.id}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedBooking.customerName} • {selectedBooking.model}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBookingForModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Status selector */}
                <div>
                  <label htmlFor="admin-status" className="block font-bold text-slate-700 uppercase mb-1.5">
                    Update Service Status
                  </label>
                  <select
                    id="admin-status"
                    value={selectedBooking.status}
                    onChange={(e) => updateBookingStatus(selectedBooking.id, e.target.value as BookingStatus)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900"
                  >
                    <option value="confirmed">Booking Confirmed</option>
                    <option value="technician_assigned">Technician Assigned</option>
                    <option value="technician_en_route">Technician On the Way</option>
                    <option value="technician_arrived">Technician Arrived</option>
                    <option value="in_progress">Repair in Progress</option>
                    <option value="completed">Repair Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Technician assignment */}
                <div>
                  <label htmlFor="admin-technician" className="block font-bold text-slate-700 uppercase mb-1.5">
                    Assign Technician Van
                  </label>
                  <select
                    id="admin-technician"
                    value={selectedBooking.technicianId || ''}
                    onChange={(e) => assignTechnician(selectedBooking.id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.activeAreas.join(', ')}) - {t.vehicle}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer info recap */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="font-semibold text-slate-900">{selectedBooking.address}, {selectedBooking.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-semibold text-slate-900">{selectedBooking.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-extrabold text-blue-700">${selectedBooking.estimatedCostRs.toLocaleString()}</span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      cancelBooking(selectedBooking.id);
                      setSelectedBookingForModal(null);
                    }}
                    className="text-rose-600 font-bold hover:underline"
                  >
                    Cancel Booking
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTrackingId(selectedBooking.id);
                      setActiveView('track');
                      setSelectedBookingForModal(null);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                  >
                    Open Live GPS Tracking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <TechnicianModal
          open={technicianModalOpen}
          technician={editingTechnician}
          onClose={() => {
            setTechnicianModalOpen(false);
            setEditingTechnician(null);
          }}
        />

        <ServiceModal
          open={serviceModalOpen}
          service={editingService}
          onClose={() => {
            setServiceModalOpen(false);
            setEditingService(null);
          }}
        />
      </div>
    </div>
  );
};
