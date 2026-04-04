import { Request, Response } from 'express';
import { adminDashboardService } from '../services/adminDashboardService';
import { logger } from '../utils/logger';

export const adminDashboardController = {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminDashboardService.getDashboardStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getRecentActivity(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await adminDashboardService.getRecentActivity(limit);

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      logger.error('Get recent activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getSystemHealth(req: Request, res: Response) {
    try {
      const health = await adminDashboardService.getSystemHealth();

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      logger.error('Get system health error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};