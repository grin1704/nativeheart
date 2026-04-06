"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.galleryService = exports.GalleryService = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const subscription_1 = require("../utils/subscription");
const prisma = new client_1.PrismaClient();
class GalleryService {
    async checkEditAccess(pageId, userId) {
        const page = await prisma.memorialPage.findUnique({
            where: { id: pageId },
            select: { ownerId: true },
        });
        if (!page) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const hasAccess = page.ownerId === userId || await this.isCollaborator(pageId, userId);
        if (!hasAccess) {
            throw new errors_1.ForbiddenError('У вас нет прав для редактирования этой страницы');
        }
    }
    async isCollaborator(pageId, userId) {
        const collaborator = await prisma.collaborator.findFirst({
            where: {
                memorialPageId: pageId,
                userId,
                acceptedAt: { not: null },
            },
        });
        return !!collaborator;
    }
    async getPageFeatureAccess(pageId) {
        const page = await prisma.memorialPage.findUnique({
            where: { id: pageId },
            select: {
                isPremium: true,
                owner: {
                    select: {
                        subscriptionType: true,
                        subscriptionExpiresAt: true,
                    },
                },
            },
        });
        if (!page) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const featureAccess = (0, subscription_1.getFeatureAccess)(page.owner.subscriptionType, page.owner.subscriptionExpiresAt, page.isPremium);
        return {
            photoGallery: featureAccess.photoGallery,
            videoGallery: featureAccess.videoGallery,
        };
    }
    async getPhotoGallery(pageId, userId) {
        const pageExists = await prisma.memorialPage.findUnique({
            where: { id: pageId },
            select: { id: true },
        });
        if (!pageExists) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const featureAccess = await this.getPageFeatureAccess(pageId);
        if (!featureAccess.photoGallery) {
            return {
                items: [],
                hasAccess: false,
                subscriptionRequired: true,
            };
        }
        const items = await prisma.photoGallery.findMany({
            where: { memorialPageId: pageId },
            include: {
                mediaFile: {
                    select: {
                        id: true,
                        originalName: true,
                        url: true,
                        thumbnailUrl: true,
                        size: true,
                        mimeType: true,
                        uploadedAt: true,
                    },
                },
            },
            orderBy: { orderIndex: 'asc' },
        });
        return {
            items,
            hasAccess: true,
            subscriptionRequired: false,
        };
    }
    async getVideoGallery(pageId, userId) {
        const pageExists = await prisma.memorialPage.findUnique({
            where: { id: pageId },
            select: { id: true },
        });
        if (!pageExists) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const featureAccess = await this.getPageFeatureAccess(pageId);
        if (!featureAccess.videoGallery) {
            return {
                items: [],
                hasAccess: false,
                subscriptionRequired: true,
            };
        }
        const items = await prisma.videoGallery.findMany({
            where: { memorialPageId: pageId },
            include: {
                mediaFile: {
                    select: {
                        id: true,
                        originalName: true,
                        url: true,
                        thumbnailUrl: true,
                        size: true,
                        mimeType: true,
                        uploadedAt: true,
                    },
                },
            },
            orderBy: { orderIndex: 'asc' },
        });
        return {
            items,
            hasAccess: true,
            subscriptionRequired: false,
        };
    }
    async addPhotoToGallery(pageId, userId, data) {
        await this.checkEditAccess(pageId, userId);
        const featureAccess = await this.getPageFeatureAccess(pageId);
        if (!featureAccess.photoGallery) {
            throw new errors_1.ForbiddenError('Фотогалерея недоступна для данного типа подписки');
        }
        const mediaFile = await prisma.mediaFile.findFirst({
            where: {
                id: data.mediaFileId,
                uploadedBy: userId,
                mimeType: { startsWith: 'image/' },
            },
        });
        if (!mediaFile) {
            throw new errors_1.ValidationError('Фотография не найдена или не принадлежит пользователю');
        }
        const existingItem = await prisma.photoGallery.findUnique({
            where: {
                memorialPageId_mediaFileId: {
                    memorialPageId: pageId,
                    mediaFileId: data.mediaFileId,
                },
            },
        });
        if (existingItem) {
            throw new errors_1.ValidationError('Фотография уже добавлена в галерею');
        }
        const lastItem = await prisma.photoGallery.findFirst({
            where: { memorialPageId: pageId },
            orderBy: { orderIndex: 'desc' },
        });
        const nextOrderIndex = lastItem ? lastItem.orderIndex + 1 : 0;
        const galleryItem = await prisma.photoGallery.create({
            data: {
                memorialPageId: pageId,
                mediaFileId: data.mediaFileId,
                title: data.title,
                description: data.description,
                orderIndex: nextOrderIndex,
            },
            include: {
                mediaFile: {
                    select: {
                        id: true,
                        originalName: true,
                        url: true,
                        thumbnailUrl: true,
                        size: true,
                        mimeType: true,
                        uploadedAt: true,
                    },
                },
            },
        });
        return galleryItem;
    }
    async addVideoToGallery(pageId, userId, data) {
        await this.checkEditAccess(pageId, userId);
        const featureAccess = await this.getPageFeatureAccess(pageId);
        if (!featureAccess.videoGallery) {
            throw new errors_1.ForbiddenError('Видеогалерея недоступна для данного типа подписки');
        }
        const videoType = data.videoType || 'upload';
        if (videoType === 'upload') {
            if (!data.mediaFileId) {
                throw new errors_1.ValidationError('Не указан ID медиафайла');
            }
            const mediaFile = await prisma.mediaFile.findFirst({
                where: {
                    id: data.mediaFileId,
                    uploadedBy: userId,
                    mimeType: { startsWith: 'video/' },
                },
            });
            if (!mediaFile) {
                throw new errors_1.ValidationError('Видео не найдено или не принадлежит пользователю');
            }
            const existingItem = await prisma.videoGallery.findFirst({
                where: {
                    memorialPageId: pageId,
                    mediaFileId: data.mediaFileId,
                },
            });
            if (existingItem) {
                throw new errors_1.ValidationError('Видео уже добавлено в галерею');
            }
        }
        if (videoType === 'vk' || videoType === 'rutube') {
            if (!data.externalUrl || !data.embedCode) {
                throw new errors_1.ValidationError('Не указана ссылка или embed-код для внешнего видео');
            }
            const existingItem = await prisma.videoGallery.findFirst({
                where: {
                    memorialPageId: pageId,
                    externalUrl: data.externalUrl,
                },
            });
            if (existingItem) {
                throw new errors_1.ValidationError('Это видео уже добавлено в галерею');
            }
        }
        const lastItem = await prisma.videoGallery.findFirst({
            where: { memorialPageId: pageId },
            orderBy: { orderIndex: 'desc' },
        });
        const nextOrderIndex = lastItem ? lastItem.orderIndex + 1 : 0;
        const galleryItem = await prisma.videoGallery.create({
            data: {
                memorialPageId: pageId,
                mediaFileId: data.mediaFileId,
                videoType,
                externalUrl: data.externalUrl,
                embedCode: data.embedCode,
                thumbnailUrl: data.thumbnailUrl,
                title: data.title,
                description: data.description,
                orderIndex: nextOrderIndex,
            },
            include: {
                mediaFile: data.mediaFileId ? {
                    select: {
                        id: true,
                        originalName: true,
                        url: true,
                        thumbnailUrl: true,
                        size: true,
                        mimeType: true,
                        uploadedAt: true,
                    },
                } : undefined,
            },
        });
        return galleryItem;
    }
    async updatePhotoGalleryItem(pageId, itemId, userId, data) {
        await this.checkEditAccess(pageId, userId);
        const existingItem = await prisma.photoGallery.findFirst({
            where: {
                id: itemId,
                memorialPageId: pageId,
            },
        });
        if (!existingItem) {
            throw new errors_1.NotFoundError('Элемент фотогалереи не найден');
        }
        console.log(`📝 Updating photo gallery item ${itemId}:`, data);
        console.log(`📝 Existing item:`, existingItem);
        try {
            const updatedItem = await prisma.photoGallery.update({
                where: { id: itemId },
                data,
                include: {
                    mediaFile: {
                        select: {
                            id: true,
                            originalName: true,
                            url: true,
                            thumbnailUrl: true,
                            size: true,
                            mimeType: true,
                            uploadedAt: true,
                        },
                    },
                },
            });
            console.log(`✅ Updated photo gallery item ${itemId}, new orderIndex: ${updatedItem.orderIndex}`);
            return updatedItem;
        }
        catch (error) {
            console.error(`❌ Prisma update error for ${itemId}:`, error);
            throw error;
        }
    }
    async updateVideoGalleryItem(pageId, itemId, userId, data) {
        await this.checkEditAccess(pageId, userId);
        const existingItem = await prisma.videoGallery.findFirst({
            where: {
                id: itemId,
                memorialPageId: pageId,
            },
        });
        if (!existingItem) {
            throw new errors_1.NotFoundError('Элемент видеогалереи не найден');
        }
        const updatedItem = await prisma.videoGallery.update({
            where: { id: itemId },
            data,
            include: {
                mediaFile: {
                    select: {
                        id: true,
                        originalName: true,
                        url: true,
                        thumbnailUrl: true,
                        size: true,
                        mimeType: true,
                        uploadedAt: true,
                    },
                },
            },
        });
        return updatedItem;
    }
    async removePhotoFromGallery(pageId, itemId, userId) {
        await this.checkEditAccess(pageId, userId);
        const existingItem = await prisma.photoGallery.findFirst({
            where: {
                id: itemId,
                memorialPageId: pageId,
            },
            include: {
                mediaFile: true
            }
        });
        if (!existingItem) {
            throw new errors_1.NotFoundError('Элемент фотогалереи не найден');
        }
        await prisma.photoGallery.delete({
            where: { id: itemId },
        });
        if (existingItem.mediaFileId) {
            try {
                const { mediaService } = await Promise.resolve().then(() => __importStar(require('./mediaService')));
                await mediaService.deleteFile(existingItem.mediaFileId);
            }
            catch (error) {
                console.error('Error deleting media file:', error);
            }
        }
    }
    async removeVideoFromGallery(pageId, itemId, userId) {
        await this.checkEditAccess(pageId, userId);
        const existingItem = await prisma.videoGallery.findFirst({
            where: {
                id: itemId,
                memorialPageId: pageId,
            },
            include: {
                mediaFile: true
            }
        });
        if (!existingItem) {
            throw new errors_1.NotFoundError('Элемент видеогалереи не найден');
        }
        await prisma.videoGallery.delete({
            where: { id: itemId },
        });
        if (existingItem.mediaFileId) {
            try {
                const { mediaService } = await Promise.resolve().then(() => __importStar(require('./mediaService')));
                await mediaService.deleteFile(existingItem.mediaFileId);
            }
            catch (error) {
                console.error('Error deleting media file:', error);
            }
        }
    }
    async reorderPhotoGallery(pageId, userId, itemIds) {
        await this.checkEditAccess(pageId, userId);
        const existingItems = await prisma.photoGallery.findMany({
            where: { memorialPageId: pageId },
            select: { id: true },
        });
        const existingItemIds = existingItems.map(item => item.id);
        const missingItems = itemIds.filter(id => !existingItemIds.includes(id));
        if (missingItems.length > 0) {
            throw new errors_1.ValidationError('Некоторые элементы не найдены в фотогалерее');
        }
        await Promise.all(itemIds.map((itemId, index) => prisma.photoGallery.update({
            where: { id: itemId },
            data: { orderIndex: index },
        })));
    }
    async reorderVideoGallery(pageId, userId, itemIds) {
        await this.checkEditAccess(pageId, userId);
        const existingItems = await prisma.videoGallery.findMany({
            where: { memorialPageId: pageId },
            select: { id: true },
        });
        const existingItemIds = existingItems.map(item => item.id);
        const missingItems = itemIds.filter(id => !existingItemIds.includes(id));
        if (missingItems.length > 0) {
            throw new errors_1.ValidationError('Некоторые элементы не найдены в видеогалерее');
        }
        await Promise.all(itemIds.map((itemId, index) => prisma.videoGallery.update({
            where: { id: itemId },
            data: { orderIndex: index },
        })));
    }
}
exports.GalleryService = GalleryService;
exports.galleryService = new GalleryService();
//# sourceMappingURL=galleryService.js.map