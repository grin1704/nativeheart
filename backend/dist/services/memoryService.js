"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryService = exports.MemoryService = void 0;
const errors_1 = require("../utils/errors");
const subscription_1 = require("../utils/subscription");
const database_1 = __importDefault(require("../config/database"));
class MemoryService {
    async createMemory(memorialPageId, userId, data) {
        await this.checkEditAccess(memorialPageId, userId);
        await this.checkMemoriesFeatureAccess(memorialPageId);
        if (data.photoIds && data.photoIds.length > 0) {
            await this.validatePhotoIds(data.photoIds, userId);
        }
        const memory = await database_1.default.memory.create({
            data: {
                memorialPageId,
                date: data.date,
                title: data.title,
                description: data.description || null,
            },
        });
        if (data.photoIds && data.photoIds.length > 0) {
            await this.addPhotosToMemory(memory.id, data.photoIds);
        }
        return this.getMemoryById(memory.id);
    }
    async getMemoryById(memoryId) {
        const memory = await database_1.default.memory.findUnique({
            where: { id: memoryId },
            include: {
                photos: {
                    include: {
                        mediaFile: {
                            select: {
                                id: true,
                                url: true,
                                thumbnailUrl: true,
                                originalName: true,
                            },
                        },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
        if (!memory) {
            throw new errors_1.NotFoundError('Воспоминание не найдено');
        }
        return {
            id: memory.id,
            memorialPageId: memory.memorialPageId,
            date: memory.date,
            title: memory.title,
            description: memory.description,
            createdAt: memory.createdAt,
            photos: memory.photos.map((photo) => ({
                id: photo.mediaFile.id,
                url: photo.mediaFile.url,
                thumbnailUrl: photo.mediaFile.thumbnailUrl,
                originalName: photo.mediaFile.originalName,
                orderIndex: photo.orderIndex,
            })),
        };
    }
    async getMemoriesForPage(memorialPageId, userId, params) {
        await this.checkPageAccess(memorialPageId, userId);
        await this.checkMemoriesFeatureAccess(memorialPageId);
        const { page, limit, sortBy = 'date', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const orderBy = sortBy === 'date'
            ? { date: sortOrder }
            : { createdAt: sortOrder };
        const [memories, total] = await Promise.all([
            database_1.default.memory.findMany({
                where: { memorialPageId },
                skip,
                take: limit,
                orderBy,
                include: {
                    photos: {
                        include: {
                            mediaFile: {
                                select: {
                                    id: true,
                                    url: true,
                                    thumbnailUrl: true,
                                    originalName: true,
                                },
                            },
                        },
                        orderBy: { orderIndex: 'asc' },
                    },
                },
            }),
            database_1.default.memory.count({ where: { memorialPageId } }),
        ]);
        const memoriesWithPhotos = memories.map((memory) => ({
            id: memory.id,
            memorialPageId: memory.memorialPageId,
            date: memory.date,
            title: memory.title,
            description: memory.description,
            createdAt: memory.createdAt,
            photos: memory.photos.map((photo) => ({
                id: photo.mediaFile.id,
                url: photo.mediaFile.url,
                thumbnailUrl: photo.mediaFile.thumbnailUrl,
                originalName: photo.mediaFile.originalName,
                orderIndex: photo.orderIndex,
            })),
        }));
        return {
            data: memoriesWithPhotos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateMemory(memoryId, userId, data) {
        const existingMemory = await database_1.default.memory.findUnique({
            where: { id: memoryId },
            select: { memorialPageId: true },
        });
        if (!existingMemory) {
            throw new errors_1.NotFoundError('Воспоминание не найдено');
        }
        await this.checkEditAccess(existingMemory.memorialPageId, userId);
        if (data.photoIds && data.photoIds.length > 0) {
            await this.validatePhotoIds(data.photoIds, userId);
        }
        const updateData = {};
        if (data.date !== undefined)
            updateData.date = data.date;
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (Object.keys(updateData).length > 0) {
            await database_1.default.memory.update({
                where: { id: memoryId },
                data: updateData,
            });
        }
        if (data.photoIds !== undefined) {
            await database_1.default.memoryPhoto.deleteMany({
                where: { memoryId },
            });
            if (data.photoIds.length > 0) {
                await this.addPhotosToMemory(memoryId, data.photoIds);
            }
        }
        return this.getMemoryById(memoryId);
    }
    async deleteMemory(memoryId, userId) {
        const existingMemory = await database_1.default.memory.findUnique({
            where: { id: memoryId },
            select: { memorialPageId: true },
        });
        if (!existingMemory) {
            throw new errors_1.NotFoundError('Воспоминание не найдено');
        }
        await this.checkEditAccess(existingMemory.memorialPageId, userId);
        await database_1.default.memory.delete({
            where: { id: memoryId },
        });
    }
    async addPhotoToMemory(memoryId, userId, photoId) {
        const existingMemory = await database_1.default.memory.findUnique({
            where: { id: memoryId },
            select: { memorialPageId: true },
        });
        if (!existingMemory) {
            throw new errors_1.NotFoundError('Воспоминание не найдено');
        }
        await this.checkEditAccess(existingMemory.memorialPageId, userId);
        await this.validatePhotoIds([photoId], userId);
        const existingPhoto = await database_1.default.memoryPhoto.findUnique({
            where: {
                memoryId_mediaFileId: {
                    memoryId,
                    mediaFileId: photoId,
                },
            },
        });
        if (existingPhoto) {
            throw new errors_1.ValidationError('Фотография уже прикреплена к воспоминанию');
        }
        const lastPhoto = await database_1.default.memoryPhoto.findFirst({
            where: { memoryId },
            orderBy: { orderIndex: 'desc' },
        });
        const nextOrderIndex = lastPhoto ? lastPhoto.orderIndex + 1 : 0;
        await database_1.default.memoryPhoto.create({
            data: {
                memoryId,
                mediaFileId: photoId,
                orderIndex: nextOrderIndex,
            },
        });
    }
    async removePhotoFromMemory(memoryId, userId, photoId) {
        const existingMemory = await database_1.default.memory.findUnique({
            where: { id: memoryId },
            select: { memorialPageId: true },
        });
        if (!existingMemory) {
            throw new errors_1.NotFoundError('Воспоминание не найдено');
        }
        await this.checkEditAccess(existingMemory.memorialPageId, userId);
        const deletedPhoto = await database_1.default.memoryPhoto.deleteMany({
            where: {
                memoryId,
                mediaFileId: photoId,
            },
        });
        if (deletedPhoto.count === 0) {
            throw new errors_1.NotFoundError('Фотография не найдена в воспоминании');
        }
    }
    async reorderMemoryPhotos(memoryId, userId, photoIds) {
        const existingMemory = await database_1.default.memory.findUnique({
            where: { id: memoryId },
            select: { memorialPageId: true },
        });
        if (!existingMemory) {
            throw new errors_1.NotFoundError('Воспоминание не найдено');
        }
        await this.checkEditAccess(existingMemory.memorialPageId, userId);
        const existingPhotos = await database_1.default.memoryPhoto.findMany({
            where: { memoryId },
        });
        const existingPhotoIds = existingPhotos.map((p) => p.mediaFileId);
        const missingPhotos = photoIds.filter(id => !existingPhotoIds.includes(id));
        if (missingPhotos.length > 0) {
            throw new errors_1.ValidationError('Некоторые фотографии не найдены в воспоминании');
        }
        await Promise.all(photoIds.map((photoId, index) => database_1.default.memoryPhoto.updateMany({
            where: {
                memoryId,
                mediaFileId: photoId,
            },
            data: { orderIndex: index },
        })));
    }
    async checkPageAccess(memorialPageId, userId) {
        const page = await database_1.default.memorialPage.findUnique({
            where: { id: memorialPageId },
            select: {
                id: true,
                ownerId: true,
                isPrivate: true,
                passwordHash: true,
            },
        });
        if (!page) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        if (userId && (page.ownerId === userId || await this.isCollaborator(memorialPageId, userId))) {
            return;
        }
    }
    async checkEditAccess(memorialPageId, userId) {
        const page = await database_1.default.memorialPage.findUnique({
            where: { id: memorialPageId },
            select: { ownerId: true },
        });
        if (!page) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const hasAccess = page.ownerId === userId || await this.isCollaborator(memorialPageId, userId);
        if (!hasAccess) {
            throw new errors_1.ForbiddenError('У вас нет прав для редактирования этой страницы');
        }
    }
    async checkMemoriesFeatureAccess(memorialPageId) {
        const page = await database_1.default.memorialPage.findUnique({
            where: { id: memorialPageId },
            include: {
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
        const featureAccess = (0, subscription_1.getFeatureAccess)(page.owner.subscriptionType, page.owner.subscriptionExpiresAt);
        if (!featureAccess.memories) {
            throw new errors_1.ForbiddenError('Раздел воспоминаний доступен только в платной версии');
        }
    }
    async validatePhotoIds(photoIds, userId) {
        const validPhotos = await database_1.default.mediaFile.findMany({
            where: {
                id: { in: photoIds },
                uploadedBy: userId,
                mimeType: { startsWith: 'image/' },
            },
        });
        if (validPhotos.length !== photoIds.length) {
            throw new errors_1.ValidationError('Некоторые фотографии не найдены или не принадлежат пользователю');
        }
    }
    async addPhotosToMemory(memoryId, photoIds) {
        await database_1.default.memoryPhoto.createMany({
            data: photoIds.map((photoId, index) => ({
                memoryId,
                mediaFileId: photoId,
                orderIndex: index,
            })),
        });
    }
    async isCollaborator(memorialPageId, userId) {
        const collaborator = await database_1.default.collaborator.findFirst({
            where: {
                memorialPageId,
                userId,
                acceptedAt: { not: null },
            },
        });
        return !!collaborator;
    }
}
exports.MemoryService = MemoryService;
exports.memoryService = new MemoryService();
//# sourceMappingURL=memoryService.js.map