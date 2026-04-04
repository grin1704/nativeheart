export interface SystemSettings {
    trialPeriodDays: number;
    maxFileSize: number;
    maxFilesPerPage: number;
    biographyCharLimit: number;
    allowedFileTypes: string[];
    moderationRequired: boolean;
    maintenanceMode: boolean;
    emailSettings: {
        smtpHost: string;
        smtpPort: number;
        smtpUser: string;
        smtpPassword: string;
        fromEmail: string;
        fromName: string;
    };
    yandexCloudSettings: {
        accessKeyId: string;
        secretAccessKey: string;
        bucketName: string;
        region: string;
    };
    subscriptionSettings: {
        trialDurationDays: number;
        premiumPriceMonthly: number;
        premiumPriceYearly: number;
        currency: string;
    };
}
export interface SystemSettingsUpdate {
    trialPeriodDays?: number;
    maxFileSize?: number;
    maxFilesPerPage?: number;
    biographyCharLimit?: number;
    allowedFileTypes?: string[];
    moderationRequired?: boolean;
    maintenanceMode?: boolean;
    emailSettings?: Partial<SystemSettings['emailSettings']>;
    yandexCloudSettings?: Partial<SystemSettings['yandexCloudSettings']>;
    subscriptionSettings?: Partial<SystemSettings['subscriptionSettings']>;
}
export interface SettingUpdate {
    key: string;
    value: any;
    description?: string;
}
export declare class AdminSettingsService {
    getSystemSettings(): Promise<SystemSettings>;
    updateSystemSettings(updates: SystemSettingsUpdate, adminUserId: string): Promise<void>;
    getSetting(key: string): Promise<any>;
    updateSetting(key: string, value: any, adminUserId: string): Promise<void>;
    getSystemStatistics(): Promise<{
        totalUsers: number;
        activeUsers: number;
        totalMemorialPages: number;
        totalMediaFiles: number;
        storageUsed: number;
        subscriptionStats: {
            trial: number;
            free: number;
            premium: number;
        };
    }>;
    exportSettings(): Promise<SystemSettings>;
    importSettings(settings: SystemSettingsUpdate, adminUserId: string): Promise<void>;
    resetToDefaults(adminUserId: string): Promise<void>;
    private getSettingDescription;
}
export declare const adminSettingsService: AdminSettingsService;
//# sourceMappingURL=adminSettingsService.d.ts.map