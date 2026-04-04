"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminModerationController = void 0;
const adminModerationService_1 = require("../services/adminModerationService");
class AdminModerationController {
    async getModerationStats(req, res) {
        try {
            const stats = await adminModerationService_1.adminModerationService.getModerationStats();
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error getting moderation stats:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении статистики модерации'
            });
        }
    }
    async getModerationQueue(req, res) {
        try {
            const { contentType, status = 'pending', page = '1', limit = '20' } = req.query;
            const result = await adminModerationService_1.adminModerationService.getModerationQueue(contentType, status, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('Error getting moderation queue:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении очереди модерации'
            });
        }
    }
    async approveContent(req, res) {
        try {
            const { moderationId } = req.params;
            const { reason } = req.body;
            const moderatorId = req.adminUser?.id;
            if (!moderatorId) {
                return res.status(401).json({
                    success: false,
                    message: 'Не авторизован'
                });
            }
            await adminModerationService_1.adminModerationService.approveContent(moderationId, moderatorId, reason);
            res.json({
                success: true,
                message: 'Контент успешно одобрен'
            });
        }
        catch (error) {
            console.error('Error approving content:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при одобрении контента'
            });
        }
    }
    async rejectContent(req, res) {
        try {
            const { moderationId } = req.params;
            const { reason } = req.body;
            const moderatorId = req.adminUser?.id;
            if (!moderatorId) {
                return res.status(401).json({
                    success: false,
                    message: 'Не авторизован'
                });
            }
            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Причина отклонения обязательна'
                });
            }
            await adminModerationService_1.adminModerationService.rejectContent(moderationId, moderatorId, reason);
            res.json({
                success: true,
                message: 'Контент отклонен'
            });
        }
        catch (error) {
            console.error('Error rejecting content:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при отклонении контента'
            });
        }
    }
    async deleteInappropriateContent(req, res) {
        try {
            const { contentType, contentId } = req.params;
            const { reason } = req.body;
            const moderatorId = req.adminUser?.id;
            if (!moderatorId) {
                return res.status(401).json({ error: 'Не авторизован' });
            }
            if (!reason) {
                return res.status(400).json({ error: 'Причина удаления обязательна' });
            }
            await adminModerationService_1.adminModerationService.deleteInappropriateContent(contentType, contentId, moderatorId, reason);
            res.json({ message: 'Неподходящий контент удален' });
        }
        catch (error) {
            console.error('Error deleting inappropriate content:', error);
            res.status(500).json({ error: 'Ошибка при удалении контента' });
        }
    }
    async getModerationHistory(req, res) {
        try {
            const { contentType, contentId } = req.params;
            const history = await adminModerationService_1.adminModerationService.getModerationHistory(contentType, contentId);
            res.json(history);
        }
        catch (error) {
            console.error('Error getting moderation history:', error);
            res.status(500).json({ error: 'Ошибка при получении истории модерации' });
        }
    }
    async bulkApproveContent(req, res) {
        try {
            const { moderationIds, reason } = req.body;
            const moderatorId = req.adminUser?.id;
            if (!moderatorId) {
                return res.status(401).json({ error: 'Не авторизован' });
            }
            if (!Array.isArray(moderationIds) || moderationIds.length === 0) {
                return res.status(400).json({ error: 'Список ID для модерации не может быть пустым' });
            }
            const results = await Promise.allSettled(moderationIds.map(id => adminModerationService_1.adminModerationService.approveContent(id, moderatorId, reason)));
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            res.json({
                success: true,
                message: `Обработано: ${successful} одобрено, ${failed} ошибок`,
                data: {
                    successful,
                    failed
                }
            });
        }
        catch (error) {
            console.error('Error bulk approving content:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при массовом одобрении контента'
            });
        }
    }
    async bulkRejectContent(req, res) {
        try {
            const { moderationIds, reason } = req.body;
            const moderatorId = req.adminUser?.id;
            if (!moderatorId) {
                return res.status(401).json({ error: 'Не авторизован' });
            }
            if (!Array.isArray(moderationIds) || moderationIds.length === 0) {
                return res.status(400).json({ error: 'Список ID для модерации не может быть пустым' });
            }
            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Причина отклонения обязательна'
                });
            }
            const results = await Promise.allSettled(moderationIds.map(id => adminModerationService_1.adminModerationService.rejectContent(id, moderatorId, reason)));
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            res.json({
                success: true,
                message: `Обработано: ${successful} отклонено, ${failed} ошибок`,
                data: {
                    successful,
                    failed
                }
            });
        }
        catch (error) {
            console.error('Error bulk rejecting content:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при массовом отклонении контента'
            });
        }
    }
}
exports.adminModerationController = new AdminModerationController();
//# sourceMappingURL=adminModerationController.js.map