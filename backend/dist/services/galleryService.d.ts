export interface GalleryItem {
    id: string;
    mediaFileId: string;
    title?: string;
    description?: string;
    orderIndex: number;
    createdAt: Date;
    mediaFile: {
        id: string;
        originalName: string;
        url: string;
        thumbnailUrl?: string;
        size: number;
        mimeType: string;
        uploadedAt: Date;
    };
}
export interface CreateGalleryItemData {
    mediaFileId?: string;
    title?: string;
    description?: string;
    videoType?: 'upload' | 'vk' | 'rutube';
    externalUrl?: string;
    embedCode?: string;
    thumbnailUrl?: string;
}
export interface UpdateGalleryItemData {
    title?: string;
    description?: string;
    orderIndex?: number;
    mediaFileId?: string;
}
export interface GalleryResponse {
    items: GalleryItem[];
    hasAccess: boolean;
    subscriptionRequired: boolean;
}
export declare class GalleryService {
    private checkEditAccess;
    private isCollaborator;
    private getPageFeatureAccess;
    getPhotoGallery(pageId: string, userId?: string): Promise<GalleryResponse>;
    getVideoGallery(pageId: string, userId?: string): Promise<GalleryResponse>;
    addPhotoToGallery(pageId: string, userId: string, data: CreateGalleryItemData): Promise<GalleryItem>;
    addVideoToGallery(pageId: string, userId: string, data: CreateGalleryItemData): Promise<GalleryItem>;
    updatePhotoGalleryItem(pageId: string, itemId: string, userId: string, data: UpdateGalleryItemData): Promise<GalleryItem>;
    updateVideoGalleryItem(pageId: string, itemId: string, userId: string, data: UpdateGalleryItemData): Promise<GalleryItem>;
    removePhotoFromGallery(pageId: string, itemId: string, userId: string): Promise<void>;
    removeVideoFromGallery(pageId: string, itemId: string, userId: string): Promise<void>;
    reorderPhotoGallery(pageId: string, userId: string, itemIds: string[]): Promise<void>;
    reorderVideoGallery(pageId: string, userId: string, itemIds: string[]): Promise<void>;
}
export declare const galleryService: GalleryService;
//# sourceMappingURL=galleryService.d.ts.map