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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memorialPageService = exports.MemorialPageService = void 0;
const slug_1 = require("../utils/slug");
async function generateUniqueSlug(fullName, excludeSlug) {
    const baseSlug = (0, slug_1.generateSlug)(fullName);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await database_1.default.memorialPage.findUnique({
            where: { slug },
            select: { slug: true }
        });
        if (!existing || (excludeSlug && existing.slug === excludeSlug)) {
            break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}
const password_1 = require("../utils/password");
const errors_1 = require("../utils/errors");
const subscription_1 = require("../utils/subscription");
const database_1 = __importDefault(require("../config/database"));
class MemorialPageService {
    async createMemorialPage(userId, data) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { emailVerified: true, email: true }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Пользователь не найден');
        }
        if (!user.emailVerified) {
            throw new errors_1.ForbiddenError('Для создания памятных страниц необходимо подтвердить email адрес');
        }
        if (data.mainPhotoId) {
            const mainPhoto = await database_1.default.mediaFile.findFirst({
                where: {
                    id: data.mainPhotoId,
                    uploadedBy: userId,
                },
            });
            if (!mainPhoto) {
                throw new errors_1.ValidationError('Указанное главное фото не найдено или не принадлежит пользователю');
            }
        }
        const slug = await generateUniqueSlug(data.fullName);
        let passwordHash;
        if (data.password) {
            passwordHash = await (0, password_1.hashPassword)(data.password);
        }
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrCodeUrl = `${baseUrl}/memorial/${slug}`;
        const memorialPage = await database_1.default.memorialPage.create({
            data: {
                slug,
                ownerId: userId,
                fullName: data.fullName,
                birthDate: data.birthDate,
                deathDate: data.deathDate,
                mainPhotoId: data.mainPhotoId,
                biographyText: data.biographyText,
                isPrivate: data.isPrivate || false,
                passwordHash,
                qrCodeUrl,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                mainPhoto: {
                    select: {
                        id: true,
                        url: true,
                        thumbnailUrl: true,
                    },
                },
                burialLocation: true,
                _count: {
                    select: {
                        memories: true,
                        tributes: true,
                        mediaFiles: true,
                        photoGallery: true,
                        videoGallery: true,
                    },
                },
            },
        });
        return memorialPage;
    }
    async getMemorialPageById(pageId, userId) {
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        subscriptionType: true,
                        subscriptionExpiresAt: true,
                    },
                },
                mainPhoto: {
                    select: {
                        id: true,
                        url: true,
                        thumbnailUrl: true,
                    },
                },
                burialLocation: true,
                _count: {
                    select: {
                        memories: true,
                        tributes: true,
                        mediaFiles: true,
                        photoGallery: true,
                        videoGallery: true,
                    },
                },
            },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const biography = await this.getBiography(pageId, userId);
        return {
            ...memorialPage,
            biography,
        };
    }
    async getMemorialPageBySlug(slug, userId) {
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { slug },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        subscriptionType: true,
                        subscriptionExpiresAt: true,
                    },
                },
                mainPhoto: {
                    select: {
                        id: true,
                        url: true,
                        thumbnailUrl: true,
                    },
                },
                burialLocation: true,
                _count: {
                    select: {
                        memories: true,
                        tributes: true,
                        mediaFiles: true,
                        photoGallery: true,
                        videoGallery: true,
                    },
                },
            },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const biography = await this.getBiography(memorialPage.id, userId);
        return {
            ...memorialPage,
            biography,
        };
    }
    async updateMemorialPage(pageId, userId, data) {
        const existingPage = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
        });
        if (!existingPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        await this.checkEditAccess(pageId, userId);
        if (data.mainPhotoId) {
            const mainPhoto = await database_1.default.mediaFile.findFirst({
                where: {
                    id: data.mainPhotoId,
                    uploadedBy: userId,
                },
            });
            if (!mainPhoto) {
                throw new errors_1.ValidationError('Указанное главное фото не найдено или не принадлежит пользователю');
            }
        }
        let slug = existingPage.slug;
        let qrCodeUrl = existingPage.qrCodeUrl;
        if (data.fullName && data.fullName !== existingPage.fullName) {
            slug = await generateUniqueSlug(data.fullName, existingPage.slug);
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            qrCodeUrl = `${baseUrl}/memorial/${slug}`;
        }
        let passwordHash = existingPage.passwordHash;
        if (data.password !== undefined) {
            passwordHash = data.password ? await (0, password_1.hashPassword)(data.password) : null;
        }
        const { password, ...updateData } = data;
        const updatedPage = await database_1.default.memorialPage.update({
            where: { id: pageId },
            data: {
                ...updateData,
                slug,
                passwordHash,
                qrCodeUrl,
                mainPhotoId: data.mainPhotoId === null ? null : data.mainPhotoId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                mainPhoto: {
                    select: {
                        id: true,
                        url: true,
                        thumbnailUrl: true,
                    },
                },
                burialLocation: true,
                _count: {
                    select: {
                        memories: true,
                        tributes: true,
                        mediaFiles: true,
                        photoGallery: true,
                        videoGallery: true,
                    },
                },
            },
        });
        try {
            const { collaboratorService } = await Promise.resolve().then(() => __importStar(require('./collaboratorService')));
            await collaboratorService.notifyPageChange(pageId, userId, 'Основная информация', 'Обновлена основная информация о памятной странице');
        }
        catch (error) {
            console.error('Failed to send change notification:', error);
        }
        return updatedPage;
    }
    async deleteMemorialPage(pageId, userId) {
        const existingPage = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
        });
        if (!existingPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        if (existingPage.ownerId !== userId) {
            throw new errors_1.ForbiddenError('Только владелец может удалить памятную страницу');
        }
        await database_1.default.memorialPage.delete({
            where: { id: pageId },
        });
    }
    async getUserMemorialPages(userId, params) {
        const { page, limit, search } = params;
        const skip = (page - 1) * limit;
        const where = {
            ownerId: userId,
            ...(search && {
                fullName: {
                    contains: search,
                    mode: 'insensitive',
                },
            }),
        };
        const [pages, total] = await Promise.all([
            database_1.default.memorialPage.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    mainPhoto: {
                        select: {
                            id: true,
                            url: true,
                            thumbnailUrl: true,
                        },
                    },
                    burialLocation: true,
                    _count: {
                        select: {
                            memories: true,
                            tributes: true,
                            mediaFiles: true,
                            photoGallery: true,
                            videoGallery: true,
                        },
                    },
                },
            }),
            database_1.default.memorialPage.count({ where }),
        ]);
        return {
            data: pages,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async verifyPagePassword(pageId, password) {
        const page = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            select: { passwordHash: true, isPrivate: true },
        });
        if (!page) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        if (!page.isPrivate || !page.passwordHash) {
            return true;
        }
        return await (0, password_1.comparePassword)(password, page.passwordHash);
    }
    async checkEditAccess(pageId, userId) {
        const page = await database_1.default.memorialPage.findUnique({
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
    async updateBiography(pageId, userId, data) {
        await this.checkEditAccess(pageId, userId);
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { subscriptionType: true, subscriptionExpiresAt: true },
        });
        if (!user) {
            throw new errors_1.NotFoundError('Пользователь не найден');
        }
        const featureAccess = (0, subscription_1.getFeatureAccess)(user.subscriptionType, user.subscriptionExpiresAt);
        if (data.text !== undefined && !featureAccess.unlimitedBiography) {
            const characterLimit = 1000;
            if (data.text.length > characterLimit) {
                throw new errors_1.ValidationError(`Для бесплатного аккаунта текст биографии не может превышать ${characterLimit} символов`);
            }
        }
        if (data.photoIds && data.photoIds.length > 0) {
            const validPhotos = await database_1.default.mediaFile.findMany({
                where: {
                    id: { in: data.photoIds },
                    uploadedBy: userId,
                    mimeType: { startsWith: 'image/' },
                },
            });
            if (validPhotos.length !== data.photoIds.length) {
                throw new errors_1.ValidationError('Некоторые фотографии не найдены или не принадлежат пользователю');
            }
        }
        if (data.text !== undefined) {
            await database_1.default.memorialPage.update({
                where: { id: pageId },
                data: { biographyText: data.text },
            });
        }
        if (data.photoIds !== undefined) {
            await database_1.default.biographyPhoto.deleteMany({
                where: { memorialPageId: pageId },
            });
            if (data.photoIds.length > 0) {
                await database_1.default.biographyPhoto.createMany({
                    data: data.photoIds.map((photoId, index) => ({
                        memorialPageId: pageId,
                        mediaFileId: photoId,
                        orderIndex: index,
                    })),
                });
            }
        }
        try {
            const { collaboratorService } = await Promise.resolve().then(() => __importStar(require('./collaboratorService')));
            await collaboratorService.notifyPageChange(pageId, userId, 'Биография', 'Обновлена биография памятной страницы');
        }
        catch (error) {
            console.error('Failed to send change notification:', error);
        }
        return this.getBiography(pageId, userId);
    }
    async getBiography(pageId, userId) {
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { id: pageId },
            select: {
                biographyText: true,
                owner: {
                    select: {
                        subscriptionType: true,
                        subscriptionExpiresAt: true,
                    },
                },
            },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const featureAccess = (0, subscription_1.getFeatureAccess)(memorialPage.owner.subscriptionType, memorialPage.owner.subscriptionExpiresAt);
        const biographyPhotos = await database_1.default.biographyPhoto.findMany({
            where: { memorialPageId: pageId },
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
        });
        let biographyText = memorialPage.biographyText || '';
        let isLimited = false;
        let characterLimit;
        if (!featureAccess.unlimitedBiography) {
            characterLimit = 1000;
            if (biographyText.length > characterLimit) {
                biographyText = biographyText.substring(0, characterLimit);
                isLimited = true;
            }
        }
        return {
            text: biographyText,
            photos: biographyPhotos.map((bp) => ({
                id: bp.mediaFile.id,
                url: bp.mediaFile.url,
                thumbnailUrl: bp.mediaFile.thumbnailUrl,
                originalName: bp.mediaFile.originalName,
                orderIndex: bp.orderIndex,
            })),
            isLimited,
            characterLimit,
        };
    }
    async addBiographyPhoto(pageId, userId, photoId) {
        await this.checkEditAccess(pageId, userId);
        const photo = await database_1.default.mediaFile.findFirst({
            where: {
                id: photoId,
                uploadedBy: userId,
                mimeType: { startsWith: 'image/' },
            },
        });
        if (!photo) {
            throw new errors_1.ValidationError('Фотография не найдена или не принадлежит пользователю');
        }
        const existingPhoto = await database_1.default.biographyPhoto.findUnique({
            where: {
                memorialPageId_mediaFileId: {
                    memorialPageId: pageId,
                    mediaFileId: photoId,
                },
            },
        });
        if (existingPhoto) {
            throw new errors_1.ValidationError('Фотография уже добавлена в биографию');
        }
        const lastPhoto = await database_1.default.biographyPhoto.findFirst({
            where: { memorialPageId: pageId },
            orderBy: { orderIndex: 'desc' },
        });
        const nextOrderIndex = lastPhoto ? lastPhoto.orderIndex + 1 : 0;
        await database_1.default.biographyPhoto.create({
            data: {
                memorialPageId: pageId,
                mediaFileId: photoId,
                orderIndex: nextOrderIndex,
            },
        });
    }
    async removeBiographyPhoto(pageId, userId, photoId) {
        await this.checkEditAccess(pageId, userId);
        const deletedPhoto = await database_1.default.biographyPhoto.deleteMany({
            where: {
                memorialPageId: pageId,
                mediaFileId: photoId,
            },
        });
        if (deletedPhoto.count === 0) {
            throw new errors_1.NotFoundError('Фотография не найдена в биографии');
        }
    }
    async reorderBiographyPhotos(pageId, userId, photoIds) {
        await this.checkEditAccess(pageId, userId);
        const existingPhotos = await database_1.default.biographyPhoto.findMany({
            where: { memorialPageId: pageId },
        });
        const existingPhotoIds = existingPhotos.map((p) => p.mediaFileId);
        const missingPhotos = photoIds.filter(id => !existingPhotoIds.includes(id));
        if (missingPhotos.length > 0) {
            throw new errors_1.ValidationError('Некоторые фотографии не найдены в биографии');
        }
        await Promise.all(photoIds.map((photoId, index) => database_1.default.biographyPhoto.updateMany({
            where: {
                memorialPageId: pageId,
                mediaFileId: photoId,
            },
            data: { orderIndex: index },
        })));
    }
    async isCollaborator(pageId, userId) {
        const collaborator = await database_1.default.collaborator.findFirst({
            where: {
                memorialPageId: pageId,
                userId,
                acceptedAt: { not: null },
            },
        });
        return !!collaborator;
    }
}
exports.MemorialPageService = MemorialPageService;
exports.memorialPageService = new MemorialPageService();
//# sourceMappingURL=memorialPageService.js.map