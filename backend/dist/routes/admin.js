"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminAuthController_1 = require("../controllers/adminAuthController");
const adminDashboardController_1 = require("../controllers/adminDashboardController");
const adminUserController_1 = require("../controllers/adminUserController");
const adminModerationController_1 = require("../controllers/adminModerationController");
const adminSettingsController_1 = require("../controllers/adminSettingsController");
const adminAuth_1 = require("../middleware/adminAuth");
const qrCodePlates_1 = __importDefault(require("./qrCodePlates"));
const validation_1 = require("../middleware/validation");
const admin_1 = require("../validation/admin");
const database_1 = __importDefault(require("../config/database"));
const qrCodePlateService_1 = require("../services/qrCodePlateService");
const router = express_1.default.Router();
router.post('/auth/login', (0, validation_1.validateRequest)(admin_1.adminLoginSchema), adminAuthController_1.adminAuthController.login);
router.post('/auth/refresh', (0, validation_1.validateRequest)(admin_1.refreshTokenSchema), adminAuthController_1.adminAuthController.refreshToken);
router.use(adminAuth_1.adminAuth);
router.get('/auth/profile', adminAuthController_1.adminAuthController.getProfile);
router.post('/auth/logout', adminAuthController_1.adminAuthController.logout);
router.get('/dashboard/stats', (0, adminAuth_1.requirePermission)('analytics', 'read'), adminDashboardController_1.adminDashboardController.getStats);
router.get('/dashboard/activity', (0, adminAuth_1.requirePermission)('analytics', 'read'), adminDashboardController_1.adminDashboardController.getRecentActivity);
router.get('/dashboard/health', (0, adminAuth_1.requirePermission)('analytics', 'read'), adminDashboardController_1.adminDashboardController.getSystemHealth);
router.get('/users', (0, adminAuth_1.requirePermission)('users', 'read'), (0, validation_1.validateRequest)(admin_1.getUsersQuerySchema, 'query'), adminUserController_1.adminUserController.getAllUsers);
router.get('/users/:userId', (0, adminAuth_1.requirePermission)('users', 'read'), adminUserController_1.adminUserController.getUserDetails);
router.get('/users/:userId/activity', (0, adminAuth_1.requirePermission)('users', 'read'), adminUserController_1.adminUserController.getUserActivity);
router.post('/users/:userId/suspend', (0, adminAuth_1.requirePermission)('users', 'write'), (0, validation_1.validateRequest)(admin_1.suspendUserSchema), adminUserController_1.adminUserController.suspendUser);
router.post('/users/:userId/activate', (0, adminAuth_1.requirePermission)('users', 'write'), adminUserController_1.adminUserController.activateUser);
router.put('/users/:userId/subscription', (0, adminAuth_1.requirePermission)('users', 'write'), (0, validation_1.validateRequest)(admin_1.updateUserSubscriptionSchema), adminUserController_1.adminUserController.updateUserSubscription);
router.get('/moderation/stats', (0, adminAuth_1.requirePermission)('moderation', 'read'), adminModerationController_1.adminModerationController.getModerationStats);
router.get('/moderation/queue', (0, adminAuth_1.requirePermission)('moderation', 'read'), adminModerationController_1.adminModerationController.getModerationQueue);
router.post('/moderation/:moderationId/approve', (0, adminAuth_1.requirePermission)('moderation', 'write'), adminModerationController_1.adminModerationController.approveContent);
router.post('/moderation/:moderationId/reject', (0, adminAuth_1.requirePermission)('moderation', 'write'), adminModerationController_1.adminModerationController.rejectContent);
router.delete('/moderation/:contentType/:contentId', (0, adminAuth_1.requirePermission)('moderation', 'delete'), adminModerationController_1.adminModerationController.deleteInappropriateContent);
router.get('/moderation/history/:contentType/:contentId', (0, adminAuth_1.requirePermission)('moderation', 'read'), adminModerationController_1.adminModerationController.getModerationHistory);
router.post('/moderation/bulk/approve', (0, adminAuth_1.requirePermission)('moderation', 'write'), adminModerationController_1.adminModerationController.bulkApproveContent);
router.post('/moderation/bulk/reject', (0, adminAuth_1.requirePermission)('moderation', 'write'), adminModerationController_1.adminModerationController.bulkRejectContent);
router.get('/memorial-pages', (0, adminAuth_1.requirePermission)('memorial_pages', 'read'), adminUserController_1.adminUserController.getAllMemorialPages);
router.get('/memorial-pages/:pageId', (0, adminAuth_1.requirePermission)('memorial_pages', 'read'), adminUserController_1.adminUserController.getMemorialPageDetails);
router.delete('/memorial-pages/:pageId', (0, adminAuth_1.requirePermission)('memorial_pages', 'delete'), adminUserController_1.adminUserController.deleteMemorialPage);
router.post('/memorial-pages/:pageId/upgrade', (0, adminAuth_1.requirePermission)('memorial_pages', 'write'), async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const page = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            select: { id: true, isPremium: true, qrCodeUrl: true, slug: true, qrCodePlate: true },
        });
        if (!page) {
            return res.status(404).json({ success: false, message: 'Страница не найдена' });
        }
        if (page.isPremium && page.qrCodePlate) {
            return res.status(400).json({
                success: false,
                message: 'Страница уже является premium и табличка уже назначена',
                data: { plateToken: page.qrCodePlate.token },
            });
        }
        const token = await qrCodePlateService_1.qrCodePlateService.assignPlateToPage(pageId);
        const newQrUrl = token ? `${baseUrl}/qr/${token}` : `${baseUrl}/memorial/${page.slug}`;
        await database_1.default.memorialPage.update({
            where: { id: pageId },
            data: { isPremium: true, qrCodeUrl: newQrUrl },
        });
        return res.json({
            success: true,
            message: token
                ? 'Страница переведена в premium, табличка назначена'
                : 'Страница переведена в premium, но пул табличек пуст — QR-код не изменён',
            data: { isPremium: true, plateToken: token, qrCodeUrl: newQrUrl },
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/settings', (0, adminAuth_1.requirePermission)('settings', 'read'), adminSettingsController_1.adminSettingsController.getSystemSettings);
router.put('/settings', (0, adminAuth_1.requirePermission)('settings', 'write'), adminSettingsController_1.adminSettingsController.updateSystemSettings);
router.get('/settings/:key', (0, adminAuth_1.requirePermission)('settings', 'read'), adminSettingsController_1.adminSettingsController.getSetting);
router.put('/settings/:key', (0, adminAuth_1.requirePermission)('settings', 'write'), adminSettingsController_1.adminSettingsController.updateSetting);
router.get('/statistics', (0, adminAuth_1.requirePermission)('analytics', 'read'), adminSettingsController_1.adminSettingsController.getSystemStatistics);
router.get('/settings/export/backup', (0, adminAuth_1.requirePermission)('settings', 'read'), adminSettingsController_1.adminSettingsController.exportSettings);
router.post('/settings/import/backup', (0, adminAuth_1.requirePermission)('settings', 'write'), adminSettingsController_1.adminSettingsController.importSettings);
router.post('/settings/reset/defaults', (0, adminAuth_1.requirePermission)('settings', 'write'), adminSettingsController_1.adminSettingsController.resetToDefaults);
router.get('/test/connections', (0, adminAuth_1.requirePermission)('settings', 'read'), adminSettingsController_1.adminSettingsController.testConnections);
router.use('/qr-plates', qrCodePlates_1.default);
exports.default = router;
//# sourceMappingURL=admin.js.map