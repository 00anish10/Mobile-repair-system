import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Mail, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRepair } from '../context/RepairContext';
import { MoonLogo } from '../components/MoonLogo';
import { useToast } from '../hooks/useToast';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const { setCurrentRole } = useRepair();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password, role);
      if (result) {
        showSuccess('Welcome back!', { description: 'Redirecting to your dashboard...' });
        setTimeout(() => {
          if (role === 'admin') {
            setCurrentRole('admin');
            navigate('/admin');
          } else {
            setCurrentRole('customer');
            navigate('/dashboard');
          }
        }, 1000);
      } else {
        showError('Login failed', { description: 'Invalid email or password for this role.' });
      }
    } catch {
      showError('Something went wrong', { description: 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'customer' | 'admin') => {
    setRole(demoRole);
    setEmail(demoRole === 'customer' ? 'anishshrestha2007@gmail.com' : 'admin@moonmobilerepair.com');
    setPassword(demoRole === 'customer' ? 'demo123' : 'admin123');
    setLoading(true);
    
    const result = await login(
      demoRole === 'customer' ? 'anishshrestha2007@gmail.com' : 'admin@moonmobilerepair.com',
      demoRole === 'customer' ? 'demo123' : 'admin123',
      demoRole
    );
    
    if (result) {
      showSuccess('Demo login successful!', { description: 'Redirecting...' });
      setTimeout(() => {
        if (demoRole === 'admin') {
          setCurrentRole('admin');
          navigate('/admin');
        } else {
          setCurrentRole('customer');
          navigate('/dashboard');
        }
      }, 800);
    } else {
      showError('Demo login failed', { description: 'Please try again.' });
    }
    setLoading(false);
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6" aria-label="Moon Mobile Home">
            <MoonLogo size="lg" subtitle="Express Mobile & Tech Repair" />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-slate-600">Sign in to access your repair dashboard</p>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-100" role="tablist">
            <button
              role="tab"
              aria-selected={role === 'customer'}
              onClick={() => setRole('customer')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                role === 'customer'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Customer</span>
            </button>
            <button
              role="tab"
              aria-selected={role === 'admin'}
              onClick={() => setRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Admin</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">
            {role === 'customer' ? 'Track repairs, view warranty, book services' : 'Manage bookings, technicians, fleet & analytics'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  required
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  aria-describedby="email-hint"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="w-full pl-12 pr-14 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <p className="text-xs text-slate-500 text-center">Or try demo accounts:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                disabled={loading}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Demo Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="px-4 py-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Features Footer */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white/80 rounded-xl border border-slate-100">
            <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Doorstep Service</p>
            <p className="text-[10px] text-slate-500">We come to you</p>
          </div>
          <div className="p-4 bg-white/80 rounded-xl border border-slate-100">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Warranty</p>
            <p className="text-[10px] text-slate-500">Up to 12 months</p>
          </div>
          <div className="p-4 bg-white/80 rounded-xl border border-slate-100">
            <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No Hidden Fees</p>
            <p className="text-[10px] text-slate-500">Transparent pricing</p>
          </div>
        </div>

        {/* Legal Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>{' '}
          &{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};