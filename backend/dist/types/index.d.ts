export interface User {
    id: string;
    email: string;
    name: string;
    subscriptionType: 'trial' | 'free' | 'premium';
    subscriptionExpiresAt: Date | null;
    createdAt: Date;
}
export interface MemorialPage {
    id: string;
    slug: string;
    ownerId: string;
    fullName: string;
    birthDate: Date;
    deathDate: Date;
    mainPhotoId?: string;
    biographyText?: string;
    isPrivate: boolean;
    passwordHash?: string;
    qrCodeUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateMemorialPageRequest {
    fullName: string;
    birthDate: string;
    deathDate: string;
    mainPhotoId?: string;
    biographyText?: string;
    isPrivate?: boolean;
    password?: string;
}
export interface UpdateMemorialPageRequest {
    fullName?: string;
    birthDate?: string;
    deathDate?: string;
    mainPhotoId?: string | null;
    biographyText?: string;
    isPrivate?: boolean;
    password?: string;
}
export interface MemorialPageResponse {
    id: string;
    slug: string;
    ownerId: string;
    fullName: string;
    birthDate: string;
    deathDate: string;
    mainPhotoId?: string;
    biographyText?: string;
    isPrivate: boolean;
    qrCodeUrl?: string;
    createdAt: string;
    updatedAt: string;
    owner: {
        id: string;
        name: string;
        email: string;
    };
    mainPhoto?: {
        id: string;
        url: string;
        thumbnailUrl?: string;
    } | null;
    _count: {
        memories: number;
        tributes: number;
        mediaFiles: number;
    };
}
export interface MediaFile {
    id: string;
    originalName: string;
    url: string;
    thumbnailUrl?: string | null;
    size: number;
    mimeType: string;
    uploadedBy: string;
    uploadedAt: Date;
}
export interface AuthTokenPayload {
    userId: string;
    email: string;
    subscriptionType: string;
}
export * from './auth';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
//# sourceMappingURL=index.d.ts.map