import { Router } from 'express';
import { adminModerationController } from '../controllers/adminModerationController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Применяем middleware аутентификации ко всем маршрутам
router.use(adminAuth);

// Получить статистику модерации
router.get('/stats', adminModerationController.getModerationStats);

// Получить очередь модерации
router.get('/queue', adminModerationController.getModerationQueue);

// Одобрить контент
router.post('/:moderationId/approve', adminModerationController.approveContent);

// Отклонить контент
router.post('/:moderationId/reject', adminModerationController.rejectContent);

// Удалить неподходящий контент
router.delete('/:contentType/:contentId', adminModerationController.deleteInappropriateContent);

// Получить историю модерации для контента
router.get('/history/:contentType/:contentId', adminModerationController.getModerationHistory);

// Массовое одобрение
router.post('/bulk/approve', adminModerationController.bulkApproveContent);

// Массовое отклонение
router.post('/bulk/reject', adminModerationController.bulkRejectContent);

export default router;