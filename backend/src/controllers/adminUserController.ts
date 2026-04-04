import { Request, Response } from 'express';
import { adminUserService } from '../services/adminUserService';
import { logger } from '../utils/logger';

interface AuthenticatedAdminRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    role: string;
  };
}

export const adminUserController = {
  async getAllUsers(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const {
        page = '1',
        limit = '20',
        search,
        subscriptionType,
        isActive,
        createdAfter,
        createdBefore
      } = req.query;

      const filters = {
        search: search as string,
        subscriptionType: subscriptionType as 'trial' | 'free' | 'premium',
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        createdAfter: createdAfter ? new Date(createdAfter as string) : undefined,
        createdBefore: createdBefore ? new Date(createdBefore as string) : undefined
      };

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await adminUserService.getAllUsers(filters, pagination);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get all users controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка пользователей'
      });
    }
  },

  async getUserDetails(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID пользователя обязателен'
        });
      }

      const userDetails = await adminUserService.getUserDetails(userId);

      res.json({
        success: true,
        data: userDetails
      });
    } catch (error) {
      logger.error('Get user details controller error:', error);
      
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Ошибка получения данных пользователя'
      });
    }
  },

  async suspendUser(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const adminId = req.adminUser?.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID пользователя обязателен'
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Причина блокировки обязательна'
        });
      }

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Не авторизован'
        });
      }

      const user = await adminUserService.suspendUser(userId, reason, adminId);

      res.json({
        success: true,
        message: 'Пользователь заблокирован',
        data: user
      });
    } catch (error) {
      logger.error('Suspend user controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка блокировки пользователя'
      });
    }
  },

  async activateUser(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const { userId } = req.params;
      const adminId = req.adminUser?.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID пользователя обязателен'
        });
      }

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Не авторизован'
        });
      }

      const user = await adminUserService.activateUser(userId, adminId);

      res.json({
        success: true,
        message: 'Пользователь разблокирован',
        data: user
      });
    } catch (error) {
      logger.error('Activate user controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка разблокировки пользователя'
      });
    }
  },

  async updateUserSubscription(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { subscriptionType, expiresAt } = req.body;
      const adminId = req.adminUser?.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID пользователя обязателен'
        });
      }

      if (!subscriptionType || !['trial', 'free', 'premium'].includes(subscriptionType)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный тип подписки'
        });
      }

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Не авторизован'
        });
      }

      const expirationDate = expiresAt ? new Date(expiresAt) : null;
      const user = await adminUserService.updateUserSubscription(userId, subscriptionType, expirationDate, adminId);

      res.json({
        success: true,
        message: 'Подписка пользователя обновлена',
        data: user
      });
    } catch (error) {
      logger.error('Update user subscription controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка обновления подписки'
      });
    }
  },

  async getUserActivity(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { limit = '20' } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID пользователя обязателен'
        });
      }

      const activity = await adminUserService.getUserActivity(userId, parseInt(limit as string));

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      logger.error('Get user activity controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения активности пользователя'
      });
    }
  },

  async getAllMemorialPages(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const {
        page = '1',
        limit = '20',
        search,
        status,
        subscriptionType,
        createdAfter,
        createdBefore
      } = req.query;

      const filters = {
        search: search as string,
        status: status as 'public' | 'private',
        subscriptionType: subscriptionType as 'trial' | 'free' | 'premium',
        createdAfter: createdAfter ? new Date(createdAfter as string) : undefined,
        createdBefore: createdBefore ? new Date(createdBefore as string) : undefined
      };

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await adminUserService.getAllMemorialPages(filters, pagination);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get all memorial pages controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка памятных страниц'
      });
    }
  },

  async getMemorialPageDetails(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const { pageId } = req.params;

      if (!pageId) {
        return res.status(400).json({
          success: false,
          message: 'ID страницы обязателен'
        });
      }

      const pageDetails = await adminUserService.getMemorialPageDetails(pageId);

      res.json({
        success: true,
        data: pageDetails
      });
    } catch (error) {
      logger.error('Get memorial page details controller error:', error);
      
      if (error instanceof Error && error.message === 'Memorial page not found') {
        return res.status(404).json({
          success: false,
          message: 'Памятная страница не найдена'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Ошибка получения данных страницы'
      });
    }
  },

  async deleteMemorialPage(req: AuthenticatedAdminRequest, res: Response) {
    try {
      const { pageId } = req.params;
      const { reason } = req.body;
      const adminId = req.adminUser?.id;

      if (!pageId) {
        return res.status(400).json({
          success: false,
          message: 'ID страницы обязателен'
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Причина удаления обязательна'
        });
      }

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Не авторизован'
        });
      }

      await adminUserService.deleteMemorialPage(pageId, reason, adminId);

      res.json({
        success: true,
        message: 'Памятная страница удалена'
      });
    } catch (error) {
      logger.error('Delete memorial page controller error:', error);
      
      if (error instanceof Error && error.message === 'Memorial page not found') {
        return res.status(404).json({
          success: false,
          message: 'Памятная страница не найдена'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Ошибка удаления страницы'
      });
    }
  }
};