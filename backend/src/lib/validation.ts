import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

// Room management schemas
export const roomTypeSchema = z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR'], {
  errorMap: () => ({ message: 'Room type must be SINGLE, DOUBLE, TRIPLE, or FOUR' })
});


export const roomStatusSchema = z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'], {
  errorMap: () => ({ message: 'Room status must be AVAILABLE, OCCUPIED, or MAINTENANCE' })
});

export const createRoomSchema = z.object({
  number: z.string()
    .min(1, 'Room number is required')
    .regex(/^[A-Za-z0-9-]+$/, 'Room number can only contain letters, numbers, and hyphens'),
  type: roomTypeSchema,
  rent: z.number()
    .positive('Rent must be a positive number')
    .min(100, 'Rent must be at least ₹100'),
  deposit: z.number()
    .nonnegative('Deposit cannot be negative')
    .optional()
    .default(0),
  floor: z.number()
    .int('Floor must be an integer')
    .min(0, 'Floor cannot be negative')
    .max(50, 'Floor cannot exceed 50'),
  amenities: z.array(z.string()).optional().default([]),
});

export const updateRoomSchema = createRoomSchema.partial();

// User management schemas
export const userRoleSchema = z.enum(['ADMIN', 'TENANT'], {
  errorMap: () => ({ message: 'Role must be ADMIN or TENANT' })
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password cannot exceed 50 characters'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'Last name can only contain letters and spaces'),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .optional(),
  role: userRoleSchema.optional().default('TENANT'),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// Room assignment schemas
export const assignTenantSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID format'),
});

export const releaseTenantSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID format'),
});

// Payment schemas
export const paymentStatusSchema = z.enum(['PENDING', 'PAID', 'OVERDUE'], {
  errorMap: () => ({ message: 'Payment status must be PENDING, PAID, or OVERDUE' })
});

export const paymentTypeSchema = z.enum(['RENT', 'DEPOSIT', 'MAINTENANCE'], {
  errorMap: () => ({ message: 'Payment type must be RENT, DEPOSIT, or MAINTENANCE' })
});


export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().datetime('Invalid due date format'),
  type: paymentTypeSchema,
  tenantId: z.string().uuid('Invalid tenant ID'),
  roomId: z.string().uuid('Invalid room ID'),
});

// Maintenance request schemas
export const maintenancePrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH'], {
  errorMap: () => ({ message: 'Priority must be LOW, MEDIUM, or HIGH' })
});

export const maintenanceStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'], {
  errorMap: () => ({ message: 'Status must be PENDING, IN_PROGRESS, or COMPLETED' })
});

export const createMaintenanceSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  priority: maintenancePrioritySchema.optional().default('MEDIUM'),
  roomId: z.string().uuid('Invalid room ID'),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
}).transform(({ page, limit }) => ({
  page: Math.max(1, page),
  limit: Math.min(Math.max(1, limit), 100), // Cap at 100 items per page
}));

export const roomFilterSchema = z.object({
  status: roomStatusSchema.optional(),
  type: roomTypeSchema.optional(),
  floor: z.string().regex(/^\d+$/).transform(Number).optional(),
  minRent: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  maxRent: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  available: z.string().regex(/^(true|false)$/).transform(val => val === 'true').optional(),
}).refine(data => {
  if (data.minRent && data.maxRent) {
    return data.minRent <= data.maxRent;
  }
  return true;
}, {
  message: 'Minimum rent cannot be greater than maximum rent',
});

export const tenantFilterSchema = z.object({
  assigned: z.string().regex(/^(true|false)$/).transform(val => val === 'true').optional(),
  roomId: z.string().uuid().optional(),
});


// Validation helper functions
export const validateUUID = (id: string, fieldName: string = 'ID') => {
  const uuidSchema = z.string().uuid(`Invalid ${fieldName} format`);
  return uuidSchema.parse(id);
};

export const validatePaginationParams = (query: any) => {
  return paginationSchema.parse(query);
};

export const validateRoomFilters = (query: any) => {
  return roomFilterSchema.parse(query);
};

export const validateTenantFilters = (query: any) => {
  return tenantFilterSchema.parse(query);
};

// Error response helper
export const formatValidationError = (error: z.ZodError) => {
  return {
    error: 'Validation failed',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['RENT', 'DEPOSIT', 'MAINTENANCE']),
  dueDate: z.string().datetime()
});