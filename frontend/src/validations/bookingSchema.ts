import { z } from 'zod';

export const bookingSchema = z.object({
  // Step 1: Device
  selectedBrand: z.string().nonempty('Please select a brand'),
  selectedModel: z.string().nonempty('Please select a model'),

  // Step 2: Problem
  problemId: z.string().nonempty('Please select a repair issue'),

  // Step 3: Service Type
  serviceType: z.enum(['home', 'office', 'pickup', 'workshop']),

  // Step 4: Location
  address: z.string().min(1, 'Street address is required for doorstep visit'),
  city: z.string().nonempty('Please choose city'),
  area: z.string().min(1, 'Area/neighborhood is required'),

  // Step 5: Schedule
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please pick a valid date'),
  scheduledTimeSlot: z.string().nonempty('Please pick an arrival time slot'),

  // Step 6: Customer Details
  customerName: z.string().min(2, 'Full name is required').max(50),
  customerPhone: z.string()
    .regex(/^(?:\+?61|0)[\s-]?\d(?:[\s-]?\d){8}$/, 'Valid phone number is required for the technician to reach you')
    .or(z.string().min(8, 'Valid phone number is required for the technician to reach you')),
  customerEmail: z.string()
    .email('Valid email is required for the booking confirmation')
    .max(100),

  // Payment
  paymentMethod: z.enum(['cash_on_delivery', 'card', 'apple_pay', 'google_pay', 'paypal']),
  
  // Calculated fields (not validated, just passed through)
  estimatedCostRs: z.number().optional(),
  photoUrls: z.array(z.string()).optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;