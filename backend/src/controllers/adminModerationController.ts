import { Request, Response } from 'express';
import { adminModerationService } from '../services/adminModerationService';

interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

class AdminModerationController {
  // Получить статистику модерации
  async getModerationStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await adminModerationService.getModerationStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      res.status(500).json({ 
        success: false,
        message: 'Ошибка при получении статистики модерации' 
      });
    }
  }

  // Получить очередь модерации
  async getModerationQueue(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        contentType,
        status = 'pending',
        page = '1',
        limit = '20'
      } = req.query;

      const result = await adminModerationService.getModerationQueue(
        contentType as 'memorial_page' | 'tribute' | 'memory' | undefined,
        status as 'pending' | 'approved' | 'rejected',
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting moderation queue:', error);
      res.status(500).json({ 
        success: false,
        message: 'Ошибка при получении очереди модерации' 
      });
    }
  }

  // Одобрить контент
  async approveContent(req: AuthenticatedRequest, res: Response) {
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

      await adminModerationService.approveContent(moderationId, moderatorId, reason);
      
      res.json({ 
        success: true,
        message: 'Контент успешно одобрен' 
      });
    } catch (error) {
      console.error('Error approving content:', error);
      res.status(500).json({ 
        success: false,
        message: 'Ошибка при одобрении контента' 
      });
    }
  }

  // Отклонить контент
  async rejectContent(req: AuthenticatedRequest, res: Response) {
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

      await adminModerationService.rejectContent(moderationId, moderatorId, reason);
      
      res.json({ 
        success: true,
        message: 'Контент отклонен' 
      });
    } catch (error) {
      console.error('Error rejecting content:', error);
      res.status(500).json({ 
        success: false,
        message: 'Ошибка при отклонении контента' 
      });
    }
  }

  // Удалить неподходящий контент
  async deleteInappropriateContent(req: AuthenticatedRequest, res: Response) {
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

      await adminModerationService.deleteInappropriateContent(
        contentType as 'memorial_page' | 'tribute' | 'memory',
        contentId,
        moderatorId,
        reason
      );
      
      res.json({ message: 'Неподходящий контент удален' });
    } catch (error) {
      console.error('Error deleting inappropriate content:', error);
      res.status(500).json({ error: 'Ошибка при удалении контента' });
    }
  }

  // Получить историю модерации
  async getModerationHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { contentType, contentId } = req.params;

      const history = await adminModerationService.getModerationHistory(
        contentType as 'memorial_page' | 'tribute' | 'memory',
        contentId
      );

      res.json(history);
    } catch (error) {
      console.error('Error getting moderation history:', error);
      res.status(500).json({ error: 'Ошибка при получении истории модерации' });
    }
  }

  // Массовое одобрение контента
  async bulkApproveContent(req: AuthenticatedRequest, res: Response) {
    try {
      const { moderationIds, reason } = req.body;
      const moderatorId = req.adminUser?.id;

      if (!moderatorId) {
        return res.status(401).json({ error: 'Не авторизован' });
      }

      if (!Array.isArray(moderationIds) || moderationIds.length === 0) {
        return res.status(400).json({ error: 'Список ID для модерации не может быть пустым' });
      }

      // Одобряем каждый элемент
      const results = await Promise.allSettled(
        moderationIds.map(id => 
          adminModerationService.approveContent(id, moderatorId, reason)
        )
      );

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
    } catch (error) {
      console.error('Error bulk approving content:', error);
      res.status(500).json({ 
        success: false,
        message: 'Ошибка при массовом одобрении контента' 
      });
    }
  }

  // Массовое отклонение контента
  async bulkRejectContent(req: AuthenticatedRequest, res: Response) {
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

      // Отклоняем каждый элемент
      const results = await Promise.allSettled(
        moderationIds.map(id => 
          adminModerationService.rejectContent(id, moderatorId, reason)
        )
      );

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
    } catch (error) {
      console.error('Error bulk rejecting content:', error);
      res.status(500).json({ 
        success: false,
        message: 'Ошибка при массовом отклонении контента' 
      });
    }
  }
}

export const adminModerationController = new AdminModerationController();