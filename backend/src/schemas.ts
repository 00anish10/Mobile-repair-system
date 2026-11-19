import { z } from 'zod';

export const phoneSchema = z
  .string()
  .trim()
  .min(8, 'Phone number too short')
  .max(40, 'Phone number too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().toLowerCase().email('A valid email is required').max(255),
  password: passwordSchema,
  phone: phoneSchema.optional(),
  role: z.enum(['customer', 'admin', 'technician']).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(32, 'Reset token is invalid').max(256),
  password: passwordSchema,
});

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    phone: phoneSchema.optional(),
    avatar: z.string().url().max(2000).optional().or(z.literal('')),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const bookingCreateSchema = z.object({
  reference: z.string().trim().max(40).optional(),
  customer_name: z.string().trim().min(2).max(120),
  customer_phone: phoneSchema,
  customer_email: z.string().trim().toLowerCase().email(),
  address: z.string().trim().min(3).max(500),
  city: z.string().trim().min(2).max(120),
  area: z.string().trim().min(2).max(120),
  landmark: z.string().trim().max(255).optional().or(z.literal('')),
  device_type: z.string().trim().max(50).default('other'),
  brand: z.string().trim().min(1).max(120),
  model: z.string().trim().min(1).max(160),
  problem_id: z.string().trim().min(1).max(80),
  problem_title: z.string().trim().min(1).max(160),
  problem_description: z.string().trim().max(2000).optional().or(z.literal('')),
  service_type: z.enum(['home', 'office', 'pickup', 'workshop']).default('home'),
  scheduled_date: isoDate,
  scheduled_time_slot: z.string().trim().min(3).max(80),
  estimated_cost_rs: z.coerce.number().min(0).max(1_000_000).default(0),
  payment_method: z
    .enum(['cash_on_delivery', 'card', 'apple_pay', 'google_pay', 'paypal'])
    .default('cash_on_delivery'),
  technician_id: z.coerce.number().int().positive().optional(),
  photo_urls: z.array(z.string().url()).max(10).optional(),
});

export const bookingStatusSchema = z.object({
  status: z.enum([
    'confirmed',
    'technician_assigned',
    'technician_en_route',
    'technician_arrived',
    'in_progress',
    'completed',
    'cancelled',
  ]),
  notes: z.string().trim().max(2000).optional(),
});

export const assignTechnicianSchema = z.object({
  technician_id: z.coerce.number().int().positive(),
});

export const technicianCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: phoneSchema.optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  specialty: z.string().trim().max(160).optional(),
  experience_years: z.coerce.number().int().min(0).max(60).default(0),
  avatar: z.string().url().optional(),
  rating: z.coerce.number().min(0).max(5).default(5),
  vehicle: z.string().trim().max(120).optional(),
  license_plate: z.string().trim().max(40).optional(),
  status: z.enum(['available', 'on_job', 'offline']).default('available'),
  specialties: z.array(z.string().trim().min(1)).max(20).default([]),
  active_areas: z.array(z.string().trim().min(1)).max(40).default([]),
});

export const serviceCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words separated by hyphens')
    .optional(),
  title: z.string().trim().min(2).max(160),
  icon: z.string().trim().max(60).default('Smartphone'),
  description: z.string().trim().min(10).max(2000),
  starting_price_rs: z.coerce.number().int().min(0).max(10_000_000),
  warranty_text: z.string().trim().min(2).max(200),
  popular_models: z.array(z.string().trim().min(1)).max(30).default([]),
  is_active: z.boolean().default(true),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(4000),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export function formatZodError(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'body';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
