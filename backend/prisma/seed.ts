import { PrismaClient, Role, RoomStatus, PaymentStatus, PaymentType, MaintenanceStatus, Priority } from '@prisma/client';
import { hashPassword } from '../src/lib/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in development)
  await prisma.payment.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@rental.com',
      password: adminPassword,
      role: Role.ADMIN,
      firstName: 'John',
      lastName: 'Admin',
      phone: '+1234567890',
    },
  });

  // Create tenant users
  const tenantPassword = await hashPassword('tenant123');
  const tenant1 = await prisma.user.create({
    data: {
      email: 'tenant@rental.com',
      password: tenantPassword,
      role: Role.TENANT,
      firstName: 'Jane',
      lastName: 'Tenant',
      phone: '+0987654321',
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      email: 'tenant2@rental.com',
      password: tenantPassword,
      role: Role.TENANT,
      firstName: 'Bob',
      lastName: 'Smith',
      phone: '+1122334455',
    },
  });

  // Create rooms
  const room1 = await prisma.room.create({
    data: {
      number: '101',
      type: 'Single',
      rent: 800.00,
      deposit: 400.00,
      status: RoomStatus.OCCUPIED,
      floor: 1,
      amenities: ['WiFi', 'AC', 'Parking'],
      tenantId: tenant1.id,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      number: '102',
      type: 'Double',
      rent: 1200.00,
      deposit: 600.00,
      status: RoomStatus.AVAILABLE,
      floor: 1,
      amenities: ['WiFi', 'AC', 'Parking', 'Balcony'],
    },
  });

  const room3 = await prisma.room.create({
    data: {
      number: '201',
      type: 'Studio',
      rent: 950.00,
      deposit: 475.00,
      status: RoomStatus.OCCUPIED,
      floor: 2,
      amenities: ['WiFi', 'AC', 'Kitchen', 'Balcony'],
      tenantId: tenant2.id,
    },
  });

  // Create payments
  await prisma.payment.create({
    data: {
      amount: 800.00,
      dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      paidDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
      status: PaymentStatus.PAID,
      type: PaymentType.RENT,
      tenantId: tenant1.id,
      roomId: room1.id,
    },
  });

  await prisma.payment.create({
    data: {
      amount: 800.00,
      dueDate: new Date(),
      status: PaymentStatus.PENDING,
      type: PaymentType.RENT,
      tenantId: tenant1.id,
      roomId: room1.id,
    },
  });

  await prisma.payment.create({
    data: {
      amount: 950.00,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: PaymentStatus.PENDING,
      type: PaymentType.RENT,
      tenantId: tenant2.id,
      roomId: room3.id,
    },
  });

  // Create maintenance requests
  await prisma.maintenanceRequest.create({
    data: {
      title: 'AC not working',
      description: 'The air conditioner in room 101 is not cooling properly',
      status: MaintenanceStatus.PENDING,
      priority: Priority.HIGH,
      tenantId: tenant1.id,
      roomId: room1.id,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      title: 'Leaky faucet',
      description: 'Bathroom faucet drips constantly',
      status: MaintenanceStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      tenantId: tenant2.id,
      roomId: room3.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👑 Admin: admin@rental.com / admin123`);
  console.log(`👤 Tenant 1: tenant@rental.com / tenant123`);
  console.log(`👤 Tenant 2: tenant2@rental.com / tenant123`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });