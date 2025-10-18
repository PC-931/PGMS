import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { createRoomSchema, createUserSchema } from '../lib/validation';
import { hashPassword } from '../lib/bcrypt';
import { dashboardService } from '../services/dashboardService';
import { roomService } from '../services/roomService';
import { userService } from '../services/userService';
import { maintenanceService } from '../services/maintenanceService';

export const adminRouter = Router();

// Apply authentication and admin role check to all routes
adminRouter.use(authenticate);
adminRouter.use(requireRole(['ADMIN']));

adminRouter.get('/dashboard/stats', async (req, res, next) => {
  try {
    const [dashboardStats, occupancyStats] = await Promise.all([
      dashboardService.getAdminStats(),
      roomService.getRoomOccupancyStats()
    ]);

    res.json({
      ...dashboardStats,
      occupancy: occupancyStats
    });
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
    const rooms = await roomService.getAllRooms();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/rooms', async (req, res, next) => {
  try {
    const roomData = createRoomSchema.parse(req.body);
    const room = await roomService.createRoom({
      ...roomData,
      //status: 'AVAILABLE',
      amenities: roomData.amenities || []
    });
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/rooms/:id', async (req, res, next) => {
  try {
    const roomData = createRoomSchema.partial().parse(req.body);
    const { id } = req.params;

    const room = await roomService.updateRoom(id, roomData);
    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/rooms/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await roomService.deleteRoom(id);

    res.status(204).send(); // ✅ 204 No Content (standard for delete)
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/rooms/:id', async (req, res, next) => {
  try {
    const room = await roomService.findRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    return res.json(room);
  } catch (error) {
    return next(error);
  }
});

adminRouter.get('/rooms/available', async (req, res, next) => {
  try {
    const availableRooms = await roomService.getAvailableRooms();
    return res.json(availableRooms);
  } catch (error) {
    return next(error);
  }
});

// Assign tenant to room
adminRouter.post('/rooms/:roomId/assign-tenant', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const updatedRoom = await roomService.assignTenant(roomId, tenantId);
    return res.json({
      message: 'Tenant assigned successfully',
      room: updatedRoom
    });
  } catch (error) {
    return next(error);
  }
});

// Release tenant from room
adminRouter.delete('/rooms/:roomId/tenants/:tenantId', async (req, res, next) => {
  try {
    const { roomId, tenantId } = req.params;

    const updatedRoom = await roomService.releaseTenant(roomId, tenantId);
    return res.json({
      message: 'Tenant released successfully',
      room: updatedRoom
    });
  } catch (error) {
    return next(error);
  }
});

// Get room occupancy statistics
adminRouter.get('/rooms/stats/occupancy', async (req, res, next) => {
  try {
    const stats = await roomService.getRoomOccupancyStats();
    return res.json(stats);
  } catch (error) {
    return next(error);
  }
});

// Tenant management
adminRouter.get('/tenants', async (req: AuthRequest, res, next) => {
  try {
    const tenants = await userService.getAllTenants();
    res.json(tenants);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /admin/tenants
 * Create a new tenant
 * Body: { email, password, firstName, lastName, phone?, role }
 */
adminRouter.post('/tenants', async (req: AuthRequest, res, next) => {
  try {
    const userData = createUserSchema.parse(req.body);
    const hashedPassword = await hashPassword(userData.password);

    const user = await userService.createUser({
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

/**
 * GET /admin/tenants/unassigned
 * Get tenants not assigned to any room
 */
adminRouter.get('/tenants/unassigned', async (req: AuthRequest, res, next) => {
  try {
    const unassignedTenants = await userService.getUnassignedTenants();
    return res.json(unassignedTenants);
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /admin/tenants/:id
 * Get tenant by ID with detailed information
 */
adminRouter.get('/tenants/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const tenant = await userService.getTenantWithRooms(id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    return res.json(tenant);
  } catch (error) {
    return next(error);
  }
});

/**
 * PUT /admin/tenants/:id
 * Update tenant information
 * Body: { firstName?, lastName?, email?, phone? }
 */
adminRouter.put('/tenants/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    // Validate at least one field is provided
    if (!firstName && !lastName && !email && !phone) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (email) updateData.email = email.trim();
    if (phone) updateData.phone = phone.trim();

    const tenant = await userService.updateTenant(id, updateData);
    return res.json(tenant);
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /admin/tenants/:id
 * Delete a tenant (only if not assigned to any room)
 */
adminRouter.delete('/tenants/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    await userService.deleteTenant(id);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /admin/tenants/stats/overview
 * Get tenant statistics
 */
adminRouter.get('/tenants/stats/overview', async (req: AuthRequest, res, next) => {
  try {
    const stats = await userService.getTenantStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Payment management
adminRouter.get('/payments', async (req, res, next) => {
  try {
    const payments = await userService.getAllTenants();
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// Maintenance management
adminRouter.get('/maintenance', async (req, res, next) => {
  try {
    const requests = await maintenanceService.getAllMaintenance();
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/maintenance/:id', async (req, res, next) => {
  try {
    // Implementation would update maintenance request status
    const requests = await maintenanceService.getMaintenanceById(req.params.id);
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

