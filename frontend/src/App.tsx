import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RepairProvider, useRepair, type BookingPrefill } from './context/RepairContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DeviceSelector } from './components/DeviceSelector';
import { ServiceCategories } from './components/ServiceCategories';
import { HowItWorks } from './components/HowItWorks';
import { PricingSection } from './components/PricingSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { ServiceAreas } from './components/ServiceAreas';
import { ReviewsSection } from './components/ReviewsSection';
import { FAQSection } from './components/FAQSection';
import { BookingModal } from './components/BookingModal';
import { TechnicianTracking } from './components/TechnicianTracking';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SupportPage } from './pages/SupportPage';
import { NotFound } from './pages/NotFound';
import { LegalPage } from './pages/LegalPage';
import { ToastProvider } from './hooks/useToast';
import { ErrorBoundary } from './components/ErrorBoundary';

const dashboardPathForRole = (role: 'customer' | 'admin' | null) =>
  role === 'admin' ? '/admin' : '/dashboard';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'admin')[];
}> = ({ children, allowedRoles = ['customer', 'admin'] }) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to={dashboardPathForRole(userRole)} replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, userRole } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={dashboardPathForRole(userRole)} replace />;
  }
  return <>{children}</>;
};

const HomeView: React.FC = () => (
  <>
    <Hero />
    <DeviceSelector />
    <ServiceCategories />
    <HowItWorks />
    <PricingSection />
    <WhyChooseUs />
    <ServiceAreas />
    <ReviewsSection />
    <FAQSection />
  </>
);

const ScrollManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Wait a tick so the target route has rendered.
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return undefined;
  }, [location.pathname, location.hash]);

  return null;
};

const Shell: React.FC<{ children: React.ReactNode; hideNavbar?: boolean }> = ({
  children,
  hideNavbar = false,
}) => (
  <div className="min-h-screen flex flex-col bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
    <ScrollManager />
    {!hideNavbar && <Navbar />}
    <main className="flex-1">{children}</main>
    <BookingModal />
    <Footer />
  </div>
);

const BookingIntentHandler: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { openBookingModal, isBookingModalOpen } = useRepair();
  const [searchParams, setSearchParams] = useSearchParams();
  const bookRequested = searchParams.get('book') === '1';

  useEffect(() => {
    if (!bookRequested || !isAuthenticated) return;

    let pendingPrefill: BookingPrefill | undefined;
    const savedPrefill = sessionStorage.getItem('moon_booking_prefill');
    if (savedPrefill) {
      try {
        pendingPrefill = JSON.parse(savedPrefill) as BookingPrefill;
      } catch {
        pendingPrefill = undefined;
      }
    }

    if (!isBookingModalOpen) openBookingModal(pendingPrefill);
    sessionStorage.removeItem('moon_booking_prefill');
    const next = new URLSearchParams(searchParams);
    next.delete('book');
    setSearchParams(next, { replace: true });
  }, [
    bookRequested,
    isAuthenticated,
    isBookingModalOpen,
    openBookingModal,
    searchParams,
    setSearchParams,
  ]);

  return null;
};

const AppRoutes: React.FC = () => {
  const { user, userRole, isAuthenticated } = useAuth();

  return (
    <RepairProvider
      userEmail={isAuthenticated ? user?.email : undefined}
      userRole={userRole}
    >
      <BookingIntentHandler />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <Shell>
              <HomeView />
            </Shell>
          }
        />
        <Route
          path="/track"
          element={
            <ProtectedRoute>
              <Shell>
                <TechnicianTracking />
              </Shell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Shell>
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            </Shell>
          }
        />
        <Route
          path="/admin"
          element={
            <Shell hideNavbar>
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            </Shell>
          }
        />
        <Route
          path="/support"
          element={
            <Shell>
              <SupportPage />
            </Shell>
          }
        />
        <Route
          path="/terms"
          element={
            <Shell>
              <LegalPage kind="terms" />
            </Shell>
          }
        />
        <Route
          path="/privacy"
          element={
            <Shell>
              <LegalPage kind="privacy" />
            </Shell>
          }
        />

        <Route
          path="*"
          element={
            <Shell>
              <NotFound />
            </Shell>
          }
        />
      </Routes>
    </RepairProvider>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
