"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthService = exports.OAuthService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const subscription_1 = require("../utils/subscription");
const pkceStore = new Map();
function generateCodeVerifier() {
    return crypto_1.default.randomBytes(32).toString('base64url');
}
function generateCodeChallenge(verifier) {
    return crypto_1.default.createHash('sha256').update(verifier).digest('base64url');
}
function generateState() {
    return crypto_1.default.randomBytes(16).toString('hex');
}
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
        const redirectUri = process.env.VK_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/vk/callback`;
        const verifier = generateCodeVerifier();
        const challenge = generateCodeChallenge(verifier);
        const state = generateState();
        pkceStore.set(state, { verifier, createdAt: Date.now() });
        for (const [k, v] of pkceStore.entries()) {
            if (Date.now() - v.createdAt > 600000)
                pkceStore.delete(k);
        }
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: 'email',
            response_type: 'code',
            state,
            code_challenge: challenge,
            code_challenge_method: 'S256',
            v: '5.131',
        });
        return { authUrl: `https://id.vk.com/authorize?${params}`, state };
    }
    async handleVkCallback(code, deviceId, state) {
        const clientId = process.env.VK_CLIENT_ID;
        const redirectUri = process.env.VK_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/vk/callback`;
        const pkceData = pkceStore.get(state);
        if (!pkceData) {
            throw new Error('Недействительный state. Попробуйте войти снова.');
        }
        pkceStore.delete(state);
        const tokenRes = await fetch('https://id.vk.com/oauth2/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientId,
                code,
                device_id: deviceId,
                redirect_uri: redirectUri,
                code_verifier: pkceData.verifier,
            }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error) {
            throw new Error(`VK OAuth error: ${tokenData.error_description || tokenData.error}`);
        }
        const { access_token, id_token } = tokenData;
        const userRes = await fetch('https://id.vk.com/oauth2/user_info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ client_id: clientId, access_token }),
        });
        const userInfo = await userRes.json();
        const vkUser = userInfo.user;
        if (!vkUser?.user_id) {
            throw new Error('Не удалось получить данные пользователя VK');
        }
        const name = `${vkUser.first_name || ''} ${vkUser.last_name || ''}`.trim() || vkUser.email || `vk_${vkUser.user_id}`;
        const email = vkUser.email || `vk_${vkUser.user_id}@vk.nativeheart.ru`;
        return this.findOrCreateUser({
            provider: 'vk',
            providerId: String(vkUser.user_id),
            email,
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