export interface MediaFile {
    id: string;
    originalName: string;
    url: string;
    thumbnailUrl?: string;
    size: number;
    mimeType: string;
    uploadedBy: string | null;
    uploadedAt: Date;
}
export interface UploadResult {
    mediaFile: MediaFile;
    thumbnailUrl?: string;
}
export declare class LocalMediaService {
    private readonly uploadsDir;
    private readonly allowedImageTypes;
    private readonly allowedVideoTypes;
    private readonly maxFileSize;
    private readonly maxImageSize;
    private readonly thumbnailWidth;
    constructor();
    private ensureDirectoryExists;
    uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string, uploadedBy: string | null): Promise<UploadResult>;
    private generateThumbnail;
    deleteFile(fileId: string): Promise<void>;
    getFile(fileId: string): Promise<MediaFile | null>;
    getFilesByMemorialPage(memorialPageId: string): Promise<MediaFile[]>;
    cleanupUnusedFiles(): Promise<number>;
    private validateFile;
    private isImage;
    private isVideo;
    private generateFilePath;
    getFileStatistics(): Promise<{
        totalFiles: number;
        totalSize: number;
        imageCount: number;
        videoCount: number;
    }>;
}
export declare const localMediaService: LocalMediaService;
//# sourceMappingURL=mediaService-local.d.ts.map