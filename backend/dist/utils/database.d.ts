export declare function testDatabaseConnection(): Promise<boolean>;
export declare function getDatabaseHealth(): Promise<{
    status: string;
    responseTime: string;
    timestamp: string;
    error?: undefined;
} | {
    status: string;
    error: string;
    timestamp: string;
    responseTime?: undefined;
}>;
export declare function cleanupExpiredTrials(): Promise<number>;
export declare function getDatabaseStats(): Promise<{
    users: {
        total: number;
        active: number;
    };
    content: {
        memorialPages: number;
        mediaFiles: number;
        memories: number;
        tributes: number;
    };
    moderation: {
        pending: number;
    };
}>;
export declare function createDatabaseBackup(): Promise<{
    status: string;
    message: string;
}>;
//# sourceMappingURL=database.d.ts.map