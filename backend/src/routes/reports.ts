// backend/src/routes/reports.ts
import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { reportService } from '../services/reportService';
import { ReportData, ReportConfig } from '../types';

export const reportsRouter = Router();

// Apply authentication and admin role check to all routes
reportsRouter.use(authenticate);
reportsRouter.use(requireRole(['ADMIN']));

// Generate report
reportsRouter.post('/generate', async (req: AuthRequest, res, next) => {
  try {
    const config: ReportConfig = req.body;
    const userId = req.user!.userId;
    
    // Validate request body
    if (!config.type || !config.period || !config.format) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const report = await reportService.generateReport(config, userId);
    
    return res.status(201).json({
      message: 'Report generated successfully',
      report
    });
  } catch (error) {
    return next(error);
  }
});

// Get report data (for preview)
reportsRouter.get('/data/:type/:period', async (req: AuthRequest, res, next) => {
  try {
    const { type, period } = req.params;
    
    const data = await reportService.getReportData(type, period);
    
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

// Download report
reportsRouter.get('/download/:reportId', async (req: AuthRequest, res, next) => {
  try {
    const { reportId } = req.params;
    
    // In a real implementation, you would:
    // 1. Validate the reportId
    // 2. Check if the user has permission to download
    // 3. Stream the file from storage
    
    // Mock implementation
    return res.json({ 
      message: 'Report download would start here',
      reportId,
      downloadUrl: `/files/reports/${reportId}`
    });
  } catch (error) {
    return next(error);
  }
});
