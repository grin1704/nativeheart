interface AdminLoginResult {
    admin: {
        id: string;
        email: string;
        name: string;
        role: string;
        permissions: Array<{
            resource: string;
            actions: string[];
        }>;
    };
    token: string;
}
export declare const adminAuthService: {
    login(email: string, password: string): Promise<AdminLoginResult | null>;
    getAdminProfile(adminId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        lastLogin: Date;
        permissions: {
            resource: string;
            actions: string[];
        }[];
    }>;
    refreshToken(refreshToken: string): Promise<{
        token: string;
    } | null>;
    createAdmin(email: string, password: string, name: string, role?: string): Promise<{
        name: string;
        email: string;
        id: string;
        passwordHash: string;
        isActive: boolean;
        createdAt: Date;
        role: string;
        lastLogin: Date | null;
    }>;
    getDefaultPermissions(role: string): {
        resource: string;
        actions: string[];
    }[];
};
export {};
//# sourceMappingURL=adminAuthService.d.ts.map