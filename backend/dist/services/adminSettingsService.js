"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSettingsService = exports.AdminSettingsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AdminSettingsService {
    async getSystemSettings() {
        const settings = await prisma.systemSetting.findMany();
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        return {
            trialPeriodDays: settingsMap.trialPeriodDays || 14,
            maxFileSize: settingsMap.maxFileSize || 50 * 1024 * 1024,
            maxFilesPerPage: settingsMap.maxFilesPerPage || 100,
            biographyCharLimit: settingsMap.biographyCharLimit || 1000,
            allowedFileTypes: settingsMap.allowedFileTypes || [
                'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                'video/mp4', 'video/webm', 'video/quicktime'
            ],
            moderationRequired: settingsMap.moderationRequired || false,
            maintenanceMode: settingsMap.maintenanceMode || false,
            emailSettings: settingsMap.emailSettings || {
                smtpHost: '',
                smtpPort: 587,
                smtpUser: '',
                smtpPassword: '',
                fromEmail: '',
                fromName: 'Memorial Pages'
            },
            yandexCloudSettings: settingsMap.yandexCloudSettings || {
                accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY || '',
                bucketName: process.env.YANDEX_CLOUD_BUCKET_NAME || '',
                region: process.env.YANDEX_CLOUD_REGION || 'ru-central1'
            },
            subscriptionSettings: settingsMap.subscriptionSettings || {
                trialDurationDays: 14,
                premiumPriceMonthly: 299,
                premiumPriceYearly: 2990,
                currency: 'RUB'
            }
        };
    }
    async updateSystemSettings(updates, adminUserId) {
        const settingsToUpdate = [];
        Object.entries(updates).forEach(([key, value]) => {
            settingsToUpdate.push({
                key,
                value,
                description: this.getSettingDescription(key)
            });
        });
        await prisma.$transaction(async (tx) => {
            for (const setting of settingsToUpdate) {
                await tx.systemSetting.upsert({
                    where: { key: setting.key },
                    update: {
                        value: setting.value,
                        updatedBy: adminUserId,
                        updatedAt: new Date()
                    },
                    create: {
                        key: setting.key,
                        value: setting.value,
                        description: setting.description,
                        updatedBy: adminUserId
                    }
                });
            }
            await tx.adminAuditLog.create({
                data: {
                    adminUserId,
                    action: 'UPDATE_SYSTEM_SETTINGS',
                    resourceType: 'system_settings',
                    details: { updates: JSON.parse(JSON.stringify(updates)) },
                    createdAt: new Date()
                }
            });
        });
    }
    async getSetting(key) {
        const setting = await prisma.systemSetting.findUnique({
            where: { key }
        });
        return setting?.value;
    }
    async updateSetting(key, value, adminUserId) {
        await prisma.systemSetting.upsert({
            where: { key },
            update: {
                value,
                updatedBy: adminUserId,
                updatedAt: new Date()
            },
            create: {
                key,
                value,
                description: this.getSettingDescription(key),
                updatedBy: adminUserId
            }
        });
        await prisma.adminAuditLog.create({
            data: {
                adminUserId,
                action: 'UPDATE_SETTING',
                resourceType: 'system_settings',
                details: { key, value: JSON.parse(JSON.stringify(value)) },
                createdAt: new Date()
            }
        });
    }
    async getSystemStatistics() {
        const [totalUsers, activeUsers, totalMemorialPages, totalMediaFiles, storageStats, subscriptionStats] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: {
                    updatedAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            prisma.memorialPage.count(),
            prisma.mediaFile.count(),
            prisma.mediaFile.aggregate({
                _sum: {
                    size: true
                }
            }),
            prisma.user.groupBy({
                by: ['subscriptionType'],
                _count: {
                    id: true
                }
            })
        ]);
        const subscriptionCounts = subscriptionStats.reduce((acc, stat) => {
            acc[stat.subscriptionType] = stat._count.id;
            return acc;
        }, { trial: 0, free: 0, premium: 0 });
        return {
            totalUsers,
            activeUsers,
            totalMemorialPages,
            totalMediaFiles,
            storageUsed: storageStats._sum.size || 0,
            subscriptionStats: subscriptionCounts
        };
    }
    async exportSettings() {
        return this.getSystemSettings();
    }
    async importSettings(settings, adminUserId) {
        await this.updateSystemSettings(settings, adminUserId);
    }
    async resetToDefaults(adminUserId) {
        const defaultSettings = {
            trialPeriodDays: 14,
            maxFileSize: 50 * 1024 * 1024,
            maxFilesPerPage: 100,
            biographyCharLimit: 1000,
            allowedFileTypes: [
                'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                'video/mp4', 'video/webm', 'video/quicktime'
            ],
            moderationRequired: false,
            maintenanceMode: false
        };
        await this.updateSystemSettings(defaultSettings, adminUserId);
    }
    getSettingDescription(key) {
        const descriptions = {
            trialPeriodDays: 'Продолжительность пробного периода в днях',
            maxFileSize: 'Максимальный размер загружаемого файла в байтах',
            maxFilesPerPage: 'Максимальное количество файлов на одной странице',
            biographyCharLimit: 'Лимит символов в биографии для бесплатных аккаунтов',
            allowedFileTypes: 'Разрешенные типы файлов для загрузки',
            moderationRequired: 'Требуется ли модерация контента',
            maintenanceMode: 'Режим технического обслуживания',
            emailSettings: 'Настройки SMTP для отправки email',
            yandexCloudSettings: 'Настройки Yandex Cloud Object Storage',
            subscriptionSettings: 'Настройки подписок и цен'
        };
        return descriptions[key] || 'Системная настройка';
    }
}
exports.AdminSettingsService = AdminSettingsService;
exports.adminSettingsService = new AdminSettingsService();
//# sourceMappingURL=adminSettingsService.js.map