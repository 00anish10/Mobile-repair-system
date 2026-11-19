import type {
  Booking,
  BookingStatus,
  ServiceCategory,
  ServiceCategoryInput,
  Technician,
  TechnicianInput,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api';
const TOKEN_KEY = 'moon_mobile_token';
const REQUEST_TIMEOUT_MS = 8000;

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'technician';
  avatar?: string;
}

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const token = getToken();

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (response.status === 401 && token) {
      setToken(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('moon-auth-expired'));
      }
    }

    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload && 'error' in payload
          ? String((payload as { error: string }).error)
          : `Request failed with status ${response.status}`;
      const fields =
        typeof payload === 'object' && payload && 'fields' in payload
          ? ((payload as { fields: Record<string, string> }).fields)
          : undefined;
      throw new ApiError(message, response.status, fields);
    }

    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof DOMException && error.name === 'AbortError');
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
}

export function apiLogin(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function apiRegister(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/users/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiUpdateProfile(data: {
  name?: string;
  phone?: string;
  avatar?: string;
}): Promise<{ user: ApiUser }> {
  return request<{ user: ApiUser }>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function apiMe(): Promise<{ user: ApiUser }> {
  return request<{ user: ApiUser }>('/users/me');
}

export function apiForgotPassword(email: string): Promise<{ message: string }> {
  return request<{ message: string }>('/users/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function apiResetPassword(token: string, password: string): Promise<{ message: string }> {
  return request<{ message: string }>('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export function apiHealth(): Promise<{ status: string; database: string }> {
  return request<{ status: string; database: string }>('/health', {}, 4000);
}

function toServerBooking(booking: Booking) {
  return {
    reference: booking.id.replace(/^#/, ''),
    customer_name: booking.customerName,
    customer_phone: booking.customerPhone,
    customer_email: booking.customerEmail,
    address: booking.address,
    city: booking.city,
    area: booking.area,
    landmark: booking.landmark || '',
    device_type: booking.deviceType,
    brand: booking.brand,
    model: booking.model,
    problem_id: booking.problemId,
    problem_title: booking.problemTitle,
    problem_description: booking.problemDescription || '',
    service_type: booking.serviceType,
    scheduled_date: booking.scheduledDate,
    scheduled_time_slot: booking.scheduledTimeSlot,
    estimated_cost_rs: booking.estimatedCostRs,
    payment_method: booking.paymentMethod,
    technician_id: booking.technicianId
      ? Number(booking.technicianId.replace(/\D/g, '')) || undefined
      : undefined,
    photo_urls: booking.photoUrls ?? [],
  };
}

export function createBookingOnServer(booking: Booking): Promise<unknown> {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(toServerBooking(booking)),
  });
}

export function apiListBookings(): Promise<Booking[]> {
  return request<Booking[]>('/bookings?limit=200');
}

function referencePath(bookingId: string): string {
  return encodeURIComponent(bookingId.replace(/^#/, '').toUpperCase());
}

export function updateBookingStatusOnServer(
  bookingId: string,
  status: BookingStatus,
  notes?: string
): Promise<unknown> {
  return request(`/bookings/${referencePath(bookingId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
}

export function assignBookingOnServer(
  bookingId: string,
  technicianId: string
): Promise<unknown> {
  const numericId = Number(technicianId.replace(/\D/g, ''));
  return request(`/bookings/${referencePath(bookingId)}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ technician_id: numericId }),
  });
}

export function cancelBookingOnServer(bookingId: string): Promise<unknown> {
  return request(`/bookings/${referencePath(bookingId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'cancelled' }),
  });
}

export function markBookingPaidOnServer(bookingId: string): Promise<unknown> {
  return request(`/bookings/${referencePath(bookingId)}/payment`, { method: 'PATCH' });
}

export function apiContact(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ id: number; message: string }> {
  return request('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


export interface SupportMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface BookingStatsSummary {
  totals: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    revenueRs: number;
    avgCostRs: number;
  };
  statusDistribution: Array<{ status: string; count: number }>;
  last7Days: Array<{ day: string; count: number; revenueRs: number }>;
  topDevices: Array<{ device: string; count: number }>;
  topIssues: Array<{ issue: string; count: number }>;
  technicianLoad: Array<{
    id: string;
    name: string;
    status: string;
    activeJobs: number;
    completedJobs: number;
  }>;
}

export function apiListContactMessages(): Promise<SupportMessage[]> {
  return request<SupportMessage[]>('/contact');
}

export function apiMarkContactRead(id: number): Promise<SupportMessage> {
  return request<SupportMessage>(`/contact/${id}/read`, { method: 'PATCH' });
}

export function apiDeleteContactMessage(id: number): Promise<void> {
  return request<void>(`/contact/${id}`, { method: 'DELETE' });
}

export function apiBookingStats(): Promise<BookingStatsSummary> {
  return request<BookingStatsSummary>('/bookings/stats/summary');
}

export async function downloadBookingsCsv(): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/bookings/export.csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    if (response.status === 401 && token) {
      setToken(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('moon-auth-expired'));
      }
    }
    throw new ApiError('Could not export bookings', response.status);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `moon-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}


function toServerTechnician(data: TechnicianInput) {
  return {
    name: data.name,
    phone: data.phone || undefined,
    email: data.email || undefined,
    avatar: data.photoUrl || undefined,
    rating: data.rating,
    experience_years: data.experienceYears,
    vehicle: data.vehicle || undefined,
    license_plate: data.licensePlate || undefined,
    status: data.status,
    specialties: data.specialties,
    active_areas: data.activeAreas,
  };
}

export function apiListTechnicians(): Promise<Technician[]> {
  return request<Technician[]>('/technicians', {}, 5000);
}

export function apiCreateTechnician(data: TechnicianInput): Promise<Technician> {
  return request<Technician>('/technicians', {
    method: 'POST',
    body: JSON.stringify(toServerTechnician(data)),
  });
}

export function apiUpdateTechnician(
  technicianId: string,
  data: Partial<TechnicianInput>
): Promise<Technician> {
  const payload = toServerTechnician({
    name: data.name ?? '',
    phone: data.phone ?? '',
    email: data.email,
    photoUrl: data.photoUrl,
    rating: data.rating,
    experienceYears: data.experienceYears ?? 0,
    vehicle: data.vehicle ?? '',
    licensePlate: data.licensePlate ?? '',
    activeAreas: data.activeAreas ?? [],
    status: data.status ?? 'available',
    specialties: data.specialties ?? [],
  });

  if (data.name === undefined) delete payload.name;
  if (data.phone === undefined) delete payload.phone;
  if (data.experienceYears === undefined) delete payload.experience_years;
  if (data.vehicle === undefined) delete payload.vehicle;
  if (data.licensePlate === undefined) delete payload.license_plate;
  if (data.activeAreas === undefined) delete payload.active_areas;
  if (data.specialties === undefined) delete payload.specialties;

  return request<Technician>(
    `/technicians/${encodeURIComponent(technicianId.replace(/\D/g, ''))}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

function toServerService(data: ServiceCategoryInput) {
  return {
    title: data.title,
    icon: data.icon,
    description: data.description,
    starting_price_rs: data.startingPriceRs,
    warranty_text: data.warrantyText,
    popular_models: data.popularModels,
    is_active: data.isActive ?? true,
  };
}

export function apiDeleteTechnician(technicianId: string): Promise<void> {
  return request<void>(`/technicians/${encodeURIComponent(technicianId.replace(/\D/g, ''))}`, {
    method: 'DELETE',
  });
}

export function apiListServices(): Promise<ServiceCategory[]> {
  return request<ServiceCategory[]>('/services', {}, 5000);
}

export function apiCreateService(data: ServiceCategoryInput): Promise<ServiceCategory> {
  return request<ServiceCategory>('/services', {
    method: 'POST',
    body: JSON.stringify(toServerService(data)),
  });
}

export function apiUpdateService(
  serviceId: string,
  data: Partial<ServiceCategoryInput>
): Promise<ServiceCategory> {
  const payload = toServerService({
    title: data.title ?? '',
    icon: data.icon ?? 'Smartphone',
    description: data.description ?? '',
    startingPriceRs: data.startingPriceRs ?? 0,
    warrantyText: data.warrantyText ?? '',
    popularModels: data.popularModels ?? [],
    isActive: data.isActive ?? true,
  });

  if (data.title === undefined) delete payload.title;
  if (data.icon === undefined) delete payload.icon;
  if (data.description === undefined) delete payload.description;
  if (data.startingPriceRs === undefined) delete payload.starting_price_rs;
  if (data.warrantyText === undefined) delete payload.warranty_text;
  if (data.popularModels === undefined) delete payload.popular_models;
  if (data.isActive === undefined) delete payload.is_active;

  return request<ServiceCategory>(`/services/${encodeURIComponent(serviceId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function apiDeleteService(serviceId: string): Promise<void> {
  return request<void>(`/services/${encodeURIComponent(serviceId)}`, { method: 'DELETE' });
}
