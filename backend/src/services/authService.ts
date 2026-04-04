import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { createTrialSubscription } from '../utils/subscription';
import { LoginRequest, RegisterRequest, AuthResponse, SubscriptionType } from '../types/auth';
import { emailService } from './emailService';
import crypto from 'crypto';

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password, name } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create trial subscription
    const { subscriptionType, expiresAt } = createTrialSubscription();

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        subscriptionType,
        subscriptionExpiresAt: expiresAt,
        emailVerified: false,
        verificationToken,
        verificationExpires,
      }
    });

    // Send verification email
    try {
      await emailService.sendEmailVerification({
        email: user.email,
        name: user.name,
        verificationToken,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      subscriptionType: user.subscriptionType as SubscriptionType,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionType: user.subscriptionType,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        emailVerified: user.emailVerified,
        oauthProvider: user.oauthProvider,
        oauthId: user.oauthId,
      },
      token,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    // Check if user has password (not OAuth user)
    if (!user.passwordHash) {
      throw new Error('Этот аккаунт создан через OAuth. Используйте вход через соцсети.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Неверный email или пароль');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      subscriptionType: user.subscriptionType as SubscriptionType,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionType: user.subscriptionType,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        emailVerified: user.emailVerified,
        oauthProvider: user.oauthProvider,
        oauthId: user.oauthId,
      },
      token,
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionType: true,
        subscriptionExpiresAt: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return user;
  }

  async updateSubscription(userId: string, subscriptionType: SubscriptionType): Promise<void> {
    let subscriptionExpiresAt: Date | null = null;

    // Set expiration date based on subscription type
    if (subscriptionType === 'trial') {
      const { expiresAt } = createTrialSubscription();
      subscriptionExpiresAt = expiresAt;
    } else if (subscriptionType === 'premium') {
      // For demo purposes, set premium to expire in 30 days
      subscriptionExpiresAt = new Date();
      subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 30);
    }
    // For 'free', subscriptionExpiresAt remains null

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType,
        subscriptionExpiresAt,
      }
    });
  }

  /**
   * Verify user email with token
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token }
    });

    if (!user) {
      throw new Error('Неверный токен верификации');
    }

    if (!user.verificationExpires || user.verificationExpires < new Date()) {
      throw new Error('Срок действия токена истек');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      }
    });
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    if (user.emailVerified) {
      throw new Error('Email уже подтвержден');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
      }
    });

    // Send verification email
    await emailService.sendEmailVerification({
      email: user.email,
      name: user.name,
      verificationToken,
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Don't allow password reset for OAuth users
    if (user.oauthProvider) {
      throw new Error('Невозможно сбросить пароль для аккаунта, созданного через OAuth');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      }
    });

    // Send password reset email
    await emailService.sendPasswordReset({
      email: user.email,
      name: user.name,
      resetToken,
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { resetToken: token }
    });

    if (!user) {
      throw new Error('Неверный токен восстановления');
    }

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new Error('Срок действия токена истек');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      }
    });
  }

  /**
   * Change email for unverified accounts
   */
  async changeUnverifiedEmail(userId: string, newEmail: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Only allow email change for unverified accounts
    if (user.emailVerified) {
      throw new Error('Невозможно изменить подтвержденный email. Обратитесь в поддержку.');
    }

    // Check if new email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser) {
      throw new Error('Этот email уже используется');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Update email and verification token
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        verificationToken,
        verificationExpires,
        emailVerified: false,
      }
    });

    // Send verification email to new address
    await emailService.sendEmailVerification({
      email: newEmail,
      name: user.name,
      verificationToken,
    });
  }

}
