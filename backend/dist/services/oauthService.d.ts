interface OAuthUserData {
    provider: 'vk' | 'yandex';
    providerId: string;
    email: string;
    name: string;
}
export declare class OAuthService {
    findOrCreateUser(data: OAuthUserData): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            subscriptionType: string;
            subscriptionExpiresAt: Date;
            emailVerified: boolean;
            oauthProvider: string;
            oauthId: string;
        };
        token: string;
    }>;
    getVkAuthUrl(): {
        authUrl: string;
        state: string;
    };
    handleVkCallback(code: string, deviceId: string, state: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            subscriptionType: string;
            subscriptionExpiresAt: Date;
            emailVerified: boolean;
            oauthProvider: string;
            oauthId: string;
        };
        token: string;
    }>;
    getYandexAuthUrl(): string;
    handleYandexCallback(code: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            subscriptionType: string;
            subscriptionExpiresAt: Date;
            emailVerified: boolean;
            oauthProvider: string;
            oauthId: string;
        };
        token: string;
    }>;
}
export declare const oauthService: OAuthService;
export {};
//# sourceMappingURL=oauthService.d.ts.map