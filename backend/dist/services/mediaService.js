"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaService = exports.MediaService = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const mediaService_local_1 = require("./mediaService-local");
const prisma = new client_1.PrismaClient();
const isYandexCloudConfigured = !!(process.env.YANDEX_CLOUD_ACCESS_KEY_ID &&
    process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY &&
    process.env.YANDEX_CLOUD_BUCKET_NAME);
let s3 = null;
if (isYandexCloudConfigured) {
    s3 = new aws_sdk_1.default.S3({
        endpoint: 'https://storage.yandexcloud.net',
        accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY_ID,
        secretAccessKey: process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY,
        region: process.env.YANDEX_CLOUD_REGION || 'ru-central1',
        s3ForcePathStyle: true,
        signatureVersion: 'v4'
    });
}
class MediaService {
    constructor() {
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        this.allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        this.maxFileSize = 100 * 1024 * 1024;
        this.maxImageSize = 10 * 1024 * 1024;
        this.thumbnailWidth = 600;
        this.bucketName = process.env.YANDEX_CLOUD_BUCKET_NAME || 'memorial-pages-storage';
    }
    async uploadFile(fileBuffer, originalName, mimeType, uploadedBy) {
        console.log('[MediaService] uploadFile called:', {
            originalName,
            mimeType,
            bufferSize: fileBuffer.length,
            uploadedBy,
            isYandexCloudConfigured
        });
        if (!isYandexCloudConfigured) {
            console.log('Yandex Cloud not configured, using local storage');
            return mediaService_local_1.localMediaService.uploadFile(fileBuffer, originalName, mimeType, uploadedBy);
        }
        try {
            this.validateFile(fileBuffer, mimeType);
            console.log('[MediaService] File validation passed');
        }
        catch (error) {
            console.error('[MediaService] File validation failed:', error);
            throw error;
        }
        const fileId = (0, crypto_1.randomUUID)();
        const fileExtension = path_1.default.extname(originalName);
        const fileName = `${fileId}${fileExtension}`;
        const filePath = this.generateFilePath(fileName, mimeType);
        console.log('[MediaService] Generated file path:', filePath);
        try {
            const uploadParams = {
                Bucket: this.bucketName,
                Key: filePath,
                Body: fileBuffer,
                ContentType: mimeType,
                ACL: 'public-read'
            };
            console.log('[MediaService] Uploading to S3:', {
                bucket: this.bucketName,
                key: filePath,
                contentType: mimeType
            });
            const uploadResult = await s3.upload(uploadParams).promise();
            const fileUrl = uploadResult.Location;
            console.log('[MediaService] S3 upload successful:', fileUrl);
            let thumbnailUrl;
            if (this.isImage(mimeType)) {
                console.log('[MediaService] Generating thumbnail...');
                try {
                    thumbnailUrl = await this.generateThumbnail(fileBuffer, fileId, fileExtension);
                    console.log('[MediaService] Thumbnail generated:', thumbnailUrl);
                }
                catch (thumbnailError) {
                    console.error('[MediaService] Thumbnail generation failed (non-critical):', thumbnailError);
                    console.log('[MediaService] Continuing without thumbnail');
                }
            }
            console.log('[MediaService] Saving to database...');
            const mediaFile = await prisma.mediaFile.create({
                data: {
                    id: fileId,
                    originalName,
                    url: fileUrl,
                    thumbnailUrl,
                    size: fileBuffer.length,
                    mimeType,
                    uploadedBy: uploadedBy || null
                }
            });
            console.log('[MediaService] Database save successful:', mediaFile.id);
            return {
                mediaFile: {
                    ...mediaFile,
                    thumbnailUrl: mediaFile.thumbnailUrl || undefined
                },
                thumbnailUrl
            };
        }
        catch (error) {
            console.error('[MediaService] Error uploading file:', error);
            if (error instanceof Error) {
                console.error('[MediaService] Error message:', error.message);
                console.error('[MediaService] Error stack:', error.stack);
            }
            throw new Error('Failed to upload file to cloud storage');
        }
    }
    async generateThumbnail(imageBuffer, fileId, fileExtension) {
        if (!isYandexCloudConfigured || !s3) {
            throw new Error('Cloud storage not configured');
        }
        try {
            const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
            console.log('[MediaService] Image metadata:', {
                format: metadata.format,
                width: metadata.width,
                height: metadata.height,
                size: imageBuffer.length
            });
            const thumbnailBuffer = await (0, sharp_1.default)(imageBuffer)
                .resize(this.thumbnailWidth, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .jpeg({ quality: 85, progressive: true })
                .toBuffer();
            const thumbnailFileName = `${fileId}_thumb.jpg`;
            const thumbnailPath = this.generateFilePath(thumbnailFileName, 'image/jpeg', 'thumbnails');
            const uploadParams = {
                Bucket: this.bucketName,
                Key: thumbnailPath,
                Body: thumbnailBuffer,
                ContentType: 'image/jpeg',
                ACL: 'public-read'
            };
            const uploadResult = await s3.upload(uploadParams).promise();
            return uploadResult.Location;
        }
        catch (error) {
            console.error('[MediaService] Error generating thumbnail:', error);
            if (error instanceof Error) {
                console.error('[MediaService] Thumbnail error details:', error.message);
            }
            throw new Error('Failed to generate thumbnail');
        }
    }
    async deleteFile(fileId) {
        if (!isYandexCloudConfigured) {
            return mediaService_local_1.localMediaService.deleteFile(fileId);
        }
        try {
            const mediaFile = await prisma.mediaFile.findUnique({
                where: { id: fileId }
            });
            if (!mediaFile) {
                throw new Error('File not found');
            }
            console.log('Deleting file from Yandex Cloud:', {
                fileId,
                url: mediaFile.url,
                thumbnailUrl: mediaFile.thumbnailUrl
            });
            const filePath = this.extractFilePathFromUrl(mediaFile.url);
            console.log('Extracted file path:', filePath);
            await s3.deleteObject({
                Bucket: this.bucketName,
                Key: filePath
            }).promise();
            console.log('Deleted original file from cloud');
            if (mediaFile.thumbnailUrl) {
                const thumbnailPath = this.extractFilePathFromUrl(mediaFile.thumbnailUrl);
                console.log('Extracted thumbnail path:', thumbnailPath);
                await s3.deleteObject({
                    Bucket: this.bucketName,
                    Key: thumbnailPath
                }).promise();
                console.log('Deleted thumbnail from cloud');
            }
            await prisma.mediaFile.delete({
                where: { id: fileId }
            });
            console.log('Deleted file record from database');
        }
        catch (error) {
            console.error('Error deleting file:', error);
            throw new Error('Failed to delete file');
        }
    }
    async getFile(fileId) {
        const file = await prisma.mediaFile.findUnique({
            where: { id: fileId }
        });
        if (!file)
            return null;
        return {
            ...file,
            thumbnailUrl: file.thumbnailUrl || undefined
        };
    }
    async getFilesByMemorialPage(memorialPageId) {
        const files = await prisma.mediaFile.findMany({
            where: {
                memorialPages: {
                    some: {
                        id: memorialPageId
                    }
                }
            },
            orderBy: {
                uploadedAt: 'desc'
            }
        });
        return files.map(file => ({
            ...file,
            thumbnailUrl: file.thumbnailUrl || undefined
        }));
    }
    async cleanupUnusedFiles() {
        if (!isYandexCloudConfigured) {
            return mediaService_local_1.localMediaService.cleanupUnusedFiles();
        }
        try {
            const unusedFiles = await prisma.mediaFile.findMany({
                where: {
                    AND: [
                        {
                            mainPhotoFor: {
                                none: {}
                            }
                        },
                        {
                            memorialPages: {
                                none: {}
                            }
                        },
                        {
                            memoryPhotos: {
                                none: {}
                            }
                        },
                        {
                            tributes: {
                                none: {}
                            }
                        }
                    ],
                    uploadedAt: {
                        lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            });
            let deletedCount = 0;
            for (const file of unusedFiles) {
                try {
                    await this.deleteFile(file.id);
                    deletedCount++;
                }
                catch (error) {
                    console.error(`Failed to delete unused file ${file.id}:`, error);
                }
            }
            return deletedCount;
        }
        catch (error) {
            console.error('Error during cleanup:', error);
            throw new Error('Failed to cleanup unused files');
        }
    }
    validateFile(fileBuffer, mimeType) {
        const isImage = this.isImage(mimeType);
        const isVideo = this.isVideo(mimeType);
        if (!isImage && !isVideo) {
            throw new Error('Unsupported file type. Only images and videos are allowed.');
        }
        const fileSize = fileBuffer.length;
        const maxSize = isImage ? this.maxImageSize : this.maxFileSize;
        if (fileSize > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
        }
    }
    isImage(mimeType) {
        return this.allowedImageTypes.includes(mimeType);
    }
    isVideo(mimeType) {
        return this.allowedVideoTypes.includes(mimeType);
    }
    generateFilePath(fileName, mimeType, subfolder) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        let folder = this.isImage(mimeType) ? 'images' : 'videos';
        if (subfolder) {
            folder = subfolder;
        }
        return `${folder}/${year}/${month}/${fileName}`;
    }
    extractFilePathFromUrl(url) {
        const urlParts = url.split('/');
        const bucketIndex = urlParts.findIndex(part => part === this.bucketName);
        return urlParts.slice(bucketIndex + 1).join('/');
    }
    async getFileStatistics() {
        const stats = await prisma.mediaFile.aggregate({
            _count: {
                id: true
            },
            _sum: {
                size: true
            }
        });
        const imageCount = await prisma.mediaFile.count({
            where: {
                mimeType: {
                    in: this.allowedImageTypes
                }
            }
        });
        const videoCount = await prisma.mediaFile.count({
            where: {
                mimeType: {
                    in: this.allowedVideoTypes
                }
            }
        });
        return {
            totalFiles: stats._count.id || 0,
            totalSize: stats._sum.size || 0,
            imageCount,
            videoCount
        };
    }
}
exports.MediaService = MediaService;
exports.mediaService = new MediaService();
//# sourceMappingURL=mediaService.js.map