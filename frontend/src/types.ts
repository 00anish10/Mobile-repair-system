export type DeviceType = 'mobile' | 'iphone' | 'android' | 'tablet' | 'laptop' | 'other';

export type ServiceType = 'home' | 'office' | 'pickup' | 'workshop';

export type BookingStatus = 
  | 'confirmed'
  | 'technician_assigned'
  | 'technician_en_route'
  | 'technician_arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface RepairIssue {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  basePriceRs: number;
  warrantyMonths: number;
  category: DeviceType[];
}

export interface DeviceBrand {
  id: string;
  name: string;
  category: DeviceType;
  models: string[];
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  vehicle: string;
  licensePlate: string;
  activeAreas: string[];
  status: 'available' | 'on_job' | 'offline';
  completedJobs: number;
  specialties: string[];
}

export interface Booking {
  id: string; // e.g. #REP-2026-00125
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  area: string;
  landmark?: string;
  deviceType: DeviceType;
  brand: string;
  model: string;
  problemId: string;
  problemTitle: string;
  problemDescription: string;
  serviceType: ServiceType;
  scheduledDate: string;
  scheduledTimeSlot: string;
  estimatedCostRs: number;
  status: BookingStatus;
  technicianId?: string;
  paymentMethod: 'cash_on_delivery' | 'card' | 'apple_pay' | 'google_pay' | 'paypal';
  paymentStatus: 'pending' | 'paid';
  photoUrls?: string[];
  warrantyDuration: string;
  warrantyValidUntil?: string;
  technicianNotes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  joinedDate: string;
  totalSpentAud: number;
}

export interface ServiceCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  startingPriceRs: number;
  warrantyText: string;
  popularModels: string[];
}

export interface ServiceArea {
  city: string;
  state: string;
  isAvailable: boolean;
  hubs: string[];
  responseTimeMinutes: number;
  techniciansCount: number;
}

export interface Review {
  id: string;
  customerName: string;
  avatarUrl: string;
  rating: number;
  device: string;
  repairType: string;
  comment: string;
  date: string;
  verified: boolean;
  location: string;
}
