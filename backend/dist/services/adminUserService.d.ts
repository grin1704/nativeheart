interface UserFilters {
    search?: string;
    subscriptionType?: 'trial' | 'free' | 'premium';
    isActive?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
}
interface Pagination {
    page: number;
    limit: number;
}
interface UserDetails {
    id: string;
    email: string;
    name: string;
    subscriptionType: string;
    subscriptionExpiresAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    memorialPages: Array<{
        id: string;
        fullName: string;
        slug: string;
        isPrivate: boolean;
        createdAt: Date;
    }>;
    statistics: {
        totalPages: number;
        totalMemories: number;
        totalTributes: number;
        storageUsed: number;
    };
}
export declare const adminUserService: {
    getAllUsers(filters: UserFilters, pagination: Pagination): Promise<{
        users: {
            totalPages: number;
            name: string;
            email: string;
            id: string;
            subscriptionType: string;
            subscriptionExpiresAt: Date;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            _count: {
                memorialPages: number;
            };
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserDetails(userId: string): Promise<UserDetails>;
    suspendUser(userId: string, reason: string, adminId: string): Promise<{
        name: string;
        email: string;
        id: string;
        verificationToken: string | null;
        resetToken: string | null;
        passwordHash: string | null;
        subscriptionType: string;
        subscriptionExpiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        verificationExpires: Date | null;
        resetTokenExpires: Date | null;
        oauthProvider: string | null;
        oauthId: string | null;
    }>;
    activateUser(userId: string, adminId: string): Promise<{
        name: string;
        email: string;
        id: string;
        verificationToken: string | null;
        resetToken: string | null;
        passwordHash: string | null;
        subscriptionType: string;
        subscriptionExpiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        verificationExpires: Date | null;
        resetTokenExpires: Date | null;
        oauthProvider: string | null;
        oauthId: string | null;
    }>;
    updateUserSubscription(userId: string, subscriptionType: "trial" | "free" | "premium", expiresAt: Date | null, adminId: string): Promise<{
        name: string;
        email: string;
        id: string;
        verificationToken: string | null;
        resetToken: string | null;
        passwordHash: string | null;
        subscriptionType: string;
        subscriptionExpiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        verificationExpires: Date | null;
        resetTokenExpires: Date | null;
        oauthProvider: string | null;
        oauthId: string | null;
    }>;
    getUserActivity(userId: string, limit?: number): Promise<{
        recentPages: {
            id: string;
            createdAt: Date;
            slug: string;
            fullName: string;
        }[];
        recentMemories: {
            memorialPage: {
                slug: string;
                fullName: string;
            };
            id: string;
            createdAt: Date;
            title: string;
        }[];
        recentUploads: {
            id: string;
            originalName: string;
            size: number;
            mimeType: string;
            uploadedAt: Date;
        }[];
    }>;
    getAllMemorialPages(filters: any, pagination: Pagination): Promise<{
        pages: ({
            _count: {
                photoGallery: number;
                videoGallery: number;
                memories: number;
                tributes: number;
            };
            owner: {
                name: string;
                email: string;
                id: string;
                subscriptionType: string;
            };
        } & {
            id: string;
            passwordHash: string | null;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            ownerId: string;
            fullName: string;
            birthDate: Date;
            deathDate: Date;
            mainPhotoId: string | null;
            biographyText: string | null;
            isPrivate: boolean;
            qrCodeUrl: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMemorialPageDetails(pageId: string): Promise<{
        burialLocation: {
            id: string;
            memorialPageId: string;
            address: string;
            description: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            instructions: string | null;
        };
        photoGallery: {
            mediaFile: {
                originalName: string;
                size: number;
                uploadedAt: Date;
            };
            id: string;
            createdAt: Date;
            title: string;
        }[];
        videoGallery: {
            mediaFile: {
                originalName: string;
                size: number;
                uploadedAt: Date;
            };
            id: string;
            createdAt: Date;
            title: string;
        }[];
        collaborators: ({
            user: {
                name: string;
                email: string;
                id: string;
            };
        } & {
            id: string;
            memorialPageId: string;
            userId: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
            invitedAt: Date;
            acceptedAt: Date | null;
        })[];
        memories: {
            date: Date;
            id: string;
            createdAt: Date;
            title: string;
        }[];
        tributes: {
            text: string;
            id: string;
            createdAt: Date;
            authorName: string;
            isApproved: boolean;
        }[];
        owner: {
            name: string;
            email: string;
            id: string;
            subscriptionType: string;
            subscriptionExpiresAt: Date;
        };
    } & {
        id: string;
        passwordHash: string | null;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        ownerId: string;
        fullName: string;
        birthDate: Date;
        deathDate: Date;
        mainPhotoId: string | null;
        biographyText: string | null;
        isPrivate: boolean;
        qrCodeUrl: string | null;
    }>;
    deleteMemorialPage(pageId: string, reason: string, adminId: string): Promise<void>;
};
export {};
//# sourceMappingURL=adminUserService.d.ts.map