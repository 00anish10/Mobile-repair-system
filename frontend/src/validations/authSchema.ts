import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email is required').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Valid email is required').max(100),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;