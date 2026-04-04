import { Router } from 'express';
import { adminSettingsController } from '../controllers/adminSettingsController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Все маршруты требуют админской аутентификации
router.use(adminAuth);

// Системные настройки
router.get('/settings', adminSettingsController.getSystemSettings.bind(adminSettingsController));
router.put('/settings', adminSettingsController.updateSystemSettings.bind(adminSettingsController));

// Отдельные настройки
router.get('/settings/:key', adminSettingsController.getSetting.bind(adminSettingsController));
router.put('/settings/:key', adminSettingsController.updateSetting.bind(adminSettingsController));

// Статистика системы
router.get('/statistics', adminSettingsController.getSystemStatistics.bind(adminSettingsController));

// Экспорт/импорт настроек
router.get('/settings/export/backup', adminSettingsController.exportSettings.bind(adminSettingsController));
router.post('/settings/import/backup', adminSettingsController.importSettings.bind(adminSettingsController));

// Сброс к значениям по умолчанию
router.post('/settings/reset/defaults', adminSettingsController.resetToDefaults.bind(adminSettingsController));

// Тест подключений
router.get('/test/connections', adminSettingsController.testConnections.bind(adminSettingsController));

export default router;