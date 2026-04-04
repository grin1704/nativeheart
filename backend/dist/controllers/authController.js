"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const auth_1 = require("../validation/auth");
const subscription_1 = require("../utils/subscription");
const client_1 = require("@prisma/client");
const authService = new authService_1.AuthService();
const prisma = new client_1.PrismaClient();
class AuthController {
    async register(req, res) {
        try {
            const { error, value } = auth_1.registerSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    error: 'Ошибка валидации',
                    details: error.details.map(detail => detail.message)
                });
                return;
            }
            const result = await authService.register(value);
            res.status(201).json({
                message: 'Пользователь успешно зарегистрирован',
                data: result
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Ошибка регистрации'
            });
        }
    }
    async login(req, res) {
        try {
            const { error, value } = auth_1.loginSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    error: 'Ошибка валидации',
                    details: error.details.map(detail => detail.message)
                });
                return;
            }
            const result = await authService.login(value);
            res.json({
                message: 'Успешный вход в систему',
                data: result
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                error: error instanceof Error ? error.message : 'Ошибка входа в систему'
            });
        }
    }
    async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Пользователь не аутентифицирован' });
                return;
            }
            const freshUser = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    subscriptionType: true,
                    subscriptionExpiresAt: true,
                    emailVerified: true,
                    oauthProvider: true,
                    oauthId: true,
                    passwordHash: true,
                }
            });
            if (!freshUser) {
                res.status(404).json({ error: 'Пользователь не найден' });
                return;
            }
            const featureAccess = (0, subscription_1.getFeatureAccess)(freshUser.subscriptionType, freshUser.subscriptionExpiresAt);
            const userData = {
                id: freshUser.id,
                email: freshUser.email,
                name: freshUser.name,
                subscriptionType: freshUser.subscriptionType,
                subscriptionExpiresAt: freshUser.subscriptionExpiresAt,
                emailVerified: freshUser.emailVerified,
                provider: freshUser.oauthProvider,
                providerId: freshUser.oauthId,
                hasPassword: !!freshUser.passwordHash,
            };
            res.json({
                user: userData,
                featureAccess
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                error: 'Ошибка получения профиля пользователя'
            });
        }
    }
    async updateSubscription(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Пользователь не аутентифицирован' });
                return;
            }
            const { error, value } = auth_1.subscriptionUpdateSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    error: 'Ошибка валидации',
                    details: error.details.map(detail => detail.message)
                });
                return;
            }
            await authService.updateSubscription(req.user.id, value.subscriptionType);
            const updatedUser = await authService.getUserById(req.user.id);
            const featureAccess = (0, subscription_1.getFeatureAccess)(updatedUser.subscriptionType, updatedUser.subscriptionExpiresAt);
            res.json({
                message: 'Подписка успешно обновлена',
                user: updatedUser,
                featureAccess
            });
        }
        catch (error) {
            console.error('Update subscription error:', error);
            res.status(500).json({
                error: 'Ошибка обновления подписки'
            });
        }
    }
    async logout(_req, res) {
        res.json({
            message: 'Успешный выход из системы'
        });
    }
    async verifyEmail(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                res.status(400).json({ error: 'Токен верификации обязателен' });
                return;
            }
            await authService.verifyEmail(token);
            res.json({
                message: 'Email успешно подтвержден'
            });
        }
        catch (error) {
            console.error('Email verification error:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Ошибка верификации email'
            });
        }
    }
    async resendVerification(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ error: 'Email обязателен' });
                return;
            }
            await authService.resendVerificationEmail(email);
            res.json({
                message: 'Письмо с подтверждением отправлено'
            });
        }
        catch (error) {
            console.error('Resend verification error:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Ошибка отправки письма'
            });
        }
    }
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ error: 'Email обязателен' });
                return;
            }
            await authService.requestPasswordReset(email);
            res.json({
                message: 'Если пользователь с таким email существует, письмо с инструкциями отправлено'
            });
        }
        catch (error) {
            console.error('Password reset request error:', error);
            res.json({
                message: 'Если пользователь с таким email существует, письмо с инструкциями отправлено'
            });
        }
    }
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                res.status(400).json({ error: 'Токен и новый пароль обязательны' });
                return;
            }
            if (newPassword.length < 6) {
                res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
                return;
            }
            await authService.resetPassword(token, newPassword);
            res.json({
                message: 'Пароль успешно изменен'
            });
        }
        catch (error) {
            console.error('Password reset error:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Ошибка сброса пароля'
            });
        }
    }
    async changeUnverifiedEmail(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Пользователь не аутентифицирован' });
                return;
            }
            const { newEmail } = req.body;
            if (!newEmail) {
                res.status(400).json({ error: 'Новый email обязателен' });
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                res.status(400).json({ error: 'Неверный формат email' });
                return;
            }
            await authService.changeUnverifiedEmail(req.user.id, newEmail);
            res.json({
                message: 'Email успешно изменен. Проверьте новый адрес для подтверждения.',
                newEmail
            });
        }
        catch (error) {
            console.error('Change email error:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Ошибка изменения email'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map