import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RepairProvider, useRepair } from './context/RepairContext';
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
import { NotFound } from './pages/NotFound';
import { ToastProvider } from './hooks/useToast';
import { ErrorBoundary } from './components/ErrorBoundary';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: ('customer' | 'admin')[] }> = ({ 
  children, 
  allowedRoles = ['customer', 'admin'] 
}) => {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const MainContent: React.FC = () => {
  const { activeView } = useRepair();

  // Scroll to top when view switches
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />
      
      <main className="flex-1">
        {activeView === 'home' && (
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
        )}

        {activeView === 'track' && <TechnicianTracking />}

        {activeView === 'customer_dashboard' && (
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        )}

        {activeView === 'admin_dashboard' && (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </main>

      {/* Global Booking Modal */}
      <BookingModal />

      <Footer />
    </div>
  );
};

const AppWithAuth: React.FC = () => {
  const { user, userRole, isAuthenticated } = useAuth();

  return (
    <RepairProvider 
      userEmail={isAuthenticated ? user?.email : undefined} 
      userRole={userRole}
    >
      <MainContent />
    </RepairProvider>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />
              
              {/* Protected App Routes */}
              <Route path="/" element={<AppWithAuth />}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<Navigate to="/" replace />} />
                <Route path="track" element={<Navigate to="/track" replace />} />
                <Route path="dashboard" element={<Navigate to="/dashboard" replace />} />
                <Route path="admin" element={<Navigate to="/admin" replace />} />
              </Route>
              
              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}