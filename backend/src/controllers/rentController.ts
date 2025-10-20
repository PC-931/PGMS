// File: backend/src/controllers/rentController.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { rentService } from '../services/rentService';
import { z } from 'zod';

// Validation schemas
const createRentSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  roomId: z.string().uuid('Invalid room ID'),
  amount: z.number().positive('Amount must be positive'),
  periodStart: z.string().datetime('Invalid period start date'),
  periodEnd: z.string().datetime('Invalid period end date'),
  dueDate: z.string().datetime('Invalid due date'),
  notes: z.string().optional()
});

const updateRentSchema = z.object({
  amount: z.number().positive().optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE']).optional(),
  notes: z.string().optional()
});

const createPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be positive'),
  paidAt: z.string().datetime('Invalid payment date'),
  method: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE']),
  reference: z.string().optional(),
  notes: z.string().optional()
});

export class RentController {
  /**
   * GET /api/admin/rents
   * Get all rents with filters
   */
  async getAllRents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        tenantId,
        roomId,
        status,
        startDate,
        endDate,
        search,
        page = '1',
        limit = '10',
        sortBy = 'dueDate',
        sortOrder = 'desc'
      } = req.query;

      const filters = {
        tenantId: tenantId as string,
        roomId: roomId as string,
        status: status as any,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as any,
        sortOrder: sortOrder as any
      };

      const result = await rentService.getAllRents(filters);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/rents/:id
   * Get rent by ID
   */
  async getRentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const rent = await rentService.getRentById(id);

      if (!rent) {
        return res.status(404).json({ error: 'Rent not found' });
      }

      return res.json(rent);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/admin/rents
   * Create new rent
   */
  async createRent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createRentSchema.parse(req.body);
      const createdBy = req.user!.userId;

      const rent = await rentService.createRent(validatedData, createdBy);
      return res.status(201).json(rent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      return next(error);
    }
  }

  /**
   * PUT /api/admin/rents/:id
   * Update rent
   */
  async updateRent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateRentSchema.parse(req.body);

      const rent = await rentService.updateRent(id, validatedData);
      return res.json(rent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      return next(error);
    }
  }

  /**
   * DELETE /api/admin/rents/:id
   * Soft delete rent
   */
  async deleteRent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await rentService.deleteRent(id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/admin/rents/:id/payments
   * Add payment to rent
   */
  async addPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = createPaymentSchema.parse(req.body);
      const createdBy = req.user!.userId;

      const result = await rentService.addPayment(id, validatedData, createdBy);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      return next(error);
    }
  }

  /**
   * GET /api/admin/rents/:id/invoice
   * Generate invoice
   */
  async generateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invoice = await rentService.generateInvoice(id);
      return res.json(invoice);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/rents/summary/monthly
   * Get monthly summary
   */
  async getMonthlySummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          error: 'Month and year are required'
        });
      }

      const summary = await rentService.getMonthlySummary(
        parseInt(month as string),
        parseInt(year as string)
      );

      return res.json(summary);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/admin/rents/update-overdue
   * Update overdue rents (manual trigger)
   */
  async updateOverdueRents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await rentService.updateOverdueRents();
      return res.json({
        message: `Updated ${count} overdue rent(s)`,
        count
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const rentController = new RentController();