import express from 'express';
import { adminAuthController } from '../controllers/adminAuthController';
import { adminDashboardController } from '../controllers/adminDashboardController';
import { adminUserController } from '../controllers/adminUserController';
import { adminModerationController } from '../controllers/adminModerationController';
import { adminSettingsController } from '../controllers/adminSettingsController';
import { adminAuth, requirePermission } from '../middleware/adminAuth';
import { validateRequest } from '../middleware/validation';
import { 
  adminLoginSchema, 
  refreshTokenSchema, 
  suspendUserSchema, 
  updateUserSubscriptionSchema,
  getUsersQuerySchema 
} from '../validation/admin';

const router = express.Router();

// Authentication routes
router.post('/auth/login', validateRequest(adminLoginSchema), adminAuthController.login);
router.post('/auth/refresh', validateRequest(refreshTokenSchema), adminAuthController.refreshToken);

// Protected routes
router.use(adminAuth); // Apply admin authentication to all routes below

router.get('/auth/profile', adminAuthController.getProfile);
router.post('/auth/logout', adminAuthController.logout);

// Dashboard routes
router.get('/dashboard/stats', requirePermission('analytics', 'read'), adminDashboardController.getStats);
router.get('/dashboard/activity', requirePermission('analytics', 'read'), adminDashboardController.getRecentActivity);
router.get('/dashboard/health', requirePermission('analytics', 'read'), adminDashboardController.getSystemHealth);

// User management routes
router.get('/users', requirePermission('users', 'read'), validateRequest(getUsersQuerySchema, 'query'), adminUserController.getAllUsers);
router.get('/users/:userId', requirePermission('users', 'read'), adminUserController.getUserDetails);
router.get('/users/:userId/activity', requirePermission('users', 'read'), adminUserController.getUserActivity);
router.post('/users/:userId/suspend', requirePermission('users', 'write'), validateRequest(suspendUserSchema), adminUserController.suspendUser);
router.post('/users/:userId/activate', requirePermission('users', 'write'), adminUserController.activateUser);
router.put('/users/:userId/subscription', requirePermission('users', 'write'), validateRequest(updateUserSubscriptionSchema), adminUserController.updateUserSubscription);

// Content moderation routes
router.get('/moderation/stats', requirePermission('moderation', 'read'), adminModerationController.getModerationStats);
router.get('/moderation/queue', requirePermission('moderation', 'read'), adminModerationController.getModerationQueue);
router.post('/moderation/:moderationId/approve', requirePermission('moderation', 'write'), adminModerationController.approveContent);
router.post('/moderation/:moderationId/reject', requirePermission('moderation', 'write'), adminModerationController.rejectContent);
router.delete('/moderation/:contentType/:contentId', requirePermission('moderation', 'delete'), adminModerationController.deleteInappropriateContent);
router.get('/moderation/history/:contentType/:contentId', requirePermission('moderation', 'read'), adminModerationController.getModerationHistory);
router.post('/moderation/bulk/approve', requirePermission('moderation', 'write'), adminModerationController.bulkApproveContent);
router.post('/moderation/bulk/reject', requirePermission('moderation', 'write'), adminModerationController.bulkRejectContent);

// Memorial pages management routes
router.get('/memorial-pages', requirePermission('memorial_pages', 'read'), adminUserController.getAllMemorialPages);
router.get('/memorial-pages/:pageId', requirePermission('memorial_pages', 'read'), adminUserController.getMemorialPageDetails);
router.delete('/memorial-pages/:pageId', requirePermission('memorial_pages', 'delete'), adminUserController.deleteMemorialPage);

// System settings routes
router.get('/settings', requirePermission('settings', 'read'), adminSettingsController.getSystemSettings);
router.put('/settings', requirePermission('settings', 'write'), adminSettingsController.updateSystemSettings);
router.get('/settings/:key', requirePermission('settings', 'read'), adminSettingsController.getSetting);
router.put('/settings/:key', requirePermission('settings', 'write'), adminSettingsController.updateSetting);
router.get('/statistics', requirePermission('analytics', 'read'), adminSettingsController.getSystemStatistics);
router.get('/settings/export/backup', requirePermission('settings', 'read'), adminSettingsController.exportSettings);
router.post('/settings/import/backup', requirePermission('settings', 'write'), adminSettingsController.importSettings);
router.post('/settings/reset/defaults', requirePermission('settings', 'write'), adminSettingsController.resetToDefaults);
router.get('/test/connections', requirePermission('settings', 'read'), adminSettingsController.testConnections);

export default router;