"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSettingsController = exports.AdminSettingsController = void 0;
const adminSettingsService_1 = require("../services/adminSettingsService");
const zod_1 = require("zod");
const systemSettingsSchema = zod_1.z.object({
    trialPeriodDays: zod_1.z.number().min(1).max(365).optional(),
    maxFileSize: zod_1.z.number().min(1024).max(1024 * 1024 * 1024).optional(),
    maxFilesPerPage: zod_1.z.number().min(1).max(1000).optional(),
    biographyCharLimit: zod_1.z.number().min(100).max(50000).optional(),
    allowedFileTypes: zod_1.z.array(zod_1.z.string()).optional(),
    moderationRequired: zod_1.z.boolean().optional(),
    maintenanceMode: zod_1.z.boolean().optional(),
    emailSettings: zod_1.z.object({
        smtpHost: zod_1.z.string().optional(),
        smtpPort: zod_1.z.number().min(1).max(65535).optional(),
        smtpUser: zod_1.z.string().optional(),
        smtpPassword: zod_1.z.string().optional(),
        fromEmail: zod_1.z.string().email().optional(),
        fromName: zod_1.z.string().optional()
    }).optional(),
    yandexCloudSettings: zod_1.z.object({
        accessKeyId: zod_1.z.string().optional(),
        secretAccessKey: zod_1.z.string().optional(),
        bucketName: zod_1.z.string().optional(),
        region: zod_1.z.string().optional()
    }).optional(),
    subscriptionSettings: zod_1.z.object({
        trialDurationDays: zod_1.z.number().min(1).max(365).optional(),
        premiumPriceMonthly: zod_1.z.number().min(0).optional(),
        premiumPriceYearly: zod_1.z.number().min(0).optional(),
        currency: zod_1.z.string().length(3).optional()
    }).optional()
});
const settingUpdateSchema = zod_1.z.object({
    key: zod_1.z.string().min(1),
    value: zod_1.z.any()
});
class AdminSettingsController {
    async getSystemSettings(_req, res) {
        try {
            const settings = await adminSettingsService_1.adminSettingsService.getSystemSettings();
            const sanitizedSettings = {
                ...settings,
                emailSettings: {
                    ...settings.emailSettings,
                    smtpPassword: settings.emailSettings.smtpPassword ? '***' : ''
                },
                yandexCloudSettings: {
                    ...settings.yandexCloudSettings,
                    secretAccessKey: settings.yandexCloudSettings.secretAccessKey ? '***' : ''
                }
            };
            res.json({
                success: true,
                data: sanitizedSettings
            });
        }
        catch (error) {
            console.error('Error getting system settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get system settings'
            });
        }
    }
    async updateSystemSettings(req, res) {
        try {
            const adminUserId = req.user?.id;
            if (!adminUserId) {
                res.status(401).json({
                    success: false,
                    message: 'Admin authentication required'
                });
                return;
            }
            const validationResult = systemSettingsSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid settings data',
                    errors: validationResult.error.issues
                });
                return;
            }
            const updates = validationResult.data;
            await adminSettingsService_1.adminSettingsService.updateSystemSettings(updates, adminUserId);
            res.json({
                success: true,
                message: 'System settings updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating system settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update system settings'
            });
        }
    }
    async getSetting(req, res) {
        try {
            const { key } = req.params;
            if (!key) {
                res.status(400).json({
                    success: false,
                    message: 'Setting key is required'
                });
                return;
            }
            const value = await adminSettingsService_1.adminSettingsService.getSetting(key);
            res.json({
                success: true,
                data: { key, value }
            });
        }
        catch (error) {
            console.error('Error getting setting:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get setting'
            });
        }
    }
    async updateSetting(req, res) {
        try {
            const adminUserId = req.user?.id;
            if (!adminUserId) {
                res.status(401).json({
                    success: false,
                    message: 'Admin authentication required'
                });
                return;
            }
            const { key } = req.params;
            const validationResult = settingUpdateSchema.safeParse({
                key,
                value: req.body.value
            });
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid setting data',
                    errors: validationResult.error.issues
                });
                return;
            }
            const { value } = req.body;
            await adminSettingsService_1.adminSettingsService.updateSetting(key, value, adminUserId);
            res.json({
                success: true,
                message: 'Setting updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating setting:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update setting'
            });
        }
    }
    async getSystemStatistics(_req, res) {
        try {
            const statistics = await adminSettingsService_1.adminSettingsService.getSystemStatistics();
            res.json({
                success: true,
                data: statistics
            });
        }
        catch (error) {
            console.error('Error getting system statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get system statistics'
            });
        }
    }
    async exportSettings(_req, res) {
        try {
            const settings = await adminSettingsService_1.adminSettingsService.exportSettings();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="system-settings.json"');
            res.json(settings);
        }
        catch (error) {
            console.error('Error exporting settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to export settings'
            });
        }
    }
    async importSettings(req, res) {
        try {
            const adminUserId = req.user?.id;
            if (!adminUserId) {
                res.status(401).json({
                    success: false,
                    message: 'Admin authentication required'
                });
                return;
            }
            const validationResult = systemSettingsSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid settings data',
                    errors: validationResult.error.issues
                });
                return;
            }
            const settings = validationResult.data;
            await adminSettingsService_1.adminSettingsService.importSettings(settings, adminUserId);
            res.json({
                success: true,
                message: 'Settings imported successfully'
            });
        }
        catch (error) {
            console.error('Error importing settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to import settings'
            });
        }
    }
    async resetToDefaults(req, res) {
        try {
            const adminUserId = req.user?.id;
            if (!adminUserId) {
                res.status(401).json({
                    success: false,
                    message: 'Admin authentication required'
                });
                return;
            }
            await adminSettingsService_1.adminSettingsService.resetToDefaults(adminUserId);
            res.json({
                success: true,
                message: 'Settings reset to defaults successfully'
            });
        }
        catch (error) {
            console.error('Error resetting settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reset settings'
            });
        }
    }
    async testConnections(_req, res) {
        try {
            const results = {
                database: false,
                yandexCloud: false,
                email: false
            };
            try {
                await adminSettingsService_1.adminSettingsService.getSetting('test');
                results.database = true;
            }
            catch (error) {
                console.error('Database connection test failed:', error);
            }
            try {
                const yandexSettings = await adminSettingsService_1.adminSettingsService.getSetting('yandexCloudSettings');
                if (yandexSettings?.accessKeyId && yandexSettings?.secretAccessKey) {
                    results.yandexCloud = true;
                }
            }
            catch (error) {
                console.error('Yandex Cloud connection test failed:', error);
            }
            try {
                const emailSettings = await adminSettingsService_1.adminSettingsService.getSetting('emailSettings');
                if (emailSettings?.smtpHost && emailSettings?.smtpUser) {
                    results.email = true;
                }
            }
            catch (error) {
                console.error('Email connection test failed:', error);
            }
            res.json({
                success: true,
                data: results
            });
        }
        catch (error) {
            console.error('Error testing connections:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to test connections'
            });
        }
    }
}
exports.AdminSettingsController = AdminSettingsController;
exports.adminSettingsController = new AdminSettingsController();
//# sourceMappingURL=adminSettingsController.js.map