"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserController = void 0;
const adminUserService_1 = require("../services/adminUserService");
const logger_1 = require("../utils/logger");
exports.adminUserController = {
    async getAllUsers(req, res) {
        try {
            const { page = '1', limit = '20', search, subscriptionType, isActive, createdAfter, createdBefore } = req.query;
            const filters = {
                search: search,
                subscriptionType: subscriptionType,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                createdAfter: createdAfter ? new Date(createdAfter) : undefined,
                createdBefore: createdBefore ? new Date(createdBefore) : undefined
            };
            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const result = await adminUserService_1.adminUserService.getAllUsers(filters, pagination);
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Get all users controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения списка пользователей'
            });
        }
    },
    async getUserDetails(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID пользователя обязателен'
                });
            }
            const userDetails = await adminUserService_1.adminUserService.getUserDetails(userId);
            res.json({
                success: true,
                data: userDetails
            });
        }
        catch (error) {
            logger_1.logger.error('Get user details controller error:', error);
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
    async suspendUser(req, res) {
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
            const user = await adminUserService_1.adminUserService.suspendUser(userId, reason, adminId);
            res.json({
                success: true,
                message: 'Пользователь заблокирован',
                data: user
            });
        }
        catch (error) {
            logger_1.logger.error('Suspend user controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка блокировки пользователя'
            });
        }
    },
    async activateUser(req, res) {
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
            const user = await adminUserService_1.adminUserService.activateUser(userId, adminId);
            res.json({
                success: true,
                message: 'Пользователь разблокирован',
                data: user
            });
        }
        catch (error) {
            logger_1.logger.error('Activate user controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка разблокировки пользователя'
            });
        }
    },
    async updateUserSubscription(req, res) {
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
            const user = await adminUserService_1.adminUserService.updateUserSubscription(userId, subscriptionType, expirationDate, adminId);
            res.json({
                success: true,
                message: 'Подписка пользователя обновлена',
                data: user
            });
        }
        catch (error) {
            logger_1.logger.error('Update user subscription controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка обновления подписки'
            });
        }
    },
    async getUserActivity(req, res) {
        try {
            const { userId } = req.params;
            const { limit = '20' } = req.query;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID пользователя обязателен'
                });
            }
            const activity = await adminUserService_1.adminUserService.getUserActivity(userId, parseInt(limit));
            res.json({
                success: true,
                data: activity
            });
        }
        catch (error) {
            logger_1.logger.error('Get user activity controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения активности пользователя'
            });
        }
    },
    async getAllMemorialPages(req, res) {
        try {
            const { page = '1', limit = '20', search, status, subscriptionType, createdAfter, createdBefore } = req.query;
            const filters = {
                search: search,
                status: status,
                subscriptionType: subscriptionType,
                createdAfter: createdAfter ? new Date(createdAfter) : undefined,
                createdBefore: createdBefore ? new Date(createdBefore) : undefined
            };
            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const result = await adminUserService_1.adminUserService.getAllMemorialPages(filters, pagination);
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Get all memorial pages controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения списка памятных страниц'
            });
        }
    },
    async getMemorialPageDetails(req, res) {
        try {
            const { pageId } = req.params;
            if (!pageId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID страницы обязателен'
                });
            }
            const pageDetails = await adminUserService_1.adminUserService.getMemorialPageDetails(pageId);
            res.json({
                success: true,
                data: pageDetails
            });
        }
        catch (error) {
            logger_1.logger.error('Get memorial page details controller error:', error);
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
    async deleteMemorialPage(req, res) {
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
            await adminUserService_1.adminUserService.deleteMemorialPage(pageId, reason, adminId);
            res.json({
                success: true,
                message: 'Памятная страница удалена'
            });
        }
        catch (error) {
            logger_1.logger.error('Delete memorial page controller error:', error);
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
//# sourceMappingURL=adminUserController.js.map