import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { createRoomSchema, createUserSchema } from '../lib/validation';
import { hashPassword } from '../lib/bcrypt';
import { db } from '../services/mockDatabase';

export const adminRouter = Router();

// Apply authentication and admin role check to all routes
adminRouter.use(authenticate);
adminRouter.use(requireRole(['ADMIN']));

// Dashboard stats
adminRouter.get('/dashboard/stats', async (req, res, next) => {
  try {
    const stats = await db.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Recent activity (mock data for now)
adminRouter.get('/dashboard/activity', async (req, res, next) => {
  try {
    const activities = [
      {
        id: '1',
        type: 'payment',
        message: 'Payment received from Room 101',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        amount: 800
      },
      {
        id: '2',
        type: 'maintenance',
        message: 'New maintenance request for Room 101',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        id: '3',
        type: 'tenant',
        message: 'New tenant registered',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
      }
    ];

    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// Room management
adminRouter.get('/rooms', async (req, res, next) => {
  try {
    const rooms = await db.getAllRooms();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/rooms', async (req, res, next) => {
  try {
    const roomData = createRoomSchema.parse(req.body);
    const room = await db.createRoom({
      ...roomData,
      status: 'AVAILABLE',
      amenities: roomData.amenities || []
    });
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/rooms/:id', async (req, res, next) => {
  try {
    const room = await db.findRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    return res.json(room);
  } catch (error) {
    return next(error);
  }
});

// Tenant management
adminRouter.get('/tenants', async (req, res, next) => {
  try {
    const users = await db.getAllRooms(); // This should be updated to get actual tenant data
    res.json(users);
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/tenants', async (req, res, next) => {
  try {
    const userData = createUserSchema.parse(req.body);
    const hashedPassword = await hashPassword(userData.password);
    
    const user = await db.createUser({
      ...userData,
      password: hashedPassword,
      role: 'TENANT'
    });

    // Don't return password in response
    const { password, ...userResponse } = user;
    res.status(201).json(userResponse);
  } catch (error) {
    next(error);
  }
});

// Payment management
adminRouter.get('/payments', async (req, res, next) => {
  try {
    const payments = await db.getAllPayments();
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// Maintenance management
adminRouter.get('/maintenance', async (req, res, next) => {
  try {
    const requests = await db.getAllMaintenance();
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/maintenance/:id', async (req, res, next) => {
  try {
    // Implementation would update maintenance request status
    res.json({ message: 'Maintenance request updated' });
  } catch (error) {
    next(error);
  }
});