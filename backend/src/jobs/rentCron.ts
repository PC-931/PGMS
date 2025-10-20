// backend/src/jobs/rentCron.ts
import cron from 'node-cron';
import { rentService } from '../services/rentService';

// Run daily at midnight
export const startRentCron = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const count = await rentService.updateOverdueRents();
      console.log(`Updated ${count} overdue rents`);
    } catch (error) {
      console.error('Error updating overdue rents:', error);
    }
  });
};
