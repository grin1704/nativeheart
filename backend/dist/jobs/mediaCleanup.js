"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeMediaCleanup = exports.MediaCleanupJob = void 0;
const mediaService_1 = require("../services/mediaService");
const logger_1 = require("../utils/logger");
class MediaCleanupJob {
    static async execute() {
        try {
            logger_1.logger.info('Starting media cleanup job...');
            const deletedCount = await mediaService_1.mediaService.cleanupUnusedFiles();
            logger_1.logger.info(`Media cleanup completed. Deleted ${deletedCount} unused files.`);
        }
        catch (error) {
            logger_1.logger.error('Media cleanup job failed:', error);
            throw error;
        }
    }
    static scheduleDaily() {
        const runCleanup = async () => {
            try {
                await MediaCleanupJob.execute();
            }
            catch (error) {
                logger_1.logger.error('Scheduled media cleanup failed:', error);
            }
        };
        const now = new Date();
        const next2AM = new Date();
        next2AM.setHours(2, 0, 0, 0);
        if (now > next2AM) {
            next2AM.setDate(next2AM.getDate() + 1);
        }
        const msUntil2AM = next2AM.getTime() - now.getTime();
        setTimeout(() => {
            runCleanup();
            setInterval(runCleanup, 24 * 60 * 60 * 1000);
        }, msUntil2AM);
        logger_1.logger.info(`Media cleanup job scheduled to run daily at 2 AM. Next run: ${next2AM.toISOString()}`);
    }
}
exports.MediaCleanupJob = MediaCleanupJob;
exports.executeMediaCleanup = MediaCleanupJob.execute;
//# sourceMappingURL=mediaCleanup.js.map