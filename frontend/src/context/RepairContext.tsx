import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { Booking, Technician, BookingStatus } from '../types';
import { INITIAL_BOOKINGS, TECHNICIANS } from '../data/mockData';

interface BookingPrefill {
  brand?: string;
  model?: string;
  problemId?: string;
  serviceType?: 'home' | 'office' | 'pickup' | 'workshop';
}

interface RepairContextType {
  bookings: Booking[];
  allBookings: Booking[];
  technicians: Technician[];
  currentRole: 'customer' | 'admin';
  setCurrentRole: (role: 'customer' | 'admin') => void;
  activeTrackingId: string | null;
  setActiveTrackingId: (id: string | null) => void;
  isBookingModalOpen: boolean;
  openBookingModal: (prefill?: BookingPrefill) => void;
  closeBookingModal: () => void;
  bookingPrefill: BookingPrefill | null;
  createBooking: (newBookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'warrantyDuration' | 'warrantyValidUntil'>) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus, notes?: string) => void;
  assignTechnician: (bookingId: string, technicianId: string) => void;
  cancelBooking: (bookingId: string) => void;
  getBookingById: (id: string) => Booking | undefined;
  getTechnicianById: (id?: string) => Technician | undefined;
  activeView: 'home' | 'track' | 'customer_dashboard' | 'admin_dashboard';
  setActiveView: (view: 'home' | 'track' | 'customer_dashboard' | 'admin_dashboard') => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
}

const RepairContext = createContext<RepairContextType | undefined>(undefined);

interface RepairProviderProps {
  children: ReactNode;
  userEmail?: string;
  userRole?: 'customer' | 'admin' | null;
}

export const RepairProvider: React.FC<RepairProviderProps> = ({ children, userEmail, userRole }) => {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('moon_mobile_bookings') || localStorage.getItem('doorfix_bookings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_BOOKINGS;
      }
    }
    return INITIAL_BOOKINGS;
  });

  const [technicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('moon_mobile_technicians') || localStorage.getItem('doorfix_technicians');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return TECHNICIANS;
      }
    }
    return TECHNICIANS;
  });

  const [currentRole, setCurrentRole] = useState<'customer' | 'admin'>(userRole || 'customer');
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>('#REP-2026-00125');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<BookingPrefill | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'track' | 'customer_dashboard' | 'admin_dashboard'>('home');
  const [email, setEmail] = useState(userEmail || '');

  useEffect(() => {
    localStorage.setItem('moon_mobile_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('moon_mobile_technicians', JSON.stringify(technicians));
  }, [technicians]);

  // Filter bookings for customer view
  const filteredBookings = useMemo(() => {
    if (currentRole === 'admin') return bookings;
    if (!email) return [];
    return bookings.filter((b: Booking) => b.customerEmail.toLowerCase() === email.toLowerCase());
  }, [bookings, currentRole, email]);

  const openBookingModal = (prefill?: BookingPrefill) => {
    setBookingPrefill(prefill || null);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingPrefill(null);
  };

  const createBooking = (
    data: Omit<Booking, 'id' | 'createdAt' | 'status' | 'warrantyDuration' | 'warrantyValidUntil'>
  ): Booking => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `#REP-2026-00${randomNum}`;

    const availableTech =
      technicians.find(
        (t: Technician) => t.status === 'available' && t.activeAreas.includes(data.city)
      ) || technicians[0];

    const warrantyText =
      data.problemId === 'screen_replacement'
        ? '12 Months Doorstep Screen Guarantee'
        : '6 Months Comprehensive Warranty';

    const validUntilDate = new Date();
    validUntilDate.setMonth(validUntilDate.getMonth() + (data.problemId === 'screen_replacement' ? 12 : 6));

    const newBooking: Booking = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      technicianId: availableTech?.id || 'TECH-001',
      warrantyDuration: warrantyText,
      warrantyValidUntil: validUntilDate.toISOString().split('T')[0],
      paymentStatus: 'pending',
    };

    setBookings((prev: Booking[]) => [newBooking, ...prev]);
    setActiveTrackingId(newId);
    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus, notes?: string) => {
    setBookings((prev: Booking[]) =>
      prev.map((b: Booking) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status,
            technicianNotes: notes || b.technicianNotes,
            paymentStatus: status === 'completed' ? 'paid' : b.paymentStatus,
          };
        }
        return b;
      })
    );
  };

  const assignTechnician = (bookingId: string, technicianId: string) => {
    setBookings((prev: Booking[]) =>
      prev.map((b: Booking) => {
        if (b.id === bookingId) {
          return {
            ...b,
            technicianId,
            status: b.status === 'confirmed' ? 'technician_assigned' : b.status,
          };
        }
        return b;
      })
    );
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev: Booking[]) =>
      prev.map((b: Booking) => {
        if (b.id === bookingId) {
          return { ...b, status: 'cancelled' };
        }
        return b;
      })
    );
  };

  const getBookingById = (id: string) => {
    const cleanId = id.trim();
    return bookings.find(
      (b: Booking) => b.id.toLowerCase() === cleanId.toLowerCase() || b.id.replace('#', '').toLowerCase() === cleanId.replace('#', '').toLowerCase()
    );
  };

  const getTechnicianById = (id?: string) => {
    if (!id) return undefined;
    return technicians.find((t: Technician) => t.id === id);
  };

  return (
    <RepairContext.Provider
      value={{
        bookings: filteredBookings,
        allBookings: bookings,
        technicians,
        currentRole,
        setCurrentRole,
        activeTrackingId,
        setActiveTrackingId,
        isBookingModalOpen,
        openBookingModal,
        closeBookingModal,
        bookingPrefill,
        createBooking,
        updateBookingStatus,
        assignTechnician,
        cancelBooking,
        getBookingById,
        getTechnicianById,
        activeView,
        setActiveView,
        userEmail: email,
        setUserEmail: setEmail,
      }}
    >
      {children}
    </RepairContext.Provider>
  );
};

export const useRepair = () => {
  const context = useContext(RepairContext);
  if (!context) {
    throw new Error('useRepair must be used within a RepairProvider');
  }
  return context;
};