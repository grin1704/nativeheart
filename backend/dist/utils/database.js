"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = testDatabaseConnection;
exports.getDatabaseHealth = getDatabaseHealth;
exports.cleanupExpiredTrials = cleanupExpiredTrials;
exports.getDatabaseStats = getDatabaseStats;
exports.createDatabaseBackup = createDatabaseBackup;
const database_1 = __importDefault(require("../config/database"));
async function testDatabaseConnection() {
    try {
        await database_1.default.$queryRaw `SELECT 1`;
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
async function getDatabaseHealth() {
    try {
        const start = Date.now();
        await database_1.default.$queryRaw `SELECT 1`;
        const responseTime = Date.now() - start;
        return {
            status: 'healthy',
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        };
    }
}
async function cleanupExpiredTrials() {
    try {
        const result = await database_1.default.user.updateMany({
            where: {
                subscriptionType: 'trial',
                subscriptionExpiresAt: {
                    lt: new Date()
                }
            },
            data: {
                subscriptionType: 'free',
                subscriptionExpiresAt: null
            }
        });
        console.log(`✅ Cleaned up ${result.count} expired trial subscriptions`);
        return result.count;
    }
    catch (error) {
        console.error('❌ Error cleaning up expired trials:', error);
        throw error;
    }
}
async function getDatabaseStats() {
    try {
        const [totalUsers, activeUsers, totalMemorialPages, totalMediaFiles, totalMemories, totalTributes, pendingModerations] = await Promise.all([
            database_1.default.user.count(),
            database_1.default.user.count({
                where: {
                    subscriptionType: {
                        in: ['trial', 'premium']
                    }
                }
            }),
            database_1.default.memorialPage.count(),
            database_1.default.mediaFile.count(),
            database_1.default.memory.count(),
            database_1.default.tribute.count(),
            database_1.default.contentModeration.count({
                where: {
                    status: 'pending'
                }
            })
        ]);
        return {
            users: {
                total: totalUsers,
                active: activeUsers
            },
            content: {
                memorialPages: totalMemorialPages,
                mediaFiles: totalMediaFiles,
                memories: totalMemories,
                tributes: totalTributes
            },
            moderation: {
                pending: pendingModerations
            }
        };
    }
    catch (error) {
        console.error('❌ Error getting database stats:', error);
        throw error;
    }
}
async function createDatabaseBackup() {
    console.log('📦 Database backup functionality to be implemented');
    return {
        status: 'not_implemented',
        message: 'Database backup functionality will be implemented in production'
    };
}
//# sourceMappingURL=database.js.map