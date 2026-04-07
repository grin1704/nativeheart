import crypto from 'crypto';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { createTrialSubscription } from '../utils/subscription';

interface OAuthUserData {
  provider: 'vk' | 'yandex';
  providerId: string;
  email: string;
  name: string;
}

// In-memory store для code_verifier (в продакшене лучше Redis, но для начала достаточно)
const pkceStore = new Map<string, { verifier: string; createdAt: number }>();

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

export class OAuthService {
  /**
   * Находит или создаёт пользователя по OAuth данным
   */
  async findOrCreateUser(data: OAuthUserData) {
    // Ищем по provider + providerId
    let user = await prisma.user.findFirst({
      where: { oauthProvider: data.provider, oauthId: data.providerId },
    });

    // Если не нашли по provider — ищем по email
    if (!user && data.email) {
      user = await prisma.user.findUnique({ where: { email: data.email } });
      if (user) {
        // Привязываем OAuth к существующему аккаунту
        user = await prisma.user.update({
          where: { id: user.id },
          data: { oauthProvider: data.provider, oauthId: data.providerId },
        });
      }
    }

    // Создаём нового пользователя
    if (!user) {
      const trial = createTrialSubscription();
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          oauthProvider: data.provider,
          oauthId: data.providerId,
          emailVerified: true, // OAuth email считается подтверждённым
          subscriptionType: trial.subscriptionType,
          subscriptionExpiresAt: trial.expiresAt,
        },
      });
    }

    const token = generateToken({
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

  /**
   * VK: получить URL для авторизации (OAuth 2.1 с PKCE)
   */
  getVkAuthUrl(): { authUrl: string; state: string } {
    const clientId = process.env.VK_CLIENT_ID;
    const redirectUri = process.env.VK_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/vk/callback`;

    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const state = generateState();

    // Сохраняем verifier по state
    pkceStore.set(state, { verifier, createdAt: Date.now() });
    // Чистим старые записи (старше 10 минут)
    for (const [k, v] of pkceStore.entries()) {
      if (Date.now() - v.createdAt > 600000) pkceStore.delete(k);
    }

    const params = new URLSearchParams({
      client_id: clientId!,
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

  /**
   * VK: обменять code на токен (OAuth 2.1 с PKCE)
   */
  async handleVkCallback(code: string, deviceId: string, state: string) {
    const clientId = process.env.VK_CLIENT_ID!;
    const redirectUri = process.env.VK_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/vk/callback`;

    // Получаем verifier по state
    const pkceData = pkceStore.get(state);
    if (!pkceData) {
      throw new Error('Недействительный state. Попробуйте войти снова.');
    }
    pkceStore.delete(state);

    // Обмениваем code на токен
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
    const tokenData = await tokenRes.json() as any;

    if (tokenData.error) {
      throw new Error(`VK OAuth error: ${tokenData.error_description || tokenData.error}`);
    }

    const { access_token, id_token } = tokenData;

    // Получаем данные пользователя через userinfo
    const userRes = await fetch('https://id.vk.com/oauth2/user_info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, access_token }),
    });
    const userInfo = await userRes.json() as any;
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

  /**
   * Яндекс: получить URL для авторизации
   */
  getYandexAuthUrl(): string {
    const clientId = process.env.YANDEX_CLIENT_ID!;
    const redirectUri = process.env.YANDEX_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/yandex/callback`;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
    });
    return `https://oauth.yandex.ru/authorize?${params}`;
  }

  /**
   * Яндекс: обменять code на токен и получить данные пользователя
   */
  async handleYandexCallback(code: string) {
    const clientId = process.env.YANDEX_CLIENT_ID!;
    const clientSecret = process.env.YANDEX_CLIENT_SECRET!;
    const redirectUri = process.env.YANDEX_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/yandex/callback`;

    // Получаем access_token
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
    const tokenData = await tokenRes.json() as any;

    if (tokenData.error) {
      throw new Error(`Yandex OAuth error: ${tokenData.error_description || tokenData.error}`);
    }

    // Получаем данные пользователя
    const userRes = await fetch('https://login.yandex.ru/info?format=json', {
      headers: { Authorization: `OAuth ${tokenData.access_token}` },
    });
    const yandexUser = await userRes.json() as any;

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

export const oauthService = new OAuthService();
