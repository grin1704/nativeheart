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
export declare class MediaService {
    private readonly bucketName;
    private readonly allowedImageTypes;
    private readonly allowedVideoTypes;
    private readonly maxFileSize;
    private readonly maxImageSize;
    private readonly thumbnailWidth;
    constructor();
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
    private extractFilePathFromUrl;
    getFileStatistics(): Promise<{
        totalFiles: number;
        totalSize: number;
        imageCount: number;
        videoCount: number;
    }>;
}
export declare const mediaService: MediaService;
//# sourceMappingURL=mediaService.d.ts.map