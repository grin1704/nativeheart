"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDashboardController = void 0;
const adminDashboardService_1 = require("../services/adminDashboardService");
const logger_1 = require("../utils/logger");
exports.adminDashboardController = {
    async getStats(req, res) {
        try {
            const stats = await adminDashboardService_1.adminDashboardService.getDashboardStats();
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            logger_1.logger.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },
    async getRecentActivity(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const activity = await adminDashboardService_1.adminDashboardService.getRecentActivity(limit);
            res.json({
                success: true,
                data: activity
            });
        }
        catch (error) {
            logger_1.logger.error('Get recent activity error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },
    async getSystemHealth(req, res) {
        try {
            const health = await adminDashboardService_1.adminDashboardService.getSystemHealth();
            res.json({
                success: true,
                data: health
            });
        }
        catch (error) {
            logger_1.logger.error('Get system health error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};
//# sourceMappingURL=adminDashboardController.js.map