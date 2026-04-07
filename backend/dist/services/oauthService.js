"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthService = exports.OAuthService = void 0;
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const subscription_1 = require("../utils/subscription");
class OAuthService {
    async findOrCreateUser(data) {
        let user = await database_1.default.user.findFirst({
            where: { oauthProvider: data.provider, oauthId: data.providerId },
        });
        if (!user && data.email) {
            user = await database_1.default.user.findUnique({ where: { email: data.email } });
            if (user) {
                user = await database_1.default.user.update({
                    where: { id: user.id },
                    data: { oauthProvider: data.provider, oauthId: data.providerId },
                });
            }
        }
        if (!user) {
            const trial = (0, subscription_1.createTrialSubscription)();
            user = await database_1.default.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    oauthProvider: data.provider,
                    oauthId: data.providerId,
                    emailVerified: true,
                    subscriptionType: trial.subscriptionType,
                    subscriptionExpiresAt: trial.expiresAt,
                },
            });
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
    getVkAuthUrl() {
        const clientId = process.env.VK_CLIENT_ID;
        const redirectUri = process.env.VK_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/vk/callback`;
        const scope = 'email';
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
            response_type: 'code',
            v: '5.131',
        });
        return `https://oauth.vk.com/authorize?${params}`;
    }
    async handleVkCallback(code) {
        const clientId = process.env.VK_CLIENT_ID;
        const clientSecret = process.env.VK_CLIENT_SECRET;
        const redirectUri = process.env.VK_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/vk/callback`;
        const tokenRes = await fetch(`https://oauth.vk.com/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`);
        const tokenData = await tokenRes.json();
        if (tokenData.error) {
            throw new Error(`VK OAuth error: ${tokenData.error_description || tokenData.error}`);
        }
        const { access_token, user_id, email } = tokenData;
        const userRes = await fetch(`https://api.vk.com/method/users.get?user_ids=${user_id}&fields=first_name,last_name&access_token=${access_token}&v=5.131`);
        const userData = await userRes.json();
        const vkUser = userData.response?.[0];
        if (!vkUser) {
            throw new Error('Не удалось получить данные пользователя VK');
        }
        const name = `${vkUser.first_name} ${vkUser.last_name}`.trim();
        const userEmail = email || `vk_${user_id}@vk.nativeheart.ru`;
        return this.findOrCreateUser({
            provider: 'vk',
            providerId: String(user_id),
            email: userEmail,
            name,
        });
    }
    getYandexAuthUrl() {
        const clientId = process.env.YANDEX_CLIENT_ID;
        const redirectUri = process.env.YANDEX_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/yandex/callback`;
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri,
        });
        return `https://oauth.yandex.ru/authorize?${params}`;
    }
    async handleYandexCallback(code) {
        const clientId = process.env.YANDEX_CLIENT_ID;
        const clientSecret = process.env.YANDEX_CLIENT_SECRET;
        const redirectUri = process.env.YANDEX_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/yandex/callback`;
        const tokenRes = await fetch('https://oauth.yandex.ru/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
            }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error) {
            throw new Error(`Yandex OAuth error: ${tokenData.error_description || tokenData.error}`);
        }
        const userRes = await fetch('https://login.yandex.ru/info?format=json', {
            headers: { Authorization: `OAuth ${tokenData.access_token}` },
        });
        const yandexUser = await userRes.json();
        if (!yandexUser.id) {
            throw new Error('Не удалось получить данные пользователя Яндекс');
        }
        const name = yandexUser.real_name || yandexUser.display_name || yandexUser.login;
        const email = yandexUser.default_email || `${yandexUser.login}@yandex.ru`;
        return this.findOrCreateUser({
            provider: 'yandex',
            providerId: String(yandexUser.id),
            email,
            name,
        });
    }
}
exports.OAuthService = OAuthService;
exports.oauthService = new OAuthService();
//# sourceMappingURL=oauthService.js.map