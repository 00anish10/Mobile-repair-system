import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Calendar,
  Search,
  User,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';
import { useAuth } from '../context/AuthContext';
import { MoonLogo } from './MoonLogo';

export const Navbar: React.FC = () => {
  const {
    openBookingModal,
    activeView,
    currentRole,
    setCurrentRole,
    bookings,
  } = useRepair();

  const { isAuthenticated, user, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeBookingsCount = bookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  ).length;

  const navigateTo = (path: string, hash?: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentRole('customer');
    navigate('/');
    window.scrollTo(0, 0);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      {/* Top Notification & Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs font-medium py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
{/* Dispatch Status */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live On-Demand
              </span>
              <span className="hidden md:inline text-slate-300">
                60-minute express mobile phone & device repair dispatch active across Sydney, Melbourne, Brisbane & more
              </span>
              <span className="md:hidden text-slate-300">60-min mobile repair dispatch active</span>
            </div>

          {/* Quick Contact */}
          <div className="flex items-center gap-4">
            <a
              href="tel:+61400123456"
              className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
              id="top-bar-phone-link"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">+61 400 123 456</span>
            </a>

            <div className="h-3.5 w-px bg-slate-800 hidden sm:block"></div>

            {/* User Menu / Login */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 border border-slate-700/60 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-black">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{userRole}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline px-3 py-1.5 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl group cursor-pointer"
            id="brand-logo-btn"
            title="Go to Home"
            aria-label="MoonMobile Home"
          >
            <MoonLogo size="md" subtitle="Express Mobile & Tech Repair" />
          </button>

          {/* Desktop Navigation Links - Customer View */}
          {(currentRole === 'customer' || !isAuthenticated) && (
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeView === 'home'
                    ? 'text-blue-600 font-semibold bg-blue-50/50'
                    : 'hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/#services"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Services
              </Link>
              <Link
                to="/#device-selector"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Instant Quote
              </Link>
              <Link
                to="/#how-it-works"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                How It Works
              </Link>
              <Link
                to="/#pricing"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/#service-areas"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Service Areas
              </Link>
              <Link
                to="/#faq"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                FAQ
              </Link>
            </nav>
          )}

          {/* Desktop Navigation Links - Admin View */}
          {currentRole === 'admin' && isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeView === 'admin_dashboard'
                    ? 'text-blue-600 font-semibold bg-blue-50/50'
                    : 'hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin#bookings"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Bookings
              </Link>
              <Link
                to="/admin#technicians"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Technicians
              </Link>
              <Link
                to="/admin#analytics"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Analytics
              </Link>
              <Link
                to="/admin#settings"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Settings
              </Link>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Website
              </Link>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Track Repair Button */}
            <Link
              to="/track"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                activeView === 'track'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
              id="nav-track-btn"
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span>Track Repair</span>
              {activeBookingsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </Link>

            {/* Customer Dashboard Button */}
            {(isAuthenticated && userRole === 'customer') || (!isAuthenticated && currentRole === 'customer') ? (
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  activeView === 'customer_dashboard'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
                id="nav-customer-dashboard-btn"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>My Repairs</span>
              </Link>
            ) : null}

            {/* Admin Dashboard Button */}
            {currentRole === 'admin' && isAuthenticated && (
              <Link
                to="/admin"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  activeView === 'admin_dashboard'
                    ? 'bg-slate-900 border-slate-900 text-white ring-2 ring-blue-500/40'
                    : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 shadow-sm'
                }`}
                id="nav-admin-portal-btn"
              >
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Admin Console</span>
              </Link>
            )}

            {/* Primary CTA: Book a Repair */}
            <button
              type="button"
              onClick={() => openBookingModal()}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm px-4.5 py-2 rounded-lg shadow-sm shadow-blue-500/20 hover:shadow transition-all cursor-pointer"
              id="nav-book-repair-btn"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Repair</span>
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => openBookingModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
              id="mobile-quick-book-btn"
            >
              Book Repair
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none border border-slate-200/80"
              aria-label="Toggle menu"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          {/* User Info */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-black">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{userRole}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Quick Utilities Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={() => navigateTo('/track')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                activeView === 'track'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Track Repair</span>
              {activeBookingsCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {isAuthenticated && userRole === 'admin' ? (
              <button
                type="button"
                onClick={() => navigateTo('/admin')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                  activeView === 'admin_dashboard'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin Console</span>
              </button>
            ) : isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigateTo('/dashboard')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                  activeView === 'customer_dashboard'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>My Repairs</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Navigation Items - Customer View */}
          {(currentRole === 'customer' || !isAuthenticated) && (
            <div className="flex flex-col space-y-0.5 text-slate-700 font-medium text-sm">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className={`text-left px-3 py-2.5 rounded-lg flex items-center justify-between ${
                  activeView === 'home'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'hover:bg-slate-50'
                }`}
              >
                <span>Home</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/', '#services')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Our Services</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/', '#device-selector')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Instant Price Calculator</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/', '#how-it-works')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>How Home Repair Works</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/', '#pricing')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Pricing List</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/', '#service-areas')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Service Locations</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/', '#reviews')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Customer Reviews</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/', '#faq')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Frequently Asked Questions</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}

          {/* Navigation Items - Admin View */}
          {currentRole === 'admin' && isAuthenticated && (
            <div className="flex flex-col space-y-0.5 text-slate-700 font-medium text-sm">
              <button
                type="button"
                onClick={() => navigateTo('/admin')}
                className={`text-left px-3 py-2.5 rounded-lg flex items-center justify-between ${
                  activeView === 'admin_dashboard'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'hover:bg-slate-50'
                }`}
              >
                <span>Admin Dashboard</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('admin_dashboard', '#bookings')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>All Bookings</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('admin_dashboard', '#technicians')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Technician Management</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('admin_dashboard', '#analytics')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Analytics & Reports</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('admin_dashboard', '#settings')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Settings</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>View Website</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}

          {/* Mobile Bottom Actions */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </Link>
            )}

            {currentRole === 'admin' && isAuthenticated && (
              <button
                type="button"
                onClick={() => navigateTo('/admin')}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-2.5 rounded-lg text-sm shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Open Admin Console</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openBookingModal();
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm shadow-sm transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Repair</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};