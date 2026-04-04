"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthService = exports.OAuthService = void 0;
const axios_1 = __importDefault(require("axios"));
class OAuthService {
    getVKAuthUrl(redirectUri) {
        const clientId = process.env.VK_CLIENT_ID;
        const scope = 'email';
        const state = this.generateState();
        return `https://oauth.vk.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}&v=5.131`;
    }
    async getVKUserInfo(code, redirectUri) {
        const clientId = process.env.VK_CLIENT_ID;
        const clientSecret = process.env.VK_CLIENT_SECRET;
        const tokenResponse = await axios_1.default.get('https://oauth.vk.com/access_token', {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                code: code,
            }
        });
        const { access_token, email, user_id } = tokenResponse.data;
        if (!email) {
            throw new Error('Email не предоставлен ВКонтакте');
        }
        const userResponse = await axios_1.default.get('https://api.vk.com/method/users.get', {
            params: {
                user_ids: user_id,
                fields: 'first_name,last_name',
                access_token: access_token,
                v: '5.131',
            }
        });
        const userData = userResponse.data.response[0];
        const name = `${userData.first_name} ${userData.last_name}`;
        return {
            id: user_id.toString(),
            email: email,
            name: name,
        };
    }
    getYandexAuthUrl(redirectUri) {
        const clientId = process.env.YANDEX_CLIENT_ID;
        const state = this.generateState();
        return `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    }
    async getYandexUserInfo(code, redirectUri) {
        const clientId = process.env.YANDEX_CLIENT_ID;
        const clientSecret = process.env.YANDEX_CLIENT_SECRET;
        const tokenResponse = await axios_1.default.post('https://oauth.yandex.ru/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: clientId,
            client_secret: clientSecret,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        const { access_token } = tokenResponse.data;
        const userResponse = await axios_1.default.get('https://login.yandex.ru/info', {
            headers: {
                Authorization: `OAuth ${access_token}`,
            }
        });
        const userData = userResponse.data;
        return {
            id: userData.id,
            email: userData.default_email || userData.emails[0],
            name: userData.display_name || `${userData.first_name} ${userData.last_name}`,
        };
    }
    generateState() {
        return Math.random().toString(36).substring(2, 15);
    }
}
exports.OAuthService = OAuthService;
exports.oauthService = new OAuthService();
//# sourceMappingURL=oauthService.js.map