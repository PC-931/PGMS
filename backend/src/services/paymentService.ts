import { prisma } from './database';
import { RoomStatus, Prisma } from '@prisma/client';
import { Payment } from '@prisma/client';

export class PaymentService {
  async getPaymentsByTenant(tenantId: string): Promise<Payment[]> {
    //return this.payments.filter(payment => payment.tenantId === tenantId);
    return prisma.payment.findMany({ where: { tenantId } });
  }

  async getAllPayments(): Promise<Payment[]> {
    return prisma.payment.findMany();
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    //this.payments.push(newPayment);
    await prisma.payment.create({ data: newPayment });
    return newPayment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    //const paymentIndex = this.payments.findIndex(payment => payment.id === id);
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return null;

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });
    return updatedPayment;
  }
}

export const paymentService = new PaymentService();