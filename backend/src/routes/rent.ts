// File: backend/src/routes/rent.ts

import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { rentController } from '../controllers/rentController';

export const rentRouter = Router();

// Apply authentication and admin role check to all routes
rentRouter.use(authenticate);
rentRouter.use(requireRole(['ADMIN']));

/**
 * GET /api/admin/rents/summary/monthly
 * Get monthly summary (must be before /:id to avoid conflict)
 */
rentRouter.get('/summary/monthly', rentController.getMonthlySummary.bind(rentController));

/**
 * POST /api/admin/rents/update-overdue
 * Manually trigger overdue rent updates
 */
rentRouter.post('/update-overdue', rentController.updateOverdueRents.bind(rentController));

/**
 * GET /api/admin/rents
 * Get all rents with filters and pagination
 */
rentRouter.get('/', rentController.getAllRents.bind(rentController));

/**
 * POST /api/admin/rents
 * Create new rent entry
 */
rentRouter.post('/', rentController.createRent.bind(rentController));

/**
 * GET /api/admin/rents/:id
 * Get rent by ID
 */
rentRouter.get('/:id', rentController.getRentById.bind(rentController));

/**
 * PUT /api/admin/rents/:id
 * Update rent
 */
rentRouter.put('/:id', rentController.updateRent.bind(rentController));

/**
 * DELETE /api/admin/rents/:id
 * Soft delete rent
 */
rentRouter.delete('/:id', rentController.deleteRent.bind(rentController));

/**
 * POST /api/admin/rents/:id/payments
 * Add payment to rent
 */
rentRouter.post('/:id/payments', rentController.addPayment.bind(rentController));

/**
 * GET /api/admin/rents/:id/invoice
 * Generate invoice for rent
 */
rentRouter.get('/:id/invoice', rentController.generateInvoice.bind(rentController));