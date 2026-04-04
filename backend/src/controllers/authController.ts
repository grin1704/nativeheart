import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema, subscriptionUpdateSchema } from '../validation/auth';
import { getFeatureAccess } from '../utils/subscription';
import { SubscriptionType } from '../types/auth';
import { PrismaClient } from '@prisma/client';

const authService = new AuthService();
const prisma = new PrismaClient();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request data
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: 'Ошибка валидации',
          details: error.details.map(detail => detail.message)
        });
        return;
      }

      // Register user
      const result = await authService.register(value);

      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        data: result
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Ошибка регистрации'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request data
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: 'Ошибка валидации',
          details: error.details.map(detail => detail.message)
        });
        return;
      }

      // Login user
      const result = await authService.login(value);

      res.json({
        message: 'Успешный вход в систему',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Ошибка входа в систему'
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Пользователь не аутентифицирован' });
        return;
      }

      // Get fresh user data from database to ensure emailVerified is up-to-date
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

      const featureAccess = getFeatureAccess(
        freshUser.subscriptionType as SubscriptionType,
        freshUser.subscriptionExpiresAt
      );

      // Transform data to match expected format
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
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Ошибка получения профиля пользователя'
      });
    }
  }

  async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Пользователь не аутентифицирован' });
        return;
      }

      // Validate request data
      const { error, value } = subscriptionUpdateSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: 'Ошибка валидации',
          details: error.details.map(detail => detail.message)
        });
        return;
      }

      // Update subscription
      await authService.updateSubscription(req.user.id, value.subscriptionType);

      // Get updated user data
      const updatedUser = await authService.getUserById(req.user.id);
      const featureAccess = getFeatureAccess(
        updatedUser.subscriptionType as SubscriptionType,
        updatedUser.subscriptionExpiresAt
      );

      res.json({
        message: 'Подписка успешно обновлена',
        user: updatedUser,
        featureAccess
      });
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(500).json({
        error: 'Ошибка обновления подписки'
      });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    // Since we're using stateless JWT, logout is handled on the client side
    // by removing the token. We just return a success message.
    res.json({
      message: 'Успешный выход из системы'
    });
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Ошибка верификации email'
      });
    }
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Ошибка отправки письма'
      });
    }
  }

  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email обязателен' });
        return;
      }

      await authService.requestPasswordReset(email);

      // Always return success to prevent email enumeration
      res.json({
        message: 'Если пользователь с таким email существует, письмо с инструкциями отправлено'
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      // Don't reveal if user exists
      res.json({
        message: 'Если пользователь с таким email существует, письмо с инструкциями отправлено'
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Ошибка сброса пароля'
      });
    }
  }

  async changeUnverifiedEmail(req: Request, res: Response): Promise<void> {
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

      // Basic email validation
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
    } catch (error) {
      console.error('Change email error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Ошибка изменения email'
      });
    }
  }

}
