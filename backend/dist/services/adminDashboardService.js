"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDashboardService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
exports.adminDashboardService = {
    async getDashboardStats() {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const totalUsers = await prisma.user.count();
            const trialUsers = await prisma.user.count({
                where: { subscriptionType: 'trial' }
            });
            const freeUsers = await prisma.user.count({
                where: { subscriptionType: 'free' }
            });
            const premiumUsers = await prisma.user.count({
                where: { subscriptionType: 'premium' }
            });
            const newUsersThisMonth = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            });
            const totalPages = await prisma.memorialPage.count();
            const privatePages = await prisma.memorialPage.count({
                where: { isPrivate: true }
            });
            const newPagesThisMonth = await prisma.memorialPage.count({
                where: {
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            });
            const totalMemories = await prisma.memory.count();
            const totalTributes = await prisma.tribute.count();
            const pendingTributes = await prisma.tribute.count({
                where: { isApproved: false }
            });
            const totalMediaFiles = await prisma.mediaFile.count();
            const storageResult = await prisma.mediaFile.aggregate({
                _sum: {
                    size: true
                }
            });
            const storageUsed = storageResult._sum.size || 0;
            const pagesCreatedToday = await prisma.memorialPage.count({
                where: {
                    createdAt: {
                        gte: startOfDay
                    }
                }
            });
            const tributesSubmittedToday = await prisma.tribute.count({
                where: {
                    createdAt: {
                        gte: startOfDay
                    }
                }
            });
            return {
                users: {
                    total: totalUsers,
                    active: totalUsers,
                    trial: trialUsers,
                    free: freeUsers,
                    premium: premiumUsers,
                    newThisMonth: newUsersThisMonth
                },
                memorialPages: {
                    total: totalPages,
                    published: totalPages - privatePages,
                    private: privatePages,
                    newThisMonth: newPagesThisMonth
                },
                content: {
                    totalMemories,
                    totalTributes,
                    pendingTributes,
                    totalMediaFiles,
                    storageUsed
                },
                activity: {
                    loginsToday: 0,
                    pagesCreatedToday,
                    tributesSubmittedToday
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Dashboard stats service error:', error);
            throw error;
        }
    },
    async getRecentActivity(limit = 10) {
        try {
            const recentPages = await prisma.memorialPage.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: {
                        select: { name: true, email: true }
                    }
                }
            });
            const recentTributes = await prisma.tribute.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    memorialPage: {
                        select: { fullName: true, slug: true }
                    }
                }
            });
            const recentUsers = await prisma.user.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    subscriptionType: true,
                    createdAt: true
                }
            });
            return {
                recentPages: recentPages.map(page => ({
                    id: page.id,
                    fullName: page.fullName,
                    slug: page.slug,
                    owner: page.owner.name,
                    createdAt: page.createdAt
                })),
                recentTributes: recentTributes.map(tribute => ({
                    id: tribute.id,
                    authorName: tribute.authorName,
                    memorialPageName: tribute.memorialPage.fullName,
                    memorialPageSlug: tribute.memorialPage.slug,
                    isApproved: tribute.isApproved,
                    createdAt: tribute.createdAt
                })),
                recentUsers: recentUsers
            };
        }
        catch (error) {
            logger_1.logger.error('Recent activity service error:', error);
            throw error;
        }
    },
    async getSystemHealth() {
        try {
            const dbCheck = await prisma.$queryRaw `SELECT 1`;
            const memoryUsage = process.memoryUsage();
            const uptime = process.uptime();
            return {
                database: {
                    status: dbCheck ? 'healthy' : 'error',
                    responseTime: Date.now()
                },
                server: {
                    uptime: Math.floor(uptime),
                    memoryUsage: {
                        rss: Math.round(memoryUsage.rss / 1024 / 1024),
                        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024)
                    }
                },
                timestamp: new Date()
            };
        }
        catch (error) {
            logger_1.logger.error('System health service error:', error);
            throw error;
        }
    }
};
//# sourceMappingURL=adminDashboardService.js.map