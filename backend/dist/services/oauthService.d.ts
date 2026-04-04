export interface OAuthUserInfo {
    id: string;
    email: string;
    name: string;
}
export declare class OAuthService {
    getVKAuthUrl(redirectUri: string): string;
    getVKUserInfo(code: string, redirectUri: string): Promise<OAuthUserInfo>;
    getYandexAuthUrl(redirectUri: string): string;
    getYandexUserInfo(code: string, redirectUri: string): Promise<OAuthUserInfo>;
    private generateState;
}
export declare const oauthService: OAuthService;
//# sourceMappingURL=oauthService.d.ts.map