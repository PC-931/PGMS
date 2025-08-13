import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'TENANT'])
});

export const createRoomSchema = z.object({
  number: z.string().min(1, 'Room number is required'),
  type: z.string().min(1, 'Room type is required'),
  rent: z.number().positive('Rent must be positive'),
  deposit: z.number().positive('Deposit must be positive'),
  floor: z.number().int().positive('Floor must be a positive integer'),
  amenities: z.array(z.string()).optional()
});

export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['RENT', 'DEPOSIT', 'MAINTENANCE']),
  dueDate: z.string().datetime()
});