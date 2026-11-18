import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type {
  Booking,
  Technician,
  TechnicianInput,
  BookingStatus,
  ServiceCategory,
  ServiceCategoryInput,
} from '../types';
import { INITIAL_BOOKINGS, TECHNICIANS, SERVICE_CATEGORIES } from '../data/mockData';
import {
  apiCreateService,
  apiCreateTechnician,
  apiDeleteService,
  apiDeleteTechnician,
  apiListBookings,
  apiListServices,
  apiListTechnicians,
  apiUpdateService,
  apiUpdateTechnician,
  assignBookingOnServer,
  cancelBookingOnServer,
  createBookingOnServer,
  updateBookingStatusOnServer,
  ApiError,
} from '../lib/api';

type ActiveView = 'home' | 'track' | 'customer_dashboard' | 'admin_dashboard';

export interface BookingPrefill {
  brand?: string;
  model?: string;
  problemId?: string;
  serviceType?: 'home' | 'office' | 'pickup' | 'workshop';
  city?: string;
}

interface RepairContextType {
  bookings: Booking[];
  allBookings: Booking[];
  technicians: Technician[];
  services: ServiceCategory[];
  addTechnician: (input: TechnicianInput) => Promise<Technician>;
  updateTechnician: (technicianId: string, input: Partial<TechnicianInput>) => Promise<Technician>;
  deleteTechnician: (technicianId: string) => Promise<void>;
  addService: (input: ServiceCategoryInput) => Promise<ServiceCategory>;
  updateService: (
    serviceId: string,
    input: Partial<ServiceCategoryInput>
  ) => Promise<ServiceCategory>;
  deleteService: (serviceId: string) => Promise<void>;
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
  refreshBookings: () => Promise<void>;
  getTechnicianById: (id?: string) => Technician | undefined;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
}

const RepairContext = createContext<RepairContextType | undefined>(undefined);

const VIEW_TO_PATH: Record<ActiveView, string> = {
  home: '/',
  track: '/track',
  customer_dashboard: '/dashboard',
  admin_dashboard: '/admin',
};

function pathToView(pathname: string): ActiveView {
  if (pathname.startsWith('/track')) return 'track';
  if (pathname.startsWith('/dashboard')) return 'customer_dashboard';
  if (pathname.startsWith('/admin')) return 'admin_dashboard';
  return 'home';
}

interface RepairProviderProps {
  children: ReactNode;
  userEmail?: string;
  userRole?: 'customer' | 'admin' | null;
}

