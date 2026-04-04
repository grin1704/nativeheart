import { PaginationParams, PaginatedResponse } from '../types';
export interface CreateMemorialPageData {
    fullName: string;
    birthDate: Date;
    deathDate: Date;
    mainPhotoId?: string;
    biographyText?: string;
    isPrivate?: boolean;
    password?: string;
}
export interface UpdateMemorialPageData {
    fullName?: string;
    birthDate?: Date;
    deathDate?: Date;
    mainPhotoId?: string | null;
    biographyText?: string;
    isPrivate?: boolean;
    password?: string;
}
export interface UpdateBiographyData {
    text?: string;
    photoIds?: string[];
}
export interface BiographyData {
    text: string;
    photos: {
        id: string;
        url: string;
        thumbnailUrl?: string;
        originalName: string;
        orderIndex: number;
    }[];
    isLimited: boolean;
    characterLimit?: number;
}
export interface MemorialPageWithDetails {
    id: string;
    slug: string;
    ownerId: string;
    fullName: string;
    birthDate: Date;
    deathDate: Date;
    mainPhotoId: string | null;
    biographyText: string | null;
    isPrivate: boolean;
    passwordHash: string | null;
    qrCodeUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
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
    biography?: BiographyData;
    _count: {
        memories: number;
        tributes: number;
        mediaFiles: number;
        photoGallery: number;
        videoGallery: number;
    };
}
export declare class MemorialPageService {
    createMemorialPage(userId: string, data: CreateMemorialPageData): Promise<MemorialPageWithDetails>;
    getMemorialPageById(pageId: string, userId?: string): Promise<MemorialPageWithDetails>;
    getMemorialPageBySlug(slug: string, userId?: string): Promise<MemorialPageWithDetails>;
    updateMemorialPage(pageId: string, userId: string, data: UpdateMemorialPageData): Promise<MemorialPageWithDetails>;
    deleteMemorialPage(pageId: string, userId: string): Promise<void>;
    getUserMemorialPages(userId: string, params: PaginationParams & {
        search?: string;
    }): Promise<PaginatedResponse<MemorialPageWithDetails>>;
    verifyPagePassword(pageId: string, password: string): Promise<boolean>;
    private checkEditAccess;
    updateBiography(pageId: string, userId: string, data: UpdateBiographyData): Promise<BiographyData>;
    getBiography(pageId: string, userId?: string): Promise<BiographyData>;
    addBiographyPhoto(pageId: string, userId: string, photoId: string): Promise<void>;
    removeBiographyPhoto(pageId: string, userId: string, photoId: string): Promise<void>;
    reorderBiographyPhotos(pageId: string, userId: string, photoIds: string[]): Promise<void>;
    private isCollaborator;
}
export declare const memorialPageService: MemorialPageService;
//# sourceMappingURL=memorialPageService.d.ts.map