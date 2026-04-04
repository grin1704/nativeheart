import { Request, Response } from 'express';
import { adminSettingsService } from '../services/adminSettingsService';
import { z } from 'zod';

// Схемы валидации
const systemSettingsSchema = z.object({
  trialPeriodDays: z.number().min(1).max(365).optional(),
  maxFileSize: z.number().min(1024).max(1024 * 1024 * 1024).optional(), // От 1KB до 1GB
  maxFilesPerPage: z.number().min(1).max(1000).optional(),
  biographyCharLimit: z.number().min(100).max(50000).optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  moderationRequired: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  emailSettings: z.object({
    smtpHost: z.string().optional(),
    smtpPort: z.number().min(1).max(65535).optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    fromEmail: z.string().email().optional(),
    fromName: z.string().optional()
  }).optional(),
  yandexCloudSettings: z.object({
    accessKeyId: z.string().optional(),
    secretAccessKey: z.string().optional(),
    bucketName: z.string().optional(),
    region: z.string().optional()
  }).optional(),
  subscriptionSettings: z.object({
    trialDurationDays: z.number().min(1).max(365).optional(),
    premiumPriceMonthly: z.number().min(0).optional(),
    premiumPriceYearly: z.number().min(0).optional(),
    currency: z.string().length(3).optional()
  }).optional()
});

const settingUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.any()
});

export class AdminSettingsController {
  /**
   * Получить все системные настройки
   */
  async getSystemSettings(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await adminSettingsService.getSystemSettings();
      
      // Скрываем чувствительные данные
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
    } catch (error) {
      console.error('Error getting system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get system settings'
      });
    }
  }

  /**
   * Обновить системные настройки
   */
  async updateSystemSettings(req: Request, res: Response): Promise<void> {
    try {
      const adminUserId = req.user?.id;
      if (!adminUserId) {
        res.status(401).json({
          success: false,
          message: 'Admin authentication required'
        });
        return;
      }

      // Валидация данных
      const validationResult = systemSettingsSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid settings data',
          errors: validationResult.error.issues
        });
        return;
      }

      const updates = validationResult.data as any;

      // Обновляем настройки
      await adminSettingsService.updateSystemSettings(updates, adminUserId);

      res.json({
        success: true,
        message: 'System settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system settings'
      });
    }
  }

  /**
   * Получить конкретную настройку
   */
  async getSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      
      if (!key) {
        res.status(400).json({
          success: false,
          message: 'Setting key is required'
        });
        return;
      }

      const value = await adminSettingsService.getSetting(key);

      res.json({
        success: true,
        data: { key, value }
      });
    } catch (error) {
      console.error('Error getting setting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get setting'
      });
    }
  }

  /**
   * Обновить конкретную настройку
   */
  async updateSetting(req: Request, res: Response): Promise<void> {
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
      
      // Валидация данных
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

      await adminSettingsService.updateSetting(key, value, adminUserId);

      res.json({
        success: true,
        message: 'Setting updated successfully'
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update setting'
      });
    }
  }

  /**
   * Получить статистику системы
   */
  async getSystemStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const statistics = await adminSettingsService.getSystemStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting system statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get system statistics'
      });
    }
  }

  /**
   * Экспорт настроек
   */
  async exportSettings(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await adminSettingsService.exportSettings();

      // Устанавливаем заголовки для скачивания файла
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="system-settings.json"');

      res.json(settings);
    } catch (error) {
      console.error('Error exporting settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export settings'
      });
    }
  }

  /**
   * Импорт настроек
   */
  async importSettings(req: Request, res: Response): Promise<void> {
    try {
      const adminUserId = req.user?.id;
      if (!adminUserId) {
        res.status(401).json({
          success: false,
          message: 'Admin authentication required'
        });
        return;
      }

      // Валидация данных
      const validationResult = systemSettingsSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid settings data',
          errors: validationResult.error.issues
        });
        return;
      }

      const settings = validationResult.data as any;

      await adminSettingsService.importSettings(settings, adminUserId);

      res.json({
        success: true,
        message: 'Settings imported successfully'
      });
    } catch (error) {
      console.error('Error importing settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import settings'
      });
    }
  }

  /**
   * Сброс настроек к значениям по умолчанию
   */
  async resetToDefaults(req: Request, res: Response): Promise<void> {
    try {
      const adminUserId = req.user?.id;
      if (!adminUserId) {
        res.status(401).json({
          success: false,
          message: 'Admin authentication required'
        });
        return;
      }

      await adminSettingsService.resetToDefaults(adminUserId);

      res.json({
        success: true,
        message: 'Settings reset to defaults successfully'
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset settings'
      });
    }
  }

  /**
   * Тест подключения к внешним сервисам
   */
  async testConnections(_req: Request, res: Response): Promise<void> {
    try {
      const results = {
        database: false,
        yandexCloud: false,
        email: false
      };

      // Тест подключения к базе данных
      try {
        await adminSettingsService.getSetting('test');
        results.database = true;
      } catch (error) {
        console.error('Database connection test failed:', error);
      }

      // Тест подключения к Yandex Cloud (можно добавить реальную проверку)
      try {
        const yandexSettings = await adminSettingsService.getSetting('yandexCloudSettings');
        if (yandexSettings?.accessKeyId && yandexSettings?.secretAccessKey) {
          results.yandexCloud = true;
        }
      } catch (error) {
        console.error('Yandex Cloud connection test failed:', error);
      }

      // Тест настроек email (можно добавить реальную проверку SMTP)
      try {
        const emailSettings = await adminSettingsService.getSetting('emailSettings');
        if (emailSettings?.smtpHost && emailSettings?.smtpUser) {
          results.email = true;
        }
      } catch (error) {
        console.error('Email connection test failed:', error);
      }

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error testing connections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test connections'
      });
    }
  }
}

export const adminSettingsController = new AdminSettingsController();