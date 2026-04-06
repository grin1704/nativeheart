"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../utils/errors");
const subscription_1 = require("../utils/subscription");
const database_1 = __importDefault(require("../config/database"));
class TributeService {
    async createTribute(data) {
        try {
            const memorialPage = await database_1.default.memorialPage.findUnique({
                where: { id: data.memorialPageId },
                include: {
                    owner: {
                        select: {
                            subscriptionType: true,
                            subscriptionExpiresAt: true
                        }
                    }
                }
            });
            if (!memorialPage) {
                throw new errors_1.NotFoundError('Memorial page');
            }
            const features = (0, subscription_1.getFeatureAccess)(memorialPage.owner.subscriptionType, memorialPage.owner.subscriptionExpiresAt, memorialPage.isPremium);
            if (!features.tributes) {
                throw new errors_1.ValidationError('Tributes feature is not available for this subscription type');
            }
            if (data.photoId) {
                const photo = await database_1.default.mediaFile.findUnique({
                    where: { id: data.photoId }
                });
                if (!photo) {
                    throw new errors_1.NotFoundError('Photo');
                }
                if (!photo.mimeType.startsWith('image/')) {
                    throw new errors_1.ValidationError('Only image files are allowed for tribute photos');
                }
            }
            const tribute = await database_1.default.tribute.create({
                data: {
                    memorialPageId: data.memorialPageId,
                    authorName: data.authorName,
                    authorEmail: data.authorEmail,
                    text: data.text,
                    photoId: data.photoId,
                    isApproved: true
                },
                include: {
                    photo: {
                        select: {
                            id: true,
                            url: true,
                            thumbnailUrl: true,
                            originalName: true
                        }
                    }
                }
            });
            return tribute;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError('Failed to create tribute', 500);
        }
    }
    async getTributesByMemorialPage(memorialPageId, filters = {}, userId) {
        try {
            const memorialPage = await database_1.default.memorialPage.findUnique({
                where: { id: memorialPageId },
                include: {
                    owner: {
                        select: {
                            subscriptionType: true,
                            subscriptionExpiresAt: true
                        }
                    }
                }
            });
            if (!memorialPage) {
                throw new errors_1.NotFoundError('Memorial page');
            }
            const features = (0, subscription_1.getFeatureAccess)(memorialPage.owner.subscriptionType, memorialPage.owner.subscriptionExpiresAt, memorialPage.isPremium);
            if (!features.tributes) {
                throw new errors_1.ValidationError('Tributes feature is not available for this subscription type');
            }
            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const skip = (page - 1) * limit;
            const where = {
                memorialPageId
            };
            const isOwnerOrCollaborator = userId && (memorialPage.ownerId === userId ||
                await database_1.default.collaborator.findFirst({
                    where: {
                        memorialPageId,
                        userId,
                        acceptedAt: { not: null }
                    }
                }));
            if (filters.approved !== undefined && filters.approved !== 'all') {
                where.isApproved = filters.approved;
            }
            else if (filters.approved === undefined) {
                if (!isOwnerOrCollaborator) {
                    where.isApproved = true;
                }
            }
            const [tributes, total] = await Promise.all([
                database_1.default.tribute.findMany({
                    where,
                    include: {
                        photo: {
                            select: {
                                id: true,
                                url: true,
                                thumbnailUrl: true,
                                originalName: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip,
                    take: limit
                }),
                database_1.default.tribute.count({ where })
            ]);
            return {
                tributes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError('Failed to get tributes', 500);
        }
    }
    async getTributeById(id) {
        try {
            const tribute = await database_1.default.tribute.findUnique({
                where: { id },
                include: {
                    photo: {
                        select: {
                            id: true,
                            url: true,
                            thumbnailUrl: true,
                            originalName: true
                        }
                    },
                    memorialPage: {
                        include: {
                            owner: {
                                select: {
                                    subscriptionType: true,
                                    subscriptionExpiresAt: true
                                }
                            }
                        }
                    }
                }
            });
            if (!tribute) {
                throw new errors_1.NotFoundError('Tribute');
            }
            const features = (0, subscription_1.getFeatureAccess)(tribute.memorialPage.owner.subscriptionType, tribute.memorialPage.owner.subscriptionExpiresAt, tribute.memorialPage.isPremium);
            if (!features.tributes) {
                throw new errors_1.ValidationError('Tributes feature is not available for this subscription type');
            }
            return tribute;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError('Failed to get tribute', 500);
        }
    }
    async updateTribute(id, data) {
        try {
            const existingTribute = await database_1.default.tribute.findUnique({
                where: { id },
                include: {
                    memorialPage: {
                        include: {
                            owner: {
                                select: {
                                    subscriptionType: true,
                                    subscriptionExpiresAt: true
                                }
                            }
                        }
                    }
                }
            });
            if (!existingTribute) {
                throw new errors_1.NotFoundError('Tribute');
            }
            const features = (0, subscription_1.getFeatureAccess)(existingTribute.memorialPage.owner.subscriptionType, existingTribute.memorialPage.owner.subscriptionExpiresAt, existingTribute.memorialPage.isPremium);
            if (!features.tributes) {
                throw new errors_1.ValidationError('Tributes feature is not available for this subscription type');
            }
            if (data.photoId) {
                const photo = await database_1.default.mediaFile.findUnique({
                    where: { id: data.photoId }
                });
                if (!photo) {
                    throw new errors_1.NotFoundError('Photo');
                }
                if (!photo.mimeType.startsWith('image/')) {
                    throw new errors_1.ValidationError('Only image files are allowed for tribute photos');
                }
            }
            const tribute = await database_1.default.tribute.update({
                where: { id },
                data,
                include: {
                    photo: {
                        select: {
                            id: true,
                            url: true,
                            thumbnailUrl: true,
                            originalName: true
                        }
                    }
                }
            });
            return tribute;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError('Failed to update tribute', 500);
        }
    }
    async deleteTribute(id) {
        try {
            const tribute = await database_1.default.tribute.findUnique({
                where: { id },
                include: {
                    memorialPage: {
                        include: {
                            owner: {
                                select: {
                                    subscriptionType: true,
                                    subscriptionExpiresAt: true
                                }
                            }
                        }
                    }
                }
            });
            if (!tribute) {
                throw new errors_1.NotFoundError('Tribute');
            }
            const features = (0, subscription_1.getFeatureAccess)(tribute.memorialPage.owner.subscriptionType, tribute.memorialPage.owner.subscriptionExpiresAt, tribute.memorialPage.isPremium);
            if (!features.tributes) {
                throw new errors_1.ValidationError('Tributes feature is not available for this subscription type');
            }
            await database_1.default.tribute.delete({
                where: { id }
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError('Failed to delete tribute', 500);
        }
    }
    async moderateTribute(id, isApproved, reason) {
        try {
            const tribute = await database_1.default.tribute.findUnique({
                where: { id }
            });
            if (!tribute) {
                throw new errors_1.NotFoundError('Tribute');
            }
            const updatedTribute = await database_1.default.tribute.update({
                where: { id },
                data: {
                    isApproved
                },
                include: {
                    photo: {
                        select: {
                            id: true,
                            url: true,
                            thumbnailUrl: true,
                            originalName: true
                        }
                    }
                }
            });
            return updatedTribute;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError('Failed to moderate tribute', 500);
        }
    }
    async getTributesForModeration(filters = {}) {
        try {
            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const skip = (page - 1) * limit;
            const where = {
                isApproved: false
            };
            const [tributes, total] = await Promise.all([
                database_1.default.tribute.findMany({
                    where,
                    include: {
                        photo: {
                            select: {
                                id: true,
                                url: true,
                                thumbnailUrl: true,
                                originalName: true
                            }
                        },
                        memorialPage: {
                            select: {
                                id: true,
                                slug: true,
                                fullName: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    },
                    skip,
                    take: limit
                }),
                database_1.default.tribute.count({ where })
            ]);
            return {
                tributes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            throw new errors_1.AppError('Failed to get tributes for moderation', 500);
        }
    }
    async likeTribute(tributeId, userId, fingerprint) {
        try {
            const tribute = await database_1.default.tribute.findUnique({
                where: { id: tributeId }
            });
            if (!tribute) {
                throw new errors_1.NotFoundError('Tribute');
            }
            const existingLike = await database_1.default.tributeLike.findFirst({
                where: {
                    tributeId,
                    OR: [
                        userId ? { userId } : {},
                        fingerprint ? { fingerprint } : {}
                    ].filter(obj => Object.keys(obj).length > 0)
                }
            });
            if (existingLike) {
                const currentTribute = await database_1.default.tribute.findUnique({
                    where: { id: tributeId },
                    select: { likesCount: true }
                });
                return {
                    likesCount: currentTribute.likesCount,
                    isLiked: true
                };
            }
            await database_1.default.$transaction([
                database_1.default.tributeLike.create({
                    data: {
                        tributeId,
                        userId,
                        fingerprint
                    }
                }),
                database_1.default.tribute.update({
                    where: { id: tributeId },
                    data: {
                        likesCount: {
                            increment: 1
                        }
                    }
                })
            ]);
            const updatedTribute = await database_1.default.tribute.findUnique({
                where: { id: tributeId },
                select: { likesCount: true }
            });
            return {
                likesCount: updatedTribute.likesCount,
                isLiked: true
            };
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError('Failed to like tribute', 500);
        }
    }
    async unlikeTribute(tributeId, userId, fingerprint) {
        try {
            const tribute = await database_1.default.tribute.findUnique({
                where: { id: tributeId }
            });
            if (!tribute) {
                throw new errors_1.NotFoundError('Tribute');
            }
            const existingLike = await database_1.default.tributeLike.findFirst({
                where: {
                    tributeId,
                    OR: [
                        userId ? { userId } : {},
                        fingerprint ? { fingerprint } : {}
                    ].filter(obj => Object.keys(obj).length > 0)
                }
            });
            if (!existingLike) {
                const currentTribute = await database_1.default.tribute.findUnique({
                    where: { id: tributeId },
                    select: { likesCount: true }
                });
                return {
                    likesCount: currentTribute.likesCount,
                    isLiked: false
                };
            }
            await database_1.default.$transaction([
                database_1.default.tributeLike.delete({
                    where: { id: existingLike.id }
                }),
                database_1.default.tribute.update({
                    where: { id: tributeId },
                    data: {
                        likesCount: {
                            decrement: 1
                        }
                    }
                })
            ]);
            const updatedTribute = await database_1.default.tribute.findUnique({
                where: { id: tributeId },
                select: { likesCount: true }
            });
            return {
                likesCount: updatedTribute.likesCount,
                isLiked: false
            };
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError('Failed to unlike tribute', 500);
        }
    }
    async checkIfLiked(tributeId, userId, fingerprint) {
        try {
            const like = await database_1.default.tributeLike.findFirst({
                where: {
                    tributeId,
                    OR: [
                        userId ? { userId } : {},
                        fingerprint ? { fingerprint } : {}
                    ].filter(obj => Object.keys(obj).length > 0)
                }
            });
            return !!like;
        }
        catch (error) {
            return false;
        }
    }
}
exports.default = new TributeService();
//# sourceMappingURL=tributeService.js.map