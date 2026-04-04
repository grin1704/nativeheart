export declare const ALLOWED_IMAGE_TYPES: string[];
export declare const ALLOWED_VIDEO_TYPES: string[];
export declare const FILE_SIZE_LIMITS: {
    IMAGE_MAX_SIZE: number;
    VIDEO_MAX_SIZE: number;
    THUMBNAIL_SIZE: {
        width: number;
        height: number;
    };
};
export declare const isImageType: (mimeType: string) => boolean;
export declare const isVideoType: (mimeType: string) => boolean;
export declare const getFileSizeLimit: (mimeType: string) => number;
export declare const formatFileSize: (bytes: number) => string;
export declare const generateSafeFilename: (originalName: string) => string;
export declare const getFileExtension: (filename: string) => string;
export declare const validateFile: (file: Express.Multer.File) => {
    isValid: boolean;
    error?: string;
};
//# sourceMappingURL=media.d.ts.map