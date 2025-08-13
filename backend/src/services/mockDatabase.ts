import { User, Room, Payment, MaintenanceRequest } from '../types';
import { hashPassword } from '../lib/bcrypt';

// Mock database - In production, use Prisma/MongoDB/PostgreSQL
class MockDatabase {
  private users: User[] = [];
  private rooms: Room[] = [];
  private payments: Payment[] = [];
  private maintenanceRequests: MaintenanceRequest[] = [];

  async init() {
    // Create demo users
    const adminPassword = await hashPassword('admin123');
    const tenantPassword = await hashPassword('tenant123');

    this.users = [
      {
        id: '1',
        email: 'admin@rental.com',
        password: adminPassword,
        role: 'ADMIN',
        firstName: 'John',
        lastName: 'Admin',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        email: 'tenant@rental.com',
        password: tenantPassword,
        role: 'TENANT',
        firstName: 'Jane',
        lastName: 'Tenant',
        phone: '+0987654321',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.rooms = [
      {
        id: '1',
        number: '101',
        type: 'Single',
        rent: 800,
        deposit: 400,
        status: 'OCCUPIED',
        floor: 1,
        amenities: ['WiFi', 'AC', 'Parking'],
        tenantId: '2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        number: '102',
        type: 'Double',
        rent: 1200,
        deposit: 600,
        status: 'AVAILABLE',
        floor: 1,
        amenities: ['WiFi', 'AC', 'Parking', 'Balcony'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.payments = [
      {
        id: '1',
        amount: 800,
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        paidDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        status: 'PAID',
        type: 'RENT',
        tenantId: '2',
        roomId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        amount: 800,
        dueDate: new Date(),
        status: 'PENDING',
        type: 'RENT',
        tenantId: '2',
        roomId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.maintenanceRequests = [
      {
        id: '1',
        title: 'AC not working',
        description: 'The air conditioner in room 101 is not cooling properly',
        status: 'PENDING',
        priority: 'HIGH',
        tenantId: '2',
        roomId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // User methods
  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Room methods
  async getAllRooms(): Promise<Room[]> {
    return this.rooms;
  }

  async findRoomById(id: string): Promise<Room | null> {
    return this.rooms.find(room => room.id === id) || null;
  }

  async createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    const newRoom: Room = {
      ...roomData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.rooms.push(newRoom);
    return newRoom;
  }

  // Payment methods
  async getPaymentsByTenant(tenantId: string): Promise<Payment[]> {
    return this.payments.filter(payment => payment.tenantId === tenantId);
  }

  async getAllPayments(): Promise<Payment[]> {
    return this.payments;
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.payments.push(newPayment);
    return newPayment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const paymentIndex = this.payments.findIndex(payment => payment.id === id);
    if (paymentIndex === -1) return null;
    
    this.payments[paymentIndex] = {
      ...this.payments[paymentIndex],
      ...updates,
      updatedAt: new Date()
    };
    return this.payments[paymentIndex];
  }

  // Maintenance methods
  async getMaintenanceByTenant(tenantId: string): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequests.filter(req => req.tenantId === tenantId);
  }

  async getAllMaintenance(): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequests;
  }

  async createMaintenanceRequest(data: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest> {
    const newRequest: MaintenanceRequest = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.maintenanceRequests.push(newRequest);
    return newRequest;
  }

  // Dashboard stats
  async getDashboardStats() {
    const totalRooms = this.rooms.length;
    const occupiedRooms = this.rooms.filter(room => room.status === 'OCCUPIED').length;
    const totalTenants = this.users.filter(user => user.role === 'TENANT').length;
    const totalRevenue = this.payments
      .filter(payment => payment.status === 'PAID')
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pendingPayments = this.payments.filter(payment => payment.status === 'PENDING').length;

    return {
      totalRooms,
      occupiedRooms,
      availableRooms: totalRooms - occupiedRooms,
      totalTenants,
      totalRevenue,
      pendingPayments,
      occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
    };
  }
}

export const db = new MockDatabase();
db.init();