"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = __importDefault(require("../config/database"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const subscription_1 = require("../utils/subscription");
const emailService_1 = require("./emailService");
const crypto_1 = __importDefault(require("crypto"));
class AuthService {
    async register(data) {
        const { email, password, name } = data;
        const existingUser = await database_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw new Error('Пользователь с таким email уже существует');
        }
        const passwordHash = await (0, password_1.hashPassword)(password);
        const { subscriptionType, expiresAt } = (0, subscription_1.createTrialSubscription)();
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 24);
        const user = await database_1.default.user.create({
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
        try {
            await emailService_1.emailService.sendEmailVerification({
                email: user.email,
                name: user.name,
                verificationToken,
            });
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
        }
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            subscriptionType: user.subscriptionType,
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
    async login(data) {
        const { email, password } = data;
        const user = await database_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new Error('Неверный email или пароль');
        }
        if (!user.passwordHash) {
            throw new Error('Этот аккаунт создан через OAuth. Используйте вход через соцсети.');
        }
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Неверный email или пароль');
        }
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            subscriptionType: user.subscriptionType,
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
    async getUserById(userId) {
        const user = await database_1.default.user.findUnique({
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
    async updateSubscription(userId, subscriptionType) {
        let subscriptionExpiresAt = null;
        if (subscriptionType === 'trial') {
            const { expiresAt } = (0, subscription_1.createTrialSubscription)();
            subscriptionExpiresAt = expiresAt;
        }
        else if (subscriptionType === 'premium') {
            subscriptionExpiresAt = new Date();
            subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 30);
        }
        await database_1.default.user.update({
            where: { id: userId },
            data: {
                subscriptionType,
                subscriptionExpiresAt,
            }
        });
    }
    async verifyEmail(token) {
        const user = await database_1.default.user.findUnique({
            where: { verificationToken: token }
        });
        if (!user) {
            throw new Error('Неверный токен верификации');
        }
        if (!user.verificationExpires || user.verificationExpires < new Date()) {
            throw new Error('Срок действия токена истек');
        }
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationExpires: null,
            }
        });
    }
    async resendVerificationEmail(email) {
        const user = await database_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        if (user.emailVerified) {
            throw new Error('Email уже подтвержден');
        }
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 24);
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                verificationToken,
                verificationExpires,
            }
        });
        await emailService_1.emailService.sendEmailVerification({
            email: user.email,
            name: user.name,
            verificationToken,
        });
    }
    async requestPasswordReset(email) {
        const user = await database_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            return;
        }
        if (user.oauthProvider) {
            throw new Error('Невозможно сбросить пароль для аккаунта, созданного через OAuth');
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date();
        resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpires,
            }
        });
        await emailService_1.emailService.sendPasswordReset({
            email: user.email,
            name: user.name,
            resetToken,
        });
    }
    async resetPassword(token, newPassword) {
        const user = await database_1.default.user.findUnique({
            where: { resetToken: token }
        });
        if (!user) {
            throw new Error('Неверный токен восстановления');
        }
        if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            throw new Error('Срок действия токена истек');
        }
        const passwordHash = await (0, password_1.hashPassword)(newPassword);
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpires: null,
            }
        });
    }
    async changeUnverifiedEmail(userId, newEmail) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        if (user.emailVerified) {
            throw new Error('Невозможно изменить подтвержденный email. Обратитесь в поддержку.');
        }
        const existingUser = await database_1.default.user.findUnique({
            where: { email: newEmail }
        });
        if (existingUser) {
            throw new Error('Этот email уже используется');
        }
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 24);
        await database_1.default.user.update({
            where: { id: userId },
            data: {
                email: newEmail,
                verificationToken,
                verificationExpires,
                emailVerified: false,
            }
        });
        await emailService_1.emailService.sendEmailVerification({
            email: newEmail,
            name: user.name,
            verificationToken,
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map