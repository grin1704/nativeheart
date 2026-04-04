"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
exports.adminUserService = {
    async getAllUsers(filters, pagination) {
        try {
            const { page, limit } = pagination;
            const offset = (page - 1) * limit;
            const where = {};
            if (filters.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } }
                ];
            }
            if (filters.subscriptionType) {
                where.subscriptionType = filters.subscriptionType;
            }
            if (filters.isActive !== undefined) {
                where.isActive = filters.isActive;
            }
            if (filters.createdAfter || filters.createdBefore) {
                where.createdAt = {};
                if (filters.createdAfter) {
                    where.createdAt.gte = filters.createdAfter;
                }
                if (filters.createdBefore) {
                    where.createdAt.lte = filters.createdBefore;
                }
            }
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip: offset,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        subscriptionType: true,
                        subscriptionExpiresAt: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                        _count: {
                            select: {
                                memorialPages: true
                            }
                        }
                    }
                }),
                prisma.user.count({ where })
            ]);
            return {
                users: users.map(user => ({
                    ...user,
                    totalPages: user._count.memorialPages
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Get all users service error:', error);
            throw error;
        }
    },
    async getUserDetails(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    memorialPages: {
                        select: {
                            id: true,
                            fullName: true,
                            slug: true,
                            isPrivate: true,
                            createdAt: true
                        },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
            if (!user) {
                throw new Error('User not found');
            }
            const [memoriesCount, tributesCount, storageUsed] = await Promise.all([
                prisma.memory.count({
                    where: {
                        memorialPage: {
                            ownerId: userId
                        }
                    }
                }),
                prisma.tribute.count({
                    where: {
                        memorialPage: {
                            ownerId: userId
                        }
                    }
                }),
                prisma.mediaFile.aggregate({
                    where: {
                        uploadedBy: userId
                    },
                    _sum: {
                        size: true
                    }
                })
            ]);
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                subscriptionType: user.subscriptionType,
                subscriptionExpiresAt: user.subscriptionExpiresAt,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                memorialPages: user.memorialPages,
                statistics: {
                    totalPages: user.memorialPages.length,
                    totalMemories: memoriesCount,
                    totalTributes: tributesCount,
                    storageUsed: storageUsed._sum.size || 0
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Get user details service error:', error);
            throw error;
        }
    },
    async suspendUser(userId, reason, adminId) {
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data: { isActive: false }
            });
            await prisma.adminAuditLog.create({
                data: {
                    adminUserId: adminId,
                    action: 'suspend_user',
                    resourceType: 'user',
                    resourceId: userId,
                    details: { reason },
                    ipAddress: '0.0.0.0'
                }
            });
            logger_1.logger.info(`User ${userId} suspended by admin ${adminId}`, { reason });
            return user;
        }
        catch (error) {
            logger_1.logger.error('Suspend user service error:', error);
            throw error;
        }
    },
    async activateUser(userId, adminId) {
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data: { isActive: true }
            });
            await prisma.adminAuditLog.create({
                data: {
                    adminUserId: adminId,
                    action: 'activate_user',
                    resourceType: 'user',
                    resourceId: userId,
                    details: {},
                    ipAddress: '0.0.0.0'
                }
            });
            logger_1.logger.info(`User ${userId} activated by admin ${adminId}`);
            return user;
        }
        catch (error) {
            logger_1.logger.error('Activate user service error:', error);
            throw error;
        }
    },
    async updateUserSubscription(userId, subscriptionType, expiresAt, adminId) {
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionType,
                    subscriptionExpiresAt: expiresAt
                }
            });
            await prisma.adminAuditLog.create({
                data: {
                    adminUserId: adminId,
                    action: 'update_subscription',
                    resourceType: 'user',
                    resourceId: userId,
                    details: { subscriptionType, expiresAt },
                    ipAddress: '0.0.0.0'
                }
            });
            logger_1.logger.info(`User ${userId} subscription updated by admin ${adminId}`, { subscriptionType, expiresAt });
            return user;
        }
        catch (error) {
            logger_1.logger.error('Update user subscription service error:', error);
            throw error;
        }
    },
    async getUserActivity(userId, limit = 20) {
        try {
            const recentPages = await prisma.memorialPage.findMany({
                where: { ownerId: userId },
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fullName: true,
                    slug: true,
                    createdAt: true
                }
            });
            const recentMemories = await prisma.memory.findMany({
                where: {
                    memorialPage: {
                        ownerId: userId
                    }
                },
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    memorialPage: {
                        select: {
                            fullName: true,
                            slug: true
                        }
                    }
                }
            });
            const recentUploads = await prisma.mediaFile.findMany({
                where: { uploadedBy: userId },
                take: limit,
                orderBy: { uploadedAt: 'desc' },
                select: {
                    id: true,
                    originalName: true,
                    size: true,
                    mimeType: true,
                    uploadedAt: true
                }
            });
            return {
                recentPages,
                recentMemories,
                recentUploads
            };
        }
        catch (error) {
            logger_1.logger.error('Get user activity service error:', error);
            throw error;
        }
    },
    async getAllMemorialPages(filters, pagination) {
        try {
            const { page, limit } = pagination;
            const offset = (page - 1) * limit;
            const where = {};
            if (filters.search) {
                where.OR = [
                    { fullName: { contains: filters.search, mode: 'insensitive' } },
                    { owner: {
                            OR: [
                                { name: { contains: filters.search, mode: 'insensitive' } },
                                { email: { contains: filters.search, mode: 'insensitive' } }
                            ]
                        } }
                ];
            }
            if (filters.status) {
                if (filters.status === 'public') {
                    where.isPrivate = false;
                }
                else if (filters.status === 'private') {
                    where.isPrivate = true;
                }
            }
            if (filters.subscriptionType) {
                where.owner = {
                    ...where.owner,
                    subscriptionType: filters.subscriptionType
                };
            }
            if (filters.createdAfter || filters.createdBefore) {
                where.createdAt = {};
                if (filters.createdAfter) {
                    where.createdAt.gte = filters.createdAfter;
                }
                if (filters.createdBefore) {
                    where.createdAt.lte = filters.createdBefore;
                }
            }
            const [pages, total] = await Promise.all([
                prisma.memorialPage.findMany({
                    where,
                    skip: offset,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                subscriptionType: true
                            }
                        },
                        _count: {
                            select: {
                                memories: true,
                                tributes: true,
                                photoGallery: true,
                                videoGallery: true
                            }
                        }
                    }
                }),
                prisma.memorialPage.count({ where })
            ]);
            return {
                pages,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Get all memorial pages service error:', error);
            throw error;
        }
    },
    async getMemorialPageDetails(pageId) {
        try {
            const page = await prisma.memorialPage.findUnique({
                where: { id: pageId },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            subscriptionType: true,
                            subscriptionExpiresAt: true
                        }
                    },
                    memories: {
                        select: {
                            id: true,
                            title: true,
                            date: true,
                            createdAt: true
                        },
                        orderBy: { date: 'desc' }
                    },
                    tributes: {
                        select: {
                            id: true,
                            authorName: true,
                            text: true,
                            isApproved: true,
                            createdAt: true
                        },
                        orderBy: { createdAt: 'desc' }
                    },
                    photoGallery: {
                        select: {
                            id: true,
                            title: true,
                            createdAt: true,
                            mediaFile: {
                                select: {
                                    originalName: true,
                                    size: true,
                                    uploadedAt: true
                                }
                            }
                        }
                    },
                    videoGallery: {
                        select: {
                            id: true,
                            title: true,
                            createdAt: true,
                            mediaFile: {
                                select: {
                                    originalName: true,
                                    size: true,
                                    uploadedAt: true
                                }
                            }
                        }
                    },
                    burialLocation: true,
                    collaborators: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            });
            if (!page) {
                throw new Error('Memorial page not found');
            }
            return page;
        }
        catch (error) {
            logger_1.logger.error('Get memorial page details service error:', error);
            throw error;
        }
    },
    async deleteMemorialPage(pageId, reason, adminId) {
        try {
            const page = await prisma.memorialPage.findUnique({
                where: { id: pageId },
                select: { id: true, fullName: true, ownerId: true }
            });
            if (!page) {
                throw new Error('Memorial page not found');
            }
            await prisma.$transaction(async (tx) => {
                await tx.memory.deleteMany({
                    where: { memorialPageId: pageId }
                });
                await tx.tribute.deleteMany({
                    where: { memorialPageId: pageId }
                });
                await tx.collaborator.deleteMany({
                    where: { memorialPageId: pageId }
                });
                await tx.burialLocation.deleteMany({
                    where: { memorialPageId: pageId }
                });
                await tx.memorialPage.delete({
                    where: { id: pageId }
                });
                await tx.adminAuditLog.create({
                    data: {
                        adminUserId: adminId,
                        action: 'delete_memorial_page',
                        resourceType: 'memorial_page',
                        resourceId: pageId,
                        details: { reason, pageName: page.fullName, ownerId: page.ownerId },
                        ipAddress: '0.0.0.0'
                    }
                });
            });
            logger_1.logger.info(`Memorial page ${pageId} deleted by admin ${adminId}`, { reason });
        }
        catch (error) {
            logger_1.logger.error('Delete memorial page service error:', error);
            throw error;
        }
    }
};
//# sourceMappingURL=adminUserService.js.map