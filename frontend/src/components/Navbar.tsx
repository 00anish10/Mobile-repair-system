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
  Moon,
  Sun,
} from 'lucide-react';
import { useRepair } from '../context/RepairContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MoonLogo } from './MoonLogo';

export const Navbar: React.FC = () => {
  const {
    openBookingModal,
    activeView,
    setActiveView,
    currentRole,
    setCurrentRole,
    bookings,
  } = useRepair();

  const { isAuthenticated, user, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
                60-minute express mobile phone & device repair dispatch active across Kathmandu, Lalitpur, Pokhara & more
              </span>
              <span className="md:hidden text-slate-300">60-min mobile repair dispatch active</span>
            </div>

          {/* Quick Contact */}
          <div className="flex items-center gap-4">
            <a
              href="tel:+9779801234567"
              className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
              id="top-bar-phone-link"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">+977-980-123-4567</span>
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
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Sign In
              </button>
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
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800 text-slate-100'
                  : 'bg-slate-100 text-slate-800'
              } border border-slate-200/50 hover:${theme === 'dark' ? 'slate-600' : 'blue-500'}`}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

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
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none border border-slate-200/80"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none border border-slate-200/80"
                aria-label="Toggle menu"
                id="mobile-menu-toggle-btn"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
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

          {/* Dark Mode Toggle in Mobile Drawer */}
          {!isAuthenticated && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200/50 text-xs text-slate-500">
              <span className="font-medium">Theme:</span>
              <button
                type="button"
                onClick={toggleTheme}
                className={`rounded-lg px-2 py-1.5 text-slate-400 hover:text-slate-600 transition-colors ${
                  theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-800'
                }`}
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Quick Utilities Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={() => navigateTo('track')}
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
            {isAuthenticated && userRole === 'customer' ? (
              <button
                type="button"
                onClick={() => navigateTo('customer_dashboard')}
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
              <button
                type="button"
                onClick={() => navigateTo('customer_dashboard')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                  activeView === 'customer_dashboard'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>My Repairs</span>
              </button>
            )}
          </div>

          {/* Navigation Items - Customer View */}
          {(currentRole === 'customer' || !isAuthenticated) && (
            <div className="flex flex-col space-y-0.5 text-slate-700 font-medium text-sm">
              <button
                type="button"
                onClick={() => navigateTo('home')}
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
                onClick={() => navigateTo('home', '#services')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Our Services</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('home', '#device-selector')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Instant Price Calculator</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('home', '#how-it-works')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>How Home Repair Works</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('home', '#pricing')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Pricing List</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('home', '#service-areas')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Service Locations</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('home', '#reviews')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Customer Reviews</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('home', '#faq')}
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
                onClick={() => navigateTo('admin_dashboard')}
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
                onClick={() => navigateTo('home')}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>View Website</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}

          {/* Mobile Bottom Actions */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            {!isAuthenticated && (
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-xs">
                <span className="text-slate-600 font-medium">Testing Role:</span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCurrentRole('customer')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      currentRole === 'customer'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentRole('admin')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      currentRole === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}

            {currentRole === 'admin' && isAuthenticated && (
              <button
                type="button"
                onClick={() => navigateTo('admin_dashboard')}
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