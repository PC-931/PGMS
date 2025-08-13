import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { db } from '../services/mockDatabase';

export const tenantRouter = Router();

// Apply authentication and tenant role check to all routes
tenantRouter.use(authenticate);
tenantRouter.use(requireRole(['TENANT']));

// Tenant dashboard
tenantRouter.get('/dashboard', async (req: AuthRequest, res, next) => {
  try {
    const tenantId = req.user!.userId;
    
    // Get tenant's room information
    const rooms = await db.getAllRooms();
    const tenantRoom = rooms.find(room => room.tenantId === tenantId);
    
    // Get payment history
    const payments = await db.getPaymentsByTenant(tenantId);
    const pendingPayments = payments.filter(p => p.status === 'PENDING');
    const paidPayments = payments.filter(p => p.status === 'PAID');
    
    // Get maintenance requests
    const maintenanceRequests = await db.getMaintenanceByTenant(tenantId);
    
    res.json({
      room: tenantRoom,
      payments: {
        pending: pendingPayments,
        history: paidPayments.slice(0, 5), // Last 5 payments
        total: payments.length
      },
      maintenance: {
        active: maintenanceRequests.filter(r => r.status !== 'COMPLETED'),
        total: maintenanceRequests.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Payment history
tenantRouter.get('/payments', async (req: AuthRequest, res, next) => {
  try {
    const tenantId = req.user!.userId;
    const payments = await db.getPaymentsByTenant(tenantId);
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// Make payment
tenantRouter.post('/payments/:id/pay', async (req: AuthRequest, res, next) => {
  try {
    const paymentId = req.params.id;
    const tenantId = req.user!.userId;
    
    const payment = await db.updatePayment(paymentId, {
      status: 'PAID',
      paidDate: new Date()
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    return res.json(payment);
  } catch (error) {
    return next(error);
  }
});

// Maintenance requests
tenantRouter.get('/maintenance', async (req: AuthRequest, res, next) => {
  try {
    const tenantId = req.user!.userId;
    const requests = await db.getMaintenanceByTenant(tenantId);
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

tenantRouter.post('/maintenance', async (req: AuthRequest, res, next) => {
  try {
    const tenantId = req.user!.userId;
    const { title, description, priority = 'MEDIUM' } = req.body;
    
    // Get tenant's room
    const rooms = await db.getAllRooms();
    const tenantRoom = rooms.find(room => room.tenantId === tenantId);
    
    if (!tenantRoom) {
      return res.status(400).json({ error: 'No room assigned to tenant' });
    }
    
    const request = await db.createMaintenanceRequest({
      title,
      description,
      priority,
      status: 'PENDING',
      tenantId,
      roomId: tenantRoom.id
    });
    
    return res.status(201).json(request);
  } catch (error) {
    return next(error);
  }
});

// Profile
tenantRouter.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    const user = await db.findUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...userProfile } = user;
    return res.json(userProfile);
  } catch (error) {
    return next(error);
  }
});