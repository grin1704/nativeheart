import { LoginRequest, RegisterRequest, AuthResponse, SubscriptionType } from '../types/auth';
export declare class AuthService {
    register(data: RegisterRequest): Promise<AuthResponse>;
    login(data: LoginRequest): Promise<AuthResponse>;
    getUserById(userId: string): Promise<{
        name: string;
        email: string;
        id: string;
        subscriptionType: string;
        subscriptionExpiresAt: Date;
        createdAt: Date;
    }>;
    updateSubscription(userId: string, subscriptionType: SubscriptionType): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    resendVerificationEmail(email: string): Promise<void>;
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    changeUnverifiedEmail(userId: string, newEmail: string): Promise<void>;
}
//# sourceMappingURL=authService.d.ts.map