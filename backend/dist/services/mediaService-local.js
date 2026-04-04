"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localMediaService = exports.LocalMediaService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
class LocalMediaService {
    constructor() {
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        this.allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        this.maxFileSize = 100 * 1024 * 1024;
        this.maxImageSize = 10 * 1024 * 1024;
        this.thumbnailWidth = 600;
        this.uploadsDir = path_1.default.join(process.cwd(), 'uploads');
        this.ensureDirectoryExists(this.uploadsDir);
        this.ensureDirectoryExists(path_1.default.join(this.uploadsDir, 'images'));
        this.ensureDirectoryExists(path_1.default.join(this.uploadsDir, 'videos'));
        this.ensureDirectoryExists(path_1.default.join(this.uploadsDir, 'thumbnails'));
    }
    ensureDirectoryExists(dirPath) {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
    }
    async uploadFile(fileBuffer, originalName, mimeType, uploadedBy) {
        this.validateFile(fileBuffer, mimeType);
        const fileId = (0, crypto_1.randomUUID)();
        const fileExtension = path_1.default.extname(originalName);
        const fileName = `${fileId}${fileExtension}`;
        const filePath = this.generateFilePath(fileName, mimeType);
        const fullPath = path_1.default.join(this.uploadsDir, filePath);
        try {
            this.ensureDirectoryExists(path_1.default.dirname(fullPath));
            fs_1.default.writeFileSync(fullPath, fileBuffer);
            const fileUrl = `/uploads/${filePath}`;
            let thumbnailUrl;
            if (this.isImage(mimeType)) {
                thumbnailUrl = await this.generateThumbnail(fileBuffer, fileId, fileExtension);
            }
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
            return {
                mediaFile: {
                    ...mediaFile,
                    thumbnailUrl: mediaFile.thumbnailUrl || undefined
                },
                thumbnailUrl
            };
        }
        catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file to local storage');
        }
    }
    async generateThumbnail(imageBuffer, fileId, fileExtension) {
        try {
            const thumbnailBuffer = await (0, sharp_1.default)(imageBuffer)
                .resize(this.thumbnailWidth, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .jpeg({ quality: 85, progressive: true })
                .toBuffer();
            const thumbnailFileName = `${fileId}_thumb.jpg`;
            const thumbnailPath = this.generateFilePath(thumbnailFileName, 'image/jpeg', 'thumbnails');
            const fullThumbnailPath = path_1.default.join(this.uploadsDir, thumbnailPath);
            this.ensureDirectoryExists(path_1.default.dirname(fullThumbnailPath));
            fs_1.default.writeFileSync(fullThumbnailPath, thumbnailBuffer);
            return `/uploads/${thumbnailPath}`;
        }
        catch (error) {
            console.error('Error generating thumbnail:', error);
            throw new Error('Failed to generate thumbnail');
        }
    }
    async deleteFile(fileId) {
        try {
            const mediaFile = await prisma.mediaFile.findUnique({
                where: { id: fileId }
            });
            if (!mediaFile) {
                throw new Error('File not found');
            }
            const originalPath = path_1.default.join(this.uploadsDir, mediaFile.url.replace('/uploads/', ''));
            if (fs_1.default.existsSync(originalPath)) {
                fs_1.default.unlinkSync(originalPath);
            }
            if (mediaFile.thumbnailUrl) {
                const thumbnailPath = path_1.default.join(this.uploadsDir, mediaFile.thumbnailUrl.replace('/uploads/', ''));
                if (fs_1.default.existsSync(thumbnailPath)) {
                    fs_1.default.unlinkSync(thumbnailPath);
                }
            }
            await prisma.mediaFile.delete({
                where: { id: fileId }
            });
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
exports.LocalMediaService = LocalMediaService;
exports.localMediaService = new LocalMediaService();
//# sourceMappingURL=mediaService-local.js.map