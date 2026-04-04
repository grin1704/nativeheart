import prisma from '../config/database';

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Clean up expired trial subscriptions
 */
export async function cleanupExpiredTrials() {
  try {
    const result = await prisma.user.updateMany({
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
  } catch (error) {
    console.error('❌ Error cleaning up expired trials:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const [
      totalUsers,
      activeUsers,
      totalMemorialPages,
      totalMediaFiles,
      totalMemories,
      totalTributes,
      pendingModerations
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          subscriptionType: {
            in: ['trial', 'premium']
          }
        }
      }),
      prisma.memorialPage.count(),
      prisma.mediaFile.count(),
      prisma.memory.count(),
      prisma.tribute.count(),
      prisma.contentModeration.count({
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
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    throw error;
  }
}

/**
 * Backup database (placeholder for future implementation)
 */
export async function createDatabaseBackup() {
  // This would typically use pg_dump or similar tools
  // For now, just log that backup is needed
  console.log('📦 Database backup functionality to be implemented');
  return {
    status: 'not_implemented',
    message: 'Database backup functionality will be implemented in production'
  };
}