export const RepairProvider: React.FC<RepairProviderProps> = ({ children, userEmail, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
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

  const [services, setServices] = useState<ServiceCategory[]>(() => {
    const saved = localStorage.getItem('moon_mobile_services');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SERVICE_CATEGORIES;
      }
    }
    return SERVICE_CATEGORIES;
  });

  const [currentRole, setCurrentRole] = useState<'customer' | 'admin'>(userRole || 'customer');
  const [activeTrackingId, setActiveTrackingIdState] = useState<string | null>(() =>
    sessionStorage.getItem('moon_active_tracking')
  );
  const setActiveTrackingId = (id: string | null) => {
    setActiveTrackingIdState(id);
    if (id) sessionStorage.setItem('moon_active_tracking', id);
    else sessionStorage.removeItem('moon_active_tracking');
  };

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<BookingPrefill | null>(null);
  const [email, setEmail] = useState(userEmail || '');

  const activeView = pathToView(location.pathname);

  useEffect(() => {
    localStorage.setItem('moon_mobile_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('moon_mobile_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('moon_mobile_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    let cancelled = false;

    apiListTechnicians()
      .then((remote) => {
        if (!cancelled && remote.length > 0) setTechnicians(remote);
      })
      .catch(() => undefined);

    apiListServices()
      .then((remote) => {
        if (!cancelled && remote.length > 0) setServices(remote);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (userRole) setCurrentRole(userRole);
  }, [userRole]);

  // Pull the authenticated user's bookings from PostgreSQL and merge them into
  // the local cache. Failures are ignored so the offline demo keeps working.
  const refreshBookings = useCallback(async () => {
    if (!userEmail) return;
    try {
      const remoteBookings = await apiListBookings();
      if (remoteBookings.length === 0) return;
      setBookings((prev) => {
        const byId = new Map(prev.map((booking) => [booking.id, booking]));
        for (const booking of remoteBookings) byId.set(booking.id, booking);
        return Array.from(byId.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch {
      // Offline demo keeps using the local cache.
    }
  }, [userEmail]);

  useEffect(() => {
    void refreshBookings();
  }, [refreshBookings]);

  useEffect(() => {
    setEmail(userEmail || '');
  }, [userEmail]);

  const filteredBookings = useMemo(() => {
    if (currentRole === 'admin') return bookings;
    if (!email) return bookings;
    return bookings.filter((b: Booking) => b.customerEmail.toLowerCase() === email.toLowerCase());
  }, [bookings, currentRole, email]);

  const setActiveView = (view: ActiveView) => {
    navigate(VIEW_TO_PATH[view]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBookingModal = (prefill?: BookingPrefill) => {
    if (!userEmail) {
      if (prefill) {
        sessionStorage.setItem('moon_booking_prefill', JSON.stringify(prefill));
      } else {
        sessionStorage.removeItem('moon_booking_prefill');
      }
      const redirect = `${location.pathname}${location.search}${location.hash}` || '/';
      const params = new URLSearchParams({ redirect, book: '1' });
      navigate(`/login?${params.toString()}`);
      return;
    }
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
    const year = new Date().getFullYear();
    const uniquePart = String(Date.now()).slice(-5);
    const newId = `#REP-${year}-${uniquePart}`;

    const availableTech =
      technicians.find(
        (t: Technician) => t.status === 'available' && t.activeAreas.includes(data.city)
      ) || technicians.find((t: Technician) => t.status === 'available') || technicians[0];

    const warrantyText =
      data.problemId === 'screen_replacement'
        ? '12 Months Doorstep Screen Guarantee'
        : '6 Months Comprehensive Warranty';

    const validUntilDate = new Date(data.scheduledDate || new Date().toISOString());
    validUntilDate.setMonth(validUntilDate.getMonth() + (data.problemId === 'screen_replacement' ? 12 : 6));

    const newBooking: Booking = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      status: availableTech ? 'technician_assigned' : 'confirmed',
      technicianId: availableTech?.id,
      warrantyDuration: warrantyText,
      warrantyValidUntil: validUntilDate.toISOString().split('T')[0],
      paymentStatus: 'pending',
    };

    setBookings((prev: Booking[]) => [newBooking, ...prev]);
    setActiveTrackingId(newId);
    void createBookingOnServer(newBooking).catch(() => undefined);
    return newBooking;
  };

  const addTechnician = async (input: TechnicianInput): Promise<Technician> => {
    try {
      const created = await apiCreateTechnician(input);
      setTechnicians((prev) => [created, ...prev.filter((tech) => tech.id !== created.id)]);
      return created;
    } catch (error) {
      const offline = error instanceof TypeError;
      if (!offline) throw error;

      const maxId = technicians.reduce((max, tech) => {
        const numeric = Number(tech.id.replace(/\D/g, ''));
        return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
      }, 0);
      const local: Technician = {
        ...input,
        email: input.email || '',
        id: `TECH-${String(maxId + 1).padStart(3, '0')}`,
        photoUrl:
          input.photoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(input.name)}&background=2563eb&color=fff`,
        rating: input.rating ?? 5,
        reviewsCount: 0,
        completedJobs: 0,
      };
      setTechnicians((prev) => [local, ...prev]);
      return local;
    }
  };

  const updateTechnician = async (
    technicianId: string,
    input: Partial<TechnicianInput>
  ): Promise<Technician> => {
    const applyLocal = (): Technician => {
      const current = technicians.find((tech) => tech.id === technicianId);
      if (!current) throw new Error('Technician not found');
      const updated = { ...current, ...input };
      setTechnicians((prev) =>
        prev.map((tech) => (tech.id === technicianId ? updated : tech))
      );
      return updated;
    };

    try {
      const updated = await apiUpdateTechnician(technicianId, input);
      setTechnicians((prev) =>
        prev.map((tech) => (tech.id === technicianId ? updated : tech))
      );
      return updated;
    } catch (error) {
      if (error instanceof TypeError) return applyLocal();
      throw error;
    }
  };

  const deleteTechnician = async (technicianId: string): Promise<void> => {
    try {
      await apiDeleteTechnician(technicianId);
    } catch (error) {
      if (!(error instanceof TypeError) && !(error instanceof ApiError && error.status === 404)) {
        throw error;
      }
    }
    setTechnicians((prev) => prev.filter((tech) => tech.id !== technicianId));
    setBookings((prev) =>
      prev.map((booking) =>
        booking.technicianId === technicianId
          ? {
              ...booking,
              technicianId: undefined,
              status:
                booking.status === 'technician_assigned' ? 'confirmed' : booking.status,
            }
          : booking
      )
    );
  };

  const addService = async (input: ServiceCategoryInput): Promise<ServiceCategory> => {
    try {
      const created = await apiCreateService(input);
      setServices((prev) => [...prev, created]);
      return created;
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const local: ServiceCategory = {
        ...input,
        id: `${slug}-${Date.now().toString().slice(-4)}`,
      };
      setServices((prev) => [...prev, local]);
      return local;
    }
  };

  const updateService = async (
    serviceId: string,
    input: Partial<ServiceCategoryInput>
  ): Promise<ServiceCategory> => {
    const applyLocal = (): ServiceCategory => {
      const current = services.find((service) => service.id === serviceId);
      if (!current) throw new Error('Service not found');
      const updated = { ...current, ...input };
      setServices((prev) =>
        prev.map((service) => (service.id === serviceId ? updated : service))
      );
      return updated;
    };

    try {
      const updated = await apiUpdateService(serviceId, input);
      setServices((prev) =>
        prev.map((service) => (service.id === serviceId ? updated : service))
      );
      return updated;
    } catch (error) {
      if (error instanceof TypeError) return applyLocal();
      throw error;
    }
  };

  const deleteService = async (serviceId: string): Promise<void> => {
    try {
      await apiDeleteService(serviceId);
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
    setServices((prev) => prev.filter((service) => service.id !== serviceId));
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
    void updateBookingStatusOnServer(bookingId, status, notes).catch(() => undefined);
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
    void assignBookingOnServer(bookingId, technicianId).catch(() => undefined);
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev: Booking[]) =>
      prev.map((b: Booking) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    void cancelBookingOnServer(bookingId).catch(() => undefined);
  };

  const getBookingById = (id: string) => {
    const cleanId = id.trim();
    if (!cleanId) return undefined;
    return bookings.find(
      (b: Booking) =>
        b.id.toLowerCase() === cleanId.toLowerCase() ||
        b.id.replace('#', '').toLowerCase() === cleanId.replace('#', '').toLowerCase()
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
        services,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        addService,
        updateService,
        deleteService,
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
        refreshBookings,
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

// eslint-disable-next-line react-refresh/only-export-components
export const useRepair = () => {
  const context = useContext(RepairContext);
  if (!context) {
    throw new Error('useRepair must be used within a RepairProvider');
  }
  return context;
};
