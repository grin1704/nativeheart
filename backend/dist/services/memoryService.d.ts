import { PaginationParams, PaginatedResponse } from '../types';
export interface CreateMemoryData {
    date: Date;
    title: string;
    description?: string;
    photoIds?: string[];
}
export interface UpdateMemoryData {
    date?: Date;
    title?: string;
    description?: string;
    photoIds?: string[];
}
export interface MemoryWithPhotos {
    id: string;
    memorialPageId: string;
    date: Date;
    title: string;
    description: string | null;
    createdAt: Date;
    photos: {
        id: string;
        url: string;
        thumbnailUrl?: string;
        originalName: string;
        orderIndex: number;
    }[];
}
export interface MemoryQueryParams extends PaginationParams {
    sortBy?: 'date' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
export declare class MemoryService {
    createMemory(memorialPageId: string, userId: string, data: CreateMemoryData): Promise<MemoryWithPhotos>;
    getMemoryById(memoryId: string): Promise<MemoryWithPhotos>;
    getMemoriesForPage(memorialPageId: string, userId: string | undefined, params: MemoryQueryParams): Promise<PaginatedResponse<MemoryWithPhotos>>;
    updateMemory(memoryId: string, userId: string, data: UpdateMemoryData): Promise<MemoryWithPhotos>;
    deleteMemory(memoryId: string, userId: string): Promise<void>;
    addPhotoToMemory(memoryId: string, userId: string, photoId: string): Promise<void>;
    removePhotoFromMemory(memoryId: string, userId: string, photoId: string): Promise<void>;
    reorderMemoryPhotos(memoryId: string, userId: string, photoIds: string[]): Promise<void>;
    private checkPageAccess;
    private checkEditAccess;
    private checkMemoriesFeatureAccess;
    private validatePhotoIds;
    private addPhotosToMemory;
    private isCollaborator;
}
export declare const memoryService: MemoryService;
//# sourceMappingURL=memoryService.d.ts.map