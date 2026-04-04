import { mediaService } from '../services/mediaService';
import { logger } from '../utils/logger';

/**
 * Job to clean up unused media files
 * This should be run periodically (e.g., daily) to remove orphaned files
 */
export class MediaCleanupJob {
  /**
   * Execute the cleanup job
   */
  static async execute(): Promise<void> {
    try {
      logger.info('Starting media cleanup job...');
      
      const deletedCount = await mediaService.cleanupUnusedFiles();
      
      logger.info(`Media cleanup completed. Deleted ${deletedCount} unused files.`);
    } catch (error) {
      logger.error('Media cleanup job failed:', error);
      throw error;
    }
  }

  /**
   * Schedule the cleanup job to run daily at 2 AM
   * This is a simple implementation - in production, use a proper job scheduler like node-cron
   */
  static scheduleDaily(): void {
    const runCleanup = async () => {
      try {
        await MediaCleanupJob.execute();
      } catch (error) {
        logger.error('Scheduled media cleanup failed:', error);
      }
    };

    // Calculate milliseconds until next 2 AM
    const now = new Date();
    const next2AM = new Date();
    next2AM.setHours(2, 0, 0, 0);
    
    // If it's already past 2 AM today, schedule for tomorrow
    if (now > next2AM) {
      next2AM.setDate(next2AM.getDate() + 1);
    }
    
    const msUntil2AM = next2AM.getTime() - now.getTime();
    
    // Schedule first run
    setTimeout(() => {
      runCleanup();
      
      // Then schedule to run every 24 hours
      setInterval(runCleanup, 24 * 60 * 60 * 1000);
    }, msUntil2AM);
    
    logger.info(`Media cleanup job scheduled to run daily at 2 AM. Next run: ${next2AM.toISOString()}`);
  }
}

// Export for manual execution
export const executeMediaCleanup = MediaCleanupJob.execute;