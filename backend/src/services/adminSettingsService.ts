import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SystemSettings {
  trialPeriodDays: number;
  maxFileSize: number;
  maxFilesPerPage: number;
  biographyCharLimit: number;
  allowedFileTypes: string[];
  moderationRequired: boolean;
  maintenanceMode: boolean;
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  yandexCloudSettings: {
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    region: string;
  };
  subscriptionSettings: {
    trialDurationDays: number;
    premiumPriceMonthly: number;
    premiumPriceYearly: number;
    currency: string;
  };
}

export interface SystemSettingsUpdate {
  trialPeriodDays?: number;
  maxFileSize?: number;
  maxFilesPerPage?: number;
  biographyCharLimit?: number;
  allowedFileTypes?: string[];
  moderationRequired?: boolean;
  maintenanceMode?: boolean;
  emailSettings?: Partial<SystemSettings['emailSettings']>;
  yandexCloudSettings?: Partial<SystemSettings['yandexCloudSettings']>;
  subscriptionSettings?: Partial<SystemSettings['subscriptionSettings']>;
}

export interface SettingUpdate {
  key: string;
  value: any;
  description?: string;
}

export class AdminSettingsService {
  /**
   * Получить все системные настройки
   */
  async getSystemSettings(): Promise<SystemSettings> {
    const settings = await prisma.systemSetting.findMany();
    
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as any);

    // Возвращаем настройки с значениями по умолчанию
    return {
      trialPeriodDays: settingsMap.trialPeriodDays || 14,
      maxFileSize: settingsMap.maxFileSize || 50 * 1024 * 1024, // 50MB
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

  /**
   * Обновить системные настройки
   */
  async updateSystemSettings(
    updates: SystemSettingsUpdate,
    adminUserId: string
  ): Promise<void> {
    const settingsToUpdate: SettingUpdate[] = [];

    // Преобразуем обновления в формат для базы данных
    Object.entries(updates).forEach(([key, value]) => {
      settingsToUpdate.push({
        key,
        value,
        description: this.getSettingDescription(key)
      });
    });

    // Обновляем настройки в транзакции
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

      // Логируем изменения
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

  /**
   * Получить конкретную настройку
   */
  async getSetting(key: string): Promise<any> {
    const setting = await prisma.systemSetting.findUnique({
      where: { key }
    });
    
    return setting?.value;
  }

  /**
   * Обновить конкретную настройку
   */
  async updateSetting(
    key: string,
    value: any,
    adminUserId: string
  ): Promise<void> {
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

    // Логируем изменение
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

  /**
   * Получить статистику системы
   */
  async getSystemStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalMemorialPages: number;
    totalMediaFiles: number;
    storageUsed: number;
    subscriptionStats: {
      trial: number;
      free: number;
      premium: number;
    };
  }> {
    const [
      totalUsers,
      activeUsers,
      totalMemorialPages,
      totalMediaFiles,
      storageStats,
      subscriptionStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Активные за последние 30 дней
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
      acc[stat.subscriptionType as keyof typeof acc] = stat._count.id;
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

  /**
   * Экспорт настроек для резервного копирования
   */
  async exportSettings(): Promise<SystemSettings> {
    return this.getSystemSettings();
  }

  /**
   * Импорт настроек из резервной копии
   */
  async importSettings(
    settings: SystemSettingsUpdate,
    adminUserId: string
  ): Promise<void> {
    await this.updateSystemSettings(settings, adminUserId);
  }

  /**
   * Сброс настроек к значениям по умолчанию
   */
  async resetToDefaults(adminUserId: string): Promise<void> {
    const defaultSettings: SystemSettingsUpdate = {
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

  /**
   * Получить описание настройки
   */
  private getSettingDescription(key: string): string {
    const descriptions: Record<string, string> = {
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

export const adminSettingsService = new AdminSettingsService();