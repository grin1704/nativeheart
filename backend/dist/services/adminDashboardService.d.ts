interface DashboardStats {
    users: {
        total: number;
        active: number;
        trial: number;
        free: number;
        premium: number;
        newThisMonth: number;
    };
    memorialPages: {
        total: number;
        published: number;
        private: number;
        newThisMonth: number;
    };
    content: {
        totalMemories: number;
        totalTributes: number;
        pendingTributes: number;
        totalMediaFiles: number;
        storageUsed: number;
    };
    activity: {
        loginsToday: number;
        pagesCreatedToday: number;
        tributesSubmittedToday: number;
    };
}
export declare const adminDashboardService: {
    getDashboardStats(): Promise<DashboardStats>;
    getRecentActivity(limit?: number): Promise<{
        recentPages: {
            id: string;
            fullName: string;
            slug: string;
            owner: string;
            createdAt: Date;
        }[];
        recentTributes: {
            id: string;
            authorName: string;
            memorialPageName: string;
            memorialPageSlug: string;
            isApproved: boolean;
            createdAt: Date;
        }[];
        recentUsers: {
            name: string;
            email: string;
            id: string;
            subscriptionType: string;
            createdAt: Date;
        }[];
    }>;
    getSystemHealth(): Promise<{
        database: {
            status: string;
            responseTime: number;
        };
        server: {
            uptime: number;
            memoryUsage: {
                rss: number;
                heapTotal: number;
                heapUsed: number;
            };
        };
        timestamp: Date;
    }>;
};
export {};
//# sourceMappingURL=adminDashboardService.d.ts.map