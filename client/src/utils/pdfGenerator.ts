import jsPDF from 'jspdf';
import { RentInvoice } from '../types/rent';

export const generateInvoicePDF = (invoice: RentInvoice) => {
  const doc = new jsPDF();
  doc.text(`Invoice: ${invoice.invoiceNumber}`, 10, 10);
  doc.text(`Tenant: ${invoice.tenant.name}`, 10, 20);
  doc.text(`Room: ${invoice.room.number}`, 10, 30);
  doc.text(`Amount: ₹${invoice.amount}`, 10, 40);
  doc.save(`${invoice.invoiceNumber}.pdf`);
};